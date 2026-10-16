import {conquestPreviewHTML,updateConquestPreview} from './bandlive-conquest-preview.mjs?v=0.9.0';
// Screen-space ellipses keep the whole visible effect clear, regardless of scene scale.
export function placeDragFeedback({pointer,width,height,bounds,target,preferredSide,zones=[]}) {
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const clear=target||{left:pointer.x-12,right:pointer.x+12,top:pointer.y-12,bottom:pointer.y+12};
  const area=zones.reduce((r,z)=>({left:Math.min(r.left,z.cx-z.rx),right:Math.max(r.right,z.cx+z.rx),top:Math.min(r.top,z.cy-z.ry),bottom:Math.max(r.bottom,z.cy+z.ry)}),{left:clear.left,right:clear.right,top:clear.top,bottom:clear.bottom});
  const candidates=[
    [Math.max(pointer.x+24,area.right+12),pointer.y-height/2,'right'],
    [Math.min(pointer.x-width-24,area.left-width-12),pointer.y-height/2,'left'],
    [pointer.x-width/2,area.top-height-12,'above'],
    [pointer.x-width/2,area.bottom+12,'below'],
    ...(zones.length?[[bounds.left,bounds.top,'top-left'],[bounds.right-width,bounds.top,'top-right'],[bounds.left,bounds.bottom-height,'bottom-left'],[bounds.right-width,bounds.bottom-height,'bottom-right']]:[]),
  ].map(([x,y,side])=>({x:clamp(x,bounds.left,Math.max(bounds.left,bounds.right-width)),y:clamp(y,bounds.top,Math.max(bounds.top,bounds.bottom-height)),side}));
  const score=p=>{const {x,y,side}=p;
    p.targetOverlap=Math.max(0,Math.min(x+width,clear.right)-Math.max(x,clear.left))*Math.max(0,Math.min(y+height,clear.bottom)-Math.max(y,clear.top));
    p.zoneOverlap=zones.reduce((sum,z)=>{
      const rx=z.rx+12,ry=z.ry+12,dx=(clamp(z.cx,x,x+width)-z.cx)/rx,dy=(clamp(z.cy,y,y+height)-z.cy)/ry,d=dx*dx+dy*dy;
      if(d>=1)return sum;
      const w=Math.max(0,Math.min(x+width,z.cx+rx)-Math.max(x,z.cx-rx)),h=Math.max(0,Math.min(y+height,z.cy+ry)-Math.max(y,z.cy-ry));
      return sum+w*h*(1-d);
    },0);
    const distance=Math.hypot(Math.max(x-pointer.x,0,pointer.x-x-width),Math.max(y-pointer.y,0,pointer.y-y-height));
    return (p.targetOverlap?1e12+p.targetOverlap*1e8:0)+(p.zoneOverlap?1e9+p.zoneOverlap*1e4:0)+distance+(['above','below'].includes(side)?120:0)+(preferredSide&&side!==preferredSide?1000:0);
  };
  return candidates.reduce((best,p)=>score(p)<score(best)?p:best);
}

export function fitFeedback(element,options){
  element.classList.remove('bl-radius-compact');element.style.maxHeight=Math.max(80,options.bounds.bottom-options.bounds.top)+'px';
  let placement={...options,width:element.offsetWidth,height:element.offsetHeight},position=placeDragFeedback(placement);
  if(options.zones?.length&&position.zoneOverlap>0){
    element.classList.add('bl-radius-compact');placement={...placement,width:element.offsetWidth,height:element.offsetHeight};position=placeDragFeedback(placement);
  }
  return {...placement,side:position.side,position};
}

export function moveDragFeedback(ghost,pointer) {
  if(!ghost?._placement||!pointer)return;
  const position=placeDragFeedback({...ghost._placement,pointer,preferredSide:ghost._placement.side});
  ghost._placement.side=position.side;
  if(ghost._position?.x!==position.x)ghost.style.setProperty('--ghost-x',position.x+'px');
  if(ghost._position?.y!==position.y)ghost.style.setProperty('--ghost-y',position.y+'px');
  ghost._position=position;
}

export function createDragFeedback({card,owner,icon,accent}) {
  const ghost=document.createElement('div');ghost.className='drag-card-feedback';
  ghost.classList.toggle('is-tempo',!!card.tempo);ghost.classList.toggle('is-tempo-only',!!card.tempo&&!Object.hasOwn(card,'power'));
  ghost.innerHTML='<div class="drag-feedback-surface"><div class="drag-feedback-head"><span class="drag-mini"><i></i><b></b></span><div><strong class="drag-card-title"></strong><span class="drag-card-owner"></span></div><span class="drag-head-spark" aria-hidden="true">✦</span></div><div class="drag-local-outcome" hidden><div class="drag-target-line"><strong class="drag-outcome-name"></strong><span class="drag-conquered" hidden>✦ CONQUIS</span></div><div class="drag-impact"><span class="drag-gain" hidden><b></b><span>♥</span></span><div class="drag-outcome-main"></div></div><div class="drag-outcome-meta"></div><div class="drag-fan-rules"><span class="drag-reaction"></span><span class="drag-conquest-rule"></span><b class="drag-trigger"></b></div><div class="drag-release"><span>↗</span> Relâche pour jouer</div></div></div>';
  ghost.style.setProperty('--drag-accent',accent);
  ghost.querySelector('.drag-outcome-meta').insertAdjacentHTML('beforebegin',conquestPreviewHTML);
  ghost.querySelector('.drag-mini i').textContent=icon;
  ghost.querySelector('.drag-mini b').textContent=card.cost;
  ghost.querySelector('.drag-card-title').textContent=card.name;
  ghost.querySelector('.drag-card-owner').textContent=owner;
  return ghost;
}

export function showDragFeedback(ghost,{outcome,pointer,target,bounds,zones=[]}) {
  ghost.classList.toggle('has-target',!!target);ghost.classList.toggle('invalid',!outcome.valid);
  const local=ghost.querySelector('.drag-local-outcome');local.hidden=false;
  const hasGain=outcome.valid&&Number.isFinite(outcome.gain);
  const gain=ghost.querySelector('.drag-gain');gain.hidden=!hasGain;
  gain.querySelector('b').textContent=hasGain?'+'+outcome.gain:'';
  ghost.querySelector('.drag-impact').classList.toggle('with-gain',hasGain);
  ghost.querySelector('.drag-conquered').hidden=!outcome.conquered||!outcome.valid;
  ghost.querySelector('.drag-outcome-name').textContent=outcome.name;
  ghost.querySelector('.drag-outcome-main').textContent=hasGain?outcome.meter:outcome.main;
  ghost.querySelector('.drag-outcome-meta').textContent=outcome.meta;
  for(const [selector,key] of [['.drag-reaction','reaction'],['.drag-conquest-rule','conquest'],['.drag-trigger','trigger']])ghost.querySelector(selector).textContent=outcome[key]||'';
  const conquest=outcome.valid?outcome.conquestReady:null;
  updateConquestPreview(ghost.querySelector('.bl-conquest-preview'),conquest,outcome.valid?outcome.conquestPending:null);
  ghost.classList.toggle('has-conquest-effect',!!conquest);
  ghost.querySelector('.drag-conquest-rule').hidden=!!conquest;
  const key=target?outcome.name+'|'+outcome.main+'|'+outcome.valid:'';
  if(key&&ghost._feedbackKey!==key&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    ghost.querySelector('.drag-impact').animate?.([{transform:'translateY(3px) scale(.93)',opacity:.65},{transform:'translateY(-1px) scale(1.045)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:280,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  ghost._feedbackKey=key;
  // Measure after content changes, then move using cached geometry only.
  ghost._placement=fitFeedback(ghost,{pointer,bounds,target,zones,preferredSide:ghost._placement?.side});
  moveDragFeedback(ghost,pointer);
}
