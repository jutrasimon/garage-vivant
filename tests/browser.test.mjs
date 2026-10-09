// Real Chromium checks run on GitHub's runner. No simulated DOM or production writes.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,step,createGroup,decide,relationship} from '../dist/engine.mjs';
import {command} from '../dist/life.mjs';

const root=resolve('dist');
const server=createServer(async(req,res)=>{
 try{const path=resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css'})[extname(path)]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch();
const errors=[];
async function load(page,world){page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(save=>localStorage.setItem('garage-vivant-v1',JSON.stringify(save)),world);await page.goto(base);await page.waitForSelector('#profile .profile-head');}
const s=createWorld(205,8);step(s,1440*3);const band=createGroup(s,s.people.slice(0,4).map(p=>p.id),{manual:true,name:'Les Cubes du Canal'});
let song=s.songs.find(song=>song.authors.some(id=>band.members.includes(id)));if(!song){const p=s.people[0];for(let n=0;n<10&&!song;n++){p.needs.energy=100;decide(s,p,'write');step(s,200);song=s.songs.find(song=>song.authors.includes(p.id));}}
assert(song);command(s,{type:'repertoire',groupId:band.id,songId:song.id});band.repertoire[0].mastery=65;band.development=55;
for(const a of s.people)for(const b of s.people)if(a!==b)Object.assign(relationship(s,a,b),{affinity:75,trust:75,tension:0});
s.playerId=s.people[0].id;
let page;
try{
 page=await browser.newPage({viewport:{width:1440,height:960}});await load(page,s);
 const header=await page.locator('header').boundingBox(),main=await page.locator('#main').boundingBox();assert(main.y>=header.y+header.height-1,'Header must not cover the workspace');assert.equal(await page.locator('main nav').count(),0);
 await page.locator('#people [data-person]').nth(7).click();assert((await page.locator('#profile h2').textContent()).includes(s.people[7].name));
 // Open a persistent editor and drag its range while the world changes at all target speeds.
 await page.locator('#skills-edit summary').click();
 const slider=page.locator('[data-edit="skills:writing"]');await slider.scrollIntoViewIfNeeded();await slider.focus();
 await slider.evaluate(el=>{window.testRange=el;});
 for(const speed of [.5,1,10]){
  await page.locator('#speed').evaluate((el,speed)=>{el.value=String(speed);el.dispatchEvent(new Event('input',{bubbles:true}));},speed);
  await slider.focus();const before=await slider.boundingBox(),scroll=await page.locator('#inspector').evaluate(el=>el.scrollTop);
  await page.waitForTimeout(1200);
  assert(await slider.evaluate(el=>el===window.testRange),'The slider node must survive updates');assert(await slider.evaluate(el=>document.activeElement===el),'Focus must survive updates');
  const after=await slider.boundingBox();assert(Math.abs(after.y-before.y)<3,`Focused control shifted at speed ${speed}`);assert(Math.abs(await page.locator('#inspector').evaluate(el=>el.scrollTop)-scroll)<8,'Inspector scroll jumped');
 }
 const box=await slider.boundingBox();await page.mouse.move(box.x+box.width*.6,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(900);await page.mouse.move(box.x+box.width*.7,box.y+box.height/2,{steps:12});await page.mouse.up();assert(await slider.evaluate(el=>el===window.testRange));
 // Profiles each retain their own reading position, with no roster rebuild.
 const savedScroll=await page.locator('#inspector').evaluate(el=>el.scrollTop);await page.locator('#people [data-person]').nth(0).click();await page.locator('#people [data-person]').nth(7).click();assert(Math.abs(await page.locator('#inspector').evaluate(el=>el.scrollTop)-savedScroll)<8);
 await page.locator('[data-view="journal"]').click();await page.locator('#main').evaluate(el=>el.scrollTop=240);await page.waitForTimeout(800);const journalScroll=await page.locator('#main').evaluate(el=>el.scrollTop);
 await page.locator('[data-view="groups"]').click();await page.locator('[data-view="journal"]').click();assert(Math.abs(await page.locator('#main').evaluate(el=>el.scrollTop)-journalScroll)<8,'Navigation lost view scroll');
 await page.locator('#main').evaluate(el=>el.scrollTop=350);await page.waitForTimeout(1400);assert(await page.locator('#main').evaluate(el=>el.scrollTop)>300,'New events forced journal to the top');
 await page.locator('[data-view="relations"]').click();await page.locator('#matrix [data-pair]').first().click();assert.equal(await page.locator('#matrix thead .selected-name').count(),2);assert.equal(await page.locator('#matrix tbody th.selected-name').count(),2);assert.equal(await page.locator('#matrix .selected-row').count(),1);
 const relation=page.locator('[data-rel]').first();await relation.focus();await relation.evaluate(el=>window.testRelation=el);await page.waitForTimeout(900);assert(await relation.evaluate(el=>window.testRelation===el&&document.activeElement===el));
 await page.locator('#version').click();assert(await page.locator('#dialog').evaluate(el=>el.open));assert((await page.locator('#dialog-content').textContent()).includes('0.5.0'));await page.locator('#dialog-close').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'version');
 await page.locator('#people [data-person]').nth(0).click();await page.locator('[data-view="shows"]').click();await page.locator('#show-group').selectOption(band.id);await page.locator('#preview-show').click();await page.locator('#show-speed').selectOption('4');
 assert(await page.locator('#show-setup').isHidden());assert(await page.locator('#stage').isVisible());
 await page.waitForTimeout(1000);await page.locator('#show-pause').click();const paused=await page.locator('#show-status').textContent();await page.waitForTimeout(900);assert.equal(await page.locator('#show-status').textContent(),paused,'Show did not pause');await page.locator('#show-pause').click();
 await page.waitForSelector('.show-result',{timeout:20000});assert((await page.locator('.show-result').textContent()).includes('fans conquis'));await page.screenshot({path:'test-results/desktop-show.png'});
 await page.locator('#replay-show').click();assert(await page.locator('.live-show-title').isVisible());await page.locator('#show-pause').click();await page.screenshot({path:'test-results/desktop-replay.png'});
 assert.equal(errors.length,0,errors.join('\n'));await page.close();page=null;

 // Touch-sized browser, modal focus/scroll isolation, horizontal roster, no body overflow.
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});page=await context.newPage();await load(page,s);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile page overflows horizontally');assert.equal(await page.evaluate(()=>document.scrollingElement.scrollTop),0);
 const mobileHeader=await page.locator('header').boundingBox(),mobileMain=await page.locator('#main').boundingBox();assert(mobileMain.y>=mobileHeader.height-1);
 await page.locator('#people [data-person]').nth(6).tap();assert(await page.locator('#inspector').evaluate(el=>el.classList.contains('open')));
 await page.locator('#skills-edit summary').tap();const touchSlider=page.locator('[data-edit="skills:writing"]');await touchSlider.scrollIntoViewIfNeeded();await touchSlider.focus();const touchBox=await touchSlider.boundingBox();await page.waitForTimeout(1300);const touchAfter=await touchSlider.boundingBox();assert(Math.abs(touchAfter.y-touchBox.y)<3,'Mobile editor jumped');
 await page.locator('#close-inspector').tap();await page.locator('[data-view="shows"]').tap();await page.locator('#show-group').selectOption(band.id);await page.locator('[data-deck]').first().tap();assert(await page.locator('#dialog').evaluate(el=>el.open));const body=await page.evaluate(()=>document.scrollingElement.scrollTop);await page.locator('#dialog').evaluate(el=>el.scrollTop=200);await page.waitForTimeout(900);assert.equal(await page.evaluate(()=>document.scrollingElement.scrollTop),body);await page.locator('#dialog-close').tap();await page.screenshot({path:'test-results/mobile-preparation.png'});
 await page.locator('#preview-show').tap();await page.locator('#show-pause').tap();await page.locator('#stage').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/mobile-show.png'});
 assert.equal(errors.length,0,errors.join('\n'));await context.close();page=null;
 console.log('Chromium desktop + touch viewport passed: stable editor nodes, focus, active simulation at 0.5/1/10, drag, profile/view scroll, matrix highlights, patch notes, automatic show/pause/replay, responsive header, mobile panel and modal scrolling.');
}catch(error){if(page)await page.screenshot({path:'test-results/failure.png'}).catch(()=>{});throw error;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
