import {createCardEditor} from './bandlive-card-editor.mjs?v=0.9.0';
import {replaceLabCard} from './bandlive-lab-card.mjs?v=0.9.0';
import {applyShowCard} from './bandlive-show-card.mjs?v=0.9.0';
import {createCatalog,compileCard,catalogCard} from './bandlive-catalog.mjs?v=0.9.0';
import {initializeCrowd,physicsSettings,inRadius} from './bandlive-crowd.mjs?v=0.9.0';
import {createBandLive} from './bandlive.mjs?v=0.9.0';
import {levelRewardsHTML,showLevelRewards} from './level-rewards.mjs?v=0.9.0';
import {cardFace} from './card-view.mjs?v=0.9.0';
import {personCard} from './person-card.mjs?v=0.9.0';
import {simulateBandLive} from './bandlive-auto.mjs?v=0.9.0';
import {REACTIONS,reactionText} from './bandlive-reactions.mjs?v=0.9.0';
import {createBandLiveStage} from './bandlive-stage.mjs?v=0.9.0';
import {resourceDockHTML,readResourceValues,animateResourceChanges} from './bandlive-resources.mjs?v=0.9.0';
import {tempoNotesHTML} from './bandlive-tempo-notes.mjs?v=0.9.0';
import {SIZE_CONTROLS} from './bandlive-layout-profile.mjs?v=0.9.0';
import {createBandLiveInspection} from './bandlive-inspection.mjs?v=0.9.0';
import {createDragFeedback,showDragFeedback,moveDragFeedback,fitFeedback} from './bandlive-drag-feedback.mjs?v=0.9.0';
import {createBandLiveAim} from './bandlive-aim.mjs?v=0.9.0';
import {musicianDeck,definitionFor,specialChoices} from './bandlive-cards.mjs?v=0.9.0';
import {drawMicroBody} from './character-view.mjs?v=0.9.0';
import {songTurns} from './song-rules.mjs?v=0.9.0';
import {groupLinkHTML} from './group-link.mjs?v=0.9.0';
import {RULES,INSTRUMENTS,SPECIALS,restoreBandLive,cardById,cardDefinition,currentSong,availableSongs,chooseSong,canPlay,playCard,endTurn,totalTurns,sectionName,CONQUEST_EFFECTS,conquestLabel,conquestDescription,audienceColumns,conquestTargets,favoriteStyle,previewCard,impactCrowd} from './bandlive.mjs?v=0.9.0';
import {resolveBandLivePlan,createBandLiveFromWorld} from './bandlive-roster.mjs?v=0.9.0';
import {concertLineup,createConcertReplay,resolveBandLiveConcert,unlockBandLiveRepertoire,exchangeBandLiveCard,skipBandLiveExchange} from './bandlive-concert.mjs?v=0.9.0';
import {NEEDS,PERSONALITY} from './engine.mjs?v=0.9.0';
import {instrumentArt} from './show-view.mjs?v=0.9.0';
import {decorateCube,enableAudio,playSound} from './v5-view.mjs?v=0.9.0';

const CARD_GLYPHS={guitar:'♬',bass:'↑',drums:'◉',keys:'≋',voice:'♫',sax:'♪',trumpet:'♩',percussion:'◉'};
const STORAGE='garage-vivant-bandlive-v1';
const SHOT_FLIGHT_MS=350;
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
function compactIntent(fan){return fan.intent==='bored'?'☾ −3':fan.intent==='attentive'?'⌕ +3':fan.intent==='distracted'?'⌖ −3':fan.intent==='rhythm'?'♫ '+fan.reactionTempo+'/3':fan.intent==='variety'?'♬ '+Math.min(1,fan.reactionActors.length)+'/2':'↗ +3';}

function fanHTML(game,fan){
  const conquered=fan.hp===0,amount=fan.max-fan.hp;
  return `<div class="bl-fan-wrap"><button class="bl-fan ${conquered?'bl-conquered bl-reaction-'+reaction(fan):''}" data-bl-fan="${esc(fan.id)}" data-bl-target="${esc(fan.id)}" aria-label="${esc(fan.name)} · ${amount}/${fan.max} · ${conquered?'Conquis':esc(reactionText(game,fan))}">
    ${conquered?'<span class="bl-conquered-glow" aria-hidden="true"></span>':game.spatialVersion&&fan.reactionUsed?'':`<span class="bl-intent">${esc(game.spatialVersion?compactIntent(fan):reactionText(game,fan))}</span>`}
    ${cubeHTML(fan,'fan')}<span class="bl-name"><b>${esc(fan.name)}</b>${styleIcon(favoriteStyle(fan))}</span>
    <span class="bl-resistance" role="progressbar" aria-label="Conquête de ${esc(fan.name)}" aria-valuemin="0" aria-valuemax="${fan.max}" aria-valuenow="${amount}" ${conquered?'aria-valuetext="Conquis"':''}>
      ${conquered?'<span class="bl-conquered-seal" aria-hidden="true"><span class="bl-conquered-heart">♥<i>✓</i></span><b>CONQUIS</b></span>':`<i style="width:${amount/fan.max*100}%"></i>`}
    </span>${conquered?'':`<span class="bl-hp">${amount}/${fan.max}</span>${conquestBadge(game,fan)}`}
    <output class="bl-damage-preview" data-bl-preview="${esc(fan.id)}" hidden></output>
  </button></div>`;
}

export function createBandLiveModule({getWorld,onOpen,onReturn,onDisable,canStart,notify,getReducedEffects=()=>false,getPlan=()=>({}),onConcertStart,onConcertUpdate,onConcertCancel,onCatalogSave=()=>{}}) {
  const root=document.querySelector('#bandlive-view'),nav=document.querySelector('#bandlive-nav'),toggle=document.querySelector('#bandlive-enabled');
  const versionButton=document.querySelector('#version'),versionHome=versionButton?.parentElement,versionNext=versionButton?.nextSibling;
  const restoreVersion=()=>{if(versionButton&&versionHome)versionHome.insertBefore(versionButton,versionNext?.parentElement===versionHome?versionNext:null);};
  let enabled=true,game=null,preparing=false,draft={groupId:'',memberIds:null,seed:2040,audienceSize:RULES.minAudience},selectedCard=null,activeCard=null,dragPointer=null,dragPoint=null,dragFrame=null,ghost=null,animation=null,sound=false,storageProblem=false,aimGeometry=null,previewFrame=null;
  try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved){enabled=true;if(saved.draft)draft=saved.draft;if(saved.game)game=restoreBandLive(saved.game);}}catch{notify('La répétition BandLive enregistrée ne peut pas être reprise. Le quartier est disponible.');}
  let labOriginal=null,labBaseline=null,labKind='push',labStrength=1,labShoot=false,theme='midnight';
  const stage=createBandLiveStage({root,getReducedEffects,onLayout:()=>{aimGeometry=null;syncLayoutTools();},onPositions:()=>{aimGeometry=null;previewMemo=null;persist();}});
  const cardEditor=createCardEditor({getWorld,onSave:onCatalogSave,onTest:startLab,onApplyCurrent:applyCurrentCard,canApplyCurrent:()=>{const current=labOriginal?.game||game;return !!current?.spatialVersion&&['choose','play'].includes(current.phase);}});
  const aim=createBandLiveAim();
  let rehearsalGame=game,liveId=null,lastReport=null,pendingChoice=null,rewardChoice={},choiceTouch=null,previewMemo=null,touchGrab=null,ignoreClick=false,quietPointer=null,lastPointer=null;
  const liveShow=()=>{const s=getWorld().performance;return !labOriginal&&liveId&&s?.id===liveId&&s.bandLive&&getWorld().showEventId?s:null;};
  function syncConcert(){
    if(labOriginal)return;
    unlockBandLiveRepertoire(getWorld());
    const show=getWorld().performance;
    if(show?.bandLive&&!show.preview&&getWorld().showEventId){if(!liveId)rehearsalGame=game;liveId=show.id;game=show.bandLive.game;preparing=false;}
    else if(liveId){liveId=null;game=rehearsalGame;preparing=!game;}
    nav.hidden=!enabled&&!liveId;
  }
  syncConcert();
  const tooltip=document.createElement('div');tooltip.id='bandlive-tooltip';tooltip.className='bl-tooltip';tooltip.role='tooltip';tooltip.hidden=true;document.body.append(tooltip);
  const previewLayer=document.createElement('div');previewLayer.className='bl-preview-layer';document.body.append(previewLayer);
  const inspection=createBandLiveInspection({root,onShow:hideTip,blocked:()=>stage.editing||!!animation||!!activeCard||!!quietPointer,lookup:id=>{if(!game)return null;const c=cardById(game,id);if(!c)return null;const actor=game.actors.find(a=>a.id===c.actorId);return {card:cardDefinition(c),owner:actor.name,instrument:INSTRUMENTS[c.instrument],instrumentKey:c.instrument,icon:CARD_GLYPHS[c.instrument],accent:actor.color};}});
  inspection.targets.append(previewLayer);
  const dragImage=document.createElement('canvas');dragImage.width=dragImage.height=1;dragImage.style.cssText='position:fixed;left:-10px;top:-10px;pointer-events:none';document.body.append(dragImage);
  function persist(){if(labOriginal)return;if(liveShow()&&liveShow().bandLive.game===game)onConcertUpdate?.();else if(!liveId)rehearsalGame=game;try{localStorage.setItem(STORAGE,JSON.stringify({enabled,draft,game:liveId?rehearsalGame:game}));storageProblem=false;}catch{if(!storageProblem)notify('La répétition ne peut pas être enregistrée dans ce navigateur.');storageProblem=true;}}
  function hideTip(){if(!activeCard&&!selectedCard)root.querySelector('.bl-radius-layer')?.remove();tooltip.hidden=true;root.querySelectorAll('.bl-conquest-area').forEach(el=>el.classList.remove('bl-conquest-area'));root.querySelectorAll('[aria-describedby="bandlive-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
  function showTip(target){
    if(quietPointer)return hideTip();
    const style=target.closest('[data-bl-style]'),actorEl=target.closest('[data-bl-actor]'),fanEl=target.closest('[data-bl-fan]');
    let html,anchor;
    if(style){html=esc(style.dataset.blStyle);anchor=style;}
    else if(actorEl&&game){html=actorTooltip(game.actors.find(a=>a.id===actorEl.dataset.blActor));anchor=actorEl;}
    else if(fanEl&&game){html=fanTooltip(game,game.fans.find(f=>f.id===fanEl.dataset.blFan));anchor=fanEl;}
    else return hideTip();
    if(activeCard||selectedCard||animation)return hideTip();
    inspection.hide();
    root.querySelectorAll('.bl-conquest-area').forEach(el=>el.classList.remove('bl-conquest-area'));
    if(fanEl&&game&&!style){const source=game.fans.find(f=>f.id===fanEl.dataset.blFan);if(game.spatialVersion&&!source.conquered&&CONQUEST_EFFECTS[source.effect])showRadius(source.position,1,0,{state:'potential',label:'À la conquête · rayon 1'});if(!source.conquered)for(const fan of conquestTargets(game,source))root.querySelector(`[data-bl-fan="${CSS.escape(fan.id)}"]`)?.classList.add('bl-conquest-area');}
    tooltip.innerHTML=html;for(const canvas of tooltip.querySelectorAll('[data-bl-cube]'))drawCube(canvas,game.fans.find(f=>f.id===canvas.dataset.blCube));tooltip.hidden=false;anchor.setAttribute('aria-describedby',tooltip.id);
    const r=anchor.getBoundingClientRect(),w=tooltip.offsetWidth,h=tooltip.offsetHeight;
    tooltip.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';
    tooltip.style.top=(r.bottom+h+12<innerHeight?r.bottom+9:Math.max(8,r.top-h-9))+'px';
    if(fanEl&&!style&&game.spatialVersion){const {position}=fitFeedback(tooltip,{pointer:{x:r.left+r.width/2,y:r.top+r.height/2},target:r,zones:radiusZones(),bounds:{left:8,right:innerWidth-8,top:8,bottom:innerHeight-8}});tooltip.style.left=position.x+'px';tooltip.style.top=position.y+'px';}
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
    const cards=game.hand.map(id=>cardById(game,id)).filter(c=>c.actorId===actor.id);
    if(labOriginal)cards.sort((a,b)=>Number(a.kind==='lab:test')-Number(b.kind==='lab:test'));
    const step=Math.min(26,100/Math.max(1,cards.length-1));
    return `<div class="bl-hand" style="width:${110+Math.max(0,cards.length-1)*step}px" aria-label="Cartes de ${esc(actor.name)}">${cards.map((card,i)=>{
      const c=cardDefinition(card),power=Object.hasOwn(c,'power'),tag=power?'impact':'rhythm';
      return `<button type="button" class="bl-card ${power?'bl-power':'bl-preparation'} ${selectedCard===card.id?'bl-selected':''}" data-bl-card="${esc(card.id)}" draggable="true" style="left:${i*step}px;--bl-card-order:${i}" ${!canPlay(game,card.id)||animation?'disabled':''} aria-label="${esc(c.name)} · ${INSTRUMENTS[card.instrument]} · ${c.cost} énergie. ${esc(c.description)}" aria-pressed="${selectedCard===card.id}">${cardFace({card:c,owner:actor.name,instrument:actor.instrument})}</button>`;
    }).join('')}${!cards.length?'<span class="bl-empty-hand">Aucune carte en main</span>':''}</div>`;
  }
  function pilesHTML(){
    const list=ids=>ids.map(id=>cardById(game,id)).sort((a,b)=>a.actorId.localeCompare(b.actorId)||a.kind.localeCompare(b.kind)).map(c=>'<li>'+cardFace({card:cardDefinition(c),owner:game.actors.find(a=>a.id===c.actorId).name,instrument:c.instrument})+'</li>').join('')||'<li>Vide</li>';
    return '<details class="bl-piles"><summary>Cartes <span>'+game.hand.length+' en main</span></summary><div><p>Pioche '+game.deck.length+' · Main '+game.hand.length+' · Défausse '+game.discard.length+'</p><h4>Pioche · contenu sans ordre de tirage</h4><ul>'+list(game.deck)+'</ul><h4>Défausse</h4><ul>'+list(game.discard)+'</ul></div></details>';
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
  function startLab(card=null){
    if(stage.editing)stage.toggle();
    const entering=!labOriginal;if(entering)labOriginal={game,preparing};
    if(entering)game=labOriginal.game?structuredClone(labOriginal.game):createBandLive({people:getWorld().people.slice(0,4),songs:[{id:'lab',title:'Essai musical',style:'Jazz',turns:5}],audienceSize:12,spatial:true,catalog:getWorld().cardCatalog});
    if(!game.spatialVersion){initializeCrowd(game);game.catalog=createCatalog();for(const a of game.actors)a.bandLiveDeck=game.cards.filter(c=>c.actorId===a.id).map(c=>c.kind);for(const c of game.cards)c.definition=compileCard(catalogCard(game.catalog,c.instrument,c.kind));}
    if(game.phase==='choose')chooseSong(game,game.songs[0].id);
    if(['won','lost'].includes(game.phase)){game.phase='play';for(const f of game.fans){f.hp=f.max;f.conquered=false;f.reactionUsed=false;}}
    game.energy=3;preparing=false;animation=null;clearDrag();selectedCard=null;pendingChoice=null;
    if(card)game=replaceLabCard(game,card,{original:labOriginal.game});
    labBaseline=structuredClone(game);labShoot=false;render();
  }
  function applyCurrentCard(card){
    const current=labOriginal?.game||game,result=applyShowCard(current,card);
    if(stage.editing)stage.toggle();animation=null;clearDrag();pendingChoice=null;
    if(labOriginal){preparing=labOriginal.preparing;labOriginal=null;labBaseline=null;labShoot=false;}
    Object.assign(current,result.game);game=current;selectedCard=result.cardId;persist();render();
    notify('« '+card.name+' » appliquée au show en cours.');
  }
function labControlsHTML(){return `<div class="bl-lab-controls" role="group" aria-label="Laboratoire physique"><strong>LABO · COPIE DU SHOW</strong>${game.cards.some(c=>c.kind==='lab:test')?`<button id="bl-lab-replay-card" ${animation?'disabled':''}>Rejouer la carte</button>`:''}<label>Impact<select id="bl-lab-kind">${['push','pull','vortex','jump','return'].map((k,i)=>`<option value="${k}" ${labKind===k?'selected':''}>${['Repousser','Attirer','Tourbillon','Bondir','Retour élastique'][i]}</option>`).join('')}</select></label><label>Force<select id="bl-lab-strength"><option value="0.5" ${labStrength===.5?'selected':''}>Faible</option><option value="1" ${labStrength===1?'selected':''}>Moyenne</option><option value="2" ${labStrength===2?'selected':''}>Forte</option></select></label><button id="bl-lab-shoot" aria-pressed="${labShoot}">${labShoot?'✓ Vise un endroit au sol':'Tester un impact'}</button><button id="bl-lab-reset">Recommencer le test</button><button id="bl-lab-export">Exporter le scénario</button><button id="bl-lab-import">Importer un scénario</button><input id="bl-lab-file" type="file" accept="application/json" hidden><button id="bl-lab-close">Quitter le labo</button></div>`;}
  function physicalPanelHTML(){return `<fieldset><legend>Foule physique</legend><p>Toutes les frappes repoussent leur cible. Un choc assez fort donne des cœurs au spectateur percuté, une fois par paire et par impulsion. Le laboratoire travaille sur une copie.</p>${[['force','Force d’impact',30,650,10],['grip','Adhérence au sol',1,12,.5],['rebound','Rebond',0,.85,.05],['hitStrength','Force des frappes',0,2,.05],['collisionRadius','Rayon de contact',16,48,1],['collisionThreshold','Seuil du choc (unités/s)',0,400,5],['collisionPower','Cœurs au contact',0,10,1]].map(([key,label,min,max,step])=>`<label>${label}<output data-bl-physics-output="${key}">${game.physics[key]}</output><input data-bl-physics="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${game.physics[key]}"></label>`).join('')}<label>Unité de rayon<output data-bl-radius-output>${game.room.radiusUnit}</output><input id="bl-radius-unit" type="range" min="60" max="240" step="5" value="${game.room.radiusUnit}"></label><button id="bl-lab">Ouvrir le laboratoire ↗</button><button id="bl-cards">Créer et gérer les cartes ↗</button></fieldset>`;}
  function showRadius(center,radius=1,core=0,{state='card',label=''}={}){
    const world=root.querySelector('.bl-world');if(!game?.spatialVersion||!world||!center)return;
    let layer=world.querySelector('.bl-radius-layer');if(!layer){layer=document.createElementNS('http://www.w3.org/2000/svg','svg');layer.classList.add('bl-radius-layer');layer.setAttribute('aria-hidden','true');world.append(layer);}
    layer.hidden=false;layer.dataset.state=state;const p=stage.crowdPoint(center),sx=1,unit=game.room.radiusUnit;
    layer.setAttribute('viewBox',`0 0 ${world.clientWidth} ${world.clientHeight}`);
    layer.innerHTML=`<ellipse class="bl-radius-outer" cx="${p.x}" cy="${p.y}" rx="${radius*unit*sx}" ry="${radius*unit}"/>${core?`<ellipse class="bl-radius-core" cx="${p.x}" cy="${p.y}" rx="${core*unit*sx}" ry="${core*unit}"/>`:''}<circle class="bl-radius-center" cx="${p.x}" cy="${p.y}" r="5"/>${label?`<text class="bl-radius-label" x="${p.x}" y="${p.y-radius*unit+20}" text-anchor="middle">${esc(label)}</text>`:''}`;
  }
  function radiusZones(){return [...root.querySelectorAll('.bl-radius-outer,.bl-radius-chain')].map(el=>{const r=el.getBoundingClientRect();return {cx:r.left+r.width/2,cy:r.top+r.height/2,rx:r.width/2,ry:r.height/2};});}
  function showResolvedAreas(preview,primarySource=null){
    const areas=preview?.areas||[],seen=new Set(),markers=new Set();
    for(const area of areas){
      const key=[area.kind,area.sourceId,area.center.x,area.center.y,area.radius].join(':');if(seen.has(key))continue;seen.add(key);
      let layer=root.querySelector('.bl-radius-layer');
      const main=area.kind==='conquest'&&area.sourceId===primarySource;
      const initialCard=area.kind==='card'&&areas.find(a=>a.kind==='card')===area;
      if(!layer){showRadius(area.center,area.radius,area.coreRadius,{state:area.kind==='conquest'?'triggered':'card',label:area.kind==='conquest'?'CONQUÊTE ! · effet déclenché':''});layer=root.querySelector('.bl-radius-layer');if(area.kind==='conquest')layer.querySelector('.bl-radius-outer').setAttribute('data-bl-radius-source',area.sourceId);}
      else if(!main&&!initialCard){const p=stage.crowdPoint(area.center),r=area.radius*game.room.radiusUnit,name=area.kind==='conquest'?game.fans.find(f=>f.id===area.sourceId)?.name:'Après déplacement';layer.insertAdjacentHTML('beforeend',`<ellipse class="bl-radius-chain" data-bl-radius-source="${esc(area.sourceId)}" cx="${p.x}" cy="${p.y}" rx="${r}" ry="${r}"/><text class="bl-radius-label bl-radius-chain-label" x="${p.x}" y="${p.y-r+20}" text-anchor="middle">${area.kind==='conquest'?'En chaîne · ':''}${esc(name)}</text>`);}
      if(main)layer.querySelector('.bl-radius-outer')?.setAttribute('data-bl-radius-source',area.sourceId);
      for(const target of [...area.targets,...(area.kind==='conquest'?[{id:area.sourceId,position:area.center}]:[])]){
        const before=game.fans.find(f=>f.id===target.id)?.position;if(!before||Math.hypot(before.x-target.position.x,before.y-target.position.y)<4)continue;
        const key=[target.id,target.position.x,target.position.y].join(':');if(markers.has(key))continue;markers.add(key);
        const a=stage.crowdPoint(before),b=stage.crowdPoint(target.position);
        layer.insertAdjacentHTML('beforeend',`<g class="bl-radius-movement" data-bl-future-target="${esc(target.id)}"><path d="M ${a.x} ${a.y} L ${b.x} ${b.y}"/><circle cx="${b.x}" cy="${b.y}" r="23"/><text x="${b.x}" y="${b.y+4}" text-anchor="middle">↗</text></g>`);
      }
    }
  }
  function physicalChrome(){
    if(!game?.spatialVersion||preparing)return;
    const arena=root.querySelector('.bl-arena');arena.classList.add('bl-spatial');arena.dataset.theme=theme;
    const screen=root.querySelector('.bl-show-screen'),footer=document.createElement('div');footer.className='bl-lab-footer';
    footer.innerHTML=`<div class="bl-footer-tools"><button id="bl-neighborhood">← Quartier</button><button id="bl-cards">Cartes</button><button id="bl-lab">Laboratoire</button></div>${labOriginal?labControlsHTML():''}`;screen.append(footer);
    const tools=footer.querySelector('.bl-footer-tools');if(versionButton)tools.append(versionButton);if(game.actors.length>6){tools.insertAdjacentHTML('beforeend',`<div class="bl-formation-pages"><button id="bl-page-prev" ${stage.page===0||animation?'disabled':''}>◀</button><span>Musiciens ${stage.page*6+1}–${Math.min(game.actors.length,stage.page*6+6)}/${game.actors.length}</span><button id="bl-page-next" ${stage.page===Math.ceil(game.actors.length/6)-1||animation?'disabled':''}>▶</button></div>`);}
    for(const el of [root.querySelector('#bl-layout'),root.querySelector('.bl-top-controls')])if(el)tools.append(el);
    const song=root.querySelector('.bl-song-progress');if(song){const details=document.createElement('details');details.className='bl-song-details';details.innerHTML='<summary>Chansons</summary>';details.append(song);tools.append(details);}
    const resources=root.querySelector('.bl-resources'),dock=root.querySelector('.bl-resource-dock');if(dock)resources.insertBefore(dock,resources.lastElementChild);
    root.querySelector('.bl-hud').insertAdjacentHTML('beforeend',`<div class="bl-theme-tabs" role="group" aria-label="Direction artistique">${[['mint','Menthe'],['midnight','Minuit'],['pop','Pop']].map(([id,label])=>`<button data-bl-theme="${id}" aria-pressed="${theme===id}">${label}</button>`).join('')}</div>`);
  }
  function topControlsHTML(finished,live){
    return `<div class="bl-top-controls">${!game.spatialVersion?'<button id="bl-cards">Cartes</button><button id="bl-lab">Laboratoire</button>':''}<button id="bl-sound" aria-pressed="${sound}">Son : ${sound?'ON':'OFF'}</button>${pilesHTML()}${!finished?`<button id="bl-simulate" ${animation?'disabled':''}>Simuler le show</button>`:''}${live?'':'<button id="bl-setup" class="text-button">Changer le band</button>'}</div>`;
  }
  function rewardHTML(show){
    const reward=show.bandLive.reward;if(!reward){
      const people=showLevelRewards(getWorld(),show);if(!people.length)return '';
      const chosen=people.find(p=>p.id===rewardChoice.actorId)||people[0];
      return `<section class="bl-reward panel"><h3>✦ Niveaux gagnés pendant ce show</h3><p>Choisis un musicien. Les récompenses restent disponibles dans sa fiche si tu continues la soirée.</p><div class="bl-reward-actors">${people.map(p=>`<button data-bl-reward-actor="${esc(p.id)}" aria-pressed="${p.id===chosen.id}">${personCard(p,{interactive:false})}</button>`).join('')}</div>${levelRewardsHTML(chosen,{limit:1,catalog:getWorld().cardCatalog})}</section>`;
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
    return `<details class="bl-evening panel" ${expanded?'open':''}><summary>Programmation de la soirée · ${lineup.length} groupes${welcome?` · accueil initial ${welcome} %`:''}</summary><ol>${lineup.map(entry=>`<li ${entry.current?'aria-current="step"':''}><b>${esc(entry.role)} · ${esc(entry.name)}</b><span>${state(entry)}</span></li>`).join('')}</ol><p>Le groupe suivant conserve 20 % de l’accueil obtenu auprès de chaque spectateur, dans la limite de 30 %. Chaque groupe joue avec ses musiciens, ses decks et son répertoire.</p>${show.bandLive?`<p>${enabled?'Les groupes suivants continuent dans BandLive avec leurs musiciens, leurs decks et leur répertoire. Les jams libres et les longues réservations utilisent aussi ce moteur.':'BandLive est désactivé : le groupe suivant jouera en spectacle classique.'}</p>`:''}</details>`;
  }
  function layoutToolsHTML(){
    if(game.phase!=='play')return '';
    return `<button id="bl-layout" aria-pressed="${stage.editing}" ${animation?'disabled':''}>${stage.editing?'✓ Terminer la disposition':'✥ Disposition'}</button><section class="bl-layout-tools" aria-label="Disposition de la scène" ${stage.editing?'':'hidden'}>
      <div class="bl-layout-heading"><strong>✥ Disposition</strong><button id="bl-layout-close" aria-label="Fermer la disposition">✕</button></div>
      <p>Déplace les personnages et les mains. Ajuste les tailles en direct.</p>
      ${game.spatialVersion?physicalPanelHTML():''}<fieldset><legend>Personnages</legend>${Object.entries(SIZE_CONTROLS).map(([key,{label,min,max}])=>`<label>${label}<output data-bl-size-output="${key}">100 %</output><input data-bl-layout-size="${key}" type="range" min="${min}" max="${max}" step="5" value="100"></label>`).join('')}</fieldset>
      <fieldset><legend>Cartes</legend><label class="bl-layout-hand-choice">Main<select id="bl-layout-hand"><option value="">Tout le groupe</option>${game.actors.map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}</select></label><small id="bl-layout-mixed" hidden>Tailles ou éventails différents · le prochain réglage s’applique à toutes les mains.</small><label>Taille<output id="bl-layout-scale-value"></output><input id="bl-layout-scale" type="range" min="55" max="165" step="1" value="100"></label><label>Éventail<output id="bl-layout-fan-value"></output><input id="bl-layout-fan" type="range" min="0" max="60" value="26"></label></fieldset>
      <div class="bl-layout-actions"><button id="bl-layout-undo">Annuler</button><button id="bl-layout-reset">Réinitialiser</button></div>
      <p>${game.spatialVersion?'Les distances déterminent les voisins.':'Les cases conservent les voisins.'} Tes réglages restent dans ce navigateur.</p>
      <button id="bl-layout-export" class="primary">Exporter ma disposition ↗</button><div id="bl-layout-export-panel" hidden><label>Code à me transmettre<textarea id="bl-layout-code" readonly spellcheck="false" aria-label="Code de la disposition"></textarea></label><div class="bl-layout-actions"><button id="bl-layout-copy">Copier le code</button><button id="bl-layout-download">Télécharger .json</button></div></div>
    </section>`;
  }
  function syncLayoutTools(){
    const panel=root.querySelector('.bl-layout-tools');if(!panel)return;
    const sizes=stage.sizeSettings();for(const input of panel.querySelectorAll('[data-bl-layout-size]')){const key=input.dataset.blLayoutSize;input.value=Math.round(sizes[key]*100);panel.querySelector(`[data-bl-size-output="${key}"]`).textContent=input.value+' %';}
    const hand=stage.settings(panel.querySelector('#bl-layout-hand').value);
    for(const [key,factor,suffix] of [['scale',100,' %'],['fan',1,'°']]){const input=panel.querySelector('#bl-layout-'+key);input.value=Math.round(hand[key]*factor);panel.querySelector('#bl-layout-'+key+'-value').textContent=input.value+suffix;}
    panel.querySelector('#bl-layout-mixed').hidden=!hand.mixed;
    if(!panel.querySelector('#bl-layout-export-panel').hidden)panel.querySelector('#bl-layout-code').value=stage.exportCode({commit:false});
  }
  function showHTML(){
    const song=currentSong(game),won=game.phase==='won',lost=game.phase==='lost',finished=won||lost,choosing=game.phase==='choose'&&!animation,live=liveShow();
    const eyebrow=labOriginal?'BANDLIVE · LABORATOIRE · COPIE DU SHOW':live?`BANDLIVE · ${esc(live.role||'Prestation')} · ${esc(live.opportunityName)}`:(game.songOrder||game.freeSetlist)?'BANDLIVE · REPLAY SANS RÉCOMPENSE':'BANDLIVE · RÉPÉTITION';
    const record=live&&getWorld().showHistory.find(r=>r.id===live.id);
    const effect=(label,key)=>{const e=record?.effects;return e?`<span><b>${Math.round(e.before[key])} → ${Math.round(e.after[key])}</b> ${label}</span>`:'';};
    const report=finished&&live?`<section class="bl-concert-result panel"><span class="eyebrow">BILAN DU SPECTACLE</span><h3>${won?'Tout le public est conquis !':'Le show est terminé.'}</h3><div class="bl-result-values"><span><b>${live.result.score}/100</b> Accueil du public</span><span><b>${live.sourceOpportunity.organizer?.exigence||30}/100</b> Attentes de la scène</span>${effect('Réputation','reputation')}${effect('Moral','morale')}${effect('Coordination','development')}</div><ul>${(record?.musicianEffects||[]).map(p=>`<li>${esc(p.name)} · énergie ${Math.round(p.energyBefore)} → ${Math.round(p.energyAfter)}</li>`).join('')}</ul><p>Le bilan dépend de l’accueil du public et des attentes de cette scène. Ce résultat compte dans la partie et reste dans l’historique du groupe.</p></section>`:'';
    const waiting=live&&concertLineup(getWorld(),live).some(b=>['booked','assembling'].includes(b.status));
    return `<div class="bl-arena ${!!game.conquestVersion?'bl-conquest-board':''} ${choosing?'bl-is-choosing':''}"><section class="bl-show-screen"><div class="bl-hud"><div class="bl-show-title"><span class="eyebrow">${eyebrow}</span><h2>${groupLinkHTML(getWorld().groups.find(g=>g.id===game.groupId),game.groupName)}</h2><p>${song?`${esc(song.title)} · ${esc(song.style)} · ${sectionName(game)} · passage ${game.usedSongs.length}/2`:'Deux passages pour conquérir le public.'}</p></div>${songProgressHTML()}<div class="bl-resources"><span><small>TOUR</small><b>${game.turn||1}</b></span><span><small>CONQUIS</small><b>${game.fans.filter(f=>f.hp===0).length} / ${game.fans.length}</b></span>${game.relayBoosts?.length?`<span class="bl-boost"><b>+${game.relayBoosts.reduce((n,b)=>n+b.power,0)}</b> Relais · autre musicien</span>`:''}${game.boost?`<span class="bl-boost"><b>+${game.boost}</b> Prochaine puissance · ce tour</span>`:''}</div>${topControlsHTML(finished,live)}</div>${choosing?`<div class="bl-song-overlay" role="dialog" aria-modal="true" aria-label="Choisir la toune"><div class="bl-song-choice"><span class="eyebrow">LE PUBLIC CE SOIR</span><div class="bl-crowd-overview">${[...new Set(game.fans.map(favoriteStyle))].map(style=>`<span>${styleIcon(style)} ${esc(style)} <b>${game.fans.filter(f=>favoriteStyle(f)===style).length}</b></span>`).join('')}</div><p class="bl-crowd-moods">${Object.entries(REACTIONS).map(([id,r])=>{const n=game.fans.filter(f=>!f.conquered&&!f.reactionUsed&&f.intent===id).length;return n?`${n} ${r.name}`:'';}).filter(Boolean).join(' · ')}</p><b>${game.songOrder?(game.turn?'Deuxième passage de la setlist · −2 tempo au départ':'Setlist réservée · première chanson'):game.turn?(game.songs.length===1?'Reprise de la chanson · −2 tempo au départ':'Choisis la deuxième chanson · −2 tempo au départ'):'Choisis la première chanson'}</b>${availableSongs(game).map(s=>`<button data-bl-song="${esc(s.id)}"><strong>${esc(s.title)}</strong>${styleIcon(s.style)}<small>${esc(s.style)} · ${game.version>=4?songTurns(s):3} tours · finale : 3 puissance sur tout le public</small><span class="bl-song-match">♥ ${game.fans.filter(f=>!f.conquered&&favoriteStyle(f)===s.style).length} fans partagent ce style</span></button>`).join('')}</div></div>`:''}<div class="bl-playfield"><div class="bl-viewport"><div class="bl-world bl-minuit" style="--bl-players:${game.actors.length};--bl-fans:${game.fans.length>6?Math.ceil(game.fans.length/2):game.fans.length}"><canvas class="bl-effects" aria-hidden="true"></canvas><div class="bl-stage-sign" aria-hidden="true"><span>GARAGE VIVANT</span><b>LIVE SESSION</b></div><div class="bl-musicians">${game.actors.map(actor=>`<section class="bl-musician" data-bl-musician="${esc(actor.id)}"><div class="bl-musician-info" data-bl-actor="${esc(actor.id)}" tabindex="0" aria-label="Informations de ${esc(actor.name)}"><span class="bl-status-icon" aria-label="Statistiques et action de ${esc(actor.name)}">${animation?.event?.actorId===actor.id?'♫':'ⓘ'}<small>${animation?.event?.actorId===actor.id?esc(animation.event.name):'Prêt'} · ${Math.round(actor.needs.energy??0)} ⚡</small></span><span class="bl-performer">${cubeHTML(actor,'actor')}${instrumentArt(actor.instrument,'rhythm')}</span><div class="bl-name"><b>${esc(actor.name)}</b>${styleIcon(actor.genre)}</div><small>${INSTRUMENTS[actor.instrument]}</small></div>${!choosing&&!finished?handHTML(actor):''}</section>`).join('')}</div><div class="bl-audience-viewport" tabindex="0" role="region" aria-label="Public du concert"><div class="bl-audience" data-bl-target="audience" tabindex="0" role="group" aria-label="Zone du public. Dépose ici une carte collective ou de préparation."><span class="bl-zone-label">Public</span><div class="bl-fans" ${!!game.conquestVersion?`style="grid-template-columns:repeat(${audienceColumns(game)},minmax(0,1fr))"`:""}>${game.fans.map(fan=>fanHTML(game,fan)).join('')}</div><span class="bl-drop-hint">Cartes collectives et préparations → dépose dans cette zone</span></div></div></div></div></div>${resourceDockHTML(game)}${game.phase==='play'?`<div class="bl-turn-dock"><button id="bl-end" class="primary ${game.hand.some(id=>canPlay(game,id))?'':'bl-turn-ready'}" ${animation?'disabled':''}>Fin du tour <span>➜</span></button></div>`:''}</section><section class="bl-show-details">${live?eveningHTML(live,finished):''}${report}${finished&&live?`<section class="bl-xp-report">${(getWorld().showHistory.find(r=>r.id===live.id)?.individualXp||[]).map(x=>`<div>${personCard(getWorld().people.find(p=>p.id===x.id))}<b class="${x.levelAfter>x.levelBefore?'bl-level-up':''}">+${x.gain} XP ${x.levelAfter>x.levelBefore?`✦ NIVEAU ${x.levelAfter} !`:''}</b></div>`).join('')}</section>`+rewardHTML(live):''}${choiceHTML()}<div class="bl-controls">${layoutToolsHTML()}<p id="bl-help" role="status">${finished?(won?'Tout le public est conquis !':'Le show est terminé. Il reste du public à conquérir.'):choosing?'Choisis une chanson pour piger ta main.':pendingChoice?.type==='duo'?'Choisis le deuxième spectateur, différent du premier.':pendingChoice?.type==='discard'?'Choisis la carte à défausser ci-dessus.':selectedCard?'Choisis un spectateur ou la zone du public.':'Glisse une carte vers le public, ou sélectionne-la puis choisis sa cible.'}</p>${live&&!finished?'<button id="bl-cancel" class="text-button">Interrompre le show</button>':''}${finished?`<button id="bl-return" class="primary">${live?.bandLive.reward?.status==='pending'?(waiting?'Continuer la soirée sans échange →':'Continuer sans échange →'):waiting?'Continuer la soirée →':'Retour au quartier · continuer'}</button>${live?'':'<button id="bl-replay">Rejouer la répétition</button>'}`:''}</div><details class="bl-log"><summary>Déroulement du show · ${game.played} cartes jouées</summary><div>${game.logs.map(line=>`<p>${esc(line)}</p>`).join('')}</div></details></section></div>`;
  }
  function render(){
    aimGeometry=null;
    previewMemo=null;
    const previousResources=readResourceValues(root);
    const previousViewport=root.querySelector('.bl-viewport'),previousAudience=root.querySelector('.bl-audience-viewport');
    const scroll=previousViewport?{x:previousViewport.scrollLeft,y:previousAudience?.scrollTop||0}:null;
    restoreVersion();hideTip();root.innerHTML=game&&!preparing?showHTML():setupHTML();
    physicalChrome();if(preparing)root.querySelector('.bl-setup')?.insertAdjacentHTML('beforeend','<button id="bl-cards">Atelier de cartes ↗</button>');
    syncCardSelection();
    root.querySelector('.bl-audience')?.insertAdjacentHTML('afterbegin',tempoNotesHTML());
    animateResourceChanges(root,previousResources,getReducedEffects()||matchMedia('(prefers-reduced-motion: reduce)').matches);
    previewLayer.replaceChildren(...root.querySelectorAll('[data-bl-preview]'));
    const viewport=root.querySelector('.bl-viewport'),audience=root.querySelector('.bl-audience-viewport');
    if(game&&!preparing){for(const canvas of root.querySelectorAll('[data-bl-cube]')){const actor=canvas.dataset.blCubeType==='actor'?game.actors.find(a=>a.id===canvas.dataset.blCube):game.fans.find(f=>f.id===canvas.dataset.blCube);drawCube(canvas,actor,actor.hp===0);}stage.mount(root.querySelector('.bl-world'),game);aim.attach(root.querySelector('.bl-world'));if(selectedCard)inspection.pin(selectedCard);drawEffects();}
    syncLayoutTools();if(viewport&&scroll){viewport.scrollLeft=scroll.x;if(audience)audience.scrollTop=scroll.y;}
    drawEffects();
    if(animation?.pending)lockCardFlight();else delete root.dataset.blFlight;
    if(!game||preparing){stage.mount(null,game);inspection.hide();}
    if(liveShow()&&['won','lost'].includes(game.phase)&&!animation&&lastReport!==game){root.querySelector('.bl-concert-result')?.scrollIntoView({block:'start'});lastReport=game;}
  }
  function announce(message){const help=root.querySelector('#bl-help');if(help)help.textContent=message;}
  function syncCardSelection(){
    root.querySelectorAll('[data-bl-card]').forEach(el=>{const selected=el.dataset.blCard===selectedCard;el.classList.toggle('bl-selected',selected);el.setAttribute('aria-pressed',String(selected));});
    const dock=root.querySelector('.bl-turn-dock');if(!dock)return;
    let button=dock.querySelector('#bl-put-back');if(!button){button=document.createElement('button');button.id='bl-put-back';button.type='button';button.innerHTML='✕ Reposer la carte <kbd>Échap</kbd>';dock.append(button);}button.hidden=!selectedCard;
  }
  function cancelCard({pointer=null,suppressClick=false}={}){
    const hadCard=!!(selectedCard||activeCard||pendingChoice||touchGrab),hadChoice=!!pendingChoice;selectedCard=null;pendingChoice=null;choiceTouch=null;touchGrab=null;
    quietPointer=hadCard||suppressClick?pointer||dragPoint||lastPointer||{x:NaN,y:NaN}:null;if(suppressClick)ignoreClick=true;
    clearDrag();hideTip();syncCardSelection();if(hadChoice)root.querySelector('.bl-card-choice')?.remove();
    if(hadCard)announce('Carte reposée en main. Glisse une carte vers le public, ou sélectionne-la puis choisis sa cible.');
  }
  function selectCard(id,pointer=null){
    if(selectedCard===id){cancelCard({pointer});return;}
    clearDrag();hideTip();quietPointer=null;pendingChoice=null;selectedCard=id;render();root.querySelector(`[data-bl-card="${CSS.escape(id)}"]`)?.focus({preventScroll:true});
  }
  function clearDrag(){
    previewMemo=null;
    if(previewFrame!==null)cancelAnimationFrame(previewFrame);previewFrame=null;aimGeometry=null;
    const pointer=dragPointer;selectedCard=null;pendingChoice=null;choiceTouch=null;activeCard=null;dragPointer=null;touchGrab=null;dragPoint=null;if(pointer!==null&&root.hasPointerCapture(pointer))root.releasePointerCapture(pointer);if(dragFrame!==null)cancelAnimationFrame(dragFrame);dragFrame=null;ghost?.remove();ghost=null;root.classList.remove('bl-dragging');inspection.hide();clearPreview();root.querySelector('.bl-card-choice')?.remove();root.querySelectorAll('.bl-drop-active,.bl-drop-valid,.bl-tempo-target').forEach(el=>el.classList.remove('bl-drop-active','bl-drop-valid','bl-tempo-target'));syncCardSelection();
  }
  function startDrag(id){
    if(!game||!canPlay(game,id)||animation||stage.editing)return false;
    clearDrag();quietPointer=null;
    activeCard=id;hideTip();inspection.hide();root.classList.add('bl-dragging');const c=cardDefinition(cardById(game,id));
    root.querySelectorAll(c.target==='single'?'.bl-fan:not(.bl-conquered)':'.bl-audience').forEach(el=>el.classList.add('bl-drop-valid'));
    return true;
  }
  function clearPreview(){root.querySelector('.bl-radius-layer')?.remove();aim.hide();root.querySelectorAll('.bl-forecast').forEach(el=>{el.classList.remove('bl-forecast');el.removeAttribute('data-bl-impact-kind');el.querySelector('.bl-impact-kind')?.remove();el.style.removeProperty('--bl-forecast');});previewLayer.querySelectorAll('[data-bl-preview]').forEach(el=>{el.hidden=true;el.textContent='';});}
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
      const collisionGain=preview.event.hits.filter(h=>h.kind==='collision').reduce((n,h)=>n+h.gain,0);if(collisionGain)resources.push('Chocs : +'+collisionGain+' ♥');
      const chains=preview.effects.filter(e=>e.type==='conquest');if(chains.length>1)resources.push(chains.length+' pouvoirs en chaîne');
      if(preview.areas?.some(a=>[...a.targets,...(a.kind==='conquest'?[{id:a.sourceId,position:a.center}]:[])].some(t=>{const f=game.fans.find(f=>f.id===t.id);return f&&Math.hypot(f.position.x-t.position.x,f.position.y-t.position.y)>4;})))resources.push('↗ Positions après déplacement indiquées');
      if(c.target==='audience'||preview.effects.length)resources.push('Total +'+total+' ♥');if(conquests)resources.push(conquests+' conquis');
      const meter=after?(fan.max-fan.hp)+'/'+fan.max+' → '+(after.max-after.hp)+'/'+after.max:'';
      const movement=preview.effects.filter(e=>e.type==='motion').reduce((n,e)=>n+e.targets.length,0);
      const main=Object.hasOwn(c,'power')?(after?meter+' (+'+(fan.hp-after.hp)+' ♥)':'+'+total+' ♥ sur le public'):c.tempo?'Tempo '+game.tempo+' → '+next.tempo:c.boost?'Bonus '+game.boost+' → '+next.boost:c.turnStyle?'Style '+currentSong(game).style:movement?movement+' déplacements prévus':game.energy!==next.energy+c.cost?'Énergie '+game.energy+' → '+next.energy:'Main '+game.hand.length+' → '+next.hand.length;
      outcome={name:fan?.name||(c.target==='audience'?'Tout le public':'Effet de la carte'),main,meta:resources.join(' · '),valid:true,gain:after&&Object.hasOwn(c,'power')?fan.hp-after.hp:null,meter,conquered:after&&fan.hp>0&&after.hp===0};
    }
    if(fan){
      outcome.reaction=fan.reactionUsed?'Réaction consommée ce tour':reactionText(game,fan)+' : '+(REACTIONS[fan.intent]?.description||'');outcome.conquest=conquestLabel(game,fan)+' : '+conquestDescription(game,fan);outcome.trigger=valid&&preview.game.fans.find(f=>f.id===fan.id).reactionUsed&&!fan.reactionUsed?'✦ Réaction déclenchée par cette carte':'';
      const conquestEffects=valid?preview.effects.filter(event=>event.type==='conquest'):[],effect=conquestEffects.find(event=>event.fanId===fan.id);
      if(effect)outcome.conquestReady={sourceId:fan.id,icon:CONQUEST_EFFECTS[effect.effect].icon,name:effect.name,description:conquestDescription(game,fan),targets:effect.targets.map(id=>game.fans.find(f=>f.id===id).name),chainCount:conquestEffects.length};
      else if(valid&&!fan.conquered&&CONQUEST_EFFECTS[fan.effect]){const after=preview.game.fans.find(f=>f.id===fan.id);if(after.hp>0)outcome.conquestPending={remaining:after.hp};}
    }
    if(ghost)inspection.hide();else{inspection.pin(id);inspection.outcome(outcome);}
    const origin=pointFor(`[data-bl-actor="${CSS.escape(card.actorId)}"] .bl-cube`);
    // A ground card aims at one impact point; affected bodies are an area forecast.
    const targetIds=c.target==='point'?[]:c.target==='radius'?(fan?[fan.id]:[]):valid?[...new Set(preview.event.hits.filter(h=>h.kind!=='collision').map(h=>h.id))]:fan?[fan.id]:[];
    if(pendingChoice?.type==='duo'&&!targetIds.includes(pendingChoice.targetId))targetIds.push(pendingChoice.targetId);
    const ends=targetIds.map(id=>{const position=preview?.areas?.filter(a=>a.kind==='card').flatMap(a=>a.targets).find(t=>t.id===id)?.position,before=game.fans.find(f=>f.id===id)?.position;return position&&before&&Math.hypot(position.x-before.x,position.y-before.y)>4?stage.crowdPoint(position):pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`);}).filter(Boolean);
    if(c.tempo&&c.target!=='point'&&c.target!=='radius'){const tempo=dragPoint?{pointer:dragPoint}:target?pointFor(fan?`[data-bl-fan="${CSS.escape(fan.id)}"] .bl-cube`:'.bl-audience'):null;if(tempo)ends.push({...tempo,kind:'tempo'});}
    if(game.spatialVersion){
      const center=c.target==='point'?(dragPoint?stage.point(dragPoint.x,dragPoint.y):fan?.position||{x:game.room.width/2,y:game.room.height/2}):fan?.position;
      if(c.radius&&center)showRadius(center,c.radius,c.coreRadius);
      if(fan&&!fan.conquered&&CONQUEST_EFFECTS[fan.effect]&&!c.radius&&(outcome.conquestReady||c.target==='single'&&Object.hasOwn(c,'power'))){
        const ready=!!outcome.conquestReady,position=ready?preview.game.fans.find(f=>f.id===fan.id).position:fan.position;
        showRadius(position,1,0,{state:ready?'triggered':'potential',label:ready?'CONQUÊTE ! · effet déclenché':outcome.conquestPending?'Pouvoir inactif · encore '+outcome.conquestPending.remaining+' ♥':'À la conquête · rayon 1'});
      }
      if(valid)showResolvedAreas(preview,!c.radius&&outcome.conquestReady?fan?.id:null);
      if(c.target==='point'&&center)ends.push({...stage.crowdPoint(center),kind:c.tempo&&!Object.hasOwn(c,'power')?'tempo':undefined});
    }
    aim.draw(origin,ends,valid||!!c.twoTargets);
    if(!dragPoint&&!target)return;
    const zones=game.spatialVersion?radiusZones():[];
    const r=root.querySelector('.bl-viewport').getBoundingClientRect(),expand=zones.length||!!outcome.conquestReady&&innerWidth<=650;
    // A radius can use the space above the scene; short screens get a compact forecast.
    const box=target?.getBoundingClientRect(),placement={pointer:dragPoint||{x:box.left+box.width/2,y:box.top+box.height/2},target:fan&&box,zones,bounds:{left:Math.max(12,r.left+12),right:Math.min(innerWidth-12,r.right-12),top:expand?12:Math.max(12,r.top+12),bottom:expand?innerHeight-12:Math.min(innerHeight-12,r.bottom-12)}};
    if(ghost)showDragFeedback(ghost,{outcome,...placement});else inspection.place(placement);
  }
  function highlightDrop(target){
    const current=activeCard||selectedCard;
    const definition=current&&cardDefinition(cardById(game,current)),spot=definition?.target==='point'?(dragPoint?stage.point(dragPoint.x,dragPoint.y):game.fans.find(f=>f.id===target?.dataset.blTarget)?.position||{x:game.room.width/2,y:game.room.height/2}):null,spotKey=spot?spot.x+':'+spot.y:'';
    if(previewMemo?.spotKey===spotKey&&previewMemo?.card===current&&previewMemo.target===target&&previewMemo.game===game&&previewMemo.events===game.events.length&&previewMemo.choice===pendingChoice)return;
    previewMemo=current?{spotKey,card:current,target,game,events:game.events.length,choice:pendingChoice}:null;
    root.querySelectorAll('.bl-drop-active,.bl-tempo-target').forEach(el=>el.classList.remove('bl-drop-active','bl-tempo-target'));
    clearPreview();
    const id=activeCard||selectedCard;
    if(!id||!canPlay(game,id))return;
    if(!target){updateDragPreview(id,null,null);return;}
    const card=cardById(game,id),c=cardDefinition(card);
    if(c.target==='single'&&(target.dataset.blTarget==='audience'||target.classList.contains('bl-conquered'))){updateDragPreview(id,target,null);return;}
    const dropZone=c.target==='single'?target:root.querySelector('.bl-audience');dropZone?.classList.add('bl-drop-active');if(c.tempo&&c.target==='audience')dropZone?.classList.add('bl-tempo-target');
    const preview=pendingChoice?.type==='duo'?previewCard(game,id,pendingChoice.targetId,{secondTargetId:target.dataset.blTarget}):previewCard(game,id,target.dataset.blTarget,spot?{point:spot}:{});updateDragPreview(id,target,preview);if(!preview.ok)return;
    const hits=[...preview.event.hits,...preview.effects.flatMap(e=>e.hits)];
    for(const fan of game.fans.filter(f=>hits.some(h=>h.id===f.id)||fanStatus(f)!==fanStatus(preview.game.fans.find(n=>n.id===f.id)))){
      const after=preview.game.fans.find(f=>f.id===fan.id);const node=root.querySelector('[data-bl-fan="'+fan.id+'"]');node?.classList.add('bl-forecast');node?.style.setProperty('--bl-forecast',(1-after.hp/fan.max)*100+'%');const power=hits.filter(h=>h.id===fan.id).reduce((n,h)=>n+h.power,0),out=previewLayer.querySelector('[data-bl-preview="'+fan.id+'"]'),anchor=root.querySelector('[data-bl-fan="'+fan.id+'"]');
      const direct=preview.event.hits.some(h=>h.id===fan.id&&h.kind!=='collision')||preview.areas?.some(a=>a.kind==='card'&&a.targets.some(t=>t.id===fan.id)),collision=preview.event.hits.some(h=>h.id===fan.id&&h.kind==='collision'),chain=preview.effects.some(e=>e.type==='conquest'&&e.targets.includes(fan.id)),kind=direct?'direct':collision?'collision':chain?'chain':'reaction';
      node?.setAttribute('data-bl-impact-kind',kind);
      if(node){const label=document.createElement('span');label.className='bl-impact-kind';label.textContent=(direct?'':collision?'Choc ':chain?'En chaîne ':'Réaction ')+(fan.hp>after.hp?'+'+(fan.hp-after.hp)+' ♥':direct?'Effet':'');node.append(label);}
      if(out&&anchor){
        const {fans,clip}=readAimGeometry(),r=fans.get(fan.id).rect;
        if(r.bottom<Math.max(clip.top,0)||r.top>Math.min(clip.bottom,innerHeight)||r.right<0||r.left>innerWidth)continue;
        const remaining=fan.max-after.hp,single=c.target==='single';
        out.classList.toggle('bl-preview-single',single);out.hidden=false;
        out.innerHTML=`<strong>${esc(fan.name)} · ${power?`+${fan.hp-after.hp} conquête`:'Style / effet'}</strong><span>Conquête : ${remaining} / ${fan.max}</span>${fanStatus(after)!==fanStatus(fan)?`<small>${esc(fanStatus(after))}</small>`:''}`;
        out.setAttribute('aria-label',`${fan.name} : conquête ${remaining} sur ${fan.max}.`);
        // The shared effect panel owns these summaries; no per-fan popup needs measuring.
      }
    }
  }
  function readAimGeometry(){
    if(aimGeometry)return aimGeometry;
    const world=root.querySelector('.bl-world'),rect=world.getBoundingClientRect(),scale=Number(world.dataset.scale)||1,clip=root.querySelector('.bl-audience-viewport').getBoundingClientRect();
    const fans=new Map([...root.querySelectorAll('[data-bl-fan]')].map(element=>[element.dataset.blFan,{element,rect:element.getBoundingClientRect()}]));
    return aimGeometry={rect,scale,clip,fans,points:new Map()};
  }
  function schedulePreview(){
    if(previewFrame!==null)return;
    previewFrame=requestAnimationFrame(()=>{previewFrame=null;if(activeCard||selectedCard)highlightDrop(dragPoint?dropAtPoint(dragPoint.x,dragPoint.y):null);});
  }
  function dropAtPoint(x,y){
    const element=document.elementFromPoint(x,y);if(element?.closest('.bl-hand'))return null;
    const target=element?.closest('[data-bl-target]');
    // Returning to a hand is an explicit cancellation, including above the crowd.
    const {clip,fans}=readAimGeometry();
    if(clip&&x>=Math.max(0,clip.left)&&x<=Math.min(innerWidth,clip.right)&&y>=Math.max(0,clip.top)&&y<=Math.min(innerHeight,clip.bottom)){
      const fan=[...fans.values()].find(({rect:r})=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom);
      if(fan)return fan.element;
    }
    return target&&root.contains(target)?target:null;
  }
  function moveDrag(x,y){
    dragPoint={x,y};schedulePreview();
    aim.movePointer(dragPoint);
    moveDragFeedback(ghost,dragPoint);
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
        const beforeX=viewport.scrollLeft,beforeY=audience.scrollTop;
        const vx=velocity(x,left,right);if(vx)viewport.scrollLeft+=vx*step;
        const audienceTop=Math.max(top,a.top),audienceBottom=Math.min(bottom,a.bottom);
        if(y>=audienceTop&&y<=audienceBottom){const vy=velocity(y,audienceTop,audienceBottom);if(vy)audience.scrollTop+=vy*step;}
        if(beforeX!==viewport.scrollLeft||beforeY!==audience.scrollTop){aimGeometry=null;previewMemo=null;schedulePreview();}
      }
      dragFrame=requestAnimationFrame(scrollFrame);
    }
    dragFrame=requestAnimationFrame(scrollFrame);
  }
  function pointFor(selector){
    const cached=activeCard||selectedCard?readAimGeometry():null;if(cached?.points.has(selector))return cached.points.get(selector);
    const world=cached?.rect||root.querySelector('.bl-world').getBoundingClientRect(),el=root.querySelector(selector),r=el?.getBoundingClientRect();
    if(!r)return null;
    const clip=el.closest('.bl-audience-viewport')?(cached?.clip||el.closest('.bl-audience-viewport').getBoundingClientRect()):null,centerY=r.top+r.height/2;
    if(clip&&(centerY<clip.top||centerY>clip.bottom))return null;
    const scale=cached?.scale||Number(root.querySelector('.bl-world').dataset.scale)||1,point={x:(r.left+r.width/2-world.left)/scale,y:(centerY-world.top)/scale};cached?.points.set(selector,point);return point;
  }
  function perform(id,targetId,options={}){
    if(animation||stage.editing)return false;
    const card=cardById(game,id);if(!card||!canPlay(game,id)){cancelCard();return false;}
    const c=cardDefinition(card);
    if(c.twoTargets){
      if(pendingChoice?.type==='duo'&&pendingChoice.id===id){options.secondTargetId=targetId;targetId=pendingChoice.targetId;}
      else {if(!game.fans.some(f=>f.id===targetId&&f.hp>0)){cancelCard();return false;}clearDrag();selectedCard=id;pendingChoice={type:'duo',id,targetId};render();announce('Choisis un deuxième spectateur distinct.');return false;}
    }
    if(c.discard&&!options.discardId){clearDrag();selectedCard=id;pendingChoice={type:'discard',id};render();root.querySelector('.bl-card-choice')?.scrollIntoView({block:'nearest'});return false;}
    if(c.target==='point'&&!options.point)options.point=dragPoint?stage.point(dragPoint.x,dragPoint.y):game.fans.find(f=>f.id===targetId)?.position||{x:game.room.width/2,y:game.room.height/2};
    const origin=pointFor(`[data-bl-actor="${CSS.escape(card.actorId)}"] .bl-cube`),next=structuredClone(game),r=playCard(next,id,targetId,options),pointer=dragPoint;
    clearDrag();
    if(!r.ok){cancelCard({suppressClick:true});announce(r.message+' Carte reposée en main.');return false;}
    selectedCard=null;pendingChoice=null;
    const direct=[...new Set(r.event.hits.filter(h=>h.kind!=='collision').map(h=>h.id))],world=root.querySelector('.bl-world'),rect=world.getBoundingClientRect(),scale=Number(world.dataset.scale)||1;
    const targets=c.target==='point'?[stage.crowdPoint(options.point)]:c.target==='radius'?[pointFor('[data-bl-fan="'+CSS.escape(targetId)+'"] .bl-cube')]:direct.length?direct.map(id=>pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`)).filter(Boolean):game.fans.some(f=>f.id===targetId)?[pointFor(`[data-bl-fan="${CSS.escape(targetId)}"] .bl-cube`)]:pointer?[{x:(pointer.x-rect.left)/scale,y:(pointer.y-rect.top)/scale}]:[pointFor('.bl-audience')];
    animation={pending:{base:game,next,cardId:id},shots:targets.filter(Boolean),shotColor:c.tempo&&!Object.hasOwn(c,'power')?'#ffe184':'#f8bdcf',motions:r.motions,flightMs:SHOT_FLIGHT_MS,started:performance.now(),origin,events:[r.event,...r.effects],cued:new Set(),duration:SHOT_FLIGHT_MS+(1+r.effects.filter(e=>e.type!=='motion').length)*420+500};
    const shot=animation;shot.timer=setTimeout(()=>landCardFlight(shot),SHOT_FLIGHT_MS);
    if(sound)playSound({type:'card',instrument:card.instrument});
    lockCardFlight();requestAnimationFrame(animate);return true;
  }

  function lockCardFlight(){
    root.dataset.blFlight='travelling';
    for(const button of root.querySelectorAll('[data-bl-card],#bl-end,#bl-layout,#bl-cards,#bl-lab,#bl-simulate'))button.disabled=true;
    const card=root.querySelector(`[data-bl-card="${CSS.escape(animation.pending.cardId)}"]`);if(card)card.style.visibility='hidden';
  }
  function landCardFlight(shot){
    if(animation!==shot||!shot.pending)return;
    clearTimeout(shot.timer);
    if(game!==shot.pending.base){animation=null;render();return;}
    // Resolve once at delivery, keeping the live world's game reference and saved rules intact.
    Object.assign(game,shot.pending.next);shot.pending=null;delete root.dataset.blFlight;
    persist();render();if(shot.motions?.length)stage.showMotion(shot.motions,0);
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
    if(!animation.contactTimeline){let offset=0;const contacts=[];for(const motion of animation.motions||[]){for(const contact of motion.contacts)contacts.push({frame:offset+contact.frame,contact});offset+=motion.frames.length;}animation.contactTimeline={total:offset,contacts,next:0};}
    const timeline=animation.contactTimeline,motionElapsed=elapsed-(animation.flightMs||0),motionFrame=animation.pending||motionElapsed<0?-1:reduced?timeline.total:Math.floor(Math.min(1,motionElapsed/Math.min(1800,animation.duration-(animation.flightMs||0)))*timeline.total);
    while(timeline.next<timeline.contacts.length&&timeline.contacts[timeline.next].frame<=motionFrame){
      const {contact}=timeline.contacts[timeline.next++],point=stage.crowdPoint(contact.point);label('✦ IMPACT',point,'bl-juice-support bl-juice-collision');
      for(const hit of contact.hits||[]){const pos=pointFor(`[data-bl-fan="${CSS.escape(hit.id)}"] .bl-cube`);label('+'+hit.gain+' ♥',pos?{x:pos.x,y:pos.y-30}:point,'bl-juice-collision');if(hit.after===0)label('✦ CONQUIS !',pos||point);}
    }
    for(const [i,event] of animation.events.filter(e=>e.type!=='motion').entries()){
      const age=(elapsed-i*420)/1000;if(age<0||age>1)continue;
      const source=event.type==='card'&&animation.origin?animation.origin:event.fanId?pointFor(`[data-bl-fan="${CSS.escape(event.fanId)}"] .bl-cube`):event.actorId?pointFor(`[data-bl-actor="${CSS.escape(event.actorId)}"] .bl-cube`):animation.origin||{x:w/2,y:180};
      if(age>=SHOT_FLIGHT_MS/1000&&!animation.pending&&!animation.cued.has(i)){
        animation.cued.add(i);
        if(event.type!=='card')label(event.type==='finale'?'♫ FINALE':event.name,source,'bl-juice-support');
        if(event.tempoGain){label('♫ +'+event.tempoGain+' TEMPO',source,'bl-juice-support bl-juice-tempo');world.classList.add('bl-tempo-flash');setTimeout(()=>world.classList.remove('bl-tempo-flash'),500);if(!reduced)world.querySelector('.bl-scene-canvas')?.animate([{translate:'0 0'},{translate:'-3px 1px'},{translate:'3px -1px'},{translate:'0 0'}],{duration:250});}
        if(event.boostGain)label('✦ +'+event.boostGain+' SOUTIEN',source?{x:source.x,y:source.y+28}:source,'bl-juice-support');
        if(event.tempoSpent)label('♫ −'+event.tempoSpent+' TEMPO',source?{x:source.x,y:source.y-25}:source,'bl-juice-support bl-juice-tempo');
        if(event.type==='card'&&!event.hits.length&&!event.tempoGain&&!event.boostGain)label(event.boost?'✦ +'+event.boost+' SOUTIEN':'♫ '+event.name,source,'bl-juice-support');
        for(const hit of event.hits||[]){
          if(hit.kind==='collision')continue;
          const pos=pointFor(`[data-bl-fan="${CSS.escape(hit.id)}"] .bl-cube`);if(!pos)continue;
          label((hit.gain>=0?'+':'')+hit.gain+' ♥',{x:pos.x,y:pos.y-35},hit.gain<0?'bl-juice-loss':'');
          if(hit.after===0&&hit.before>0){label('✦ CONQUIS !',{x:pos.x,y:pos.y+40});const ring=document.createElement('i');ring.className='bl-juice-ring bl-juice-effect-'+(event.effect||event.type);ring.style.left=pos.x+'px';ring.style.top=pos.y+'px';world.append(ring);setTimeout(()=>ring.remove(),800);}
          if(!reduced)root.querySelector(`[data-bl-fan="${CSS.escape(hit.id)}"]`)?.animate([{scale:'1'},{scale:'1.12'},{scale:'1'}],{duration:330});
        }
        if(event.effect==='spotlight'||event.effect==='chorus')for(const id of event.targets){const pos=pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`);label(event.effect==='spotlight'?'✦ SENSIBLE':'♫ '+currentSong(game).style,pos,'bl-juice-support');}
        if(sound)playSound({type:event.type==='card'?'shot':'impact'});
      }
      const ground=event.type==='card'&&event.point?stage.crowdPoint(event.point):null;
      const targets=ground?[ground]:event.type==='card'&&animation.shots?animation.shots:(event.targets||(event.hits||[]).filter(h=>h.kind!=='collision').map(h=>h.id)).map(id=>pointFor(`[data-bl-fan="${CSS.escape(id)}"] .bl-cube`));
      for(const target of targets){
        if(!target||!source)continue;const p=Math.min(1,age/(SHOT_FLIGHT_MS/1000)),x=source.x+(target.x-source.x)*p,y=source.y+(target.y-source.y)*p;ctx.strokeStyle=event.type==='card'&&animation.shotColor?animation.shotColor:event.effect==='chorus'?'#d3b8ee':event.effect==='spotlight'?'#fff2b6':'#f8bdcf';ctx.globalAlpha=Math.max(0,1-age);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(source.x,source.y);ctx.lineTo(x,y);ctx.stroke();
        if(age<SHOT_FLIGHT_MS/1000){ctx.globalAlpha=1;ctx.fillStyle=ctx.strokeStyle;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
        if(ground){
          const definition=cardDefinition(cardById(game,event.cardId)),spread=Math.min(1,Math.max(0,(age-SHOT_FLIGHT_MS/1000)/.6)),unit=game.room.radiusUnit;
          if(spread){ctx.beginPath();ctx.arc(ground.x,ground.y,definition.radius*unit*spread,0,Math.PI*2);ctx.stroke();if(definition.coreRadius){ctx.strokeStyle='#ffe184';ctx.beginPath();ctx.arc(ground.x,ground.y,definition.coreRadius*unit*spread,0,Math.PI*2);ctx.stroke();}}
        }else if(age>=SHOT_FLIGHT_MS/1000){ctx.beginPath();ctx.arc(target.x,target.y,8+(age-SHOT_FLIGHT_MS/1000)*55,0,Math.PI*2);ctx.stroke();}
        ctx.globalAlpha=1;
      }
    }
  }
  function animate(){
    if(!animation)return;if(animation.pending&&performance.now()-animation.started>=SHOT_FLIGHT_MS)landCardFlight(animation);if(!animation)return;const elapsed=performance.now()-animation.started-(animation.flightMs||0);if(elapsed>=0&&animation.motions?.length&&!getReducedEffects()&&!matchMedia('(prefers-reduced-motion: reduce)').matches)stage.showMotion(animation.motions,Math.min(1,elapsed/Math.min(1800,animation.duration-(animation.flightMs||0))));drawEffects();
    if(performance.now()-animation.started<animation.duration)requestAnimationFrame(animate);else{animation=null;render();}
  }
  root.addEventListener('dragstart',event=>{const card=event.target.closest('[data-bl-card]');if(!card||!startDrag(card.dataset.blCard))return event.preventDefault();event.dataTransfer.setData('application/x-bandlive-card',activeCard);event.dataTransfer.effectAllowed='move';event.dataTransfer.setDragImage(dragImage,0,0);ghost=makeDragGhost(activeCard);document.body.append(ghost);moveDrag(event.clientX,event.clientY);});
  root.addEventListener('dragend',event=>{if(activeCard)cancelCard({pointer:dragPoint||{x:event.clientX,y:event.clientY},suppressClick:true});});
  root.addEventListener('dragenter',event=>{if(!activeCard)return;event.preventDefault();moveDrag(event.clientX,event.clientY);});
  root.addEventListener('dragleave',event=>{if(!root.contains(event.relatedTarget)){dragPoint=null;highlightDrop(null);}});
  root.addEventListener('dragover',event=>{if(!activeCard)return;event.preventDefault();event.dataTransfer.dropEffect='move';moveDrag(event.clientX,event.clientY);});
  root.addEventListener('drop',event=>{if(!activeCard)return;event.preventDefault();ignoreClick=true;const target=dropAtPoint(event.clientX,event.clientY),id=activeCard;if(target)perform(id,target.dataset.blTarget);else cancelCard({pointer:{x:event.clientX,y:event.clientY},suppressClick:true});});
  root.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse')return;
    const choice=event.target.closest('[data-bl-discard],[data-bl-target],#bl-put-back');
    if(selectedCard&&choice){choiceTouch={id:selectedCard,pointerId:event.pointerId,x:event.clientX,y:event.clientY,targetId:choice.dataset.blFan||choice.dataset.blTarget,discardId:choice.dataset.blDiscard,cancel:choice.id==='bl-put-back'};return;}
    const card=event.target.closest('[data-bl-card]');if(!card||animation||stage.editing||!canPlay(game,card.dataset.blCard))return;
    touchGrab={pointerId:event.pointerId,id:card.dataset.blCard,x:event.clientX,y:event.clientY};
  });
  root.addEventListener('pointermove',event=>{
    lastPointer={x:event.clientX,y:event.clientY};
    if(dragPointer===event.pointerId&&!root.hasPointerCapture(event.pointerId)){cancelCard({pointer:lastPointer,suppressClick:true});return;}
    if(touchGrab?.pointerId===event.pointerId&&Math.hypot(event.clientX-touchGrab.x,event.clientY-touchGrab.y)>=8){const id=touchGrab.id;touchGrab=null;if(startDrag(id)){event.preventDefault();dragPointer=event.pointerId;root.setPointerCapture(event.pointerId);ghost=makeDragGhost(id);document.body.append(ghost);}}
    if(selectedCard&&dragPointer===null&&!stage.editing){dragPoint={x:event.clientX,y:event.clientY};schedulePreview();inspection.move(dragPoint);aim.movePointer(dragPoint);}
    if(labOriginal&&labShoot&&!stage.editing){const spot=stage.point(event.clientX,event.clientY);if(spot&&spot.y>=0&&spot.y<=game.room.height)showRadius(spot,1,.4);}
    if(dragPointer!==event.pointerId)return;
    event.preventDefault();moveDrag(event.clientX,event.clientY);
  });
  root.addEventListener('pointerup',event=>{
    lastPointer={x:event.clientX,y:event.clientY};
    if(dragPointer===event.pointerId&&!root.hasPointerCapture(event.pointerId)){cancelCard({pointer:lastPointer,suppressClick:true});return;}
    if(touchGrab?.pointerId===event.pointerId){const tap=touchGrab;touchGrab=null;event.preventDefault();ignoreClick=true;if(Math.hypot(event.clientX-tap.x,event.clientY-tap.y)<8)selectCard(tap.id,{x:event.clientX,y:event.clientY});else cancelCard({pointer:lastPointer,suppressClick:true});return;}
    if(dragPointer!==event.pointerId){
      const choice=choiceTouch;choiceTouch=null;
      if(choice?.pointerId===event.pointerId&&choice.id===selectedCard){event.preventDefault();ignoreClick=true;if(choice.cancel||Math.hypot(event.clientX-choice.x,event.clientY-choice.y)>=12)cancelCard({pointer:lastPointer,suppressClick:true});else if(choice.discardId)perform(choice.id,'audience',{discardId:choice.discardId});else perform(choice.id,choice.targetId,{point:stage.point(event.clientX,event.clientY)});}
      return;
    }const id=activeCard,target=dropAtPoint(event.clientX,event.clientY);ignoreClick=true;dragPointer=null;if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId);if(target)perform(id,target.dataset.blTarget);else cancelCard({pointer:{x:event.clientX,y:event.clientY},suppressClick:true});});
  // Native HTML dragging cancels its mouse pointer and ends through drop/dragend.
  // Only tracked touch/pen gestures are cancelled by pointercancel here.
  root.addEventListener('pointercancel',event=>{if(dragPointer===event.pointerId||choiceTouch?.pointerId===event.pointerId||touchGrab?.pointerId===event.pointerId)cancelCard({pointer:{x:event.clientX,y:event.clientY},suppressClick:true});});
  root.addEventListener('lostpointercapture',event=>{if(event.target===root&&dragPointer!==null)cancelCard({suppressClick:true});});
  root.addEventListener('mouseover',event=>{showTip(event.target);if(selectedCard)highlightDrop(event.target.closest('[data-bl-target]')||document.activeElement?.closest('[data-bl-target]'));});root.addEventListener('focusin',event=>{showTip(event.target);if(selectedCard)highlightDrop(event.target.closest('[data-bl-target]')||document.activeElement?.closest('[data-bl-target]'));});
  root.addEventListener('mouseout',event=>{if(!event.relatedTarget||!root.contains(event.relatedTarget))hideTip();});root.addEventListener('focusout',hideTip);
  root.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('.bl-audience')&&selectedCard){event.preventDefault();perform(selectedCard,'audience');}});
  root.addEventListener('click',event=>{if(ignoreClick&&event.detail>0){ignoreClick=false;event.preventDefault();event.stopImmediatePropagation();}},true);
  root.addEventListener('click',async event=>{
    if(event.target.closest('[data-bl-style]')&&!selectedCard)return;
    const target=event.target.closest('button,[data-bl-target]');if(!target){if(selectedCard)cancelCard({pointer:{x:event.clientX,y:event.clientY}});return;}
    if(target.id==='bl-put-back'){cancelCard({pointer:{x:event.clientX,y:event.clientY}});return;}
    if(target.id==='bl-page-prev'||target.id==='bl-page-next'){stage.setPage(stage.page+(target.id==='bl-page-next'?1:-1));clearDrag();selectedCard=null;render();return;}
    if(target.id==='bl-cards'){clearDrag();cardEditor.open();return;}
    if(target.id==='bl-neighborhood'){if(labOriginal){animation=null;clearDrag();const original=labOriginal;labOriginal=null;game=original.game;preparing=original.preparing;labShoot=false;}onReturn();return;}
    if(target.dataset.blTheme){theme=target.dataset.blTheme;render();return;}
    if(target.id==='bl-lab'){startLab();return;}
    if(target.id==='bl-lab-close'){animation=null;clearDrag();const original=labOriginal;labOriginal=null;game=original.game;preparing=original.preparing;labShoot=false;render();return;}
    if(target.id==='bl-lab-replay-card'&&!animation){const card=game.catalog.cards.find(c=>c.id==='lab:test');if(card)startLab(card);return;}
    if(target.id==='bl-lab-reset'){animation=null;clearDrag();game=structuredClone(labBaseline);labShoot=false;render();return;}
    if(target.id==='bl-lab-shoot'){if(stage.editing)stage.toggle();labShoot=!labShoot;render();return;}
    if(target.id==='bl-lab-import'){root.querySelector('#bl-lab-file').click();return;}
    if(target.id==='bl-lab-export'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({format:'garage-vivant-bandlive-lab',version:1,initial:labBaseline,current:game,layout:JSON.parse(stage.exportCode())},null,2)],{type:'application/json'}));a.href=url;a.download='BandLive-scenario.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
    if(labOriginal&&labShoot&&target.dataset.blTarget&&!animation){const point=stage.point(event.clientX,event.clientY);if(point&&point.x>=game.room.margin&&point.x<=game.room.width-game.room.margin&&point.y>=game.room.margin&&point.y<=game.room.height-game.room.margin){const r=impactCrowd(game,{center:point,targets:inRadius(game,point,1,{alive:false}).map(f=>f.id),strengthById:Object.fromEntries(game.fans.map(f=>[f.id,Math.hypot(f.position.x-point.x,f.position.y-point.y)>.4*game.room.radiusUnit?.5:1])),kind:labKind,strength:labStrength});animation={started:performance.now(),events:[r.event,...r.effects],motions:r.motions,duration:Math.max(1600,r.effects.length*420+500),cued:new Set()};render();stage.showMotion(r.motions,0);requestAnimationFrame(animate);}return;}
    if(target.id==='bl-layout'||target.id==='bl-layout-close'){clearDrag();selectedCard=null;pendingChoice=null;stage.toggle();syncLayoutTools();if(stage.editing)root.closest('main')?.scrollTo({top:0});}
    else if(target.id==='bl-layout-undo'){stage.undo();syncLayoutTools();}
    else if(target.id==='bl-layout-reset'){stage.reset();syncLayoutTools();}
    else if(target.id==='bl-layout-export'){stage.commitEdit();root.querySelector('#bl-layout-export-panel').hidden=false;root.querySelector('#bl-layout-code').value=stage.exportCode();}
    else if(target.id==='bl-layout-copy'){const code=root.querySelector('#bl-layout-code');code.value=stage.exportCode();try{await navigator.clipboard.writeText(code.value);notify('Code de disposition copié. Tu peux me le coller ici.');}catch{code.focus();code.select();notify('Code sélectionné : Ctrl+C pour le copier.');}}
    else if(target.id==='bl-layout-download'){const code=stage.exportCode(),url=URL.createObjectURL(new Blob([code],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='BandLive-disposition.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    else if(stage.editing&&target.dataset.blCard)return;
    else if(target.dataset.blRewardActor){rewardChoice.actorId=target.dataset.blRewardActor;delete rewardChoice.slot;delete rewardChoice.kind;render();}
    else if(target.dataset.blRewardSlot!==undefined){rewardChoice.slot=Number(target.dataset.blRewardSlot);render();}
    else if(target.dataset.blRewardKind){rewardChoice.kind=target.dataset.blRewardKind;render();}
    else if(target.id==='bl-confirm-exchange'){const result=exchangeBandLiveCard(getWorld(),rewardChoice);notify(result.message);persist();render();}
    else if(target.dataset.blDiscard&&pendingChoice?.type==='discard'){perform(pendingChoice.id,'audience',{discardId:target.dataset.blDiscard});}
    else if(target.id==='bl-cancel-choice'){cancelCard({pointer:{x:event.clientX,y:event.clientY}});}
    else if(target.dataset.blSong){chooseSong(game,target.dataset.blSong);persist();render();}
    else if(target.dataset.blCard){selectCard(target.dataset.blCard,{x:event.clientX,y:event.clientY});}
    // Mouse click coordinates can be rounded; keep the precise pointer point used by the preview.
    else if(target.dataset.blTarget&&selectedCard)perform(selectedCard,target.dataset.blTarget,event.detail>0&&lastPointer?{point:stage.point(lastPointer.x,lastPointer.y)}:{});
    else if(target.id==='bl-start'){
      const plan=initializeDraft();if(!plan.ready){notify(plan.reason);return render();}
      game=createBandLiveFromWorld(getWorld(),draft);getWorld().cardCatalog??=structuredClone(game.catalog);onCatalogSave();preparing=false;persist();render();
    }else if(target.id==='bl-simulate'&&!animation){clearDrag();selectedCard=null;pendingChoice=null;simulateBandLive(game,()=>persist());render();}
    else if(target.id==='bl-end'&&!animation){const start=game.events.length;endTurn(game);selectedCard=null;pendingChoice=null;persist();juice(game.events.slice(start));}
    else if(target.id==='bl-cancel'&&liveShow()){animation=null;clearDrag();selectedCard=null;pendingChoice=null;onConcertCancel?.();syncConcert();render();}
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
  function tuneLayout(input){
    if(input.dataset.blLayoutSize)stage.tuneSizes({[input.dataset.blLayoutSize]:Number(input.value)/100});
    else if(input.id==='bl-layout-scale'||input.id==='bl-layout-fan')stage.tune(root.querySelector('#bl-layout-hand').value,{[input.id==='bl-layout-scale'?'scale':'fan']:Number(input.value)/(input.id==='bl-layout-scale'?100:1)});
    else return false;
    syncLayoutTools();return true;
  }
  root.addEventListener('input',event=>{const input=event.target;if(game?.spatialVersion&&input.dataset.blPhysics){stage.tunePhysics({[input.dataset.blPhysics]:Number(input.value)});root.querySelector(`[data-bl-physics-output="${input.dataset.blPhysics}"]`).textContent=input.value;persist();return;}if(game?.spatialVersion&&input.id==='bl-radius-unit'){stage.tuneRadius(Number(input.value));root.querySelector('[data-bl-radius-output]').textContent=input.value;persist();return;}tuneLayout(input);});
  root.addEventListener('change',async event=>{
    if(event.target.id==='bl-lab-file'){try{const data=JSON.parse(await event.target.files[0].text());if(data.format!=='garage-vivant-bandlive-lab'||data.version!==1)throw Error('Scénario inconnu.');const initial=restoreBandLive(data.initial),current=restoreBandLive(data.current);if(!current.spatialVersion)throw Error('Ce scénario ne contient pas de foule physique.');animation=null;clearDrag();labBaseline=initial;game=current;render();if(data.layout?.profile)stage.importProfile(data.layout.profile);}catch(error){notify(error.message);}return;}
    if(event.target.dataset.blPhysics||event.target.id==='bl-radius-unit'){stage.commitEdit();return;}
    if(event.target.id==='bl-lab-kind'){labKind=event.target.value;return;}if(event.target.id==='bl-lab-strength'){labStrength=Number(event.target.value);return;}
    if(event.target.id==='bl-layout-hand'){stage.commitEdit();syncLayoutTools();}
    else if(tuneLayout(event.target))stage.commitEdit();
    else if(event.target.id==='bl-group'){draft.groupId=event.target.value;draft.memberIds=null;initializeDraft();persist();render();}
    else if(event.target.dataset.blMember){const id=event.target.dataset.blMember;draft.memberIds=draft.memberIds.filter(member=>member!==id);if(event.target.checked){if(draft.memberIds.length>=RULES.maxMembers){event.target.checked=false;notify('Vingt-quatre musiciens maximum pour BandLive.');}else draft.memberIds.push(id);}persist();render();}
    else if(event.target.id==='bl-seed'){const seed=Number(event.target.value);if(Number.isInteger(seed)&&seed>=0&&seed<=4294967295)draft.seed=seed;else event.target.value=draft.seed;persist();}
    else if(event.target.id==='bl-audience-size'){const size=Number(event.target.value);if(Number.isInteger(size)&&size>=RULES.minAudience&&size<=RULES.maxAudience)draft.audienceSize=size;else event.target.value=draft.audienceSize;persist();}
  });
  document.addEventListener('pointerdown',event=>{lastPointer={x:event.clientX,y:event.clientY};ignoreClick=false;quietPointer=null;if((selectedCard||activeCard||pendingChoice)&&!root.contains(event.target))cancelCard({pointer:lastPointer,suppressClick:!!activeCard});},true);
  const resumeHover=event=>{lastPointer={x:event.clientX,y:event.clientY};if(quietPointer&&(!Number.isFinite(quietPointer.x)||Math.hypot(event.clientX-quietPointer.x,event.clientY-quietPointer.y)>8)){quietPointer=null;if(event.type==='pointermove')showTip(event.target);}};
  root.addEventListener('pointerover',resumeHover,true);root.addEventListener('pointermove',resumeHover,true);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(selectedCard||activeCard||pendingChoice||touchGrab)){event.preventDefault();cancelCard({suppressClick:!!activeCard});}else if(event.key!=='Escape')quietPointer=null;});
  document.addEventListener('contextmenu',event=>{if(selectedCard||activeCard||pendingChoice||touchGrab){event.preventDefault();cancelCard({pointer:{x:event.clientX,y:event.clientY},suppressClick:true});}});
  window.addEventListener('blur',()=>cancelCard({suppressClick:!!activeCard}));
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
    aimGeometry=null;
    previewMemo=null;
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
    leave(){restoreVersion();cancelCard();stage.leave();},
    entryHTML(){return enabled?'<div class="panel bl-entry"><div><b>BandLive · le show jouable</b><p>Réserve un show avec deux à vingt-quatre musiciens et un répertoire ou une jam libre. BandLive commence automatiquement à l’arrivée sur scène. Les répétitions restent sans récompense.</p></div><button data-bandlive-open class="primary">Essayer BandLive ↗</button></div>':'';},
  };
}
