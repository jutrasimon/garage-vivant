import { decadenceCount } from "./v71.mjs?v=0.7.1";
// New songs match the two broad V7 axes; legacy performances keep exact matching.
export function emotionCompatible(song,fan,version=7){return song===fan||version>=7&&(song==='exaltation'&&['joy','excitement','affection'].includes(fan)||song==='distress'&&['sadness','anger','fear'].includes(fan));}
// The stage is a deterministic simulation. Rendering and audio never change it.
export const SHOW_TICKS = 3600;
export const PHRASE_TICKS = 720;
const limit = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const instruments = ['guitar', 'bass', 'drums', 'voice', 'keys', 'sax', 'trumpet', 'percussion'];
const styles = ['Indie', 'Punk', 'Folk', 'Métal', 'Jazz', 'Électro', 'Ska', 'Pop'];
const instrumentNames = {guitar:'Guitare', bass:'Basse', drums:'Batterie', voice:'Chant', keys:'Clavier', sax:'Saxophone', trumpet:'Trompette', percussion:'Percussions'};
export const INTENTIONS = {
  tight: {label:'Carré', description:'Rythme et coordination. Les grooves durent une phrase de plus.'},
  emotional: {label:'À cœur ouvert', description:'Les cartes émotionnelles portent davantage la tonalité de la chanson.'},
  wild: {label:'Tout donner', description:'Impacts plus forts, énergie dépensée et tentation des excès après le show.'}
};
export const CURSES = [
  {id:'hangover', threshold:20, name:'Gueule de bois', icon:'☠', tag:'curse', kind:'hangover', description:'Énergie −8. Cette carte s’ajoute au paquet musical.'},
  {id:'blank', threshold:40, name:'Trou de mémoire', icon:'?', tag:'curse', kind:'blank', description:'Perd le groove et le crescendo préparés.'},
  {id:'ego', threshold:60, name:'Ego en roue libre', icon:'★', tag:'curse', kind:'ego', description:'Un solo faible détourne le soutien collectif.'},
  {id:'absent', threshold:80, name:'Absence au mauvais moment', icon:'…', tag:'curse', kind:'absent', description:'Aucune contribution pour cette phrase.'}
];
export const CARDS = {};
function card(id, name, tag, power, radius, extra = {}) {
  CARDS[id] = {id, name, tag, power, radius, icon:({rhythm:'♬', impact:'ϟ', emotion:'♡', support:'✦'})[tag], ...extra};
}
card('pulse','Battement commun','rhythm',10,115,{kind:'groove', description:'Installe un groove : les impacts suivants touchent plus largement cette zone.'});
card('accent','Accent bien placé','impact',14,100,{description:'Une impulsion courte qui pousse le public et remplit ses jauges.'});
card('breath','Laisser respirer','emotion',11,125,{description:'La tonalité et l’intensité de la chanson renforcent cet impact émotionnel.'});
card('listen','Écouter le band','support',5,140,{kind:'listen',description:'Prépare un soutien qui atténue la prochaine carte maudite d’un allié.'});
card('crescendo','Préparer le crescendo','rhythm',8,130,{kind:'crescendo',description:'Deux préparations déclenchent un crescendo sur le prochain impact.'});
const sets = {
  guitar: [['Riff de garage','impact','riff'],['Accord ouvert','emotion','wave'],['Palm mute','rhythm','groove'],['Solo incandescent','impact','solo'],['Feedback maîtrisé','impact','riff'],['Harmonique suspendue','emotion','wave']],
  bass: [['Ligne qui colle','rhythm','groove'],['Basse ronde','emotion','wave'],['Slap du coin','impact','riff'],['Ancrage profond','rhythm','groove'],['Contretemps','rhythm','crescendo'],['Basse en avant','impact','solo']],
  drums: [['Kick du quartier','rhythm','groove'],['Roulement','rhythm','crescendo'],['Crash frontal','impact','riff'],['Break de batterie','impact','solo'],['Shuffle souple','rhythm','groove'],['Silence avant l’orage','emotion','wave']],
  voice: [['Refrain partagé','emotion','wave'],['Cri du cœur','impact','riff'],['Couplet intime','emotion','wave'],['Note tenue','emotion','solo'],['Le public répond','rhythm','groove'],['Harmonie fragile','emotion','wave']],
  keys: [['Nappe de néons','emotion','wave'],['Ostinato','rhythm','groove'],['Accord électrique','impact','riff'],['Solo de synthé','impact','solo'],['Arpège en spirale','rhythm','crescendo'],['Piano du soir','emotion','wave']],
  sax: [['Souffle chaud','emotion','wave'],['Phrase cuivrée','impact','riff'],['Sax à contretemps','rhythm','groove'],['Solo de minuit','emotion','solo'],['Appel du sax','impact','riff'],['Souffle retenu','emotion','wave']],
  trumpet: [['Appel de trompette','impact','riff'],['Cuivre tendre','emotion','wave'],['Accent ska','rhythm','groove'],['Éclat de cuivre','impact','solo'],['Réponse cuivrée','rhythm','crescendo'],['Note de velours','emotion','wave']],
  percussion: [['Tambourin du garage','rhythm','groove'],['Peaux qui parlent','emotion','wave'],['Claque sèche','impact','riff'],['Feu de percussions','impact','solo'],['Polyrythmie','rhythm','crescendo'],['Pluie de clochettes','emotion','wave']]
};
for (const [instrument, set] of Object.entries(sets)) set.forEach(([name,tag,kind],i) => card(`${instrument}-${i}`,name,tag,12+i*1.7,110+(i%3)*18,{instrument,kind,skill:i<3?0:i<5?35:60,description:`${instrumentNames[instrument]} · ${kind==='groove'?'prépare une zone rythmique':kind==='crescendo'?'prépare le prochain crescendo':kind==='solo'?'impact concentré':tag==='emotion'?'porte l’émotion de la chanson':'bénéficie des grooves déjà installés'}.`}));
card('empathy','Rattraper un ami','support',7,170,{kind:'listen',personal:'kind',description:'Protège le prochain allié d’une erreur et apaise le public.'});
card('spark','Une idée folle','impact',17,145,{personal:'creative',description:'Une idée personnelle projette une onde plus large.'});
card('steady','Tenir le cap','rhythm',13,125,{kind:'crescendo',personal:'discipline',description:'La discipline du musicien prépare le prochain crescendo.'});
card('hello','Salut le quartier !','emotion',14,145,{personal:'outgoing',description:'Le charisme du musicien donne une portée personnelle au refrain.'});
for (const curse of CURSES) CARDS[curse.id] = curse;
for(let i=0;i<6;i++){const type=CURSES[Math.min(i,3)];CARDS[`curse-${i}`]={...type,id:`curse-${i}`,typeId:type.id};}

export function availableCards(p) {
  const base = ['pulse','accent','breath','listen','crescendo'];
  const personalIds=['empathy','spark','steady','hello'];
  const strongest=[...personalIds].sort((a,b)=>p.personality[CARDS[b].personal]-p.personality[CARDS[a].personal])[0];
  const personal = personalIds.filter(id => id===strongest || p.personality[CARDS[id].personal] >= 45);
  return [...base,...Object.keys(CARDS).filter(id => CARDS[id].instrument===p.instrument && p.skills[p.instrument]>=CARDS[id].skill),...personal];
}
export function defaultDeck(p) {
  const personal = ['empathy','spark','steady','hello'].sort((a,b)=>p.personality[CARDS[b].personal]-p.personality[CARDS[a].personal])[0];
  return ['pulse','accent','breath','listen','crescendo',`${p.instrument}-0`,`${p.instrument}-1`,`${p.instrument}-2`,personal];
}
export function activeDeck(p) {
  const allowed = new Set(availableCards(p));
  let deck = [...new Set((p.deck||defaultDeck(p)).filter(id => allowed.has(id)))];
  for(const id of defaultDeck(p)) if(deck.length<8 && !deck.includes(id)) deck.push(id);
  deck = deck.slice(0,10);
  for(let i=0;i<decadenceCount(p);i++)deck.push(`curse-${i}`);
  return deck;
}
function random(s) {s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function shuffled(s, xs) {const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

export function createPerformance({id, seed, people, group, song, opportunity, intention='tight', preview=false,totalTicks=SHOW_TICKS}) {
  if(people.length<2 || !INTENTIONS[intention]) throw Error('Il faut au moins deux musiciens et une intention valide.');
  const s = {id,rulesVersion:71,totalTicks,rng:seed>>>0,seed:seed>>>0,tick:0,status:'playing',applied:false,preview,groupId:group.id,groupName:group.name,opportunityId:opportunity.id,opportunityName:opportunity.name,sourceOpportunity:{...opportunity},genre:song.genre,song:{id:song.id,title:song.title,quality:song.quality,intensity:song.intensity||0,emotion:song.emotion,tone:song.tone},mastery:group.repertoire?.find(r=>r.songId===song.id)?.mastery||0,morale:group.stageMorale??60,development:group.development||0,intention,actors:[],fans:[],cues:[],nextCue:0,impacts:[],zones:[],events:[],support:0,crescendo:0,result:null};
  // Bass and drums prepare first. This order is visible in the show’s explanation.
  const order = {bass:0,drums:1,percussion:2,keys:3,guitar:4,sax:5,trumpet:6,voice:7};
  for(const p of [...people].sort((a,b)=>order[a.instrument]-order[b.instrument]||a.id.localeCompare(b.id))) {
    const deck = activeDeck(p);
    s.actors.push({id:p.id,name:p.name,color:p.color,instrument:p.instrument,skill:p.skills[p.instrument],personality:{...p.personality},identity:{...p.identity},energy:p.needs.energy,startingEnergy:p.needs.energy,decadence:p.decadence,deck,hand:shuffled(s,deck).slice(0,5),played:[],errors:0,energyLoss:0});
  }
  const n = Math.max(8,Math.min(36,opportunity.crowd||10));
  const preferences = opportunity.styles?.length?opportunity.styles:styles;
  for(let i=0;i<n;i++) {
    const cols=n>12?6:4,col=i%cols,row=Math.floor(i/cols);
    const x=180+col*(n>12?105:142)+(random(s)-.5)*32,y=280+row*(n>12?70:105)+(random(s)-.5)*20;
    s.fans.push({id:`f${i}`,name:['Lou','Pat','Kim','Ari','Mel','Val','Rémi','Jess','Cam','Fred','Robin','Jo'][i%12]+(i>=12?' '+(i+1):''),x,y,homeX:x,homeY:y,vx:0,vy:0,meter:0,style:preferences[Math.floor(random(s)*preferences.length)],instrument:instruments[Math.floor(random(s)*instruments.length)],emotion:['excitement','affection','joy'][Math.floor(random(s)*3)],reaction:['euphoria','emotion','trance'][Math.floor(random(s)*3)],reacted:false,reactedAt:null,receptivity:1,color:['#c798ac','#d6b15a','#78a89b','#8696c7'][i%4]});
  }
  for(let phrase=0;phrase<5;phrase++) s.actors.forEach((actor,i)=>s.cues.push({tick:phrase*(totalTicks/5)+86+Math.floor(i*(totalTicks/5*.625)/s.actors.length),phrase,actorId:actor.id,cardId:actor.hand[phrase]}));
  s.initialFans=JSON.parse(JSON.stringify(s.fans));return s;
}
function addEvent(s, type, text, details={}) {const e={id:s.events.length+1,tick:s.tick,type,text,...details};s.events.push(e);return e;}
function nearestTarget(s, actor, c) {
  const fans=s.fans.filter(f=>!f.reacted);
  const pool=fans.length?fans:s.fans;
  const score=f=>{const neighbours=pool.filter(n=>Math.hypot(n.x-f.x,n.y-f.y)<(c.radius||100)).length;return neighbours*6+(f.instrument===actor.instrument?9:0)+(f.style===s.genre?5:0)-f.meter*.015;};
  return [...pool].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))[0];
}
function cast(s, cue) {
  const actor=s.actors.find(p=>p.id===cue.actorId),c=CARDS[cue.cardId];
  actor.played.push(c.id);
  const event=addEvent(s,'card',`${actor.name} joue « ${c.name} ».`,{actorId:actor.id,cardId:c.id,phrase:cue.phrase,supportBefore:s.support,crescendoBefore:s.crescendo});
  if(c.tag==='curse') {
    const protectedBy=s.support>0;
    if(protectedBy) s.support--;
    actor.errors+=protectedBy?.5:1;
    if(c.kind==='hangover') {const loss=protectedBy?4:8;actor.energy=limit(actor.energy-loss);actor.energyLoss+=loss;}
    if(c.kind==='blank'&&!protectedBy) {s.zones=s.zones.filter(z=>z.kind!=='groove');s.crescendo=0;}
    if(c.kind==='ego') {if(!protectedBy)s.support=0;const target=nearestTarget(s,actor,{radius:65});s.impacts.push({...cue,tick:s.tick+30,x:target.x,y:target.y,radius:65,power:protectedBy?8:4,kind:'solo',tag:'impact',combo:[]});}
    addEvent(s,'curse',protectedBy?`Un allié rattrape ${actor.name} : l’erreur est atténuée.`:`${c.name} perturbe ${actor.name}.`,{actorId:actor.id,cardId:c.id,protected:protectedBy,energyLoss:c.kind==='hangover'?(protectedBy?4:8):0});
    return;
  }
  const target=nearestTarget(s,actor,c);
  event.target={x:target.x,y:target.y,radius:c.radius};
  const diversity=1/Math.max(1,s.actors.filter(a=>a.instrument===actor.instrument).length*.36);
  const sizeFactor=(4/s.actors.length)*(.7+s.development*.003);
  const repeats=s.events.filter(e=>e.type==='card'&&e.phrase===cue.phrase&&CARDS[e.cardId].tag===c.tag).length-1;
  let power=2.15*c.power*(.68+actor.skill*.006)*(.5+actor.energy*.005)*(.72+s.song.quality*.004)*(.65+s.mastery*.0035)*sizeFactor*diversity*Math.pow(.88,repeats);
  power*=1+((s.morale??60)-60)*.002;let radius=c.radius,combo=[];
  if(c.personal) power*=.6+actor.personality[c.personal]/100;
  if(s.intention==='wild') {power*=1.2;actor.energyLoss+=1.5;actor.energy=limit(actor.energy-1.5);}
  if(c.tag==='emotion') {power*=1+s.song.intensity*.007;if(s.intention==='emotional'){power*=1.25;radius+=25;}}
  if(c.kind==='listen') {s.support=Math.min(3,s.support+1);combo.push('Soutien prêt');}
  if(c.kind==='crescendo') {s.crescendo=Math.min(3,s.crescendo+1);combo.push('Crescendo préparé');}
  if(c.tag==='impact') {
    const groove=s.zones.find(z=>z.kind==='groove'&&z.until>s.tick&&Math.hypot(target.x-z.x,target.y-z.y)<z.radius);
    if(groove) {radius+=55;power*=1.22;combo.push(`Riff + groove de ${groove.name}`);}
    if(s.crescendo>=2) {power*=1.4;radius+=30;s.crescendo=0;combo.push('Crescendo déclenché');}
  }
  if(c.kind==='solo') {radius*=.72;power*=1.35;}
  s.impacts.push({...cue,tick:s.tick+30,x:target.x,y:target.y,radius,power,kind:c.kind||null,tag:c.tag,combo});
}
function react(s, fan, queue) {
  if(fan.reacted || fan.meter<100) return;
  if(fan.reaction==='euphoria')fan.fragmented=true;fan.reacted=true;fan.reactedAt=s.tick;fan.meter=100;
  const text={euphoria:'éclate d’euphorie et entraîne ses voisins',emotion:'est touché et ouvre les autres à l’émotion',trance:'entre en transe et amplifie les rythmes suivants'}[fan.reaction];
  const event=addEvent(s,'reaction',`${fan.name} ${text}.`,{fanId:fan.id,reaction:fan.reaction,x:fan.x,y:fan.y,neighbours:[]});
  if(fan.reaction==='trance') s.zones.push({kind:'trance',x:fan.x,y:fan.y,radius:170,until:SHOW_TICKS,name:fan.name});
  for(const n of s.fans) if(n!==fan && !n.reacted && Math.hypot(n.x-fan.x,n.y-fan.y)<175) {
    const before=n.meter,receptivity=n.receptivity;
    if(fan.reaction==='euphoria') {n.meter=limit(n.meter+13);const dx=n.x-fan.x,dy=n.y-fan.y,d=Math.max(10,Math.hypot(dx,dy));n.vx+=dx/d*95;n.vy+=dy/d*95;}
    if(fan.reaction==='emotion') {n.receptivity=Math.min(1.45,n.receptivity+.18);n.meter=limit(n.meter+5);}
    event.neighbours.push({id:n.id,before,after:n.meter,receptivityBefore:receptivity,receptivityAfter:n.receptivity});
    if(n.meter>=100) queue.push(n);
  }
}
function impact(s, hit) {
  const actor=s.actors.find(a=>a.id===hit.actorId),queue=[];
  if(hit.kind==='groove') s.zones.push({kind:'groove',x:hit.x,y:hit.y,radius:hit.radius,until:s.tick+((s.totalTicks||2160)/5)*(s.intention==='tight'?3:2),name:actor.name});
  let touched=0,gain=0;const targets=[];
  for(const fan of s.fans) {
    const distance=Math.hypot(fan.x-hit.x,fan.y-hit.y);
    if(distance>hit.radius || fan.reacted) continue;
    const preference=fan.style===s.genre?1.28:.93;
    const instrument=fan.instrument===actor.instrument?1.32:1;
    const trance=hit.tag==='rhythm' && s.zones.some(z=>z.kind==='trance'&&Math.hypot(fan.x-z.x,fan.y-z.y)<z.radius)?1.4:1;
    const emotion=hit.tag==='emotion'&&emotionCompatible(s.song.emotion,fan.emotion,s.rulesVersion)?1.2:1;
    const value=hit.power*preference*instrument*trance*emotion*fan.receptivity*(1-distance/hit.radius*.35);
    const before=fan.meter;fan.meter=limit(fan.meter+value);gain+=fan.meter-before;touched++;targets.push({id:fan.id,before,after:fan.meter,style:preference,instrument,emotion});fan.lastHit={cardId:hit.cardId,actorId:actor.id,gain:Math.round(fan.meter-before),tick:s.tick};
    const dx=fan.x-hit.x,dy=fan.y-hit.y,d=Math.max(20,distance),push=hit.tag==='impact'?60:18;
    fan.vx+=dx/d*push;fan.vy+=dy/d*push;
    if(fan.meter>=100) queue.push(fan);
  }
  // Each fan reacts at most once, so this queue is bounded by the public size.
  while(queue.length) react(s,queue.shift(),queue);
  addEvent(s,'impact',hit.combo.length?hit.combo.join(' · '):`${CARDS[hit.cardId].name} touche ${touched} spectateurs.`,{...hit,targets,touched,gain:Math.round(gain),actorId:actor.id});
}
export function performanceResult(s) {
  const conquered=s.fans.filter(f=>f.reacted).length;
  const engagement=s.fans.reduce((n,f)=>n+f.meter,0)/s.fans.length;
  const errors=s.actors.reduce((n,p)=>n+p.errors,0);
  const interpretation=limit(s.actors.reduce((n,p)=>n+p.skill,0)/s.actors.length*.38+s.mastery*.32+s.development*.25+5-errors*2+((s.morale??60)-60)*.08);
  return {score:Math.round(engagement*.62+conquered/s.fans.length*38),conquered,total:s.fans.length,engagement:Math.round(engagement),interpretation:Math.round(interpretation),quality:s.song.quality,errors,combos:s.events.filter(e=>e.type==='impact'&&e.combo.length).length,reactions:Object.fromEntries(['euphoria','emotion','trance'].map(k=>[k,s.fans.filter(f=>f.reacted&&f.reaction===k).length]))};
}
export function advancePerformance(s, ticks=1) {
  if(!Number.isInteger(ticks)||ticks<0) throw Error('Pas de spectacle invalide.');
  for(let i=0;i<ticks && s.status==='playing';i++) {
    s.tick++;
    s.zones=s.zones.filter(z=>z.until>s.tick);
    while(s.nextCue<s.cues.length && s.cues[s.nextCue].tick<=s.tick) cast(s,s.cues[s.nextCue++]);
    const due=s.impacts.filter(h=>h.tick<=s.tick);s.impacts=s.impacts.filter(h=>h.tick>s.tick);
    for(const hit of due) impact(s,hit);
    for(const fan of s.fans) {
      fan.vx+=(fan.homeX-fan.x)*.6/60;fan.vy+=(fan.homeY-fan.y)*.6/60;
      fan.vx*=.965;fan.vy*=.965;
      fan.x=limit(fan.x+fan.vx/60,135,875);fan.y=limit(fan.y+fan.vy/60,250,600);
    }
    if(s.tick>=(s.totalTicks||2160)) {s.status='finished';s.result=performanceResult(s);addEvent(s,'final',`${s.result.conquered}/${s.result.total} fans conquis · accueil ${s.result.score}/100.`);}
  }
  return s;
}
export function validatePerformance(s) {
  const number=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
  if(s?.totalTicks!==undefined&&![2160,3600].includes(s.totalTicks))throw Error('Durée de spectacle invalide.');
  if(!s || !['playing','finished'].includes(s.status) || !Number.isInteger(s.tick) || !number(s.tick,0,s.totalTicks||2160) || !Number.isInteger(s.rng) || !INTENTIONS[s.intention] || !Array.isArray(s.actors) || s.actors.length<2 || s.actors.length>24 || !Array.isArray(s.fans) || s.fans.length<8 || s.fans.length>36 || !Array.isArray(s.cues) || s.cues.length!==s.actors.length*5 || !Number.isInteger(s.nextCue) || !number(s.nextCue,0,s.cues.length) || !Array.isArray(s.events) || !Array.isArray(s.zones) || !Array.isArray(s.impacts) || !s.song || !number(s.mastery,0,100) || !number(s.development,0,100) || !number(s.song.quality,0,100)) throw Error('Spectacle invalide.');
  const ids=new Set();
  if(typeof s.applied!=='boolean'||typeof s.preview!=='boolean'||!s.sourceOpportunity||!number(s.song.intensity,0,100)||!styles.includes(s.genre)||typeof s.song.title!=='string')throw Error('État de spectacle invalide.');
  for(const p of s.actors) {
    if(typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||!instruments.includes(p.instrument)||!number(p.energy,0,100)||!number(p.skill,0,100)||!number(p.decadence,0,100)||!Array.isArray(p.deck)||p.deck.length<8||p.deck.length>(s.rulesVersion===71?16:10)||new Set(p.deck).size!==p.deck.length||p.deck.some(id=>!CARDS[id])||!Array.isArray(p.hand)||p.hand.length!==5||new Set(p.hand).size!==5||p.hand.some(id=>!p.deck.includes(id))||!Array.isArray(p.played)||p.played.some(id=>!p.hand.includes(id))||!number(p.errors,0,5)||!number(p.energyLoss,0,100)) throw Error('Deck de spectacle invalide.');
    ids.add(p.id);
    const expected=s.cues.filter(c=>c.actorId===p.id&&c.tick<=s.tick).map(c=>c.cardId);
    if(p.played.length!==expected.length||p.played.some((id,i)=>id!==expected[i]))throw Error('Cartes jouées incohérentes.');
  }
  const fanIds=new Set();
  for(const f of s.fans) {if(typeof f.id!=='string'||fanIds.has(f.id)||!number(f.x,135,875)||!number(f.y,250,600)||!number(f.meter,0,100)||!number(f.vx,-10000,10000)||!number(f.vy,-10000,10000)||!number(f.homeX,100,900)||!number(f.homeY,200,650)||!number(f.receptivity,1,1.45)||!styles.includes(f.style)||!instruments.includes(f.instrument)||!['euphoria','emotion','trance'].includes(f.reaction)) throw Error('Public invalide.');fanIds.add(f.id);}
  for(const c of s.cues) if(!ids.has(c.actorId)||!CARDS[c.cardId]||!Number.isInteger(c.phrase)||!number(c.phrase,0,4)||!number(c.tick,0,SHOW_TICKS)) throw Error('Phrase musicale invalide.');
  if(s.nextCue!==s.cues.filter(c=>c.tick<=s.tick).length)throw Error('Position de lecture incohérente.');
  if(s.events.length>s.actors.length*10+s.fans.length+1||s.events.some((e,i)=>e.id!==i+1||!Number.isInteger(e.tick)||!number(e.tick,0,s.tick)||typeof e.text!=='string'||!['card','impact','curse','reaction','final'].includes(e.type)))throw Error('Déroulement de spectacle invalide.');
  for(const z of s.zones)if(!['groove','trance'].includes(z.kind)||!number(z.x,0,900)||!number(z.y,0,650)||!number(z.radius,0,400)||!number(z.until,0,SHOW_TICKS*3))throw Error('Zone musicale invalide.');
  for(const h of s.impacts)if(!ids.has(h.actorId)||!CARDS[h.cardId]||!number(h.tick,0,SHOW_TICKS)||!number(h.x,0,900)||!number(h.y,0,650)||!number(h.radius,0,400)||!number(h.power,0,10000)||!Array.isArray(h.combo))throw Error('Impact musical invalide.');
  if(s.status==='finished' && (!s.result || s.tick!==(s.totalTicks||2160))) throw Error('Bilan de spectacle manquant.');
  if(s.status==='finished') {const expected=performanceResult(s);if(s.songResults?.length>1){const xs=s.songResults;expected.quality=Math.round(xs.reduce((n,r)=>n+r.quality,0)/xs.length);expected.interpretation=Math.round(xs.reduce((n,r)=>n+r.interpretation,0)/xs.length);expected.errors=xs.reduce((n,r)=>n+r.errors,0);expected.combos=xs.reduce((n,r)=>n+r.combos,0);}
for(const key of Object.keys(expected))if(typeof expected[key]==='object'?Object.keys(expected[key]).some(k=>expected[key][k]!==s.result[key]?.[k]):expected[key]!==s.result[key])throw Error('Bilan de spectacle incohérent.');}
  return s;
}
