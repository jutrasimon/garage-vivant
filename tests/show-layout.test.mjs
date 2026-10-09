import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {createWorld,createGroup} from '../dist/engine.mjs';
import {createPerformance,advancePerformance,CARDS} from '../dist/stage.mjs';

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
  for(const delay of [0,35]){const state=structuredClone(show);advancePerformance(state,cue.tick+delay);state.presentationStarted=true;state.presentationPaused=true;samples.push(state);}
}
const late=structuredClone(show);advancePerformance(late,show.cues.at(-1).tick+150);late.presentationStarted=true;late.presentationPaused=true;samples.push(late);
const browser=await chromium.launch(),errors=[];
let page;
try{
  for(const viewport of [{width:1440,height:900},{width:1200,height:768},{width:900,height:850},{width:390,height:844},{width:390,height:667},{width:844,height:390}]){
    page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
    const selected=viewport.width===1440?samples:[...new Map(samples.map(s=>[CARDS[s.events.filter(e=>e.type==='card').at(-1).cardId].tag,s])).values(),late];
    let expected;await page.addInitScript(()=>{if(window.name){const save=JSON.parse(window.name);if(save.people)localStorage.setItem('garage-vivant-v1',JSON.stringify(save));}});await page.goto(url);
    for(const state of selected){
      const save={...structuredClone(world),performance:state};
      await page.evaluate(save=>window.name=JSON.stringify(save),save);
      await page.reload();await page.locator('.hero-card').waitFor();await page.waitForTimeout(80);
      assert.equal(await page.locator('.hero-card>strong').textContent(),CARDS[state.events.filter(e=>e.type==='card').at(-1).cardId].name);
      assert(await page.locator('.card-modifier').evaluate(e=>e.clientHeight>=18),'The modifier remains visible even when the illustration is hidden');
      const layout=await page.evaluate(()=>{
        const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
        return {arena:box('.stage-shell'),card:box('.hero-card'),dock:box('.card-foreground'),header:box('header'),field:box('.stage-field'),controls:['#show-status','#show-resources','#show-pause','#show-speed','#skip-show'].map(box),scroll:document.querySelector('#main').scrollHeight-document.querySelector('#main').clientHeight};
      });
      assert.equal(layout.scroll,0,'The show never needs an outside scroll');
      assert(layout.arena.width>=viewport.width-1&&layout.arena.height>=viewport.height-layout.header.height-1);
      for(const box of [...layout.controls,layout.card])assert(box.x>=layout.arena.x-1&&box.y>=layout.arena.y-1&&box.x+box.width<=layout.arena.x+layout.arena.width+1&&box.y+box.height<=layout.arena.y+layout.arena.height+1,'Every control and card stays inside the arena');
      assert(Math.abs(layout.card.width-layout.dock.width)<1&&Math.abs(layout.card.height-layout.dock.height)<1,'Card content cannot grow beyond its fixed format');
      expected??=layout.card;
      for(const key of ['x','y','width','height'])assert(Math.abs(layout.card[key]-expected[key])<1,'Every card kind and phase keeps the same '+key);
      for(const deck of await page.locator('[data-stage-deck]').all())await deck.click({trial:true});
    }
    await page.screenshot({path:`test-results/v063-layout-${viewport.width}-${viewport.height}.png`});await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Show layout passed: all card kinds, before/after impact and late resolution use one fixed format; arena, title, gauges and controls fit six desktop/mobile viewports.');
}catch(e){console.error(e);if(page&&!page.isClosed()){await page.screenshot({path:'test-results/show-layout-failure.png'});console.log(await page.evaluate(()=>({card:document.querySelector('.hero-card')?.getBoundingClientRect().toJSON(),html:document.querySelector('.card-foreground')?.outerHTML})));}throw e;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
