import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong} from '../dist/bandlive.mjs';
const world=preparedConcert({instruments:['drums','keys','voice']}).world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';server.on('error',reject);server.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const width of [1440,390]){
  page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  const saved=()=>page.evaluate(()=>localStorage.getItem('garage-vivant-v1')),before=await saved();
  const click=async selector=>{const el=page.locator(selector).first();if(width<500)await el.tap();else await el.click();};
  async function snapshot(){const download=page.waitForEvent('download');await click('#bl-lab-export');const file=await download;return JSON.parse(await readFile(await file.path(),'utf8'));}
  await click('#bl-lab');await click('[data-bl-test-count="50"]');await page.locator('#bl-test-seed').fill('42');await click('#bl-test-restart');assert.equal(await page.locator('[data-bl-fan]').count(),50);const baseline=await snapshot();assert.equal(baseline.current.turn,1);assert.equal(baseline.current.seed,42);assert.equal(await saved(),before);
  await page.locator('#bl-test-energy').fill('0');await page.locator('#bl-test-tempo').fill('10');await click('#bl-test-resources');await click('#bl-test-save');const checkpoint=await snapshot();assert.equal(checkpoint.current.energy,0);assert.equal(checkpoint.current.tempo,10);
  await click('#bl-test-hand');assert.notDeepEqual((await snapshot()).current.hand,checkpoint.current.hand);await click('#bl-lab-reset');assert.deepEqual((await snapshot()).current,checkpoint.current);
  await click('#bl-test-restart');assert.deepEqual((await snapshot()).current,baseline.current);
  await page.locator('#bl-test-count').fill('51');await click('#bl-test-restart');assert((await page.locator('#bl-test-message').textContent()).includes('3 à 50'));assert.equal(await page.locator('[data-bl-fan]').count(),50);
  await click('[data-bl-test-count="6"]');await click('#bl-test-restart');assert.equal(await page.locator('[data-bl-fan]').count(),6);
  await page.locator('#bl-lab-file').setInputFiles({name:'scenario.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(baseline))});await page.waitForFunction(()=>document.querySelectorAll('[data-bl-fan]').length===50);assert.deepEqual((await snapshot()).current,baseline.current);
  await click('#bl-test-new');const random=await snapshot();assert.notEqual(random.current.seed,42);assert.equal(random.current.fans.length,50);
  await page.screenshot({path:`test-results/test-controls-${width}.png`});await click('#bl-lab-dismiss');assert(await page.locator('.bl-lab-controls').isHidden());await page.screenshot({path:`test-results/test-controls-hidden-${width}.png`});
  await click('[data-bl-card]');await click('[data-bl-fan="f20"]');await page.waitForFunction(()=>document.querySelector('[data-bl-flight]'));await page.waitForFunction(()=>!document.querySelector('#bl-end').disabled);await click('#bl-test-toggle');assert(await page.locator('.bl-lab-controls').isVisible());assert.equal((await snapshot()).current.played,1,'The 50-body lab plays real cards');
  assert(await page.locator('.bl-lab-controls').evaluate(el=>el.matches(':modal')&&el.contains(document.activeElement)),'Controls capture focus in a real modal');
  await page.keyboard.press('Escape');assert(await page.locator('.bl-lab-controls').isHidden());assert(await page.locator('#bl-test-toggle').evaluate(el=>el===document.activeElement));
  await click('#bl-lab');assert(await page.locator('.bl-lab-controls').isVisible());await page.mouse.click(2,2);assert(await page.locator('.bl-lab-controls').isHidden(),'Clicking the backdrop closes the controls');
  const crowd=await page.locator('.bl-world').evaluate(world=>{const box=world.getBoundingClientRect();return {padding:Number(world.dataset.crowdPadding),inside:[...world.querySelectorAll('.bl-fan .bl-cube')].every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right&&r.bottom<box.bottom;}),styles:[...world.querySelectorAll('.bl-fan .bl-name')].map(el=>({match:el.classList.contains('bl-style-matches'),opacity:Number(getComputedStyle(el.querySelector('.bl-style')).opacity)}))};});
  assert(crowd.padding>=64);assert(crowd.inside,'The whole crowd remains inside the padded field');assert(crowd.styles.every(s=>s.match?s.opacity===1:s.opacity<=.25));
  await click('#bl-test-toggle');await click('#bl-lab-close');assert.equal(await page.locator('[data-bl-fan]').count(),game.fans.length);assert.equal(await saved(),before);assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Test controls passed: 6/50 spectators, reproducible restart, random seed, resources, hand, checkpoint/reset, invalid count, 50-body export/import and unchanged live show, desktop/touch.');
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:'test-results/test-controls-failure.png'});throw error;}finally{await browser?.close();server.kill();}
