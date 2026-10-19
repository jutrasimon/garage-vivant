import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong} from '../dist/bandlive.mjs';
const world=preparedConcert().world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);game.energy=2;game.tempo=7;
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
 for(const width of [1898,1280,1024,768,650,390,320]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(80);
  // Exercise the widest lab totals without putting a lab-only crowd in a campaign save.
  await page.locator('.bl-hud-conquered b').evaluate(el=>el.textContent='50 / 50');await page.locator('.bl-hud-turn b').evaluate(el=>el.textContent='10');
  const hud=await page.locator('.bl-hud').boundingBox(),boxes=[];
  for(const selector of ['.bl-hud-turn','.bl-resource-dock','.bl-hud-conquered']){const box=await page.locator(selector).boundingBox();assert(box.x>=0&&box.x+box.width<=width+1,`${selector} fits ${width}`);assert(box.y>=hud.y&&box.y+box.height<=hud.y+hud.height+1);boxes.push(box);}
  assert(boxes[0].x+boxes[0].width<=boxes[1].x+1&&boxes[1].x+boxes[1].width<=boxes[2].x+1,'All counters stay separate');
  for(const [key,value] of [['energy',2],['tempo',7]]){const meter=page.locator(`[data-bl-resource="${key}"]`),box=await meter.boundingBox();assert(box.x>=boxes[1].x&&box.x+box.width<=boxes[1].x+boxes[1].width+1,'The meter contents fit their capsule');assert(await meter.locator('svg').isVisible());assert(await meter.locator('[role=progressbar]').isVisible());assert.equal(await meter.locator('[role=progressbar]').getAttribute('aria-valuenow'),String(value));assert.equal(await meter.locator('.charged').count(),value);}
  await page.screenshot({path:`test-results/hud-${width}.png`});
 }
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),game);assert.deepEqual(errors,[]);console.log('Physical HUD passed: visible icons and energy/tempo segments, exact values, separate counters inside the header at seven widths from 320 to 1898, unchanged show.');
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:'test-results/hud-failure.png'});throw error;}finally{await browser?.close();child.kill();}
