import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong} from '../dist/bandlive.mjs';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';server.on('error',reject);server.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});
 const world=preparedConcert().world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);
 game.fans[0].hp=0;game.fans[0].conquered=true;
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('**/bandlive-minuit-renderer.mjs*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('renderer.render(scene,camera);','window.spriteSizes=scene.children.filter(x=>x.isSprite).map(x=>({x:x.scale.x,y:x.scale.y}));renderer.render(scene,camera);')});});
 await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();await page.waitForFunction(()=>window.spriteSizes?.length);
 const before=await page.evaluate(()=>spriteSizes);
 for(const angle of [15,45,90,0]){
  await page.locator('.bl-fan .bl-cube').evaluateAll((els,angle)=>els.forEach(el=>{el.style.animation='none';el.style.transform=`rotate(${angle}deg)`;}),angle);
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await page.waitForTimeout(150);
  assert.deepEqual(await page.evaluate(()=>spriteSizes),before,`Rotation ${angle} never enlarges a sprite during layout refresh`);
 }
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),game);
 console.log('Sprite size passed: active/conquered spectators retain authored dimensions through rotation and layout refresh.');
}finally{await browser?.close();server.kill();}
