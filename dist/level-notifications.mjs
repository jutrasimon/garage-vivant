import {characterPortrait,characterName} from './character-view.mjs?v=0.8.8';
import {escapeCard as esc} from './card-view.mjs?v=0.8.8';

// Presentation acknowledgements stay outside the saved game and never claim a reward.
export function createLevelNotifications({getWorld,getReducedEffects=()=>false,isShowVisible=()=>false}){
 const storageKey='garage-vivant-level-notices-v1';
 const panel=document.createElement('aside');panel.id='level-notification';panel.hidden=true;panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true');document.body.append(panel);
 let seed=getWorld().seed,dismissed=new Set(),currentId=null,signature='';
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.seed===seed&&Array.isArray(saved.dismissed))dismissed=new Set(saved.dismissed.filter(key=>typeof key==='string'));}catch{}
 const key=(person,reward)=>person.id+':'+reward.level;
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify({seed,dismissed:[...dismissed]}));}catch{}}
 function acknowledge(id){const person=getWorld().people.find(p=>p.id===id);for(const reward of person?.levelRewards||[])if(reward.status==='pending')dismissed.add(key(person,reward));persist();currentId=null;update();}
 function update(){
  const world=getWorld();if(world.seed!==seed){seed=world.seed;dismissed.clear();currentId=null;signature='';}
  // Finishing one act does not end its evening or close the show/result screen.
  if(world.showEventId||world.performance?.status==='playing'||isShowVisible()||document.querySelector('#dialog')?.open){panel.hidden=true;return;}
  const candidates=world.people.map(person=>({person,rewards:(person.levelRewards||[]).filter(r=>r.status==='pending'&&!dismissed.has(key(person,r)))})).filter(item=>item.rewards.length);
  const item=candidates.find(item=>item.person.id===currentId)||candidates[0];if(!item){panel.hidden=true;currentId=null;signature='';return;}
  const {person,rewards}=item,level=Math.max(...rewards.map(r=>r.level)),pending=person.levelRewards.filter(r=>r.status==='pending').length;
  currentId=person.id;panel.hidden=false;panel.classList.toggle('no-motion',getReducedEffects());
  const next=JSON.stringify([person.id,characterName(person),person.identity,person.color,level,pending,candidates.length]);if(signature===next)return;signature=next;
  panel.dataset.levelOwner=person.id;panel.dataset.level=level;
  panel.innerHTML=`<div class="level-notice-card"><button class="level-notice-close" data-dismiss-level-notice aria-label="Reporter la notification de ${esc(characterName(person))}">×</button><div class="level-notice-portrait">${characterPortrait(person,88)}<span aria-hidden="true">✦</span></div><div class="level-notice-content"><span class="level-notice-eyebrow">✦ NIVEAU SUPÉRIEUR !</span><h2>${esc(characterName(person))}</h2><strong class="level-notice-number">Niveau ${level}</strong><p>${pending} amélioration${pending>1?'s':''} de deck disponible${pending>1?'s':''}</p><div class="level-notice-actions"><button class="primary" data-open-level-rewards="${esc(person.id)}">Choisir l’amélioration →</button><button class="text-button" data-dismiss-level-notice>Plus tard</button></div>${candidates.length>1?`<small class="level-notice-queue">${candidates.length-1} autre${candidates.length>2?'s':''} musicien${candidates.length>2?'s':''} à améliorer</small>`:''}</div></div>`;
 }
 panel.addEventListener('click',event=>{if(event.target.closest('[data-dismiss-level-notice]'))acknowledge(currentId);});
 return {update,acknowledge,reset(){seed=getWorld().seed;dismissed.clear();currentId=null;signature='';persist();update();}};
}
