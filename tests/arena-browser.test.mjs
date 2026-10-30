import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {ARENA_KEY,createArena,defaultScenario,demoCatalog,arenaPreview} from '../dist/arena-engine.mjs';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';server.on('error',reject);server.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const width of [1440,390]){
  const config=defaultScenario();config.entrancePressure=false;config.frontPressure=false;const content=demoCatalog(),game=createArena(config,content),card=game.cards.find(c=>c.definition.name==='Break stéréo');game.hand=[card.id];game.deck=game.cards.filter(c=>c!==card).map(c=>c.id);game.discard=[];
  const page=await browser.newPage({viewport:{width,height:1000},isMobile:width<500,hasTouch:width<500}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('garage-vivant-v1','unchanged sentinel');},{key:ARENA_KEY,value:{version:1,config,content,game}});
  await page.goto(url+'arena.html');await page.locator('[data-card]').first().waitFor();
  const source=page.locator('[data-card]').first();await source.scrollIntoViewIfNeeded();await source.click();await page.keyboard.press('Escape');assert(await page.locator('#preview').isHidden());assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).game.played,ARENA_KEY),0);
  await source.click();await page.locator('#arena-scroll').evaluate(e=>{e.scrollLeft=0;e.scrollTop=350;});
  let box=await page.locator('canvas').boundingBox();const point={x:width<500?220:560,y:180},screen={x:box.x+point.x/1120*box.width,y:box.y+(point.y+360)/800*box.height};await page.mouse.move(screen.x,screen.y);await page.locator('#preview').waitFor();assert((await page.locator('#preview').innerText()).includes('deux vagues'));assert((await page.locator('#preview').innerText()).includes('Droite'));
  await page.screenshot({path:`test-results/arena-wave-${width}.png`});if(width<500)await page.touchscreen.tap(screen.x,screen.y);else await page.mouse.click(screen.x,screen.y);assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).game.played,ARENA_KEY),0,'No hit before the projectile lands');
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).game.played===1&&!document.querySelector('#end').disabled,ARENA_KEY);
  const actual=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).game,ARENA_KEY),landing=actual.events.findLast(e=>e.type==='card').point;assert.deepEqual(actual,arenaPreview(game,card.id,'audience',landing).game);
  await page.locator('#end').click();await page.waitForFunction(()=>!document.querySelector('#end').disabled);assert((await page.locator('#queue-info').innerText()).includes('31 à venir'));
  await page.locator('#workshop').click();await page.locator('[data-tab="public"]').click();await page.locator('[data-config="types.0.name"]').fill('Public de test');await page.locator('[data-config="types.0.name"]').press('Tab');await page.locator('[data-tab="show"]').click();await page.locator('[data-config="total"]').fill('60');await page.locator('[data-config="total"]').press('Tab');await page.locator('#apply').click();await page.locator('#workshop-dialog').waitFor({state:'hidden'});assert((await page.locator('#queue-info').innerText()).includes('/60'));
  await page.locator('#workshop').click();await page.locator('[data-tab="cards"]').click();await page.locator('#open-cards').click();const editor=page.locator('.bl-card-editor');await editor.locator('[data-ce-field="target"]').selectOption('point');await editor.locator('[data-ce-field="name"]').fill('Essai immédiat');await editor.locator('[data-ce-action="test"]').click();await editor.waitFor({state:'hidden'});assert((await page.locator('#hands').innerText()).includes('Essai immédiat'));
  await page.reload();await page.locator('[data-card]').first().waitFor();assert((await page.locator('#hands').innerText()).includes('Essai immédiat'),'Live recipe survives reload');
  await page.locator('#workshop').click();await page.locator('[data-tab="physics"]').click();await page.locator('[data-resource="energy"]').fill('0');await page.locator('[data-resource="energy"]').press('Tab');await page.locator('#redraw').click();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).game.energy,ARENA_KEY),0);const download=page.waitForEvent('download');await page.locator('#export').click();const file=await (await download).path();const exported=JSON.parse(await readFile(file,'utf8'));assert.equal(exported.game.arena.config.total,60);await page.locator('#import').setInputFiles(file);assert.equal(await page.locator('#config-error').innerText(),'');await page.locator('#workshop-dialog [data-close]').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('garage-vivant-v1')),'unchanged sentinel');assert.deepEqual(errors,[]);await page.screenshot({path:`test-results/arena-ready-${width}.png`});await page.close();
 }
 console.log('Arena browser passed: preview/flight/wave, cancellation, turns, workshop, live recipes, reload/export/import, isolated save, desktop and narrow viewport.');
}finally{await browser?.close();server.kill();}

