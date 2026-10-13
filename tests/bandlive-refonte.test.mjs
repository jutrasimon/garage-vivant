import {xpProgress,grantXp,levelThreshold} from '../dist/progression.mjs';
import {claimLevelReward,showLevelRewards} from '../dist/level-rewards.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore,decide,step} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,previewCard,endTurn,restoreBandLive,conquestTargets} from '../dist/bandlive.mjs';
import {beginBandLiveConcert,commitBandLiveConcert,createConcertReplay} from '../dist/bandlive-concert.mjs';
import {completePerformance,groupRehearsal,skipShow,nextSlot} from '../dist/life.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
function fixture(){const w=createWorld(55,3);w.people[0].instrument='drums';const g=createBandLive({people:w.people,songs:[{id:'a',title:'A',style:'Punk'}],seed:18,audienceSize:8,audienceRules:{styles:['Punk','Jazz'],resistancePercent:100}});chooseSong(g,'a');g.fans.forEach(f=>{f.hp=f.max=100;f.favorite='Punk';f.effect='spotlight';f.effectValue=1;f.intent='bored';});return g;}
function give(g,c){for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(id=>id!==c.id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(c.id);g.energy=3;}
function play(g,c,target='f0'){give(g,c);const before=structuredClone(g),preview=previewCard(g,c.id,target);assert.deepEqual(g,before);const result=playCard(g,c.id,target);assert(result.ok,result.message);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);return result;}
const note=g=>g.cards.find(c=>c.kind==='note');
test('new shows have three parameterized effects; chorus selects at most two orthogonal neighbors',()=>{
 const g=fixture();assert.equal(g.conquestVersion,2);assert.equal(g.reactionVersion,2);
 const sample=createBandLive({people:createWorld(2,3).people,songs:g.songs,audienceSize:12});assert(sample.fans.every(f=>['shock','spotlight','chorus'].includes(f.effect)));assert(sample.fans.every(f=>Number.isInteger(f.effectValue)));
 g.fans[3].effect='chorus';g.fans[3].effectValue=2;g.fans.forEach(f=>f.favorite='Jazz');assert.deepEqual(conquestTargets(g,g.fans[3]).map(f=>f.id),['f2','f7']);g.fans[2].favorite='Punk';assert.deepEqual(conquestTargets(g,g.fans[3]).map(f=>f.id),['f7']);
});
test('attention and distraction disappear after one power card and renew only next turn',()=>{
 for(const [intent,power] of [['attentive',11],['distracted',5]]){const g=fixture(),f=g.fans[0];f.intent=intent;assert.equal(play(g,note(g)).event.hits[0].power,power);assert(f.reactionUsed);assert.equal(f.intent,intent);assert.equal(play(g,note(g)).event.hits[0].power,8);endTurn(g);assert.notEqual(f.intent,intent);assert.equal(f.reactionUsed,false);}
});
test('actual tempo grants immediate rhythm conquest once, including after consuming tempo',()=>{
 const g=fixture(),f=g.fans[0];f.intent='rhythm';const pulse=g.cards.find(c=>c.instrument==='drums'&&c.kind==='special');g.tempo=9;play(g,pulse);assert.equal(f.hp,100);assert.equal(f.reactionTempo,1);endTurn(g);g.tempo=0;play(g,pulse);assert.equal(f.hp,97);assert(f.reactionUsed);g.tempo=0;play(g,pulse);assert.equal(f.hp,97);assert.equal(g.events.filter(e=>e.type==='reaction'&&e.fanId===f.id).length,1);
});
test('following triggers immediately and propagates a once-only conquest chain',()=>{
 const g=fixture();g.fans[0].hp=1;g.fans[1].hp=3;g.fans[1].intent='following';g.fans[2].hp=3;g.fans[2].intent='following';g.fans[3].hp=50;g.fans[3].intent='following';
 const r=play(g,note(g));assert.equal(g.fans[1].hp,0);assert.equal(g.fans[2].hp,0);assert.equal(g.fans[3].hp,47);assert.equal(r.effects.filter(e=>e.type==='reaction').length,3);assert(g.fans[3].reactionUsed);
 play(g,note(g),'f4');assert.equal(g.fans[3].hp,47);
});
test('shock value, spotlight sensitivity and chorus duration use their actual parameters',()=>{
 const g=fixture();g.fans[0].effect='shock';g.fans[0].effectValue=5;g.fans[0].hp=1;play(g,note(g));assert.equal(g.fans[1].hp,95);assert.equal(g.fans[4].hp,95);
 const h=fixture();h.fans[0].effectValue=3;h.fans[0].hp=1;play(h,note(h));assert.equal(h.fans[1].spotlight,3);assert.equal(play(h,note(h),'f1').event.hits[0].power,11);endTurn(h);assert.equal(h.fans[1].spotlight,undefined);
 const j=fixture();j.fans[0].effect='chorus';j.fans[0].effectValue=1;j.fans[0].hp=1;j.fans.forEach(f=>f.favorite='Jazz');play(j,note(j));assert.equal(j.fans[1].chorusStyle,'Punk');assert.equal(j.fans[4].chorusStyle,undefined);endTurn(j);assert.equal(j.fans[1].chorusStyle,'Punk');
});
test('initial songs and musicians vary by seed and reload without rerolling',()=>{
 const names=new Set();for(let seed=1;seed<12;seed++){const w=createWorld(seed,12,{setup:'varied'});names.add(w.people.map(p=>p.name).join('|'));assert.equal(new Set(w.people.map(p=>p.name)).size,12);assert(w.songs.length===(w.groups.length===1?2:3)||w.groups.length>1&&w.songs.length===4);assert(w.groups.every(g=>g.repertoire.length));assert.deepEqual(restore(w),w);assert.deepEqual(w,createWorld(seed,12,{setup:'varied'}));}assert(names.size>1);
});
test('real collective practice adds coordination; shows grant equal participant XP once',()=>{
 const w=createWorld(30,4,{setup:'large'}),g=w.groups[0],before=g.development,req={groupId:g.id,songId:g.repertoire[0].songId,elapsed:15};groupRehearsal(w,req,[w.people[0]]);assert.equal(g.development,before);groupRehearsal(w,req,w.people);assert.equal(g.development,before+1);
 const {world}=preparedConcert();const xpBefore=world.people.map(p=>p.xp||0);beginBandLiveConcert(world);const game=world.performance.bandLive.game;while(!['won','lost'].includes(game.phase)){if(game.phase==='choose')chooseSong(game,game.songs[0].id===game.usedSongs[0]?game.songs.at(-1).id:game.songs[0].id);else endTurn(game);}assert(commitBandLiveConcert(world,completePerformance));const gains=world.showHistory[0].individualXp;assert.equal(gains.length,game.actors.length);assert.equal(new Set(gains.map(x=>x.gain)).size,1);assert(world.people.every((p,i)=>game.actors.some(a=>a.id===p.id)||(p.xp||0)===xpBefore[i]));const saved=restore(world);assert.equal(commitBandLiveConcert(saved,completePerformance),false);assert.deepEqual(saved,world);assert.equal(createConcertReplay(game).reactionVersion,2);
});

test('solo practice earns XP only while playing and early levels come sooner',()=>{
 const w=createWorld(6,1),p=w.people[0];decide(w,p,'practice');p.sleep.nextBedtime=1e12;p.needs.energy=100;p.actionRanges.practice={min:1000,max:1000};
 const before=p.xp||0;step(w,1);assert.equal(p.xp||0,before,'Travelling does not earn XP');p.action.route=[];p.place=p.action.dest;
 step(w,40);assert.equal(p.xp,2);assert.equal(p.practiceXpMinutes,10);assert.equal(xpProgress(p).level,1);assert(levelThreshold(3)-levelThreshold(2)>levelThreshold(2)-levelThreshold(1));const saved=restore(w);assert.deepEqual(saved,w);
 step(w,5);step(saved,5);assert.equal(p.xp,3);assert.equal(p.practiceXpMinutes,0);assert.deepEqual(saved,w,'Partial practice XP survives reloading');
 const b={id:'x',name:'X'};grantXp(b,180);assert.equal(xpProgress(b).level,3);
});

test('level rewards replace per-show exchanges and persist until claimed once',()=>{
 const w=createWorld(31,2),p=w.people[0];grantXp(p,180);assert.equal(p.levelRewards.length,2);
 const saved=restore(w);assert.deepEqual(saved,w);
 const reward=saved.people[0].levelRewards[0],before=structuredClone(saved.people[0]);
 saved.performance={status:'playing'};assert(!claimLevelReward(saved,{actorId:p.id,level:reward.level,slot:0,kind:'new1'}).ok);assert.deepEqual(saved.people[0],before);saved.performance=null;
 assert(claimLevelReward(saved,{actorId:p.id,level:reward.level,slot:0,kind:'new1'}).ok);
 assert.equal(saved.people[0].bandLiveDecks[reward.instrument].length,5);assert(!claimLevelReward(saved,{actorId:p.id,level:reward.level,slot:1,kind:'new2'}).ok);assert.deepEqual(restore(saved),saved);
 const game=createBandLive({people:saved.people,songs:[{id:'a',title:'A',style:'Punk'}],seed:1});assert(game.cards.some(c=>c.actorId===p.id&&c.kind==='new1'),'The upgraded card is present in the next show');
 const {world}=preparedConcert();beginBandLiveConcert(world);assert.equal(world.performance.bandLive.reward,undefined);
});

test('classic skip controls cannot bypass an active BandLive opening act',()=>{
 const {world}=preparedConcert({following:true});beginBandLiveConcert(world);const before=structuredClone(world);
 skipShow(world,true);assert.equal(nextSlot(world),false);assert.deepEqual(world,before);
});

test('the post-show menu offers only levels gained in that show; practice rewards stay on the musician',()=>{
 const world=createWorld(41,2),person=world.people[0];grantXp(person,170);const gain=grantXp(person,30),show={id:'show-xp'};world.showHistory=[{id:show.id,individualXp:[gain]}];
 const before=structuredClone(world);assert.deepEqual(showLevelRewards(world,show)[0].levelRewards.map(r=>r.level),[3]);assert.deepEqual(world,before);
 assert(claimLevelReward(world,{actorId:person.id,level:3,slot:0,kind:'new1'}).ok);assert.equal(showLevelRewards(world,show).length,0);assert.equal(person.levelRewards.find(r=>r.level===2).status,'pending');
});

test('early trial saves keep earned levels, rewards and proportional progress on the new curve',()=>{
 const world=createWorld(42,2),person=world.people[0];person.xp=164;person.levelRewards=[2,3].map(level=>({level,instrument:person.instrument,status:'pending'}));
 const updated=restore(world),p=updated.people[0];assert.equal(xpProgress(p).level,3);assert.equal(p.xp,246);assert.deepEqual(p.levelRewards,person.levelRewards);assert.equal(p.xpCurve,2);assert.deepEqual(restore(updated),updated);
 assert.deepEqual([2,3,4,5,6].map(levelThreshold),[80,180,360,650,1100]);assert(levelThreshold(7)-levelThreshold(6)>levelThreshold(6)-levelThreshold(5));
 world.people[0].xp=Number.MAX_SAFE_INTEGER;assert.throws(()=>restore(world),/XP individuelle invalide/);
});
