import assert from 'node:assert/strict';
import {createWorld,createGroup} from '../dist/engine.mjs';
import {createPerformance,advancePerformance,validatePerformance} from '../dist/stage.mjs';
import {createShowClock,advanceShowClock,songSeconds,musicalTick,stageGeometry,stagePoint,showBeat,actorPosition,actorSize} from '../dist/show-playback.mjs';
import {showOverlayHTML,deckInspectionHTML} from '../dist/show-view.mjs';
const clone=structuredClone;
for(const n of [2,3,4,8,24])for(const totalTicks of [2160,3600]){
  const world=createWorld(44,n),group=createGroup(world,world.people.map(p=>p.id),{manual:true});
  const show=createPerformance({id:`show-${n}`,seed:902,people:world.people,group,song:{id:1,title:'Test',genre:'Indie',quality:70,intensity:50,emotion:'joy'},opportunity:{id:'o',name:'Scène',styles:['Indie'],crowd:12},totalTicks});
  const instant=clone(show);advancePerformance(instant,totalTicks);
  for(const [dt,speed] of [[1/60,1],[.2,1],[.07,4]]){
    const watched=clone(show),clock=createShowClock(watched);let elapsed=0;
    while(watched.status==='playing'&&elapsed<31/speed){advancePerformance(watched,advanceShowClock(clock,watched,dt,speed));elapsed+=dt;}
    assert.equal(watched.status,'finished');assert(Math.abs(elapsed-30/speed)<=dt+.001);
    assert.deepEqual(watched.result,instant.result);assert.deepEqual(watched.events,instant.events);validatePerformance(watched);
  }
  const halfway=clone(show),clock=createShowClock(halfway);advancePerformance(halfway,advanceShowClock(clock,halfway,12.7));
  const reloaded=clone(halfway),resumed=createShowClock(reloaded);assert(Math.abs(resumed.seconds-12.7)<.1);
  advancePerformance(reloaded,advanceShowClock(resumed,reloaded,30));assert.deepEqual(reloaded.result,instant.result);
  for(const actor of show.actors)assert.equal(new Set(actor.hand).size,5);
  for(const cue of show.cues)assert(Math.abs(musicalTick(show,songSeconds(show,cue.tick))-cue.tick)<.0001);
  const inspection=deckInspectionHTML(show,show.actors[0].id);assert(inspection.includes('sans remise'));assert(!inspection.includes('À venir :'));
  assert(showOverlayHTML(show,{ready:true}).includes('id="start-show"'));
}
// Canvas drawing and pointer hit testing share the same uniform letterbox transform.
const canvas={clientWidth:1200,clientHeight:400,getBoundingClientRect:()=>({left:10,top:20})};
const geometry=stageGeometry(canvas);assert.equal(geometry.scale,400/650);assert.equal(geometry.oy,0);
const point=stagePoint(canvas,10+geometry.ox+450*geometry.scale,20+325*geometry.scale);assert(Math.abs(point.x-450)<.001);assert(Math.abs(point.y-325)<.001);
console.log('Show presentation passed: 30 seconds, 2–24 musicians, legacy clocks, same events/results at every speed, resume, hidden future cards and uniform canvas hit testing.');

// Real engine ticks stay unchanged, but reveal ends before aim, flight and contact.
const world=createWorld(205,8),group=createGroup(world,world.people.slice(0,4).map(p=>p.id),{manual:true});
const initial=createPerformance({id:'sequence',seed:902,people:world.people.slice(0,4),group,song:{id:1,title:'Test',genre:'Indie',quality:70,intensity:50,emotion:'joy'},opportunity:{id:'o',name:'Scène',styles:['Indie'],crowd:12},totalTicks:3600});
const reveal=clone(initial);advancePerformance(reveal,initial.cues[0].tick);const beat=showBeat(reveal);
assert(beat.revealSeconds>.5,'A quartet card has time to register');
const phases=[['reveal',songSeconds(reveal)+beat.revealSeconds*.5],['aim',(beat.aimAt+beat.shotAt)/2],['shot',(beat.shotAt+beat.hit)/2],['impact',beat.hit+.06]];
for(const [phase,seconds] of phases){
  const state=clone(initial);advancePerformance(state,Math.ceil(musicalTick(state,seconds)));const action=showBeat(state),html=showOverlayHTML(state);
  assert.equal(action.phase,phase);assert.equal(html.includes('class="hero-card'),phase==='reveal');assert(!html.includes('discard-stack'));
  if(phase==='shot')assert(action.shotProgress>0&&action.shotProgress<1);
  if(['aim','shot'].includes(phase)){assert(action.target.y>220);assert.equal(state.events.some(e=>e.type==='impact'),false,'The crowd cannot react before contact');}
  const pos=actorPosition(state,state.actors.findIndex(a=>a.id===action.event.actorId));
  assert.equal(action.origin.x,pos.x);assert.equal(action.origin.y,pos.y-actorSize(state,{width:900,scale:1},pos)/2);
}
console.log('Show sequence passed: brief fixed card, no discard pile, card gone before musician aim/shot, crowd changes at contact.');
