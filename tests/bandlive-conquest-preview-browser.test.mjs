import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,previewCard,restoreBandLive} from '../dist/bandlive.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 browser=await chromium.launch();await mkdir('test-results',{recursive:true});
 for(const scenario of [{effect:'shock',width:1440,height:900,chain:true},{effect:'spotlight',width:1440,height:900},{effect:'chorus',width:1440,height:900},{effect:'chorus',width:1024,height:768,reduced:true},{effect:'chorus',width:390,height:844,touch:true}]){
  const world=preparedConcert({instruments:['guitar','drums','keys']}).world;beginBandLiveConcert(world);const game=world.performance.bandLive.game;chooseSong(game,game.songs[0].id);
  for(const fan of game.fans)Object.assign(fan,{hp:100,max:100,intent:'bored',favorite:'Pop',reactionUsed:false,conquered:false});
  Object.assign(game.fans[0],{hp:1,max:16,effect:scenario.effect,effectValue:scenario.effect==='chorus'?2:3});
  if(scenario.chain)Object.assign(game.fans[1],{hp:3,effect:'shock',effectValue:3});
  Object.assign(game.fans[7],{hp:0,conquered:true});const id=game.cards.find(c=>c.kind==='note').id;game.hand=[id];game.discard=[];game.deck=game.cards.filter(c=>c.id!==id).map(c=>c.id);restoreBandLive(game);
  const expected=previewCard(game,id,'f0'),effect=expected.effects.find(e=>e.fanId==='f0'),page=await browser.newPage({viewport:{width:scenario.width,height:scenario.height},hasTouch:!!scenario.touch,isMobile:!!scenario.touch}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(w=>{localStorage.setItem('garage-vivant-v1',JSON.stringify(w));window.previewCalls=0;const clone=window.structuredClone;window.structuredClone=function(value,...args){if(value?.fans&&value?.phase)window.previewCalls++;return clone(value,...args);};},world);if(scenario.reduced)await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  const card=page.locator(`[data-bl-card="${id}"]`);await card.scrollIntoViewIfNeeded();const source=await card.boundingBox(),fan=await page.locator('[data-bl-fan="f0"]').boundingBox(),pointer={x:fan.x+fan.width/2,y:fan.y+fan.height/2};let cdp;
  if(scenario.touch){cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+source.width/2,y:source.y+source.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[pointer]});}
  else{await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(pointer.x,pointer.y,{steps:6});}
  const ready=page.locator('.drag-card-feedback .bl-conquest-preview');await ready.waitFor();
  assert.equal(await ready.locator('.bl-conquest-preview-name').textContent(),effect.name);assert((await ready.locator('.bl-conquest-preview-kicker').textContent()).includes('VA SE DÉCLENCHER'));for(const target of effect.targets)assert((await ready.locator('.bl-conquest-preview-targets').textContent()).includes(game.fans.find(f=>f.id===target).name));
  assert.equal(await ready.locator('.bl-conquest-preview-chain').isVisible(),expected.effects.length>1);assert(await page.locator('.drag-conquest-rule').isHidden(),'The active effect replaces the quiet rule instead of repeating it');
  const visual=await ready.evaluate(el=>({box:el.getBoundingClientRect().toJSON(),nameFont:parseFloat(getComputedStyle(el.querySelector('strong')).fontSize),ruleFont:parseFloat(getComputedStyle(document.querySelector('.drag-reaction')).fontSize),reactionTop:document.querySelector('.drag-reaction').getBoundingClientRect().top,shadow:getComputedStyle(el).boxShadow,animations:el.getAnimations().length}));
  assert(visual.nameFont>=17&&visual.nameFont>visual.ruleFont,'The imminent effect is the main text');assert(visual.box.bottom<=visual.reactionTop,'The conquest effect precedes the ordinary reaction');assert.notEqual(visual.shadow,'none');assert(visual.box.top>=0&&visual.box.bottom<=scenario.height&&visual.box.left>=0&&visual.box.right<=scenario.width,'The entire highlighted effect fits on screen');if(scenario.reduced)assert.equal(visual.animations,0);
  const popup=await page.locator('.drag-card-feedback').boundingBox();await page.screenshot({path:`test-results/conquest-preview-${scenario.effect}-${scenario.width}-placement.png`});assert(popup.x+popup.width<=fan.x||popup.x>=fan.x+fan.width||popup.y+popup.height<=fan.y||popup.y>=fan.y+fan.height,`The highlighted preview keeps its spectator visible (${scenario.width}: ${JSON.stringify({popup,fan})})`);
  await page.waitForTimeout(450);await page.screenshot({path:`test-results/conquest-preview-${scenario.effect}-${scenario.width}.png`});
  if(scenario.touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:8,y:8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{
   const calls=await page.evaluate(()=>window.previewCalls);for(const dx of [-3,3,-2,2])await page.mouse.move(pointer.x+dx,pointer.y);assert.equal(await page.evaluate(()=>window.previewCalls),calls);assert.equal(await ready.evaluate(el=>el.getAnimations().length),0,'Small moves never restart the entrance effect');
   for(const target of ['f6','f7']){const r=await page.locator(`[data-bl-fan="${target}"]`).boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);assert(await ready.isHidden(),'No imminent effect on a surviving or already conquered spectator');assert(await page.locator('.drag-conquest-rule').isVisible(),'The ordinary effect rule stays available');}
   await page.mouse.move(8,8);await page.mouse.up();await card.click();await page.locator('[data-bl-fan="f0"]').hover({force:true});const keyboard=page.locator('#bl-card-preview .bl-conquest-preview');await keyboard.waitFor();assert.equal(await keyboard.locator('.bl-conquest-preview-name').textContent(),effect.name);const r=await keyboard.boundingBox();assert(r.y+r.height<=scenario.height,'The selected-card preview keeps its imminent effect on screen');await page.keyboard.press('Escape');
  }
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),game,'Inspecting and cancelling consumes nothing');assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Conquest preview passed: three powers, actual targets and chains, no false triggers, clear hierarchy, mouse/touch and selected-card previews, reduced motion, cached simulation and cancellation without spending.');
}finally{await browser?.close();child.kill();}
