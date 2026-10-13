// Reaction RNG is independent of card draws and world simulation.
export const REACTIONS=Object.freeze({
  bored:{name:'Ennui 3',icon:'☾',value:3,description:'En fin de tour : perd 3 conquête, sauf protection. Reste si aucune conquête ne peut être perdue.'},
  attentive:{name:'Attentif',description:'La prochaine carte de puissance qui le touche reçoit +3 puissance contre lui.'},
  distracted:{name:'Distrait',description:'La prochaine carte de puissance qui le touche reçoit −3 puissance contre lui, minimum 0.'},
  rhythm:{name:'Attend du rythme',icon:'♫',description:'3 tempo réellement gagnés ce tour → +3 conquête immédiatement. Une fois par tour.'},
  variety:{name:'Veut de la variété',description:'Quand un deuxième musicien différent le touche avec une carte de puissance dans le même tour, cette carte reçoit +3 puissance contre lui.'},
  following:{name:'Se laisse entraîner',icon:'↗',description:'Un voisin immédiat conquis → +3 conquête immédiatement. Une fois par tour.'},
});
export function clearReactionProgress(fan){fan.reactionActors=[];fan.reactionTempo=0;fan.reactionNeighbor=false;}
export function rerollReaction(game,fan){
  const choices=Object.keys(REACTIONS).filter(key=>key!==fan.intent);
  game.reactionRng=(Math.imul(1664525,game.reactionRng)+1013904223)>>>0;
  fan.intent=choices[Math.floor(game.reactionRng/4294967296*choices.length)];clearReactionProgress(fan);
}
export function initializeReactions(game,version=2){
  game.reactionVersion=version;game.reactionRng=(game.seed^0x51a7c3d9)>>>0;
  if(version>=2)game.fans.forEach(f=>f.reactionUsed=false);
  game.fans.forEach(fan=>{fan.intent=null;rerollReaction(game,fan);});
}
export function reactionPower(game,fan,actorId){
  if(!game.reactionVersion||fan.reactionUsed)return 0;
  return fan.intent==='attentive'?3:fan.intent==='distracted'?-3:fan.intent==='variety'&&fan.reactionActors.some(id=>id!==actorId)?3:0;
}
export function hitReaction(game,fan,actorId){
  if(!game.reactionVersion||fan.reactionUsed)return false;
  if(['attentive','distracted'].includes(fan.intent))return true;
  if(fan.intent!=='variety')return false;
  const triggered=fan.reactionActors.some(id=>id!==actorId);
  if(!fan.reactionActors.includes(actorId))fan.reactionActors.push(actorId);
  return triggered;
}
export function reactionText(game,fan){
  if(!game.reactionVersion)return fan.intent==='solo'?'Attend un Solo':'S’ennuie · −3 conquête';
  if(fan.reactionUsed)return '';
  const r=REACTIONS[fan.intent];
  return r.name+(['attentive','distracted'].includes(fan.intent)?(fan.intent==='attentive'?' +3':' −3'):fan.intent==='rhythm'?` · ${Math.min(3,fan.reactionTempo)}/3`:fan.intent==='variety'?` · ${Math.min(1,fan.reactionActors.length)}/2`:'');
}
