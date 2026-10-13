import {sep} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';

// Prime real HTTP-cache entries under the URLs used by both the published
// game and the prior feature build. Missing exports in these old entries make
// an accidental mixed-version import fail at startup instead of going unnoticed.
const root=resolve('dist'),modules=(await readdir(root)).filter(name=>name.endsWith('.mjs'));
const previousVersions=['0.7.4','0.7.5','0.7.6','0.7.7','0.7.8','0.7.9','4'];
const staleURLs=modules.flatMap(name=>previousVersions.map(version=>`/${name}?v=${version}`));
let priming=true,primedRequests=0;
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/__prime.html'){
      res.setHeader('Content-Type','text/html');res.setHeader('Cache-Control','no-store');
      res.end(`<body>Preparing old cache<script type="module">await Promise.all(${JSON.stringify(staleURLs)}.map(url=>import(url)));document.body.dataset.ready='true';document.body.firstChild.textContent='Old cache ready';</script></body>`);return;
    }
    if(priming&&staleURLs.includes(req.url)){
      primedRequests++;res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','public, max-age=600');res.end('export const oldCachedRelease=true;');return;
    }
    const path=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
    if(!path.startsWith(root+sep))throw Error('Outside fixture root');
    res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');
    res.setHeader('Cache-Control',extname(path)==='.html'?'no-store':'public, max-age=600');res.end(await readFile(path));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url+'/__prime.html');await page.locator('body[data-ready="true"]').waitFor();
  assert.equal(primedRequests,staleURLs.length,'Every previous module URL was actually cached');priming=false;
  await page.goto(url+'/');await page.locator('#profile .profile-head').waitFor({state:'attached'});
  assert(await page.locator('#bandlive-nav').isVisible(),'BandLive is available by default after upgrade');
  await page.locator('#speed').fill('0');await page.locator('[data-view="settings"]').click();await page.locator('#bandlive-enabled').check();
  await page.locator('#bandlive-nav').click();assert(await page.locator('#bandlive-view').isVisible(),'The same upgraded module graph enables BandLive');
  await page.reload();await page.locator('#profile .profile-head').waitFor({state:'attached'});assert.deepEqual(errors,[]);
  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/bandlive-cached-upgrade.png'});
  console.log(`Cached upgrade passed: ${staleURLs.length} old module URLs primed, default-on boot and reload.`);
}finally{await browser.close();server.close();}
