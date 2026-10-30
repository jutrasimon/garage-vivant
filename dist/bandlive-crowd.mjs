// Combat coordinates are independent of CSS, zoom and decorative dancing.
// room.bodyRadius remains in early snapshots; physics.collisionRadius controls current contacts.
export const ROOM=Object.freeze({width:1120,height:360,margin:52,bodyRadius:23,radiusUnit:180});
export const PHYSICS=Object.freeze({force:420,grip:3,rebound:.28,collisionPower:2,collisionThreshold:60,collisionRadius:32,hitStrength:.75});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*1000)/1000;
// Perfect columns need a tiny lateral normal to escape compression; otherwise
// every correction stays vertical, even when there is free floor beside them.
function contactNormal(dx,dy,d){
 if(d&&Math.abs(dx)<.01&&Math.abs(dy)>0){
  const blend=(1-Math.abs(dx)/.01)**2,nx=dx/d+.1*blend,ny=dy/d*Math.sqrt(1-.01*blend*blend),length=Math.hypot(nx,ny);
  return {nx:nx/length,ny:ny/length};
 }
 return {nx:d?dx/d:1,ny:d?dy/d:0};
}
export function physicsSettings(value={}){
 const ranges={force:[30,650],grip:[1,12],rebound:[0,.85],collisionPower:[0,10],collisionThreshold:[0,400],collisionRadius:[16,48],hitStrength:[0,2]};
 return Object.fromEntries(Object.entries(ranges).map(([k,[a,b]])=>{const n=Number.isFinite(value[k])?clamp(value[k],a,b):PHYSICS[k];return [k,k==='collisionPower'?Math.round(n):n];}));
}
export function upgradePhysics(game){
 if(!game.spatialVersion)return;
 const old=game.physics;
 if(!Object.hasOwn(old,'collisionThreshold')){
  // Early, unpublished physical shows used an inactive collisionPower field.
  game.physics=physicsSettings({...old,collisionPower:old.collisionPower||PHYSICS.collisionPower,...(old.force===230&&old.grip===5?{force:PHYSICS.force,grip:PHYSICS.grip}:{})});
 }else game.physics=physicsSettings(old);
}
export function initializeCrowd(game){
 game.spatialVersion=1;game.room={...ROOM};game.physics={...PHYSICS};
 let rng=(game.seed^0x3c6ef372)>>>0;
 const random=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
 const cols=Math.ceil(game.fans.length/2),rows=Math.ceil(game.fans.length/cols);
 game.fans.forEach((f,i)=>{f.position={x:round(ROOM.width/2+(i%cols-(cols-1)/2)*152+(random()-.5)*55),y:round(ROOM.height/2+(Math.floor(i/cols)-(rows-1)/2)*145+(random()-.5)*70)};});
}
export function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
export function inRadius(game,center,radius=1,{exclude=null,alive=true,limit=Infinity}={}){
 const r=radius*(game.room?.radiusUnit||ROOM.radiusUnit);
 return game.fans.filter(f=>f.id!==exclude&&(!alive||f.hp>0)&&distance(f.position,center)<=r+1e-6).sort((a,b)=>distance(a.position,center)-distance(b.position,center)||a.id.localeCompare(b.id)).slice(0,limit);
}
export const nearby=(game,a,b,radius=1)=>a!==b&&distance(a.position,b.position)<=radius*game.room.radiusUnit+1e-6;
export function clampPosition(game,p){const r=game.room;return {x:round(clamp(p.x,r.margin,r.width-r.margin)),y:round(clamp(p.y,r.margin,r.height-r.margin))};}
export function moveSpectator(game,id,position){const f=game.fans.find(f=>f.id===id);if(!game.spatialVersion||!f||!Number.isFinite(position?.x)||!Number.isFinite(position?.y))return false;f.position=clampPosition(game,position);return true;}
export function separateCrowd(game,heldId=null){
 const min=physicsSettings(game.physics).collisionRadius*2,limit=(min-.01)**2;
 for(let pass=0;pass<400;pass++){
  // Keep normal crowds cheap. Only a visibly compressed pile needs extra passes.
  if(pass>=20&&pass%20===0&&!game.fans.some((a,i)=>game.fans.slice(i+1).some(b=>(!game.arena||a.hp>0&&b.hp>0)&&distance(a.position,b.position)<min-1)))break;
  let changed=false;
  for(let i=0;i<game.fans.length;i++)for(let j=i+1;j<game.fans.length;j++){
   const a=game.fans[i],b=game.fans[j];if(game.arena&&(!a.hp||!b.hp))continue;const dx=b.position.x-a.position.x,dy=b.position.y-a.position.y;if(dx*dx+dy*dy>=limit)continue;const d=Math.hypot(dx,dy);changed=true;
   const {nx,ny}=contactNormal(dx,dy,d),shift=min-d+.02,ma=a.id===heldId?0:b.id===heldId?1:.5;
   a.position=clampPosition(game,{x:a.position.x-nx*shift*ma,y:a.position.y-ny*shift*ma});b.position=clampPosition(game,{x:b.position.x+nx*shift*(1-ma),y:b.position.y+ny*shift*(1-ma)});
  }
  if(!changed)break;
 }
}
export function validateCrowd(game){
 if(game.spatialVersion===undefined)return;
 const r=game.room;
 if(game.spatialVersion!==1||!r||r.width!==ROOM.width||r.height!==ROOM.height||r.margin!==ROOM.margin||r.bodyRadius!==ROOM.bodyRadius||!Number.isFinite(r.radiusUnit)||r.radiusUnit<60||r.radiusUnit>240)throw Error('Salle physique invalide.');
 if(!game.physics||['force','grip','rebound','collisionPower'].some(k=>!Object.hasOwn(game.physics,k))||Object.hasOwn(game.physics,'collisionThreshold')&&Object.keys(PHYSICS).some(k=>!Object.hasOwn(game.physics,k))||Object.keys(game.physics).some(k=>!Object.hasOwn(PHYSICS,k)||physicsSettings(game.physics)[k]!==game.physics[k]))throw Error('Physique invalide.');
 for(const f of game.fans)if(!f.position||!Number.isFinite(f.position.x)||!Number.isFinite(f.position.y)||f.position.x<r.margin||f.position.x>r.width-r.margin||f.position.y<r.margin||f.position.y>r.height-r.margin)throw Error('Position de spectateur invalide.');
}
// Fixed-step, bounded impulses; sleeping bodies cost no work between actions.
// This pure simulation is shared by the preview, lab, actual play and replay.
export function simulateImpulse(game,{center,targets,kind='push',strength=1,strengthById={},collisionPower=0,wavePower=0,recordFrames=true,onContact=()=>{},onWave=()=>{}}){
 const settings=physicsSettings(game.physics),r=game.room,selected=new Set(targets),bodies=game.fans.map(f=>({id:f.id,x:f.position.x,y:f.position.y,vx:0,vy:0,spin:0}));
 const damping=Math.exp(-settings.grip/120),min=settings.collisionRadius*2,minSquared=min*min;
 const before=Object.fromEntries(bodies.map(b=>[b.id,{x:b.x,y:b.y}])),contacts=new Set(),hits=[];
 const wave=!!game.arena&&kind==='split',launched=new Set(),waveSpeed=game.arena?.config.waveSpeed||700;
 const indexed=new Map(game.fans.map(f=>[f.id,f])),solid=b=>!game.arena||indexed.get(b.id)?.hp>0;
 function launch(b){
  if(!solid(b))return;
  let dx=b.x-center.x,dy=b.y-center.y,length=Math.hypot(dx,dy);if(length<1){dx=Math.sin(bodies.indexOf(b)*2.4);dy=1;length=Math.hypot(dx,dy);}
  dx/=length;dy/=length;const speed=settings.force*clamp(strength,0,3)*(strengthById[b.id]??1);
  if(kind==='split'){dx=b.x<center.x?-1:1;dy=0;}else if(kind==='pull'){dx=-dx;dy=-dy;}else if(kind==='vortex'){const x=dx;dx=-dy;dy=x;}
  const mass=game.arena?(indexed.get(b.id)?.mass||1):1;
  b.vx=dx*speed/mass;b.vy=dy*speed/mass;b.spin=kind==='vortex'?5:kind==='jump'?1:.4;
 }
 for(const b of bodies)if(selected.has(b.id)&&!wave)launch(b);
 const frames=[];
 for(let step=0;step<300;step++){
  if(wave)for(const b of bodies)if(selected.has(b.id)&&!launched.has(b.id)&&Math.abs(b.x-center.x)<=waveSpeed*step/120){launched.add(b.id);if(solid(b)){launch(b);if(wavePower){for(let k=0;k<bodies.length;k++)game.fans[k].position=clampPosition(game,bodies[k]);onWave(indexed.get(b.id),wavePower,Math.floor(step/6));}}}
  let speed=0;
  for(const b of bodies){if(!solid(b)){b.vx=0;b.vy=0;continue;}if(kind==='return'&&step>40&&selected.has(b.id)){b.vx+=(before[b.id].x-b.x)*18/120;b.vy+=(before[b.id].y-b.y)*18/120;}b.x+=b.vx/120;b.y+=b.vy/120;b.vx*=damping;b.vy*=damping;
   if(b.x<r.margin||b.x>r.width-r.margin){b.x=clamp(b.x,r.margin,r.width-r.margin);b.vx*=-settings.rebound;}
   if(b.y<r.margin||b.y>r.height-r.margin){b.y=clamp(b.y,r.margin,r.height-r.margin);b.vy*=-settings.rebound;}
   speed=Math.max(speed,Math.hypot(b.vx,b.vy));
  }
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j],dx=b.x-a.x,dy=b.y-a.y;
   if(!solid(a)||!solid(b))continue;
   // Reject distant pairs before the expensive exact distance; contact order stays unchanged.
   if(dx*dx+dy*dy>=minSquared)continue;const d=Math.hypot(dx,dy);
   const {nx,ny}=contactNormal(dx,dy,d),overlap=(min-d)/2+.01;
   a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
   const va=a.vx*nx+a.vy*ny,vb=b.vx*nx+b.vy*ny,impact=va-vb;
   if(impact>0){const impulse=impact*(1+settings.rebound)/2;a.vx-=nx*impulse;a.vy-=ny*impulse;b.vx+=nx*impulse;b.vy+=ny*impulse;a.spin=Math.max(a.spin,.8);b.spin=Math.max(b.spin,.8);}
   const key=a.id+':'+b.id;
   if(impact>0&&impact>=settings.collisionThreshold&&!contacts.has(key)){
    contacts.add(key);
    const contact={a:a.id,b:b.id,speed:round(impact),power:settings.collisionPower+Math.floor(clamp(collisionPower,0,10)),recipients:[...(va>0?[b.id]:[]),...(vb<0?[a.id]:[])],frame:Math.floor(step/6),point:clampPosition(game,{x:(a.x+b.x)/2,y:(a.y+b.y)/2})};
    // Reactions to a collision read the positions at that contact, not the final rest positions.
    for(let k=0;k<bodies.length;k++)game.fans[k].position=clampPosition(game,bodies[k]);
    onContact(contact);hits.push(contact);
   }
  }
  if(recordFrames&&step%6===0)frames.push(bodies.map(b=>({id:b.id,...clampPosition(game,b),...(game.arena?{hp:indexed.get(b.id).hp}:{}),angle:round(b.spin*Math.sin(step/16)*Math.exp(-step/70)),lift:kind==='jump'&&selected.has(b.id)?round(Math.max(0,Math.sin(Math.min(1,step/70)*Math.PI))*40):0})));
  if(speed<.5&&(!wave||launched.size>=selected.size)&&step>(kind==='jump'?80:kind==='return'?100:40))break;
 }
 for(let k=0;k<bodies.length;k++)game.fans[k].position=clampPosition(game,bodies[k]);
 separateCrowd(game);if(recordFrames&&frames.length)frames[frames.length-1]=game.fans.map(f=>({id:f.id,...f.position,...(game.arena?{hp:f.hp}:{}),angle:0,lift:0}));
 return {type:'motion',name:kind==='hit'?'Impact musical':({push:'Repousser',split:'Pousser · gauche / droite',pull:'Attirer',vortex:'Tourbillon',jump:'Bond',return:'Retour élastique'})[kind]||'Impact',kind,center:{...center},targets:[...targets],before,after:Object.fromEntries(game.fans.map(f=>[f.id,{...f.position}])),frames,contacts:hits};
}
export function applyCollisionContact(game,contact,onConquer){
 const hits=[];
 for(const id of contact.recipients){const fan=game.fans.find(f=>f.id===id);if(!fan?.hp||!contact.power)continue;const before=fan.hp;fan.hp=Math.max(0,before-contact.power);hits.push({id,before,after:fan.hp,gain:before-fan.hp,power:contact.power,kind:'collision',sourceId:id===contact.a?contact.b:contact.a});onConquer(fan);}
 contact.hits=hits;return hits;
}
