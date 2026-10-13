import {sep} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {restore} from '../dist/engine.mjs';
import {RELEASE_VERSION,PATCH_NOTES} from '../dist/release.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
const root=resolve('dist');
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost').pathname.replace(/^\/garage-vivant(?=\/)/,'');
    const path=resolve(root,'.'+(url==='/'?'/index.html':url));
    assert(path.startsWith(root+sep));
    res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');
    res.end(await readFile(path));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
let page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const url=`http://127.0.0.1:${server.address().port}/garage-vivant/`;
try{
  await page.goto(url);await page.locator('#profile .profile-head').waitFor({state:'attached'});
  assert((await page.locator('#version').textContent()).includes(RELEASE_VERSION));
  await page.locator('#step').click(); // Advances, pauses and persists a real new world.
  const saved=await page.evaluate(()=>localStorage.getItem('garage-vivant-v1'));
  restore(JSON.parse(saved));await page.reload();
  await page.locator('#profile .profile-head').waitFor({state:'attached'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('garage-vivant-v1')),saved,'A paused world resumes unchanged');
  await page.locator('[data-view="settings"]').click();await page.locator('#bandlive-enabled').check();
  assert(await page.locator('#bandlive-nav').isVisible());
  const world=preparedConcert().world;
  await page.close();page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(world=>{if(!localStorage.getItem('garage-vivant-v1')){localStorage.setItem('garage-vivant-v1',JSON.stringify(world));localStorage.setItem('garage-vivant-bandlive-v1',JSON.stringify({enabled:true,game:null}));}},world);
  await page.goto(url);await page.locator('#profile .profile-head').waitFor({state:'attached'});
  await page.locator('[data-bl-song]').first().waitFor();
  await page.locator('[data-bl-song]').first().click();
  const live=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game);
  await page.reload();await page.locator('#profile .profile-head').waitFor({state:'attached'});
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).performance.bandLive.game),live);
  const notes=await page.request.get(url+'docs/versions.html');assert(notes.ok());
  assert((await notes.text()).includes(`id="${PATCH_NOTES[0]}"`),'Published documentation contains current patch notes');
  assert.deepEqual(errors,[]);console.log('Smoke passed: boot, visible version, save/reload, BandLive activation and live resume, built patch notes.');
}catch(error){await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/smoke-failure.png'});throw error;}
finally{await browser.close();await new Promise(r=>server.close(r));}
