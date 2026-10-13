import {musicianDeck,definitionFor,specialChoices,INSTRUMENTS} from './bandlive-cards.mjs?v=0.8.0';
import {cardFace,escapeCard as esc} from './card-view.mjs?v=0.8.0';
import {personCard} from './person-card.mjs?v=0.8.0';
const selections=new Map();
export function rememberLevelChoice(owner,level,type,value){const key=owner+':'+level;selections.set(key,{...selections.get(key),[type]:value});}
export function showLevelRewards(world,show){
 return (world.showHistory.find(r=>r.id===show.id)?.individualXp||[]).flatMap(gain=>{
  const person=world.people.find(p=>p.id===gain.id);if(!person)return [];
  const levelRewards=(person.levelRewards||[]).filter(r=>r.status==='pending'&&r.level>gain.levelBefore&&r.level<=gain.levelAfter);
  return levelRewards.length?[{...person,levelRewards}]:[];
 });
}
export function claimLevelReward(world,{actorId,level,slot,kind}){
 const person=world.people.find(p=>p.id===actorId),reward=person?.levelRewards?.find(r=>r.level===level&&r.status==='pending');
 if(!reward||!Number.isInteger(slot)||slot<0||slot>4||!['special','new1','new2'].includes(kind))return {ok:false,message:'Choisis une récompense de niveau, une carte et sa remplaçante.'};
 if(world.performance?.status==='playing')return {ok:false,message:'Termine le show avant de choisir ta récompense.'};
 const deck=musicianDeck(person,reward.instrument),before=deck[slot];if(before===kind)return {ok:false,message:'Choisis une carte différente.'};
 deck[slot]=kind;person.bandLiveDecks??={};person.bandLiveDecks[reward.instrument]=deck;
 Object.assign(reward,{status:'claimed',slot,before,after:kind});selections.delete(actorId+':'+level);
 return {ok:true,instrument:reward.instrument,before,after:kind,message:`${person.name} · niveau ${level} : ${definitionFor(reward.instrument,before).name} est remplacée par ${definitionFor(reward.instrument,kind).name}. Deck mis à jour pour les prochains shows.`};
}
export function levelRewardsHTML(person,{limit=Infinity}={}){
 const pending=(person.levelRewards||[]).filter(r=>r.status==='pending');if(!pending.length)return '';
 return `<section class="level-rewards"><h3>✦ ${pending.length} récompense${pending.length>1?'s':''} de niveau</h3>${pending.slice(0,limit).map((r,index)=>`<details class="level-reward" data-level-reward data-key="level-${esc(person.id)}-${r.level}" data-level-owner="${esc(person.id)}" data-level-number="${r.level}" ${index===0?'open':''}><summary>Niveau ${r.level} · ${INSTRUMENTS[r.instrument]}</summary>${personCard(person,{interactive:false})}<p>Remplace une carte. Le deck reste à cinq cartes.</p><div class="level-card-grid">${musicianDeck(person,r.instrument).map((kind,i)=>`<label><input type="radio" name="level-slot-${esc(person.id)}-${r.level}" value="${i}" ${selections.get(person.id+':'+r.level)?.slot===String(i)?'checked':''}>${cardFace({card:definitionFor(r.instrument,kind),owner:person.name,instrument:r.instrument})}</label>`).join('')}</div><p>Choisis la spéciale à obtenir</p><div class="level-card-grid">${specialChoices(r.instrument).map(c=>`<label><input type="radio" name="level-kind-${esc(person.id)}-${r.level}" value="${c.kind}" ${selections.get(person.id+':'+r.level)?.kind===c.kind?'checked':''}>${cardFace({card:c,owner:person.name,instrument:r.instrument})}</label>`).join('')}</div><button class="primary" data-level-claim="${esc(person.id)}" data-level-number="${r.level}">Confirmer l’amélioration</button><small class="level-reward-status" role="status"></small></details>`).join('')}</section>`;
}
