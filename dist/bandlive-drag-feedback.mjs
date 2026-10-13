const gap=12;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const area=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));

// Screen-space feedback only: these rectangles never enter scene physics.
export function placeDragFeedback({pointer,width,height,bounds,target,obstacles=[]}) {
  const maxX=Math.max(bounds.left,bounds.right-width),maxY=Math.max(bounds.top,bounds.bottom-height);
  const clear=target||{left:pointer.x-8,right:pointer.x+8,top:pointer.y-8,bottom:pointer.y+8};
  const candidates=[];
  const add=(x,y)=>candidates.push({left:clamp(x,bounds.left,maxX),top:clamp(y,bounds.top,maxY)});
  add(pointer.x+22,pointer.y-26);add(pointer.x-width-22,pointer.y-26);
  add(pointer.x-width/2,pointer.y-height-22);add(pointer.x-width/2,pointer.y+22);
  for(const rect of [clear,...obstacles]){
    for(const y of [pointer.y-height/2,rect.top,rect.bottom-height]){
      add(rect.right+gap,y);add(rect.left-width-gap,y);
    }
    for(const x of [pointer.x-width/2,rect.left,rect.right-width]){
      add(x,rect.top-height-gap);add(x,rect.bottom+gap);
    }
  }
  let best=null,bestScore=Infinity;
  for(const candidate of candidates){
    const box={...candidate,right:candidate.left+width,bottom:candidate.top+height};
    // Protect the hovered character before choosing the nearest free space.
    const targetOverlap=area(box,clear);
    const distance=Math.hypot(Math.max(box.left-pointer.x,0,pointer.x-box.right),Math.max(box.top-pointer.y,0,pointer.y-box.bottom));
    const overlaps=obstacles.reduce((sum,rect)=>sum+area(box,rect),0);
    const score=(targetOverlap?1e9+targetOverlap*1e5:0)+overlaps*20+Math.max(0,distance-80)*8000+distance+Math.hypot(box.left-pointer.x-22,box.top-pointer.y+26)*.025;
    if(score<bestScore){best=box;bestScore=score;}
  }
  return {x:best.left,y:best.top};
}

export function createDragFeedback({card,owner,icon,accent}) {
  const ghost=document.createElement('div');ghost.className='drag-card-feedback';
  ghost.innerHTML='<div class="drag-feedback-surface"><div class="drag-feedback-head"><span class="drag-mini"><i></i><b></b></span><div><strong class="drag-card-title"></strong><span class="drag-card-owner"></span></div><span class="drag-head-spark" aria-hidden="true">✦</span></div><div class="drag-local-outcome" hidden><div class="drag-target-line"><strong class="drag-outcome-name"></strong><span class="drag-conquered" hidden>✦ CONQUIS</span></div><div class="drag-impact"><span class="drag-gain" hidden><b></b><span>♥</span></span><div class="drag-outcome-main"></div></div><div class="drag-outcome-meta"></div><div class="drag-fan-rules"><span class="drag-reaction"></span><span class="drag-conquest-rule"></span><b class="drag-trigger"></b></div><div class="drag-release"><span>↗</span> Relâche pour jouer</div></div></div>';
  ghost.style.setProperty('--drag-accent',accent);
  ghost.querySelector('.drag-mini i').textContent=icon;
  ghost.querySelector('.drag-mini b').textContent=card.cost;
  ghost.querySelector('.drag-card-title').textContent=card.name;
  ghost.querySelector('.drag-card-owner').textContent=owner;
  return ghost;
}

export function showDragFeedback(ghost,{outcome,pointer,target,obstacles,bounds}) {
  ghost.classList.toggle('has-target',!!target);ghost.classList.toggle('invalid',!outcome.valid);
  const local=ghost.querySelector('.drag-local-outcome');local.hidden=!target;
  const hasGain=outcome.valid&&Number.isFinite(outcome.gain);
  const gain=ghost.querySelector('.drag-gain');gain.hidden=!hasGain;
  gain.querySelector('b').textContent=hasGain?'+'+outcome.gain:'';
  ghost.querySelector('.drag-impact').classList.toggle('with-gain',hasGain);
  ghost.querySelector('.drag-conquered').hidden=!outcome.conquered||!outcome.valid;
  ghost.querySelector('.drag-outcome-name').textContent=outcome.name;
  ghost.querySelector('.drag-outcome-main').textContent=hasGain?outcome.meter:outcome.main;
  ghost.querySelector('.drag-outcome-meta').textContent=outcome.meta;
  for(const [selector,key] of [['.drag-reaction','reaction'],['.drag-conquest-rule','conquest'],['.drag-trigger','trigger']])ghost.querySelector(selector).textContent=outcome[key]||'';
  const key=target?outcome.name+'|'+outcome.main+'|'+outcome.valid:'';
  if(key&&ghost._feedbackKey!==key&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    ghost.querySelector('.drag-impact').animate?.([{transform:'translateY(3px) scale(.93)',opacity:.65},{transform:'translateY(-1px) scale(1.045)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:280,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  ghost._feedbackKey=key;
  const width=ghost.offsetWidth,height=ghost.offsetHeight;
  // Hold the chosen position while aiming at one stable character hitbox.
  // Moving to another target, scrolling or resizing chooses a new placement.
  const placementKey=target?JSON.stringify([outcome.name,target.left,target.top,target.right,target.bottom,width,height,bounds]):null;
  if(!target||ghost._placementKey!==placementKey){
    const position=placeDragFeedback({pointer,width,height,bounds,target,obstacles});
    ghost.style.setProperty('--ghost-x',position.x+'px');ghost.style.setProperty('--ghost-y',position.y+'px');
  }
  ghost._placementKey=placementKey;
}
