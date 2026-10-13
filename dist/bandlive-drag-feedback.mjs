// One fixed side panel leaves the entire target area visible.
export function placeDragFeedback({width,bounds}) {
  return {x:Math.max(bounds.left,bounds.right-width),y:bounds.top};
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

export function showDragFeedback(ghost,{outcome,target,bounds}) {
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
  const key=target?outcome.name+'|'+outcome.main+'|'+outcome.valid:'';
  if(key&&ghost._feedbackKey!==key&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    ghost.querySelector('.drag-impact').animate?.([{transform:'translateY(3px) scale(.93)',opacity:.65},{transform:'translateY(-1px) scale(1.045)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:280,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  ghost._feedbackKey=key;
  ghost.style.maxHeight=Math.max(80,bounds.bottom-bounds.top)+'px';
  const width=ghost.offsetWidth;
  // Changing the hovered fan only updates content; the panel never follows it.
  const placementKey=JSON.stringify([width,bounds]);
  if(ghost._placementKey!==placementKey){
    const position=placeDragFeedback({width,bounds});
    ghost.style.setProperty('--ghost-x',position.x+'px');ghost.style.setProperty('--ghost-y',position.y+'px');
  }
  ghost._placementKey=placementKey;
}
