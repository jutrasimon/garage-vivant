import {audienceColumns} from './bandlive.mjs?v=0.8.10';
import {fanGeometry} from './bandlive-hand-geometry.mjs?v=0.8.10';
import {stageLayout,FAN_BODY,ACTOR_BODY,clampSlot,defaultFanPosition,settlePlacement} from './bandlive-layout.mjs?v=0.8.10';

export function createBandLiveStage({root,getReducedEffects}){
  let host=null,game=null,renderer=null,loading=null,editing=false,held=null,history=[],prefs={},bodies=[],geometry=null;
  const key='garage-vivant-bandlive-disposition-v1';
  try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object')prefs=value;}catch{}
  const valid=(n,f)=>Number.isFinite(n)?n:f;
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}};
  const signature=()=> 'scene-v2/'+game.actors.map(a=>a.id+':'+a.instrument).join('|')+'/'+game.fans.length+'/'+audienceColumns(game);
  const config=()=>{const id=signature();let c=prefs[id];if(!c||typeof c!=='object'||Array.isArray(c))c=prefs[id]={};for(const key of ['actors','fans','hands'])if(!c[key]||typeof c[key]!=='object'||Array.isArray(c[key]))c[key]={};return c;};
  function save(){const c=config();for(const b of bodies){if(b.type==='fan')c.fans[b.id]={dx:b.x-(b.slot.left+b.slot.right)/2,dy:b.y-(b.slot.top+b.slot.bottom)/2};else if(b.type==='actor')c.actors[b.id]={dx:b.x-b.initial.x,dy:b.y-b.initial.y};else c.hands[b.id]={...c.hands[b.id],dx:b.x-b.initial.x,dy:b.y-b.initial.y};}persist();}
  function apply(){
    if(!host)return;
    for(const b of bodies){
      if(b.type==='fan'){b.element.style.left=b.x-b.slot.left-b.w/2+'px';b.element.style.top=b.y-b.slot.top-b.h/2+'px';}
      else{b.element.style.left=b.x+'px';b.element.style.top=b.y-b.h/2+'px';}
    }
    renderer?.attach(host,game);
  }
  function fit(){
    if(!host)return;const viewport=host.parentElement,screen=host.closest('.bl-show-screen'),rows=Math.ceil(game.fans.length/audienceColumns(game)),stageHeight=480+Math.floor((game.actors.length-1)/6)*300,height=stageHeight+rows*136;
    const main=screen?.closest('main'),screenHeight=Math.max(470,innerHeight-Math.max(0,main?.getBoundingClientRect().top||0));
    if(screen)screen.style.height=screenHeight+'px';
    const footer=screen?parseFloat(getComputedStyle(screen).getPropertyValue('--bl-footer-height'))||94:94;
    const available=Math.max(260,screenHeight-(screen?.querySelector('.bl-hud')?.offsetHeight||86)-footer),width=1120;
    let playWidth=viewport.clientWidth,scale=Math.min(1,available/height,Math.max(740,playWidth-32)/width);
    host.querySelector('.bl-audience-viewport').style.top=stageHeight+'px';host.querySelector('.bl-musicians').style.height=stageHeight+'px';host.dataset.scale=scale;host.style.transform=`scale(${scale})`;host.style.transformOrigin='top left';
    host.dataset.playWidth=playWidth;host.style.width=width+'px';host.style.minWidth='0';host.style.height=height+'px';host.style.left=Math.max(0,(playWidth-width*scale)/2)+'px';viewport.style.height=available+'px';
  }
  function layout(){
    fit();
    if(!host||!host.isConnected||!game)return;
    const width=host.clientWidth,height=host.clientHeight,compact=width>host.parentElement.clientWidth+2;
    geometry=stageLayout(width,game.actors.length,game.fans.length,audienceColumns(game),compact);
    const c=config();c.actors??={};c.fans??={};c.hands??={};bodies=[];
    for(const [i,a] of game.actors.entries()){
      const section=host.querySelector('[data-bl-musician="'+CSS.escape(a.id)+'"]'),info=section.querySelector('[data-bl-actor]'),hand=section.querySelector('.bl-hand');
      const initial=geometry.actors[i],p=c.actors[a.id]||{},body={id:a.id,type:'actor',element:info,...ACTOR_BODY,initial,x:initial.x+valid(p.dx,0),y:initial.y+valid(p.dy,0)};
      body.slot={left:geometry.stage.left,right:geometry.stage.right,top:geometry.stage.top-40,bottom:geometry.stage.bottom+30};clampSlot(body,body.slot);bodies.push(body);
      if(hand){
        // Preserve readable default hands when the room shrinks to fit its crowd.
        // An explicitly tuned hand keeps the player's chosen scale.
        const defaultScale=Math.min(1.25,Math.max(1,104/(132*Number(host.dataset.scale))));
        const h=c.hands[a.id]||{},cards=[...hand.querySelectorAll('[data-bl-card]')],scale=Math.max(.55,Math.min(1.65,valid(h.scale,defaultScale))),fan=Math.max(0,Math.min(60,valid(h.fan,26)));
        const g=fanGeometry({count:cards.length,scale,fan});hand.style.width=g.width+'px';hand.style.height=g.height+'px';hand.style.setProperty('--bl-pack-scale',scale);
        cards.forEach((el,j)=>{const p=g.cards[j];el.style.left=p.left+'px';el.style.top=p.top+'px';el.style.width=g.cardW+'px';el.style.height=g.cardH+'px';el.style.setProperty('--bl-card-angle',p.angle+'deg');});
        // The lower part of each instrument extends below the musician's body.
        const initial={x:geometry.actors[i].x,y:geometry.actors[i].y+100+g.height/2};
        bodies.push({id:a.id,type:'cards',element:hand,w:g.width,h:g.height,initial,x:initial.x+valid(h.dx,0),y:initial.y+valid(h.dy,0)});
      }
    }
    const fans=host.querySelector('.bl-fans');fans.style.height=geometry.crowdHeight+'px';
    for(const [i,f] of game.fans.entries()){
      const element=host.querySelector('[data-bl-fan="'+CSS.escape(f.id)+'"]'),wrap=element.closest('.bl-fan-wrap'),slot=geometry.slots[i],p=c.fans[f.id]||{},initial=defaultFanPosition(slot,i);
      wrap.style.cssText=`left:${slot.left}px;top:${slot.top}px;width:${slot.right-slot.left}px;height:${slot.bottom-slot.top}px`;
      wrap.dataset.blSlot=`R${Math.floor(i/audienceColumns(game))+1} · ${i%audienceColumns(game)+1}`;
      const body={id:f.id,type:'fan',element,...FAN_BODY,slot,x:valid(p.dx,null)===null?initial.x:(slot.left+slot.right)/2+p.dx,y:valid(p.dy,null)===null?initial.y:(slot.top+slot.bottom)/2+p.dy};clampSlot(body,slot);bodies.push(body);
    }
    // The protected fan rectangles cannot meet across slot boundaries.
    const actors=bodies.filter(b=>b.type==='actor');settlePlacement(actors,null,width,height);
    apply();host.classList.toggle('bl-layout-editing',editing);
  }
  function mount(next,state){
    game=state;host=next;
    if(!host){renderer?.pause();return;}
    fit();layout();
    if(!renderer&&!loading){loading=import('./bandlive-minuit-renderer.mjs?v=0.8.10').then(m=>{renderer=m.createMinuitRenderer({getReducedEffects});renderer.attach(host,game);}).catch(()=>{host?.classList.add('bl-render-fallback');}).finally(()=>loading=null);}
    const button=root.querySelector('#bl-layout');if(button){button.setAttribute('aria-pressed',editing);button.textContent=editing?'✓ Terminer la disposition':'✥ Disposition';}
    const tools=root.querySelector('.bl-layout-tools');if(tools)tools.hidden=!editing;
  }
  function finish(){if(!held)return;const h=held;held=null;if(h.target.hasPointerCapture?.(h.pointer))h.target.releasePointerCapture(h.pointer);save();}
  root.addEventListener('pointerdown',e=>{
    if(!editing||e.button!==0||!host)return;
    const target=e.target.closest('[data-bl-actor],[data-bl-fan],.bl-hand');if(!target||!host.contains(target))return;
    const b=bodies.find(b=>b.element===target);if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();history.push(JSON.stringify(prefs));history=history.slice(-20);
    held={body:b,target,pointer:e.pointerId,x:e.clientX,y:e.clientY,startX:b.x,startY:b.y};target.setPointerCapture(e.pointerId);
  },true);
  root.addEventListener('pointermove',e=>{if(!held||held.pointer!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();const b=held.body;b.x=held.startX+(e.clientX-held.x)/(Number(host.dataset.scale)||1);b.y=held.startY+(e.clientY-held.y)/(Number(host.dataset.scale)||1);
    if(b.slot)clampSlot(b,b.slot);if(b.type==='cards')settlePlacement(bodies,b,host.clientWidth,host.clientHeight);else if(b.type==='actor')settlePlacement(bodies.filter(x=>x.type==='actor'),b,host.clientWidth,host.clientHeight);apply();},true);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(type,e=>{if(held&&e.pointerId===held.pointer){e.stopImmediatePropagation();finish();}},true);
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&editing){finish();editing=false;host?.classList.remove('bl-layout-editing');mount(host,game);}});
  const observer=new ResizeObserver(()=>layout());observer.observe(root);
  return {mount,leave(){finish();renderer?.pause();},get editing(){return editing;},toggle(){finish();editing=!editing;mount(host,game);},
    undo(){finish();if(history.length){prefs=JSON.parse(history.pop());persist();layout();}},reset(){finish();history.push(JSON.stringify(prefs));delete prefs[signature()];persist();layout();},
    tune(actorId,value){if(!game)return;const c=config();c.hands[actorId]={...c.hands[actorId],...value};persist();layout();},
    settings(actorId){return game?(config().hands?.[actorId]||{scale:1,fan:26}):{scale:1,fan:26};},
    resize:layout};
}
