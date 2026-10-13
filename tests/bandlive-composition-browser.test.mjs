import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {cardFace} from '../dist/card-view.mjs';
import {INSTRUMENTS,CARD_KINDS,definitionFor} from '../dist/bandlive-cards.mjs';
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',chunk=>{output+=chunk;const m=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 browser=await chromium.launch();await mkdir('test-results',{recursive:true});
 for(const scenario of [{name:'reference',width:1898,height:816,large:true,instruments:['keys','guitar','bass','drums']},{name:'trois-musiciens',width:1886,height:862,large:false,instruments:['keys','keys','voice']},{name:'instruments-degagés',width:1440,height:900,large:false,fullHand:true,instruments:['percussion','percussion','sax']},{name:'ancien-show',width:1886,height:862,large:true,legacy:true,instruments:['drums','trumpet','trumpet']},{name:'petit-ecran',width:1280,height:720,large:true,fullHand:true,instruments:['guitar','drums','bass','sax','voice','keys']}]){
  const page=await browser.newPage({viewport:{width:scenario.width,height:scenario.height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const world=preparedConcert(scenario).world;
  if(scenario.legacy||scenario.fullHand){beginBandLiveConcert(world);const game=world.performance.bandLive.game;if(scenario.legacy)delete game.gridColumns;if(scenario.fullHand){const ids=game.cards.filter(c=>c.actorId===game.actors[1].id).map(c=>c.id);game.deck=[...game.deck.filter(id=>!ids.includes(id)),...ids];}}
  await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('[data-bl-song]').first().click();await page.locator('.bl-render-ready').waitFor();
  if(scenario.fullHand)assert((await page.locator('.bl-hand').evaluateAll(els=>els.map(el=>el.querySelectorAll('[data-bl-card]').length))).includes(5),'The musician actually holds five cards in the restored game');
  const g=await page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {world:box('.bl-world'),screen:box('.bl-show-screen'),hud:box('.bl-hud'),details:box('.bl-show-details'),end:box('#bl-end'),dock:box('.bl-turn-dock'),fans:[...document.querySelectorAll('[data-bl-fan]')].map(el=>el.getBoundingClientRect().toJSON()),hands:[...document.querySelectorAll('.bl-hand')].map(el=>el.getBoundingClientRect().toJSON()),performers:[...document.querySelectorAll('.bl-musician-info .bl-performer')].map(el=>el.getBoundingClientRect().toJSON())};});
  const playWidth=await page.locator('.bl-world').evaluate(el=>Number(el.dataset.playWidth));assert(Math.abs(g.world.x+g.world.width/2-playWidth/2)<2,'The stage stays centered in the available playing area');assert(g.world.width<=1121&&g.world.width>=scenario.width*(scenario.legacy?.41:.45),`The scene retains its proportions while fitting the instruments and every crowd row (${scenario.name}: ${g.world.width}px)`);assert(g.hud.height<=100,'The show header stays compact');assert(g.details.top>=scenario.height-1,'Evening information stays below the first screen');
  assert(g.end.left>scenario.width*.75&&g.end.bottom<=scenario.height-10&&g.end.width>=190,'The large turn button sits at the lower right');
  assert(g.fans.every(r=>r.top>=g.hud.bottom&&r.bottom<=scenario.height-70),'All audience members fit');assert(Math.max(...g.hands.map(r=>r.bottom))<=Math.min(...g.fans.map(r=>r.top))-2,`Hands leave a visible gap above the audience (${scenario.name}: hands ${Math.max(...g.hands.map(r=>r.bottom))}, fans ${Math.min(...g.fans.map(r=>r.top))})`);
  assert(Math.min(...g.hands.map(r=>r.top))>=Math.max(...g.performers.map(r=>r.bottom))+24,'Hands leave the full musician visible and extra room for instruments, including a complete five-card hand');
  const cards=await page.locator('.bl-hand .bl-card-face').evaluateAll(els=>els.map(el=>{const scale=Number(el.closest('.bl-world').dataset.scale),rule=el.querySelector('.bl-card-rule');return {font:parseFloat(getComputedStyle(rule).fontSize)*scale,width:el.offsetWidth*scale,ratio:el.offsetWidth/el.offsetHeight,clipped:rule.scrollHeight>rule.clientHeight+1||rule.scrollWidth>rule.clientWidth+1};}));
  assert(cards.every(c=>c.font>=10&&c.width>=103),'Hand rules stay readable at the displayed size');assert(cards.every(c=>Math.abs(c.ratio-5/7)<.01&&!c.clipped),'Hand cards keep their ratio and show their complete rules');
  const meters=await page.locator('.bl-fan .bl-resistance').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect(),world=el.closest('.bl-world').getBoundingClientRect();return {bottom:r.bottom,limit:world.bottom};}));assert(meters.every(m=>m.bottom<=m.limit+1),'Crowd health bars remain entirely visible');
  await page.screenshot({path:`test-results/bandlive-composition-${scenario.name}.png`});
  await page.locator('#bl-layout').click();const scrolledHeight=await page.locator('.bl-show-screen').evaluate(el=>el.getBoundingClientRect().height);assert(Math.abs(scrolledHeight-g.screen.height)<1,'Opening tools below the screen never stretches the scene');assert(await page.locator('#bandlive-view .bl-evening summary').isVisible());
  if(scenario.name==='reference'){
   const definitions=Object.keys(INSTRUMENTS).flatMap(instrument=>CARD_KINDS.map(kind=>({card:definitionFor(instrument,kind),owner:'Charlie',instrument})));
   await page.evaluate(faces=>{const fixture=document.createElement('section');fixture.id='card-readability-fixture';fixture.className='bl-minuit';fixture.style.cssText='position:fixed;inset:0;z-index:999;display:grid;grid-template-columns:repeat(8,132px);gap:16px;justify-content:center;align-content:start;padding:20px!important;height:100vh;overflow:auto';fixture.innerHTML=faces.map(face=>`<div class="bl-hand" style="position:relative;width:132px;height:184.8px;transform:none"><button class="bl-card" style="width:132px;height:184.8px">${face}</button></div>`).join('');document.body.append(fixture);},definitions.map(cardFace));
   const complete=await page.locator('#card-readability-fixture .bl-card-face').evaluateAll(els=>els.map(el=>{const rule=el.querySelector('.bl-card-rule'),title=el.querySelector('.bl-card-title'),range=document.createRange();range.selectNodeContents(rule);const text=range.getBoundingClientRect(),box=rule.getBoundingClientRect();return {name:title.textContent,rule:rule.textContent,clipped:text.bottom>box.bottom+1||rule.scrollWidth>rule.clientWidth+1||title.scrollWidth>title.clientWidth+1};}));
   assert.deepEqual(complete.map(c=>c.rule),definitions.map(d=>d.card.description));assert(complete.every(c=>!c.clipped),'Every starter and upgraded card displays its full title and rule: '+JSON.stringify(complete.filter(c=>c.clipped)));
   await page.screenshot({path:'test-results/bandlive-cards-readability.png'});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Composition and card readability passed: all eight instruments clear of five-card hands, reference sizes, legacy three-row shows, 1280×720, complete starter/upgraded rules, fixed ratio, audience meters and bottom-right turn control.');
}finally{await browser?.close();child.kill();}
