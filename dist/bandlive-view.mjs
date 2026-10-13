import {levelRewardsHTML} from './level-rewards.mjs?v=0.8.0';
import {cardFace} from './card-view.mjs?v=0.8.0';
import {personCard} from './person-card.mjs?v=0.8.0';
import {simulateBandLive} from './bandlive-auto.mjs?v=0.8.0';
import {REACTIONS,reactionText} from './bandlive-reactions.mjs?v=0.8.0';
import {createBandLiveStage} from './bandlive-stage.mjs?v=0.8.0';
import {createBandLiveInspection} from './bandlive-inspection.mjs?v=0.8.0';
import {createDragFeedback,showDragFeedback} from './bandlive-drag-feedback.mjs?v=0.8.0';
import {createBandLiveAim} from './bandlive-aim.mjs?v=0.8.0';
import {musicianDeck,definitionFor,specialChoices} from './bandlive-cards.mjs?v=0.8.0';
import {drawMicroBody} from './character-view.mjs?v=0.8.0';
import {songTurns} from './song-rules.mjs?v=0.8.0';
import {groupLinkHTML} from './group-link.mjs?v=0.8.0';
import {RULES,INSTRUMENTS,SPECIALS,restoreBandLive,cardById,cardDefinition,currentSong,availableSongs,chooseSong,canPlay,playCard,endTurn,totalTurns,sectionName,CONQUEST_EFFECTS,conquestLabel,conquestDescription,audienceColumns,conquestTargets,favoriteStyle,previewCard} from './bandlive.mjs?v=0.8.0';
import {resolveBandLivePlan,createBandLiveFromWorld} from './bandlive-roster.mjs?v=0.8.0';
import {concertLineup,createConcertReplay,resolveBandLiveConcert,unlockBandLiveRepertoire,exchangeBandLiveCard,skipBandLiveExchange} from './bandlive-concert.mjs?v=0.8.0';
import {NEEDS,PERSONALITY} from './engine.mjs?v=0.8.0';
import {instrumentArt} from './show-view.mjs?v=0.8.0';
import {decorateCube,enableAudio,playSound} from './v5-view.mjs?v=0.8.0';

const CARD_GLYPHS={guitar:'♬',bass:'↑',drums:'◉',keys:'≋',voice:'♫',sax:'♪',trumpet:'♩',percussion:'◉'};
const STORAGE='garage-vivant-bandlive-v1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STYLE_PATHS={
  Indie:'M5 18V6l14-3v12M5 18c0 4-6 4-6 0s6-4 6 0M19 15c0 4-6 4-6 0s6-4 6 0',
  Punk:'m14 2-9 12h7l-2 8 9-12h-7z',
  Folk:'M12 3c-8 0-11 12-3 15 8 3 11-5 11-12-4 1-5-3-8-3zM7 22 17 8',
  Métal:'m3 19 3-14 6 8 6-8 3 14M5 20h14',
  Jazz:'M8 3h7v3h-4v7c0 9-9 9-9 3l5-4 3 6M15 6l3 3',
  Électro:'m2 13 5-8 5 14 5-14 5 8M3 22h18',
  Ska:'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  Pop:'m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z',
  Rock:'m14 2-9 12h7l-2 8 9-12h-7z',
};
export function styleIcon(style){return `<span class="bl-style" data-bl-style="${esc(style)}" tabindex="0" aria-label="${esc(style)}"><svg viewBox="-2 0 26 24" aria-hidden="true"><path d="${STYLE_PATHS[style]||STYLE_PATHS.Indie}"/></svg></span>`;}
const reaction=fan=>['explosion','trance','emotion'][Number(fan.id.slice(1))%3];
const reactionLabel=fan=>({explosion:'Explosion !',trance:'En transe',emotion:'Ému aux larmes'})[reaction(fan)];
function cubeHTML(actor,type){return `<canvas class="bl-cube" width="144" height="144" data-bl-cube="${esc(actor.id)}" data-bl-cube-type="${type}" aria-hidden="true"></canvas>`;}
function drawCube(canvas,actor,conquered=false){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,144,144);
  const box=(x,y,size)=>{ctx.fillStyle=actor.color||'#82a98b';ctx.beginPath();ctx.roundRect(x,y,size,size,7);ctx.fill();ctx.fillStyle='#ffffff35';ctx.fillRect(x,y,size,9);ctx.fillStyle='#223932';ctx.fillRect(x+size*.32,y+size*.32,size*.09,size*.09);ctx.fillRect(x+size*.58,y+size*.32,size*.09,size*.09);};
  if(conquered&&reaction(actor)==='explosion'){for(let i=0;i<9;i++)box(16+i%3*38,20+Math.floor(i/3)*38,29);}
  else {drawMicroBody(ctx,72,107,78,actor);box(33,29,78);decorateCube(ctx,72,107,78,actor);}
}
function actorTooltip(actor){return personCard(actor);}
function fanStatus(fan){return [fan.spotlight?`+${typeof fan.spotlight==='number'?fan.spotlight:2} puissance par carte · ce tour`:'',fan.chorusStyle?`Chœur : ${fan.chorusStyle} · cette chanson`:'',fan.turnStyle?`Style : ${fan.turnStyle} · ce tour`:'',fan.noBoredom?'Ennui empêché · ce tour':''].filter(Boolean).join(' · ');}
function fanTooltip(game,fan){
 const effect=CONQUEST_EFFECTS[fan.effect];
 return `<div class="bl-fan-profile"><div class="bl-fan-portrait" style="--fan-color:${esc(fan.color)}">${cubeHTML(fan,'fan')}</div><div><strong>${esc(fan.name)}</strong><span>${styleIcon(favoriteStyle(fan))} ${esc(favoriteStyle(fan))}</span></div></div><div class="bl-profile-meter"><i style="width:${100*(1-fan.hp/fan.max)}%"></i><b>♥ ${fan.max-fan.hp}/${fan.max} · ${fan.conquered?'Conquis':'Conquête'}</b></div><div class="bl-fan-rule"><b>${fan.reactionUsed?'Ce tour : réaction consommée':esc(reactionText(game,fan))}</b><p>${fan.conquered?'Le public est avec toi.':fan.reactionUsed?'Une nouvelle réaction au prochain tour.':esc(REACTIONS[fan.intent]?.description||'')}</p></div>${effect?`<div class="bl-fan-rule"><b>${effect.icon} ${esc(conquestLabel(game,fan))} · ${fan.conquered?'déclenché':'à la conquête'}</b><p>${esc(conquestDescription(game,fan))}</p></div>`:''}${fanStatus(fan)?`<p>${esc(fanStatus(fan))}</p>`:''}`;
}
function conquestBadge(game,fan){const effect=CONQUEST_EFFECTS[fan.effect];return effect?`<span class="bl-conquest-bonus" title="${esc(conquestDescription(game,fan))}" aria-label="${esc(conquestLabel(game,fan))}"><b><span class="bl-effect-icon">${effect.icon}</span><span class="bl-effect-name">${esc(conquestLabel(game,fan))}</span></b><em>${game.conquestVersion>=2?fan.effectValue:''}</em></span>`:'';}

export function createBandLiveModule({getWorld,onOpen,onReturn,onDisable,canStart,notify,getReducedEffects=()=>false,getPlan=()=>({}),onConcertStart,onConcertUpdate,onConcertCancel}) {
  const root=document.querySelector('#bandlive-view'),nav=document.querySelector('#bandlive-nav'),toggle=document.querySelector('#bandlive-enabled');
  let enabled=true,game=null,preparing=false,draft={groupId:'',memberIds:null,seed:2040,audienceSize:RULES.minAudience},selectedCard=null,activeCard=null,dragPointer=null,dragPoint=null,dragFrame=null,ghost=null,animation=null,sound=false,storageProblem=false;
  try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved){enabled=true;if(saved.draft)draft=saved.draft;if(saved.game)game=restoreBandLive(saved.game);}}catch{notify('La répétition BandLive enregistrée ne peut pas être reprise. Le quartier est disponible.');}
  const stage=createBandLiveStage({root,getReducedEffects});
  const aim=createBandLiveAim();
  let rehearsalGame=game,liveId=null,lastReport=null,pendingChoice=null,rewardChoice={},choiceTouch=null;
  const liveShow=()=>{const s=getWorld().performance;return liveId&&s?.id===liveId&&s.bandLive&&getWorld().showEventId?s:null;};
  function syncConcert(){
    unlockBandLiveRepertoire(getWorld());
    const show=getWorld().performance;
    if(show?.bandLive&&!show.preview&&getWorld().showEventId){if(!liveId)rehearsalGame=game;liveId=show.id;game=show.bandLive.game;preparing=false;}
    else if(liveId){liveId=null;game=rehearsalGame;preparing=!game;}
    nav.hidden=!enabled&&!liveId;
  }
  syncConcert();
  const tooltip=document.createElement('div');tooltip.id='bandlive-tooltip';tooltip.className='bl-tooltip';tooltip.role='tooltip';tooltip.hidden=true;document.body.append(tooltip);
  const previewLayer=document.createElement('div');previewLayer.className='bl-preview-layer';document.body.append(previewLayer);
  const inspection=createBandLiveInspection({root,blocked:()=>stage.editing||!!animation,lookup:id=>{if(!game)return null;const c=cardById(game,id);if(!c)return null;const actor=game.actors.find(a=>a.id===c.actorId);return {card:cardDefinition(c),owner:actor.name,instrument:INSTRUMENTS[c.instrument],instrumentKey:c.instrument};}});
  inspection.targets.append(previewLayer);
  const dragImage=document.createElement('canvas');dragImage.width=dragImage.height=1;dragImage.style.cssText='position:fixed;left:-10px;top:-10px;pointer-events:none';document.body.append(dragImage);
  function persist(){if(liveShow()&&liveShow().bandLive.game===game)onConcertUpdate?.();else if(!liveId)rehearsalGame=game;try{localStorage.setItem(STORAGE,JSON.stringify({enabled,draft,game:liveId?rehearsalGame:game}));storageProblem=false;}catch{if(!storageProblem)notify('La répétition ne peut pas être enregistrée dans ce navigateur.');storageProblem=true;}}
  function hideTip(){tooltip.hidden=true;root.querySelectorAll('.bl-conquest-area').forEach(el=>el.classList.remove('bl-conquest-area'));root.querySelectorAll('[aria-describedby="bandlive-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
  function showTip(target){
    const style=target.closest('[data-bl-style]'),actorEl=target.closest('[data-bl-actor]'),fanEl=target.closest('[data-bl-fan]');
    let html,anchor;
    if(style){html=esc(style.dataset.blStyle);anchor=style;}
    else if(actorEl&&game){html=actorTooltip(game.actors.find(a=>a.id===actorEl.dataset.blActor));anchor=actorEl;}
    else if(fanEl&&game){html=fanTooltip(game,game.fans.find(f=>f.id===fanEl.dataset.blFan));anchor=fanEl;}
    else return hideTip();
    if(activeCard||animation)return hideTip();
    root.querySelectorAll('.bl-conquest-area').forEach(el=>el.classList.remove('bl-conquest-area'));
    if(fanEl&&game&&!style){const source=game.fans.find(f=>f.id===fanEl.dataset.blFan);if(!source.conquered)for(const fan of conquestTargets(game,source))root.querySelector(`[data-bl-fan="${CSS.escape(fan.id)}"]`)?.classList.add('bl-conquest-area');}
    tooltip.innerHTML=html;for(const canvas of tooltip.querySelectorAll('[data-bl-cube]'))drawCube(canvas,game.fans.find(f=>f.id===canvas.dataset.blCube));tooltip.hidden=false;anchor.setAttribute('aria-describedby',tooltip.id);
    const r=anchor.getBoundingClientRect(),w=tooltip.offsetWidth,h=tooltip.offsetHeight;
    tooltip.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';
    tooltip.style.top=(r.bottom+h+12<innerHeight?r.bottom+9:Math.max(8,r.top-h-9))+'px';
  }
  function initializeDraft(){
    return resolveBandLivePlan(getWorld(),draft,{canStart:canStart()});
  }
  function setupHTML(){
    const {groups,group,people,members,songs,ready,reason}=initializeDraft();
    const selection=groups.length?`<label>Groupe du quartier<select id="bl-group">${groups.map(g=>`<option value="${esc(g.id)}" ${g.id===draft.groupId?'selected':''}>${esc(g.name)} · ${esc(g.genre)} · ${g.members.length} membres</option>`).join('')}</select></label>`:'';
    const musicians=group?`<fieldset><legend>Musiciens · ${members.length}/${RULES.maxMembers} · au moins ${RULES.minMembers}</legend>${people.length>RULES.maxMembers?`<p class="muted">Ce groupe compte ${people.length} membres. Choisis jusqu’à vingt-quatre musiciens pour cette scène.</p>`:''}<div class="bl-member-picker">${people.map(p=>`<label><input type="checkbox" data-bl-member="${esc(p.id)}" ${draft.memberIds.includes(p.id)?'checked':members.length>=RULES.maxMembers?'disabled':''}>${personCard(p,{interactive:false})}</label>`).join('')}</div></fieldset>`:'';
    const repertoire=group?`<section class="bl-repertoire"><h3>Chansons du groupe · ${songs.length}</h3>${songs.length?`<ul>${songs.map(s=>`<li><div><b>${esc(s.title)}</b>${styleIcon(s.style)}<span>${esc(s.style)}</span></div><small>Par ${s.authorNames.map(esc).join(', ')} · ${songTurns(s)} tours</small></li>`).join('')}</ul>${songs.length===1?'<p>Une seule chanson au répertoire : elle sera reprise au deuxième passage.</p>':'<p>Choisis ta première chanson sur scène, puis une autre pour le deuxième passage.</p>'}`:'<p>Aucune composition active dans ce répertoire.</p>'}</section>`:'';
    return `<div class="panel bl-setup"><span class="eyebrow">BANDLIVE · RÉPÉTITION</span><h2>À toi de jouer le show.</h2><p>Joue les chansons de ton groupe avec deux à vingt-quatre de ses musiciens. Chaque musicien apporte les cinq cartes de son instrument actuel. Au départ : trois Note et deux spéciales. Les améliorations gagnées à chaque niveau sont conservées.</p>${selection}${musicians}${repertoire}${reason?`<p class="bl-setup-reason" role="status">${esc(reason)}</p>`:''}${!group||!songs.length?'<button data-open-groups class="text-button">Ouvrir les groupes du quartier ↗</button>':''}<label>Spectateurs<input id="bl-audience-size" type="number" min="${RULES.minAudience}" max="${RULES.maxAudience}" step="1" value="${draft.audienceSize}"><span class="muted">3 à 12 · plus de public, plus de défi</span></label><label>Graine de la répétition<input id="bl-seed" type="number" min="0" max="4294967295" value="${draft.seed}"></label><div class="inline-actions"><button id="bl-start" class="primary" ${!ready?'disabled':''}>Prendre la scène</button>${game?'<button id="bl-resume">Reprendre la répétition en cours</button>':''}</div><p class="muted">Répétition sans récompense. Le quartier attend pendant le show.</p><details><summary>Les cartes spéciales des huit instruments</summary><div class="bl-reference">${Object.keys(INSTRUMENTS).flatMap(key=>specialChoices(key).map(c=>`<article><b>${INSTRUMENTS[key]} · ${c.name} · ${c.cost} énergie</b><p>${esc(c.description)}</p></article>`)).join('')}</div></details></div>`;
  }
  function handHTML(actor){
    const cards=game.hand.map(id=>cardById(game,id)).filter(c=>c.actorId===actor.id),step=Math.min(26,100/Math.max(1,cards.length-1));
    return `<div class="bl-hand" style="width:${110+Math.max(0,cards.length-1)*step}px" aria-label="Cartes de ${esc(actor.name)}">${cards.map((card,i)=>{
      const c=cardDefinition(card),power=Object.hasOwn(c,'power'),tag=power?'impact':'rhythm';
      return `<button type="button" class="bl-card ${power?'bl-power':'bl-preparation'} ${selectedCard===card.id?'bl-selected':''}" data-bl-card="${esc(card.id)}" draggable="true" style="left:${i*step}px;--bl-card-order:${i}" ${!canPlay(game,card.id)||animation?'disabled':''} aria-label="${esc(c.name)} · ${INSTRUMENTS[card.instrument]} · ${c.cost} énergie. ${esc(c.description)}" aria-pressed="${selectedCard===card.id}">${cardFace({card:c,owner:actor.name,instrument:actor.instrument})}</button>`;
    }).join('')}${!cards.length?'<span class="bl-empty-hand">Aucune carte en main</span>':''}</div>`;
  }
  function pilesHTML(){
    const list=ids=>ids.map(id=>cardById(game,id)).sort((a,b)=>a.actorId.localeCompare(b.actorId)||a.kind.localeCompare(b.kind)).map(c=>'<li>'+cardFace({card:cardDefinition(c),owner:game.actors.find(a=>a.id===c.actorId).name,instrument:c.instrument})+'</li>').join('')||'<li>Vide</li>';
    return '<details class="bl-piles"><summary>Voir les cartes · Pioche '+game.deck.length+' · Main '+game.hand.length+' · Défausse '+game.discard.length+'</summary><div><h4>Pioche · contenu sans ordre de tirage</h4><ul>'+list(game.deck)+'</ul><h4>Défausse</h4><ul>'+list(game.discard)+'</ul></div></details>';
  }
  function songProgressHTML(){
    return `<div class="bl-song-progress" aria-label="Deux chansons dans le spectacle">${[0,1].map(i=>{
      const id=game.usedSongs[i]||game.songOrder?.[i],song=game.songs.find(s=>s.id===id);
      const duration=song?(game.version>=4?songTurns(song):3):null;
      const current=game.usedSongs.length-1===i&&game.songId===id;
      const finished=game.usedSongs.length-1>i||(current&&(['won','lost','choose'].includes(game.phase)));
      const count=game.usedSongs[i]?(current?game.section:duration):0;
      return `<span class="bl-song-slot ${current&&!finished?'is-current':''}" title="${song?esc(song.title):'À choisir'}"><small>Chanson ${i+1}/2</small><b>${song?`${count}/${duration} tours`:'À choisir'}</b><em>${song?esc(song.title):'Durée selon la chanson'}</em></span>`;
    }).join('')}</div>`;
  }
  function topControlsHTML(finished,live){
    return `<div class="bl-top-controls"><button id="bl-sound" aria-pressed="${sound}">Son : ${sound?'ON':'OFF'}</button>${pilesHTML()}${!finished?`<button id="bl-simulate" ${animation?'disabled':''}>Simuler le show</button>`:''}${live?'':'<button id="bl-setup" class="text-button">Changer le band</button>'}</div>`;
  }
  function rewardHTML(show){
    const reward=show.bandLive.reward;if(!reward){
      const people=game.actors.map(a=>getWorld().people.find(p=>p.id===a.id)).filter(p=>(p?.levelRewards||[]).some(r=>r.status==='pending'));if(!people.length)return '';
      const chosen=people.find(p=>p.id===rewardChoice.actorId)||people[0];
      return `<section class="bl-reward panel"><h3>✦ Améliorations de niveau</h3><p>Choisis un musicien. Les récompenses restent disponibles dans sa fiche si tu continues la soirée.</p><div class="bl-reward-actors">${people.map(p=>`<button data-bl-reward-actor="${esc(p.id)}" aria-pressed="${p.id===chosen.id}">${personCard(p,{interactive:false})}</button>`).join('')}</div>${levelRewardsHTML(chosen,{limit:1})}</section>`;
    }
    if(reward.status!=='pending')return `<section class="panel bl-reward"><h3>${reward.status==='claimed'?'Deck mis à jour':'Échange passé'}</h3>${reward.status==='claimed'?`<p>${esc(game.actors.find(a=>a.id===reward.actorId)?.name)} · ${INSTRUMENTS[reward.instrument]} : ${esc(definitionFor(reward.instrument,reward.before).name)} → <b>${esc(definitionFor(reward.instrument,reward.after).name)}</b>. Ce deck sera utilisé au prochain spectacle avec cet instrument.</p>`:''}</section>`;
    if(rewardChoice.showId!==show.id)rewardChoice={showId:show.id};
    const actor=game.actors.find(a=>a.id===rewardChoice.actorId),person=actor&&getWorld().people.find(p=>p.id===actor.id),deck=person?musicianDeck(person,actor.instrument):[];
    const choice=(kind,instrument)=>cardFace({card:definitionFor(instrument,kind),owner:actor.name,instrument});
    return `<section class="panel bl-reward" aria-label="Échange de carte après spectacle"><span class="eyebrow">APRÈS LE SPECTACLE · UN ÉCHANGE</span><h3>Fais évoluer le deck d’un musicien</h3><p>Choisis un participant, une carte à remplacer, puis une spéciale. Son deck reste à cinq cartes et sera conservé pour cet instrument.</p><h4>1. Le musicien</h4><div class="bl-reward-actors">${game.actors.filter(a=>getWorld().people.some(p=>p.id===a.id)).map(a=>`<button data-bl-reward-actor="${esc(a.id)}" aria-pressed="${actor?.id===a.id}">${personCard(getWorld().people.find(p=>p.id===a.id),{interactive:false})}</button>`).join('')}</div>${actor?`<h4>2. La carte à remplacer · ${INSTRUMENTS[actor.instrument]}</h4><div class="bl-deck-choices">${deck.map((kind,i)=>`<button data-bl-reward-slot="${i}" aria-pressed="${rewardChoice.slot===i}"><small>Carte ${i+1}</small>${choice(kind,actor.instrument)}</button>`).join('')}</div><h4>3. La carte à obtenir</h4><div class="bl-deck-choices bl-special-choices">${specialChoices(actor.instrument).map(c=>`<button data-bl-reward-kind="${c.kind}" aria-pressed="${rewardChoice.kind===c.kind}" ${deck[rewardChoice.slot]===c.kind?'disabled':''}>${choice(c.kind,actor.instrument)}</button>`).join('')}</div><button id="bl-confirm-exchange" class="primary" ${!Number.isInteger(rewardChoice.slot)||!rewardChoice.kind||deck[rewardChoice.slot]===rewardChoice.kind?'disabled':''}>Confirmer l’échange</button>`:''}<p><small>Facultatif : tu peux continuer sans échange. Les répétitions et les replays n’accordent pas de carte.</small></p></section>`;
  }
  function choiceHTML(){
    if(pendingChoice?.type==='duo')return `<section class="panel bl-card-choice"><b>Première cible : ${esc(game.fans.find(f=>f.id===pendingChoice.targetId)?.name)}.</b> Choisis un autre spectateur. <button id="bl-cancel-choice">Annuler</button></section>`;
    if(pendingChoice?.type!=='discard')return '';
    return `<section class="panel bl-card-choice"><h3>Variation · choisis une carte à défausser</h3><div class="bl-deck-choices">${game.hand.filter(id=>id!==pendingChoice.id).map(id=>{const card=cardById(game,id),c=cardDefinition(card);return `<button data-bl-discard="${esc(id)}"><b>${esc(c.name)}</b><small>${esc(game.actors.find(a=>a.id===card.actorId).name)} · ${c.cost} énergie</small><span>${esc(c.description)}</span></button>`;}).join('')}</div><button id="bl-cancel-choice">Annuler</button></section>`;
  }
  function eveningHTML(show,expanded=false){
    const lineup=concertLineup(getWorld(),show);if(!lineup.length)return '';
    const initial=show.bandLive?.game.initialFanHp, fans=show.bandLive?.game.fans;
    const welcome=initial?Math.round(initial.reduce((sum,hp,i)=>sum+(1-hp/fans[i].max)*100,0)/initial.length):0;
    const state=entry=>entry.status==='played'?'Terminé':entry.status==='cancelled'?'Annulé':entry.current?'Sur scène':'À suivre';
    return `<details class="bl-evening panel" ${expanded?'open':''}><summary>Programmation de la soirée · ${lineup.length} groupes${welcome?` · accueil initial ${welcome} %`:''}</summary><ol>${lineup.map(entry=>`<li ${entry.current?'aria-current="step"':''}><b>${esc(entry.role)} · ${esc(entry.name)}</b><span>${state(entry)}</span></li>`).join('')}</ol><p>Le groupe suivant conserve 20 % de l’accueil obtenu auprès de chaque spectateur, dans la limite de 30 %. Chaque groupe joue avec ses musiciens, ses decks et son répertoire.</p>${show.bandLive?`<p>${enabled?'Les groupes compatibles suivants continuent dans BandLive. Les jams, les longues setlists et les formations de plus de six musiciens restent en spectacle classique.':'BandLive est désactivé : le groupe suivant jouera en spectacle classique.'}</p>`:''}</details>`;
  }
  function layoutToolsHTML(){
    if(game.phase!=='play')return '';
    return `<button id="bl-layout" aria-pressed="${stage.editing}" ${animation?'disabled':''}>${stage.editing?'✓ Terminer la disposition':'✥ Disposition'}</button><div class="bl-layout-tools" ${stage.editing?'':'hidden'}><span>Les cases conservent les voisins.</span><label>Main <select id="bl-layout-hand">${game.actors.map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}</select></label><label>Taille <input id="bl-layout-scale" type="range" min="55" max="165" value="${Math.round((stage.settings(game.actors[0].id).scale??.82)*100)}"></label><label>Éventail <input id="bl-layout-fan" type="range" min="0" max="60" value="${stage.settings(game.actors[0].id).fan??26}"></label><button id="bl-layout-undo">Annuler</button><button id="bl-layout-reset">Placement initial</button></div>`;
  }
  function showHTML(){
    const song=currentSong(game),won=game.phase==='won',lost=game.phase==='lost',finished=won||lost,choosing=game.phase==='choose'&&!animation,live=liveShow();
    const eyebrow=live?`BANDLIVE · ${esc(live.role||'Prestation')} · ${esc(live.opportunityName)}`:(game.songOrder||game.freeSetlist)?'BANDLIVE · REPLAY SANS RÉCOMPENSE':'BANDLIVE · RÉPÉTITION';
    const record=live&&getWorld().showHistory.find(r=>r.id===live.id);
    const effect=(label,key)=>{const e=record?.effects;return e?`<span><b>${Math.round(e.before[key])} → ${Math.round(e.after[key])}</b> ${label}</span>`:'';};
    const report=finished&&live?`<section class="bl-concert-result panel"><span class="eyebrow">BILAN DU SPECTACLE</span><h3>${won?'Tout le public est conquis !':'Le show est terminé.'}</h3><div class="bl-result-values"><span><b>${live.result.score}/100</b> Accueil du public</span><span><b>${live.sourceOpportunity.organizer?.exigence||30}/100</b> Attentes de la scène</span>${effect('Réputation','reputation')}${effect('Moral','morale')}${effect('Coordination','development')}</div><ul>${(record?.musicianEffects||[]).map(p=>`<li>${esc(p.name)} · énergie ${Math.round(p.energyBefore)} → ${Math.round(p.energyAfter)}</li>`).join('')}</ul><p>Le bilan dépend de l’accueil du public et des attentes de cette scène. Ce résultat compte dans la partie et reste dans l’historique du groupe.</p></section>`:'';
    const waiting=live&&concertLineup(getWorld(),live).some(b=>['booked','assembling'].includes(b.status));
    return `<div class="bl-arena ${!!game.conquestVersion?'bl-conquest-board':''} ${choosing?'bl-is-choosing':''}"><div class="bl-hud"><div><span class="eyebrow">${eyebrow}</span><h2>${groupLinkHTML(getWorld().groups.find(g=>g.id===game.groupId),game.groupName)}</h2><p>${song?`${esc(song.title)} · ${esc(song.style)} · ${sectionName(game)} · passage ${game.usedSongs.length}/2`:'Deux passages pour conquérir le public.'}</p></div>${topControlsHTML(finished,live)}<div class="bl-resources"><span><b data-bl-energy>${game.energy}/3</b> Énergie</span><span><b data-bl-tempo>${game.tempo}/10</b> Tempo</span>${songProgressHTML()}<span><b>${game.fans.filter(f=>f.hp===0).length}/${game.fans.length}</b> Conquis</span>${game.relayBoosts?.length?`<span class="bl-boost"><b>+${game.relayBoosts.reduce((n,b)=>n+b.power,0)}</b> Relais · autre musicien</span>`:''}${game.boost?`<span class="bl-boost"><b>+${game.boost}</b> Prochaine puissance · ce tour</span>`:''}</div></div>${choosing?`<div class="bl-song-overlay" role="dialog" aria-modal="true" aria-label="Choisir la toune"><div class="bl-song-choice"><span class="eyebrow">LE PUBLIC CE SOIR</span><div class="bl-crowd-overview">${[...new Set(game.fans.map(favoriteStyle))].map(style=>`<span>${styleIcon(style)} ${esc(style)} <b>${game.fans.filter(f=>favoriteStyle(f)===style).length}</b></span>`).join('')}</div><p class="bl-crowd-moods">${Object.entries(REACTIONS).map(([id,r])=>{const n=game.fans.filter(f=>!f.conquered&&!f.reactionUsed&&f.intent===id).length;return n?`${n} ${r.name}`:'';}).filter(Boolean).join(' · ')}</p><b>${game.songOrder?(game.turn?'Deuxième passage de la setlist · −2 tempo au départ':'Setlist réservée · première chanson'):game.turn?(game.songs.length===1?'Reprise de la chanson · −2 tempo au départ':'Choisis la deuxième chanson · −2 tempo au départ'):'Choisis la première chanson'}</b>${availableSongs(game).map(s=>`<button data-bl-song="${esc(s.id)}"><strong>${esc(s.title)}</strong>${styleIcon(s.style)}<small>${esc(s.style)} · ${game.version>=4?songTurns(s):3} tours · finale : 3 puissance sur tout le public</small><span class="bl-song-match">♥ ${game.fans.filter(f=>!f.conquered&&favoriteStyle(f)===s.style).length} fans partagent ce style</span></button>`).join('')}</div></div>`:''}<div class="bl-playfield"><div class="bl-viewport"><div class="bl-world bl-minuit" style="--bl-players:${game.actors.length};--bl-fans:${game.fans.length>6?Math.ceil(game.fans.length/2):game.fans.length}"><canvas class="bl-effects" aria-hidden="true"></canvas><div class="bl-stage-sign" aria-hidden="true"><span>GARAGE VIVANT</span><b>LIVE SESSION</b></div><div class="bl-musicians">${game.actors.map(actor=>`<section class="bl-musician" data-bl-musician="${esc(actor.id)}"><div class="bl-musician-info" data-bl-actor="${esc(actor.id)}" tabindex="0" aria-label="Informations de ${esc(actor.name)}"><span class="bl-status-icon" aria-label="Statistiques et action de ${esc(actor.name)}">${animation?.event?.actorId===actor.id?'♫':'ⓘ'}<small>${animation?.event?.actorId===actor.id?esc(animation.event.name):'Prêt'} · ${Math.round(actor.needs.energy??0)} ⚡</small></span><span class="bl-performer">${cubeHTML(actor,'actor')}${instrumentArt(actor.instrument,'rhythm')}</span><div class="bl-name"><b>${esc(actor.name)}</b>${styleIcon(actor.genre)}</div><small>${INSTRUMENTS[actor.instrument]}</small></div>${!choosing&&!finished?handHTML(actor):''}</section>`).join('')}</div><div class="bl-audience-viewport" tabindex="0" role="region" aria-label="Public du concert"><div class="bl-audience" data-bl-target="audience" tabindex="0" role="group" aria-label="Zone du public. Dépose ici une carte collective ou de préparation."><span class="bl-zone-label">Public</span><div class="bl-fans" ${!!game.conquestVersion?`style="grid-template-columns:repeat(${audienceColumns(game)},minmax(0,1fr))"`:""}>${game.fans.map(fan=>`<div class="bl-fan-wrap"><button class="bl-fan ${fan.hp===0?'bl-conquered bl-reaction-'+reaction(fan):''}" data-bl-fan="${fan.id}" data-bl-target="${fan.id}" aria-label="${esc(fan.name)} · ${fan.max-fan.hp}/${fan.max} · ${fan.hp===0?'Conquis':esc(reactionText(game,fan))}"><span class="bl-intent">${fan.hp===0?(fan.effect?'♥ ✓':reactionLabel(fan)):esc(reactionText(game,fan))}</span>${cubeHTML(fan,'fan')}<span class="bl-name"><b>${esc(fan.name)}</b>${styleIcon(favoriteStyle(fan))}</span><span class="bl-resistance" role="progressbar" aria-label="Conquête de ${esc(fan.name)}" aria-valuemin="0" aria-valuemax="${fan.max}" aria-valuenow="${fan.max-fan.hp}"><i style="width:${(1-fan.hp/fan.max)*100}%"></i></span><span class="bl-hp">${fan.max-fan.hp}/${fan.max}</span>${conquestBadge(game,fan)}<output class="bl-damage-preview" data-bl-preview="${fan.id}" hidden></output></button></div>`).join('')}</div><span class="bl-drop-hint">Cartes collectives et préparations → dépose dans cette zone</span></div></div></div></div></div>${live?eveningHTML(live,choosing||finished):''}${report}${finished&&live?`<section class="bl-xp-report">${(getWorld().showHistory.find(r=>r.id===live.id)?.individualXp||[]).map(x=>`<div>${personCard(getWorld().people.find(p=>p.id===x.id))}<b class="${x.levelAfter>x.levelBefore?'bl-level-up':''}">+${x.gain} XP ${x.levelAfter>x.levelBefore?`✦ NIVEAU ${x.levelAfter} !`:''}</b></div>`).join('')}</section>`+rewardHTML(live):''}${choiceHTML()}${game.phase==='play'?`<div class="bl-turn-dock"><button id="bl-end" class="primary ${game.hand.some(id=>canPlay(game,id))?'':'bl-turn-ready'}" ${animation?'disabled':''}>Fin du tour <span>➜</span></button><div class="bl-energy-dock" aria-label="${game.energy} énergie restante"><strong>${game.energy}<small>/3</small></strong><div>${[0,1,2].map(i=>`<i class="${i<game.energy?'charged':''}"></i>`).join('')}</div><span>ÉNERGIE</span></div></div>`:''}<div class="bl-controls">${layoutToolsHTML()}<p id="bl-help" role="status">${finished?(won?'Tout le public est conquis !':'Le show est terminé. Il reste du public à conquérir.'):choosing?'Choisis une chanson pour piger ta main.':pendingChoice?.type==='duo'?'Choisis le deuxième spectateur, différent du premier.':pendingChoice?.type==='discard'?'Choisis la carte à défausser ci-dessus.':selectedCard?'Choisis un spectateur ou la zone du public.':'Glisse une carte vers le public, ou sélectionne-la puis choisis sa cible.'}</p>${live&&!finished?'<button id="bl-cancel" class="text-button">Interrompre le show</button>':''}${finished?`<button id="bl-return" class="primary">${live?.bandLive.reward?.status==='pending'?(waiting?'Continuer la soirée sans échange →':'Continuer sans échange →'):waiting?'Continuer la soirée →':'Retour au quartier · continuer'}</button>${live?'':'<button id="bl-replay">Rejouer la répétition</button>'}`:''}</div><details class="bl-log"><summary>Déroulement du show · ${game.played} cartes jouées</summary><div>${game.logs.map(line=>`<p>${esc(line)}</p>`).join('')}</div></details></div>`;
  }
  function render(){
    const previousViewport=root.querySelector('.bl-viewport'),previousAudience=root.querySelector('.bl-audience-viewport');
    const scroll=previousViewport?{x:previousViewport.scrollLeft,y:previousAudience?.scrollTop||0}:null;
    hideTip();root.innerHTML=game&&!preparing?showHTML():setupHTML();
    previewLayer.replaceChildren(...root.querySelectorAll('[data-bl-preview]'));
    const viewport=root.querySelector('.bl-viewport'),audience=root.querySelector('.bl-audience-viewport');
    if(game&&!preparing){for(const canvas of root.querySelectorAll('[data-bl-cube]')){const actor=canvas.dataset.blCubeType==='actor'?game.actors.find(a=>a.id===canvas.dataset.blCube):game.fans.find(f=>f.id===canvas.dataset.blCube);drawCube(canvas,actor,actor.hp===0);}stage.mount(root.querySelector('.bl-world'),game);aim.attach(root.querySelector('.bl-world'));if(selectedCard)inspection.pin(selectedCard);drawEffects();}
    if(viewport&&scroll){viewport.scrollLeft=scroll.x;if(audience)audience.scrollTop=scroll.y;}
    drawEffects();
    if(!game||preparing){stage.mount(null,game);inspection.hide();}
    if(liveShow()&&['won','lost'].includes(game.phase)&&!animation&&lastReport!==game){root.querySelector('.bl-concert-result')?.scrollIntoView({block:'start'});lastReport=game;}
  }
  function announce(message){const help=root.querySelector('#bl-help');if(help)help.textContent=message;}
  function clearDrag(){
    activeCard=null;dragPointer=null;dragPoint=null;if(dragFrame!==null)cancelAnimationFrame(dragFrame);dragFrame=null;ghost?.remove();ghost=null;root.classList.remove('bl-dragging');inspection.hide();clearPreview();root.querySelectorAll('.bl-drop-active,.bl-drop-valid').forEach(el=>el.classList.remove('bl-drop-active','bl-drop-valid'));
  }
  function startDrag(id){
    if(!game||!canPlay(game,id)||animation||stage.editing)return false;
    activeCard=id;hideTip();inspection.pin(id);root.classList.add('bl-dragging');const c=cardDefinition(cardById(game,id));
    root.querySelectorAll(c.target==='single'?'.bl-fan:not(.bl-conquered)':'.bl-audience').forEach(el=>el.classList.add('bl-drop-valid'));
    return true;
  }
  function clearPreview(){aim.hide();root.querySelectorAll('.bl-forecast').forEach(el=>{el.classList.remove('bl-forecast');el.style.removeProperty('--bl-forecast');});previewLayer.querySelectorAll('[data-bl-preview]').forEach(el=>{el.hidden=true;el.textContent='';});}
  function makeDragGhost(id){
    const card=cardById(game,id),actor=game.actors.find(a=>a.id===card.actorId);
    const el=createDragFeedback({card:cardDefinition(card),owner:actor.name,icon:CARD_GLYPHS[card.instrument],accent:actor.color});el.classList.add('bl-ghost');el.setAttribute('aria-hidden','true');return el;
  }
  function updateDragPreview(id,target,preview){
    const card=cardById(game,id),c=cardDefinition(card),fan=game.fans.find(f=>f.id===target?.dataset.blTarget),valid=!!preview?.ok;
    let outcome={name:fan?.name||'Choisis ta cible',main:preview?.message||(c.twoTargets?'Choisis deux spectateurs distincts.':c.discard?'Choisis ensuite une autre carte à défausser.':'Relâche sur une cible valide.'),meta:'Aucune ressource ne sera dépensée.',valid:false};
    if(valid){
      const next=preview.game,after=fan&&next.fans.find(f=>f.id===fan.id),gains=game.fans.map((f,i)=>f.hp-next.fans[i].hp),total=gains.reduce((a,b)=>a+b,0),conquests=game.fans.filter((f,i)=>f.hp>0&&next.fans[i].hp===0).length;
      const resources=['Énergie '+game.energy+' → '+next.energy];if(game.tempo!==next.tempo)resources.push('Tempo '+game.tempo+' → '+next.tempo);if(game.boost!==next.boost)resources.push('Bonus '+game.boost+' → '+next.boost);
      if(c.target==='audience'||preview.effects.length)resources.push('Total +'+total+' ♥');if(conquests)resources.push(conquests+' conquis');
      const meter=after?(fan.max-fan.hp)+'/'+fan.max+' → '+(after.max-after.hp)+'/'+after.max:'';
      const main=Object.hasOwn(c,'power')?(after?meter+' (+'+(fan.hp-after.hp)+' ♥)':'+'+total+' ♥ sur le public'):c.tempo?'Tempo '+game.tempo+' → '+next.tempo:c.boost?'Bonus '+game.boost+' → '+next.boost:c.turnStyle?'Style '+currentSong(game).style:'Main '+game.hand.length+' → '+next.hand.length;
      outcome={name:fan?.name||(c.target==='audience'?'Tout le public':'Effet de la carte'),main,meta:resources.join(' · '),valid:true,gain:after&&Object.hasOwn(c,'power')?fan.hp-after.hp:null,meter,conquered:after&&fan.hp>0&&after.hp===0};
    }
    if(fan){outcome.reaction=fan.reactionUsed?'Réaction consommée ce tour':reactionText(game,fan)+' : '+(REACTIONS[fan.intent]?.description||'');outcome.conquest=conquestLabel(game,fan)+' : '+conquestDescription(game,fan);outcome.trigger=valid&&preview.game.fans.find(f=>f.id===fan.id).reactionUsed&&!fan.reactionUsed?'✦ Réaction déclenchée par cette carte':'';}
    inspection.pin(id);inspection.outcome(outcome);
    const origin=pointFor(`[data-bl-actor="${CSS.escape(card.actorId)}"] .bl-cube`);
    const targetIds=valid?[...new Set(preview.event.hits.map(h=>h.id))]:fan?[fan.id]:[];
    if(pendingChoice?.type==='duo'&&!targetIds.includes(pendingChoice.targetId))targetIds.push(pendingChoice.targetId);
    aim.draw(origin,targetIds.map(id=>pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`)).filter(Boolean),valid||c.twoTargets);
    if(!ghost||!dragPoint)return;
    const r=root.querySelector('.bl-viewport').getBoundingClientRect(),targetRect=fan?root.querySelector('[data-bl-fan="'+fan.id+'"]').getBoundingClientRect():null;
    const obstacles=[...root.querySelectorAll('[data-bl-fan],[data-bl-actor]')].map(el=>el.getBoundingClientRect());if(!inspection.panel.hidden)obstacles.push(inspection.panel.getBoundingClientRect());
    showDragFeedback(ghost,{outcome,pointer:dragPoint,target:targetRect,obstacles,bounds:{left:Math.max(8,r.left+8),right:Math.min(innerWidth-8,r.right-8),top:Math.max(8,r.top+8),bottom:Math.min(innerHeight-8,r.bottom-8)}});
  }
  function highlightDrop(target){
    root.querySelectorAll('.bl-drop-active').forEach(el=>el.classList.remove('bl-drop-active'));
    clearPreview();
    const id=activeCard||selectedCard;
    if(!id||!canPlay(game,id))return;
    if(!target){updateDragPreview(id,null,null);return;}
    const card=cardById(game,id),c=cardDefinition(card);
    if(c.target==='single'&&(target.dataset.blTarget==='audience'||target.classList.contains('bl-conquered'))){updateDragPreview(id,target,null);return;}
    (c.target==='single'?target:root.querySelector('.bl-audience'))?.classList.add('bl-drop-active');
    const preview=pendingChoice?.type==='duo'?previewCard(game,id,pendingChoice.targetId,{secondTargetId:target.dataset.blTarget}):previewCard(game,id,target.dataset.blTarget);updateDragPreview(id,target,preview);if(!preview.ok)return;
    const hits=[...preview.event.hits,...preview.effects.flatMap(e=>e.hits)];
    for(const fan of game.fans.filter(f=>hits.some(h=>h.id===f.id)||fanStatus(f)!==fanStatus(preview.game.fans.find(n=>n.id===f.id)))){
      const after=preview.game.fans.find(f=>f.id===fan.id);const node=root.querySelector('[data-bl-fan="'+fan.id+'"]');node?.classList.add('bl-forecast');node?.style.setProperty('--bl-forecast',(1-after.hp/fan.max)*100+'%');const power=hits.filter(h=>h.id===fan.id).reduce((n,h)=>n+h.power,0),out=previewLayer.querySelector('[data-bl-preview="'+fan.id+'"]'),anchor=root.querySelector('[data-bl-fan="'+fan.id+'"]');
      if(out&&anchor){
        const r=anchor.getBoundingClientRect(),clip=anchor.closest('.bl-audience-viewport').getBoundingClientRect();
        if(r.bottom<Math.max(clip.top,0)||r.top>Math.min(clip.bottom,innerHeight)||r.right<0||r.left>innerWidth)continue;
        const remaining=fan.max-after.hp,single=c.target==='single';
        out.classList.toggle('bl-preview-single',single);out.hidden=false;
        out.innerHTML=`<strong>${esc(fan.name)} · ${power?`+${fan.hp-after.hp} conquête`:'Style / effet'}</strong><span>Conquête : ${remaining} / ${fan.max}</span>${fanStatus(after)!==fanStatus(fan)?`<small>${esc(fanStatus(after))}</small>`:''}`;
        out.setAttribute('aria-label',`${fan.name} : conquête ${remaining} sur ${fan.max}.`);
        out.style.left=Math.max(6,Math.min(innerWidth-out.offsetWidth-6,r.left+r.width/2-out.offsetWidth/2))+'px';
        out.style.top=Math.max(6,Math.min(innerHeight-out.offsetHeight-6,r.top+6))+'px';
      }
    }
  }
  function dropAtPoint(x,y){
    const target=document.elementFromPoint(x,y)?.closest('[data-bl-target]');
    // A freely positioned hand is never an obstacle to the fan's drop region.
    const clip=root.querySelector('.bl-audience-viewport')?.getBoundingClientRect();
    if(clip&&x>=Math.max(0,clip.left)&&x<=Math.min(innerWidth,clip.right)&&y>=Math.max(0,clip.top)&&y<=Math.min(innerHeight,clip.bottom)){
      const fan=[...root.querySelectorAll('[data-bl-fan]')].find(el=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
      if(fan)return fan;
    }
    return target&&root.contains(target)?target:null;
  }
  function moveDrag(x,y){
    dragPoint={x,y};highlightDrop(dropAtPoint(x,y));
    if(dragFrame!==null)return;
    let previous=performance.now();
    function scrollFrame(now){
      if(!activeCard||!dragPoint){dragFrame=null;return;}
      const viewport=root.querySelector('.bl-viewport'),audience=root.querySelector('.bl-audience-viewport');
      const r=viewport.getBoundingClientRect(),a=audience.getBoundingClientRect(),{x,y}=dragPoint;
      const left=Math.max(0,r.left),right=Math.min(innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);
      const step=Math.min(32,now-previous)*.6;previous=now;
      const velocity=(point,start,end)=>point<start+35?-Math.max(0,1-(point-start)/35):point>end-35?Math.max(0,1-(end-point)/35):0;
      if(x>=left&&x<=right&&y>=top&&y<=bottom){
        viewport.scrollLeft+=velocity(x,left,right)*step;
        const audienceTop=Math.max(top,a.top),audienceBottom=Math.min(bottom,a.bottom);
        if(y>=audienceTop&&y<=audienceBottom)audience.scrollTop+=velocity(y,audienceTop,audienceBottom)*step;
        highlightDrop(dropAtPoint(x,y));
      }
      dragFrame=requestAnimationFrame(scrollFrame);
    }
    dragFrame=requestAnimationFrame(scrollFrame);
  }
  function pointFor(selector){
    const world=root.querySelector('.bl-world').getBoundingClientRect(),el=root.querySelector(selector),r=el?.getBoundingClientRect();
    if(!r)return null;
    const clip=el.closest('.bl-audience-viewport')?.getBoundingClientRect(),centerY=r.top+r.height/2;
    if(clip&&(centerY<clip.top||centerY>clip.bottom))return null;
    const scale=Number(root.querySelector('.bl-world').dataset.scale)||1;return {x:(r.left+r.width/2-world.left)/scale,y:(centerY-world.top)/scale};
  }
  function perform(id,targetId,options={}){
    if(animation||stage.editing)return false;
    const card=cardById(game,id);if(!card||!canPlay(game,id))return false;
    const c=cardDefinition(card);
    if(c.twoTargets){
      if(pendingChoice?.type==='duo'&&pendingChoice.id===id){options.secondTargetId=targetId;targetId=pendingChoice.targetId;}
      else {if(!game.fans.some(f=>f.id===targetId&&f.hp>0))return false;clearDrag();selectedCard=id;pendingChoice={type:'duo',id,targetId};render();announce('Choisis un deuxième spectateur distinct.');return false;}
    }
    if(c.discard&&!options.discardId){clearDrag();selectedCard=id;pendingChoice={type:'discard',id};render();root.querySelector('.bl-card-choice')?.scrollIntoView({block:'nearest'});return false;}
    const origin=pointFor(`[data-bl-actor="${CSS.escape(card.actorId)}"] .bl-cube`),r=playCard(game,id,targetId,options);
    clearDrag();
    if(!r.ok){announce(r.message);return false;}
    selectedCard=null;pendingChoice=null;
    animation={started:performance.now(),origin,events:[r.event,...r.effects],cued:new Set(),duration:(1+r.effects.length)*420+500};
    if(sound)playSound({type:'card',instrument:card.instrument});
    persist();render();requestAnimationFrame(animate);return true;
  }

  function juice(events,origin=null){
    if(!events.length)return render();
    animation={started:performance.now(),origin,events,cued:new Set(),duration:events.length*420+500};
    render();requestAnimationFrame(animate);
  }
  function drawEffects(){
    const canvas=root.querySelector('.bl-effects'),world=root.querySelector('.bl-world');if(!canvas||!world)return;
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    if(!animation)return;
    const elapsed=performance.now()-animation.started,reduced=getReducedEffects()||matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label=(text,pos,kind='')=>{if(!pos)return;const el=document.createElement('span');el.className='bl-juice-label '+kind;el.textContent=text;el.style.left=pos.x+'px';el.style.top=pos.y+'px';if(reduced)el.style.animation='none';world.append(el);setTimeout(()=>el.remove(),1000);};
    for(const [i,event] of animation.events.entries()){
      const age=(elapsed-i*420)/1000;if(age<0||age>1)continue;
      const source=event.fanId?pointFor(`[data-bl-fan="${CSS.escape(event.fanId)}"] .bl-cube`):event.actorId?pointFor(`[data-bl-actor="${CSS.escape(event.actorId)}"] .bl-cube`):animation.origin||{x:w/2,y:180};
      if(!animation.cued.has(i)){
        animation.cued.add(i);
        if(event.type!=='card')label(event.type==='finale'?'♫ FINALE':event.name,source,'bl-juice-support');
        if(event.tempoGain){label('♫ +'+event.tempoGain+' TEMPO',source,'bl-juice-support');world.classList.add('bl-tempo-flash');setTimeout(()=>world.classList.remove('bl-tempo-flash'),500);if(!reduced)world.querySelector('.bl-scene-canvas')?.animate([{translate:'0 0'},{translate:'-3px 1px'},{translate:'3px -1px'},{translate:'0 0'}],{duration:250});root.querySelector('[data-bl-tempo]')?.animate([{scale:'1'},{scale:'1.35',color:'#e7ffd2'},{scale:'1'}],{duration:400});}
        if(event.boostGain)label('✦ +'+event.boostGain+' SOUTIEN',source?{x:source.x,y:source.y+28}:source,'bl-juice-support');
        if(event.tempoSpent)label('♫ −'+event.tempoSpent+' TEMPO',source?{x:source.x,y:source.y-25}:source,'bl-juice-support');
        if(event.type==='card'&&!event.hits.length&&!event.tempoGain&&!event.boostGain)label(event.boost?'✦ +'+event.boost+' SOUTIEN':'♫ '+event.name,source,'bl-juice-support');
        for(const hit of event.hits||[]){
          const pos=pointFor(`[data-bl-fan="${CSS.escape(hit.id)}"] .bl-cube`);if(!pos)continue;
          label((hit.gain>=0?'+':'')+hit.gain+' ♥',{x:pos.x,y:pos.y-35},hit.gain<0?'bl-juice-loss':'');
          if(hit.after===0&&hit.before>0){label('✦ CONQUIS !',{x:pos.x,y:pos.y+40});const ring=document.createElement('i');ring.className='bl-juice-ring bl-juice-effect-'+(event.effect||event.type);ring.style.left=pos.x+'px';ring.style.top=pos.y+'px';world.append(ring);setTimeout(()=>ring.remove(),800);}
          if(!reduced)root.querySelector(`[data-bl-fan="${CSS.escape(hit.id)}"]`)?.animate([{scale:'1'},{scale:'1.12'},{scale:'1'}],{duration:330});
        }
        if(event.effect==='spotlight'||event.effect==='chorus')for(const id of event.targets){const pos=pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`);label(event.effect==='spotlight'?'✦ SENSIBLE':'♫ '+currentSong(game).style,pos,'bl-juice-support');}
        if(sound)playSound({type:event.type==='card'?'shot':'impact'});
      }
      const targets=event.targets||(event.hits||[]).map(h=>h.id);
      for(const id of targets){const target=pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`);if(!target||!source)continue;const p=Math.min(1,age/.35);ctx.strokeStyle=event.effect==='chorus'?'#d3b8ee':event.effect==='spotlight'?'#fff2b6':'#f8bdcf';ctx.globalAlpha=Math.max(0,1-age);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(source.x,source.y);ctx.lineTo(source.x+(target.x-source.x)*p,source.y+(target.y-source.y)*p);ctx.stroke();ctx.beginPath();ctx.arc(target.x,target.y,8+age*55,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    }
  }
  function animate(){
    if(!animation)return;drawEffects();
    if(performance.now()-animation.started<animation.duration)requestAnimationFrame(animate);else{animation=null;render();}
  }
  root.addEventListener('dragstart',event=>{const card=event.target.closest('[data-bl-card]');if(!card||!startDrag(card.dataset.blCard))return event.preventDefault();event.dataTransfer.setData('application/x-bandlive-card',activeCard);event.dataTransfer.effectAllowed='move';event.dataTransfer.setDragImage(dragImage,0,0);ghost=makeDragGhost(activeCard);document.body.append(ghost);moveDrag(event.clientX,event.clientY);});
  root.addEventListener('dragend',clearDrag);
  root.addEventListener('dragenter',event=>{if(!activeCard)return;event.preventDefault();moveDrag(event.clientX,event.clientY);});
  root.addEventListener('dragleave',event=>{if(!root.contains(event.relatedTarget)){dragPoint=null;highlightDrop(null);}});
  root.addEventListener('dragover',event=>{if(!activeCard)return;event.preventDefault();event.dataTransfer.dropEffect='move';moveDrag(event.clientX,event.clientY);});
  root.addEventListener('drop',event=>{if(!activeCard)return;event.preventDefault();const target=dropAtPoint(event.clientX,event.clientY),id=activeCard;if(target)perform(id,target.dataset.blTarget);else clearDrag();});
  root.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse')return;
    const choice=pendingChoice?.type==='duo'?event.target.closest('[data-bl-fan]'):pendingChoice?.type==='discard'?event.target.closest('[data-bl-discard]'):null;
    if(choice){choiceTouch={pointerId:event.pointerId,x:event.clientX,y:event.clientY,targetId:choice.dataset.blFan,discardId:choice.dataset.blDiscard};return;}
    const card=event.target.closest('[data-bl-card]');if(!card||!startDrag(card.dataset.blCard))return;
    event.preventDefault();dragPointer=event.pointerId;root.setPointerCapture(event.pointerId);ghost=makeDragGhost(activeCard);document.body.append(ghost);moveDrag(event.clientX,event.clientY);
  });
  root.addEventListener('pointermove',event=>{
    if(dragPointer!==event.pointerId)return;
    event.preventDefault();moveDrag(event.clientX,event.clientY);
  });
  root.addEventListener('pointerup',event=>{
    if(dragPointer!==event.pointerId){
      const choice=choiceTouch;choiceTouch=null;
      if(choice?.pointerId===event.pointerId&&pendingChoice&&Math.hypot(event.clientX-choice.x,event.clientY-choice.y)<12){event.preventDefault();if(choice.discardId)perform(pendingChoice.id,'audience',{discardId:choice.discardId});else perform(pendingChoice.id,choice.targetId);}
      return;
    }const id=activeCard,target=dropAtPoint(event.clientX,event.clientY);root.releasePointerCapture(event.pointerId);if(target)perform(id,target.dataset.blTarget);else clearDrag();});
  // Native HTML dragging cancels its mouse pointer. Only cancel a captured
  // touch/pen drag here; mouse dragging finishes through drop/dragend.
  root.addEventListener('pointercancel',event=>{choiceTouch=null;if(dragPointer===event.pointerId)clearDrag();});
  root.addEventListener('lostpointercapture',()=>{if(dragPointer!==null)clearDrag();});
  root.addEventListener('mouseover',event=>{showTip(event.target);if(selectedCard)highlightDrop(event.target.closest('[data-bl-target]')||document.activeElement?.closest('[data-bl-target]'));});root.addEventListener('focusin',event=>{showTip(event.target);if(selectedCard)highlightDrop(event.target.closest('[data-bl-target]')||document.activeElement?.closest('[data-bl-target]'));});
  root.addEventListener('mouseout',event=>{if(!event.relatedTarget||!root.contains(event.relatedTarget))hideTip();});root.addEventListener('focusout',hideTip);
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){clearDrag();selectedCard=null;pendingChoice=null;hideTip();render();}else if(event.key==='Enter'&&event.target.matches('.bl-audience')&&selectedCard){event.preventDefault();perform(selectedCard,'audience');}});
  root.addEventListener('click',async event=>{
    if(event.target.closest('[data-bl-style]')&&!selectedCard)return;
    const target=event.target.closest('button,[data-bl-target]');if(!target)return;
    if(target.id==='bl-layout'){clearDrag();selectedCard=null;pendingChoice=null;stage.toggle();}
    else if(target.id==='bl-layout-undo')stage.undo();
    else if(target.id==='bl-layout-reset')stage.reset();
    else if(stage.editing&&target.dataset.blCard)return;
    else if(target.dataset.blRewardActor){rewardChoice.actorId=target.dataset.blRewardActor;delete rewardChoice.slot;delete rewardChoice.kind;render();}
    else if(target.dataset.blRewardSlot!==undefined){rewardChoice.slot=Number(target.dataset.blRewardSlot);render();}
    else if(target.dataset.blRewardKind){rewardChoice.kind=target.dataset.blRewardKind;render();}
    else if(target.id==='bl-confirm-exchange'){const result=exchangeBandLiveCard(getWorld(),rewardChoice);notify(result.message);persist();render();}
    else if(target.dataset.blDiscard&&pendingChoice?.type==='discard'){perform(pendingChoice.id,'audience',{discardId:target.dataset.blDiscard});}
    else if(target.id==='bl-cancel-choice'){pendingChoice=null;selectedCard=null;pendingChoice=null;render();}
    else if(target.dataset.blSong){chooseSong(game,target.dataset.blSong);persist();render();}
    else if(target.dataset.blCard){pendingChoice=null;selectedCard=selectedCard===target.dataset.blCard?null:target.dataset.blCard;render();root.querySelector(`[data-bl-card="${CSS.escape(target.dataset.blCard)}"]`)?.focus({preventScroll:true});}
    else if(target.dataset.blTarget&&selectedCard)perform(selectedCard,target.dataset.blTarget);
    else if(target.id==='bl-start'){
      const plan=initializeDraft();if(!plan.ready){notify(plan.reason);return render();}
      game=createBandLiveFromWorld(getWorld(),draft);preparing=false;persist();render();
    }else if(target.id==='bl-simulate'&&!animation){clearDrag();selectedCard=null;pendingChoice=null;simulateBandLive(game,()=>persist());render();}
    else if(target.id==='bl-end'&&!animation){const start=game.events.length;endTurn(game);selectedCard=null;pendingChoice=null;persist();juice(game.events.slice(start));}
    else if(target.id==='bl-cancel'&&liveShow()){onConcertCancel?.();syncConcert();render();}
    else if(target.id==='bl-setup'&&!liveShow()){animation=null;clearDrag();selectedCard=null;pendingChoice=null;preparing=true;initializeDraft();render();}
    else if(target.id==='bl-resume'){preparing=false;render();}
    else if(target.id==='bl-return'&&['won','lost'].includes(game.phase)){animation=null;clearDrag();selectedCard=null;pendingChoice=null;persist();const concert=!!liveShow();if(concert){skipBandLiveExchange(getWorld());persist();}pendingChoice=null;onReturn({concert});if(concert)syncConcert();}
    else if(target.id==='bl-replay'&&!liveShow()){
      animation=null;clearDrag();selectedCard=null;pendingChoice=null;
      if(game.songOrder||game.freeSetlist){game=createConcertReplay(game);preparing=false;persist();render();return;}
      draft={groupId:game.groupId||'',memberIds:game.actors.map(a=>a.id),seed:game.seed,audienceSize:game.fans.length};
      const plan=initializeDraft();
      if(!game.groupId||plan.group?.id!==game.groupId||!plan.ready){preparing=true;return render();}
      game=createBandLiveFromWorld(getWorld(),draft);persist();render();
    }
    else if(target.id==='bl-sound'){sound=!sound&&await enableAudio();render();}
  });
  root.addEventListener('change',event=>{
    if(event.target.id==='bl-layout-hand'){const h=stage.settings(event.target.value);root.querySelector('#bl-layout-scale').value=Math.round((h.scale??.82)*100);root.querySelector('#bl-layout-fan').value=h.fan??26;}
    else if(event.target.id==='bl-layout-scale'||event.target.id==='bl-layout-fan')stage.tune(root.querySelector('#bl-layout-hand').value,{[event.target.id==='bl-layout-scale'?'scale':'fan']:Number(event.target.value)/(event.target.id==='bl-layout-scale'?100:1)});
    else if(event.target.id==='bl-group'){draft.groupId=event.target.value;draft.memberIds=null;initializeDraft();persist();render();}
    else if(event.target.dataset.blMember){const id=event.target.dataset.blMember;draft.memberIds=draft.memberIds.filter(member=>member!==id);if(event.target.checked){if(draft.memberIds.length>=RULES.maxMembers){event.target.checked=false;notify('Vingt-quatre musiciens maximum pour BandLive.');}else draft.memberIds.push(id);}persist();render();}
    else if(event.target.id==='bl-seed'){const seed=Number(event.target.value);if(Number.isInteger(seed)&&seed>=0&&seed<=4294967295)draft.seed=seed;else event.target.value=draft.seed;persist();}
    else if(event.target.id==='bl-audience-size'){const size=Number(event.target.value);if(Number.isInteger(size)&&size>=RULES.minAudience&&size<=RULES.maxAudience)draft.audienceSize=size;else event.target.value=draft.audienceSize;persist();}
  });
  window.addEventListener('blur',clearDrag);
  toggle.checked=true;toggle.disabled=true;toggle.closest('label')?.setAttribute('title','BandLive est le moteur de tous les nouveaux shows.');nav.hidden=!enabled&&!liveId;
  toggle.addEventListener('change',()=>{enabled=true;toggle.checked=true;nav.hidden=!enabled&&!liveId;hideTip();clearDrag();persist();if(!enabled)onDisable();});
  document.addEventListener('click',event=>{
    const concertButton=event.target.closest('[data-bandlive-concert]');
    if(concertButton&&enabled){const result=onConcertStart?.();if(!result?.ok){notify(result?.message||'Le spectacle ne peut pas commencer.');return;}syncConcert();onOpen();return;}
    const button=event.target.closest('[data-bandlive-open]');if(!button)return;
    syncConcert();if(!enabled&&!liveId)return;if(liveShow()){onOpen();return;}
    const plan=getPlan(),groupId=button.dataset.bandliveGroup||plan.groupId;
    if(!game||button.dataset.bandliveGroup||groupId&&groupId!==game.groupId){animation=null;clearDrag();selectedCard=null;pendingChoice=null;draft.groupId=groupId||draft.groupId;draft.memberIds=button.dataset.bandliveGroup?null:plan.members||null;preparing=true;initializeDraft();}
    onOpen();
  });
  const hideOnScroll=()=>{
    hideTip();if(!activeCard)clearPreview();
    const focused=document.activeElement;
    if(!activeCard&&root.contains(focused)&&focused.matches('[data-bl-fan],[data-bl-actor],[data-bl-style]')){
      const r=focused.getBoundingClientRect(),clip=focused.closest('.bl-audience-viewport')?.getBoundingClientRect();
      if(r.top>=Math.max(0,clip?.top||0)&&r.bottom<=Math.min(innerHeight,clip?.bottom||innerHeight)){showTip(focused);if(selectedCard)highlightDrop(focused.closest('[data-bl-target]'));}
    }
  };
  root.addEventListener('scroll',hideOnScroll,true);
  root.closest('main')?.addEventListener('scroll',hideOnScroll);
  const observer=new ResizeObserver(()=>{hideOnScroll();drawEffects();});observer.observe(root);
  return {
    openRehearsal(plan={}){if(!canStart()){notify('Termine la soirée avant une répétition.');return false;}animation=null;clearDrag();selectedCard=null;pendingChoice=null;draft={...draft,...plan};const resolved=initializeDraft();if(!resolved.ready){notify(resolved.reason);return false;}game=createBandLiveFromWorld(getWorld(),draft);preparing=false;persist();onOpen();return true;},
    enabled:()=>enabled,
    active:()=>!!(getWorld().performance?.bandLive&&getWorld().showEventId),
    sync:syncConcert,
    refresh(){syncConcert();lastReport=null;initializeDraft();render();},
    replayConcert(snapshot){if(!enabled||!canStart()){notify(!enabled?'Active BandLive dans Réglages pour revoir ce show.':'Termine la soirée avant de revoir un show.');return false;}animation=null;clearDrag();selectedCard=null;pendingChoice=null;liveId=null;game=createConcertReplay(snapshot);rehearsalGame=game;preparing=false;persist();onOpen();return true;},
    concertEntryHTML(show){if(show?.bandLive&&getWorld().showEventId)return '<div class="panel bl-entry"><b>Ce spectacle se joue avec BandLive.</b><button data-bandlive-open class="primary">Reprendre BandLive ↗</button></div>';if(!enabled||!show||show.preview||show.status!=='playing')return '';const plan=resolveBandLiveConcert(getWorld());return `<div class="panel bl-entry"><div><b>Jouer ce spectacle avec BandLive</b><p id="bandlive-eligibility" role="status">${plan.ready?`${plan.profile.label} · ${plan.profile.audienceSize} spectateurs · ${plan.songs.length} chansons au choix · ${esc(show.role||'Prestation')} · le résultat compte dans la partie.`:esc(plan.reason)}</p></div><button data-bandlive-concert aria-describedby="bandlive-eligibility" title="${esc(plan.reason||'Commencer ce spectacle avec BandLive')}" class="primary" ${plan.ready?'':'disabled'}>Jouer avec BandLive ↗</button></div>${eveningHTML(show)}`;},
    leave(){hideTip();clearDrag();inspection.hide();stage.leave();},
    entryHTML(){return enabled?'<div class="panel bl-entry"><div><b>BandLive · le show jouable</b><p>Réserve un show avec deux à vingt-quatre musiciens et un répertoire ou une jam libre. BandLive commence automatiquement à l’arrivée sur scène. Les répétitions restent sans récompense.</p></div><button data-bandlive-open class="primary">Essayer BandLive ↗</button></div>':'';},
  };
}
