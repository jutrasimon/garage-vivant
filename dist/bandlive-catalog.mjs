import {INSTRUMENTS,definitionFor} from './bandlive-cards.mjs?v=0.9.0';
export const RARITIES=Object.freeze({common:{name:'Commune',weight:6},uncommon:{name:'Peu commune',weight:3},rare:{name:'Rare',weight:1},epic:{name:'Épique',weight:.3}});
const number=(label,min,max,value,step=1)=>({label,min,max,value,step});
export const EFFECTS=Object.freeze({
 power:{name:'Puissance',fields:{amount:number('Puissance',0,100,6),formula:{label:'Calcul',options:{fixed:'Fixe',tempo:'Ajouter tout le tempo',spend:'Consommer du tempo'}},limit:number('Tempo maximal consommé',1,10,4),multiplier:number('Puissance par tempo',1,5,1),strikes:number('Frappes',1,100,1),impactStrength:{...number('Force de repoussement',0,3,1,.1),optional:true}}},
 tempo:{name:'Gagner du tempo',fields:{amount:number('Tempo',1,100,2)}},
 energy:{name:'Gagner de l’énergie',fields:{amount:number('Énergie',1,3,1)}},
 draw:{name:'Piocher',fields:{amount:number('Cartes',1,5,1)}},
 boost:{name:'Bonus de prochaine puissance',fields:{amount:number('Puissance',1,30,3),other:{label:'Musicien',options:{no:'Tous',yes:'Un autre musicien'}}}},
 style:{name:'Adopter le style de la chanson',fields:{duration:{label:'Durée',options:{turn:'Ce tour',song:'Cette chanson'}}}},
 protect:{name:'Protéger de l’ennui',fields:{}},
 push:{name:'Repousser',fields:{strength:number('Force',.1,3,1,.1),collisionPower:number('Bonus de cœur au contact',0,10,0)}},
 split:{name:'Pousser · gauche / droite',fields:{strength:number('Force',.1,3,1,.1),collisionPower:number('Bonus de cœur au contact',0,10,0),wavePower:{...number('Puissance de la vague (arène)',0,30,0),optional:true}}},
 pull:{name:'Attirer',fields:{strength:number('Force',.1,3,1,.1),collisionPower:number('Bonus de cœur au contact',0,10,0)}},
 vortex:{name:'Tourbillon',fields:{strength:number('Force',.1,3,1,.1),collisionPower:number('Bonus de cœur au contact',0,10,0)}},
 jump:{name:'Faire bondir',fields:{strength:number('Force',.1,3,1,.1),collisionPower:number('Bonus de cœur au contact',0,10,0)}},
 return:{name:'Retour élastique',fields:{strength:number('Force',.1,3,1,.1),collisionPower:number('Bonus de cœur au contact',0,10,0)}},
});
export const CONDITIONS=Object.freeze({always:'Toujours',tempo:'Si le tempo initial atteint le seuil',alternate:'Si le musicien précédent est différent',neighbor:'Si un conquis est dans le rayon',conquest:'Si cette carte a conquis directement'});
export function newEffect(type='power'){const schema=EFFECTS[type];return {type,when:'always',...Object.fromEntries(Object.entries(schema.fields).map(([k,f])=>[k,f.options?Object.keys(f.options)[0]:f.value]))};}
const effect=(type,values={})=>({...newEffect(type),...values});
function program(d){
 const effects=[];
 if(Object.hasOwn(d,'power')){
  effects.push(effect('power',{amount:d.power,formula:d.useTempo?'tempo':d.consumeTempo?'spend':'fixed',limit:d.consumeTempo||10,multiplier:d.tempoMultiplier||1,strikes:d.strikes||1}));
  if(d.thresholdPower)effects[0].threshold={tempo:d.tempoThreshold,bonus:d.thresholdPower};
 }
 if(d.tempo)effects.push(effect('tempo',{amount:d.tempo}));
 if(d.neighborTempo)effects.push(effect('tempo',{amount:d.neighborTempo,when:'neighbor'}));
 if(d.alternateTempo)effects.push(effect('tempo',{amount:d.alternateTempo,when:'alternate'}));
 if(d.tempoOnConquest)effects.push(effect('tempo',{amount:Math.min(d.tempoOnConquest,d.tempoCap),when:'conquest'}));
 if(d.draw)effects.push(effect('draw',{amount:d.draw}));
 if(d.thresholdDraw)effects.push(effect('draw',{amount:d.thresholdDraw,when:'tempo',conditionValue:d.tempoThreshold}));
 if(d.boost)effects.push(effect('boost',{amount:d.boost}));
 if(d.relayBoost)effects.push(effect('boost',{amount:d.relayBoost,other:'yes'}));
 if(d.noBoredom)effects.push(effect('protect'));
 if(d.turnStyle)effects.push(effect('style'));
 return effects;
}
export function createCatalog(){
 const cards=Object.keys(INSTRUMENTS).flatMap(instrument=>['note','special','new1','new2'].map(kind=>{
  const d=definitionFor(instrument,kind);return {id:instrument+':'+kind,instrument,legacyKind:kind,name:d.name,cost:d.cost,target:d.twoTargets?'duo':d.target==='audience'?'audience':d.shape?'radius':'single',radius:d.shape==='row'?1.5:1,coreRadius:0,outerScale:.5,starter:kind==='note'?3:kind==='special'?2:0,rarity:kind.startsWith('new')?'uncommon':'common',minLevel:1,enabled:true,effects:program(d),legacyDescription:d.description};
 }));
 for(const [id,name,type] of [['blast','Basse sismique','push'],['magnet','Solo magnétique','pull'],['whirl','Tourbillon','vortex']])cards.push({id:'neutral:'+id,instrument:'neutral',name,cost:1,target:'point',radius:1,coreRadius:.45,outerScale:.5,starter:0,rarity:'rare',minLevel:2,enabled:true,effects:[effect('power',{amount:3}),effect(type)]});
 return {format:'garage-vivant-bandlive-cards',version:1,cards};
}
export function validateCatalog(value,{starters=true}={}){
 const fail=message=>{throw Error(message);};
 if(value?.format!=='garage-vivant-bandlive-cards'||value.version!==1||!Array.isArray(value.cards)||!value.cards.length||value.cards.length>256)fail('Catalogue invalide (1 à 256 cartes).');
 const ids=new Set(),aliases=new Set();
 for(const c of value.cards){
  if(!c||!/^[-a-z0-9:]{1,80}$/.test(c.id)||ids.has(c.id))fail('Identifiant de carte invalide ou dupliqué.');ids.add(c.id);
  if(!Object.hasOwn(INSTRUMENTS,c.instrument)&&c.instrument!=='neutral'||typeof c.name!=='string'||!c.name.trim()||c.name.length>70||!Number.isInteger(c.cost)||c.cost<0||c.cost>3)fail('Nom, instrument ou coût invalide.');
  if(!['single','duo','audience','radius','point'].includes(c.target)||!Number.isFinite(c.radius)||c.radius<.2||c.radius>3||!Number.isFinite(c.coreRadius)||c.coreRadius<0||c.coreRadius>c.radius||!Number.isFinite(c.outerScale)||c.outerScale<0||c.outerScale>1)fail('Zone de carte invalide.');
  if(!Object.hasOwn(RARITIES,c.rarity)||!Number.isInteger(c.minLevel)||c.minLevel<1||c.minLevel>100||!Number.isInteger(c.starter)||c.starter<0||c.starter>5||typeof c.enabled!=='boolean')fail('Distribution de carte invalide.');
  if(c.legacyKind!==undefined&&!['note','special','new1','new2'].includes(c.legacyKind))fail('Carte historique invalide.');
  if(c.legacyKind!==undefined){const alias=c.instrument+':'+c.legacyKind;if(c.instrument==='neutral'||aliases.has(alias))fail('Référence de carte historique ambiguë.');aliases.add(alias);}
  if(!Array.isArray(c.effects)||!c.effects.length||c.effects.length>12)fail('Choisis de 1 à 12 effets.');
  for(const [index,e] of c.effects.entries()){
   const schema=EFFECTS[e.type];if(!schema||!Object.hasOwn(CONDITIONS,e.when))fail('Effet ou condition inconnu.');
   for(const [k,f] of Object.entries(schema.fields)){
    const v=e[k]===undefined&&f.optional?f.value:e[k];
    if(f.options?!Object.hasOwn(f.options,v):!Number.isFinite(v)||v<f.min||v>f.max||f.step===1&&!Number.isInteger(v)){
     const allowed=f.options?'Choisis parmi : '+Object.values(f.options).join(', ')+'.':`Choisis ${f.step===1?'un entier':'une valeur'} entre ${f.min} et ${f.max}.`;
     fail(`Paramètre invalide : carte « ${c.name} », effet ${index+1} (${schema.name}) / ${f.label}. ${allowed}`);
    }
   }
   if(e.when==='tempo'&&(!Number.isInteger(e.conditionValue)||e.conditionValue<0||e.conditionValue>10))fail('Seuil de tempo invalide.');
   if(e.type==='power'&&e.threshold!==undefined&&(typeof e.threshold!=='object'||!Number.isInteger(e.threshold.tempo)||e.threshold.tempo<0||e.threshold.tempo>10||!Number.isInteger(e.threshold.bonus)||e.threshold.bonus<0||e.threshold.bonus>30))fail('Bonus au seuil invalide.');
  }
 }
 if(starters)for(const instrument of Object.keys(INSTRUMENTS)){
  const total=value.cards.filter(c=>c.enabled&&[instrument,'neutral'].includes(c.instrument)).reduce((n,c)=>n+c.starter,0);
  if(total!==5)fail(INSTRUMENTS[instrument]+' : le deck de départ doit contenir 5 cartes ('+total+' actuellement).');
 }
 return value;
}
export function catalogCard(catalog,instrument,kind){return catalog.cards.find(c=>c.id===kind&&[instrument,'neutral'].includes(c.instrument))||catalog.cards.find(c=>c.instrument===instrument&&c.legacyKind===kind);}
export function describeCard(c){
 const lines=c.effects.map(e=>{
  let text=e.type==='power'?`${e.amount} puissance${e.formula==='tempo'?' + tout le tempo (consommé)':e.formula==='spend'?` + ${e.multiplier} par tempo consommé (max. ${e.limit})`:''}${e.threshold?.bonus?` (+${e.threshold.bonus} à ${e.threshold.tempo} tempo)`:''}`:e.type==='tempo'?`+${e.amount} tempo`:e.type==='energy'?`+${e.amount} énergie`:e.type==='draw'?`Pioche ${e.amount}`:e.type==='boost'?`+${e.amount} prochaine puissance${e.other==='yes'?' d’un autre musicien':''}`:e.type==='protect'?'Protège de l’ennui ce tour':e.type==='style'?`Adopte le style (${e.duration==='song'?'chanson':'tour'})`:`${EFFECTS[e.type].name} · force ${e.strength}${e.collisionPower?` · collisions +${e.collisionPower}`:''}`;
  if(e.type==='split')text+=' · toute la foule, loin de la ligne'+(e.wavePower?' · vague : '+e.wavePower+' puissance':'');
  if(e.type==='power'&&e.strikes>1)text+=` en ${e.strikes} frappes (puissance partagée)`;
  if(e.type==='power'&&e.impactStrength!==undefined&&e.impactStrength!==1)text+=e.impactStrength===0?' · sans repoussement':` · repoussement ×${e.impactStrength}`;
  if(e.when!=='always')text+=' — '+CONDITIONS[e.when]+(e.when==='tempo'?' '+e.conditionValue:'');return text+'.';
 });
 return lines.join(' ')+(c.coreRadius&&!(c.effects?.some(e=>e.type==='split')&&c.effects.every(e=>['split','tempo','energy','draw','boost'].includes(e.type)))?` · cœur ${c.coreRadius}, couronne ${Math.round(c.outerScale*100)} %`:'');
}
export function compileCard(c){
 if(!c)throw Error('Carte absente du catalogue ou incompatible avec cet instrument.');
 const power=c.effects.find(e=>e.type==='power'),tempo=c.effects.filter(e=>e.type==='tempo').reduce((n,e)=>n+e.amount,0);
 return {name:c.name,cost:c.cost,target:c.target==='audience'?'audience':c.target==='point'?'point':'single',...(c.target==='duo'?{twoTargets:true}:{}),...(c.target==='radius'||c.target==='point'?{radius:c.radius,coreRadius:c.coreRadius,outerScale:c.outerScale}:{}),...(power?{power:power.amount}:{}),...(tempo?{tempo}:{}),...(c.effects.some(e=>e.type==='style')?{turnStyle:true}:{}),...(c.effects.some(e=>e.type==='protect')?{noBoredom:true}:{}),program:structuredClone(c.effects),description:describeCard(c),...(describeCard(c).length>220?{summary:c.effects.slice(0,3).map(e=>EFFECTS[e.type].name+(e.amount!==undefined?' '+e.amount:'')).join(' · ')+` · ${c.effects.length} effets. Règles complètes au survol.`}:{}),catalogId:c.id,rarity:c.rarity};
}
export function catalogStarter(catalog,instrument){return catalog.cards.filter(c=>c.enabled&&[instrument,'neutral'].includes(c.instrument)).flatMap(c=>Array(c.starter).fill(c.legacyKind||c.id));}
export function offeredCards(catalog,instrument,level=1,seed=''){
 let rng=2166136261;for(const ch of seed)rng=Math.imul(rng^ch.charCodeAt(0),16777619)>>>0;
 return catalog.cards.filter(c=>c.enabled&&[instrument,'neutral'].includes(c.instrument)&&c.minLevel<=level&&c.legacyKind!=='note').map(c=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return {c,rank:-Math.log((rng+.5)/4294967296)/RARITIES[c.rarity].weight};}).sort((a,b)=>a.rank-b.rank).slice(0,3).map(({c})=>({kind:c.legacyKind||c.id,...compileCard(c)}));
}
export function duplicateCard(catalog,id){const source=catalog.cards.find(c=>c.id===id);if(!source)throw Error('Carte inconnue.');let suffix=1,next;do{next=source.instrument+':copy-'+suffix++;}while(catalog.cards.some(c=>c.id===next));const c={...structuredClone(source),id:next,name:source.name+' · copie',starter:0,enabled:true};delete c.legacyKind;delete c.legacyDescription;catalog.cards.push(c);return c;}
export function retireCard(catalog,id){const c=catalog.cards.find(c=>c.id===id);if(!c)throw Error('Carte inconnue.');c.enabled=false;c.starter=0;return c;}
