import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {crowdStressFixture} from './bandlive-crowd-stress-fixture.mjs';
import {previewCard} from '../dist/bandlive.mjs';
import {assertGroundAim} from './bandlive-ground-aim-helpers.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Server unavailable')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m){clearTimeout(timer);resolve(m[0]);}});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();const measurements=[];
 for(const width of [1440,390]){
  const {world,game,card}=crowdStressFixture(),errors=[];page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});page.on('pageerror',e=>errors.push(e.message));
  // Mount the production show module directly: this does not raise the playable crowd cap.
  await page.route('**/app.mjs*',route=>route.fulfill({contentType:'text/javascript',body:''}));await page.goto(url);
  await page.evaluate(async world=>{
   const {createBandLiveModule}=await import('/bandlive-view.mjs?v=0.9.0');window.stressWorld=world;document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!=='bandlive-view');document.body.classList.add('bandlive-mode');document.querySelector('.workspace').classList.add('bandlive-layout');document.querySelector('.topline').hidden=true;
   window.stressModule=createBandLiveModule({getWorld:()=>world,onOpen:()=>{},onReturn:()=>{},onDisable:()=>{},canStart:()=>true,notify:message=>{throw Error(message);}});stressModule.refresh();
   window.stressAudit={previews:0,rects:0,frames:0};const clone=structuredClone;window.structuredClone=function(v,...args){if(v?.fans)stressAudit.previews++;return clone(v,...args);};const rect=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(...args){stressAudit.rects++;return rect.apply(this,args);};function frame(){stressAudit.frames++;requestAnimationFrame(frame);}requestAnimationFrame(frame);
  },world);
  await page.locator('.bl-render-ready').waitFor();await page.waitForTimeout(300);assert.equal(await page.locator('[data-bl-fan]').count(),50);
  const pick=page.locator(`[data-bl-card="${card.id}"]`);if(width<500)await pick.tap();else await pick.click();await page.locator('#bl-put-back').waitFor();await page.waitForTimeout(100);
  const floor=await page.locator('[data-bl-fan]').evaluateAll(els=>els.filter(el=>stressWorld.performance.bandLive.game.fans.find(f=>f.id===el.dataset.blFan).position.y===180).map(el=>el.getBoundingClientRect().toJSON()).find(r=>r.x+r.width/2>65&&r.x+r.width/2<innerWidth-65&&r.y+r.height/2>100&&r.y+r.height/2<innerHeight-180)),point={x:floor.x+floor.width/2,y:floor.y+floor.height/2};
  async function burst(point,count=120){return page.evaluate(({point,count})=>{Object.assign(stressAudit,{previews:0,rects:0});const root=document.querySelector('#bandlive-view');for(let i=0;i<count;i++)root.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:point.x+Math.sin(i)*12,clientY:point.y+Math.cos(i)*8,pointerId:1,pointerType:'mouse'}));root.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:point.x,clientY:point.y,pointerId:1,pointerType:'mouse'}));return {...stressAudit};},{point,count});}
  const before=await burst(point);assert.equal(before.previews,0,'Input events only schedule the latest prediction; they never run physics inline');await assertGroundAim(page,point);let audit=await page.evaluate(()=>stressAudit);assert.equal(audit.previews,1,'A burst of 121 movements computes exactly the latest point once');assert(audit.rects<150,'Fifty character rectangles are read together once');
  const second={x:point.x+13,y:point.y+9};await burst(second);await assertGroundAim(page,second);audit=await page.evaluate(()=>stressAudit);assert.equal(audit.previews,1);assert(audit.rects<30,'Moving the area reuses character geometry instead of reading all fifty bodies');measurements.push({width,...audit});
  // Cancel with a prediction still queued: it must never reopen or mutate the show.
  await page.evaluate(point=>{const root=document.querySelector('#bandlive-view');root.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:point.x+9,clientY:point.y+4}));document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Escape'}));},second);await page.waitForTimeout(80);assert.equal(await page.locator('.bl-aim.visible').count(),0);assert(await page.locator('#bl-card-preview').isHidden());assert.deepEqual(await page.evaluate(()=>stressWorld.performance.bandLive.game),game);
  if(width<500)await pick.tap();else await pick.click();await burst(point);await assertGroundAim(page,point);
  const spot=await page.evaluate(()=>{const center=document.querySelector('.bl-radius-center'),world=document.querySelector('.bl-world');return {x:Number(center.getAttribute('cx'))-(world.clientWidth-stressWorld.performance.bandLive.game.room.width)/2,y:Number(center.getAttribute('cy'))-document.querySelector('.bl-musicians').clientHeight-Number(world.dataset.crowdPadding)};});
  const expected=previewCard(game,card.id,'audience',{point:spot});assert(expected.ok);assert(expected.event.hits.some(h=>h.kind==='collision'),'The fifty-body fixture exercises real collision hearts');
  if(width<500)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);await page.waitForFunction(()=>stressWorld.performance.bandLive.game.played===1&&!document.querySelector('#bl-end').disabled);
  const actual=await page.evaluate(()=>stressWorld.performance.bandLive.game),landed=actual.events.findLast(e=>e.type==='card').point;assert(Math.hypot(spot.x-landed.x,spot.y-landed.y)<.001,'Casting retains the precise preview center instead of rounded click coordinates');assert.deepEqual(actual.fans.map(f=>f.hp),expected.game.fans.map(f=>f.hp),'The area announces the exact direct and collision hearts');
  // Browser input transports subpixel coordinates with slightly different floating-point precision.
  assert.deepEqual(actual,previewCard(game,card.id,'audience',{point:landed}).game,'The final precise pointer resolves the exact same fifty-body collision state');assert.deepEqual(errors,[]);await page.screenshot({path:`test-results/crowd-stress-${width}.png`});await page.close();
 }
 console.log(JSON.stringify({message:'Fifty-body performance passed: bounded latest-point predictions, cached geometry, exact collisions and impact result, queued cancellation, desktop/touch.',measurements}));
}catch(error){if(page&&!page.isClosed()){await page.screenshot({path:'test-results/crowd-stress-failure.png'});console.log(await page.evaluate(()=>({played:stressWorld.performance.bandLive.game.played,selected:document.querySelector('[aria-pressed="true"][data-bl-card]')?.dataset.blCard,help:document.querySelector('#bl-help')?.textContent})));}throw error;}finally{await browser?.close();child.kill();}
