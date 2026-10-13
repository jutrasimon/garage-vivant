import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {previewCard} from '../dist/bandlive.mjs';
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1.5}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(world=>{
  localStorage.setItem('garage-vivant-v1',JSON.stringify(world));window.perfAudit={rects:0,previews:0,draws:0};
  const rect=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(...args){window.perfAudit.rects++;return rect.apply(this,args);};
  const clone=window.structuredClone;window.structuredClone=function(value,...args){if(value?.fans&&value?.phase)window.perfAudit.previews++;return clone(value,...args);};
  for(const type of [WebGLRenderingContext,WebGL2RenderingContext])for(const key of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=type.prototype[key];if(original)type.prototype[key]=function(...args){window.perfAudit.draws++;return original.apply(this,args);};}
 },preparedConcert({large:true,instruments:['keys','trumpet','drums']}).world);
 await page.goto(url);await page.locator('[data-bl-song]').first().click();await page.locator('.bl-render-ready').waitFor();await page.waitForTimeout(500);
 const reset=()=>page.evaluate(()=>Object.assign(window.perfAudit,{rects:0,previews:0,draws:0}));
 await reset();await page.waitForTimeout(1100);const idle=await page.evaluate(()=>window.perfAudit);assert(idle.draws>0,'The scene still animates');assert(idle.rects<60,'Idle dance does not reread character geometry on every frame');
 const game=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),id=game.hand.find(id=>game.cards.find(c=>c.id===id).kind==='note');assert(id);
 const card=await page.locator(`[data-bl-card="${id}"]`).boundingBox(),fan=await page.locator('[data-bl-fan="f0"]').boundingBox();
 await page.mouse.move(card.x+card.width/2,card.y+card.height/2);await page.mouse.down();await page.mouse.move(card.x+card.width/2,card.y+card.height/2+25,{steps:4});await page.mouse.move(fan.x+fan.width/2,fan.y+fan.height/2,{steps:6});await page.locator('.drag-card-feedback.has-target').waitFor();
 await reset();for(const dx of [-3,3,-2,2]){await page.mouse.move(fan.x+fan.width/2+dx,fan.y+fan.height/2);await page.waitForTimeout(200);}const drag=await page.evaluate(()=>window.perfAudit);assert.equal(drag.previews,0,'The same fan never triggers another cloned combat preview');assert(drag.rects<300,'A held drag does not repeatedly measure and rebuild the preview');
 const second=await page.locator('[data-bl-fan="f1"]').boundingBox();await page.mouse.move(second.x+second.width/2,second.y+second.height/2);assert((await page.evaluate(()=>window.perfAudit.previews))>0,'Changing targets recomputes the real preview');assert.equal(await page.locator('.drag-outcome-name').textContent(),game.fans[1].name);
 const expected=previewCard(game,id,'f1');assert(expected.ok);await page.mouse.up();await page.waitForFunction(()=>!document.querySelector('#bl-end').disabled);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),expected.game,'The optimized preview still matches the committed card');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);await reset();await page.waitForTimeout(600);assert.equal((await page.evaluate(()=>window.perfAudit)).draws,0,'Reduced motion stops idle GPU drawing');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);await reset();await page.waitForTimeout(300);assert((await page.evaluate(()=>window.perfAudit)).draws>0,'Animation resumes after reduced motion');
 await page.locator('[data-view="groups"]').click();await page.waitForTimeout(200);await reset();await page.waitForTimeout(600);assert.equal((await page.evaluate(()=>window.perfAudit)).draws,0,'The hidden scene stops drawing in other views');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({message:'Performance passed: cached geometry, one preview per target, correct card result and idle/offscreen GPU suspension.',idle,drag}));
}finally{await browser?.close();child.kill();}
