import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,endTurn,restoreBandLive,previewCard,powerAgainst,audienceColumns,conquestTargets,CONQUEST_EFFECTS} from '../dist/bandlive.mjs';
import {createConcertReplay,beginBandLiveConcert,commitBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {completePerformance} from '../dist/life.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
function fixture(count=12,instrument='guitar'){
 const world=createWorld(301,4),g=createBandLive({rulesVersion:1,persistentReactions:false,people:world.people.map(p=>({...p,instrument})),songs:[{id:'punk',title:'Le rappel',style:'Punk',turns:3}],seed:9,audienceSize:count});
 chooseSong(g,'punk');for(const f of g.fans){f.max=f.hp=100;f.favorite='Punk';f.effect='spotlight';}return g;
}
function note(g,instrument){
 const c=g.cards.find(c=>instrument?c.kind==='special'&&c.instrument===instrument:c.kind==='note');
 for(const pile of ['hand','deck','discard'])g[pile]=g[pile].filter(id=>id!==c.id);
 while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(c.id);return c.id;
}
function kill(g,index,effect){g.fans[index].effect=effect;g.fans[index].hp=1;return playCard(g,note(g),g.fans[index].id);}

test('Every new spectator has exactly one seeded effect; distribution is balanced without changing card RNG',()=>{
 const w=createWorld(302,4),options={people:w.people,songs:[{id:'x',title:'X',style:'Punk'}],seed:12},before=structuredClone(w);
 const legacy=createBandLive({rulesVersion:1,persistentReactions:false,...options,conquestEffects:false});
 for(const audienceSize of [3,5,8,10,12]){
  const g=createBandLive({rulesVersion:1,persistentReactions:false,...options,audienceSize});assert.equal(g.conquestVersion,1);assert(g.fans.every(f=>Object.hasOwn(CONQUEST_EFFECTS,f.effect)));
  assert.deepEqual(g.deck,legacy.deck);assert.equal(g.rng,legacy.rng);assert.deepEqual(g,createBandLive({rulesVersion:1,persistentReactions:false,...options,audienceSize}));assert.deepEqual(restoreBandLive(g),g);
  const counts=Object.keys(CONQUEST_EFFECTS).map(k=>g.fans.filter(f=>f.effect===k).length);assert(Math.max(...counts)-Math.min(...counts)<=1);
 }assert.deepEqual(w,before);
 const types=new Set();for(let seed=1;seed<30;seed++)createBandLive({rulesVersion:1,persistentReactions:false,...options,seed:seed*7919}).fans.forEach(f=>types.add(f.effect));assert.equal(types.size,5);
});
test('Shock is orthogonal without row wrapping, and wave touches only its own row',()=>{
 const g=fixture();assert.equal(audienceColumns(g),4);g.fans[3].effect='shock';assert.deepEqual(conquestTargets(g,g.fans[3]).map(f=>f.id),['f2','f7']);
 kill(g,3,'shock');assert.equal(g.fans[2].hp,97);assert.equal(g.fans[7].hp,97);assert.equal(g.fans[4].hp,100);
 const h=fixture();kill(h,5,'wave');assert.deepEqual(h.fans.map(f=>f.hp),[100,100,100,100,98,0,98,98,100,100,100,100]);
});
test('Piercing continues through fresh and earlier conquests, then stops on the first survivor',()=>{
 const g=fixture();g.fans[4].hp=3;g.fans[8].hp=4;const r=kill(g,0,'pierce');assert(r.ok);assert.equal(g.fans[4].hp,0);assert.equal(g.fans[8].hp,0);assert.equal(r.effects.length,3);
 const h=fixture();h.fans[4].hp=0;h.fans[4].conquered=true;h.fans[8].hp=10;kill(h,0,'pierce');assert.equal(h.fans[8].hp,6);
 const j=fixture();j.fans[4].hp=5;kill(j,0,'pierce');assert.equal(j.fans[4].hp,1);assert.equal(j.fans[8].hp,100);
});
test('Chain conquests trigger once in deterministic FIFO order and can finish the show',()=>{
 const g=fixture(3);g.fans.forEach(f=>{f.hp=2;f.effect='shock';});const r=kill(g,0,'shock');assert.equal(g.phase,'won');assert.deepEqual(r.effects.map(e=>e.fanId),['f0','f1','f2']);assert.equal(new Set(r.effects.map(e=>e.fanId)).size,3);assert(!endTurn(g).ok);assert.deepEqual(restoreBandLive(g),g);
});
test('Spotlight is +2 per later card, does not stack, and expires at the end of the turn',()=>{
 const g=fixture();kill(g,0,'spotlight');assert.equal(g.fans[1].spotlight,true);assert.equal(g.fans[4].spotlight,true);
 kill(g,2,'spotlight');const id=note(g),c=g.cards.find(c=>c.id===id);assert.equal(powerAgainst(g,c,g.fans[1]),10);assert.equal(powerAgainst(g,c,g.fans[9]),8);
 playCard(g,id,'f1');assert.equal(g.fans[1].hp,90);endTurn(g);assert(g.fans.every(f=>f.spotlight===undefined));assert.deepEqual(restoreBandLive(g),g);
});
test('Chorus uses the ordinary style bonus once and expires between passages, even for a repeated song',()=>{
 const g=fixture();g.songs.push({id:'pop',title:'Pop',style:'Pop',turns:3});g.fans.forEach(f=>f.favorite='Pop');
 kill(g,0,'chorus');assert.equal(g.fans[1].chorusStyle,'Punk');assert.equal(g.fans[4].chorusStyle,undefined);
 const c=g.cards.find(c=>c.id===note(g));assert.equal(powerAgainst(g,c,g.fans[1]),8);assert.equal(powerAgainst(g,c,g.fans[4]),6);
 const restored=restoreBandLive(g);assert.deepEqual(restored,g);for(let i=0;i<3;i++)endTurn(g);assert.equal(g.phase,'choose');assert(g.fans.every(f=>f.chorusStyle===undefined));chooseSong(g,'pop');assert.equal(g.fans[1].favorite,'Pop');
 const h=fixture();kill(h,0,'chorus');for(let i=0;i<3;i++)endTurn(h);assert(h.fans.every(f=>f.chorusStyle===undefined));chooseSong(h,'punk');assert(h.fans.every(f=>f.chorusStyle===undefined));
});
test('Collective card snapshots all its hits before conquest bonuses; raw area damage ignores card buffs',()=>{
 const g=fixture(12,'voice');g.fans[0].hp=1;g.fans[0].effect='spotlight';const r=playCard(g,note(g,'voice'),'audience');assert(r.ok);assert.equal(g.fans[1].hp,93);assert.equal(g.fans[1].spotlight,true);
 const h=fixture();h.boost=5;h.tempo=10;h.fans[1].spotlight=true;h.fans[1].chorusStyle='Punk';kill(h,0,'shock');assert.equal(h.fans[1].hp,97);assert.equal(h.boost,0);
 const all=fixture(12,'voice');all.fans.forEach(f=>{f.hp=1;f.effect='shock';f.effectValue=3;});const done=playCard(all,note(all,'voice'),'audience');assert.equal(done.effects.length,12);assert.equal(all.phase,'won');
});
test('Finale triggers area chains before boredom; preview matches execution including chained hits',()=>{
 const g=fixture();endTurn(g);endTurn(g);g.fans[0].hp=3;g.fans[0].effect='shock';g.fans[1].hp=6;g.fans[1].effect='wave';endTurn(g);assert.equal(g.fans[1].hp,0);assert(g.events.some(e=>e.type==='conquest'&&e.fanId==='f1'));
 const h=fixture();h.fans[0].hp=1;h.fans[0].effect='shock';h.fans[1].hp=2;h.fans[1].effect='wave';const id=note(h),before=structuredClone(h),preview=previewCard(h,id,'f0');assert.deepEqual(h,before);const r=playCard(h,id,'f0');assert.deepEqual(preview.game,h);assert.deepEqual(preview.effects,r.effects);assert.deepEqual(restoreBandLive(h),h);
});
test('Legacy shows and replays keep their original rules; new effects and statuses survive exact reload',()=>{
 const g=fixture();delete g.conquestVersion;g.fans.forEach(f=>delete f.effect);const before=structuredClone(g);assert.deepEqual(restoreBandLive(g),before);assert.equal(createConcertReplay(g).conquestVersion,undefined);
 const h=fixture();const replay=createConcertReplay(h);assert.equal(replay.conquestVersion,1);assert.deepEqual(replay.fans.map(f=>f.effect),createConcertReplay(h).fans.map(f=>f.effect));
 for(const mutate of [g=>g.conquestVersion=2,g=>delete g.fans[0].effect,g=>g.fans[0].effect='fake',g=>g.fans[0].spotlight=3,g=>g.fans[0].chorusStyle='Pop']){const bad=fixture();mutate(bad);assert.throws(()=>restoreBandLive(bad));}
 kill(h,0,'spotlight');const copy=restoreBandLive(h);const id=note(h),id2=note(copy);playCard(h,id,'f1');playCard(copy,id2,'f1');assert.deepEqual(copy,h);
});
test('Calendar victory by a chain applies the real concert result once and exports correctly',()=>{
 const {world}=preparedConcert(),{game:g}=beginBandLiveConcert(world);chooseSong(g,'song-1');g.fans.forEach(f=>{f.hp=1;f.effect='shock';f.effectValue=3;});g.fans[0].effect='shock';g.fans[4].effect='shock';
 playCard(g,note(g),'f0');assert.equal(g.phase,'won');assert(commitBandLiveConcert(world,completePerformance));assert.equal(world.showHistory.length,1);assert.deepEqual(restore(world),world);assert(!commitBandLiveConcert(world,completePerformance));
});
