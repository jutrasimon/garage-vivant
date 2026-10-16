import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {grantXp} from '../dist/progression.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));assert(path.startsWith(root+sep));res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch(),errors=[];await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.stack));
 const world=preparedConcert({large:true,instruments:['guitar','drums','bass','sax','voice','keys'],following:true}).world;
 grantXp(world.people[0],50); // Practice before this show makes a level available in its report.
 beginBandLiveConcert(world);Object.assign(world.performance.bandLive.game.fans[1],{hp:0,conquered:true,intent:'distracted',effect:'chorus',effectValue:1});
 await page.addInitScript(world=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));},world);
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.locator('[data-bl-song]').first().waitFor();assert(await page.locator('.bl-song-overlay').isVisible());
 await page.screenshot({path:'test-results/refonte-songs.png'});
 await page.locator('[data-bl-song]').first().click();await page.locator('[data-bl-fan]').first().waitFor();
 for(const [width,height] of [[1440,900],[1920,1080],[1280,720],[1024,768]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(250);
  const geometry=await page.evaluate(()=>({fans:[...document.querySelectorAll('[data-bl-fan]')].map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};}),end:document.querySelector('#bl-end').getBoundingClientRect().toJSON(),audience:document.querySelector('.bl-audience-viewport').getBoundingClientRect().toJSON()}));
  assert(geometry.fans.every(r=>r.top>=0&&r.bottom<=height&&r.left>=0&&r.right<=width),JSON.stringify({width,height,geometry}));
  assert(geometry.end.bottom<=height);assert(geometry.end.left>width*2/3,'The turn button sits at the lower right');assert((await page.locator('.bl-show-details').boundingBox()).y>=height-1,'Evening information starts below the playing screen');
  await page.screenshot({path:`test-results/refonte-${width}.png`});
  const note=page.locator('[data-bl-card]:not(:disabled)').filter({has:page.locator('.bl-card-title',{hasText:/^Note$/})}).first(),hand=note.locator('..'),source=await note.boundingBox(),sourceHand=await hand.boundingBox(),fan=await page.locator('[data-bl-fan="f0"]').boundingBox();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);
  await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(source.x+source.width/2,source.y+source.height/2+25,{steps:4});await page.mouse.move(fan.x+fan.width/2,fan.y+fan.height/2,{steps:8});await page.locator('.drag-card-feedback.has-target:not(.invalid)').waitFor();
  const box=await page.locator('.drag-card-feedback').boundingBox();assert(box.x>=10&&box.x+box.width<=width-10,'The cursor tooltip stays inside the viewport');assert(await page.locator('#bl-card-preview').isHidden(),'Dragging shows one preview, without a duplicate card panel');
  assert(box.x+box.width<=fan.x||box.x>=fan.x+fan.width||box.y+box.height<=fan.y||box.y>=fan.y+fan.height,'The cursor tooltip leaves the aimed spectator visible');
  const sameSource=await hand.boundingBox();assert(Math.abs(sameSource.x-sourceHand.x)<.1&&Math.abs(sameSource.y-sourceHand.y)<.1,'Opening the preview never moves the hand');
  const conquered=await page.locator('[data-bl-fan="f1"]').boundingBox();await page.mouse.move(conquered.x+conquered.width/2,conquered.y+conquered.height/2,{steps:5});await page.locator('.drag-card-feedback.invalid.has-target').waitFor();const invalid=await page.locator('.drag-card-feedback').boundingBox();assert(invalid.x+invalid.width<=conquered.x||invalid.x>=conquered.x+conquered.width||invalid.y+invalid.height<=conquered.y||invalid.y>=conquered.y+conquered.height,'Invalid targets remain visible too');assert((await page.locator('.drag-conquest-rule').textContent()).length>15);
  await page.screenshot({path:`test-results/preview-side-${width}.png`});await page.mouse.move(8,8,{steps:4});await page.mouse.up();await page.locator('.drag-card-feedback').waitFor({state:'detached'});assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),before,'Cancelling a preview spends nothing and changes no show state');
 }
 await page.setViewportSize({width:1440,height:900});
 const live=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);
 const pulse=live.hand.find(id=>{const c=live.cards.find(c=>c.id===id);return c.instrument==='drums'&&c.kind==='special';});
 if(pulse){await page.locator(`[data-bl-card="${pulse}"]`).click();await page.locator('.bl-audience').click({position:{x:10,y:20},force:true});await page.locator('.bl-juice-label').first().waitFor();assert((await page.locator('.bl-juice-label').allTextContents()).some(x=>x.includes('TEMPO')));await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);}
 const card=page.locator('[data-bl-card]:not(:disabled)').first();await card.hover();await page.locator('#bl-card-preview:not([hidden]) .bl-card-face').waitFor();
 const ratios=await page.evaluate(()=>[document.querySelector('.bl-hand .bl-card-face'),document.querySelector('#bl-card-preview .bl-card-face')].map(el=>el.offsetWidth/el.offsetHeight));assert(Math.abs(ratios[0]-ratios[1])<.02);
 await page.locator('.bl-render-ready').waitFor();const target=page.locator('[data-bl-fan="f0"]'),stableBox=await target.boundingBox();
 for(let i=0;i<4;i++){await page.waitForTimeout(90);const box=await target.boundingBox();assert(Math.abs(box.x-stableBox.x)<.1&&Math.abs(box.y-stableBox.y)<.1,'Character animation keeps its hitbox still');}
 const source=await card.boundingBox(),cx=stableBox.x+stableBox.width/2,cy=stableBox.y+stableBox.height/2;
 await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(source.x+source.width/2,source.y+source.height/2+25,{steps:4});await page.mouse.move(cx,cy,{steps:8});await page.locator('.drag-card-feedback.has-target').waitFor();
 const popup=await page.locator('.drag-card-feedback').boundingBox(),name=await page.locator('.drag-outcome-name').textContent();
 for(const dx of [-5,5,-3,3]){await page.mouse.move(cx+dx,cy);await page.waitForTimeout(90);const box=await page.locator('.drag-card-feedback').boundingBox();assert(Math.abs(box.x-popup.x)<20&&Math.abs(box.y-popup.y)<20,'Small pointer movements never make the tooltip jump');assert.equal(await page.locator('.drag-outcome-name').textContent(),name);}
 await page.screenshot({path:'test-results/refonte-stable-hover.png'});await page.mouse.move(8,8,{steps:5});await page.mouse.up();
 await card.click();await page.locator('[data-bl-fan="f0"]').hover({force:true});assert((await page.locator('#bl-card-preview .drag-conquest-rule').textContent()).length>15);assert((await page.locator('#bl-card-preview .drag-reaction').textContent()).length>15);
 await page.keyboard.press('Escape');
 await page.locator('#bl-end').click();await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);await page.reload();await page.locator('[data-bl-fan]').first().waitFor();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),saved);
 await page.locator('#bl-neighborhood').click();await page.locator('[data-view="groups"]').click();assert(await page.locator('.group-member .person-card .character-portrait').count()>0);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.setViewportSize({width:1440,height:900});await page.locator('#bandlive-nav').click();await page.locator('#bl-simulate').click();
 const reward=page.locator('#bandlive-view [data-level-reward]').first();await reward.waitFor();
 const rewardRatio=await reward.locator('.bl-card-face').first().evaluate(el=>el.offsetWidth/el.offsetHeight);assert(Math.abs(rewardRatio-5/7)<.02);
 await page.reload();await page.locator('#bandlive-view [data-level-reward]').first().waitFor();
 await reward.locator('input[name^="level-slot-"]').first().check();await reward.locator('input[name^="level-kind-"][value="new1"]').check();
 const owner=await reward.getAttribute('data-level-owner');await reward.locator('[data-level-claim]').click();assert(await page.evaluate(owner=>JSON.parse(localStorage.getItem('garage-vivant-v1')).people.find(p=>p.id===owner).levelRewards.some(r=>r.status==='claimed'),owner));
 await page.screenshot({path:'test-results/refonte-levels.png'});
 assert.deepEqual(errors,[]);console.log('Refonte passed: six musicians/twelve fans, cursor preview with visible valid/invalid targets at four desktop sizes, fixed card ratio, stable targeting, turn control, reload, group portraits and mobile width.');
}catch(error){console.error(errors);throw error;}finally{await browser.close();await new Promise(r=>server.close(r));}
