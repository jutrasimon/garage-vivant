import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,previewCard,restoreBandLive} from '../dist/bandlive.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const width of [1440,390])for(const scenario of [
  {name:'rhythm-pending',hp:8,intent:'rhythm',remaining:2},
  {name:'variety-pending',hp:7,intent:'variety',remaining:1},
  {name:'direct-conquest',hp:6,intent:'variety',remaining:0},
  {name:'variety-conquest',hp:7,intent:'variety',otherActor:true,remaining:0},
  ...(width>500?[{name:'collision-conquest',hp:8,intent:'following',collision:true,remaining:0}]:[]),
 ]){
  const world=preparedConcert({instruments:['drums','keys','voice']}).world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);
  const note=game.cards.find(c=>c.kind==='note'),favorite=game.audienceRules.styles.find(s=>s!==game.songs.find(s=>s.id===game.songId).style);game.hand=[note.id];game.discard=[];game.deck=game.cards.filter(c=>c.id!==note.id).map(c=>c.id);game.physics.hitStrength=scenario.collision?1.5:0;
  for(const [i,f] of game.fans.entries())Object.assign(f,{hp:100,max:100,conquered:false,favorite,intent:'bored',effect:'spotlight',effectValue:1,reactionUsed:false,reactionActors:[],reactionTempo:0,position:i===0?{x:scenario.collision?400:260,y:130}:i===1?{x:480,y:220}:{x:740+(i%3)*100,y:70+(Math.floor((i-2)/3)%3)*90}});
  Object.assign(game.fans[0],{hp:scenario.hp,max:16,intent:scenario.intent,effect:'shock',effectValue:4,reactionActors:scenario.otherActor?[game.actors.find(a=>a.id!==note.actorId).id]:[]});if(scenario.collision)game.fans[1].hp=1;restoreBandLive(game);
  const expected=previewCard(game,note.id,'f0'),ready=scenario.remaining===0;assert(expected.ok);assert.equal(expected.game.fans[0].hp,scenario.remaining,scenario.name);assert.equal(expected.effects.some(e=>e.type==='conquest'&&e.fanId==='f0'),ready);if(scenario.collision)assert(expected.event.hits.some(h=>h.kind==='collision'));
  page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});const errors=[];page.on('pageerror',e=>errors.push(e.message));if(width<500)await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(w=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(w));},world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  const card=page.locator(`[data-bl-card="${note.id}"]`),fan=page.locator('[data-bl-fan="f0"]');await card.scrollIntoViewIfNeeded();const source=await card.boundingBox(),target=await fan.boundingBox(),point={x:target.x+target.width/2,y:target.y+target.height/2};assert(point.x>0&&point.x<width,'The target is visible while dragging');let cdp;
  if(width<500){cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+source.width/2,y:source.y+source.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});}
  else{await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(point.x,point.y,{steps:6});}
  const layer=page.locator(`.bl-radius-layer[data-state="${ready?'triggered':'potential'}"]`);await layer.waitFor();const popup=page.locator('.drag-card-feedback');
  assert.equal(await popup.locator('.bl-conquest-preview').isVisible(),ready);assert.equal(await popup.locator('.bl-conquest-pending').isVisible(),!ready);
  const style=await layer.locator('.bl-radius-outer').evaluate(el=>{const s=getComputedStyle(el);return {dash:s.strokeDasharray,fill:s.fill,glow:s.filter,animation:s.animationName};});
  if(ready){assert.equal(style.dash,'none','A triggered power has a solid circle');assert.notEqual(style.glow,'none');assert((await layer.textContent()).includes('CONQUÊTE !'));if(width<500)assert.equal(style.animation,'none');}
  else{assert.notEqual(style.dash,'none');assert(style.fill==='transparent'||style.fill==='rgba(0, 0, 0, 0)');assert((await popup.locator('.bl-conquest-pending').textContent()).includes('encore '+scenario.remaining+' ♥'));assert((await layer.textContent()).includes('encore '+scenario.remaining+' ♥'));}
  const remaining=16-scenario.remaining;assert((await popup.locator('.drag-outcome-main').textContent()).includes('→ '+remaining+'/16'),'The meter and activation state use the same complete simulation');await page.screenshot({path:`test-results/conquest-radius-${scenario.name}-${width}.png`});
  if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else{await page.keyboard.press('Escape');await page.mouse.up();}
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),game,'Inspecting or cancelling spends no resources');
  if(width>500){
   await card.click();await fan.hover();await layer.waitFor();assert.equal(await page.locator('#bl-card-preview .bl-conquest-pending').isVisible(),!ready);
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
