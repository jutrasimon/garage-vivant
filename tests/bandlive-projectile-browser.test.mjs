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
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Server unavailable')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const scenario of [{target:'single',width:1440},{target:'point',width:1440,reload:true},{target:'audience',width:1440},{target:'point',width:390,reduced:true}]){
  const world=preparedConcert({instruments:['drums','keys','voice']}).world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);
  const card=game.cards.find(c=>c.kind==='note'),favorite=game.audienceRules.styles.find(s=>s!==game.songs[0].style);
  game.hand=[card.id];game.discard=[];game.deck=game.cards.filter(c=>c.id!==card.id).map(c=>c.id);game.physics.hitStrength=1.5;
  for(const [i,f] of game.fans.entries())Object.assign(f,{hp:100,max:100,conquered:false,intent:'bored',effect:'spotlight',effectValue:1,favorite,position:i===0?{x:400,y:130}:i===1?{x:480,y:220}:{x:740+(i%3)*100,y:70+(Math.floor((i-2)/3)%3)*90}});
  Object.assign(game.fans[0],{hp:6,max:16,intent:'variety',effect:'shock',effectValue:4,reactionActors:[]});
  if(scenario.target!=='single'){const recipe=duplicateCard(game.catalog,'drums:note');Object.assign(recipe,{target:scenario.target,radius:1.2,coreRadius:.45,effects:[newEffect('power'),...(scenario.target==='point'?[newEffect('push')]:[]),newEffect('tempo')]});card.kind=recipe.id;card.definition=compileCard(recipe);game.actors.find(a=>a.id===card.actorId).bandLiveDeck[Number(card.id.split(':').at(-1))]=recipe.id;}
  restoreBandLive(game);page=await browser.newPage({viewport:{width:scenario.width,height:900},hasTouch:scenario.width<500,isMobile:scenario.width<500});const errors=[];page.on('pageerror',e=>errors.push(e.message));if(scenario.reduced)await page.emulateMedia({reducedMotion:'reduce'});
  const time=new Date('2026-10-18T12:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);
  await page.addInitScript(w=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(w));window.flightParticles=[];const arc=CanvasRenderingContext2D.prototype.arc;CanvasRenderingContext2D.prototype.arc=function(x,y,r,...args){if(r===5&&this.canvas.classList.contains('bl-effects'))flightParticles.push({x,y,time:performance.now()});return arc.call(this,x,y,r,...args);};},world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();await page.clock.runFor(150);
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);
  async function launch(){
   const source=await page.locator(`[data-bl-card="${card.id}"]`).boundingBox();if(scenario.width<500)await page.touchscreen.tap(source.x+source.width/2,source.y+source.height/2);else await page.mouse.click(source.x+source.width/2,source.y+source.height/2);
   const fan=await page.locator('[data-bl-fan="f0"]').boundingBox(),point={x:fan.x+fan.width/2,y:fan.y+fan.height/2};if(scenario.width<500)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
   assert.equal(await page.locator('#bandlive-view').getAttribute('data-bl-flight'),'travelling');return point;
  }
  const initialDOM=await page.locator('[data-bl-fan="f0"]').evaluate(el=>({left:el.style.left,top:el.style.top}));
  await launch();assert.deepEqual(await saved(),game,'Launch applies no damage, conquest, motion, card consumption or resources');assert.equal(await page.locator('[data-bl-fan="f0"].bl-conquered').count(),0);assert.equal(await page.locator('.bl-juice-label').count(),0);assert(await page.locator('#bl-end').isDisabled());assert(await page.locator('#bl-cards').first().isDisabled());
  await page.clock.runFor(170);assert.deepEqual(await saved(),game,'The real show is unchanged while the particle travels');assert((await page.evaluate(()=>flightParticles.length))>0,'A visible moving particle precedes the hit');assert.deepEqual(await page.locator('[data-bl-fan="f0"]').evaluate(el=>({left:el.style.left,top:el.style.top})),initialDOM);assert.equal(await page.locator('[data-bl-fan="f0"]').evaluate(el=>el.style.getPropertyValue('--bl-motion-angle')),'');await page.screenshot({path:`test-results/flight-before-${scenario.target}-${scenario.width}.png`});
  if(scenario.reload){
   await page.reload();await page.locator('.bl-render-ready').waitFor();await page.clock.runFor(700);assert.deepEqual(await saved(),game,'Reloading an undelivered shot cannot consume a card or grant effects');assert.equal(await page.locator('[data-bl-flight]').count(),0);await launch();
  }else await page.clock.runFor(0);
  // The launch clock is restarted only in the explicit reload case.
  await page.clock.runFor(scenario.reload?349:179);assert.deepEqual(await saved(),game,'No hit before the 350 ms delivery point');assert.equal(await page.locator('.bl-juice-collision,.bl-juice-ring').count(),0);
  await page.clock.runFor(1);const actual=await saved(),point=actual.events.findLast(e=>e.type==='card').point,expected=previewCard(game,card.id,'f0',point?{point}:{});assert(expected.ok);assert.deepEqual(actual,expected.game,'Delivery commits the exact simulated hit once');assert.equal(actual.played,1);assert.equal(await page.locator('[data-bl-fan="f0"].bl-conquered').count(),1);assert.equal(await page.locator('[data-bl-flight]').count(),0);
  await page.clock.runFor(32);assert(await page.locator('.bl-juice-label').count(),'Impact feedback starts after the particle arrives');await page.screenshot({path:`test-results/flight-impact-${scenario.target}-${scenario.width}.png`});await page.clock.runFor(3000);assert.deepEqual(await saved(),actual,'Further animation frames never apply the hit twice');
  await page.reload();await page.locator('.bl-render-ready').waitFor();await page.clock.runFor(500);assert.deepEqual(await saved(),actual,'An arrived shot stays committed after reload');assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Projectile timing passed: no early hearts, conquest, recoil, collisions or resources; exact delivery at 350 ms; single/ground/collective, mouse/touch, reduced effects, reload before/after and no duplicate hit.');
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:'test-results/flight-failure.png'});throw error;}finally{await browser?.close();child.kill();}
