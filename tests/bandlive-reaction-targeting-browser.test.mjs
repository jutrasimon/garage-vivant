import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,previewCard,restoreBandLive} from '../dist/bandlive.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 browser=await chromium.launch();
 for(const scenario of [
  {reaction:'distracted'}, {reaction:'attentive'}, {reaction:'variety'},
  {reaction:'rhythm',kind:'special'}, {reaction:'following',instrument:'voice',kind:'special'},
  {reaction:'attentive',chain:true}, {reaction:'distracted',touch:true}, {reaction:'attentive',chain:true,touch:true}
 ]){
  const world=preparedConcert({legacyBandLive:true,instruments:['drums','guitar','voice']}).world;beginBandLiveConcert(world);
  const game=world.performance.bandLive.game;chooseSong(game,game.songs[0].id);
  for(const fan of game.fans)Object.assign(fan,{hp:100,max:100,intent:'bored',reactionUsed:false,conquered:false});
  const fan=game.fans[0],card=game.cards.find(c=>c.instrument===(scenario.instrument||'drums')&&c.kind===(scenario.kind||'note'));
  fan.intent=scenario.reaction;
  if(scenario.reaction==='variety')fan.reactionActors=[game.actors.find(a=>a.id!==card.actorId).id];
  if(scenario.reaction==='following'||scenario.chain)Object.assign(game.fans[1],{hp:1,max:16,effect:'shock',effectValue:3});
  if(scenario.chain)Object.assign(fan,{hp:1,max:16,effect:'shock',effectValue:3});
  game.hand=[card.id];game.discard=[];game.deck=game.cards.filter(c=>c.id!==card.id).map(c=>c.id);restoreBandLive(game);
  const expected=previewCard(game,card.id,fan.id),powers=expected.effects.filter(e=>e.type==='conquest'),power=powers.find(e=>e.fanId===fan.id);
  assert(expected.ok);assert(expected.effects.some(e=>e.type==='reaction'&&e.fanId===fan.id),`${scenario.reaction} must trigger in this fixture`);
  assert.equal(!!power,!!scenario.chain);if(scenario.chain)assert.equal(powers.length,2);
  const page=await browser.newPage({viewport:scenario.touch?{width:390,height:844}:{width:1440,height:900},hasTouch:!!scenario.touch,isMobile:!!scenario.touch}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(w=>{localStorage.setItem('garage-vivant-v1',JSON.stringify(w));window.reactionPreviewCalls=0;const clone=window.structuredClone;window.structuredClone=function(value,...args){if(value?.fans&&value?.phase)window.reactionPreviewCalls++;return clone(value,...args);};},world);
  await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),before=await saved(),sourceNode=page.locator(`[data-bl-card="${card.id}"]`),targetNode=page.locator(`[data-bl-fan="${fan.id}"]`);
  const cdp=scenario.touch?await page.context().newCDPSession(page):null;
  async function aim(){
   await sourceNode.scrollIntoViewIfNeeded();const source=await sourceNode.boundingBox(),target=await targetNode.boundingBox(),point={x:target.x+target.width/2,y:target.y+target.height/2};
   if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+source.width/2,y:source.y+source.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});}
   else{await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(point.x,point.y,{steps:6});}
   await page.locator('.drag-card-feedback.has-target:not(.invalid)').waitFor({timeout:2500});return point;
  }
  async function checkOutcome(container,selected=false){
   assert((await container.locator(selected?'.outcome-name':'.drag-outcome-name').textContent()).includes(fan.name));
   assert((await container.locator(selected?'.outcome-trigger':'.drag-trigger').textContent()).includes('Réaction déclenchée'));
   const banner=container.locator('.bl-conquest-preview');assert.equal(await banner.isVisible(),!!power,'Only a real conquest power gets the conquest announcement');
   if(power){assert.equal(await banner.locator('.bl-conquest-preview-name').textContent(),power.name);assert((await banner.locator('.bl-conquest-preview-chain').textContent()).includes('2'),'The chain counts conquest powers, never reactions');}
  }
  const point=await aim();await checkOutcome(page.locator('.drag-card-feedback'));assert.equal(await page.locator('.bl-aim.visible:not(.invalid)').count(),1,'The valid aim arc survives reaction previews');assert.deepEqual(await saved(),before);
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:8,y:8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{
   const calls=await page.evaluate(()=>window.reactionPreviewCalls);for(const dx of [-3,3,-2,2])await page.mouse.move(point.x+dx,point.y);assert.equal(await page.evaluate(()=>window.reactionPreviewCalls),calls,'Small moves reuse the reaction preview');
   await page.mouse.move(8,8);await page.mouse.up();await sourceNode.click();await targetNode.hover({force:true});await checkOutcome(page.locator('#bl-card-preview'),true);await page.keyboard.press('Escape');
  }
  assert.deepEqual(await saved(),before,'Cancelling or inspecting a reaction spends nothing');
  await aim();if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();
  await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled&&JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game.played===1);
  assert.deepEqual(await saved(),expected.game,'Releasing commits exactly the valid preview, including its reactions and conquest chain');assert.deepEqual(errors,[],`${scenario.reaction}: no preview exception`);await page.close();
 }
 console.log('Reaction targeting passed: distracted, attentive, variety, rhythm, following; reaction-only and two-power chains; mouse/touch, selected-card inspection, cached preview, cancellation and exact committed state.');
}finally{await browser?.close();child.kill();}
