import * as T from './bandlive-three.mjs?v=0.8.0';
import {spotlightVertices} from './bandlive-spotlight-geometry.mjs?v=0.8.0';

export function createMinuitRenderer({getReducedEffects}){
  const canvas=document.createElement('canvas');canvas.className='bl-scene-canvas';canvas.setAttribute('aria-hidden','true');
  const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  const scene=new T.Scene();scene.background=new T.Color(0x203943);
  const camera=new T.OrthographicCamera(-10,10,8,-8,.1,100);camera.position.set(0,17,21);camera.lookAt(0,0,1.1);
  scene.add(new T.HemisphereLight(0xffffff,0x65707b,2.2));const light=new T.DirectionalLight(0xffffff,1.5);light.position.set(-8,15,9);scene.add(light);
  const boxGeometry=new T.BoxGeometry(1,1,1),ray=new T.Raycaster(),stage=new T.Group();scene.add(stage);
  const material=c=>new T.MeshLambertMaterial({color:c});
  function box(parent,x,y,z,w,h,d,color){const m=new T.Mesh(boxGeometry,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
  function disk(parent,x,y,z,r,color,opacity=1){const m=new T.Mesh(new T.CircleGeometry(r,24),new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);parent.add(m);return m;}
  function cylinder(parent,x,y,z,r,h,color){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,16),material(color));m.position.set(x,y,z);parent.add(m);return m;}
  const floor=box(scene,0,-.25,1,52,.3,42,0x203943);box(stage,0,.15,-4,17,.8,4.4,0x36545c);box(stage,0,.44,-1.79,17,.16,.12,0x11242b);box(stage,0,2,-6.2,17,3,.2,0x2c474f);
  for(const x of [-7.2,7.2]){box(stage,x,1.3,-4.6,.9,1.65,.8,0x344640);for(const y of [.9,1.6]){const m=new T.Mesh(new T.CylinderGeometry(.28,.28,.08,16),material(0x182c2c));m.rotation.x=Math.PI/2;m.position.set(x,y,-4.16);stage.add(m);}}
  const tile=document.createElement('canvas');tile.width=tile.height=256;const q=tile.getContext('2d');q.fillStyle='#f7f2e4';q.fillRect(0,0,256,256);
  for(let row=0;row<4;row++){q.fillStyle=row%2?'#eee8d9':'#f3eddf';q.fillRect(0,row*64,256,63);q.fillStyle='#d4cdbd';q.fillRect(0,row*64+63,256,1);q.fillRect(row%2?80:190,row*64,1,64);}
  const floorTexture=new T.CanvasTexture(tile);floorTexture.wrapS=floorTexture.wrapT=T.RepeatWrapping;floorTexture.repeat.set(10,9);floorTexture.colorSpace=T.SRGBColorSpace;floor.material.map=floorTexture;
  const rig=new T.Group();scene.add(rig);const rail=box(rig,0,4.18,0,1,.075,.11,0x4d6667);
  const bulbs=Array.from({length:12},()=>box(rig,0,3.5,0,.09,.11,.09,0xf4b2c4));bulbs.forEach(m=>{m.material.emissive.set(0xf2b5a2);m.material.emissiveIntensity=.7;});
  let host=null,game=null,width=0,height=0,frame=null,entries=[],lamps=[];
  function floorPoint(x,y,planeY){ray.setFromCamera(new T.Vector2(x/width*2-1,1-y/height*2),camera);const result=new T.Vector3();ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),-planeY),result);return result;}
  function instrument(key){
    const g=new T.Group();
    if(key==='keys'){box(g,0,.62,1.05,1.4,.12,.4,0x354b47);for(let k=0;k<12;k++)box(g,-.6+k*.105,.70,1.09,.08,.03,.32,0xf9eed9);}
    else if(key==='drums'||key==='percussion'){for(let j=0;j<(key==='drums'?3:2);j++)cylinder(g,(j-(key==='drums'?1:.5))*.48,.55,1.05,.3,.27,j===1?0xe5bf67:0xe9e4ce);if(key==='drums'){box(g,.8,.64,.5,.03,1,.03,0x344044);disk(g,.8,1.14,.5,.35,0xe5bf67);}}
    else if(key==='guitar'||key==='bass'){const guitar=new T.Group();guitar.position.set(.1,.65,1.05);guitar.rotation.z=-.55;g.add(guitar);box(guitar,0,0,0,.46,.53,.13,key==='guitar'?0xf4dfac:0x344d58);box(guitar,0,.5,0,.12,.7,.1,0x9c8055);for(let k=0;k<3;k++)box(guitar,-.025+k*.025,.2,.08,.006,1,.008,0xfff8e0);}
    else if(key==='voice'){box(g,.25,.6,1,.035,1.1,.035,0x384b54);disk(g,.25,.06,1,.22,0x384b54);const mic=cylinder(g,.25,1.2,1,.08,.22,0xe5bf67);mic.rotation.z=-.6;}
    else if(key==='sax'){const tube=cylinder(g,.12,.8,1,.09,.65,0xd4b75e);tube.rotation.z=.35;box(g,.22,.45,1,.12,.2,.18,0xd4b75e);const bell=new T.Mesh(new T.ConeGeometry(.22,.32,16,1,true),material(0xe8cd79));bell.position.set(.28,.65,1.05);bell.rotation.z=Math.PI;g.add(bell);}
    else if(key==='trumpet'){const tube=cylinder(g,.25,.86,1,.085,.65,0xd4b75e);tube.rotation.z=Math.PI/2;for(let j=0;j<3;j++)box(g,.1+j*.12,1.02,1,.025,.16,.025,0xe8cd79);const bell=new T.Mesh(new T.ConeGeometry(.22,.30,16,1,true),material(0xe8cd79));bell.position.set(.7,.86,1);bell.rotation.z=Math.PI/2;g.add(bell);}
    g.scale.setScalar(1.25);g.traverse(o=>{if(o.isMesh){o.material.transparent=true;o.material.depthWrite=false;o.renderOrder=5;}});return g;
  }
  function clear(){for(const p of entries){scene.remove(p.sprite,p.shadow,p.instrument);p.texture.dispose();p.sprite.material.dispose();p.shadow.geometry.dispose();p.shadow.material.dispose();p.instrument?.traverse(o=>{if(o.isMesh){if(o.geometry!==boxGeometry)o.geometry.dispose();o.material.dispose();}});}entries=[];for(const l of lamps){scene.remove(l.beam,l.pool);rig.remove(l.fixture);l.beam.geometry.dispose();l.beam.material.dispose();l.pool.geometry.dispose();l.pool.material.dispose();l.fixture.material.dispose();}lamps=[];}
  function populate(){
    clear();
    for(const [i,person] of [...game.actors,...game.fans].entries()){
      const actor=i<game.actors.length,element=host.querySelector(actor?'[data-bl-actor="'+CSS.escape(person.id)+'"]':'[data-bl-fan="'+CSS.escape(person.id)+'"]'),image=element.querySelector('.bl-cube');
      const texture=new T.CanvasTexture(image);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;
      const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.renderOrder=4;scene.add(sprite);
      const shadow=disk(scene,0,0,0,.4,0x102e28,.17),model=actor?instrument(person.instrument):null;if(model)scene.add(model);
      entries.push({person,actor,element,image,texture,sprite,shadow,instrument:model,index:i,phase:i*2.31});
      if(actor){const color=[0xcbe9a2,0xf4b2c4,0xa6d9e8,0xf5da94][i%4],geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(9),3));geometry.setIndex([0,1,2]);
        const beam=new T.Mesh(geometry,new T.MeshBasicMaterial({color,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false}));beam.renderOrder=-1;beam.frustumCulled=false;scene.add(beam);
        const pool=disk(scene,0,.565,0,1.1,color,.18),fixture=box(rig,0,4.03,0,.5,.17,.26,color);lamps.push({beam,pool,fixture,anchor:null,entry:entries.at(-1)});
      }
    }
  }
  function resize(){
    if(!host||!host.clientWidth||!host.clientHeight)return;
    width=host.clientWidth;height=host.clientHeight;renderer.setSize(width,height,false);
    const aspect=width/height,halfW=Math.max(9.2,5.8*aspect);camera.left=-halfW;camera.right=halfW;camera.top=halfW/aspect;camera.bottom=-halfW/aspect;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    const area=width,unit=width/(camera.right-camera.left),edge=floorPoint(area/2,160,.44);stage.position.set(edge.x,0,edge.z+1.79);stage.scale.x=(area-60)/(17*unit);
    const left=floorPoint(40,20,4.18),right=floorPoint(area-40,20,4.18);rail.position.copy(left).lerp(right,.5);rail.scale.x=right.x-left.x;
    bulbs.forEach((b,i)=>b.position.copy(floorPoint(50+(area-100)*i/11,46,3.5)));
    lamps.forEach((l,i)=>{l.anchor=floorPoint(65+(area-130)*(i+.5)/game.actors.length,22,4.1);l.fixture.position.copy(l.anchor);});
  }
  function paint(ms){
    frame=null;if(!host?.isConnected||host.closest('.view')?.hidden)return;
    const rect=host.getBoundingClientRect(),crowd=host.querySelector('.bl-audience-viewport').getBoundingClientRect(),unit=width/(camera.right-camera.left),reduced=getReducedEffects()||matchMedia('(prefers-reduced-motion: reduce)').matches,t=ms/1000;
    for(const p of entries){
      const f=3.15+((p.index*.61803398875)%1)*1.35,movement=p.person.identity?.movement,amplitude=movement==='calm'?.6:movement==='flamboyant'?1.2:1;
      const dx=reduced?0:Math.sin(t*f*.73+p.phase)*amplitude*(p.actor?1.1:1.5),dy=reduced?0:-Math.max(0,Math.sin(t*f*1.73+p.phase))*amplitude*2;
      p.element.style.setProperty('--bl-dance-x',dx+'px');p.element.style.setProperty('--bl-dance-y',dy+'px');
      const r=p.image.getBoundingClientRect(),scale=Number(host.dataset.scale)||1,x=(r.left+r.width/2-rect.left)/scale,y=(r.top+r.height/2-rect.top)/scale;
      p.sprite.position.copy(floorPoint(x,y,p.actor?1.6:1));p.sprite.scale.set(r.width/scale/unit,r.height/scale/unit,1);p.sprite.material.rotation=reduced?0:Math.sin(t*f+p.phase)*.045;
      const visible=p.actor||r.top+r.height/2>crowd.top+10&&r.top+r.height/2<crowd.bottom-10;p.sprite.visible=p.shadow.visible=visible;
      const foot=floorPoint(x,y+r.height/scale*.34,p.actor?.6:0);p.shadow.position.copy(foot);p.shadow.position.y-=.035;p.shadow.scale.setScalar(r.width/scale/unit*.30);
      if(p.instrument)p.instrument.position.copy(foot);
    }
    for(const l of lamps){const target=l.entry.instrument.position,attribute=l.beam.geometry.getAttribute('position');spotlightVertices(l.anchor,{x:target.x,y:target.y-.034,z:target.z+.2},1.15,attribute.array);attribute.needsUpdate=true;l.pool.position.set(target.x,target.y-.035,target.z+.2);}
    renderer.render(scene,camera);frame=requestAnimationFrame(paint);
  }
  return {canvas,attach(next,state){if(!next){this.pause();return;}const changed=next!==host;host=next;game=state;if(canvas.parentElement!==host)host.prepend(canvas);host.classList.add('bl-render-ready');if(changed)populate();resize();if(frame===null)frame=requestAnimationFrame(paint);},pause(){if(frame!==null)cancelAnimationFrame(frame);frame=null;}};
}
