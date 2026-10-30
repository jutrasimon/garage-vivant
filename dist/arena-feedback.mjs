import {createDragFeedback,showDragFeedback} from './bandlive-drag-feedback.mjs?v=0.9.0';
import {tempoNotesHTML} from './bandlive-tempo-notes.mjs?v=0.9.0';
import {cardById,cardDefinition,currentSong,CONQUEST_EFFECTS,conquestLabel,conquestDescription} from './bandlive.mjs?v=0.9.0';
import {REACTIONS,reactionText} from './bandlive-reactions.mjs?v=0.9.0';

export function arenaOutcome(game,card,fan,preview){
 const outcome={valid:!!preview?.ok,name:fan?.name||'Effet de la carte',main:preview?.message||'Vise une cible valide.',meta:'Aucune ressource ne sera dépensée.'};
 if(preview?.ok){
  const next=preview.game,after=fan&&next.fans.find(f=>f.id===fan.id),total=game.fans.reduce((sum,f)=>sum+f.hp-next.fans.find(n=>n.id===f.id).hp,0),conquests=game.fans.filter(f=>f.hp>0&&next.fans.find(n=>n.id===f.id).hp===0).length;
  const effects=preview.effects||[],chains=effects.filter(e=>e.type==='conquest'),collision=preview.event.hits.filter(h=>h.kind==='collision').reduce((n,h)=>n+h.gain,0);
  const resources=[`Énergie ${game.energy} → ${next.energy}`,`Tempo ${game.tempo} → ${next.tempo}`];
  if(game.boost!==next.boost)resources.push(`Bonus ${game.boost} → ${next.boost}`);
  if(collision)resources.push(`Chocs : +${collision} ♥`);
  resources.push(`Total +${total} ♥`);if(conquests)resources.push(`${conquests} conquis`);if(chains.length>1)resources.push(`${chains.length} pouvoirs en chaîne`);
  const movement=effects.filter(e=>e.type==='motion').reduce((n,e)=>n+e.targets.length,0);
  const main=Object.hasOwn(card,'power')?`+${total} ♥ sur le public`:card.tempo?`Tempo ${game.tempo} → ${next.tempo}`:card.boost?`Bonus ${game.boost} → ${next.boost}`:card.turnStyle?`Style ${currentSong(game).style}`:movement?`${movement} déplacements prévus`:game.energy!==next.energy+card.cost?`Énergie ${game.energy} → ${next.energy}`:`Main ${game.hand.length} → ${next.hand.length}`;
  Object.assign(outcome,{meta:resources.join(' · '),main,gain:after&&Object.hasOwn(card,'power')?fan.hp-after.hp:null,meter:after?`${fan.max-fan.hp}/${fan.max} → ${after.max-after.hp}/${after.max}`:'',conquered:after&&fan.hp>0&&after.hp===0});
  const effect=chains.find(e=>e.fanId===fan?.id)||(!fan&&chains[0]);
  if(effect){const source=game.fans.find(f=>f.id===effect.fanId);outcome.conquestReady={sourceId:source.id,icon:CONQUEST_EFFECTS[effect.effect].icon,name:effect.name,description:conquestDescription(game,source),targets:effect.targets.map(id=>game.fans.find(f=>f.id===id)?.name||id),chainCount:chains.length};}
  else if(after?.hp>0&&CONQUEST_EFFECTS[fan.effect])outcome.conquestPending={remaining:after.hp};
  if(after?.reactionUsed&&!fan.reactionUsed)outcome.trigger='✦ Réaction déclenchée par cette carte';
 }
 if(fan){outcome.reaction=fan.reactionUsed?'Réaction consommée ce tour':`${reactionText(game,fan)} : ${REACTIONS[fan.intent]?.description||''}`;outcome.conquest=`${conquestLabel(game,fan)} : ${conquestDescription(game,fan)}`;}
 return outcome;
}

export function createArenaFeedback({canvas,panel,floor,reduced}){
 let current=null,pulseUntil=0,pulseTimer;
 const notes=document.createElement('div');notes.id='arena-tempo';notes.hidden=true;notes.innerHTML=tempoNotesHTML();canvas.after(notes);
 function tempo(card){document.body.classList.toggle('reduce-effects',reduced());notes.hidden=!card?.tempo&&performance.now()>=pulseUntil;}
 function hide(){panel.hidden=true;notes.hidden=performance.now()>=pulseUntil;}
 function pulse(){pulseUntil=performance.now()+900;clearTimeout(pulseTimer);notes.hidden=false;pulseTimer=setTimeout(()=>{pulseUntil=0;notes.hidden=true;},900);}
 function show(game,id,target,point,preview,rect){
  const instance=cardById(game,id),card=cardDefinition(instance),actor=game.actors.find(a=>a.id===instance.actorId);
  const identity=[id,card.name,card.cost,card.tempo].join('|');
  if(current!==identity){const ghost=createDragFeedback({card,owner:actor.name,icon:{voice:'♫',guitar:'♬',drums:'◉'}[instance.instrument]||'♪',accent:actor.color});panel.replaceChildren(...ghost.childNodes);panel.className=ghost.className;panel.style.cssText='';panel.style.setProperty('--drag-accent',actor.color);panel._conquestKey=null;current=identity;panel._placement=null;}
  panel.hidden=false;tempo(card);
  const fan=game.fans.find(f=>f.id===target),outcome=arenaOutcome(game,card,fan,preview),scale=rect.width/1120;
  const pointer={x:rect.left+point.x*scale,y:rect.top+(floor+point.y)*scale};
  const zones=(preview.areas||[]).filter(a=>a.shape!=='line').map(a=>({cx:rect.left+a.center.x*scale,cy:rect.top+(floor+a.center.y)*scale,rx:(a.radius||card.radius||1)*game.room.radiusUnit*scale,ry:(a.radius||card.radius||1)*game.room.radiusUnit*scale}));
  if(card.radius&&!zones.length)zones.push({cx:pointer.x,cy:pointer.y,rx:card.radius*game.room.radiusUnit*scale,ry:card.radius*game.room.radiusUnit*scale});
  const lists=(preview.areas||[]).filter(a=>a.shape==='line');let list=panel.querySelector('.arena-push-list');if(!list){list=document.createElement('div');list.className='arena-push-list';panel.querySelector('.drag-release').before(list);}
  list.textContent=lists.map(a=>`Force ${a.strength} · deux vagues\n`+['left','right'].map(side=>(side==='left'?'← Gauche':'Droite →')+' : '+a.targets.filter(t=>(t.position.x<a.center.x?'left':'right')===side).map(t=>game.fans.find(f=>f.id===t.id)?.name).join(', ')).join('\n')).join('\n');list.hidden=!lists.length;
  showDragFeedback(panel,{outcome,pointer,target:fan?{left:rect.left+(fan.position.x-24)*scale,right:rect.left+(fan.position.x+24)*scale,top:rect.top+(floor+fan.position.y-30)*scale,bottom:rect.top+(floor+fan.position.y+34)*scale}:null,bounds:{left:12,top:12,right:innerWidth-12,bottom:document.querySelector('body>footer').getBoundingClientRect().top-12},zones});
 }
 return {show,hide,tempo,pulse};
}
