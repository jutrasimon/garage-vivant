import {audienceColumns} from './bandlive.mjs?v=0.9.0';
import {fanGeometry,spaceHandPacks} from './bandlive-hand-geometry.mjs?v=0.9.0';
import {stageLayout,FAN_BODY,ACTOR_BODY,clampSlot,defaultFanPosition,settlePlacement} from './bandlive-layout.mjs?v=0.9.0';
import {layoutSizes,layoutMetrics} from './bandlive-layout-profile.mjs?v=0.9.0';
import {RELEASE_VERSION} from './release.mjs?v=0.9.0';
import {initializeCrowd,physicsSettings,moveSpectator,separateCrowd} from './bandlive-crowd.mjs?v=0.9.0';

export function createBandLiveStage({root,getReducedEffects,onLayout=()=>{},onPositions=()=>{}}){
  let actorPage=0,host=null,game=null,renderer=null,loading=null,layoutFrame=null,editing=false,held=null,history=[],prefs={},bodies=[],geometry=null,metrics=null,editSnapshot=null;
  const key='garage-vivant-bandlive-disposition-v1';
  const visibleActors=()=>game?.spatialVersion?game.actors.slice(actorPage*6,actorPage*6+6):game?.actors||[];
  try{const value=JSON.parse(localStorage.getItem(key)||'{}');if(value&&typeof value==='object')prefs=value;}catch{}
  const valid=(n,f)=>Number.isFinite(n)?n:f;
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}};
  const signature=()=> (game.spatialVersion?'scene-v3/':'scene-v2/')+game.actors.map(a=>a.id+':'+a.instrument).join('|')+'/'+game.fans.length+'/'+audienceColumns(game);
  const config=()=>{const id=signature();let c=prefs[id];if(!c||typeof c!=='object'||Array.isArray(c)){const previous=game.spatialVersion?prefs[id.replace('scene-v3/','scene-v2/')]:null;c=prefs[id]=previous&&typeof previous==='object'?{actors:structuredClone(previous.actors||{}),hands:structuredClone(previous.hands||{}),sizes:layoutSizes(previous.sizes)}:{};}for(const key of ['actors','fans','hands'])if(!c[key]||typeof c[key]!=='object'||Array.isArray(c[key]))c[key]={};return c;};
  const sizes=()=>layoutSizes(game?config().sizes:{});
  const defaultHandScale=()=>game?.spatialVersion?Math.min(1.4,Math.max(.85,104/(132*Number(host?.dataset.scale||1)))):Math.min(1.25,Math.max(1,104/(132*Number(host?.dataset.scale||1))));
  const capture=()=>JSON.stringify({prefs,positions:game?.spatialVersion?game.fans.map(f=>({id:f.id,position:f.position})):null,physics:game?.physics,radius:game?.room?.radiusUnit});
  function beginEdit(){if(editSnapshot===null)editSnapshot=capture();}
  function commitEdit(){if(editSnapshot!==null&&editSnapshot!==capture()){history.push(editSnapshot);history=history.slice(-20);}editSnapshot=null;persist();}
  function save(){const c=config();for(const b of bodies){if(b.type==='fan')c.fans[b.id]={dx:b.x-(b.slot.left+b.slot.right)/2,dy:b.y-(b.slot.top+b.slot.bottom)/2};else if(b.type==='actor')c.actors[b.id]={dx:b.x-b.initial.x,dy:b.y-b.initial.y};else c.hands[b.id]={...c.hands[b.id],dx:b.x-b.initial.x,dy:b.y-b.initial.y};}persist();}
  function apply(motion=false){
    if(!host)return;
    for(const b of bodies){
      if(b.type==='fan'){b.element.style.left=b.x-b.slot.left-FAN_BODY.w/2+'px';b.element.style.top=b.y-b.slot.top-FAN_BODY.h/2+'px';}
      else{b.element.style.left=b.x+'px';b.element.style.top=b.y-(b.type==='actor'?ACTOR_BODY.h:b.h)/2+'px';}
    }
    if(motion)renderer?.moveCrowd(bodies.filter(b=>b.type==='fan').map(b=>({id:b.id,x:b.x,y:b.y-(metrics.crowdPadding||0),angle:b.angle||0,lift:b.lift||0})));else renderer?.attach(host,game);
  }
  function scheduleLayout(){if(layoutFrame===null)layoutFrame=requestAnimationFrame(()=>{layoutFrame=null;layout();});}
  function fit(){
    if(!host||!game)return;
    const members=visibleActors(),c=config(),selected=new Set(game.hand),hands=members.map(a=>{const h=c.hands[a.id]||{};return fanGeometry({count:game.cards.filter(card=>card.actorId===a.id&&selected.has(card.id)).length,scale:valid(h.scale,1.25),fan:valid(h.fan,26)});});
    const size=sizes();metrics=layoutMetrics(members.length,size,Math.max(0,...hands.map(h=>h.height)));
    if(game.spatialVersion){metrics.crowdPadding=8+Math.max(0,56*(size.spectators-1));metrics.actorOffset+=50;metrics.clearance=Math.max(80,80*size.musicians*size.instruments);metrics.stageHeight=400+Math.max(0,metrics.clearance-80)+Math.max(0,...hands.map(h=>h.height-240))+Math.floor((members.length-1)/6)*metrics.rowStride;}
    const rowWidths=Array.from({length:Math.ceil(members.length/6)},(_,row)=>{const packs=hands.slice(row*6,row*6+6).filter(h=>h.cards.length);return packs.reduce((sum,h)=>sum+h.width,0)+Math.max(0,packs.length-1)*16+32;});
    const viewport=host.parentElement,screen=host.closest('.bl-show-screen'),rows=Math.ceil(game.fans.length/audienceColumns(game)),stageHeight=metrics.stageHeight,height=stageHeight+(game.spatialVersion?game.room.height+2*metrics.crowdPadding:rows*metrics.cellHeight);
    const main=screen?.closest('main'),screenHeight=Math.max(470,innerHeight-Math.max(0,main?.getBoundingClientRect().top||0));
    if(screen)screen.style.height=screenHeight+'px';
    const footer=screen?parseFloat(getComputedStyle(screen).getPropertyValue('--bl-footer-height'))||94:94;
    const available=Math.max(260,screenHeight-(screen?.querySelector('.bl-hud')?.offsetHeight||86)-footer),width=Math.max(1120,...rowWidths,Math.min(6,members.length)*ACTOR_BODY.w*size.musicians+(Math.min(6,members.length)-1)*8+192);
    let playWidth=viewport.clientWidth,scale=Math.min(1,available/height,Math.max(740,playWidth-32)/width);
    host.querySelector('.bl-audience-viewport').style.top=stageHeight+'px';host.querySelector('.bl-musicians').style.height=stageHeight+'px';host.dataset.scale=scale;host.style.transform=`scale(${scale})`;host.style.transformOrigin='top left';
    host.dataset.playWidth=playWidth;host.dataset.rowStride=metrics.rowStride;host.style.width=width+'px';host.style.minWidth='0';host.style.height=height+'px';host.style.left=Math.max(0,(playWidth-width*scale)/2)+'px';viewport.style.height=available+'px';
  }
  function layout(){
    fit();
    if(!host||!host.isConnected||!game)return;
    const width=host.clientWidth,height=host.clientHeight,compact=width>host.parentElement.clientWidth+2;
    geometry=stageLayout(width,visibleActors().length,game.fans.length,audienceColumns(game),compact,metrics);
    if(game.spatialVersion)geometry.crowdHeight=game.room.height+2*metrics.crowdPadding;
    const c=config();c.actors??={};c.fans??={};c.hands??={};bodies=[];
    const size=sizes();
    for(const a of game.actors)host.querySelector('[data-bl-musician="'+CSS.escape(a.id)+'"]').hidden=game.spatialVersion&&!visibleActors().includes(a);
    for(const [i,a] of visibleActors().entries()){
      const section=host.querySelector('[data-bl-musician="'+CSS.escape(a.id)+'"]'),info=section.querySelector('[data-bl-actor]'),hand=section.querySelector('.bl-hand');
      info.style.setProperty('--bl-person-scale',size.musicians);info.style.setProperty('--bl-instrument-scale',size.instruments);info.dataset.blInstrumentScale=size.musicians*size.instruments;
      const initial=geometry.actors[i],p=c.actors[a.id]||{},body={id:a.id,type:'actor',element:info,w:ACTOR_BODY.w*size.musicians,h:ACTOR_BODY.h*size.musicians,initial,x:initial.x+valid(p.dx,0),y:initial.y+valid(p.dy,0)};
      body.slot={left:geometry.stage.left,right:geometry.stage.right,top:geometry.stage.top-40,bottom:geometry.stage.bottom+30};clampSlot(body,body.slot);bodies.push(body);
      if(hand){
        // Preserve readable default hands when the room shrinks to fit its crowd.
        // An explicitly tuned hand keeps the player's chosen scale.
        const defaultScale=defaultHandScale();
        const h=c.hands[a.id]||{},cards=[...hand.querySelectorAll('[data-bl-card]')],scale=Math.max(.55,Math.min(1.65,valid(h.scale,defaultScale))),fan=Math.max(0,Math.min(60,valid(h.fan,26)));
        const g=fanGeometry({count:cards.length,scale,fan});hand.style.width=g.width+'px';hand.style.height=g.height+'px';hand.style.setProperty('--bl-pack-scale',scale);
        cards.forEach((el,j)=>{const p=g.cards[j];el.style.left=p.left+'px';el.style.top=p.top+'px';el.style.width=g.cardW+'px';el.style.height=g.cardH+'px';el.style.setProperty('--bl-card-angle',p.angle+'deg');});
        // The lower part of each instrument extends below the musician's body.
        const initial={x:geometry.actors[i].x,y:geometry.actors[i].y+metrics.clearance+g.height/2};
        bodies.push({id:a.id,type:'cards',element:hand,w:g.width,h:g.height,count:cards.length,row:Math.floor(i/6),initial,x:initial.x+valid(h.dx,0),y:initial.y+valid(h.dy,0)});
      }
    }
    for(let row=0;row<Math.ceil(game.actors.length/6);row++){
      const packs=bodies.filter(b=>b.type==='cards'&&b.count&&b.row===row);
      const positions=spaceHandPacks(packs.map(b=>({x:b.initial.x,w:b.w})),16,width-16);
      for(const [i,b] of packs.entries()){
        const dx=b.x-b.initial.x;
        b.initial.x=positions[i];b.x=positions[i]+dx;
      }
    }
    const fans=host.querySelector('.bl-fans');fans.style.height=geometry.crowdHeight+'px';
    for(const [i,f] of game.fans.entries()){
      const element=host.querySelector('[data-bl-fan="'+CSS.escape(f.id)+'"]'),wrap=element.closest('.bl-fan-wrap'),slot=game.spatialVersion?{left:0,right:width,top:0,bottom:geometry.crowdHeight}:geometry.slots[i],p=c.fans[f.id]||{},initial=game.spatialVersion?{x:f.position.x+(width-game.room.width)/2,y:f.position.y+metrics.crowdPadding}:defaultFanPosition(slot,i);
      wrap.style.cssText=`left:${slot.left}px;top:${slot.top}px;width:${slot.right-slot.left}px;height:${slot.bottom-slot.top}px`;
      wrap.dataset.blSlot=`R${Math.floor(i/audienceColumns(game))+1} · ${i%audienceColumns(game)+1}`;
      element.style.setProperty('--bl-person-scale',size.spectators);
      const body={id:f.id,type:'fan',element,w:FAN_BODY.w*size.spectators,h:FAN_BODY.h*size.spectators,slot,x:game.spatialVersion?initial.x:valid(p.dx,null)===null?initial.x:(slot.left+slot.right)/2+p.dx,y:game.spatialVersion?initial.y:valid(p.dy,null)===null?initial.y:(slot.top+slot.bottom)/2+p.dy};if(!game.spatialVersion)clampSlot(body,slot);bodies.push(body);
    }
    // The protected fan rectangles cannot meet across slot boundaries.
    const actors=bodies.filter(b=>b.type==='actor');settlePlacement(actors,null,width,height);
    apply();host.classList.toggle('bl-layout-editing',editing);onLayout();
  }
  function mount(next,state){
    if(game!==state){history=[];editSnapshot=null;if(actorPage*6>=(state?.actors.length||0))actorPage=0;}game=state;host=next;
    if(!host){renderer?.pause();return;}
    fit();layout();
    // Opening/restoring the view also compacts the outer navigation after mount.
    scheduleLayout();
    if(!renderer&&!loading){loading=import('./bandlive-minuit-renderer.mjs?v=0.9.0').then(m=>{renderer=m.createMinuitRenderer({getReducedEffects});renderer.attach(host,game);}).catch(()=>{host?.classList.add('bl-render-fallback');}).finally(()=>loading=null);}
    const button=root.querySelector('#bl-layout');if(button){button.setAttribute('aria-pressed',editing);button.textContent=editing?'✓ Terminer la disposition':'✥ Disposition';}
    const tools=root.querySelector('.bl-layout-tools');if(tools)tools.hidden=!editing;
  }
  function finish(){if(!held)return;const h=held;held=null;if(h.target.hasPointerCapture?.(h.pointer))h.target.releasePointerCapture(h.pointer);if(game.spatialVersion&&h.body.type==='fan'){for(const b of bodies.filter(b=>b.type==='fan'))moveSpectator(game,b.id,{x:b.x-(host.clientWidth-game.room.width)/2,y:b.y-metrics.crowdPadding});onPositions();}save();onLayout();}
  root.addEventListener('pointerdown',e=>{
    if(!editing||e.button!==0||!host)return;
    const target=e.target.closest('[data-bl-actor],[data-bl-fan],.bl-hand');if(!target||!host.contains(target))return;
    const b=bodies.find(b=>b.element===target);if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();commitEdit();history.push(capture());history=history.slice(-20);
    held={body:b,target,pointer:e.pointerId,x:e.clientX,y:e.clientY,startX:b.x,startY:b.y};target.setPointerCapture(e.pointerId);
  },true);
  root.addEventListener('pointermove',e=>{if(!held||held.pointer!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();const b=held.body;b.x=held.startX+(e.clientX-held.x)/(Number(host.dataset.scale)||1);b.y=held.startY+(e.clientY-held.y)/(Number(host.dataset.scale)||1);
    if(b.slot)clampSlot(b,b.slot);if(game.spatialVersion&&b.type==='fan'){moveSpectator(game,b.id,{x:b.x-(geometry.area-game.room.width)/2,y:b.y-metrics.crowdPadding});separateCrowd(game,b.id);for(const other of bodies.filter(x=>x.type==='fan')){const f=game.fans.find(f=>f.id===other.id);other.x=f.position.x+(geometry.area-game.room.width)/2;other.y=f.position.y+metrics.crowdPadding;}}if(b.type==='cards')settlePlacement(bodies,b,host.clientWidth,host.clientHeight);else if(b.type==='actor')settlePlacement(bodies.filter(x=>x.type==='actor'),b,host.clientWidth,host.clientHeight);apply();},true);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(type,e=>{if(held&&e.pointerId===held.pointer){e.stopImmediatePropagation();finish();}},true);
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&editing){finish();commitEdit();editing=false;host?.classList.remove('bl-layout-editing');mount(host,game);}});
  const observer=new ResizeObserver(scheduleLayout);observer.observe(root);
  const header=document.querySelector('body>header');if(header)observer.observe(header);
  return {mount,leave(){finish();commitEdit();renderer?.pause();},get editing(){return editing;},toggle(){finish();commitEdit();editing=!editing;mount(host,game);},
    undo(){finish();commitEdit();if(history.length){const previous=JSON.parse(history.pop());prefs=previous.prefs||previous;if(game.spatialVersion&&previous.positions){for(const f of previous.positions)moveSpectator(game,f.id,f.position);game.physics=previous.physics;game.room.radiusUnit=previous.radius;onPositions();}persist();layout();}},reset(){finish();commitEdit();history.push(capture());delete prefs[signature()];if(game.spatialVersion){const physics=game.physics,radius=game.room.radiusUnit;initializeCrowd(game);game.physics=physics;game.room.radiusUnit=radius;onPositions();}persist();layout();},
    tune(actorId,value){if(!game)return;beginEdit();const c=config();for(const id of actorId?[actorId]:game.actors.map(a=>a.id))c.hands[id]={...c.hands[id],...value};persist();layout();},
    tuneSizes(value){if(!game)return;beginEdit();config().sizes=layoutSizes({...sizes(),...value});persist();layout();},
    importProfile(profile){if(!profile||typeof profile!=='object'||Array.isArray(profile))throw Error('Disposition invalide.');history.push(capture());prefs[signature()]=structuredClone(profile);persist();layout();},
    get page(){return actorPage;},setPage(value){actorPage=Math.max(0,Math.min(Math.ceil(game.actors.length/6)-1,value));},
    commitEdit,sizeSettings:sizes,
    tunePhysics(value){beginEdit();game.physics=physicsSettings({...game.physics,...value});if(value.collisionRadius!==undefined){separateCrowd(game);layout();}onPositions();},
    tuneRadius(value){beginEdit();game.room.radiusUnit=Math.max(60,Math.min(240,value));onPositions();},
    point(clientX,clientY){if(!game?.spatialVersion||!host)return null;const r=host.querySelector('.bl-audience').getBoundingClientRect(),scale=Number(host.dataset.scale)||1;return {x:(clientX-r.left)/scale-(host.clientWidth-game.room.width)/2,y:(clientY-r.top)/scale-metrics.crowdPadding};},
    crowdPoint(position){return {x:position.x+(host.clientWidth-game.room.width)/2,y:metrics.stageHeight+metrics.crowdPadding+position.y};},
    showMotion(motions,progress){if(!host||!game?.spatialVersion||!motions?.length)return;const area=geometry.area,total=motions.reduce((n,m)=>n+m.frames.length,0);let offset=Math.min(total-1,Math.floor(progress*total)),chosen=motions[0];for(const m of motions){chosen=m;if(offset<m.frames.length)break;offset-=m.frames.length;}for(const p of chosen.frames[Math.max(0,Math.min(offset,chosen.frames.length-1))]){const b=bodies.find(b=>b.type==='fan'&&b.id===p.id);if(b){b.x=p.x+(area-game.room.width)/2;b.y=p.y+metrics.crowdPadding;b.angle=p.angle;b.lift=p.lift;b.element.style.setProperty('--bl-motion-angle',p.angle+'rad');b.element.style.setProperty('--bl-motion-lift',-p.lift+'px');}}apply(true);},
    settings(actorId){const hands=game?(actorId?[config().hands[actorId]||{}]:game.actors.map(a=>config().hands[a.id]||{})):[{}];return {scale:valid(hands[0].scale,defaultHandScale()),fan:valid(hands[0].fan,26),mixed:hands.some(h=>valid(h.scale,defaultHandScale())!==valid(hands[0].scale,defaultHandScale())||valid(h.fan,26)!==valid(hands[0].fan,26))};},
    exportCode({commit=true}={}){
      if(commit){finish();commitEdit();}if(!host||!game)return '';
      const body=(id,type)=>{const b=bodies.find(b=>b.id===id&&b.type===type);return b?{x:b.x,y:b.y,width:b.w,height:b.h}:null;};
      return JSON.stringify({
        format:'garage-vivant-bandlive-layout',version:game.spatialVersion?2:1,...(game.spatialVersion?{room:game.room,physics:game.physics}:{}),release:RELEASE_VERSION,signature:signature(),
        viewport:{width:innerWidth,height:innerHeight},scene:{width:host.clientWidth,height:host.clientHeight,scale:Number(host.dataset.scale),columns:audienceColumns(game),audienceTop:metrics.stageHeight,audiencePadding:metrics.crowdPadding||0,audienceRowHeight:metrics.cellHeight,rowStride:metrics.rowStride},
        profile:structuredClone(config()),sizes:sizes(),
        musicians:game.actors.map((a,index)=>({index,id:a.id,name:a.name,instrument:a.instrument,body:body(a.id,'actor'),hand:{...body(a.id,'cards'),scale:valid(config().hands[a.id]?.scale,defaultHandScale()),fan:valid(config().hands[a.id]?.fan,26)}})),
        spectators:game.fans.map((f,index)=>({index,id:f.id,...(game.spatialVersion?{position:{...f.position}}:{row:Math.floor(index/audienceColumns(game)),column:index%audienceColumns(game)}),...body(f.id,'fan')})),
      },null,2);
    },
    resize:layout};
}
