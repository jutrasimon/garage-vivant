import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {createWorld} from '../dist/engine.mjs';

const world=createWorld(619,8,{setup:'none'});
// Different profile heights exercise both preserved offsets and bottom clamping.
world.songs=Array.from({length:25},(_,i)=>({id:i+1,title:`Chanson du quartier ${i+1}`,authors:[world.people[0].id],genre:'Indie',emotion:'joy',tone:'lumineuse',intensity:40,resonance:60,quality:65,sources:[],hit:false,time:world.time}));
world.nextSongId=26;
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
let browser;
try {
  const url=await new Promise((resolve,reject)=>{
    let output='';
    const timer=setTimeout(()=>reject(Error('Serveur local indisponible.')),5000);
    child.on('error',reject);
    child.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});
  });
  browser=await chromium.launch();
  const errors=[];
  async function open(viewport) {
    const page=await browser.newPage({viewport});
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),world);
    await page.goto(url);
    await page.locator('#profile .profile-head').waitFor({state:'attached'});
    await page.locator('#speed').fill('0');
    return page;
  }
  const position=page=>page.locator('#inspector').evaluate(el=>({top:el.scrollTop,max:el.scrollHeight-el.clientHeight}));
  async function scrollTo(page,top) {
    await page.locator('#inspector').evaluate((el,value)=>{el.scrollTop=value;},top);
    return (await position(page)).top;
  }
  async function changePerson(page,index,top) {
    await page.locator(`#people [data-person="${world.people[index].id}"]`).click();
    assert.equal(await page.locator('#profile').getAttribute('data-person'),world.people[index].id);
    const after=await position(page),expected=Math.min(top,after.max);
    assert(Math.abs(after.top-expected)<=1,`Character ${index}: keep ${expected}px, got ${after.top}px`);
    await page.waitForTimeout(900);
    assert(Math.abs((await position(page)).top-expected)<=1,'Periodic refresh keeps the selected reading position');
  }
  const page=await open({width:1440,height:900});
  let top=await scrollTo(page,680);
  assert(top>0);
  await changePerson(page,1,top); // First visit must not jump to the top.
  top=await scrollTo(page,1180);
  await changePerson(page,2,top);
  await changePerson(page,0,top); // Returning must not restore the old 680px.
  top=await scrollTo(page,420);
  await changePerson(page,1,top); // Returning must not restore the old 1180px.
  await changePerson(page,0,top);
  top=await scrollTo(page,1e6);
  await changePerson(page,1,top);
  assert((await position(page)).max<top,'The shorter profile clamps naturally at its own bottom');
  top=await scrollTo(page,0);
  await changePerson(page,0,top);

  // Live updates still keep an open, focused editor anchored in the panel.
  await page.locator('#skills-edit summary').click();
  const slider=page.locator('[data-edit="skills:writing"]');
  await slider.scrollIntoViewIfNeeded();
  await slider.evaluate(el=>{window.profileScrollEditor=el;el.focus();});
  const before=await slider.boundingBox();
  await page.locator('#speed').evaluate(el=>{el.value='1';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForTimeout(1100);
  assert(await slider.evaluate(el=>el===window.profileScrollEditor&&el===document.activeElement),'The editor and focus survive live updates');
  assert(Math.abs((await slider.boundingBox()).y-before.y)<3,'The focused editor stays anchored during live updates');
  await page.close();

  const mobile=await open({width:390,height:844});
  await mobile.locator('#people [data-person]').first().click();
  top=await scrollTo(mobile,680);
  await mobile.locator('#close-inspector').click();
  await changePerson(mobile,1,top);
  await mobile.locator('#close-inspector').click();
  await changePerson(mobile,0,top);
  await mobile.close();
  assert.deepEqual(errors,[]);
  console.log('Profile scroll passed: first visits, return visits, different heights, top/bottom, periodic refresh, focused editor and mobile reopening.');
} finally {
  await browser?.close();
  child.kill();
}
