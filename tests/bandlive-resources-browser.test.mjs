import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong} from '../dist/bandlive.mjs';

const world=preparedConcert({instruments:['drums','trumpet','guitar']}).world;
beginBandLiveConcert(world);
const game=world.performance.bandLive.game;
chooseSong(game,game.songs[0].id);game.tempo=7;
for(const fan of game.fans){fan.max=100;fan.hp=100;fan.intent='bored';}
const card=(instrument,kind)=>game.cards.find(c=>c.instrument===instrument&&c.kind===kind).id;
game.hand=[card('trumpet','special'),card('drums','special'),card('guitar','special'),card('drums','note'),card('guitar','note')];
game.deck=game.cards.filter(c=>!game.hand.includes(c.id)).map(c=>c.id);game.discard=[];
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try {
  const url=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',chunk=>{text+=chunk;const match=text.match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});});
  browser=await chromium.launch();await mkdir('test-results',{recursive:true});const errors=[];
  async function open(reduced=false){const page=await browser.newPage({viewport:{width:1898,height:816}});page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await page.addInitScript(w=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(w));},world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();return page;}
  const resource=(page,key)=>page.locator(`[data-bl-resource="${key}"]`);
  async function assertValue(page,key,value){const meter=resource(page,key);assert.equal(await meter.getAttribute('data-value'),String(value));assert.equal(await meter.locator('[role=progressbar]').getAttribute('aria-valuenow'),String(value));assert.equal(await meter.locator('.charged').count(),value);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);assert.equal(saved[key],value);}
  async function play(page,id,target='audience'){await page.locator(`[data-bl-card="${id}"]`).click();await page.locator(target==='audience'?'.bl-audience':`[data-bl-fan="${target}"]`).click({position:{x:10,y:20},force:true});}
  const ready=page=>page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);
  const page=await open();assert.equal(await page.locator('.bl-hud [data-bl-energy],.bl-hud [data-bl-tempo],.bl-turn-dock [data-bl-energy]').count(),0,'Resources have one home at the left');
  await assertValue(page,'energy',3);await assertValue(page,'tempo',7);assert.equal(await resource(page,'tempo').evaluate(el=>el.getAnimations({subtree:true}).length),0,'Initial display never animates a fake gain');
  await page.screenshot({path:'test-results/bandlive-resources-desktop.png'});
  await play(page,card('trumpet','special'));await resource(page,'tempo').locator('output').filter({hasText:'+2'}).waitFor();await assertValue(page,'tempo',9);await assertValue(page,'energy',3);assert.equal(await resource(page,'energy').locator('output').textContent(),'');assert(await resource(page,'tempo').evaluate(el=>el.getAnimations({subtree:true}).length>0),'Gained tempo lights the meter and new segments');
  await page.screenshot({path:'test-results/bandlive-resources-gain.png'});await ready(page);
  await play(page,card('drums','special'));await assertValue(page,'tempo',10);await assertValue(page,'energy',2);assert.equal(await resource(page,'tempo').locator('output').textContent(),'+1','Feedback uses actual capped gain');assert.equal(await resource(page,'energy').locator('output').textContent(),'−1');assert(await resource(page,'tempo').evaluate(el=>el.classList.contains('is-full')));await ready(page);
  await play(page,card('guitar','special'),'f0');await assertValue(page,'energy',0);await assertValue(page,'tempo',0);assert.equal(await resource(page,'energy').locator('output').textContent(),'−2');assert.equal(await resource(page,'tempo').locator('output').textContent(),'−10');await ready(page);
  await page.locator('#bl-end').click();await assertValue(page,'energy',3);assert.equal(await resource(page,'energy').locator('output').textContent(),'+3','Next turn restores energy with feedback');await ready(page);
  await page.reload();await page.locator('.bl-render-ready').waitFor();await assertValue(page,'energy',3);await assertValue(page,'tempo',0);assert.equal(await resource(page,'energy').locator('output').textContent(),'','Reload keeps resources without inventing a gain');
  for(const [width,height] of [[1898,816],[1280,720],[1024,768],[390,844],[320,800]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(200);
    const boxes=await page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {resources:box('.bl-resource-dock'),end:box('.bl-turn-dock'),fans:[...document.querySelectorAll('[data-bl-fan]')].map(el=>el.getBoundingClientRect().toJSON())};});
    const {resources,end,fans}=boxes;assert(resources.x<=24&&resources.bottom<=height&&resources.y>height*.6,'Energy and tempo stay at the lower left');assert(end.right<=width&&end.right>=width-24&&end.bottom<=height,'End turn stays at the lower right');assert(resources.right<=end.x||resources.bottom<=end.y,'Resource and turn controls never overlap');assert(fans.every(f=>f.bottom<=resources.y||f.right<=resources.x||f.left>=resources.right),'Resources do not cover the audience');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'The HUD adds no page overflow');
    if(width===390)await page.screenshot({path:'test-results/bandlive-resources-mobile.png'});
  }
  await page.close();
  const reduced=await open(true);await play(reduced,card('trumpet','special'));await assertValue(reduced,'tempo',9);assert.equal(await resource(reduced,'tempo').locator('output').textContent(),'+2','Reduced motion keeps readable feedback');assert.equal(await resource(reduced,'tempo').evaluate(el=>el.getAnimations({subtree:true}).length),0,'Reduced motion suppresses resource animations');await ready(reduced);await reduced.close();
  assert.deepEqual(errors,[]);console.log('Resource HUD passed: lower-left energy/tempo, lower-right turn, live segments, capped gain, spending, turn refill, reload, five screen sizes and reduced motion.');
} finally {await browser?.close();child.kill();}
