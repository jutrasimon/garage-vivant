import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore} from '../dist/engine.mjs';
import {completePerformance} from '../dist/life.mjs';
import {createBandLive,restoreBandLive} from '../dist/bandlive.mjs';
import {shortlistShowSongs,simulateBandLive} from '../dist/bandlive-auto.mjs';
import {beginBandLiveConcert,commitBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
test('shortlist keeps six longest, breaks ties by audience affinity, leaves small catalogues intact',()=>{
 const songs=Array.from({length:8},(_,i)=>({id:i,turns:i<3?3:5,style:i%2?'Jazz':'Punk'}));
 assert.deepEqual(shortlistShowSongs(songs,['Jazz','Jazz','Punk']).map(s=>s.id),[3,5,7,4,6,1]);
 assert.deepEqual(shortlistShowSongs(songs.slice(0,6),['Jazz']),songs.slice(0,6));
});
test('automatic show resolves all instruments and acquired cards deterministically with valid saves',()=>{
 const people=createWorld(9,8).people;
 for(const instrument of ['guitar','drums','bass','voice','keys','sax','trumpet','percussion']){
  const actors=people.slice(0,2).map((p,i)=>({...p,instrument:i?'drums':instrument,bandLiveDecks:{[i?'drums':instrument]:['new1','new2','special','note','note']}}));
  const game=createBandLive({people:actors,songs:[{id:'a',title:'A',style:'Punk',turns:5},{id:'b',title:'B',style:'Jazz',turns:3}],audienceSize:12,seed:31});const copy=structuredClone(game);
  let steps=0;simulateBandLive(game,()=>{steps++;restoreBandLive(game);});simulateBandLive(copy);
  assert.deepEqual(game,copy);assert(['won','lost'].includes(game.phase));assert(steps<150);assert(game.played>0);assert(game.turn<=8);
 }
});
test('real automatic show commits each passage, reward and result once; uses six-song shortlist',()=>{
 const {world}=preparedConcert();const group=world.groups.find(g=>g.id===world.performance.groupId),template=world.songs[0];
 for(let i=0;i<6;i++){const id=world.nextSongId++;world.songs.push({...structuredClone(template),id,title:'Extra '+i,turns:i<3?5:3});group.repertoire.push({songId:id,mastery:60,rehearsals:0,active:true});}
 assert(beginBandLiveConcert(world).ok);const game=world.performance.bandLive.game;assert.equal(game.songs.length,6);
 simulateBandLive(game,()=>commitBandLiveConcert(world,completePerformance));assert.equal(world.performance.status,'finished');assert.equal(world.performance.bandLive.reward,undefined);assert(world.showHistory[0].individualXp.length>0);assert.equal(world.performance.songResults.length,game.usedSongs.length);restore(world);const before=structuredClone(world);assert.equal(commitBandLiveConcert(world,completePerformance),false);assert.deepEqual(world,before);
});
