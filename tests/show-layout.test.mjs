import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,createGroup} from '../dist/engine.mjs';
import {createPerformance,advancePerformance,CARDS} from '../dist/stage.mjs';
import {showBeat,songSeconds,musicalTick,stageGeometry} from '../dist/show-playback.mjs';

const root=resolve('dist');
const server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();
    res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.js':'text/javascript','.json':'application/json'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/`;
await mkdir('test-results',{recursive:true});
const world=createWorld(205,8),group=createGroup(world,world.people.slice(0,4).map(p=>p.id),{manual:true,name:'Les Cubes du Canal'});
const show=createPerformance({id:'layout',seed:902,people:world.people.slice(0,4),group,song:{id:1,title:'Les néons du quartier',genre:'Indie',quality:70,intensity:50,emotion:'joy'},opportunity:{id:'layout',name:'Répétition générale',styles:['Indie'],crowd:8},totalTicks:3600,preview:true});
const samples=[];
for(const cue of show.cues){
  const reveal=structuredClone(show);advancePerformance(reveal,cue.tick);const beat=showBeat(reveal);
  for(const seconds of [songSeconds(reveal)+beat.revealSeconds*.5,(beat.aimAt+beat.shotAt)/2,(beat.shotAt+beat.hit)/2,beat.hit+.06]){
    const state=structuredClone(show);advancePerformance(state,Math.ceil(musicalTick(state,seconds)));state.presentationStarted=true;state.presentationPaused=true;samples.push(state);
  }
}
const late=structuredClone(show);advancePerformance(late,show.cues.at(-1).tick+150);late.presentationStarted=true;late.presentationPaused=true;samples.push(late);
const browser=await chromium.launch(),errors=[];
let page;
try{
  for(const viewport of [{width:1440,height:900},{width:1200,height:768},{width:900,height:850},{width:390,height:844},{width:390,height:667},{width:844,height:390}]){
    page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
    const selected=viewport.width===1440?samples:[...new Map(samples.map(s=>[CARDS[s.events.filter(e=>e.type==='card').at(-1).cardId].tag+':'+showBeat(s).phase,s])).values(),late];
    let expected;const captures=new Set();await page.addInitScript(()=>{if(window.name){const save=JSON.parse(window.name);if(save.people)localStorage.setItem('garage-vivant-v1',JSON.stringify(save));}
      window.bangBounds=[];const draw=CanvasRenderingContext2D.prototype.strokeText;
      CanvasRenderingContext2D.prototype.strokeText=function(value,x,y,...rest){if(String(value).startsWith('BANG')){const m=this.getTransform(),half=this.measureText(value).width*m.a/2,center=m.a*x+m.c*y+m.e;window.bangBounds.push({left:center-half,right:center+half,width:this.canvas.width});}return draw.call(this,value,x,y,...rest);};
    });await page.goto(url);
    for(const state of selected){
      const save={...structuredClone(world),performance:state};
      await page.evaluate(save=>window.name=JSON.stringify(save),save);
      const phase=showBeat(state).phase;
      await page.reload();await page.locator(`[data-show-phase="${phase}"]`).waitFor({state:'attached'});await page.waitForTimeout(220);
      assert.equal(await page.locator('.hero-card').count(),phase==='reveal'?1:0,'The card disappears before aiming, firing and the impact');
      assert.equal(await page.locator('.discard-stack,.discard-card').count(),0,'No old cards underneath the reveal');
      if(phase==='impact'){const bangs=await page.evaluate(()=>window.bangBounds);assert(bangs.length>0);for(const b of bangs)assert(b.left>=0&&b.right<=b.width,'BANG and its combo multiplier fit the canvas, including on a small phone');}
      const layout=await page.evaluate(()=>{
        const box=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
        return {arena:box('.stage-shell'),card:box('.hero-card'),dock:box('.card-foreground'),header:box('header'),field:box('.stage-field'),controls:['#show-status','#show-resources','#show-pause','#show-speed','#skip-show','#sound'].map(box),scroll:document.querySelector('#main').scrollHeight-document.querySelector('#main').clientHeight};
      });
      assert.equal(layout.scroll,0,'The show never needs an outside scroll');
      assert(layout.arena.width>=viewport.width-1&&layout.arena.height>=viewport.height-layout.header.height-1);
      for(const box of [...layout.controls,...(layout.card?[layout.card]:[])])assert(box.x>=layout.arena.x-1&&box.y>=layout.arena.y-1&&box.x+box.width<=layout.arena.x+layout.arena.width+1&&box.y+box.height<=layout.arena.y+layout.arena.height+1,'Every control and card stays inside the arena');
      if(layout.card){
        assert.equal(await page.locator('.hero-card>strong').textContent(),CARDS[state.events.filter(e=>e.type==='card').at(-1).cardId].name);
        assert(await page.locator('.card-modifier').evaluate(e=>e.clientHeight>=18));
        assert(Math.abs(layout.card.width-layout.dock.width)<1&&Math.abs(layout.card.height-layout.dock.height)<1);
        expected??=layout.card;for(const key of ['x','y','width','height'])assert(Math.abs(layout.card[key]-expected[key])<1,'Every card uses the same '+key);
        const geometry=stageGeometry({clientWidth:layout.field.width,clientHeight:layout.field.height,dataset:{showLayout:'integrated'}});
        const card=layout.card;const intersects=b=>card.x<b.x+b.width&&card.x+card.width>b.x&&card.y<b.y+b.height&&card.y+card.height>b.y;
        for(const fan of state.fans){const body={x:layout.field.x+geometry.ox+fan.x*geometry.scale-25,y:layout.field.y+geometry.oy+fan.y*geometry.scale-45,width:50,height:80};assert(!intersects(body),'The card has a clear area away from the crowd');}
        for(const deck of await page.locator('[data-stage-deck]').all())assert(!intersects(await deck.boundingBox()),'The reveal never covers a deck');
      }
      if(['aim','shot'].includes(phase)){
        const marker=page.locator('[data-show-phase]');const x=Number(await marker.getAttribute('data-source-x'));const actorIndex=state.actors.findIndex(a=>a.id===state.events.filter(e=>e.type==='card').at(-1).actorId);
        assert.equal(x,115+actorIndex*670/3,'The shot starts at the active musician');
      }
      if(!captures.has(phase)){captures.add(phase);await page.screenshot({path:`test-results/v064-${phase}-${viewport.width}-${viewport.height}.png`});}
      if(state===late&&viewport.width===1440){await page.locator('.show-story>summary').click();assert.equal(await page.locator('.show-history-card').count(),state.events.filter(e=>e.type==='card').length);await page.locator('.show-history-card').first().click();assert(await page.locator('#dialog').evaluate(e=>e.open));await page.keyboard.press('Escape');assert.equal(await page.locator('#show-pause').textContent(),'▶ Reprendre');await page.locator('.show-story>summary').click();}
      if(state===selected[0])for(const deck of await page.locator('[data-stage-deck]').all())await deck.click({trial:true});
    }
    await page.screenshot({path:`test-results/v064-layout-${viewport.width}-${viewport.height}.png`});await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Show layout passed: cards have one fixed format, disappear before the musician aims/shoots, and leave the crowd clear; arena, title, gauges and controls fit six desktop/mobile viewports.');
}catch(e){console.error(e);if(page&&!page.isClosed()){await page.screenshot({path:'test-results/show-layout-failure.png'});console.log(await page.evaluate(()=>({card:document.querySelector('.hero-card')?.getBoundingClientRect().toJSON(),html:document.querySelector('.card-foreground')?.outerHTML})));}throw e;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
