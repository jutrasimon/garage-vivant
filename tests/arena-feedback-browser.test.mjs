import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {ARENA_KEY,createArena,defaultScenario,demoCatalog} from '../dist/arena-engine.mjs';
import {TEMPO_ICON_PATH} from '../dist/bandlive-resources.mjs';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';server.on('error',reject);server.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});
 browser=await chromium.launch();
 for(const width of [1440,390])for(const mode of ['tempo','pending','conquest']){
  const config=defaultScenario(),content=demoCatalog(),game=createArena(config,content);
  const card=game.cards.find(c=>mode==='tempo'?c.definition.tempo: c.definition.target==='single');assert(card);
  const fan=game.fans[0];fan.hp=mode==='conquest'?1:fan.max;fan.position={x:560,y:170};fan.effect='shock';fan.effectValue=4;
  game.hand=[card.id];game.deck=game.cards.filter(c=>c!==card).map(c=>c.id);game.discard=[];game.energy=3;
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:ARENA_KEY,data:{config,content,game}});await page.goto(url+'arena.html');
  await page.locator('[data-card]').click();await page.locator('#arena-scroll').evaluate(el=>{el.scrollLeft=(el.scrollWidth-el.clientWidth)/2;});const box=await page.locator('canvas').boundingBox();await page.mouse.move(box.x+fan.position.x*box.width/1120,box.y+(360+fan.position.y)*box.height/800);
  await page.locator('#preview:not([hidden]) .drag-outcome-meta').waitFor();
  assert((await page.locator('.drag-outcome-meta').textContent()).includes('Énergie'));assert((await page.locator('.drag-outcome-meta').textContent()).includes('Tempo'));
  assert.equal(await page.locator('.drag-card-title').textContent(),card.definition.name);
  const bounds=await page.locator('#preview').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width);
  if(mode==='tempo'){
   assert(await page.locator('#arena-tempo').isVisible());assert.equal(await page.locator('#arena-tempo svg').count(),12);assert.equal(await page.locator('#arena-tempo path').first().getAttribute('d'),TEMPO_ICON_PATH);
   assert((await page.locator('.drag-outcome-main').textContent()).includes('Tempo'));
   await page.locator('#reduced').check();await page.mouse.move(box.x+570*box.width/1120,box.y+530*box.height/800);await page.waitForTimeout(100);assert.equal(await page.locator('#arena-tempo svg').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  }else{
   assert((await page.locator('.drag-reaction').textContent()).length>10);assert((await page.locator('.drag-conquest-rule').textContent()).includes('Onde de choc'));assert((await page.locator('.drag-outcome-main').textContent()).includes('→'));
   assert.equal(await page.locator('.bl-conquest-preview').isVisible(),mode==='conquest');assert.equal(await page.locator('.bl-conquest-pending').isVisible(),mode==='pending');
   if(mode==='conquest')assert((await page.locator('.bl-conquest-preview-name').textContent()).includes('Onde de choc'));
  }
  await page.waitForTimeout(400);await page.screenshot({path:`test-results/arena-feedback-${mode}-${width}.png`});await page.keyboard.press('Escape');assert(await page.locator('#preview').isHidden());assert(await page.locator('#arena-tempo').isHidden());if(mode==='tempo'&&width===1440){
   await page.locator('[data-card]').click();const r=await page.locator('canvas').boundingBox();await page.mouse.click(r.x+560*r.width/1120,r.y+530*r.height/800);await page.waitForTimeout(120);assert(await page.locator('#arena-tempo').isHidden(),'No gain animation before the projectile lands');await page.waitForFunction(()=>!document.querySelector('#arena-tempo').hidden);await page.waitForTimeout(1200);assert(await page.locator('#arena-tempo').isHidden(),'Tempo gain particles finish without an idle animation');
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Arena feedback passed: original tempo notes, detailed shared tooltip, real pending/triggered conquest, resources, desktop/narrow placement, reduced motion and cancellation.');
}finally{await browser?.close();server.kill();}
