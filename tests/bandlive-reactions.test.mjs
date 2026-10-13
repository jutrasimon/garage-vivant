import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,endTurn,previewCard,restoreBandLive} from '../dist/bandlive.mjs';
import {clearReactionProgress,REACTIONS} from '../dist/bandlive-reactions.mjs';
function fixture(){const people=createWorld(55,4).people;people[0].instrument='drums';people[1].instrument='guitar';const g=createBandLive({rulesVersion:1,people,songs:[{id:'a',title:'A',style:'Jazz'}],seed:57,audienceSize:8});chooseSong(g,'a');for(const f of g.fans){f.hp=f.max=100;f.favorite='Jazz';f.effect='spotlight';f.intent='rhythm';clearReactionProgress(f);}return g;}
function give(g,c){for(const p of ['hand','deck','discard'])g[p]=g[p].filter(id=>id!==c.id);while(g.hand.length>=5)g.deck.push(g.hand.pop());g.hand.push(c.id);g.energy=3;}
function play(g,c,target='f0'){give(g,c);const copy=structuredClone(g),preview=previewCard(g,c.id,target);assert.deepEqual(g,copy);const r=playCard(g,c.id,target);assert(r.ok);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);return r;}
const note=(g,actor=0)=>g.cards.find(c=>c.actorId===g.actors[actor].id&&c.kind==='note');
test('reactions persist across turns, song changes and JSON; progress resets each turn',()=>{
 const g=fixture(),before=g.fans.map(f=>f.intent);g.fans[0].intent='variety';play(g,note(g));assert.equal(g.fans[0].reactionActors.length,1);endTurn(g);assert.equal(g.fans[0].intent,'variety');assert.equal(g.fans[0].reactionActors.length,0);assert.deepEqual(g.fans.slice(1).map(f=>f.intent),before.slice(1));endTurn(g);endTurn(g);assert.equal(g.phase,'choose');chooseSong(g,'a');assert.equal(g.fans[0].intent,'variety');assert.deepEqual(restoreBandLive(g),g);
});
test('attentive and distracted apply on one power card, then reroll differently without changing card RNG',()=>{
 for(const [intent,power] of [['attentive',11],['distracted',5]]){const g=fixture(),f=g.fans[0];f.intent=intent;const rng=g.rng;assert.equal(play(g,note(g)).event.hits[0].power,power);assert.notEqual(f.intent,intent);assert(Object.hasOwn(REACTIONS,f.intent));assert.equal(g.rng,rng);}
});
test('variety needs two distinct musicians in one turn and does not trigger on preparation',()=>{
 const g=fixture(),f=g.fans[0];f.intent='variety';assert.equal(play(g,note(g)).event.hits[0].power,8);assert.equal(play(g,note(g)).event.hits[0].power,8);assert.equal(f.intent,'variety');assert.equal(play(g,note(g,1)).event.hits[0].power,11);assert.notEqual(f.intent,'variety');
});
test('rhythm counts actual gained tempo, even consumed later, and persists below its threshold',()=>{
 const g=fixture(),f=g.fans[0];f.hp=70;g.tempo=9;const pulse=g.cards.find(c=>c.instrument==='drums'&&c.kind==='special');play(g,pulse);assert.equal(f.reactionTempo,1);endTurn(g);assert.equal(f.hp,70);assert.equal(f.intent,'rhythm');g.tempo=0;play(g,pulse);assert.equal(f.reactionTempo,3);g.tempo=0;endTurn(g);assert.equal(f.hp,67);assert.notEqual(f.intent,'rhythm');
});
test('boredom persists when protected or already empty, and rerolls only after actual loss',()=>{
 const g=fixture(),f=g.fans[0];f.intent='bored';endTurn(g);assert.equal(f.intent,'bored');f.hp=80;f.noBoredom=true;endTurn(g);assert.equal(f.intent,'bored');assert.equal(f.hp,80);endTurn(g);assert.equal(f.hp,80,'finale gains 3 then boredom loses 3');assert.notEqual(f.intent,'bored');
});
test('neighbour reaction waits until end turn, ignores distant conquests and fires only once',()=>{
 const g=fixture(),f=g.fans[0];f.intent='following';f.hp=60;g.fans[7].hp=1;play(g,note(g),'f7');assert.equal(f.reactionNeighbor,false);g.fans[1].hp=1;play(g,note(g),'f1');assert.equal(f.hp,60);assert(f.reactionNeighbor);endTurn(g);assert.equal(f.hp,57);assert.notEqual(f.intent,'following');
});
test('end-turn reaction conquests trigger chains and a neighbouring existing reaction in the same batch',()=>{
 const g=fixture();g.fans[0].hp=3;g.fans[0].reactionTempo=3;g.fans[1].hp=10;g.fans[1].intent='following';endTurn(g);assert.equal(g.fans[0].hp,0);assert.equal(g.fans[1].hp,7);assert.equal(g.events.filter(e=>e.type==='reaction').length,2);assert.deepEqual(restoreBandLive(g),g);
});
test('reactions finish the show when the last spectators are conquered and validate persisted progress',()=>{
 const g=fixture();g.fans.forEach(f=>{f.hp=3;f.reactionTempo=3;});endTurn(g);assert.equal(g.phase,'won');assert.deepEqual(restoreBandLive(g),g);
 for(const mutate of [x=>x.reactionRng=-1,x=>x.fans[0].intent='solo',x=>x.fans[0].reactionTempo=4,x=>x.fans[0].reactionActors=['missing'],x=>x.fans[0].reactionNeighbor='yes']){const bad=structuredClone(g);mutate(bad);assert.throws(()=>restoreBandLive(bad));}
});
