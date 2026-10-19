import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong,previewCard} from '../dist/bandlive.mjs';
import {duplicateCard,compileCard,newEffect} from '../dist/bandlive-catalog.mjs';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';server.on('error',reject);server.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const width of [1440,390]){
  const world=preparedConcert({instruments:['drums','keys','voice']}).world,g=beginBandLiveConcert(world).game;chooseSong(g,g.songs[0].id);
  const card=g.cards.find(c=>c.kind==='note'),recipe=duplicateCard(g.catalog,card.instrument+':note');Object.assign(recipe,{name:'Séparer la foule',target:'point',radius:.2,coreRadius:0,cost:0,effects:[{...newEffect('split'),strength:.5}]});card.kind=recipe.id;card.definition=compileCard(recipe);g.actors.find(a=>a.id===card.actorId).bandLiveDeck[Number(card.id.split(':').at(-1))]=recipe.id;
  g.hand=[card.id];g.discard=[];g.deck=g.cards.filter(c=>c!==card).map(c=>c.id);g.physics.collisionRadius=16;g.fans.forEach((f,i)=>{f.position={x:260+i%4*180,y:90+Math.floor(i/4)*160};});
  const before=structuredClone(g),page=await browser.newPage({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);await page.goto(url);await page.locator('.bl-render-ready').waitFor();
  const source=await page.locator('[data-bl-card]').first().boundingBox(),target=await page.locator('[data-bl-fan="f1"]').boundingBox(),point={x:Math.round(target.x+target.width/2),y:Math.round(target.y+target.height/2)};
  let cdp;if(width<500){cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+source.width/2,y:source.y+source.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});}else{await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(point.x,point.y,{steps:5});}
  await page.locator('.bl-split-line').waitFor({state:'attached'});assert.equal(await page.locator('.bl-split-preview').getAttribute('data-strength'),'0.5');assert((await page.locator('.bl-split-preview text').textContent()).includes('Force 0,5'));assert.equal(await page.locator('.bl-radius-outer').count(),0);assert.equal(await page.locator('.bl-forecast').count(),g.fans.length);const line=await page.locator('.bl-split-line').evaluate(el=>{return el.getBoundingClientRect().toJSON();});assert(Math.abs(line.x+line.width/2-point.x)<1);assert(line.height>100);
  await page.screenshot({path:`test-results/split-${width}.png`});
  if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game.played===1&&!document.querySelector('#bl-end').disabled);
  const actual=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),landing=actual.events.findLast(e=>e.type==='card').point;
  assert.deepEqual(actual,previewCard(before,card.id,'audience',{point:landing}).game);assert.equal(actual.events.find(e=>e.type==='motion').targets.length,g.fans.length);
  const edge=await page.evaluate(()=>{const world=document.querySelector('.bl-world'),area=world.querySelector('.bl-audience').getBoundingClientRect(),scale=Number(world.dataset.scale);return {x:Math.round(area.left+((world.clientWidth-1120)/2+20)*scale),y:Math.round(area.top+(Number(world.dataset.crowdPadding)+180)*scale)};});
  await page.locator('#bl-lab').first().click();await page.locator('#bl-lab-kind').selectOption('split');await page.locator('#bl-lab-strength').selectOption('2');await page.locator('#bl-lab-shoot').click();assert(await page.locator('.bl-lab-controls').isHidden());await page.mouse.move(edge.x,edge.y);await page.locator('.bl-split-line').waitFor({state:'attached'});assert.equal(await page.locator('.bl-radius-outer').count(),0);assert.equal(await page.locator('.bl-split-preview').getAttribute('data-strength'),'2');assert((await page.locator('.bl-split-preview text').textContent()).includes('Force 2'));await page.mouse.click(edge.x,edge.y);await page.waitForTimeout(2000);
  await page.locator('#bl-test-toggle').click();const download=page.waitForEvent('download');await page.locator('#bl-lab-export').click();const scenario=JSON.parse(await readFile(await (await download).path(),'utf8'));assert.equal(scenario.current.events.findLast(e=>e.type==='motion').kind,'split');assert.equal(scenario.current.events.findLast(e=>e.type==='motion').center.x,52,'The visible preview in the edge padding can actually be fired');assert.equal(scenario.current.events.findLast(e=>e.type==='motion').targets.length,g.fans.length);
  await page.locator('#bl-lab-close').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),actual);
  await page.locator('#bl-cards').first().click();const editor=page.locator('.bl-card-editor');await editor.locator('[data-ce-field="type"]').first().selectOption('split');await editor.locator('[data-ce-field="target"]').selectOption('point');assert.equal(await editor.locator('[data-ce-field="radius"]').count(),0);await editor.locator('[data-ce-field="strength"]').fill('2');assert((await editor.locator('.ce-preview').textContent()).includes('Ligne verticale'));await editor.locator('[data-ce-action="close"]').click();
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Split passed: vertical preview, whole crowd, exact card resolution, laboratory isolation and mouse/touch.');
}finally{await browser?.close();server.kill();}
