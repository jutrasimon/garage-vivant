export const SIZE_CONTROLS=Object.freeze({
  musicians:{label:'Musiciens',min:60,max:140},
  instruments:{label:'Instruments',min:60,max:160},
  spectators:{label:'Spectateurs',min:65,max:140},
});

export function layoutSizes(value={}){
  return Object.fromEntries(Object.entries(SIZE_CONTROLS).map(([key,{min,max}])=>[key,Number.isFinite(value?.[key])?Math.max(min/100,Math.min(max/100,value[key])):1]));
}

export function layoutMetrics(memberCount,sizes,maxHandHeight=276){
  const actorOffset=55*(sizes.musicians-1),clearance=100*sizes.musicians*Math.max(1,sizes.instruments);
  const extra=Math.max(0,actorOffset+clearance-100)+Math.max(0,maxHandHeight-276);
  // The health bar extends ten units below its character's hitbox.
  return {actorOffset,clearance,rowStride:300+extra,stageHeight:480+extra+Math.floor((memberCount-1)/6)*(300+extra),cellHeight:Math.max(136,132*sizes.spectators+4)};
}
