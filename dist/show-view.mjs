import {CARDS} from './stage.mjs?v=0.6.3';
import {eventAge,songSeconds,actorPosition,stageGeometry,cardContext} from './show-playback.mjs?v=0.6.3';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={guitar:'Guitare',bass:'Basse',drums:'Batterie',voice:'Chant',keys:'Clavier',sax:'Saxophone',trumpet:'Trompette',percussion:'Percussions'};
const colors={rhythm:'#a9c995',impact:'#e4bd75',emotion:'#d3a8c3',support:'#9fc8d2',curse:'#d39280'};
const tags={rhythm:'Rythme',impact:'Impact',emotion:'Émotion',support:'Soutien',curse:'Erreur'};
const reactions={euphoria:'Euphorie',emotion:'Émotion',trance:'Transe'};
const cardEvents=show=>show.events.filter(e=>e.type==='card');

function rule(c) {
  if(c.kind==='groove')return 'Installe une zone : impact +22 %, rayon +55.';
  if(c.kind==='crescendo')return '+1 charge. Dès 2 charges : prochain impact +40 %.';
  if(c.kind==='listen')return '+1 protection contre la prochaine carte maudite.';
  if(c.tag==='emotion')return 'La chanson et les fans compatibles renforcent l’émotion.';
  if(c.tag==='curse')return c.description;
  return c.kind==='solo'?'Impact concentré : plus fort, sur une zone plus petite.':'Remplit les jauges et repousse les fans dans sa zone.';
}
function outcome(show,event) {
  const c=CARDS[event.cardId],{impact,curse}=cardContext(show,event);
  if(curse){
    if(c.kind==='hangover')return `${curse.protected?'Soutien consommé · ':''}Énergie −${curse.energyLoss|| (curse.protected?4:8)}`;
    if(c.kind==='blank')return curse.protected?'Soutien consommé · préparations conservées':'Grooves et crescendo perdus';
    if(c.kind==='ego')return curse.protected?'Soutien consommé · solo renforcé':'Solo faible · soutien perdu';
    return `${curse.protected?'Soutien consommé · ':''}Aucune contribution musicale`;
  }
  if(impact)return `${impact.touched} fans touchés · +${impact.gain} de jauge`;
  return 'La cible est annoncée…';
}
function comboLabel(impact) {
  const groove=impact?.combo?.some(x=>x.startsWith('Riff + groove')),crescendo=impact?.combo?.includes('Crescendo déclenché');
  return groove&&crescendo?'GROOVE + CRESCENDO':crescendo?'CRESCENDO':groove?'GROOVE':'';
}
export function instrumentArt(instrument,tag='impact') {
  const drawings={
    guitar:'<path d="M38 65c-19-16-36 9-19 25 16 16 40 0 27-17l43-40-9-10z"/><path d="M44 75l38-43M76 22l13 13" fill="none"/><circle cx="32" cy="80" r="5" fill="currentColor"/>',
    bass:'<path d="M34 69c-14-15-31 9-17 23 14 12 35-2 25-17l49-49-8-9z"/><path d="M28 86l57-61" fill="none"/><path d="M81 17l12 11"/>',
    drums:'<ellipse cx="54" cy="54" rx="29" ry="12"/><path d="M25 54v26c0 16 58 16 58 0V54M34 42l-13-22M72 40l22-19" fill="none"/><path d="M39 62v23M67 62v23" fill="none"/>',
    voice:'<rect x="44" y="19" width="24" height="43" rx="12"/><path d="M34 46v11c0 28 44 28 44 0V46M56 80v17M42 97h28M51 29h10M51 39h10" fill="none"/>',
    keys:'<rect x="15" y="35" width="82" height="45" rx="5"/><path d="M30 36v43M44 36v43M58 36v43M72 36v43M86 36v43" fill="none"/><path d="M26 35v23h8V35M40 35v23h8V35M68 35v23h8V35M82 35v23h8V35"/>',
    sax:'<path d="M60 24c25 1 14 20 8 38-8 22-6 31-20 32-13 2-18-8-16-17l-9-10 21-14 9 18-8 5c-1 9 7 10 10 2l16-43-11-3z"/><path d="M62 46l9 3M59 56l9 3M56 66l8 3" fill="none"/>',
    trumpet:'<path d="M19 54h47l25-15v42L66 66H19z"/><path d="M40 53V39M50 53V35M60 53V39M34 68v14h30V68" fill="none"/>',
    percussion:'<circle cx="56" cy="58" r="31"/><circle cx="56" cy="58" r="22" fill="none"/><path d="M24 58h9M80 58h9M56 27v9M56 80v9" fill="none"/>'
  };
  return `<svg class="card-art" viewBox="0 0 112 112" aria-hidden="true" style="color:${colors[tag]}"><g stroke="#466c5b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="currentColor">${drawings[instrument]||drawings.guitar}</g></svg>`;
}
export function showTitleHTML(show) {
  const cards=cardEvents(show),phrase=cards.at(-1)?.phrase??0;
  return `<div class="live-show-title"><span class="eyebrow">${show.preview?'ESSAI':'EN DIRECT'} · ${esc(show.role||'Prestation')} · ${esc(show.opportunityName)}</span><h2>${esc(show.groupName)}</h2><p>♫ ${esc(show.song.title)} <span>· morceau ${(show.songIndex||0)+1}/${show.setlist?.length||1} · phrase ${phrase+1}/5</span></p><div class="song-progress"><div class="bar"><i style="width:${songSeconds(show)/30*100}%"></i></div><b data-song-time>${Math.floor(songSeconds(show))} / 30 s</b></div></div>`;
}
export function showOverlayHTML(show,{ready=false,geometry={width:900,height:650,scale:1,ox:0,oy:0}}={}) {
  const cards=cardEvents(show),event=cards.at(-1),recent=cards.slice(-4,-1).reverse();
  const position=(x,y)=>`left:${(geometry.ox+x*geometry.scale)/geometry.width*100}%;top:${(geometry.oy+y*geometry.scale)/geometry.height*100}%`;
  const actors=show.actors.map((a,i)=>{const pos=actorPosition(show,i);return `<button class="stage-actor-anchor" data-stage-actor="${a.id}" style="${position(pos.x,pos.y-18)}" aria-label="Inspecter ${esc(a.name)}"></button>`;}).join('');
  const decks=show.actors.map((a,i)=>{const pos=actorPosition(show,i);return `<button class="stage-deck" data-stage-deck="${a.id}" data-key="deck-${a.id}" style="${position(pos.x,pos.deckY)}" aria-label="Voir le deck de ${esc(a.name)} : ${a.played.length} sur 5 cartes jouées"><span class="deck-backs"><i></i><i></i><i></i></span><small>${a.played.length}/5</small></button>`;}).join('');
  if(ready)return `${actors}${decks}<div class="show-ready"><span class="eyebrow">LE QUARTIER ATTEND</span><h3>${esc(show.groupName)}</h3><p>5 cartes par musicien · 30 secondes par chanson.<br>Inspecte les decks, puis lance le show.</p><button id="start-show" class="primary">▶ Lancer le show</button></div>`;
  if(!event)return `${actors}${decks}<div class="show-count-in">Place à la musique…</div>`;
  const c=CARDS[event.cardId],actor=show.actors.find(a=>a.id===event.actorId),{impact,target}=cardContext(show,event),combo=comboLabel(impact||target),age=eventAge(show,event);
  const phase=age<.2?'drawing':impact||c.tag==='curse'?'resolved':'targeting';
  const previous=recent.map(e=>`<button class="discard-card ${CARDS[e.cardId].tag}" data-inspect-card="${e.id}" title="Revoir ${esc(CARDS[e.cardId].name)}"><small>${esc(show.actors.find(a=>a.id===e.actorId)?.name)}</small><b>${esc(CARDS[e.cardId].name)}</b></button>`).join('');
  return `${actors}${decks}<div class="card-foreground"><div class="discard-stack">${previous}</div><button class="hero-card ${c.tag} ${combo?'combo-card':''} ${phase}" data-key="card-${show.id}-${show.songIndex||0}-${event.id}" data-inspect-card="${event.id}" aria-label="Inspecter ${esc(c.name)}"><small>${esc(actor.name)} · ${names[actor.instrument]}</small><strong>${esc(c.name)}</strong>${instrumentArt(actor.instrument,c.tag)}<div class="card-modifier">${combo?`<span class="combo-badge">${combo} · +${combo==='GROOVE + CRESCENDO'?'71':combo==='GROOVE'?'22':'40'} %</span>`:c.tag==='emotion'?`<span class="emotion-badge">Intensité ${show.song.intensity}/100 · +${Math.round(show.song.intensity*.7)} %</span>`:`<span class="card-type">${tags[c.tag]}</span>`}</div><p class="card-rule">${esc(rule(c))}</p><span class="card-outcome">${esc(outcome(show,event))}</span></button></div>`;
}
export function showResourcesHTML(show) {
  const cards=cardEvents(show),next=show.cues[show.nextCue],actor=show.actors.find(a=>a.id===next?.actorId);
  const pips=(count,type)=>`<span class="resource-pips" aria-label="${count} charges">${[0,1,2].map(i=>`<i class="${i<count?'filled':''} ${type}" data-key="${type}-${i}-${i<count}"></i>`).join('')}</span>`;
  return `<span class="show-resource"><b>Crescendo</b>${pips(show.crescendo,'crescendo')}<small>${show.crescendo>=2?'Impact prêt !':'2 charges → impact +40 %'}</small></span><span class="show-resource"><b>Soutien</b>${pips(show.support,'support')}<small>Protection contre une erreur</small></span><span class="show-resource conquered"><b>${show.fans.filter(f=>f.reacted).length}/${show.fans.length}</b><small>Fans conquis</small></span><span class="show-next"><small>${cards.length}/${show.cues.length} cartes jouées</small><b>${actor?`À suivre : ${esc(actor.name)}`:'Dernières réactions…'}</b></span>`;
}
export function deckInspectionHTML(show,id) {
  const actor=show.actors.find(a=>a.id===id);if(!actor)return '';
  return `<h2>Deck de ${esc(actor.name)}</h2><p>${names[actor.instrument]} · ${actor.deck.length} cartes · ${actor.played.length}/5 jouées</p><p>5 cartes distinctes sont pigées sans remise pour cette chanson. Les cartes à venir restent cachées.</p><div class="show-deck-inspection">${actor.deck.map(id=>{const c=CARDS[id],played=actor.played.includes(id);return `<article class="deck-inspection-card ${c.tag} ${played?'already-played':''}"><small>${tags[c.tag]} · ${played?'Déjà jouée':'Dans le deck'}</small><b>${esc(c.name)}</b>${instrumentArt(actor.instrument,c.tag)}<p>${esc(rule(c))}</p></article>`;}).join('')}</div>`;
}
export function cardInspectionHTML(show,id) {
  const event=show.events.find(e=>e.type==='card'&&e.id===Number(id));if(!event)return '';
  const c=CARDS[event.cardId],actor=show.actors.find(a=>a.id===event.actorId),{impact}=cardContext(show,event);
  return `<h2>${esc(c.name)}</h2><p>${esc(actor.name)} · ${names[actor.instrument]} · phrase ${event.phrase+1}/5</p>${instrumentArt(actor.instrument,c.tag)}<p>${esc(rule(c))}</p><p><b>${esc(outcome(show,event))}</b></p>${impact?.combo?.length?`<p>${impact.combo.map(esc).join(' · ')}</p>`:''}${impact?`<p>Rayon effectif : ${Math.round(impact.radius)} unités de scène.</p><div class="card-target-list">${(impact.targets||[]).map(t=>{const f=show.fans.find(f=>f.id===t.id);return `<p><b>${esc(f?.name||t.id)}</b> · ${Math.round(t.before)} → ${Math.round(t.after)}/100${t.style>1?' · aime le style':''}${t.instrument>1?' · sensible à l’instrument':''}${t.emotion>1?' · émotion compatible':''}</p>`;}).join('')}</div>`:''}`;
}

const box=(ctx,x,y,w,h,c,r=0)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
let labelScale=1;
const text=(ctx,t,x,y,size=12,c='#e9eedf')=>{ctx.font=`600 ${Math.max(size,10/labelScale)}px system-ui`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(t,x,y);};
function circle(ctx,x,y,r,stroke,fill=null,width=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.lineWidth=width;ctx.strokeStyle=stroke;if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.stroke();}
function pop(ctx,t,x,y,color='#f2dfaa',size=16){ctx.font=`700 ${Math.max(size,11/labelScale)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#16352b';ctx.strokeText(t,x,y);ctx.fillStyle=color;ctx.fillText(t,x,y);}
export function drawShowStage(canvas,show,{reduced=false,selectedFan=null}={},decorateCube=()=>{}) {
  if(!canvas||!show)return;
  const ctx=canvas.getContext('2d'),g=stageGeometry(canvas),dpr=Math.min(globalThis.devicePixelRatio||1,2);
  labelScale=g.scale;
  if(canvas.width!==Math.round(g.width*dpr)||canvas.height!==Math.round(g.height*dpr)){canvas.width=Math.round(g.width*dpr);canvas.height=Math.round(g.height*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,g.width,g.height);box(ctx,0,0,g.width,g.height,'#172e2b');ctx.translate(g.ox,g.oy);ctx.scale(g.scale,g.scale);
  box(ctx,45,48,810,160,'#2a4338',12);box(ctx,45,204,810,12,'#8a785e');
  ['#b4d998','#cba0d9','#e8c278'].forEach((c,i)=>{ctx.fillStyle=c+'12';ctx.beginPath();ctx.moveTo(210+i*235,15);ctx.lineTo(50+i*280,600);ctx.lineTo(280+i*260,600);ctx.fill();box(ctx,196+i*235,20,28,9,c,4);});
  text(ctx,'GARAGE VIVANT · LIVE',450,36,10,'#8fba99');
  const cards=cardEvents(show),latest=cards.at(-1),context=latest?cardContext(show,latest):{},age=latest?eventAge(show,latest):100;
  const shotOrigin={x:(g.cardX+g.cardWidth*.18-g.ox)/g.scale,y:(g.cardY+g.cardHeight*.28-g.oy)/g.scale};
  for(const z of show.zones){const trance=z.kind==='trance',remaining=Math.max(0,songSeconds(show,Math.min(z.until,show.totalTicks||2160))-songSeconds(show));circle(ctx,z.x,z.y,z.radius,trance?'#c9a8da99':'#a5d58cbb',trance?'#c7a4ed0d':'#9fd29612');text(ctx,`${trance?'TRANSE':'GROOVE'} · ${remaining.toFixed(1)} s`,z.x,Math.max(232,z.y-z.radius-8),12,trance?'#d7c5e5':'#c4e6b0');}
  if(context.target&&CARDS[latest.cardId].tag!=='curse'&&age<1.3){
    const t=context.target,c=colors[CARDS[latest.cardId].tag],pending=!context.impact;
    ctx.save();ctx.strokeStyle=c;ctx.globalAlpha=pending?.85:Math.max(0,1-age/1.3);ctx.lineWidth=2/g.scale;ctx.setLineDash([6/g.scale,6/g.scale]);ctx.beginPath();ctx.moveTo(shotOrigin.x,shotOrigin.y);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.setLineDash([]);
    circle(ctx,t.x,t.y,t.radius,c,pending?c+'12':null,2/g.scale);circle(ctx,t.x,t.y,12/g.scale,c,null,2/g.scale);
    ctx.beginPath();ctx.moveTo(t.x-19/g.scale,t.y);ctx.lineTo(t.x+19/g.scale,t.y);ctx.moveTo(t.x,t.y-19/g.scale);ctx.lineTo(t.x,t.y+19/g.scale);ctx.stroke();
    text(ctx,pending?'ZONE VISÉE':'IMPACT',t.x,Math.max(234,t.y-t.radius-12/g.scale),13,c);
    if(pending&&!reduced){const duration=Math.max(.08,songSeconds(show,context.target.tick??latest.tick+30)-songSeconds(show,latest.tick)),p=Math.min(1,age/duration);circle(ctx,shotOrigin.x+(t.x-shotOrigin.x)*p,shotOrigin.y+(t.y-shotOrigin.y)*p,5/g.scale,c,c,1/g.scale);}
    ctx.restore();
  }
  show.actors.forEach((a,i)=>{const pos=actorPosition(show,i),active=latest?.actorId===a.id&&age<1.3,played=cards.filter(e=>e.actorId===a.id).at(-1),bounce=reduced?0:Math.sin(show.tick*.05+i)*1.5+(active?Math.sin(Math.min(1,age/.3)*Math.PI)*5:0),x=pos.x,y=pos.y-bounce,size=Math.max(pos.size,Math.min(show.actors.length<=4?(g.width<700?30:44):show.actors.length<=8?(g.width<700?22:34):18,g.scale*90)/g.scale);
    if(active)circle(ctx,x,y-size/2,size*.8,CARDS[latest.cardId].tag==='curse'?'#d59280':'#d9e7b7',null,2);
    ctx.save();ctx.translate(x,y);if(!reduced&&a.identity?.movement==='flamboyant')ctx.rotate(Math.sin(show.tick*.06)*.035);box(ctx,-size/2,-size,size,size,a.color,4);box(ctx,-size/2,-size,size,5,'#ffffff30',3);box(ctx,-6,-size*.55,3,3,'#f4f2df');box(ctx,4,-size*.55,3,3,'#f4f2df');decorateCube(ctx,0,0,size,a);ctx.restore();text(ctx,a.name,x,y+16,show.actors.length>12?8:11);text(ctx,({guitar:'♫',bass:'♬',drums:'●',voice:'♪',keys:'▥',sax:'♮',trumpet:'♯',percussion:'✦'})[a.instrument],x+size/2+12,y-10,18,'#ecc786');
    if(active&&age<.2&&!reduced){const t=Math.min(1,age/.2),px=x+(shotOrigin.x-x)*t,py=pos.deckY+(shotOrigin.y-pos.deckY)*t;box(ctx,px-9,py-14,18,27,colors[CARDS[played.cardId].tag],3);}
  });
  for(const f of show.fans){const reaction=show.events.find(e=>e.type==='reaction'&&e.fanId===f.id),ra=reaction?eventAge(show,reaction):100,fragmented=(f.fragmented||f.reacted&&f.reaction==='euphoria')&&ra>.12,bounce=reduced?0:Math.sin(show.tick*.045+Number(f.id.slice(1)))*f.meter/65,x=f.x,y=f.y-bounce;
    ctx.fillStyle='#071a1e55';ctx.beginPath();ctx.ellipse(x,y+5,20,6,0,0,Math.PI*2);ctx.fill();
    if(fragmented){for(let i=0;i<5;i++){const angle=i*Math.PI/2.5,d=reduced?20:Math.min(38,Math.max(0,ra)*55),px=x+Math.cos(angle)*d,py=y-12+Math.sin(angle)*d*.65;box(ctx,px-5,py-8,10,10,f.color,2);box(ctx,px-2,py-4,1.5,1.5,'#223932');box(ctx,px+2,py-4,1.5,1.5,'#223932');decorateCube(ctx,px,py+2,10,{identity:{accessory:['hair','glasses','cap'][Number(f.id.slice(1))%3]}});}}
    else{const size=Math.max(38,Math.min(g.width<700?(show.fans.length>12?16:24):show.fans.length>12?30:40,g.scale*(show.fans.length>12?44:68))/g.scale);box(ctx,x-size/2,y-size,size,size,f.color,4);box(ctx,x-size/2,y-size,size,5,'#ffffff35',3);box(ctx,x-size*.18,y-size*.65,size*.1,size*.1,'#223932');box(ctx,x+size*.14,y-size*.65,size*.1,size*.1,'#223932');decorateCube(ctx,x,y,size,{identity:{accessory:['hair','glasses','cap'][Number(f.id.slice(1))%3]}});if(f.reacted)text(ctx,f.reaction==='trance'?'♬':'♡',x+23,y-24,18,f.reaction==='trance'?'#d7b8e3':'#e6b0d0');}
    const hit=show.events.filter(e=>e.type==='impact'&&e.targets?.some(t=>t.id===f.id)).at(-1),target=hit?.targets.find(t=>t.id===f.id),ha=hit?eventAge(show,hit):100,displayMeter=target&&ha<.3?target.before+(target.after-target.before)*Math.max(0,ha/.3):f.meter;
    const meterWidth=Math.max(50,32/g.scale),meterHeight=Math.max(6,4/g.scale);box(ctx,x-meterWidth/2,y+13,meterWidth,meterHeight,'#294740',3);box(ctx,x-meterWidth/2,y+13,meterWidth*displayMeter/100,meterHeight,f.reacted?'#e7c96f':'#94bd98',3);text(ctx,f.name,x,y+33,11,'#c7d2c3');
    if(target&&ha<.85&&target.emotion>1)circle(ctx,x,y-14,23,'#dfb8cf');
    if(target&&ha<.85&&target.after>target.before)pop(ctx,`+${Math.round(target.after-target.before)}`,x+32,y-24-(reduced?0:ha*12),'#d9edbb');
    if(ra<1)pop(ctx,reactions[f.reaction].toUpperCase(),x,y-48-(reduced?0:ra*12),f.reaction==='euphoria'?'#f2d27f':'#e6bbd5',14);
    if(selectedFan===f.id){ctx.strokeStyle='#e4d394';ctx.lineWidth=2;ctx.strokeRect(x-32,y-42,64,83);}
  }
  for(const e of show.events){const a=eventAge(show,e);if(a<0||a>.9)continue;
    if(e.type==='impact'){const c=colors[e.tag]||'#e4bd75',progress=reduced?1:Math.min(1,a/.45);ctx.globalAlpha=Math.max(.15,1-a/.9);circle(ctx,e.x,e.y,e.radius*progress,c,null,e.combo?.some(x=>x.includes('déclenché'))?5:2);ctx.globalAlpha=1;const combo=comboLabel(e);if(combo)pop(ctx,combo,e.x,Math.max(239,e.y-e.radius-18), '#f1d487',15);}
    if(e.type==='reaction'){if(e.reaction==='euphoria')circle(ctx,e.x,e.y,175*(reduced?1:Math.min(1,a/.7)),'#e6bc7155');for(const n of e.neighbours||[]){const f=show.fans.find(f=>f.id===n.id);if(f&&n.after>n.before)pop(ctx,`+${Math.round(n.after-n.before)}`,f.x-30,f.y-22-(reduced?0:a*10),'#e8d399',14);}}
  }
}
