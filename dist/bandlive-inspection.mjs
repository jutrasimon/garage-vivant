import {cardFace} from './card-view.mjs?v=0.9.0';
import {createDragFeedback,updateDragFeedback,fitFeedback,moveDragFeedback} from './bandlive-drag-feedback.mjs?v=0.9.0';
export function createBandLiveInspection({root,lookup,blocked}){
  const panel=document.createElement('aside');panel.id='bl-card-preview';panel.className='bl-inspection';panel.setAttribute('aria-label','Détails de la carte');panel.setAttribute('aria-live','polite');panel.hidden=true;
  panel.innerHTML='<div class="preview-caption">DÉTAIL DE LA CARTE</div><div class="preview-face"></div><div class="preview-outcome" hidden></div><div class="preview-targets"></div>';
  document.body.append(panel);let pinned=false,source=null,timer=null;
  function hide(){clearTimeout(timer);pinned=false;panel.hidden=true;source=null;panel._placement=null;panel.classList.remove('bl-radius-compact','bl-effect-preview','drag-card-feedback');panel.style.removeProperty('left');panel.style.removeProperty('right');root.querySelectorAll('.bl-inspecting').forEach(el=>el.classList.remove('bl-inspecting'));}
  function show(id,lock=false){
    clearTimeout(timer);if(blocked())return hide();const data=lookup(id);if(!data)return hide();const unchanged=source===id&&pinned===lock&&!panel.hidden;source=id;pinned=lock;
    const {card,owner,instrumentKey,icon='♫',accent='#b6e8cf'}=data;panel.hidden=false;
    if(unchanged)return;
    const top=Math.max(96,(root.querySelector('.bl-viewport')?.getBoundingClientRect().top||84)+12);panel.style.top=top+'px';panel.style.maxHeight=Math.max(160,innerHeight-top-14)+'px';
    panel._placement=null;panel.style.removeProperty('left');panel.style.removeProperty('right');panel.classList.remove('bl-radius-compact','bl-effect-preview','drag-card-feedback');
    panel.querySelector('.preview-face').innerHTML=cardFace({card,owner,instrument:instrumentKey});
    panel.querySelector('.bl-full-program')?.remove();if(card.summary){const full=document.createElement('p');full.className='bl-full-program';full.textContent=card.description;panel.querySelector('.preview-face').after(full);}
    root.querySelectorAll('.bl-inspecting').forEach(el=>el.classList.remove('bl-inspecting'));root.querySelector('[data-bl-card="'+CSS.escape(id)+'"]')?.classList.add('bl-inspecting');
    const box=panel.querySelector('.preview-outcome');box.hidden=true;
    if(lock){
      const feedback=createDragFeedback({card,owner,icon,accent});
      panel.style.setProperty('--drag-accent',accent);
      box.replaceChildren(...feedback.childNodes);panel.classList.add('bl-effect-preview','drag-card-feedback');panel.classList.toggle('is-tempo',feedback.classList.contains('is-tempo'));panel.classList.toggle('is-tempo-only',feedback.classList.contains('is-tempo-only'));
      box.querySelector('.drag-release').textContent='↗ Clique pour jouer';
      outcome({name:'Choisis ta cible',main:'Vise une cible pour voir les effets.',meta:card.description,valid:false});
    }
  }
  function hover(e){const card=e.target.closest('[data-bl-card]');if(card&&!pinned&&card.dataset.blCard!==source){clearTimeout(timer);timer=setTimeout(()=>show(card.dataset.blCard),100);}}
  root.addEventListener('pointerover',hover);root.addEventListener('focusin',e=>{const c=e.target.closest('[data-bl-card]');if(c&&!pinned)show(c.dataset.blCard);});
  root.addEventListener('pointerout',e=>{if(!pinned&&e.target.closest('[data-bl-card]')&&!e.relatedTarget?.closest?.('[data-bl-card]')){clearTimeout(timer);timer=setTimeout(hide,90);}});
  panel.addEventListener('pointerenter',()=>clearTimeout(timer));panel.addEventListener('pointerleave',()=>{if(!pinned)timer=setTimeout(hide,90);});
  function outcome(value){panel.querySelector('.preview-outcome').hidden=false;updateDragFeedback(panel,value,value.name!=='Choisis ta cible');}
  function place(options){if(panel.hidden)return;panel._placement=fitFeedback(panel,{...options,preferredSide:panel._placement?.side});panel.style.left='var(--ghost-x)';panel.style.right='auto';panel.style.top='var(--ghost-y)';moveDragFeedback(panel,options.pointer);}
  window.addEventListener('blur',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  return {show,pin:id=>show(id,true),hide,outcome,place,move:pointer=>moveDragFeedback(panel,pointer),targets:panel.querySelector('.preview-targets'),panel};
}
