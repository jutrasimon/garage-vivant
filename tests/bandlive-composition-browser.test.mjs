import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',chunk=>{output+=chunk;const m=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 browser=await chromium.launch();await mkdir('test-results',{recursive:true});
 for(const scenario of [{name:'reference',width:1898,height:816,large:true,instruments:['keys','guitar','bass','drums']},{name:'trois-musiciens',width:1886,height:862,large:false,instruments:['keys','keys','voice']}]){
  const page=await browser.newPage({viewport:{width:scenario.width,height:scenario.height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const world=preparedConcert(scenario).world;await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('[data-bl-song]').first().click();await page.locator('.bl-render-ready').waitFor();
  const g=await page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {world:box('.bl-world'),screen:box('.bl-show-screen'),hud:box('.bl-hud'),details:box('.bl-show-details'),end:box('#bl-end'),dock:box('.bl-turn-dock'),fans:[...document.querySelectorAll('[data-bl-fan]')].map(el=>el.getBoundingClientRect().toJSON()),hands:[...document.querySelectorAll('.bl-hand')].map(el=>el.getBoundingClientRect().toJSON())};});
  assert(Math.abs(g.world.x+g.world.width/2-scenario.width/2)<2,'The stage stays centered');assert(g.world.width<=1121&&g.world.width>=scenario.width*.5,'The scene retains the reference width');assert(g.hud.height<=100,'The show header stays compact');assert(g.details.top>=scenario.height-1,'Evening information stays below the first screen');
  assert(g.end.left>scenario.width*.75&&g.end.bottom<=scenario.height-10&&g.end.width>=190,'The large turn button sits at the lower right');
  assert(g.fans.every(r=>r.top>=g.hud.bottom&&r.bottom<=scenario.height-70),'All audience members fit');assert(Math.max(...g.hands.map(r=>r.bottom))<=Math.min(...g.fans.map(r=>r.top))+8,'Hands do not cover the audience');
  await page.screenshot({path:`test-results/bandlive-composition-${scenario.name}.png`});
  await page.locator('#bl-layout').click();const scrolledHeight=await page.locator('.bl-show-screen').evaluate(el=>el.getBoundingClientRect().height);assert(Math.abs(scrolledHeight-g.screen.height)<1,'Opening tools below the screen never stretches the scene');assert(await page.locator('#bandlive-view .bl-evening summary').isVisible());
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Composition passed at the exact reference sizes: centered scene, compact header, cards above the audience, bottom-right turn control and evening information below the screen.');
}finally{await browser?.close();child.kill();}
