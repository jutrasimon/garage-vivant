import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));assert(path.startsWith(root+sep));res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch(),errors=[];await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.stack));
 const world=preparedConcert({large:true,instruments:['guitar','drums','bass','sax','voice','keys'],following:true}).world;
 await page.addInitScript(world=>{if(!localStorage.getItem('garage-vivant-v1'))localStorage.setItem('garage-vivant-v1',JSON.stringify(world));},world);
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.locator('[data-bl-song]').first().waitFor();assert(await page.locator('.bl-song-overlay').isVisible());
 await page.screenshot({path:'test-results/refonte-songs.png'});
 await page.locator('[data-bl-song]').first().click();await page.locator('[data-bl-fan]').first().waitFor();
 for(const [width,height] of [[1440,900],[1920,1080],[1280,720],[1024,768]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(250);
  const geometry=await page.evaluate(()=>({fans:[...document.querySelectorAll('[data-bl-fan]')].map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};}),end:document.querySelector('#bl-end').getBoundingClientRect().toJSON(),audience:document.querySelector('.bl-audience-viewport').getBoundingClientRect().toJSON()}));
  assert(geometry.fans.every(r=>r.top>=0&&r.bottom<=height&&r.left>=0&&r.right<=width),JSON.stringify({width,height,geometry}));
  assert(geometry.end.bottom<=height);assert(geometry.end.left<width/3);
  await page.screenshot({path:`test-results/refonte-${width}.png`});
 }
 await page.setViewportSize({width:1440,height:900});
 const live=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);
 const pulse=live.hand.find(id=>{const c=live.cards.find(c=>c.id===id);return c.instrument==='drums'&&c.kind==='special';});
 if(pulse){await page.locator(`[data-bl-card="${pulse}"]`).click();await page.locator('.bl-audience').click({position:{x:10,y:20},force:true});await page.locator('.bl-juice-label').first().waitFor();assert((await page.locator('.bl-juice-label').allTextContents()).some(x=>x.includes('TEMPO')));await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);}
 const card=page.locator('[data-bl-card]:not(:disabled)').first();await card.hover();await page.locator('#bl-card-preview:not([hidden]) .bl-card-face').waitFor();
 const ratios=await page.evaluate(()=>[document.querySelector('.bl-hand .bl-card-face'),document.querySelector('#bl-card-preview .bl-card-face')].map(el=>el.offsetWidth/el.offsetHeight));assert(Math.abs(ratios[0]-ratios[1])<.02);
 await card.click();await page.locator('[data-bl-fan="f0"]').hover({force:true});assert((await page.locator('.outcome-conquest').textContent()).length>15);assert((await page.locator('.outcome-reaction').textContent()).length>15);
 await page.keyboard.press('Escape');
 await page.locator('#bl-end').click();await page.waitForFunction(()=>!document.querySelector('#bl-end')?.disabled);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);await page.reload();await page.locator('[data-bl-fan]').first().waitFor();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),saved);
 await page.locator('[data-view="groups"]').click();assert(await page.locator('.group-member .person-card .character-portrait').count()>0);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.setViewportSize({width:1440,height:900});await page.locator('#bandlive-nav').click();await page.locator('#bl-simulate').click();
 const reward=page.locator('#bandlive-view [data-level-reward]').first();await reward.waitFor();
 const rewardRatio=await reward.locator('.bl-card-face').first().evaluate(el=>el.offsetWidth/el.offsetHeight);assert(Math.abs(rewardRatio-5/7)<.02);
 await page.reload();await page.locator('#bandlive-view [data-level-reward]').first().waitFor();
 await reward.locator('input[name^="level-slot-"]').first().check();await reward.locator('input[name^="level-kind-"][value="new1"]').check();
 const owner=await reward.getAttribute('data-level-owner');await reward.locator('[data-level-claim]').click();assert(await page.evaluate(owner=>JSON.parse(localStorage.getItem('garage-vivant-v1')).people.find(p=>p.id===owner).levelRewards.some(r=>r.status==='claimed'),owner));
 await page.screenshot({path:'test-results/refonte-levels.png'});
 assert.deepEqual(errors,[]);console.log('Refonte passed: automatic BandLive, six musicians/twelve fans at four desktop sizes, fixed card ratio, fan rules during targeting, turn control, reload, group portraits and mobile width.');
}catch(error){console.error(errors);throw error;}finally{await browser.close();await new Promise(r=>server.close(r));}
