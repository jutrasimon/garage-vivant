import {inRadius,physicsSettings} from './bandlive-crowd.mjs?v=0.9.0';
export function playProgram(game,card,targetId,options,hooks){
 const d=card.definition,fan=game.fans.find(f=>f.id===targetId),second=game.fans.find(f=>f.id===options.secondTargetId),point=d.target==='point'?options.point:undefined;
 if(d.target==='single'&&(!fan||fan.hp===0))return {ok:false,message:'Choisis un spectateur encore à conquérir.'};
 if(d.twoTargets&&(!second||second===fan||!second.hp))return {ok:false,message:'Choisis deux spectateurs distincts.'};
 if(d.target==='point'&&(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<game.room.margin||point.x>game.room.width-game.room.margin||point.y<game.room.margin||point.y>game.room.height-game.room.margin))return {ok:false,message:'Vise le sol dans la zone du public.'};
 const anchor=fan?.position||point,neighbor=d.target==='audience'?game.fans.some(f=>!f.hp):anchor&&inRadius(game,anchor,d.radius||1,{alive:false,exclude:fan?.id}).some(f=>!f.hp);
 const initialTempo=game.tempo,previous=game.events.findLast(e=>e.type==='card'&&e.turn===game.turn),start=game.events.length,queue=[],hits=[],motions=[],direct=new Set();
 const origin=()=>d.target==='point'?point:fan?.position||{x:game.room.width/2,y:game.room.height/2};
 const targets=()=>d.target==='audience'?game.fans.filter(f=>f.hp>0):d.radius?inRadius(game,origin(),d.radius):[fan,...(d.twoTargets?[second]:[])].filter(f=>f?.hp>0);
 game.energy-=d.cost;game.hand.splice(game.hand.indexOf(card.id),1);game.discard.push(card.id);game.played++;
 let tempoGain=0,tempoSpent=0,boostGain=0;
 const impulse=args=>{const result=hooks.runCrowdImpulse(game,args,queue,options.preview);motions.push(result.motion);hits.push(...result.hits);};
 for(const e of d.program){
  const condition=e.when==='always'||e.when==='tempo'&&initialTempo>=e.conditionValue||e.when==='alternate'&&previous&&previous.actorId!==card.actorId||e.when==='neighbor'&&neighbor||e.when==='conquest'&&direct.size>0;if(!condition)continue;
  const selected=targets();
  if(e.type==='power'){
   const spent=e.formula==='tempo'?game.tempo:e.formula==='spend'?Math.min(game.tempo,e.limit):0;
   const base=e.amount+spent*e.multiplier+(e.threshold&&initialTempo>=e.threshold.tempo?e.threshold.bonus:0),center={...origin()};
   const planned=selected.map(f=>({f,power:Math.floor(hooks.powerAgainst(game,card,f,base)*(d.coreRadius&&Math.hypot(f.position.x-center.x,f.position.y-center.y)>d.coreRadius*game.room.radiusUnit?d.outerScale:1))}));
   for(const {f,power} of planned){
    if(hooks.hitReaction(game,f,card.actorId)){f.reactionUsed=true;game.events.push({id:game.events.length+1,type:'reaction',turn:game.turn,fanId:f.id,name:f.intent,hits:[]});}
    for(let strike=0;strike<e.strikes&&f.hp>0;strike++){const value=Math.floor(power/e.strikes)+(strike<power%e.strikes?1:0),before=f.hp;f.hp=Math.max(0,before-value);hits.push({id:f.id,before,after:f.hp,gain:before-f.hp,power:value});if(!f.hp)direct.add(f.id);hooks.conquer(game,f,queue);}
   }
   const physics=physicsSettings(game.physics),impact=e.impactStrength??1,pushed=planned.filter(p=>p.power>0);
   if(physics.hitStrength&&impact&&pushed.length){
    const actorIndex=game.actors.findIndex(a=>a.id===card.actorId),slot=actorIndex%6,count=Math.min(6,game.actors.length-Math.floor(actorIndex/6)*6);
    const center=d.radius?{...origin()}:{x:90+(game.room.width-180)*(slot+.5)/count,y:-160};
    impulse({center,kind:'hit',targets:pushed.map(p=>p.f.id),strength:physics.hitStrength,strengthById:Object.fromEntries(pushed.map(p=>[p.f.id,impact*Math.min(1.8,Math.max(.35,p.power/6))]))});
   }
   if(e.formula!=='fixed'){game.tempo-=spent;tempoSpent+=spent;}
   game.boost=0;game.relayBoosts=(game.relayBoosts||[]).filter(b=>b.actorId===card.actorId);
  }else if(e.type==='tempo'){
   const gained=Math.min(10-game.tempo,e.amount);game.tempo+=gained;tempoGain+=gained;
   for(const f of game.fans)if(f.hp>0&&f.intent==='rhythm'&&!f.reactionUsed){f.reactionTempo=Math.min(3,f.reactionTempo+gained);if(f.reactionTempo>=3)hooks.triggerReaction(game,f,queue);}
  }else if(e.type==='energy')game.energy=Math.min(3,game.energy+e.amount);
  else if(e.type==='draw')hooks.draw(game,Math.min(e.amount,5-game.hand.length));
  else if(e.type==='boost'){if(e.other==='yes'){game.relayBoosts??=[];game.relayBoosts.push({actorId:card.actorId,power:e.amount});}else game.boost=Math.min(500,game.boost+e.amount);boostGain+=e.amount;}
  else if(e.type==='protect')selected.forEach(f=>f.noBoredom=true);
  else if(e.type==='style')selected.forEach(f=>f[e.duration==='song'?'chorusStyle':'turnStyle']=hooks.currentSong(game).style);
  else{
   // Motion also affects newly conquered spectators; the body remains on the floor.
   const affected=d.target==='audience'?game.fans:d.radius?inRadius(game,origin(),d.radius,{alive:false}):[fan,...(d.twoTargets?[second]:[])].filter(Boolean);
   const center={...origin()},strengthById=Object.fromEntries(affected.map(f=>[f.id,d.coreRadius&&Math.hypot(f.position.x-center.x,f.position.y-center.y)>d.coreRadius*game.room.radiusUnit?d.outerScale:1]));
   impulse({center,targets:affected.map(f=>f.id),kind:e.type,strength:e.strength,strengthById,collisionPower:e.collisionPower});
  }
 }
 const event={id:game.events.length+1,type:'card',turn:game.turn,cardId:card.id,actorId:card.actorId,name:d.name,hits,tempo:game.tempo,tempoGain,tempoSpent,boostGain,boost:game.boost,...(point?{point:{...point}}:{}),...(options.secondTargetId?{secondTargetId:options.secondTargetId}:{})};
 game.events.push(event);hooks.resolveConquests(game,queue);hooks.checkVictory(game);
 game.logs.push(d.name+' · '+hits.reduce((n,h)=>n+h.gain,0)+' conquête.');
 return {ok:true,event,effects:game.events.slice(start).filter(e=>e!==event),motions};
}
