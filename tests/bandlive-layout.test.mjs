import test from 'node:test';
import assert from 'node:assert/strict';
import {stageLayout,clampSlot,FAN_BODY,defaultFanPosition,settlePlacement} from '../dist/bandlive-layout.mjs';
import {overlaps} from '../dist/bandlive-physics.mjs';
import {placeDragFeedback} from '../dist/bandlive-drag-feedback.mjs';
import {fanGeometry,spaceHandPacks} from '../dist/bandlive-hand-geometry.mjs';

test('uneven hands stay separate, ordered and inside the stage without shrinking cards',()=>{
  const actors=stageLayout(1120,6,12,6).actors;
  function check(counts){
    const packs=counts.flatMap((count,i)=>count?[{x:actors[i].x,w:fanGeometry({count,scale:1.25,fan:26}).width}]:[]);
    const positions=spaceHandPacks(packs,16,1104);
    for(const [i,p] of packs.entries()){
      assert(positions[i]-p.w/2>=16-1e-8&&positions[i]+p.w/2<=1104+1e-8,'Every complete fan fits inside the stage');
      if(i)assert(positions[i]-p.w/2>=positions[i-1]+packs[i-1].w/2+16-1e-8,'Adjacent musicians leave a gap between their fans');
    }
    assert(spaceHandPacks(packs.map((p,i)=>({...p,x:positions[i]})),16,1104).every((x,i)=>Math.abs(x-positions[i])<1e-8),'A settled layout does not drift');
  }
  function distribute(counts,remaining){if(counts.length===6){check(counts);return;}for(let n=0;n<=remaining;n++)distribute([...counts,n],remaining-n);}
  distribute([],5);
  const separated=[{x:240,w:160},{x:560,w:250},{x:880,w:160}];
  assert.deepEqual(spaceHandPacks(separated,16,1104),separated.map(p=>p.x),'Hands already clear of their neighbours stay under their owners');
});

test('cursor feedback stays inside the viewport and protects its target near each edge',()=>{
  for(const [screenWidth,screenHeight] of [[1920,1080],[1024,768],[390,844]])for(const [px,py] of [[.1,.2],[.5,.5],[.9,.8]]){
    const bounds={left:12,top:12,right:screenWidth-12,bottom:screenHeight-12},pointer={x:screenWidth*px,y:screenHeight*py},target={left:pointer.x-32,right:pointer.x+32,top:pointer.y-48,bottom:pointer.y+48},width=260,height=240;
    const {x,y}=placeDragFeedback({pointer,target,bounds,width,height});
    assert(x>=bounds.left&&y>=bounds.top&&x+width<=bounds.right&&y+height<=bounds.bottom);
    assert(x+width<=target.left||x>=target.right||y+height<=target.top||y>=target.bottom,'The aimed character stays visible');
    assert(Math.hypot(Math.max(x-pointer.x,0,pointer.x-x-width),Math.max(y-pointer.y,0,pointer.y-y-height))<160,'Feedback stays close to the pointer');
  }
  const bounds={left:12,top:12,right:1908,bottom:1068},target={left:900,right:980,top:450,bottom:550},pointer={x:940,y:500},width=260,height=240;
  const initial=placeDragFeedback({pointer,target,bounds,width,height});
  assert(['left','right'].includes(placeDragFeedback({pointer:{x:940,y:451},target,bounds,width,height}).side),'Use the side when entering a target from above and enough room is available');
  for(const dx of [-5,5,-3,3])assert.equal(placeDragFeedback({pointer:{...pointer,x:pointer.x+dx},target,bounds,width,height,preferredSide:initial.side}).side,initial.side,'Small moves do not flip the tooltip to the opposite side');
});
test('all allowed crowds retain their slots and protected rectangles after arbitrary drags',()=>{
  for(const count of [3,8,10,12]){
    const g=stageLayout(1200,6,count,Math.min(4,count)),bodies=g.slots.map((slot,i)=>({id:'f'+i,type:'fan',...FAN_BODY,slot,...defaultFanPosition(slot,i)}));
    for(const b of bodies){b.x+=1000;b.y-=1000;clampSlot(b,b.slot);}
    for(const [i,b] of bodies.entries()){
      assert.equal(b.id,'f'+i);assert(b.x-b.w/2>=b.slot.left);assert(b.x+b.w/2<=b.slot.right);assert(b.y-b.h/2>=b.slot.top);assert(b.y+b.h/2<=b.slot.bottom);
      assert(bodies.slice(i+1).every(other=>!overlaps(b,other)));
    }
  }
});
test('effect feedback clears complete radii, multiple zones and edges with a stable side',()=>{
  for(const [w,h,cx,cy,rx,ry] of [[1440,900,720,500,180,180],[1024,720,850,450,150,150],[390,900,195,520,145,145],[1440,900,650,500,270,130]]){
    const pointer={x:cx,y:cy},target={left:cx-32,right:cx+32,top:cy-48,bottom:cy+48},bounds={left:12,top:12,right:w-12,bottom:h-12},zones=[{cx,cy,rx,ry}],width=260,height=w<500?250:390;
    if(w===1440)zones.push({cx:cx+80,cy:cy+60,rx:130,ry:100});
    const p=placeDragFeedback({pointer,target,bounds,zones,width,height});assert.equal(p.zoneOverlap,0);assert.equal(p.targetOverlap,0);assert(p.x>=12&&p.y>=12&&p.x+width<=w-12&&p.y+height<=h-12);
    for(const z of zones){const x=Math.max(p.x,Math.min(z.cx,p.x+width)),y=Math.max(p.y,Math.min(z.cy,p.y+height));assert(((x-z.cx)/z.rx)**2+((y-z.cy)/z.ry)**2>=1,'The opaque panel lies outside the actual ellipse, not just outside its source');}
    for(const dx of [-3,3])assert.equal(placeDragFeedback({pointer:{x:cx+dx,y:cy},target,bounds,zones,width,height,preferredSide:p.side}).side,p.side);
  }
});
test('an oversized radius keeps feedback bounded and its target visible when no exterior panel can fit',()=>{
  const bounds={left:12,top:12,right:378,bottom:588},pointer={x:195,y:350},target={left:163,right:227,top:302,bottom:398};
  const p=placeDragFeedback({pointer,target,bounds,zones:[{cx:195,cy:350,rx:500,ry:500}],width:260,height:200});assert(p.zoneOverlap>0);assert.equal(p.targetOverlap,0);assert(p.x>=12&&p.y>=12&&p.x+260<=378&&p.y+200<=588);
});
test('moving a hand through the crowd never pushes its protected bodies',()=>{
  const fan={id:'f0',type:'fan',x:100,y:100,...FAN_BODY},hand={id:'p0',type:'cards',x:100,y:100,w:210,h:155};const before={...fan};
  settlePlacement([fan,hand],hand,700,600);assert.deepEqual(fan,before);
});
