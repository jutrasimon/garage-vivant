import {createWorld} from './engine.mjs?v=0.9.0';
import {createBandLive,chooseSong,endTurn,playCard,previewCard} from './bandlive.mjs?v=0.9.0';
import {createCatalog,newEffect,duplicateCard,validateCatalog,compileCard} from './bandlive-catalog.mjs?v=0.9.0';
import {clampPosition,separateCrowd,validateCrowd} from './bandlive-crowd.mjs?v=0.9.0';
export const ARENA_KEY='garage-vivant-arena-v1';
export const TYPE_EFFECTS={shock:'Onde de choc',spotlight:'Projecteur',chorus:'Chœur'};
export const ABILITIES={none:'Aucune',advance:'Faire avancer les voisins',tempo:'Retirer du tempo'};
export const COLORS={shock:'#e1b957',spotlight:'#83bfc9',chorus:'#b195cf'};
export function defaultScenario(){return {version:1,seed:2040,total:50,capacity:20,initial:14,arrivals:5,integrity:40,entrancePressure:true,frontPressure:true,waitGrace:1,waitDamage:1,frontDamage:1,redDepth:.15,advance:12,convergence:.035,waveSpeed:700,ghostOpacity:.25,songs:[{title:'On entre dans la danse',style:'Pop',turns:4},{title:'Encore un dernier refrain',style:'Rock',turns:4}],types:[
 {id:'curieux',name:'Curieux',hp:14,weight:40,effect:'shock',effectValue:3,mass:1,intent:'bored',boss:false,ability:'none',period:2,amount:12,radius:1},
 {id:'enthousiaste',name:'Enthousiaste',hp:18,weight:35,effect:'spotlight',effectValue:2,mass:1,intent:'rhythm',boss:false,ability:'none',period:2,amount:12,radius:1},
 {id:'choriste',name:'Choriste',hp:16,weight:25,effect:'chorus',effectValue:2,mass:1,intent:'following',boss:false,ability:'none',period:2,amount:12,radius:1},
 {id:'meneur',name:'Le Meneur',hp:50,weight:0,effect:'shock',effectValue:5,mass:2,intent:'bored',boss:true,ability:'advance',period:2,amount:20,radius:1.2}
 ],bosses:[{type:'meneur',rank:31}]};}
const range=(v,a,b,integer=false)=>Number.isFinite(v)&&v>=a&&v<=b&&(!integer||Number.isInteger(v));
export function validateScenario(c){
 const fail=m=>{throw Error(m);};if(c?.version!==1)fail('Format de scénario invalide.');
 for(const [k,a,b,int] of [['seed',0,4294967295,true],['total',3,200,true],['capacity',3,50,true],['initial',0,50,true],['arrivals',0,50,true],['integrity',1,500,true],['waitGrace',0,10,true],['waitDamage',0,20,true],['frontDamage',0,20,true],['redDepth',.05,.4],['advance',0,40],['convergence',0,.2],['waveSpeed',500,1400],['ghostOpacity',.05,.6]])if(!range(c[k],a,b,int))fail('Réglage invalide : '+k);
 if(c.initial>Math.min(c.capacity,c.total))fail('Le public initial dépasse la capacité ou le total.');
 if(typeof c.entrancePressure!=='boolean'||typeof c.frontPressure!=='boolean')fail('Pression invalide.');
 if(!Array.isArray(c.songs)||c.songs.length!==2||c.songs.some(s=>!range(s.turns,3,6,true)||typeof s.title!=='string'||s.title.length>70||!['Pop','Rock','Jazz','Folk','Ska','Métal'].includes(s.style)))fail('Choisis deux chansons de 3 à 6 tours.');
 if(!Array.isArray(c.types)||!c.types.length||c.types.length>30)fail('Choisis de 1 à 30 types.');const ids=new Set();
 for(const t of c.types){if(!/^[-a-z0-9]{1,60}$/.test(t.id)||ids.has(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>60)fail('Nom ou identifiant de type invalide.');ids.add(t.id);
  if(!range(t.hp,1,500,true)||!range(t.weight,0,100)||!TYPE_EFFECTS[t.effect]||!range(t.effectValue,1,t.effect==='shock'?5:t.effect==='spotlight'?3:2,true)||!range(t.mass,.25,5)||!['bored','rhythm','following','attentive','distracted','variety'].includes(t.intent)||typeof t.boss!=='boolean'||!Object.hasOwn(ABILITIES,t.ability)||!range(t.period,1,6,true)||!range(t.amount,0,40,true)||!range(t.radius,.2,3))fail('Paramètres du type '+t.name+' invalides.');
 }
 if(!c.types.some(t=>!t.boss&&t.weight>0))fail('Ajoute un type ordinaire avec une proportion positive.');
 if(!Array.isArray(c.bosses)||c.bosses.length>10||new Set(c.bosses.map(b=>b.rank)).size!==c.bosses.length||c.bosses.some(b=>!range(b.rank,1,c.total,true)||!c.types.some(t=>t.id===b.type&&t.boss)))fail('Chaque boss doit avoir un rang unique dans le total du show.');return c;
}
export function demoCatalog(){
 const catalog=createCatalog(),decks={};const e=(type,data={})=>({...newEffect(type),...data});
 for(const card of catalog.cards)if(['voice','guitar','drums'].includes(card.instrument))card.starter=0;
 const add=(instrument,name,cost,target,radius,effects,starter)=>{const c=duplicateCard(catalog,instrument+':note');Object.assign(c,{name,cost,target,radius,coreRadius:0,outerScale:1,effects,starter,minLevel:1,rarity:starter===1?'rare':'common'});return c.id;};
 for(const instrument of ['voice','guitar','drums']){
  let ids;
  if(instrument==='voice')ids=[add(instrument,'Appel du public',1,'point',1,[e('pull',{strength:.35}),e('power',{amount:3,impactStrength:0})],2),add(instrument,'Refrain commun',1,'audience',1,[e('tempo',{amount:1}),e('boost',{amount:2,other:'yes'})],2),add(instrument,'Chœur fédérateur',2,'point',1.4,[e('style'),e('power',{amount:5,impactStrength:.4})],1)];
  if(instrument==='guitar')ids=[add(instrument,'Riff accrocheur',1,'point',.9,[e('power',{amount:4,impactStrength:.6})],2),add(instrument,'Accord saturé',1,'point',1.1,[e('power',{amount:4,formula:'spend',limit:2})],2),add(instrument,'Solo décisif',2,'single',1,[e('power',{amount:10,formula:'spend',limit:4,multiplier:2,impactStrength:1.2})],1)];
  if(instrument==='drums')ids=[add(instrument,'Pulsation',1,'point',1,[e('power',{amount:2,impactStrength:.3}),e('tempo',{amount:2})],2),add(instrument,'Contretemps',1,'point',.9,[e('power',{amount:4,impactStrength:.7}),e('tempo',{amount:1,when:'alternate'})],2),add(instrument,'Break stéréo',2,'point',1,[e('split',{strength:1.2,wavePower:3})],1)];
  decks[instrument]=[ids[0],ids[0],ids[1],ids[1],ids[2]];
 }
 return {catalog,decks};
}
export function queuePlan(config){
 validateScenario(config);const ordinary=config.types.filter(t=>!t.boss&&t.weight>0),total=config.total-config.bosses.length,sum=ordinary.reduce((n,t)=>n+t.weight,0),counts=ordinary.map(t=>({t,count:Math.floor(total*t.weight/sum),remainder:total*t.weight/sum%1}));
 let left=total-counts.reduce((n,t)=>n+t.count,0);for(const c of [...counts].sort((a,b)=>b.remainder-a.remainder))if(left-->0)c.count++;
 const list=counts.flatMap(({t,count})=>Array(count).fill(t.id));let seed=config.seed>>>0;for(let i=list.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[list[i],list[j]]=[list[j],list[i]];}
 for(const b of [...config.bosses].sort((a,b)=>a.rank-b.rank))list.splice(b.rank-1,0,b.type);return list;
}
export function validateArenaDecks(content){
 for(const instrument of ['voice','guitar','drums']){const deck=content?.decks?.[instrument];if(!Array.isArray(deck)||deck.length!==5)throw Error('Chaque musicien doit avoir cinq cartes.');
 for(const id of deck){const recipe=content.catalog.cards.find(c=>c.id===id);if(!recipe||!recipe.enabled||![instrument,'neutral'].includes(recipe.instrument)||!['point','audience','single'].includes(recipe.target))throw Error('Carte de deck incompatible : '+id);}}
}
export function createArena(config=defaultScenario(),content=demoCatalog()){
 validateScenario(config);validateCatalog(content.catalog);validateArenaDecks(content);const people=createWorld(config.seed,3).people;
 for(const [i,instrument] of ['voice','guitar','drums'].entries()){const p=people[i];p.name=['Lia','Axel','Sam'][i];p.instrument=instrument;p.genre='Pop';p.bandLiveDeck=[...content.decks[instrument]];p.color=['#80b9a4','#b094ca','#e3bd60'][i];}
 const songs=config.songs.map((s,i)=>({...s,id:'arena-song-'+i,turns:Math.min(5,s.turns)}));
 const game=createBandLive({people,songs,seed:config.seed,audienceSize:12,spatial:true,catalog:content.catalog});game.songs=config.songs.map((s,i)=>({...s,id:songs[i].id}));
 const template=game.fans[0],queue=queuePlan(config).map((id,i)=>{const t=config.types.find(t=>t.id===id);return {...structuredClone(template),id:'arena-f'+i,name:t.name+' '+(i+1),rank:i+1,typeId:id,hp:t.hp,max:t.hp,conquered:false,favorite:config.songs[i%2].style,effect:t.effect,effectValue:t.effectValue,color:COLORS[t.effect],intent:t.intent,mass:t.mass,boss:t.boss,ability:t.ability,period:t.period,amount:t.amount,radius:t.radius,position:{x:560,y:308},reactionUsed:false};});
 game.fans=[];game.arena={version:1,config:structuredClone(config),content:structuredClone(content),status:'playing',integrity:config.integrity,queue,waiting:[],retired:[],redIds:[],summary:[],round:1};
 game.arena.waiting=queue.splice(0,config.initial).map(f=>({...f,waitSince:0}));admit(game,true);chooseSong(game,game.songs[0].id);markRed(game);return game;
}
const redLimit=g=>g.room.margin+(g.room.height-2*g.room.margin)*g.arena.config.redDepth;
export function markRed(g){g.arena.redIds=g.fans.filter(f=>f.hp>0&&f.position.y<=redLimit(g)).map(f=>f.id);}
function admit(g,initial=false){
 const a=g.arena,spots=[];for(let row=0;row<4;row++)for(let col=0;col<16;col++)spots.push({x:65+col*66,y:initial?[140,220,300,60][row]+(col%2?7:0):308-row*64});
 if(initial){const ordered=[...spots];spots.length=0;for(let col=0;col<16;col++)for(let row=0;row<4;row++)spots.push(ordered[row*16+(col*7%16)]);spots.sort((a,b)=>(a.y<100)-(b.y<100));}
 if(initial&&a.config.initial<=20)for(const [i,p] of spots.entries())Object.assign(p,clampPosition(g,{x:p.x+Math.sin(a.config.seed+i*2.41)*16,y:p.y+Math.cos(a.config.seed+i*1.73)*11}));
 const entering=[];while(a.waiting.length&&g.fans.filter(f=>f.hp>0).length<a.config.capacity){const spot=spots.find(p=>g.fans.every(f=>!f.hp||Math.hypot(f.position.x-p.x,f.position.y-p.y)>=g.physics.collisionRadius*2));if(!spot)break;const f=a.waiting.shift();f.position=clampPosition(g,spot);f.enteredTurn=a.round;g.fans.push(f);entering.push(f.id);}
 return entering;
}
export function pressureForecast(g){const a=g.arena,c=a.config;return {entrance:c.entrancePressure?a.waiting.filter(f=>a.round-f.waitSince>=c.waitGrace).length*c.waitDamage:0,front:c.frontPressure?g.fans.filter(f=>f.hp>0&&a.redIds.includes(f.id)&&f.position.y<=redLimit(g)).length*c.frontDamage:0};}
export function finishArenaTurn(g){
 if(g.arena.status!=='playing')return {ok:false};const a=g.arena,c=a.config,oldRound=a.round,before=Object.fromEntries(g.fans.map(f=>[f.id,{...f.position}]));
 // Resolve the established card/reaction/finale rules first, then the isolated scenario rules.
 endTurn(g);const pressure=pressureForecast(g);a.integrity=Math.max(0,a.integrity-pressure.entrance-pressure.front);a.summary=[`Entrée −${pressure.entrance} · scène −${pressure.front}`];
 for(const f of g.fans)if(f.hp>0&&f.ability!=='none'&&oldRound%f.period===0){if(f.ability==='tempo'){g.tempo=Math.max(0,g.tempo-f.amount);a.summary.push(f.name+' : −'+f.amount+' tempo');}else {for(const other of g.fans)if(other.hp>0&&other!==f&&Math.hypot(other.position.x-f.position.x,other.position.y-f.position.y)<=f.radius*g.room.radiusUnit)other.position=clampPosition(g,{x:other.position.x,y:other.position.y-f.amount});a.summary.push(f.name+' fait avancer ses voisins');}}
 const leaving=g.fans.filter(f=>!f.hp);a.retired.push(...leaving.map(f=>({id:f.id,name:f.name,rank:f.rank,boss:f.boss})));g.fans=g.fans.filter(f=>f.hp>0);
 if(!a.integrity){a.status='stopped';g.phase='lost';return {ok:true,before,entering:[],leaving};}
 if(g.phase==='lost'){a.status='complete';g.phase='won';return {ok:true,before,entering:[],leaving};}
 if(g.phase==='choose')chooseSong(g,g.songs[1].id);
 a.round=oldRound+1;
 for(const f of g.fans){const t=c.types.find(t=>t.id===f.typeId);f.intent=t.intent;f.reactionUsed=false;f.reactionActors=[];f.reactionTempo=0;f.reactionNeighbor=false;}
 for(const f of g.fans)f.position=clampPosition(g,{x:f.position.x+(g.room.width/2-f.position.x)*c.convergence,y:f.position.y-c.advance});separateCrowd(g);
 a.waiting.push(...a.queue.splice(0,c.arrivals).map(f=>({...f,waitSince:a.round})));const entering=admit(g);markRed(g);a.summary.push(`${leaving.length} conquis sortent · ${entering.length} entrent`);
 return {ok:true,before,entering,leaving};
}
export function arenaPreview(g,id,target,point){return previewCard(g,id,target,{point});}
export function arenaPlay(g,id,target,point){if(g.arena.status!=='playing')return {ok:false};return playCard(g,id,target,{point});}
export function restoreArena(input){
 const g=structuredClone(input),a=g?.arena;if(a?.version!==1)throw Error('Sauvegarde d’arène invalide.');validateScenario(a.config);validateCatalog(g.catalog);validateCrowd(g);
 if(!['playing','complete','stopped'].includes(a.status)||!range(a.integrity,0,a.config.integrity)||!range(a.round,1,12,true)||!Array.isArray(a.redIds)||!Array.isArray(a.summary))throw Error('État de show invalide.');
 const all=[...g.fans,...a.queue,...a.waiting,...a.retired];if(all.length!==a.config.total||new Set(all.map(f=>f.id)).size!==all.length||new Set(all.map(f=>f.rank)).size!==all.length||all.some(f=>!range(f.rank,1,a.config.total,true)))throw Error('File de spectateurs invalide.');
 for(const f of [...g.fans,...a.queue,...a.waiting])if(!range(f.hp,0,f.max,true)||!range(f.max,1,500,true)||!TYPE_EFFECTS[f.effect]||!range(f.mass,.25,5)||!Object.hasOwn(ABILITIES,f.ability)||!range(f.period,1,6,true)||!range(f.amount,0,40)||!range(f.radius,.2,3)||typeof f.name!=='string')throw Error('Spectateur invalide.');
 if(g.fans.length>a.config.capacity||!range(g.energy,0,3,true)||!range(g.tempo,0,10,true)||!range(g.turn,1,12,true)||!Array.isArray(g.cards)||g.cards.length!==15||g.hand.length>5)throw Error('Combat invalide.');
 if(g.actors.length!==3||new Set(g.actors.map(a=>a.id)).size!==3||g.cards.some(c=>!g.actors.some(a=>a.id===c.actorId)))throw Error('Trio invalide.');
 if(!['play','won','lost'].includes(g.phase)||!range(g.section,1,6,true)||a.waiting.some(f=>!range(f.waitSince,0,a.round,true)))throw Error('Tour invalide.');
 const cards=new Set(g.cards.map(c=>c.id)),piles=[...g.hand,...g.deck,...g.discard];if(cards.size!==15||piles.length!==15||new Set(piles).size!==15||piles.some(id=>!cards.has(id)))throw Error('Pioche invalide.');
 for(const card of g.cards){const recipe=g.catalog.cards.find(c=>c.id===card.kind);if(!recipe||JSON.stringify(compileCard(recipe))!==JSON.stringify(card.definition))throw Error('Définition de carte incohérente.');}
 if(g.songs.length!==2||g.songs.some(s=>!range(s.turns,3,6,true))||!g.songs.some(s=>s.id===g.songId))throw Error('Chanson invalide.');return g;
}
