import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore} from '../dist/engine.mjs';
import {completePerformance} from '../dist/life.mjs';
import {createBandLive,availableSongs,chooseSong,playCard,endTurn,canPlay,restoreBandLive,previewCard} from '../dist/bandlive.mjs';
import {INSTRUMENTS,starterDeck,musicianDeck,changeBandLiveInstrument,specialChoices,definitionFor} from '../dist/bandlive-cards.mjs';
import {beginBandLiveConcert,commitBandLiveConcert,exchangeBandLiveCard,skipBandLiveExchange,createConcertReplay} from '../dist/bandlive-concert.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
function fixture(instrument='guitar',kind='new1'){
 const people=createWorld(41,4).people.slice(0,2);people[0].instrument=instrument;people[0].bandLiveDecks={[instrument]:[kind,'note','note','special','special']};
 const g=createBandLive({rulesVersion:1,persistentReactions:false,people,songs:[{id:'a',title:'A',style:'Punk'}],audienceSize:12,seed:7,audienceRules:{styles:['Jazz','Punk'],resistancePercent:100}});chooseSong(g,'a');
 g.fans.forEach(f=>{f.hp=f.max=100;f.favorite='Jazz';f.intent='solo';});
 return {g,id:g.cards[0].id};
}
function give(g,id){for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(x=>x!==id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(id);g.energy=3;}
function use(g,id,target='f0',opts={}){give(g,id);const copy=structuredClone(g),preview=previewCard(g,id,target,opts),r=playCard(g,id,target,opts);assert(r.ok,r.message);assert.deepEqual(g,preview.game);assert.notDeepEqual(g,copy);assert.deepEqual(restoreBandLive(g),g);return r;}
function finish(world){const g=world.performance.bandLive.game;while(!['won','lost'].includes(g.phase)){if(g.phase==='choose')chooseSong(g,availableSongs(g)[0].id);else endTurn(g);commitBandLiveConcert(world,completePerformance);}return g;}
test('each instrument keeps five starter cards and exactly three special choices',()=>{
 for(const instrument of Object.keys(INSTRUMENTS)){const p=createWorld(2,2).people[0];p.instrument=instrument;assert.deepEqual(musicianDeck(p),starterDeck());assert.equal(specialChoices(instrument).length,3);assert(specialChoices(instrument).every(c=>c.name&&c.description));}
});
test('instrument changes retain independent personal decks and export/import preserves all of them',()=>{
 const w=createWorld(2,2),p=w.people[0];p.instrument='guitar';changeBandLiveInstrument(p,'keys');p.bandLiveDecks.keys[0]='new2';changeBandLiveInstrument(p,'guitar');p.bandLiveDecks.guitar[1]='new1';changeBandLiveInstrument(p,'keys');assert.deepEqual(musicianDeck(p),['new2','note','note','special','special']);assert.equal(p.bandLiveDecks.guitar[1],'new1');assert.deepEqual(restore(JSON.parse(JSON.stringify(w))),w);assert.equal(w.people[1].bandLiveDecks,undefined);
 const bad=structuredClone(w);bad.people[0].bandLiveDecks.keys=['unknown'];assert.throws(()=>restore(bad));
});
test('new shows bring only the active instrument deck and replays retain the original snapshot',()=>{
 const {world}=preparedConcert();world.people[0].bandLiveDecks={guitar:['new1','new2','note','special','special'],keys:['new2','new2','note','special','special']};const {game}=beginBandLiveConcert(world,{rulesVersion:1});assert.deepEqual(game.cards.filter(c=>c.actorId===world.people[0].id).map(c=>c.kind),world.people[0].bandLiveDecks.guitar);world.people[0].bandLiveDecks.guitar[0]='special';const replay=createConcertReplay(game);assert.equal(replay.cards.find(c=>c.actorId===world.people[0].id).kind,'new1');assert.deepEqual(restoreBandLive(game),game);
});
test('tempo thresholds amplify guitar and voice without spending, and sax draws only above its threshold',()=>{
 for(const [instrument,low,high] of [['guitar',5,8],['voice',3,5]]){const {g,id}=fixture(instrument);assert.equal(use(g,id).event.hits[0].power,low);g.tempo=4;assert.equal(use(g,id).event.hits[0].power,high);assert.equal(g.tempo,4);}
 const {g,id}=fixture('sax');g.tempo=3;give(g,id);const n=g.hand.length;assert.equal(use(g,id).event.hits[0].power,5);assert.equal(g.hand.length,n);assert.equal(g.tempo,3);
 g.tempo=2;give(g,id);const before=g.hand.length;use(g,id);assert.equal(g.hand.length,before-1);
});
test('all four consuming cards spend a bounded amount once across their targets',()=>{
 for(const [instrument,power,left,count] of [['guitar',16,2,1],['voice',6,3,12],['keys',5,4,4],['sax',7,2,2]]){
  const {g,id}=fixture(instrument,'new2');g.tempo=6;const r=use(g,id,'f0',instrument==='sax'?{secondTargetId:'f5'}:{});assert.equal(r.event.hits.length,count);assert(r.event.hits.every(h=>h.power===power));assert.equal(g.tempo,left);
 }
 const {g,id}=fixture('sax','new2');give(g,id);const before=structuredClone(g);assert(!playCard(g,id,'f0',{secondTargetId:'f0'}).ok);assert.deepEqual(g,before);
});
test('reliable preparation draws and gains tempo, with a hard cap of ten',()=>{
 for(const [instrument,amount] of [['drums',3],['keys',2]]){const {g,id}=fixture(instrument);give(g,id);const n=g.hand.length;use(g,id);assert.equal(g.tempo,amount);assert.equal(g.hand.length,n);g.tempo=9;use(g,id);assert.equal(g.tempo,10);}
 const {g,id}=fixture('drums','new2');assert.equal(use(g,id).event.hits[0].power,3);assert.equal(g.tempo,2);
});
test('bass protects a row and trumpet changes its style through the end of the turn',()=>{
 const bass=fixture('bass');bass.g.fans.forEach(f=>{f.hp=50;f.intent='bored';});use(bass.g,bass.id,'f4');assert.equal(bass.g.tempo,2);endTurn(bass.g);assert.deepEqual(bass.g.fans.slice(4,8).map(f=>f.hp),[50,50,50,50]);assert.equal(bass.g.fans[0].hp,53);assert(bass.g.fans.every(f=>!f.noBoredom));
 const horn=fixture('trumpet','new2');use(horn.g,horn.id,'f4');assert.equal(horn.g.tempo,2);assert.equal(horn.g.fans.filter(f=>f.turnStyle==='Punk').length,4);endTurn(horn.g);assert(horn.g.fans.every(f=>!f.turnStyle));
});
test('relay ignores its own musician, stacks, applies once to each target, then expires',()=>{
 const {g,id}=fixture('bass','new2');use(g,id);use(g,id);assert.equal(g.relayBoosts.length,2);
 const same=g.cards.find(c=>c.actorId===g.cards[0].actorId&&c.kind==='note');assert.equal(use(g,same.id).event.hits[0].power,6);assert.equal(g.relayBoosts.length,2);
 const other=g.cards.find(c=>c.actorId!==same.actorId&&c.kind==='note');assert.equal(use(g,other.id).event.hits[0].power,14);assert.equal(g.relayBoosts.length,0);use(g,id);endTurn(g);assert.equal(g.relayBoosts.length,0);
});
test('trumpet checks already conquered neighbours and percussion rewards direct conquests only',()=>{
 const horn=fixture('trumpet');assert.equal(use(horn.g,horn.id).event.hits[0].power,4);assert.equal(horn.g.tempo,1);horn.g.fans[1].hp=0;horn.g.fans[1].conquered=true;use(horn.g,horn.id);assert.equal(horn.g.tempo,4);
 const {g,id}=fixture('percussion','new2');g.fans[0].hp=4;g.fans[0].effect='shock';g.fans[1].hp=3;g.fans[1].effect='wave';use(g,id);assert.equal(g.tempo,3);assert(g.fans[1].conquered);
});
test('percussion alternation requires another musician immediately before it in this turn',()=>{
 const {g,id}=fixture('percussion');use(g,id);assert.equal(g.tempo,2);const other=g.cards.find(c=>c.actorId!==g.cards[0].actorId&&c.kind==='note');use(g,other.id,'f8');use(g,id);assert.equal(g.tempo,6);endTurn(g);use(g,id);assert.equal(g.tempo,8);
});
test('a completed losing show offers exactly one exchange across reload, preserving deck size and replay',()=>{
 const {world}=preparedConcert();beginBandLiveConcert(world,{rulesVersion:1});assert(!exchangeBandLiveCard(world,{actorId:world.people[0].id,slot:0,kind:'new1'}).ok);const g=finish(world),w=restore(JSON.parse(JSON.stringify(world))),actor=g.actors[0],before=structuredClone(g);assert.equal(w.performance.bandLive.reward.status,'pending');assert(exchangeBandLiveCard(w,{actorId:actor.id,slot:0,kind:'new1'}).ok);assert.equal(musicianDeck(w.people.find(p=>p.id===actor.id),actor.instrument)[0],'new1');assert.equal(w.performance.bandLive.game.cards[0].kind,'note');assert.deepEqual(w.performance.bandLive.game,before);assert.equal(w.showHistory[0].bandLiveReward.status,'claimed');assert.deepEqual(restore(w),w);assert(!exchangeBandLiveCard(w,{actorId:actor.id,slot:1,kind:'new2'}).ok);assert(!skipBandLiveExchange(w));assert.equal(createConcertReplay(w.performance.bandLive.game).cards[0].kind,'note');
});
test('exchange uses the played instrument even after a change, rejects outsiders and can be skipped',()=>{
 const {world}=preparedConcert();const {game}=beginBandLiveConcert(world,{rulesVersion:1});finish(world);const actor=game.actors[0],p=world.people.find(p=>p.id===actor.id);changeBandLiveInstrument(p,'keys');assert(!exchangeBandLiveCard(world,{actorId:world.people.at(-1).id,slot:0,kind:'new1'}).ok);assert(exchangeBandLiveCard(world,{actorId:p.id,slot:0,kind:'new2'}).ok);assert.equal(p.bandLiveDecks[actor.instrument][0],'new2');assert.deepEqual(p.bandLiveDecks.keys,starterDeck());
 const other=preparedConcert().world;beginBandLiveConcert(other,{rulesVersion:1});finish(other);assert(skipBandLiveExchange(other));assert(!exchangeBandLiveCard(other,{actorId:other.people[0].id,slot:0,kind:'new1'}).ok);restore(other);
});

test('boredom prevention also lasts through the finale and a won show grants one exchange',()=>{
 const {g,id}=fixture('bass','new1');endTurn(g);endTurn(g);g.fans.forEach(f=>{f.hp=50;f.intent='bored';});use(g,id,'f4');endTurn(g);assert.equal(g.phase,'choose');assert.equal(g.fans[4].hp,47);assert.equal(g.fans[0].hp,50);assert(g.fans.every(f=>!f.noBoredom));restoreBandLive(g);
 const {world}=preparedConcert();const {game}=beginBandLiveConcert(world,{rulesVersion:1});chooseSong(game,'song-1');game.fans.forEach(f=>f.hp=1);const card=game.cards.find(c=>c.instrument==='sax'&&c.kind==='special');give(game,card.id);game.tempo=4;playCard(game,card.id,'audience');assert.equal(game.phase,'won');commitBandLiveConcert(world,completePerformance);const a=game.actors[0];assert(exchangeBandLiveCard(world,{actorId:a.id,slot:0,kind:'new1'}).ok);assert(!exchangeBandLiveCard(world,{actorId:a.id,slot:1,kind:'new2'}).ok);restore(world);
});
