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
 browser=await chromium.launch();await mkdir('test-results',{recursive:true});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),before=await saved();
 async function aim(id,target='f0'){
  const source=await page.locator(`[data-bl-card="${id}"]`).boundingBox(),fan=await page.locator(`[data-bl-fan="${target}"]`).boundingBox();
  const pointer={x:fan.x+fan.width/2,y:fan.y+fan.height/2};await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(source.x+source.width/2,source.y+source.height/2+25,{steps:3});await page.mouse.move(pointer.x,pointer.y,{steps:6});await page.locator('.drag-card-feedback.has-target').waitFor();
  const popup=await page.locator('.drag-card-feedback').boundingBox();assert(popup.x+popup.width<=fan.x||popup.x>=fan.x+fan.width||popup.y+popup.height<=fan.y||popup.y>=fan.y+fan.height,'The tooltip leaves its target visible');assert(Math.hypot(Math.max(popup.x-pointer.x,0,pointer.x-popup.x-popup.width),Math.max(popup.y-pointer.y,0,pointer.y-popup.y-popup.height))<150,'The effect tooltip stays beside the cursor');return {fan,pointer,popup};
 }
 async function cancel(){await page.mouse.move(8,8,{steps:4});await page.mouse.up();assert.deepEqual(await saved(),before,'Aiming and cancelling change no game state');assert.equal(await page.locator('.bl-aim.visible').count(),0);}
 for(const [width,height] of [[1440,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);const {pointer,popup}=await aim(pulse.id);assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').count(),1,'Tempo-only cards have a green arc');assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),0);
  const endpoint=await page.locator('.bl-aim-ring.bl-aim-tempo').boundingBox(),tempo=await page.locator('[data-bl-resource="tempo"]').boundingBox();assert(Math.abs(endpoint.x+endpoint.width/2-tempo.x-tempo.width/2)<1&&Math.abs(endpoint.y+endpoint.height/2-tempo.y-tempo.height/2)<1,'The green arc reaches the tempo meter outside the scene');assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').evaluate(el=>getComputedStyle(el).stroke),'rgb(164, 241, 190)');
  for(const dx of [-5,5,-3,3]){await page.mouse.move(pointer.x+dx,pointer.y);const stable=await page.locator('.drag-card-feedback').boundingBox();assert(Math.abs(stable.x-popup.x)<20,'The tooltip keeps its side during small moves');}
  await page.mouse.move(pointer.x,pointer.y+12);await page.waitForFunction(top=>Math.abs(document.querySelector('.drag-card-feedback').getBoundingClientRect().top-top-12)<1,popup.y,{timeout:1500});const moved=await page.locator('.drag-card-feedback').boundingBox();assert(Math.abs(moved.y-popup.y-12)<1,'Pointer movement updates tooltip position even on a cached target: '+JSON.stringify({width,popup,moved}));await page.waitForTimeout(350);await page.screenshot({path:`test-results/bandlive-tempo-aim-${width}.png`});await cancel();
 }
 await aim(note.id);assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),1,'Conquest keeps its pink arc');assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').count(),0);await cancel();
 await aim(mixed.id);assert.equal(await page.locator('.bl-aim-line.bl-aim-tempo').count(),1);assert.equal(await page.locator('.bl-aim-line:not(.bl-aim-tempo)').count(),1,'Mixed cards show both effects');await page.waitForTimeout(350);await page.screenshot({path:'test-results/bandlive-mixed-aim.png'});await cancel();
 await aim(note.id,'f1');assert(await page.locator('.bl-aim.invalid').count());assert(await page.locator('.drag-card-feedback.invalid').count());await cancel();
 assert.deepEqual(errors,[]);console.log('Targeting passed: green tempo arc reaches its meter, pink conquest preserved, mixed effects, cursor tooltip movement, visible valid/invalid targets and cancellation without spending.');
}finally{await browser?.close();child.kill();}
