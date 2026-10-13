import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld,createGroup,restore} from '../dist/engine.mjs';
import {RULES,SPECIALS,createBandLive,restoreBandLive,chooseSong,cardById,canPlay,playCard,endTurn} from '../dist/bandlive.mjs';
import {resolveBandLivePlan,createBandLiveFromWorld} from '../dist/bandlive-roster.mjs';

const songs=[{id:'punk',title:'Rébellion nocturne',style:'Punk'},{id:'pop',title:'Sous les néons',style:'Pop'}];
function game(instruments=['guitar','drums','bass','sax'],audienceSize=RULES.minAudience){
  const world=createWorld(205,8),people=instruments.map((instrument,i)=>({...world.people[i],instrument}));
  const result=createBandLive({persistentReactions:false,people,songs,seed:12,audienceSize});chooseSong(result,'punk');return result;
}
function putInHand(g,actor,kind='special'){
  const card=g.cards.find(c=>c.actorId===g.actors[actor].id&&c.kind===kind);
  for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(id=>id!==card.id);
  while(g.hand.length>=5)g.deck.push(g.hand.pop());
  g.hand.push(card.id);return card.id;
}
function play(g,actor,target='f0',kind='special'){const id=putInHand(g,actor,kind);const result=playCard(g,id,target);assert(result.ok,result.message);return result.event;}

test('the eight approved specialties and equal five-card contributions',()=>{
  assert.deepEqual(Object.entries(SPECIALS).map(([i,c])=>[i,c.cost,c.power??null,c.tempo??0,c.boost??0,!!c.useTempo]),[
    ['guitar',2,8,0,0,true],['drums',1,null,4,0,false],['bass',0,null,1,3,false],['voice',2,5,0,0,false],['keys',1,2,2,0,false],['sax',2,0,0,0,true],['trumpet',0,null,2,0,false],['percussion',1,null,1,5,false],
  ]);
  for(const instruments of [Object.keys(SPECIALS).slice(0,6),Object.keys(SPECIALS).slice(6)]){
    const g=game(instruments);assert.equal(g.cards.length,instruments.length*5);
    for(const actor of g.actors){const cards=g.cards.filter(c=>c.actorId===actor.id);assert.equal(cards.filter(c=>c.kind==='note').length,3);assert.equal(cards.filter(c=>c.kind==='special').length,2);}
    assert.equal(g.hand.length,5);assert.equal(g.energy,3);
  }
});
test('Solo consumes all tempo and the power bonus, and respects the spectator intention',()=>{
  const g=game();g.tempo=4;g.boost=3;g.fans[0].intent='solo';
  const event=play(g,0);assert.equal(event.hits[0].power,8+4+3+2+3);assert.equal(g.fans[0].hp,4);assert.equal(g.tempo,0);assert.equal(g.boost,0);assert.equal(g.energy,1);
});
test('Saxophone consumes tempo once, applying its full amount to every remaining spectator',()=>{
  const g=game();g.tempo=7;g.boost=3;
  const event=play(g,3,'audience');assert.deepEqual(event.hits.map(h=>h.power),[12,10,10]);assert.deepEqual(g.fans.map(f=>f.hp),[12,10,15]);assert.equal(g.tempo,0);assert.equal(g.boost,0);assert.equal(g.energy,1);
});
test('zero-tempo Improvisation is a power card and consumes the next-card bonus',()=>{
  const g=game();g.boost=3;
  const event=play(g,3,'audience');assert.deepEqual(event.hits.map(h=>h.power),[5,3,3]);assert.equal(g.boost,0);assert.equal(g.tempo,0);
});
test('free cards are playable at zero energy, preserve the pending bonus and cap tempo at ten',()=>{
  const g=game(['bass','trumpet','drums','percussion']);g.energy=0;g.tempo=9;g.boost=5;
  assert(canPlay(g,putInHand(g,0)));play(g,0,'audience');assert.equal(g.tempo,10);assert.equal(g.boost,8);assert.equal(g.energy,0);
  play(g,1,'audience');assert.equal(g.tempo,10);assert.equal(g.boost,8);assert.equal(g.energy,0);
  assert(!canPlay(g,putInHand(g,2)));assert(!canPlay(g,putInHand(g,3)));
});
test('Pulsation, Accord, Refrain and Roulement apply the approved values',()=>{
  const g=game(['drums','keys','voice','percussion']);
  play(g,0,'audience');assert.equal(g.tempo,4);assert.equal(g.energy,2);
  play(g,1,'audience');assert.equal(g.tempo,6);assert.deepEqual(g.fans.map(f=>f.hp),[20,18,23]);
  g.energy=3;g.boost=3;const refrain=play(g,2,'audience');assert.deepEqual(refrain.hits.map(h=>h.power),[10,8,8]);assert.equal(g.boost,0);
  play(g,3,'audience');assert.equal(g.tempo,7);assert.equal(g.boost,5);assert.equal(g.energy,0);
});
test('invalid targets and unaffordable cards leave every part of the game unchanged',()=>{
  const g=game(),note=putInHand(g,0,'note'),before=structuredClone(g);
  assert(!playCard(g,note,'audience').ok);assert.deepEqual(g,before);
  g.fans[0].hp=0;g.fans[0].conquered=true;const conquered=structuredClone(g);assert(!playCard(g,note,'f0').ok);assert.deepEqual(g,conquered);
  g.energy=0;const empty=structuredClone(g);assert(!playCard(g,note,'f1').ok);assert.deepEqual(g,empty);
});
test('discard, refill, energy reset, bonus expiry and song transition preserve ENCORE rules',()=>{
  const g=game();g.boost=5;g.energy=0;g.tempo=8;const hand=[...g.hand];
  endTurn(g);assert.equal(g.turn,2);assert.equal(g.hand.length,5);assert(hand.every(id=>g.discard.includes(id)));assert.equal(g.energy,3);assert.equal(g.boost,0);assert.equal(g.tempo,8);
  endTurn(g);endTurn(g);assert.equal(g.phase,'choose');assert.equal(g.turn,3);assert.equal(g.hand.length,0);assert(!chooseSong(g,'punk').ok);assert(chooseSong(g,'pop').ok);assert.equal(g.turn,4);assert.equal(g.tempo,6);assert.equal(g.hand.length,5);
  while(g.phase==='play')endTurn(g);assert.equal(g.phase,'lost');assert.equal(g.turn,6);assert.equal(g.hand.length,0);
  const piles=[...g.deck,...g.hand,...g.discard];assert.equal(piles.length,g.cards.length);assert.equal(new Set(piles).size,g.cards.length);
});
test('a finale can win, conquered spectators do not recover from boredom',()=>{
  const g=game();endTurn(g);endTurn(g);for(const fan of g.fans){fan.hp=3;fan.intent='bored';}
  endTurn(g);assert.equal(g.phase,'won');assert(g.fans.every(f=>f.hp===0&&f.conquered));assert(!endTurn(g).ok);
});
test('JSON resume is deterministic and rejects duplicate cards or illegal resource values',()=>{
  const g=game();play(g,2,'audience');const restored=restoreBandLive(JSON.parse(JSON.stringify(g)));assert.deepEqual(restored,g);
  endTurn(g);endTurn(restored);assert.deepEqual(restored,g);
  const duplicate=structuredClone(g);duplicate.deck[0]=duplicate.hand[0];assert.throws(()=>restoreBandLive(duplicate));
  const bad=structuredClone(g);bad.tempo=RULES.tempoMax+1;assert.throws(()=>restoreBandLive(bad));
  const badActor=structuredClone(g);badActor.actors[0].personality=null;assert.throws(()=>restoreBandLive(badActor));
  const badTurn=structuredClone(g);badTurn.turn=6;badTurn.phase='choose';assert.throws(()=>restoreBandLive(badTurn));
});
test('BandLive snapshots do not mutate the world, original decks or world RNG',()=>{
  const world=createWorld(205,8),before=structuredClone(world),g=createBandLive({persistentReactions:false,people:world.people.slice(0,4),songs,seed:12});chooseSong(g,'punk');endTurn(g);
  assert.deepEqual(world,before);assert.notEqual(g.actors[0].needs,world.people[0].needs);
  assert.deepEqual(createBandLive({persistentReactions:false,people:world.people.slice(0,4),songs,seed:12}),createBandLive({persistentReactions:false,people:world.people.slice(0,4),songs,seed:12}));
});

test('three to twelve spectators survive JSON resume without changing the band, decks or world RNG',()=>{
  const world=createWorld(205,8),before=structuredClone(world),options={people:world.people.slice(0,4),songs,seed:12},baseline=createBandLive(options);
  assert.deepEqual(baseline.fans.map(f=>[f.name,f.hp]),[['Lou',24],['Pat',20],['Kim',25]]);
  for(const audienceSize of [3,4,6,9,12]){
    const g=createBandLive({persistentReactions:false,...options,audienceSize});assert.equal(g.fans.length,audienceSize);assert.equal(new Set(g.fans.map(f=>f.id)).size,audienceSize);assert.equal(new Set(g.fans.map(f=>f.name)).size,audienceSize);
    assert.deepEqual(g.deck,baseline.deck);assert.equal(g.rng,baseline.rng);chooseSong(g,'punk');endTurn(g);assert.deepEqual(restoreBandLive(JSON.parse(JSON.stringify(g))),g);
  }
  for(const audienceSize of [2,13,3.5,null,'6'])assert.throws(()=>createBandLive({persistentReactions:false,...options,audienceSize}),/spectateurs/);
  for(const fans of [[],baseline.fans.slice(0,2),Array(13).fill(baseline.fans[0]),[...baseline.fans,baseline.fans[0]],[null,...baseline.fans.slice(1)]])assert.throws(()=>restoreBandLive({...baseline,fans}));
  assert.deepEqual(world,before);
});
test('every collective power card reaches the extra rows, and victory waits for the whole crowd',()=>{
  for(const instrument of ['voice','keys','sax']){
    const g=game([instrument,'guitar'],12);g.tempo=4;
    for(const fan of g.fans.slice(0,3)){fan.hp=0;fan.conquered=true;}
    const before=g.fans.map(f=>f.hp),event=play(g,0,'audience');assert.equal(event.hits.length,9);assert.deepEqual(event.hits.map(h=>h.id),g.fans.slice(3).map(f=>f.id));
    assert(g.fans.slice(3).every((f,i)=>f.hp<before[i+3]));assert.equal(g.phase,'play');assert.deepEqual(restoreBandLive(g),g);
    endTurn(g);endTurn(g);for(const fan of g.fans.slice(3)){fan.hp=3;fan.intent='bored';}
    endTurn(g);assert.equal(g.phase,'won');assert.equal(g.events.findLast(e=>e.type==='finale').hits.length,9);assert(g.fans.every(f=>f.hp===0&&f.conquered));assert.deepEqual(restoreBandLive(g),g);
  }
  const g=game(['guitar','drums'],12),before=g.fans.map(f=>f.hp);play(g,0,'f11','note');assert(g.fans[11].hp<before[11]);assert.deepEqual(g.fans.slice(0,11).map(f=>f.hp),before.slice(0,11));
});

test('new formations accept the full neighbourhood, while an actual V1 rehearsal remains resumable',()=>{
  const world=createWorld(205,8);
  assert.throws(()=>createBandLive({persistentReactions:false,people:world.people.slice(0,1),songs}),/musiciens/);assert.equal(createBandLive({people:world.people,songs}).actors.length,8);
  assert.equal(createBandLive({persistentReactions:false,people:world.people.slice(0,6),songs}).cards.length,30);
  const legacy=JSON.parse(readFileSync(new URL('bandlive-v1.json',import.meta.url))),resumed=restoreBandLive(legacy);
  assert.deepEqual(resumed,legacy);assert.equal(resumed.actors.length,8);endTurn(resumed);assert.equal(resumed.turn,2);
  const forged=structuredClone(legacy);forged.version=2;forged.groupId=null;assert.throws(()=>restoreBandLive(forged));
});
test('a single real song can be reprised without changing the six-turn rules or its identity',()=>{
  const g=createBandLive({persistentReactions:false,people:createWorld(205,4).people,songs:[songs[0]],groupId:'g1'});
  chooseSong(g,'punk');endTurn(g);endTurn(g);endTurn(g);assert.equal(g.phase,'choose');assert(chooseSong(g,'punk').ok);
  assert.equal(g.turn,4);assert.deepEqual(g.usedSongs,['punk','punk']);assert.deepEqual(restoreBandLive(g),g);
  endTurn(g);endTurn(g);endTurn(g);assert.equal(g.phase,'lost');assert.equal(g.turn,6);
});
test('every repertoire song is selectable, while a multi-song show cannot repeat its first song',()=>{
  const options=[...songs,{id:'jazz',title:'Une troisième chanson',style:'Jazz'}],g=createBandLive({persistentReactions:false,people:createWorld(205,4).people,songs:options});
  assert(chooseSong(g,'jazz').ok);endTurn(g);endTurn(g);endTurn(g);assert(!chooseSong(g,'jazz').ok);assert(chooseSong(g,'punk').ok);assert.deepEqual(restoreBandLive(g),g);
});
function connectedWorld(){return restore(JSON.parse(readFileSync(new URL('v071-world.json',import.meta.url))));}
test('the world adapter uses actual members, instruments, canonical songs, authors and mastery without writing to the world',()=>{
  const world=connectedWorld(),group=world.groups[0],before=structuredClone(world),draft={groupId:group.id,memberIds:null,seed:12};
  const plan=resolveBandLivePlan(world,draft);assert(plan.ready);assert.deepEqual(plan.members.map(p=>p.id),group.members);assert.equal(plan.songs[0].sourceSongId,world.songs[0].id);
  draft.audienceSize=9;
  const g=createBandLiveFromWorld(world,draft);assert.equal(g.fans.length,9);assert.equal(g.groupId,group.id);assert.equal(g.groupName,group.name);assert.equal(g.songs[0].title,world.songs[0].title);assert.equal(g.songs[0].style,world.songs[0].genre);
  assert.deepEqual(g.songs[0].authors,world.songs[0].authors);assert.equal(g.songs[0].mastery,group.repertoire[0].mastery);assert.deepEqual(g.actors.map(a=>a.instrument),plan.members.map(p=>p.instrument));
  g.songs[0].authors.push('other');g.actors[0].needs.energy=0;assert.deepEqual(world,before);
});
test('groups without active songs can rehearse a jam; missing groups and nonmembers remain excluded',()=>{
  const world=connectedWorld(),group=world.groups[0],draft={groupId:group.id,memberIds:['p1','p2','p3'],seed:12};
  resolveBandLivePlan(world,draft);assert.deepEqual(draft.memberIds,['p1','p2']);
  group.repertoire[0].active=false;assert(resolveBandLivePlan(world,draft).ready);assert.equal(createBandLiveFromWorld(world,draft).songs[0].title,'Jam libre');
  group.repertoire[0].active=true;world.songs[0].ownerGroupId=world.groups[1].id;assert(resolveBandLivePlan(world,draft).ready);
  world.groups=[];assert(!resolveBandLivePlan(world,draft).ready);assert.throws(()=>createBandLiveFromWorld(world,draft),/groupe/);
});
test('an existing large neighbourhood band keeps all members in its BandLive selection',()=>{
  const world=createWorld(205,8),group=createGroup(world,world.people.map(p=>p.id),{manual:true}),before=structuredClone(world),draft={groupId:group.id,memberIds:null};
  const plan=resolveBandLivePlan(world,draft);assert.equal(plan.members.length,8);assert.equal(plan.people.length,8);assert.deepEqual(world,before);
  draft.memberIds=[...group.members];assert(resolveBandLivePlan(world,draft).ready);assert.equal(createBandLiveFromWorld(world,draft).actors.length,8);assert.deepEqual(world,before);
});
test('drafts refresh after departures, dissolution and song adoption, preserving an intentional small selection',()=>{
  const world=connectedWorld(),group=world.groups[0],draft={groupId:group.id,memberIds:['p1'],seed:12};
  assert(!resolveBandLivePlan(world,draft).ready);assert.deepEqual(draft.memberIds,['p1']);
  draft.memberIds=['p1','p2'];group.members=['p1'];resolveBandLivePlan(world,draft);assert.deepEqual(draft.memberIds,['p1']);
  group.archivedAt=world.time;group.state='dissolved';const plan=resolveBandLivePlan(world,draft);assert.equal(plan.group.id,world.groups[1].id);assert.equal(plan.songs[0].title,'Jam libre');
  world.songs[0].ownerGroupId=plan.group.id;plan.group.repertoire.push({songId:world.songs[0].id,active:true,mastery:10});assert(resolveBandLivePlan(world,draft).ready);
});
