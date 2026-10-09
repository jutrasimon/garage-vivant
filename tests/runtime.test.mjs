import assert from 'node:assert/strict';
import {createPlayback,setPlaybackSpeed,advancePlayback,updatePositions} from '../dist/runtime.mjs';
function run(speed,seconds=10){const p=createPlayback();setPlaybackSpeed(p,speed);let minutes=0;for(let ms=0;ms<=seconds*1000;ms+=100)advancePlayback(p,ms,true,n=>minutes+=n);return minutes;}
assert.equal(run(0),0);assert.equal(run(.5),40);assert.equal(run(1),80);assert.equal(run(10),800);
const state=createPlayback();setPlaybackSpeed(state,.5);setPlaybackSpeed(state,0);assert.equal(state.resumeSpeed,.5);setPlaybackSpeed(state,state.resumeSpeed);assert.equal(state.speed,.5);
// Internal navigation never gates the clock. Hidden map positions stay synchronized with the current world.
const clock=createPlayback(),people=[{id:'p1',x:0,y:0}],positions=new Map();let visible=true;
for(let ms=0;ms<=4000;ms+=100){if(ms===1000)visible=false;advancePlayback(clock,ms,true,n=>people[0].x+=n);updatePositions(people,positions,{visible,dt:.1});}
assert.equal(people[0].x,32);assert.equal(positions.get('p1').x,32);updatePositions(people,positions,{visible:true,dt:.016});assert.equal(positions.get('p1').x,32,'No catch-up tween when returning');
const before=people[0].x;advancePlayback(clock,20000,false,n=>people[0].x+=n);advancePlayback(clock,20100,true,n=>people[0].x+=n);assert(people[0].x-before<=1,'No browser-tab catch-up burst');
console.log('Playback passed: 0, 0.5, 1, 10; remembered speed; hidden-map synchronization; no catch-up burst.');
