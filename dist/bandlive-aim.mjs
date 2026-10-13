export function createBandLiveAim(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('bl-aim');svg.setAttribute('aria-hidden','true');
  const ns=svg.namespaceURI;let host=null,geometry=null,pointerArcs=[];
  function attach(world){host=world;const frame=world?.closest('.bl-show-screen')||world;if(frame&&svg.parentElement!==frame)frame.append(svg);hide();}
  function hide(){svg.classList.remove('visible');geometry=null;pointerArcs=[];}
  function screenPoint(point){return {x:(point.x-geometry.left)/geometry.scale,y:(point.y-geometry.top)/geometry.scale};}
  function updateArc(arc,end){
    const {start,kind,paths,circle}=arc,dx=end.x-start.x,dy=end.y-start.y;
    const lift=Math.min(135,Math.max(50,Math.abs(dx)*.22+Math.abs(dy)*.15))+(kind==='tempo'?18:0),side=Math.abs(dx)<60?65:0;
    const d=`M ${start.x} ${start.y} C ${start.x+dx*.32+side} ${start.y-lift}, ${end.x-dx*.23+side*.45} ${end.y-lift*.65}, ${end.x} ${end.y}`;
    for(const path of paths)path.setAttribute('d',d);
    circle.setAttribute('cx',end.x);circle.setAttribute('cy',end.y);
  }
  function movePointer(point){
    if(!geometry||!pointerArcs.length||!point)return;
    const end=screenPoint(point);
    for(const arc of pointerArcs)updateArc(arc,end);
  }
  function draw(start,ends,valid=true){
    if(!host||!start||!ends.length)return hide();svg.replaceChildren();
    // Cache the conversion once per target; moving the pointer only updates SVG.
    const world=host.getBoundingClientRect(),frame=svg.parentElement.getBoundingClientRect(),scale=Number(host.dataset.scale)||1;
    geometry={left:world.left,top:world.top,scale};pointerArcs=[];
    const group=document.createElementNS(ns,'g');group.setAttribute('transform',`translate(${world.left-frame.left} ${world.top-frame.top}) scale(${scale})`);svg.append(group);
    for(const end of ends){
      const paths=[];
      for(const cls of ['bl-aim-halo','bl-aim-line']){const p=document.createElementNS(ns,'path');p.setAttribute('class',cls+(end.kind==='tempo'?' bl-aim-tempo':''));group.append(p);paths.push(p);}
      const circle=document.createElementNS(ns,'circle');circle.setAttribute('class','bl-aim-ring'+(end.kind==='tempo'?' bl-aim-tempo':''));circle.setAttribute('r',end.kind==='tempo'?'14':'29');group.append(circle);
      const arc={start,kind:end.kind,paths,circle};
      updateArc(arc,end.pointer?screenPoint(end.pointer):end);
      if(end.pointer)pointerArcs.push(arc);
    }
    svg.classList.add('visible');svg.classList.toggle('invalid',!valid);
  }
  return {attach,draw,movePointer,hide};
}
