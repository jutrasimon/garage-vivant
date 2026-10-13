import {sep} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,createGroup} from '../dist/engine.mjs';
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();const errors=[];await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#profile .profile-head').waitFor({state:'attached'});
 await page.locator('#speed').fill('0');await page.locator('#speed').dispatchEvent('input');
 await page.locator('[data-view="settings"]').click();
 const proposal=page.locator('[data-design-value="groups.proposal"]');assert.equal(await proposal.inputValue(),'0.315');
 await page.locator('[data-design-search]').fill('chance de proposer un groupe');assert.equal(await page.locator('.design-row').count(),1);
 await page.locator('[data-design-context="groups.proposal"] summary').click();await proposal.fill('0.6');assert((await page.locator('[data-design-context="groups.proposal"] code').textContent()).includes('0,6'));assert((await page.locator('[data-design-context="groups.proposal"] .design-example').textContent()).includes('15 %'));assert(await page.locator('.design-summary').textContent().then(s=>s.includes('1 changement')));
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')||'{}').design);assert.equal(before,undefined);
 await page.locator('[data-design-apply]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).design.values['groups.proposal']),.6);
 await page.reload();await page.locator('[data-view="settings"]').click();assert.equal(await proposal.inputValue(),'0.6');
 await proposal.fill('2');await page.locator('[data-design-apply]').click();assert((await page.locator('[data-design-status]').textContent()).includes('refusé'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).design.values['groups.proposal']),.6);
 await page.locator('[data-design-cancel]').click();assert.equal(await proposal.inputValue(),'0.6');
 await page.locator('[data-design-file]').setInputFiles({name:'profil.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'garage-vivant-design-1',values:{'groups.proposal':.8}}))});await page.waitForFunction(()=>document.querySelector('[data-design-value="groups.proposal"]').value==='0.8');assert.equal(await proposal.inputValue(),'0.8');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).design.values['groups.proposal']),.6);
 await page.locator('[data-design-apply]').click();
 const download=page.waitForEvent('download');await page.locator('[data-design-export]').click();const d=await download;const stream=await d.createReadStream();let text='';for await(const chunk of stream)text+=chunk;assert.equal(JSON.parse(text).values['groups.proposal'],.8);
 await page.locator('[data-design-file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"bad","values":{}}')});await page.waitForFunction(()=>document.querySelector('[data-design-status]').textContent.includes('Import refusé'));assert.equal(await proposal.inputValue(),'0.8');
 await page.locator('[data-design-modified]').check();assert.equal(await page.locator('.design-row').count(),1);
 await page.locator('[data-design-reset]').click();assert.equal(await page.locator('.design-row').count(),0);await page.locator('[data-design-apply]').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).design.values),{});
 await page.locator('[data-design-modified]').uncheck();await page.locator('[data-design-category]').selectOption('formation');
 await page.locator('[data-design-context="groups.proposal"] summary').click();await page.locator('[data-design-context="groups.proposal"]').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/design-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('[data-design-context="groups.proposal"]').scrollIntoViewIfNeeded();
 assert(await page.locator('#design-dashboard').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'No horizontal overflow in dashboard');await page.screenshot({path:'test-results/design-mobile.png'});
 // Exercise the actual dashboard handler with retained reports and active shows.
 const showGuards=await page.evaluate(async()=>{
  const {mountDesignDashboard}=await import('/design-dashboard.mjs');
  const {createWorld}=await import('/engine.mjs');
  const results=[];
  for(const [status,eventId] of [['finished',null],['cancelled',null],['playing',null],['finished','evening']]){
   const world=createWorld(71,4);world.performance={status};world.showEventId=eventId;
   const root=document.createElement('div');let applied=0;
   mountDesignDashboard(root,{world:()=>world,onApply:()=>applied++});
   const input=root.querySelector('[data-design-value="groups.proposal"]');
   input.value='0.6';input.dispatchEvent(new Event('input',{bubbles:true}));
   root.querySelector('[data-design-apply]').click();
   results.push({status,eventId,applied,value:world.design?.values['groups.proposal']??null});
  }
  return results;
 });
 assert.deepEqual(showGuards,[
  {status:'finished',eventId:null,applied:1,value:.6},
  {status:'cancelled',eventId:null,applied:1,value:.6},
  {status:'playing',eventId:null,applied:0,value:null},
  {status:'finished',eventId:'evening',applied:0,value:null},
 ]);
 assert.deepEqual(errors,[]);console.log('Design dashboard passed: staged edits, actual saved values, reload, validation, profile import/export, reset, filters, mobile width and show completion guards.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
