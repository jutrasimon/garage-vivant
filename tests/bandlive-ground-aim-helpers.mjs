import assert from 'node:assert/strict';

export async function assertGroundAim(page,pointer){
 assert.equal(await page.locator('.bl-aim.visible .bl-aim-line').count(),1,'A ground card has exactly one arc, including mixed power/tempo cards');
 assert.equal(await page.locator('.bl-aim.visible .bl-aim-ring').count(),1,'Affected spectators never get individual aim rings');
 const ring=await page.locator('.bl-aim.visible .bl-aim-ring').boundingBox(),center=await page.locator('.bl-radius-center').boundingBox();
 assert(Math.hypot(ring.x+ring.width/2-center.x-center.width/2,ring.y+ring.height/2-center.y-center.height/2)<1,'The arc lands at the exact area center');
 if(pointer)assert(Math.hypot(center.x+center.width/2-pointer.x,center.y+center.height/2-pointer.y)<1,'The area center follows the pointer without snapping to a spectator');
 return page.locator('.bl-radius-outer').evaluate(el=>({x:Number(el.getAttribute('cx')),y:Number(el.getAttribute('cy')),radius:Number(el.getAttribute('rx'))}));
}

export async function trackEffectCanvas(page){
 await page.evaluate(()=>{
  const proto=CanvasRenderingContext2D.prototype;window.blTestEffectFrames=[];
  // Record only the effects canvas; scene rendering must stay untouched.
  for(const name of ['clearRect','beginPath','moveTo','lineTo','arc','stroke']){
   const original=proto[name];proto[name]=function(...args){
    if(this.canvas.classList.contains('bl-effects')){
     if(name==='clearRect'&&window.blTestEffectFrames.length<200){this.blTestFrame=[];window.blTestEffectFrames.push(this.blTestFrame);}
     else if(name==='beginPath')this.blTestPath=[];
     else if(name==='stroke')this.blTestFrame?.push(this.blTestPath?.slice()||[]);
     else if(name!=='clearRect')this.blTestPath?.push({name,args});
    }
    return original.apply(this,args);
   };
  }
 });
}

export async function assertGroundShot(page,center,coreRadius){
 const frames=await page.evaluate(()=>window.blTestEffectFrames),first=frames.find(frame=>frame.some(path=>path.some(op=>op.name==='lineTo')));
 assert(first,'The played ground card has a visible shot');
 assert.equal(first.filter(path=>path.some(op=>op.name==='lineTo')).length,1,'The initial shot goes to one point, never to every affected spectator');
 const centeredWaves=frames.map(frame=>frame.flatMap(path=>path.filter(op=>op.name==='arc')).map(op=>op.args).filter(([x,y])=>Math.hypot(x-center.x,y-center.y)<.01)),waves=centeredWaves.flat();
 assert(waves.some(([, ,r])=>r>center.radius*.9&&r<=center.radius+.01),'The impact wave expands from the fixed floor point to the card radius');
 if(coreRadius)assert(centeredWaves.some(([outer,inner])=>outer&&inner&&Math.abs(inner[2]/outer[2]-coreRadius/center.radius)<.001),'The impact draws both outer and core waves at their exact radius ratio');
}
