import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,restoreBandLive} from '../dist/bandlive.mjs';

const world=preparedConcert({instruments:['drums','guitar','percussion']}).world;
world.people.find(p=>p.instrument==='percussion').bandLiveDecks={percussion:['new2','note','note','special','special']};
beginBandLiveConcert(world);const game=world.performance.bandLive.game;
chooseSong(game,game.songs[0].id);game.tempo=4;
for(const fan of game.fans){fan.hp=fan.max=100;fan.intent='bored';}
Object.assign(game.fans[1],{hp:0,conquered:true});
const find=(instrument,kind)=>game.cards.find(c=>c.instrument===instrument&&c.kind===kind);
const note=find('drums','note'),pulse=find('drums','special'),mixed=find('percussion','new2');
game.hand=[note.id,pulse.id,mixed.id,find('guitar','special').id,find('guitar','note').id];game.deck=game.cards.filter(c=>!game.hand.includes(c.id)).map(c=>c.id);game.discard=[];restoreBandLive(game);
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try {
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 browser=await chromium.launch();await mkdir('test-results',{recursive:true});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(w=>{localStorage.setItem('garage-vivant-v1',JSON.stringify(w));window.aimPreviewCalls=0;const clone=window.structuredClone;window.structuredClone=function(value,...args){if(value?.fans&&value?.phase)window.aimPreviewCalls++;return clone(value,...args);};},world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),before=await saved();
 async function aim(id,target='f0'){
  const source=await page.locator(`[data-bl-card="${id}"]`).boundingBox(),fan=await page.locator(`[data-bl-fan="${target}"]`).boundingBox();
  const pointer={x:fan.x+fan.width/2,y:fan.y+fan.height/2};await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(source.x+source.width/2,source.y+source.height/2+25,{steps:3});await page.mouse.move(pointer.x,pointer.y,{steps:6});await page.locator('.drag-card-feedback.has-target').waitFor();
  const popup=await page.locator('.drag-card-feedback').boundingBox();assert(popup.x+popup.width<=fan.x||popup.x>=fan.x+fan.width||popup.y+popup.height<=fan.y||popup.y>=fan.y+fan.height,'The tooltip leaves its target visible');assert(Math.hypot(Math.max(popup.x-pointer.x,0,pointer.x-popup.x-popup.width),Math.max(popup.y-pointer.y,0,pointer.y-popup.y-popup.height))<150,'The effect tooltip stays beside the cursor');return {fan,pointer,popup};
 }
 async function cancel(){await page.mouse.move(8,8,{steps:4});await page.mouse.up();assert.deepEqual(await saved(),before,'Aiming and cancelling change no game state');assert.equal(await page.locator('.bl-aim.visible').count(),0);}
 async function cursorEndpoint(view,pointer){await view.waitForFunction(p=>{const r=document.querySelector('.bl-aim-ring.bl-aim-tempo')?.getBoundingClientRect();return r&&Math.abs(r.left+r.width/2-p.x)<1&&Math.abs(r.top+r.height/2-p.y)<1;},pointer,{timeout:1500});}
 for(const [width,height] of [[1440,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);const {pointer,popup}=await aim(pulse.id);assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').count(),1,'Tempo-only cards have a yellow arc');assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),0);
  await cursorEndpoint(page,pointer);assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').evaluate(el=>getComputedStyle(el).stroke),'rgb(255, 220, 114)');assert.equal(await page.locator('.is-tempo-only .drag-outcome-main').evaluate(el=>getComputedStyle(el).color),'rgb(255, 225, 141)');
  const zone=await page.locator('.bl-audience.bl-tempo-target').evaluate(el=>{const s=getComputedStyle(el),halo=getComputedStyle(el,'::before');return {outline:s.outlineStyle,shadow:s.boxShadow,background:s.backgroundColor,radius:halo.borderRadius,animation:halo.animationName,color:s.getPropertyValue('--bl-zone-color').trim()};});assert.equal(zone.outline,'none');assert.equal(zone.shadow,'none');assert.equal(zone.background,'rgba(0, 0, 0, 0)');assert.equal(zone.radius,'50%');assert.equal(zone.animation,'bl-zone-breathe');assert.equal(zone.color,'255 214 100','Tempo uses a golden ripple instead of a rectangular highlight');
  const previews=await page.evaluate(()=>window.aimPreviewCalls);await page.locator('.bl-aim-line.bl-aim-tempo').evaluate(el=>window.pointerArc=el);
  for(const dx of [-5,5,-3,3]){const p={x:pointer.x+dx,y:pointer.y};await page.mouse.move(p.x,p.y);await cursorEndpoint(page,p);const stable=await page.locator('.drag-card-feedback').boundingBox();assert(Math.abs(stable.x-popup.x)<20,'The tooltip keeps its side during small moves');}
  const movedPointer={x:pointer.x,y:pointer.y+12};await page.mouse.move(movedPointer.x,movedPointer.y);await cursorEndpoint(page,movedPointer);await page.waitForFunction(top=>Math.abs(document.querySelector('.drag-card-feedback').getBoundingClientRect().top-top-12)<1,popup.y,{timeout:1500});assert.equal(await page.evaluate(()=>window.aimPreviewCalls),previews,'Following the cursor never recalculates the combat preview');assert(await page.locator('.bl-aim-line.bl-aim-tempo').evaluate(el=>el===window.pointerArc),'Following the cursor reuses its existing SVG arc');
  await page.waitForTimeout(350);await page.screenshot({path:`test-results/bandlive-tempo-aim-${width}.png`});await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.bl-audience.bl-tempo-target').evaluate(el=>getComputedStyle(el,'::before').animationName),'none');await cancel();await page.emulateMedia({reducedMotion:'no-preference'});
 }
 await aim(note.id);assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),1,'Conquest keeps its pink arc');assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').count(),0);await cancel();
 const hybrid=await aim(mixed.id);await cursorEndpoint(page,hybrid.pointer);assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').count(),1);assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),1,'Mixed cards show both effects');assert.notEqual(await page.locator('.bl-aim-line.bl-aim-tempo').getAttribute('d'),await page.locator('.bl-aim-line:not(.bl-aim-tempo)').getAttribute('d'),'Mixed arcs stay visually distinct');await page.waitForTimeout(350);await page.screenshot({path:'test-results/bandlive-mixed-aim.png'});await cancel();
 await aim(note.id,'f1');assert(await page.locator('.bl-aim.invalid').count());assert(await page.locator('.drag-card-feedback.invalid').count());await cancel();
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});touch.on('pageerror',e=>errors.push(e.message));await touch.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await touch.goto(url);await touch.locator('.bl-render-ready').waitFor();await touch.locator(`[data-bl-card="${pulse.id}"]`).scrollIntoViewIfNeeded();
 const source=await touch.locator(`[data-bl-card="${pulse.id}"]`).boundingBox(),fan=await touch.locator('[data-bl-fan="f0"]').boundingBox(),finger={x:fan.x+fan.width/2,y:fan.y+fan.height/2};assert(finger.x>0&&finger.x<390&&finger.y<844,'The touch target is visible');const cdp=await touch.context().newCDPSession(touch);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+source.width/2,y:source.y+source.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[finger]});await cursorEndpoint(touch,finger);await touch.screenshot({path:'test-results/bandlive-tempo-aim-touch.png'});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:8,y:8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.deepEqual(await touch.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),before,'Cancelling a touch aim spends nothing');await touch.close();
 assert.deepEqual(errors,[]);console.log('Targeting passed: yellow tempo arc follows mouse/finger, cached SVG and preview, golden ripple without a rectangle, reduced motion, pink conquest and distinct mixed arcs, stable tooltip and cancellation without spending.');
}finally{await browser?.close();child.kill();}
