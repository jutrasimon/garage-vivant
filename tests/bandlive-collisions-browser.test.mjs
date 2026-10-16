import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,previewCard,restoreBandLive} from '../dist/bandlive.mjs';
import {restore} from '../dist/engine.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Server unavailable')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const world=preparedConcert({instruments:['drums','keys','voice']}).world,initial=beginBandLiveConcert(world).game;chooseSong(initial,initial.songs[0].id);
 for(const [i,f] of initial.fans.entries()){f.hp=f.max=100;f.intent='bored';f.effect='spotlight';f.effectValue=1;f.position=i===0?{x:400,y:130}:i===1?{x:480,y:220}:{x:740+(i%3)*100,y:60+Math.floor((i-2)/3)*90};}
 const note=initial.cards.find(c=>c.kind==='note');initial.hand=[note.id];initial.deck=initial.cards.filter(c=>c.id!==note.id).map(c=>c.id);initial.discard=[];restore(world);
 const early=structuredClone(world);early.performance.bandLive.game.physics={force:230,grip:5,rebound:.28,collisionPower:0};const upgraded=restore(early);assert.equal(upgraded.performance.bandLive.game.physics.collisionPower,2);assert.equal(upgraded.performance.bandLive.game.physics.hitStrength,.75);assert.deepEqual(upgraded.performance.bandLive.game.fans,initial.fans);
 await page.addInitScript(w=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(w));},world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')));
 await page.locator('#bl-layout').click();
 for(const key of ['hitStrength','collisionRadius','collisionThreshold','collisionPower'])assert(await page.locator(`[data-bl-physics="${key}"]`).isVisible());
 await page.locator('[data-bl-physics="collisionPower"]').fill('3');await page.locator('[data-bl-physics="hitStrength"]').fill('1.5');assert.equal(await page.locator('[data-bl-physics-output="collisionPower"]').textContent(),'3');await page.locator('#bl-layout').click();
 const before=(await saved()).performance.bandLive.game,predicted=previewCard(before,note.id,'f0');assert(predicted.ok);assert(predicted.event.hits.some(h=>h.kind==='collision'&&h.id==='f1'));
 const source=await page.locator(`[data-bl-card="${note.id}"]`).boundingBox(),target=await page.locator('[data-bl-fan="f0"]').boundingBox();await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});
 await page.locator('.drag-card-feedback.has-target:not(.invalid)').waitFor();assert((await page.locator('.drag-outcome-meta').textContent()).includes('Chocs'));assert.deepEqual((await saved()).performance.bandLive.game,before);
 await page.mouse.up();await page.locator('.bl-juice-collision').first().waitFor();assert((await page.locator('.bl-juice-collision').allTextContents()).some(t=>t.includes('IMPACT')));await page.screenshot({path:'test-results/collision-feedback.png'});await page.waitForFunction(()=>!document.querySelector('#bl-end').disabled);
 const actual=(await saved()).performance.bandLive.game;assert.deepEqual(actual,predicted.game,'Collision preview equals the saved result of an ordinary note');assert(actual.fans[1].hp<100);assert.notDeepEqual(actual.fans[1].position,before.fans[1].position);await page.screenshot({path:'test-results/collision-musical-hit.png'});
 await page.reload();await page.locator('.bl-render-ready').waitFor();assert.deepEqual((await saved()).performance.bandLive.game,actual);
 await page.locator('#bl-lab').first().click();
 const lab=structuredClone(actual);lab.physics.force=650;lab.physics.grip=1;lab.physics.collisionPower=5;lab.physics.collisionThreshold=60;
 for(const [i,f] of lab.fans.entries()){f.hp=f.max;f.conquered=false;f.position=i<3?{x:300+i*120,y:180}:{x:740+(i%3)*100,y:60+Math.floor((i-3)/3)*90};}
 restoreBandLive(lab);const filename=resolve('test-results/collision-lab-scenario.json');await writeFile(filename,JSON.stringify({format:'garage-vivant-bandlive-lab',version:1,initial:lab,current:lab}));await page.locator('#bl-lab-file').setInputFiles(filename);
 await page.locator('#bl-layout').click();assert.equal(await page.locator('[data-bl-physics="collisionPower"]').inputValue(),'5');assert.equal(await page.locator('[data-bl-physics="collisionThreshold"]').inputValue(),'60');await page.locator('#bl-layout').click();
 await page.locator('#bl-lab-strength').selectOption('2');await page.locator('#bl-lab-shoot').click();
 const spot=await page.locator('.bl-world').evaluate(el=>{const audience=el.querySelector('.bl-audience').getBoundingClientRect(),scale=Number(el.dataset.scale);return {x:audience.left+(200+(el.clientWidth-1120)/2)*scale,y:audience.top+(180+8)*scale};});
 await page.mouse.click(spot.x,spot.y);await page.locator('.bl-juice-collision').first().waitFor();await page.screenshot({path:'test-results/collision-lab-feedback.png'});await page.waitForTimeout(1750);
 const downloadPromise=page.waitForEvent('download');await page.locator('#bl-lab-export').click();const download=await downloadPromise,scenario=JSON.parse(await readFile(await download.path(),'utf8'));restoreBandLive(scenario.current);
 assert(scenario.current.fans[1].hp<lab.fans[1].hp);assert(scenario.current.events.findLast(e=>e.type==='motion').contacts.some(c=>c.hits.some(h=>h.gain===5)));assert.deepEqual((await saved()).performance.bandLive.game,actual,'Laboratory collision hearts never leak into the real show');
 await page.locator('#bl-lab-close').click();assert.deepEqual((await saved()).performance.bandLive.game,actual);assert.deepEqual(errors,[]);
 console.log('Collision UI passed: exposed strength/radius/threshold/hearts, ordinary-note knockback, exact preview, impact feedback, save/reload and real collision hearts in the isolated laboratory.');
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:'test-results/collision-failure.png'});throw error;}finally{await browser?.close();child.kill();}
