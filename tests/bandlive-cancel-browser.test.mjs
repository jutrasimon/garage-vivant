import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,previewCard,restoreBandLive} from '../dist/bandlive.mjs';
import {duplicateCard,compileCard,newEffect} from '../dist/bandlive-catalog.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const width of [1440,390]){
  const world=preparedConcert({instruments:['drums','guitar','voice']}).world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);game.physics.hitStrength=0;
  const note=game.cards.find(c=>c.instrument==='voice'&&c.kind==='note'),ground=game.cards.find(c=>c.instrument==='drums'&&c.kind==='note'),pulse=game.cards.find(c=>c.instrument==='drums'&&c.kind==='special'),duo=game.cards.find(c=>c.instrument==='guitar'&&c.kind==='note');
  for(const [card,target,type] of [[ground,'point','vortex'],[duo,'duo',null]]){const recipe=duplicateCard(game.catalog,card.instrument+':note');Object.assign(recipe,{target,effects:[newEffect('power'),...(type?[newEffect(type)]:[])]});card.kind=recipe.id;card.definition=compileCard(recipe);game.actors.find(a=>a.id===card.actorId).bandLiveDeck[Number(card.id.split(':').at(-1))]=recipe.id;}
  game.hand=[note.id,ground.id,pulse.id,duo.id];game.discard=[];game.deck=game.cards.filter(c=>!game.hand.includes(c.id)).map(c=>c.id);
  for(const fan of game.fans)Object.assign(fan,{hp:100,max:100,intent:'bored',conquered:false});game.fans[0].position={x:880,y:130};Object.assign(game.fans[1],{hp:0,conquered:true,position:{x:930,y:230}});restoreBandLive(game);
  page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.addInitScript(()=>{window.cancelGestureTrace=[];for(const type of ['pointerdown','pointerup','pointercancel','click','keydown'])document.addEventListener(type,e=>{window.cancelGestureTrace.push({type,detail:e.detail,pointer:e.pointerId,kind:e.pointerType,key:e.key,button:e.target.closest?.('button')?.outerHTML.slice(0,170),selected:document.querySelector('.bl-selected')?.dataset.blCard});},true);});await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),card=id=>page.locator(`[data-bl-card="${id}"]`),fan=id=>page.locator(`[data-bl-fan="${id}"]`);
  const tap=async locator=>{
   if(width>=500)return locator.click();
   const id=await locator.getAttribute('data-bl-card');if(!id)return locator.tap();await locator.scrollIntoViewIfNeeded();
   // A fanned hand exposes each card's edge; its center can belong to the next card.
   const point=await locator.evaluate(el=>{const r=el.getBoundingClientRect();for(const y of [.15,.3,.5,.7,.85])for(const x of [.15,.3,.5,.7,.85]){const p={x:r.left+r.width*x,y:r.top+r.height*y};if(p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight&&document.elementFromPoint(p.x,p.y)?.closest('[data-bl-card]')===el)return p;}return null;});assert(point,'The intended card has a visible touchable edge');await page.touchscreen.tap(point.x,point.y);
  };
  async function clean(label){
   await page.waitForTimeout(180);
   assert.equal(await page.locator('.bl-selected,[data-bl-card][aria-pressed="true"]').count(),0,label+': no armed card');assert(await page.locator('#bl-card-preview').isHidden(),label+': no card popup');assert(await page.locator('#bandlive-tooltip').isHidden(),label+': no character popup');assert.equal(await page.locator('.bl-ghost,.bl-aim.visible,.bl-radius-layer,.bl-forecast,.bl-drop-active,.bl-drop-valid,.bl-impact-kind,.bl-card-choice').count(),0,label+': no leftover aim or pending choice');assert(await page.locator('#bl-put-back').isHidden());assert.deepEqual(await saved(),game,label+': no card, energy, tempo, crowd or history changed');
  }
  async function select(id){await tap(card(id));assert.equal(await card(id).getAttribute('aria-pressed'),'true',`Selection ${id} at ${width}`);assert(await page.locator('#bl-put-back').isVisible());}
  async function beginDrag(id){await card(id).scrollIntoViewIfNeeded();const r=await card(id).boundingBox(),start={x:r.x+r.width/2,y:r.y+r.height/2};if(width<500){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});return {start,cdp};}await page.mouse.move(start.x,start.y);await page.mouse.down();return {start};}
  async function move(gesture,point){if(gesture.cdp)await gesture.cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});else await page.mouse.move(point.x,point.y,{steps:5});}
  async function release(gesture){if(gesture.cdp){await gesture.cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await gesture.cdp.detach();}else await page.mouse.up();}
  const center=async locator=>{const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
  await select(note.id);await tap(page.locator('#bl-put-back'));await clean('Visible return command');
  await select(note.id);await tap(card(note.id));await clean('Second tap on the same card');
  await select(note.id);await page.keyboard.press('Escape');await clean('Escape cancels selection');
  await page.keyboard.press('Enter');assert.equal(await card(note.id).getAttribute('aria-pressed'),'true','Keyboard can rearm after cancellation');await page.keyboard.press('Escape');await clean('Keyboard cancellation');
  if(width>500){await select(note.id);await fan('f0').hover();await fan('f0').click({button:'right'});await clean('Right click cancels selection');}
  for(const id of [note.id,pulse.id,ground.id]){
   await select(note.id);const gesture=await beginDrag(id);await move(gesture,await center(fan('f0')));await page.locator('.bl-ghost').waitFor();await move(gesture,gesture.start);await release(gesture);await clean('Return '+id+' to the hand');
  }
  {
   const gesture=await beginDrag(note.id);await move(gesture,await center(fan('f0')));await move(gesture,await center(fan('f1')));await release(gesture);await clean('Drop on an invalid conquered target');
  }
  {
   const gesture=await beginDrag(ground.id);await move(gesture,await center(fan('f0')));await move(gesture,{x:8,y:8});await release(gesture);await clean('Drop outside the playing area');
  }
  {
   const gesture=await beginDrag(note.id);await move(gesture,await center(fan('f0')));
   if(gesture.cdp){await gesture.cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await gesture.cdp.detach();}else{await page.keyboard.press('Escape');await page.mouse.up();}
   await clean('Interrupted drag');
  }
  if(width<500){
   const gesture=await beginDrag(note.id),point=await center(fan('f0'));await move(gesture,point);await page.locator('.bl-ghost').waitFor();
   assert(await page.evaluate(()=>{const root=document.querySelector('#bandlive-view'),pointer=window.cancelGestureTrace.findLast(e=>e.type==='pointerdown').pointer;if(!root.hasPointerCapture(pointer))return false;root.releasePointerCapture(pointer);return true;}),'The drag owns the pointer before interruption');await move(gesture,{x:point.x+1,y:point.y});await release(gesture);await clean('Real loss of drag capture');
  }
  await select(duo.id);await tap(fan('f0'));assert(await page.locator('.bl-card-choice').isVisible());await tap(page.locator('#bl-put-back'));await clean('Cancel between two targets');
  await select(duo.id);await tap(fan('f0'));await tap(fan('f1'));await clean('Invalid second target');
  await select(note.id);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await clean('Window blur');
  {const gesture=await beginDrag(note.id);await move(gesture,await center(fan('f0')));await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await release(gesture);await clean('Blur interrupts a held drag');}
  await select(note.id);await tap(card(ground.id));assert.equal(await card(note.id).getAttribute('aria-pressed'),'false');assert.equal(await card(ground.id).getAttribute('aria-pressed'),'true');await tap(page.locator('#bl-put-back'));await clean('Switching selected cards');
  await select(note.id);await tap(page.locator('#bl-cards').first());await page.locator('.bl-card-editor').waitFor();await tap(page.locator('[data-ce-action="close"]'));await clean('Editor closes the previous selection');
  if(width>500){
   const stage=await page.locator('.bl-musicians').boundingBox();await select(ground.id);await page.mouse.click(stage.x+10,stage.y+15);await clean('Click on empty stage');
   await page.evaluate(()=>{window.popupOverlaps=[];new MutationObserver(()=>{const card=document.querySelector('#bl-card-preview'),person=document.querySelector('#bandlive-tooltip');if(!card.hidden&&!person.hidden)window.popupOverlaps.push([card.textContent,person.textContent]);}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});});
   for(let i=0;i<3;i++){await card(note.id).hover();await page.waitForTimeout(35);await page.locator('[data-bl-actor]').last().hover();await page.locator('#bandlive-tooltip').waitFor();await page.waitForTimeout(150);assert(await page.locator('#bl-card-preview').isHidden(),'Leaving a card cancels its delayed popup');}
   await card(note.id).hover();await page.locator('#bl-card-preview').waitFor();assert(await page.locator('#bandlive-tooltip').isHidden(),'Showing a card closes the character profile');assert.deepEqual(await page.evaluate(()=>window.popupOverlaps),[],'Card and character popups never overlap');
  }
  await select(note.id);await tap(page.locator('#bl-put-back'));await clean('Ready again after repeated cancellation');await page.screenshot({path:`test-results/bandlive-cancel-${width}.png`});
  const expected=previewCard(game,note.id,'f0'),finalDrag=await beginDrag(note.id);await move(finalDrag,await center(fan('f0')));await page.locator('.bl-ghost:not(.invalid)').waitFor();await release(finalDrag);await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled&&JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game.played===1);assert.deepEqual(await saved(),expected.game,'A fresh intentional drag still commits its exact preview');assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Cancellation passed: visible return command, same-card click/tap, Escape/right click, mouse/touch return to hand and outside the board, invalid targets, interrupted drags, two-target cancellation, blur, delayed-popup races and exact next play.');
}catch(error){if(page&&!page.isClosed()){await page.screenshot({path:'test-results/bandlive-cancel-failure.png'});console.log(JSON.stringify(await page.evaluate(()=>window.cancelGestureTrace.slice(-24)),null,2));}throw error;}finally{await browser?.close();child.kill();}
