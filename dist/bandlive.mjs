import {REACTIONS,initializeReactions,clearReactionProgress,rerollReaction,reactionPower,hitReaction} from './bandlive-reactions.mjs?v=0.8.4';
import {songTurns} from './song-rules.mjs?v=0.8.4';
// BandLive keeps its own RNG and decks. Concert outcomes are connected separately.
export const RULES = Object.freeze({minMembers:2,maxMembers:24,minAudience:3,maxAudience:12,energy:3,hand:5,turns:6,songTurns:3,tempoMax:10,finale:3,boredom:3,styleBonus:2,soloBonus:3});
export const STYLES = Object.freeze(['Indie','Punk','Folk','Métal','Jazz','Électro','Ska','Pop']);
import {INSTRUMENTS,SPECIALS,NOTE,definitionFor,musicianDeck,validateDeck} from './bandlive-cards.mjs?v=0.8.4';
export {INSTRUMENTS,SPECIALS,NOTE} from './bandlive-cards.mjs?v=0.8.4';

export const CONQUEST_EFFECTS = Object.freeze({
  shock:{name:'Onde de choc',icon:'✺',description:'3 puissance aux voisins immédiats (gauche, droite, devant et derrière).'},
  wave:{name:'Vague d’enthousiasme',icon:'↔',description:'2 puissance aux autres spectateurs de la même rangée.'},
  pierce:{name:'Percée dans la foule',icon:'↓',description:'4 puissance derrière, dans la même colonne. Continue si la cible est conquise ; traverse les spectateurs déjà conquis.'},
  spotlight:{name:'Sous les projecteurs',icon:'✦',description:'Les voisins immédiats subissent +2 puissance par carte jusqu’à la fin du tour. Non cumulable.'},
  chorus:{name:'Chœur du public',icon:'♫',description:'Les autres spectateurs de la rangée adoptent le style de la chanson actuelle jusqu’à sa fin.'},
});
export function conquestLabel(game,fan){const e=CONQUEST_EFFECTS[fan.effect];return e?(game.conquestVersion>=2?`${fan.effect==='spotlight'?'Projecteur':e.name} ${fan.effectValue}`:e.name):'';}
export function conquestDescription(game,fan){
  if(game.conquestVersion!==2)return CONQUEST_EFFECTS[fan.effect]?.description||'';
  return fan.effect==='shock'?`${fan.effectValue} puissance à chaque voisin immédiat.`:fan.effect==='spotlight'?`Voisins immédiats : +${fan.effectValue} puissance par carte jusqu’à la fin du tour. Non cumulable; la valeur la plus forte reste.`:`${fan.effectValue} voisin(s) adoptent le style de la toune jusqu’à sa fin. Priorité aux voisins non conquis d’un autre style, dans l’ordre de la grille.`;
}
export const audienceColumns=game=>game.gridColumns??(game.conquestVersion?Math.min(4,game.fans.length):game.fans.length>6?Math.ceil(game.fans.length/2):game.fans.length);
export const favoriteStyle=fan=>fan.turnStyle||fan.chorusStyle||fan.favorite;
// Board positions are independent of screen size and never collapse after a conquest.
export function conquestTargets(game,fan){
  if(!game.conquestVersion)return [];
  const index=game.fans.indexOf(fan),cols=audienceColumns(game),row=Math.floor(index/cols),col=index%cols;
  if(index<0)return [];
  if(game.conquestVersion>=2){
    const neighbors=game.fans.filter((f,i)=>f!==fan&&f.hp>0&&Math.abs(Math.floor(i/cols)-row)+Math.abs(i%cols-col)===1);
    return fan.effect==='chorus'?neighbors.filter(f=>favoriteStyle(f)!==currentSong(game)?.style).slice(0,fan.effectValue):neighbors;
  }
  if(fan.effect==='pierce'){
    const targets=[];
    for(let i=index+cols;i<game.fans.length;i+=cols){const f=game.fans[i];if(f.hp===0)continue;targets.push(f);if(f.hp>4)break;}
    return targets;
  }
  return game.fans.filter((f,i)=>f!==fan&&f.hp>0&&(['wave','chorus'].includes(fan.effect)?Math.floor(i/cols)===row:Math.abs(Math.floor(i/cols)-row)+Math.abs(i%cols-col)===1));
}
function assignConquestEffects(game,version=2){
  // A separate seeded shuffle leaves the card draw and world RNG unchanged.
  const rng={rng:(game.seed^0x9e3779b9)>>>0},keys=shuffle(rng,version>=2?['shock','spotlight','chorus']:Object.keys(CONQUEST_EFFECTS));
  const effects=shuffle(rng,Array.from({length:game.fans.length},(_,i)=>keys[i%keys.length]));
  game.conquestVersion=version;
  game.fans.forEach((fan,i)=>{fan.effect=effects[i];if(version>=2)fan.effectValue=fan.effect==='shock'?2+Math.floor(random(rng)*4):1+Math.floor(random(rng)*(fan.effect==='chorus'?2:3));});
}

function random(game) {
  game.rng=(Math.imul(1664525,game.rng)+1013904223)>>>0;
  return game.rng/4294967296;
}
function shuffle(game,items) {
  for(let i=items.length-1;i>0;i--){const j=Math.floor(random(game)*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return items;
}
function log(game,message){game.logs.push(message);}
export function cardDefinition(card){return definitionFor(card.instrument,card.kind);}
export function cardById(game,id){return game.cards.find(card=>card.id===id);}

const AUDIENCE=[
  ['Lou',24,'#c798ac','hair'],['Pat',20,'#d6b15a','glasses'],['Kim',25,'#78a89b','cap'],
  ['Max',24,'#a88dc6','cap'],['Sacha',20,'#d18e71','hair'],['Nico',25,'#88a6ce','glasses'],
  ['Charlie',24,'#b5b477','hair'],['Alex',20,'#c78296','cap'],['Jo',25,'#86b6a0','glasses'],
  ['Mika',24,'#cda763','glasses'],['Cam',20,'#aa91b7','hair'],['Jules',25,'#7ba6af','cap'],
];
function createAudience(songs,count,rules=null){
  const styles=rules?.styles||[...new Set(songs.map(song=>song.style))];
  return AUDIENCE.slice(0,count).map(([name,base,color,accessory],i)=>({
    id:`f${i}`,name,max:Math.round(base*(rules?.resistancePercent||100)/100),hp:Math.round(base*(rules?.resistancePercent||100)/100),favorite:rules?styles[i%styles.length]:i<3?(songs[i===0?0:1]||songs[0]).style:styles[(i-3)%styles.length],
    color,identity:{accessory},intent:i%2?'solo':'bored',
  }));
}

export function createBandLive(options) { return createGame(options,RULES.maxMembers); }
function createGame({people,groupId=null,groupName='Le band du quartier',songs,seed=2040,audienceSize=RULES.minAudience,audienceRules=null,songOrder=null,conquestEffects=true,freeSetlist=false,persistentReactions=true,rulesVersion=2},memberLimit) {
  if(!Array.isArray(people)||people.length<RULES.minMembers||people.length>memberLimit||people.some(p=>!p||typeof p.id!=='string'||!p.id||typeof p.name!=='string'||!SPECIALS[p.instrument])||new Set(people.map(p=>p.id)).size!==people.length)throw Error('Choisis de deux à vingt-quatre musiciens du groupe.');
  if(!Array.isArray(songs)||!songs.length||new Set(songs.map(s=>s.id)).size!==songs.length||songs.some(s=>!s||!s.id||!s.title||!s.style||s.turns!==undefined&&![3,4,5].includes(s.turns)))throw Error('Choisis une chanson du répertoire.');
  if(groupId!==null&&(typeof groupId!=='string'||!groupId))throw Error('Groupe invalide.');
  if(!Number.isInteger(audienceSize)||audienceSize<RULES.minAudience||audienceSize>RULES.maxAudience)throw Error('Choisis de trois à douze spectateurs.');
  if(audienceRules&&(!Array.isArray(audienceRules.styles)||!audienceRules.styles.length||new Set(audienceRules.styles).size!==audienceRules.styles.length||audienceRules.styles.some(s=>!STYLES.includes(s))||!Number.isInteger(audienceRules.resistancePercent)||audienceRules.resistancePercent<20||audienceRules.resistancePercent>200))throw Error('Public BandLive invalide.');
  if(songOrder&&(!Array.isArray(songOrder)||songOrder.length!==2||songOrder.some(id=>!songs.some(s=>s.id===id))))throw Error('La setlist BandLive doit prévoir deux passages.');
  const actors=people.map(p=>({id:p.id,name:p.name,instrument:p.instrument,bandLiveDeck:[...validateDeck(p.bandLiveDeck||musicianDeck(p))],genre:p.genre,color:p.color,identity:structuredClone(p.identity||{}),personality:structuredClone(p.personality||{}),skill:p.skills?.[p.instrument]??p.skill??0,...(p.xp!==undefined?{xp:p.xp}:{}),needs:structuredClone(p.needs||{}),exaltation:p.exaltation??p.emotions?.exaltation??0,distress:p.distress??p.emotions?.distress??0}));
  const cards=actors.flatMap(actor=>actor.bandLiveDeck.map((kind,i)=>({id:`${actor.id}:${i}`,actorId:actor.id,instrument:actor.instrument,kind})));
  const game={version:songs.some(s=>s.turns!==undefined)?4:audienceRules||songOrder?3:2,seed:seed>>>0,rng:seed>>>0,groupId,groupName,actors,cards,songs:structuredClone(songs),usedSongs:[],songId:null,phase:'choose',turn:0,section:0,energy:3,tempo:0,boost:0,hand:[],deck:cards.map(c=>c.id),discard:[],played:0,logs:['Le band prend la scène. Choisis la première chanson.'],events:[],fans:createAudience(songs,audienceSize,audienceRules)};
  if(freeSetlist){if(songOrder)throw Error('Le choix libre ne peut pas imposer un ordre.');game.freeSetlist=true;}
  if(game.version>=3){game.audienceRules=structuredClone(audienceRules);game.songOrder=songOrder&&[...songOrder];}
  shuffle(game,game.deck);
  // Preserve ENCORE's varied opening hand, without looping for a two-person band.
  if(actors.length>=3)for(let tries=0;tries<100&&new Set(game.deck.slice(-5).map(id=>cardById(game,id).actorId)).size<3;tries++)shuffle(game,game.deck);
  if(conquestEffects)assignConquestEffects(game,rulesVersion);
  if(rulesVersion>=2)game.gridColumns=audienceSize>8?Math.ceil(audienceSize/2):Math.min(4,audienceSize);
  if(persistentReactions)initializeReactions(game,rulesVersion);
  return game;
}
export const passageTurns=game=>game.version>=4?songTurns(currentSong(game)):RULES.songTurns;
export function totalTurns(game){
  if(game.version<4)return RULES.turns;
  const ids=game.songOrder||game.usedSongs,used=ids.reduce((n,id)=>n+songTurns(game.songs.find(s=>s.id===id)),0);
  const remaining=2-ids.length;
  if(!remaining)return used;
  const lengths=availableSongs(game).map(songTurns).sort((a,b)=>b-a);
  return used+(game.songs.length===1?remaining*lengths[0]:lengths.slice(0,remaining).reduce((n,x)=>n+x,0));
}
export const sectionName=game=>game.section===passageTurns(game)?'Finale':game.section===1?'Couplet':`Refrain ${game.section-1}`;
export function currentSong(game){return game.songs.find(song=>song.id===game.songId);}
export function availableSongs(game){return game.songs.filter(song=>game.songOrder?song.id===game.songOrder[game.usedSongs.length]:game.songs.length===1||!game.usedSongs.includes(song.id));}
function draw(game,count) {
  for(let i=0;i<count;i++){
    if(!game.deck.length)game.deck=shuffle(game,game.discard.splice(0));
    if(game.deck.length)game.hand.push(game.deck.pop());
  }
}
function startTurn(game) {
  game.phase='play';game.turn++;game.section++;game.energy=RULES.energy;game.boost=0;
  if(game.reactionVersion)game.fans.forEach(f=>{if(game.reactionVersion>=2&&f.reactionUsed&&f.hp>0)rerollReaction(game,f);clearReactionProgress(f);if(game.reactionVersion>=2)f.reactionUsed=false;});
  else game.fans.forEach((fan,i)=>fan.intent=(game.turn+i)%2?'bored':'solo');
  game.relayBoosts=[];
  draw(game,RULES.hand);
  log(game,`Tour ${game.turn} · ${currentSong(game).title} · ${sectionName(game)}.`);
}
export function chooseSong(game,id) {
  if(game.phase!=='choose'||!availableSongs(game).some(song=>song.id===id))return {ok:false,message:'Cette chanson ne peut pas être choisie.'};
  game.fans.forEach(fan=>{delete fan.chorusStyle;delete fan.spotlight;delete fan.turnStyle;delete fan.noBoredom;});
  game.songId=id;game.usedSongs.push(id);game.section=0;
  if(game.turn)game.tempo=Math.max(0,game.tempo-2);
  startTurn(game);
  return {ok:true};
}
export function canPlay(game,id) {
  const card=cardById(game,id);
  return !!card&&game.phase==='play'&&game.hand.includes(id)&&game.energy>=cardDefinition(card).cost&&(!cardDefinition(card).discard||game.hand.length>1)&&(!cardDefinition(card).twoTargets||game.fans.filter(f=>f.hp>0).length>=2)&&(!cardDefinition(card).oncePerTurn||!game.events.some(e=>e.type==='card'&&e.turn===game.turn&&e.cardId===id));
}
const alternates=(game,card)=>{const prev=game.events.findLast(e=>e.type==='card'&&e.turn===game.turn);return !!prev&&prev.actorId!==card.actorId;};
function neighboring(game,a,b){const n=audienceColumns(game),i=game.fans.indexOf(a),j=game.fans.indexOf(b);return Math.abs(Math.floor(i/n)-Math.floor(j/n))+Math.abs(i%n-j%n)===1;}
export function cardTargets(game,card,fan,second){
  const d=cardDefinition(card),alive=game.fans.filter(f=>f.hp>0),i=game.fans.indexOf(fan),cols=audienceColumns(game);
  if(d.target==='audience')return alive;
  if(!fan||fan.hp===0)return [];
  if(d.twoTargets)return [fan,second].filter(Boolean);
  if(d.shape==='row')return alive.filter(f=>Math.floor(game.fans.indexOf(f)/cols)===Math.floor(i/cols));
  if(d.shape==='sides')return [fan,...alive.filter(f=>f!==fan&&Math.floor(game.fans.indexOf(f)/cols)===Math.floor(i/cols)&&Math.abs(game.fans.indexOf(f)-i)===1)];
  if(d.shape==='behind'){for(let j=i+cols;j<game.fans.length;j+=cols)if(game.fans[j].hp>0)return [fan,game.fans[j]];}
  return [fan];
}
export function powerAgainst(game,card,fan,base=cardDefinition(card).power) {
  const d=cardDefinition(card);
  if(!Object.hasOwn(d,'power'))return 0;
  return Math.max(0,base+(d.useTempo?game.tempo:0)+(d.consumeTempo?Math.min(game.tempo,d.consumeTempo)*(d.tempoMultiplier||1):0)+game.boost+(game.relayBoosts||[]).filter(b=>b.actorId!==card.actorId).reduce((n,b)=>n+b.power,0)+(favoriteStyle(fan)===currentSong(game)?.style?RULES.styleBonus:0)+(fan.spotlight?(typeof fan.spotlight==='number'?fan.spotlight:2):0)+(d.solo&&fan.intent==='solo'?RULES.soloBonus:0)+(alternates(game,card)?d.alternatePower||0:0)+(game.tempo>=d.tempoThreshold?d.thresholdPower||0:0)+(d.conqueredNeighborPower&&game.fans.some(f=>f.hp===0&&neighboring(game,fan,f))?d.conqueredNeighborPower:0)+reactionPower(game,fan,card.actorId));
}
function triggerReaction(game,fan,queue){
  if(fan.hp===0||fan.reactionUsed)return;
  fan.reactionUsed=true;
  const before=fan.hp;fan.hp=Math.max(0,fan.hp-3);
  game.events.push({id:game.events.length+1,type:'reaction',turn:game.turn,fanId:fan.id,name:REACTIONS[fan.intent].name,hits:[{id:fan.id,before,after:fan.hp,gain:before-fan.hp,power:3}]});
  log(game,`${fan.name} · ${REACTIONS[fan.intent].name} : +${before-fan.hp} conquête.`);
  conquer(game,fan,queue);
}
function conquer(game,fan,queue) {
  if(fan.hp!==0||fan.conquered)return;
  fan.conquered=true;log(game,`${fan.name} est conquis !`);
  if(game.conquestVersion)queue.push(fan);
  if(game.reactionVersion)for(const other of game.fans)if(other.hp>0&&other.intent==='following'&&neighboring(game,fan,other)){
    other.reactionNeighbor=true;
    if(game.reactionVersion>=2)triggerReaction(game,other,queue);
  }
}
function resolveConquests(game,queue){
  const events=[];
  for(let i=0;i<queue.length;i++){
    const fan=queue[i],effect=CONQUEST_EFFECTS[fan.effect],targets=conquestTargets(game,fan),hits=[];
    for(const target of targets){
      if(['shock','wave','pierce'].includes(fan.effect)){
        const power=fan.effectValue||{shock:3,wave:2,pierce:4}[fan.effect],before=target.hp;
        target.hp=Math.max(0,before-power);hits.push({id:target.id,before,after:target.hp,gain:before-target.hp,power});conquer(game,target,queue);
      }else if(fan.effect==='spotlight')target.spotlight=game.conquestVersion>=2?Math.max(Number(target.spotlight)||0,fan.effectValue):true;
      else if(fan.effect==='chorus')target.chorusStyle=currentSong(game).style;
    }
    const event={id:game.events.length+1,type:'conquest',turn:game.turn,fanId:fan.id,name:conquestLabel(game,fan),effect:fan.effect,targets:targets.map(f=>f.id),hits};
    game.events.push(event);events.push(event);
    log(game,`${fan.name} · ${effect.name} : ${targets.length?targets.map(f=>f.name).join(', '):'aucune cible restante'}.`);
  }
  return events;
}
// Use the real resolver on a copy so previews include chains and never consume resources.
export function previewCard(game,id,targetId=null,options={}){
  const after=structuredClone(game),result=playCard(after,id,targetId,options);
  return result.ok?{...result,game:after}:result;
}
function checkVictory(game) {
  if(game.fans.every(fan=>fan.hp===0)){game.phase='won';log(game,'Tout le public est conquis. Show réussi !');return true;}
  return false;
}
export function playCard(game,id,targetId=null,{secondTargetId=null,discardId=null}={}) {
  if(!canPlay(game,id))return {ok:false,message:'Cette carte ne peut pas être jouée : vérifie ta main et ton énergie.'};
  const card=cardById(game,id),d=cardDefinition(card),fan=game.fans.find(f=>f.id===targetId),second=game.fans.find(f=>f.id===secondTargetId);
  if(d.target==='single'&&(!fan||fan.hp===0))return {ok:false,message:'Choisis un spectateur encore à conquérir.'};
  if(d.twoTargets&&(!second||second===fan||second.hp===0))return {ok:false,message:'Choisis deux spectateurs distincts encore à conquérir.'};
  if(d.discard&&(!game.hand.includes(discardId)||discardId===id))return {ok:false,message:'Choisis une autre carte de ta main à défausser.'};
  const powerCard=Object.hasOwn(d,'power'),targets=cardTargets(game,card,fan,second),alternate=alternates(game,card),threshold=game.tempo>=d.tempoThreshold,neighbor=fan&&game.fans.some(f=>f.hp===0&&neighboring(game,fan,f)),triggered=[];
  const eventStart=game.events.length,tempoBefore=game.tempo;
  // Snapshot every target before effects, resource consumption or conquest chains.
  const planned=powerCard?targets.map((f,i)=>({id:f.id,power:powerAgainst(game,card,f,i>0&&d.secondaryPower!==undefined?d.secondaryPower:d.power)})):[],queue=[],hits=[];
  game.energy-=d.cost;game.hand.splice(game.hand.indexOf(id),1);game.discard.push(id);game.played++;
  if(d.discard){game.hand.splice(game.hand.indexOf(discardId),1);game.discard.push(discardId);}
  for(const hit of planned){
    const f=game.fans.find(f=>f.id===hit.id),strikes=d.strikes||1;
    if(hitReaction(game,f,card.actorId)){triggered.push(f);if(game.reactionVersion>=2){f.reactionUsed=true;game.events.push({id:game.events.length+1,type:'reaction',turn:game.turn,fanId:f.id,name:REACTIONS[f.intent].name,hits:[]});}}
    for(let n=0;n<strikes&&f.hp>0;n++){
      const power=Math.floor(hit.power/strikes)+(n<hit.power%strikes?1:0),before=f.hp;
      f.hp=Math.max(0,f.hp-power);hits.push({id:f.id,before,after:f.hp,gain:before-f.hp,power});conquer(game,f,queue);
    }
  }
  const directConquests=new Set(hits.filter(h=>h.after===0).map(h=>h.id)).size;
  if(powerCard){game.relayBoosts=(game.relayBoosts||[]).filter(b=>b.actorId===card.actorId);game.boost=0;if(d.useTempo)game.tempo=0;else if(d.consumeTempo)game.tempo=Math.max(0,game.tempo-d.consumeTempo);}
  const tempo=(d.tempo||0)+(neighbor?d.neighborTempo||0:0)+(alternate?d.alternateTempo||0:0)+Math.min(d.tempoCap||0,directConquests*(d.tempoOnConquest||0));
  const gained=Math.min(RULES.tempoMax-game.tempo,tempo);
  game.tempo+=gained;
  if(game.reactionVersion)for(const f of game.fans)if(f.hp>0&&f.intent==='rhythm'&&!f.reactionUsed){f.reactionTempo=Math.min(3,f.reactionTempo+gained);if(game.reactionVersion>=2&&f.reactionTempo>=3)triggerReaction(game,f,queue);}
  if(d.boost)game.boost+=d.boost;
  if(d.relayBoost){game.relayBoosts??=[];game.relayBoosts.push({actorId:card.actorId,power:d.relayBoost});}
  for(const f of targets.filter(f=>f.hp>0)){if(d.turnStyle)f.turnStyle=currentSong(game).style;if(d.noBoredom)f.noBoredom=true;}
  // Draw before resolving chains: their conquests never award the card's rewards.
  draw(game,(d.draw||0)+(threshold?d.thresholdDraw||0:0)+(directConquests?d.drawOnConquest||0:0));
  const event={id:game.events.length+1,type:'card',turn:game.turn,cardId:id,actorId:card.actorId,name:d.name,hits,tempo:game.tempo,tempoGain:gained,tempoSpent:tempoBefore+gained-game.tempo,boostGain:(d.boost||0)+(d.relayBoost||0),boost:game.boost,...(discardId?{discardId}:{}),...(secondTargetId?{secondTargetId}:{})};
  game.events.push(event);log(game,`${d.name} · ${INSTRUMENTS[card.instrument]}${hits.length?' : '+hits.map(h=>`${game.fans.find(f=>f.id===h.id).name} +${h.gain} conquête`).join(', '):''}.`);
  resolveConquests(game,queue);
  const effects=game.events.slice(eventStart).filter(e=>e!==event);
  for(const f of triggered){log(game,`${f.name} · ${REACTIONS[f.intent].name} déclenché.`);if(f.hp>0&&game.reactionVersion===1)rerollReaction(game,f);}
  checkVictory(game);
  return {ok:true,event,effects};
}
export function endTurn(game) {
  if(game.phase!=='play')return {ok:false,message:'Le tour est déjà terminé.'};
  game.discard.push(...game.hand.splice(0));game.boost=0;game.relayBoosts=[];
  if(game.section===passageTurns(game)){
    const queue=[];
    const hits=game.fans.filter(f=>f.hp>0).map(f=>{const before=f.hp;f.hp=Math.max(0,f.hp-RULES.finale);conquer(game,f,queue);return {id:f.id,before,after:f.hp,gain:before-f.hp,power:RULES.finale};});
    game.events.push({id:game.events.length+1,type:'finale',turn:game.turn,hits});
    log(game,'Finale : 3 puissance sur tout le public.');
    resolveConquests(game,queue);
    game.fans.forEach(fan=>{delete fan.chorusStyle;delete fan.spotlight;delete fan.turnStyle;});
    if(checkVictory(game))return {ok:true};
  }
  game.fans.forEach(fan=>{delete fan.spotlight;});
  if(game.reactionVersion){
    const triggered=new Set();
    // One trigger per spectator in this end-of-turn batch. Chains may satisfy
    // an existing neighbour reaction, but never a freshly rerolled one.
    for(let pass=0;pass<game.fans.length;pass++){
      const queue=[];let changed=false;
      for(const fan of game.fans){
        if(fan.hp===0||triggered.has(fan.id)||fan.reactionUsed)continue;
        const bored=fan.intent==='bored'&&!fan.noBoredom&&fan.hp<fan.max;
        const gain=game.reactionVersion===1&&(fan.intent==='rhythm'&&fan.reactionTempo>=3||fan.intent==='following'&&fan.reactionNeighbor);
        if(!bored&&!gain)continue;
        const before=fan.hp;fan.hp=bored?Math.min(fan.max,fan.hp+(REACTIONS.bored.value||3)):Math.max(0,fan.hp-3);
        triggered.add(fan.id);if(game.reactionVersion>=2)fan.reactionUsed=true;changed=true;
        game.events.push({id:game.events.length+1,type:'reaction',turn:game.turn,fanId:fan.id,name:REACTIONS[fan.intent].name,hits:[{id:fan.id,before,after:fan.hp,gain:before-fan.hp,power:bored?-3:3}]});
        log(game,`${fan.name} · ${REACTIONS[fan.intent].name} : ${bored?'−':'+'}${Math.abs(before-fan.hp)} conquête.`);
        conquer(game,fan,queue);
      }
      resolveConquests(game,queue);if(!changed)break;
    }
    for(const fan of game.fans)if(game.reactionVersion===1&&triggered.has(fan.id)&&fan.hp>0)rerollReaction(game,fan);
  }else {for(const fan of game.fans)if(fan.hp>0&&fan.intent==='bored'&&!fan.noBoredom){fan.hp=Math.min(fan.max,fan.hp+RULES.boredom);log(game,`${fan.name} s’ennuie : −3 conquête.`);}}
  game.fans.forEach(fan=>{delete fan.turnStyle;delete fan.noBoredom;});
  if(checkVictory(game))return {ok:true};
  if(game.usedSongs.length===2&&game.section===passageTurns(game)){game.phase='lost';log(game,'Fin du show. Il reste du public à conquérir.');}
  else if(game.section===passageTurns(game)){game.phase='choose';log(game,'Choisis la chanson du deuxième passage. Son départ retire 2 tempo.');}
  else startTurn(game);
  return {ok:true};
}

export function restoreBandLive(input) {
  const fail=()=>{throw Error('Répétition BandLive invalide.');};
  if(!input||![1,2,3,4].includes(input.version)||!['choose','play','won','lost'].includes(input.phase)||!Array.isArray(input.actors)||!Array.isArray(input.songs))fail();
  const game=structuredClone(input);
  if(game.version>=2&&!game.conquestVersion&&!game.reactionVersion&&game.actors.length>6)fail();
  const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
  if(game.actors.some(a=>!a||!object(a.identity)||!object(a.personality)||!object(a.needs)||!Number.isFinite(a.skill)||typeof a.genre!=='string'||typeof a.color!=='string'))fail();
  for(const actor of game.actors)if(actor.bandLiveDeck!==undefined)validateDeck(actor.bandLiveDeck);
  // Older rehearsals could have more than six musicians. Keep their snapshots
  // playable without permitting oversized new formations.
  if(game.version>=2&&game.groupId!==null&&(typeof game.groupId!=='string'||!game.groupId))fail();
  if(game.version>=3&&(!Object.hasOwn(game,'audienceRules')||!Object.hasOwn(game,'songOrder')))fail();
  const expected=createGame({people:game.actors,groupId:game.groupId,groupName:game.groupName,songs:game.songs,seed:game.seed,audienceRules:game.audienceRules,songOrder:game.songOrder},game.version===1?24:RULES.maxMembers).cards;
  if(!Number.isInteger(game.seed)||game.seed<0||game.seed>4294967295||!Number.isInteger(game.rng)||game.rng<0||game.rng>4294967295||typeof game.groupName!=='string'||!Number.isInteger(game.played)||game.played<0||game.played>500)fail();
  if(!Number.isInteger(game.turn)||game.turn<0||game.turn>(game.version>=4?10:6)||!Number.isInteger(game.section)||game.section<0||game.section>(game.version>=4?5:3))fail();
  if(!Number.isInteger(game.energy)||game.energy<0||game.energy>3||!Number.isInteger(game.tempo)||game.tempo<0||game.tempo>10||!Number.isInteger(game.boost)||game.boost<0||game.boost>500)fail();
  if(!Array.isArray(game.cards)||JSON.stringify(game.cards)!==JSON.stringify(expected)||!Array.isArray(game.deck)||!Array.isArray(game.hand)||!Array.isArray(game.discard)||game.hand.length>5)fail();
  const all=[...game.deck,...game.hand,...game.discard],ids=new Set(expected.map(c=>c.id));
  if(all.length!==ids.size||new Set(all).size!==all.length||all.some(id=>!ids.has(id)))fail();
  if(!Array.isArray(game.usedSongs)||!game.songOrder&&game.songs.length>1&&new Set(game.usedSongs).size!==game.usedSongs.length||game.usedSongs.some((id,i)=>!game.songs.some(s=>s.id===id)||game.songOrder&&id!==game.songOrder[i])||game.usedSongs.length>2||game.songId!==null&&!game.usedSongs.includes(game.songId))fail();
  const lengths=game.usedSongs.map(id=>game.version>=4?songTurns(game.songs.find(s=>s.id===id)):3);
  if(game.songs.some(s=>s.turns!==undefined&&![3,4,5].includes(s.turns)))fail();
  if(game.turn===0&&(game.phase!=='choose'||game.section!==0||game.usedSongs.length||game.songId!==null))fail();
  if(game.turn>0&&(!lengths.length||game.songId!==game.usedSongs.at(-1)||game.section<1||game.section>lengths.at(-1)||game.turn!==lengths.slice(0,-1).reduce((n,x)=>n+x,0)+game.section))fail();
  if(game.phase==='choose'&&game.turn>0&&(lengths.length!==1||game.section!==lengths[0]))fail();
  if(game.phase==='play'&&(!currentSong(game)||game.turn<1||game.section<1)||game.phase==='lost'&&(game.usedSongs.length!==2||game.section!==lengths.at(-1)))fail();
  if(!Array.isArray(game.fans)||game.fans.length<RULES.minAudience||game.fans.length>RULES.maxAudience||new Set(game.fans.map(f=>f?.id)).size!==game.fans.length||game.fans.some(f=>!f||typeof f.id!=='string'||!f.id||typeof f.name!=='string'||!Number.isInteger(f.max)||f.max<1||f.max>1000||!Number.isInteger(f.hp)||f.hp<0||f.hp>f.max||!(game.reactionVersion?Object.keys(REACTIONS):['bored','solo']).includes(f.intent)||!(game.audienceRules?.styles||game.songs.map(s=>s.style)).includes(f.favorite)||!!f.conquered!==(f.hp===0)))fail();
  if(game.gridColumns!==undefined&&(!Number.isInteger(game.gridColumns)||game.gridColumns<3||game.gridColumns>6||game.gridColumns>game.fans.length))fail();
  for(const f of game.fans){if(f.turnStyle!==undefined&&(game.turn===0||game.phase==='choose'||f.turnStyle!==currentSong(game)?.style)||f.noBoredom!==undefined&&(f.noBoredom!==true||game.turn===0||game.phase==='choose'))fail();}
  if(game.reactionVersion!==undefined&&![1,2].includes(game.reactionVersion))fail();
  if(game.reactionVersion){
    if(!Number.isInteger(game.reactionRng)||game.reactionRng<0||game.reactionRng>4294967295)fail();
    for(const f of game.fans)if(!Array.isArray(f.reactionActors)||f.reactionActors.length>game.actors.length||new Set(f.reactionActors).size!==f.reactionActors.length||f.reactionActors.some(id=>!game.actors.some(a=>a.id===id))||!Number.isInteger(f.reactionTempo)||f.reactionTempo<0||f.reactionTempo>3||typeof f.reactionNeighbor!=='boolean')fail();
  }
  if(game.relayBoosts!==undefined&&(!Array.isArray(game.relayBoosts)||game.relayBoosts.length>500||game.relayBoosts.some(b=>!b||!game.actors.some(a=>a.id===b.actorId)||b.power!==4)))fail();
  if(game.initialFanHp!==undefined&&(!Array.isArray(game.initialFanHp)||game.initialFanHp.length!==game.fans.length||game.initialFanHp.some((hp,i)=>!Number.isInteger(hp)||hp<1||hp>game.fans[i].max)))fail();
  if(game.freeSetlist!==undefined&&(game.freeSetlist!==true||game.songOrder!==null||game.version<3))fail();
  if(game.conquestVersion!==undefined&&![1,2].includes(game.conquestVersion))fail();
  for(const fan of game.fans){
    if(game.conquestVersion){
      if(!Object.hasOwn(CONQUEST_EFFECTS,fan.effect)||fan.spotlight!==undefined&&fan.spotlight!==true&&!(game.conquestVersion>=2&&[1,2,3].includes(fan.spotlight))||fan.chorusStyle!==undefined&&(game.turn===0||fan.chorusStyle!==currentSong(game)?.style))fail();
      if((game.phase==='choose'||game.turn===0)&&(fan.spotlight!==undefined||fan.chorusStyle!==undefined))fail();
    }else if(fan.effect!==undefined||fan.spotlight!==undefined||fan.chorusStyle!==undefined)fail();
  }
  if(game.reactionVersion>=2&&game.fans.some(f=>typeof f.reactionUsed!=='boolean'))fail();
  if(game.conquestVersion>=2&&game.fans.some(f=>!['shock','spotlight','chorus'].includes(f.effect)||!Number.isInteger(f.effectValue)||f.effectValue<1||f.effectValue>(f.effect==='chorus'?2:f.effect==='spotlight'?3:5)))fail();
  if((game.phase==='won')!==game.fans.every(f=>f.hp===0)||!Array.isArray(game.logs)||game.logs.length>1000||game.logs.some(line=>typeof line!=='string')||!Array.isArray(game.events)||game.events.length>500)fail();
  return game;
}
