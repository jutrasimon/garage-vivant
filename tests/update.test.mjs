import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld,createGroup,decide,step,restore,liveSessions,relationship,compositionProject} from '../dist/engine.mjs';
import {groupRehearsal,command} from '../dist/life.mjs';
import {compositionTurns,songTurns} from '../dist/song-rules.mjs';
import {createBandLive,chooseSong,endTurn,restoreBandLive,totalTurns,powerAgainst,playCard} from '../dist/bandlive.mjs';
import {pendingActionsHTML} from '../dist/v7-view.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {resolveBandLiveConcert,beginBandLiveConcert,commitBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {completePerformance,skipShow,nextSlot} from '../dist/life.mjs';

function fixture(){
 const s=createWorld(42,3);for(const p of s.people){decide(s,p,'relax');p.action.route=[];p.actionRanges.relax={min:10000,max:10000};p.needs.energy=100;p.sleep.nextBedtime=1e12;}
 const g=createGroup(s,s.people.map(p=>p.id),{manual:true});g.nextAdoption=g.nextPractice=g.nextBookingAttempt=1e12;
 const template=restore(JSON.parse(readFileSync(new URL('v071-world.json',import.meta.url)))).songs[0];
 const song={...structuredClone(template),id:1,projectId:null,authors:[s.people[0].id],authorNames:{[s.people[0].id]:s.people[0].name},ownerGroupId:g.id,adoptedAt:s.time,groupId:g.id,turns:4};
 s.songs=[song];s.nextSongId=2;g.repertoire=[{songId:1,mastery:37,rehearsals:0,active:true}];return {s,g,song};
}
test('new worlds start with three people and reproducible directional acquaintances; restore never reseeds',()=>{
 const s=createWorld();assert.equal(s.people.length,3);assert(Object.values(s.rels).some(r=>r.affinity!==0));assert.notEqual(s.rels['p1>p2'].affinity,s.rels['p2>p1'].affinity);
 assert.deepEqual(s,createWorld());s.rels['p1>p2'].affinity=0;assert.deepEqual(restore(s),s);
 for(const seed of [1,2,3,2040]){const varied=createWorld(seed,8,{setup:'varied'});assert(varied.groups.some(g=>g.members.length>=3));assert.equal(createWorld(seed,8,{setup:'large'}).groups[0].members.length,6);assert(createWorld(seed,8,{setup:'medium'}).groups.every(g=>g.members.length>=3&&g.members.length<=4));}
});
test('practice sessions appear only for arrived participants and train people and collective cycles increase coordination',()=>{
 const {s,g,song}=fixture(),[a,b]=s.people,before=g.development;
 for(const p of [a,b]){decide(s,p,'practice',{groupId:g.id,songId:song.id});p.action.route=[];p.place=p.action.dest='g1';p.actionRanges.practice={min:100,max:100};}
 assert.equal(liveSessions(s)[0].label,'Pratique de '+g.name);
 b.action.route=[{x:1,y:1}];assert.equal(liveSessions(s).length,0);b.action.route=[];
 const skill=a.skills[a.action.instrument];step(s,5);assert(a.skills[a.action.instrument]>skill);assert.equal(g.development,before);assert.equal(g.repertoire[0].mastery,37);assert.equal(a.songMastery[1],undefined);assert.equal(song.turns,4);
 groupRehearsal(s,{groupId:g.id,songId:1,elapsed:15},[a,b]);assert.equal(g.repertoire[0].rehearsals,1);assert.equal(g.development,before+1);assert.deepEqual(restore(s),s);
});
test('composition length is fixed and better quality raises the probability of five turns',()=>{
 assert.equal(songTurns({}),3);assert.equal(songTurns({turns:4}),4);
 const counts=q=>Array.from({length:1000},(_,i)=>compositionTurns(q,()=>i/1000)).filter(n=>n===5).length;
 assert(counts(90)>counts(10));assert.equal(compositionTurns(100,()=>.99),3);
});
test('coauthor affinity contributes to final composition quality',()=>{
 const {s,g}=fixture(),[a,b]=s.people;
 decide(s,a,'write',{newProject:true,groupId:g.id});a.action.route=[];a.place=a.action.dest;
 const project=compositionProject(s,a);project.authors.push(b.id);project.authorNames[b.id]=b.name;project.contributions={[a.id]:100,[b.id]:100};project.work=project.target;
 a.action.cycleRemaining=1;a.actionRanges.write={min:1,max:1};
 relationship(s,a,b).affinity=relationship(s,b,a).affinity=80;
 const cold=structuredClone(s);cold.rels[`${a.id}>${b.id}`].affinity=cold.rels[`${b.id}>${a.id}`].affinity=-80;
 step(s);step(cold);assert.equal(s.songs[0].breakdown.affinity,8);assert.equal(cold.songs[0].breakdown.affinity,-8);assert(s.songs[0].quality>cold.songs[0].quality);
});
test('recomposition is an explicit multi-session project and replaces the same song only at completion',()=>{
 const {s,g,song}=fixture(),p=s.people[0],before=structuredClone(song),names=s.musicNames.length;
 assert(command(s,{type:'recompose',actorId:p.id,songId:1}).ok);assert.deepEqual(song,before);
 assert.equal(s.musicNames.length,names,'Recomposition reuses the title without consuming a new name');
 assert(!command(s,{type:'recompose',actorId:p.id,songId:1}).ok);
 const project=compositionProject(s,p);assert.equal(project.recompositionOf,1);p.action.route=[];p.place=p.action.dest;
 step(s,2);assert.deepEqual(song,before);assert.deepEqual(restore(s),s);
 project.work=project.target;p.action.cycleRemaining=1;p.actionRanges.write={min:1,max:1};step(s);
 assert.equal(s.songs.length,1);assert.equal(s.songs[0].id,1);assert.equal(song.ownerGroupId,g.id);assert.equal(song.revisions.length,1);assert.equal(song.revisions[0].quality,before.quality);assert([3,4,5].includes(song.turns));assert.deepEqual(restore(s),s);
});
test('BandLive supports mixed composition lengths and exact resumption while legacy games stay at six turns',()=>{
 const {s}=fixture();
 for(const turns of [[3,5],[4,4],[5,5]]){
  const game=createBandLive({people:s.people,songs:turns.map((n,i)=>({id:String(i),title:'Song '+i,style:'Indie',turns:n})),songOrder:['0','1']});
  for(const f of game.fans)f.hp=f.max=1000;
  assert.equal(totalTurns(game),turns[0]+turns[1]);let guard=0;
  while(!['won','lost'].includes(game.phase)&&guard++<20){if(game.phase==='choose')chooseSong(game,String(game.usedSongs.length));else endTurn(game);assert.deepEqual(restoreBandLive(game),game);}
  assert.equal(game.phase,'lost');assert.equal(game.turn,turns[0]+turns[1]);
 }
 const legacy=createBandLive({people:s.people,songs:[{id:'s',title:'Legacy',style:'Indie'}]});assert.equal(totalTurns(legacy),6);assert.deepEqual(restoreBandLive(legacy),legacy);
});
test('damage depends only on live rules; audience reactions and neighbourhood stats cannot alter it',()=>{
 const {s}=fixture(),game=createBandLive({people:s.people,songs:[{id:'s',title:'Song',style:'Indie'}]});chooseSong(game,'s');const card=game.cards.find(c=>c.kind==='note'),fan=game.fans[0];
 game.hand=[card.id];game.tempo=8;game.boost=5;const predicted=powerAgainst(game,card,fan),before=fan.hp;
 fan.reaction='trance';fan.receptivity=999;game.actors[0].skill=100;assert.equal(powerAgainst(game,card,fan),predicted);
 const untouched=game.fans.slice(1).map(f=>f.hp);assert(playCard(game,card.id,fan.id).ok);assert.equal(fan.hp,Math.max(0,before-predicted));assert.deepEqual(game.fans.slice(1).map(f=>f.hp),untouched);
});
test('pending practice invitations appear before the bag with actual band and expiry',()=>{
 const {s,g}=fixture();assert(command(s,{type:'rehearse',actorId:g.members[0],groupId:g.id,songId:1}).ok);
 const html=pendingActionsHTML(s,s.people[0]);assert(html.includes(g.name));assert(html.includes('Avant le prochain jeton'));assert(html.includes('expire'));assert(html.includes('data-group-select'));
});
test('a booked variable-length BandLive reports once and preserves its live snapshot on reload',()=>{
 const {world}=preparedConcert();world.songs[0].turns=5;world.songs[1].turns=4;assert(resolveBandLiveConcert(world).ready);const {game}=beginBandLiveConcert(world);
 for(const f of game.fans)f.hp=f.max=1000;
 while(!['won','lost'].includes(game.phase)){if(game.phase==='choose')chooseSong(game,(game.songOrder?game.songOrder[game.usedSongs.length]:game.songs.find(s=>!game.usedSongs.includes(s.id))?.id||game.songs[0].id));else endTurn(game);commitBandLiveConcert(world,completePerformance);assert.deepEqual(restore(world),world);}
 assert.equal(game.turn,9);assert.equal(world.showHistory.length,1);assert(!commitBandLiveConcert(world,completePerformance));
});
test('a following band can choose BandLive; a jam is blocked for its setlist, not its place in the evening',()=>{
 const {world}=preparedConcert({following:true}),booking=world.bookings.find(b=>b.groupId!==world.performance.groupId),group=world.groups.find(g=>g.id===booking.groupId);
 const song={...structuredClone(world.songs[0]),id:world.nextSongId++,ownerGroupId:group.id,groupId:group.id,authors:[group.members[0]],turns:4};world.songs.push(song);group.repertoire=[{songId:song.id,mastery:0,rehearsals:0,active:true}];booking.setlist=[song.id];booking.songId=song.id;
 skipShow(world);assert(nextSlot(world));assert.equal(world.performance.groupId,group.id);assert(resolveBandLiveConcert(world).ready);
 const jam=preparedConcert({following:true}).world;skipShow(jam);assert(nextSlot(jam));const plan=resolveBandLiveConcert(jam);assert(plan.ready);assert.equal(plan.songs[0].title,'Jam libre');assert.deepEqual(restore(jam),jam);
});

test('song quality categories derive from score without changing songs or fixed durations',async()=>{
 const {songQualityTier,songQualityHTML}=await import('../dist/song-rules.mjs');
 for(const [quality,label] of [[0,'Bancale'],[24.99,'Bancale'],[25,'Modeste'],[49.99,'Modeste'],[50,'Accrocheuse'],[79.99,'Accrocheuse'],[80,'Hit'],[100,'Hit']]){
 const song={quality,turns:3,hit:false},before=JSON.stringify(song);assert.equal(songQualityTier(song).label,label);assert(songQualityHTML(song).includes(label));assert.equal(JSON.stringify(song),before);
 }
});
