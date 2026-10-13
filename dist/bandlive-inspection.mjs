import {cardFace} from './card-view.mjs?v=0.8.3';
export function createBandLiveInspection({root,lookup,blocked}){
  const panel=document.createElement('aside');panel.id='bl-card-preview';panel.className='bl-inspection';panel.setAttribute('aria-label','Détails de la carte');panel.setAttribute('aria-live','polite');panel.hidden=true;
  panel.innerHTML='<div class="preview-caption">DÉTAIL DE LA CARTE</div><div class="preview-face"><div class="preview-head"><span class="preview-cost"></span><strong class="preview-title"></strong></div><div class="preview-art"></div><div class="preview-owner"></div><p class="preview-description"></p><div class="preview-target"></div></div><div class="preview-outcome" hidden><strong class="outcome-name"></strong><div class="outcome-main"></div><div class="outcome-meta"></div><div class="outcome-reaction"></div><div class="outcome-conquest"></div><div class="outcome-trigger"></div></div><div class="preview-targets"></div>';
  document.body.append(panel);let pinned=false,source=null,timer=null;
  function hide(){clearTimeout(timer);pinned=false;panel.hidden=true;source=null;root.querySelectorAll('.bl-inspecting').forEach(el=>el.classList.remove('bl-inspecting'));}
  function show(id,lock=false){
    clearTimeout(timer);if(blocked())return hide();const data=lookup(id);if(!data)return hide();const unchanged=source===id&&pinned===lock&&!panel.hidden;source=id;pinned=lock;
    const {card,owner,instrumentKey}=data;panel.hidden=false;
    const top=Math.max(96,(root.querySelector('.bl-viewport')?.getBoundingClientRect().top||84)+12);panel.style.top=top+'px';panel.style.maxHeight=Math.max(160,innerHeight-top-14)+'px';
    if(unchanged)return;
    panel.querySelector('.preview-face').innerHTML=cardFace({card,owner,instrument:instrumentKey});
    root.querySelectorAll('.bl-inspecting').forEach(el=>el.classList.remove('bl-inspecting'));root.querySelector('[data-bl-card="'+CSS.escape(id)+'"]')?.classList.add('bl-inspecting');
    if(!lock)panel.querySelector('.preview-outcome').hidden=true;
  }
  function hover(e){const card=e.target.closest('[data-bl-card]');if(card&&!pinned&&card.dataset.blCard!==source){clearTimeout(timer);timer=setTimeout(()=>show(card.dataset.blCard),100);}}
  root.addEventListener('pointerover',hover);root.addEventListener('focusin',e=>{const c=e.target.closest('[data-bl-card]');if(c&&!pinned)show(c.dataset.blCard);});
  root.addEventListener('pointerout',e=>{if(!pinned&&e.target.closest('[data-bl-card]')&&!e.relatedTarget?.closest?.('[data-bl-card]')){clearTimeout(timer);timer=setTimeout(hide,90);}});
  function outcome(value){const box=panel.querySelector('.preview-outcome');box.hidden=false;box.classList.toggle('invalid',!value.valid);for(const key of ['name','main','meta','reaction','conquest','trigger'])box.querySelector('.outcome-'+key).textContent=value[key]||'';}
  window.addEventListener('blur',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  return {show,pin:id=>show(id,true),hide,outcome,targets:panel.querySelector('.preview-targets'),panel};
}
