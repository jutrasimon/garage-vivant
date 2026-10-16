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
 for(const width of [1440,390])for(const scenario of [
  {name:'rhythm-pending',hp:8,intent:'rhythm',remaining:2},
  {name:'variety-pending',hp:7,intent:'variety',remaining:1},
  {name:'direct-conquest',hp:6,intent:'variety',remaining:0},
  {name:'variety-conquest',hp:7,intent:'variety',otherActor:true,remaining:0},
  {name:'point-conquest',hp:6,intent:'variety',point:true,remaining:0},
  ...(width>500?[{name:'collision-conquest',hp:8,intent:'following',collision:true,remaining:0}]:[]),
  ...(width>500?[{name:'chain-circles',hp:8,intent:'bored',collision:true,chain:true,remaining:0}]:[]),
  ...(width>500?[{name:'moving-zone',hp:16,intent:'bored',shift:true,remaining:10}]:[]),
 ]){
  const world=preparedConcert({instruments:['drums','keys','voice'],large:!!scenario.chain}).world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);
  const note=game.cards.find(c=>c.kind==='note'),favorite=game.audienceRules.styles.find(s=>s!==game.songs.find(s=>s.id===game.songId).style);game.hand=[note.id];game.discard=[];game.deck=game.cards.filter(c=>c.id!==note.id).map(c=>c.id);game.physics.hitStrength=scenario.collision?1.5:0;
  if(scenario.point||scenario.shift){const recipe=duplicateCard(game.catalog,'drums:note');Object.assign(recipe,scenario.shift?{target:'radius',radius:1,effects:[{...newEffect('push'),strength:1.5},{...newEffect('power'),impactStrength:0}]}:{target:'point',radius:1.2,coreRadius:.5});note.kind=recipe.id;note.definition=compileCard(recipe);game.actors.find(a=>a.id===note.actorId).bandLiveDeck[Number(note.id.split(':').at(-1))]=recipe.id;if(scenario.shift)game.physics.collisionPower=0;}
  for(const [i,f] of game.fans.entries())Object.assign(f,{hp:100,max:100,conquered:false,favorite,intent:'bored',effect:'spotlight',effectValue:1,reactionUsed:false,reactionActors:[],reactionTempo:0,position:i===0?{x:scenario.collision?400:260,y:130}:i===1?{x:480,y:220}:{x:740+(i%3)*100,y:70+(Math.floor((i-2)/3)%3)*90}});
  Object.assign(game.fans[0],{hp:scenario.hp,max:16,intent:scenario.intent,effect:'shock',effectValue:4,reactionActors:scenario.otherActor?[game.actors.find(a=>a.id!==note.actorId).id]:[]});if(scenario.collision)game.fans[1].hp=1;
  if(scenario.chain){game.fans[0].favorite=game.songs.find(s=>s.id===game.songId).style;game.fans[1].effect='shock';game.fans[1].effectValue=4;game.initialFanHp[0]=Math.min(16,game.initialFanHp[0]);}restoreBandLive(game);
  const expected=previewCard(game,note.id,'f0',scenario.point?{point:game.fans[0].position}:{}),ready=scenario.remaining===0;assert(expected.ok);assert.equal(expected.game.fans[0].hp,scenario.remaining,scenario.name);assert.equal(expected.effects.some(e=>e.type==='conquest'&&e.fanId==='f0'),ready);if(scenario.collision)assert(expected.event.hits.some(h=>h.kind==='collision'));
  page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});const errors=[];page.on('pageerror',e=>errors.push(e.message));if(width<500)await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(w=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(w));},world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  async function outsideRadius(panel){for(const ellipse of await page.locator('.bl-radius-outer,.bl-radius-chain').all()){const r=await ellipse.boundingBox(),p=await panel.boundingBox(),cx=r.x+r.width/2,cy=r.y+r.height/2,x=Math.max(p.x,Math.min(cx,p.x+p.width)),y=Math.max(p.y,Math.min(cy,p.y+p.height));assert(((x-cx)/(r.width/2))**2+((y-cy)/(r.height/2))**2>=1,`The forecast stays outside the complete radius (${scenario.name}, ${width}): ${JSON.stringify({p,r})}`);assert(p.x>=0&&p.y>=0&&p.x+p.width<=width&&p.y+p.height<=900);}}
  if(width>500)await page.locator('[data-bl-fan="f0"]').hover();else await page.locator('[data-bl-fan="f0"]').focus();await page.locator('#bandlive-tooltip').waitFor();await outsideRadius(page.locator('#bandlive-tooltip'));await page.mouse.move(8,8);
  const card=page.locator(`[data-bl-card="${note.id}"]`),fan=page.locator('[data-bl-fan="f0"]');await card.scrollIntoViewIfNeeded();const source=await card.boundingBox(),target=await fan.boundingBox(),point={x:target.x+target.width/2,y:target.y+target.height/2};assert(point.x>0&&point.x<width,'The target is visible while dragging');let cdp;
  if(width<500){cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+source.width/2,y:source.y+source.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});}
  else{await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(point.x,point.y,{steps:6});}
  const layer=page.locator(`.bl-radius-layer[data-state="${scenario.point||scenario.shift?'card':ready?'triggered':'potential'}"]`);await layer.waitFor();const popup=page.locator('.drag-card-feedback');
  await outsideRadius(popup);
  const appearance=await popup.evaluate(el=>{const s=getComputedStyle(el.querySelector('.drag-feedback-surface')),main=getComputedStyle(el.querySelector('.drag-outcome-main')),gain=getComputedStyle(el.querySelector('.drag-gain'));return {background:s.backgroundImage,border:s.borderRadius,font:main.fontSize,color:main.color,gain:gain.backgroundImage};});
  assert(appearance.background.includes('rgb(50, 53, 79)')&&appearance.background.includes('rgb(32, 42, 61)'),'The forecast retains the navy surface');assert.equal(appearance.border,'19px');assert.equal(appearance.font,'13px');assert(appearance.gain.includes('rgb(255, 202, 223)'),'The heart gain retains its pink pill');
  if(scenario.chain){
   for(const area of expected.areas.filter(a=>a.kind==='conquest'))assert.equal(await page.locator(`[data-bl-radius-source="${area.sourceId}"]`).count(),1,'Every triggered power has its own circle');
   assert.equal(await page.locator('[data-bl-fan="f1"]').getAttribute('data-bl-impact-kind'),'collision');assert((await page.locator('[data-bl-fan="f1"] .bl-impact-kind').textContent()).includes('Choc'));
   assert.equal(await page.locator('[data-bl-fan="f9"]').getAttribute('data-bl-impact-kind'),'chain');assert((await page.locator('[data-bl-fan="f9"] .bl-impact-kind').textContent()).includes('En chaîne'));
   assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),1,'Collision recipients never masquerade as direct shots');assert(await page.locator('[data-bl-future-target="f1"]').count(),'Moved bodies have a forecast marker at their impact position');
  }
  if(scenario.shift){assert(await layer.locator('.bl-radius-chain').count(),'A later radius follows the displaced target at its exact resolved center');assert(await layer.locator('[data-bl-future-target="f0"]').count());assert((await layer.textContent()).includes('Après déplacement'));}
  assert.equal(await popup.locator('.bl-conquest-preview').isVisible(),ready);assert.equal(await popup.locator('.bl-conquest-pending').isVisible(),!ready);
  const style=await layer.locator('.bl-radius-outer').evaluate(el=>{const s=getComputedStyle(el);return {dash:s.strokeDasharray,fill:s.fill,glow:s.filter,animation:s.animationName};});
  if(ready&&!scenario.point){assert.equal(style.dash,'none','A triggered power has a solid circle');assert.notEqual(style.glow,'none');assert((await layer.textContent()).includes('CONQUÊTE !'));if(width<500)assert.equal(style.animation,'none');}
  else if(scenario.point||scenario.shift){if(scenario.point){assert(await layer.locator('.bl-radius-core').isVisible());assert(await layer.locator('.bl-radius-chain').isVisible(),'The panel also protects the additional conquest radius');}}
  else{assert.notEqual(style.dash,'none');assert(style.fill==='transparent'||style.fill==='rgba(0, 0, 0, 0)');assert((await popup.locator('.bl-conquest-pending').textContent()).includes('encore '+scenario.remaining+' ♥'));assert((await layer.textContent()).includes('encore '+scenario.remaining+' ♥'));}
  const remaining=16-scenario.remaining;assert((await popup.locator('.drag-outcome-main').textContent()).includes('→ '+remaining+'/16'),'The meter and activation state use the same complete simulation');await page.waitForTimeout(350);await page.screenshot({path:`test-results/conquest-radius-${scenario.name}-${width}.png`});
  if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else{await page.keyboard.press('Escape');await page.mouse.up();}
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),game,'Inspecting or cancelling spends no resources');
  {
   if(cdp){await card.tap();await fan.focus();}else{await card.click();await fan.hover();}await layer.waitFor();const selected=page.locator('#bl-card-preview');assert.equal(await selected.locator('.bl-conquest-pending').isVisible(),!ready);await outsideRadius(selected);
   assert(await selected.locator('.preview-face').isHidden(),'The effect forecast never falls back to a cream card and a separate result box');
   assert.deepEqual(await selected.evaluate(el=>{const s=getComputedStyle(el.querySelector('.drag-feedback-surface')),main=getComputedStyle(el.querySelector('.drag-outcome-main')),gain=getComputedStyle(el.querySelector('.drag-gain'));return {background:s.backgroundImage,border:s.borderRadius,font:main.fontSize,color:main.color,gain:gain.backgroundImage};}),appearance,'Click and drag reuse the exact same effect presentation');
   await page.waitForTimeout(350);await page.screenshot({path:`test-results/conquest-radius-selected-${scenario.name}-${width}.png`});
   // A nested mouseover used to overwrite the cached forecast with the ordinary fan tooltip.
   await fan.locator('.bl-cube').dispatchEvent('mouseover',{bubbles:true});assert(await layer.isVisible(),'The activation state survives nested hover events on the same target');assert(await page.locator('#bandlive-tooltip').isHidden());await page.keyboard.press('Escape');
  }
  if(cdp){await card.tap();await fan.tap();}else{await card.click();await fan.click();}
  await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled&&JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game.played===1);
  const actual=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);
  // A click also records its floor coordinate; single-target rules still anchor on the fan.
  const clickPoint=actual.events.findLast(e=>e.type==='card').point;if(clickPoint)expected.game.events.findLast(e=>e.type==='card').point=clickPoint;
  assert.deepEqual(actual,expected.game,'The announced state matches the actual card, reaction and collisions');assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Conquest radius passed: 14/16 and 15/16 remain inactive, lethal hits and variety/collision reactions light up the power, distinct circles and remaining hearts, cached nested hover, mouse/touch, reduced motion and exact committed states.');
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:'test-results/conquest-radius-failure.png'});throw error;}finally{await browser?.close();child.kill();}
