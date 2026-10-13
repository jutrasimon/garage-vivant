import {clampBody,resolveBodies} from './bandlive-physics.mjs?v=0.7.21';
export const FAN_BODY=Object.freeze({w:86,h:112});
export const ACTOR_BODY=Object.freeze({w:132.5,h:110});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// These slots present the engine's topology. They never reorder game.fans.
export function stageLayout(width,memberCount,fanCount,columns,compact=false){
  const area=width>=1300?width-230:width,stage={left:65,right:area-65,top:75,bottom:212};
  const cellW=142,cellH=140,crowdLeft=compact?24:Math.max(24,(area-columns*cellW)/2);
  return {area,stage,actors:Array.from({length:memberCount},(_,i)=>({x:stage.left+(stage.right-stage.left)*(i+.5)/memberCount,y:143})),
    slots:Array.from({length:fanCount},(_,i)=>({left:crowdLeft+i%columns*cellW,right:crowdLeft+(i%columns+1)*cellW,top:Math.floor(i/columns)*cellH,bottom:(Math.floor(i/columns)+1)*cellH})),
    crowdHeight:Math.ceil(fanCount/columns)*cellH};
}
export function clampSlot(body,slot){
  body.x=clamp(body.x,slot.left+body.w/2+6,slot.right-body.w/2-6);
  body.y=clamp(body.y,slot.top+body.h/2+6,slot.bottom-body.h/2-6);
  return body;
}
export function settlePlacement(bodies,held,width,height){
  if(held?.type==='cards'){clampBody(held,width,height);return;}
  const people=bodies.filter(b=>b.type!=='cards');
  resolveBodies(people,held,width,height,24);
  for(const b of people)if(b.slot)clampSlot(b,b.slot);
}
export function defaultFanPosition(slot,index){
  const x=[-11,8,-5,12,6,-9,10,-7][index%8],y=[-5,5,2,-3,4,-4][index%6];
  return {x:(slot.left+slot.right)/2+x,y:(slot.top+slot.bottom)/2+y};
}
