import {groupLinkHTML} from './group-link.mjs?v=0.8.10';
import {rule} from './design-rules.mjs?v=0.8.10';
import {decorateCube} from './character-view.mjs?v=0.8.10';
export {decorateCube} from './character-view.mjs?v=0.8.10';
import { membershipChance, membershipReason, attachment } from './groups.mjs?v=0.8.10';
import {drawShowStage} from './show-view.mjs?v=0.8.10';
export {bandsHTML,rapinHTML,showSetupHTML,showStatusHTML,seasonHTML} from './v6-view.mjs?v=0.8.10';
import {SKILLS,ACTIONS,EMOTIONS,stamp,round,clamp,groupsOf,compositionProject,scores} from './engine.mjs?v=0.8.10';
import {CARDS,CURSES,INTENTIONS,activeDeck,availableCards,SHOW_TICKS,PHRASE_TICKS} from './stage.mjs?v=0.8.10';
import {bandStage,nextCurse,eligibleSongs,availability,isArchivedSong,seasonSummary,acceptance} from './life.mjs?v=0.8.10';
import {resolveShowPlan} from './show-planning.mjs?v=0.8.10';
export const escapeHTML = x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const esc=escapeHTML;
const person=(s,id)=>s.people.find(p=>p.id===id);
const meter=(value,label)=>`<div class="v5-meter"><span>${label}</span><b>${round(value)}<small>/100</small></b><div class="bar"><i style="width:${clamp(value)}%"></i></div></div>`;
export function skillHTML(p) {
  return `<section data-stable="skills"><div class="section-head">COMPÉTENCES MUSICALES</div>${meter(p.skills[p.instrument],SKILLS[p.instrument])}${meter(p.skills.writing,'Composition')}<small class="muted">À 35 puis 60 de maîtrise, de nouvelles cartes instrumentales deviennent disponibles.</small></section>`;
}
export function quickHTML(s,p) {
  const booking=s.bookings.find(b=>['applied','booked','assembling','playing'].includes(b.status)&&b.members.includes(p.id));
  const queue=p.invitationQueue.map(inv=>{
    const req=s.groupState.requests.find(r=>r.id===inv.requestId),g=s.groups.find(g=>g.id===req?.groupId),song=s.songs.find(x=>x.id===req?.songId),status={pending:'En attente',accepted:'Acceptée',refused:'Déclinée',expired:'Expirée',cancelled:'Annulée'}[inv.status];
    return `<div class="queue-entry" data-key="${inv.id}">${groupLinkHTML(g)}<small>Chanson · « ${esc(song.title)} » · ${status} · échéance ${stamp(inv.expires)}</small><small>${inv.status==='pending'?'Examinée à la fin de l’activité actuelle, avant la prochaine pige.':esc(inv.reason)}${inv.chance!=null?' · chance '+round(inv.chance*100)+' %':''}</small></div>`;
  }).join('');
  return `<section class="quick-profile" data-stable="quick"><div class="player-row"><span class="pill ${s.playerId===p.id?'member':''}">${s.playerId===p.id?'Ton musicien':'Autonome'}</span>${s.playerId!==p.id?`<button class="text-button" data-avatar="${p.id}">Incarner ↗</button>`:''}</div><div class="quick-needs"><span>Énergie <b>${round(p.needs.energy)}</b></span><span>Déchéance <b>${round(p.decadence)}</b></span></div><div class="engagement-note">${booking?`Prochain engagement : ${esc([...s.season.opportunities,...(s.eventArchive||[])].find(o=>o.id===booking.opportunityId)?.name)} · ${stamp(booking.time)}`:'Aucun engagement. Choisis une occasion dans Shows.'}</div><div class="inline-actions">${groupsOf(s,p).map(g=>`<span>${groupLinkHTML(g)} · attachement ${round(attachment(s,p,g).value)}</span>`).join('')||'<span class="muted">Aucun groupe actif.</span>'}</div><details class="personal-queue" data-key="queue-${p.id}"><summary>Invitations · ${p.invitationQueue.filter(x=>x.status==='pending').length} en attente</summary><p class="muted">Cette file est indépendante du sac Rapin.</p>${queue||'<p class="muted">Aucune invitation récente.</p>'}</details><div class="quick-actions">${['relax','practice','write','social','jam','decadence'].map(key=>`<button data-force="${key}">${ACTIONS[key].icon} ${ACTIONS[key].label}</button>`).join('')}</div></section>`;
}
export function decadenceHTML(p,time=0) {
  const next=nextCurse(p),curses=activeDeck(p).filter(id=>CARDS[id].tag==='curse').map(id=>CARDS[id]);
  return `<section data-stable="decadence"><div class="section-head">DÉCHÉANCE <span>${curses.length} carte${curses.length>1?'s':''} maudite${curses.length>1?'s':''}</span></div>${meter(p.decadence,'Excès et fatigue accumulés')}<p class="muted">${next?`Prochain seuil : ${next.threshold} → ${next.name}.`:'Tous les seuils sont actifs.'} ${p.bag?.remaining.decadence||0} jetons dans le sac · ${p.bag?.consumed.decadence||0} en défausse · ${p.bag?.pendingRemoval.decadence||0} retraits en attente. Épisodes dans les 12 dernières heures : ${p.excessEpisodes.filter(t=>time-t<720).length}. Le repos et le soutien permettent de récupérer.</p>${curses.map(c=>`<div class="curse-note">${c.icon} <b>${c.name}</b> · ${c.description}</div>`).join('')}<details data-key="decadence-story"><summary>Évolution récente</summary>${p.decadenceHistory.length?p.decadenceHistory.map(e=>`<p class="muted">${stamp(e.time)} · ${e.amount>0?'+':''}${e.amount} · ${esc(e.reason)}</p>`).join(''):'<p class="muted">Les excès et les nuits sacrifiées augmentent cette jauge. Le succès seul ne la fait pas monter.</p>'}</details><button data-excess="${p.id}" class="text-button">Prolonger la fête · +18 déchéance</button></section>`;
}
export function cardsHTML(p) {
  return `<section data-stable="deck"><div class="section-head">SON DECK <button class="text-button" data-deck="${p.id}">Préparer ↗</button></div><p class="muted">${activeDeck(p).length} cartes actives · cinq pigées sans remise par show.</p><div class="deck-mini">${activeDeck(p).map(id=>{const c=CARDS[id];return `<span class="card-chip ${c.tag}" title="${esc(c.description)}">${c.icon} ${esc(c.name)}</span>`;}).join('')}</div></section>`;
}
export function deckEditorHTML(p) {
  return `<h2>Le deck de ${esc(p.name)}</h2><p>Choisis 8 à 10 cartes. L’instrument, la maîtrise et la personnalité ouvrent des options. La déchéance ajoute ses cartes maudites à ces cartes musicales.</p><div class="deck-choices">${availableCards(p).map(id=>{const c=CARDS[id];return `<label class="deck-choice ${c.tag}"><input name="deck-card" type="checkbox" value="${id}" ${p.deck.includes(id)?'checked':''}><span><b>${c.icon} ${esc(c.name)}</b><small>${esc(c.description)}</small></span></label>`;}).join('')}</div><p id="deck-count" class="muted"></p><button class="primary" data-save-deck="${p.id}">Enregistrer le deck</button>`;
}
export function invitationHTML(s,groupId=null){
 const host=person(s,s.playerId),g=groupId?s.groups.find(g=>g.id===groupId):null;
 return `<h2>${g?'Inviter dans '+groupLinkHTML(g):'Former un groupe avec '+esc(host.name)}</h2><p>Une proposition, puis une acceptation. Nouvelle formation : ${rule(s,'groups.membershipDelay')} min après une adhésion. Recrutement : seul le candidat attend ${rule(s,'groups.recruitmentDelay')} min. Une proposition par paire chaque ${rule(s,'groups.pairDelay')} min.</p><div class="invitation-list">${s.people.filter(p=>p!==host&&!g?.members.includes(p.id)).map(p=>{const key=[host.id,p.id].sort().join(':'),remaining=(s.groupState.proposals[key]??-1e9)+rule(s,'groups.pairDelay')-s.time,reason=membershipReason(s,host,p,g)||(remaining>0?'Nouvelle proposition dans '+round(remaining/60)+' h.':null);return `<div class="invitation-row"><span><b>${esc(p.name)}</b><small>${SKILLS[p.instrument]} · ${esc(p.genre)} · ${round(membershipChance(s,host,p,g)*100)} % d’acceptation</small>${reason?`<small>${esc(reason)}</small>`:''}</span><button data-invite="${p.id}:${groupId||''}" ${reason?'disabled':''}>Proposer</button></div>`;}).join('')}</div>`;
}


const box=(ctx,x,y,w,h,color,r=0)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
const text=(ctx,value,x,y,size=12,color='#d9e6d9')=>{ctx.font=`${size}px system-ui`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(value,x,y);};
export function drawStage(canvas,show,options={}) {return drawShowStage(canvas,show,options,decorateCube);}
let audioContext=null,lastSound=0;
export async function enableAudio() {try {audioContext ||= new (globalThis.AudioContext||globalThis.webkitAudioContext)();await audioContext.resume();return true;}catch{return false;}}
export function playSound(event,volume=.18) {
  if(!audioContext||audioContext.state!=='running')return;
  const now=audioContext.currentTime;
  if(!['impact','shot'].includes(event.type)&&now-lastSound<.065)return;lastSound=now;
  if(['impact','shot'].includes(event.type)){
    const shot=event.type==='shot',osc=audioContext.createOscillator(),gain=audioContext.createGain(),length=shot?.09:.24;
    osc.type=shot?'triangle':'sine';osc.frequency.setValueAtTime(shot?760:180,now);osc.frequency.exponentialRampToValueAtTime(shot?180:48,now+length);
    gain.gain.setValueAtTime(volume*(shot?.3:1.1),now);gain.gain.exponentialRampToValueAtTime(.001,now+length);osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+length+.01);
    if(!shot){
      const buffer=audioContext.createBuffer(1,Math.floor(audioContext.sampleRate*.1),audioContext.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=Math.sin(i*i*1.7)*(1-i/data.length);
      const burst=audioContext.createBufferSource(),envelope=audioContext.createGain(),filter=audioContext.createBiquadFilter();burst.buffer=buffer;filter.type='lowpass';filter.frequency.value=1800;
      envelope.gain.setValueAtTime(volume*.55,now);envelope.gain.exponentialRampToValueAtTime(.001,now+.1);burst.connect(filter);filter.connect(envelope);envelope.connect(audioContext.destination);burst.start(now);
    }
  }
  const c=CARDS[event.cardId],combo=event.combo?.some(x=>x.includes('déclenché'));
  const notes=combo?[262,330,392]:event.type==='reaction'?[660,880]:[({bass:110,drums:90,percussion:170,guitar:220,keys:330,voice:440,sax:294,trumpet:349})[event.instrument]||220];
  notes.forEach((base,i)=>{
    const start=now+i*.045,oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.connect(gain);gain.connect(audioContext.destination);
    oscillator.type=c?.tag==='curse'?'sawtooth':c?.tag==='rhythm'?'triangle':'sine';
    const frequency=c?.tag==='curse'?92:event.type==='card'?base*1.5:base;
    oscillator.frequency.setValueAtTime(frequency,start);oscillator.frequency.exponentialRampToValueAtTime(frequency*(event.type==='reaction'||c?.kind==='crescendo'?1.25:.8),start+.13);
    gain.gain.setValueAtTime(volume*(event.type==='card'?.10:.22)/Math.sqrt(notes.length),start);gain.gain.exponentialRampToValueAtTime(.001,start+.18);oscillator.start(start);oscillator.stop(start+.2);
  });
}
export const PATCHES = [
  {version:'0.5.1',title:'Préparer, jouer, recommencer',items:['Dates cliquables, préparation de tous les bands et choix direct des compositions ou d’une jam libre.','Étapes visibles, refus affichés, annulation pendant les déplacements et arrêt immédiat d’un essai.','Nouvelle saison accessible après les dernières dates; sauvegardes V5 conservées.','Vitesse aimantée sur les valeurs rondes et sac Rapin complet dans les fiches.']},
  {version:'0.5.0',title:'Du garage à la scène',items:['Panneaux actualisés sans reconstruire les contrôles; positions, focus et détails conservés. Navigation intégrée au header fixe.','Musicien joueur, invitations, répertoire choisi, maîtrise par chanson et engagements concrets.','Decks de 8 à 10 cartes, pige de 5, shows automatiques en cinq phrases et public physique à réactions en chaîne.','Déchéance et cartes maudites, récupération, développement et archives des bands.','Saison de trois occasions et une finale, bilans, replay, sons et effets réduits.','Compétences de départ plus modestes; progression ralentie à haut niveau. Catalogue historique conservé et archivage réversible.','Sauvegardes V1 à V4 migrées sans réduction des compétences ou suppression de chansons.']},
  {version:'0.4.0',title:'Des sessions et des chansons',items:['Projets persistants en plusieurs séances, origine émotionnelle conservée.','Six résultats de jam, bilans de sessions et découverte graduelle de la chimie.']},
  {version:'0.3.0',title:'Un quartier observable',items:['Sept actions musicales et sociales, compteurs, groupes non exclusifs et relations orientées.','Vitesse granulaire et simulation indépendante des panneaux.']}
];
export function patchesHTML() {return `<h2>Garage vivant · changements</h2>${PATCHES.map(p=>`<section><h3>v${p.version} · ${p.title}</h3><ul>${p.items.map(x=>`<li>${x}</li>`).join('')}</ul></section>`).join('')}`;}
