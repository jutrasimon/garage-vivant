import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,previewCard,restoreBandLive} from '../dist/bandlive.mjs';
import {createCatalog,validateCatalog,compileCard,newEffect,duplicateCard,retireCard,offeredCards} from '../dist/bandlive-catalog.mjs';
import {initializeCrowd,simulateImpulse,moveSpectator,inRadius,validateCrowd} from '../dist/bandlive-crowd.mjs';
import {claimLevelReward} from '../dist/level-rewards.mjs';
import {chooseAutomaticMove,simulateBandLive} from '../dist/bandlive-auto.mjs';
import {validatePersonDecks} from '../dist/bandlive-cards.mjs';
function fixture({card=null,catalog=createCatalog(),spatial=true}={}){
 const people=createWorld(55,4).people;people[0].instrument='drums';
 if(card){const c=duplicateCard(catalog,'drums:note');Object.assign(c,card,{id:c.id,instrument:'drums',starter:0});people[0].bandLiveDecks={drums:[c.id,'note','note','special','special']};}
 const g=createBandLive({people,songs:[{id:'a',title:'A',style:'Jazz',turns:5}],seed:57,audienceSize:12,spatial,catalog});chooseSong(g,'a');
 for(const f of g.fans){f.hp=f.max=100;f.favorite='Jazz';f.effect='spotlight';f.effectValue=1;f.intent='bored';}
 const c=card?g.cards.find(c=>c.kind.includes(':copy-')):g.cards.find(c=>c.kind==='note');g.hand=[c.id];g.discard=[];g.deck=g.cards.filter(x=>x.id!==c.id).map(x=>x.id);
 return {g,c};
}
test('organic crowd has deterministic independent positions, spatial neighbors and exact save resumption',()=>{
 const {g}=fixture(),{g:other}=fixture();assert.deepEqual(g.fans.map(f=>f.position),other.fans.map(f=>f.position));
 assert(new Set(g.fans.map(f=>f.position.y)).size>2);const rng=g.rng;moveSpectator(g,'f0',{x:300,y:160});moveSpectator(g,'f1',{x:320,y:160});
 assert(inRadius(g,g.fans[0].position,.3,{exclude:'f0'}).some(f=>f.id==='f1'));assert.equal(g.rng,rng);assert.deepEqual(restoreBandLive(g),g);
 for(const mutate of [x=>x.fans[0].position.x=Infinity,x=>x.fans[0].position.y=-1,x=>x.physics.grip=0,x=>x.room.radiusUnit=999]){const bad=structuredClone(g);mutate(bad);assert.throws(()=>restoreBandLive(bad));}
});
test('point cast uses independent core/crown zones, accepts empty floor and never spends on invalid floor',()=>{
 const {g,c}=fixture({card:{target:'point',radius:1,coreRadius:.4,outerScale:.5,effects:[newEffect('power')]}});
 moveSpectator(g,'f0',{x:300,y:160});moveSpectator(g,'f1',{x:390,y:160});moveSpectator(g,'f2',{x:620,y:160});
 const before=structuredClone(g),options={point:{x:290,y:160}},preview=previewCard(g,c.id,null,options);assert(preview.ok);assert.deepEqual(g,before);
 assert.equal(preview.event.hits.find(h=>h.id==='f0').gain,8);assert.equal(preview.event.hits.find(h=>h.id==='f1').gain,4);assert(!preview.event.hits.some(h=>h.id==='f2'));
 assert(playCard(g,c.id,null,options).ok);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);
 const {g:bad,c:badCard}=fixture({card:{target:'point',effects:[newEffect()]}}),copy=structuredClone(bad);assert(!playCard(bad,badCard.id,null,{point:{x:10,y:-10}}).ok);assert.deepEqual(bad,copy);
});
test('fixed-step impacts transfer momentum, remain bounded and deterministic, and end asleep',()=>{
 const {g}=fixture();moveSpectator(g,'f0',{x:300,y:180});moveSpectator(g,'f1',{x:352,y:180});
 const copy=structuredClone(g),args={center:{x:200,y:180},targets:['f0'],strength:2,kind:'push'};
 const a=simulateImpulse(g,args),b=simulateImpulse(copy,args);assert.deepEqual(a,b);assert.deepEqual(g,copy);assert(a.contacts.some(c=>c.a==='f0'&&c.b==='f1'));assert(g.fans[1].position.x>352);assert(a.frames.length<=50);validateCrowd(g);
 for(const kind of ['pull','vortex','jump','return']){const next=structuredClone(g);const m=simulateImpulse(next,{...args,kind});assert(m.frames.length);validateCrowd(next);}
});
test('every proposed pair of effects executes and previews the exact committed state',()=>{
 const types=['power','tempo','energy','draw','boost','style','protect','push','pull','vortex','jump','return'];
 for(const first of types)for(const second of types){const {g,c}=fixture({card:{target:'radius',radius:1,effects:[newEffect(first),newEffect(second)]}}),before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok,first+' / '+second);assert.deepEqual(g,before);assert(playCard(g,c.id,'f0').ok);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);assert(g.hand.length<=5);}
});
test('catalog copies, retirement, starter counts, rarity and level gates are functional and resumable',()=>{
 const catalog=createCatalog();validateCatalog(catalog);const copy=duplicateCard(catalog,'guitar:new1');copy.name='Autre riff';copy.effects[0].amount=42;assert.notEqual(catalog.cards.find(c=>c.id==='guitar:new1').effects[0].amount,42);retireCard(catalog,copy.id);assert(!offeredCards(catalog,'guitar',99,'x').some(c=>c.catalogId===copy.id));validateCatalog(catalog);
 assert(offeredCards(catalog,'drums',1).every(c=>!c.catalogId.startsWith('neutral:')));
 let common=0,rare=0,neutral=0;for(let i=0;i<150;i++)for(const c of offeredCards(catalog,'drums',2,String(i))){if(c.rarity==='common')common++;if(c.rarity==='rare')rare++;if(c.catalogId.startsWith('neutral:'))neutral++;}assert(common>rare);assert(neutral>0);
 const broken=structuredClone(catalog);retireCard(broken,'guitar:note');assert.throws(()=>validateCatalog(broken),/5 cartes/);
 const ambiguous=structuredClone(catalog);duplicateCard(ambiguous,'guitar:note').legacyKind='note';assert.throws(()=>validateCatalog(ambiguous),/ambiguë/);
 const world=createWorld(5,4);world.cardCatalog=catalog;world.people[0].instrument='guitar';world.people[0].bandLiveDecks={guitar:[copy.id,'note','note','special','special']};assert.deepEqual(restore(world).cardCatalog,catalog);
 const missing=structuredClone(catalog);missing.cards=missing.cards.filter(c=>c.id!=='guitar:note');assert.throws(()=>validatePersonDecks(world.people[0],missing),/absente/);
});
test('new program preserves all non-spatial legacy card outcomes before intentional radius conversion',()=>{
 const catalog=createCatalog();
 for(const entry of catalog.cards.filter(c=>c.legacyKind&&c.target!=='radius'&&c.target!=='duo')){
  const make=spatial=>{const people=createWorld(55,4).people;people[0].instrument=entry.instrument;people[0].bandLiveDecks={[entry.instrument]:[entry.legacyKind,'note','note','special','special']};const g=createBandLive({people,songs:[{id:'a',title:'A',style:'Jazz'}],audienceSize:8,seed:57,spatial,catalog});chooseSong(g,'a');for(const f of g.fans){f.hp=f.max=100;f.favorite='Jazz';f.intent='bored';}g.tempo=5;const c=g.cards[0];g.hand=[c.id];g.deck=g.cards.slice(1).map(c=>c.id);g.discard=[];return {g,c};};
  const old=make(false),next=make(true),a=playCard(old.g,old.c.id,'f0'),b=playCard(next.g,next.c.id,'f0');assert(a.ok&&b.ok);assert.deepEqual(b.event.hits,a.event.hits,entry.id);assert.equal(next.g.tempo,old.g.tempo,entry.id);assert.equal(next.g.boost,old.g.boost,entry.id);assert.deepEqual(next.g.hand,old.g.hand,entry.id);
 }
});
test('neutral and authored cards really enter acquired decks, survive level claims and appear in future shows',()=>{
 const world=createWorld(80,8),catalog=createCatalog();for(const c of catalog.cards.filter(c=>c.instrument==='neutral'))c.rarity='common';world.cardCatalog=catalog;
 let person,choice;for(const p of world.people){const offered=offeredCards(catalog,p.instrument,2,p.id+':2').find(c=>c.catalogId.startsWith('neutral:'));if(offered){person=p;choice=offered;break;}}assert(person&&choice);
 person.xp=80;person.xpCurve=2;person.levelRewards=[{level:2,instrument:person.instrument,status:'pending'}];assert(claimLevelReward(world,{actorId:person.id,level:2,slot:0,kind:choice.kind}).ok);assert.deepEqual(restore(world).people.find(p=>p.id===person.id).bandLiveDecks,person.bandLiveDecks);
 const game=createBandLive({people:world.people.slice(0,8),songs:[{id:'a',title:'A',style:'Jazz'}],spatial:true,catalog});assert(game.cards.some(c=>c.actorId===person.id&&c.kind===choice.kind));assert.deepEqual(restoreBandLive(game),game);
 const previous=structuredClone(person);previous.bandLiveDecks[person.instrument][0]='note';const incomplete=structuredClone(catalog);incomplete.cards=incomplete.cards.filter(c=>c.id!==choice.kind);assert.throws(()=>validatePersonDecks(previous,incomplete),/déjà améliorée/,'Imports preserve custom definitions referenced only by reward history');retireCard(catalog,choice.kind);assert.doesNotThrow(()=>validatePersonDecks(previous,catalog));
});
test('automatic play evaluates ground points through the same resolver',()=>{
 const {g,c}=fixture({card:{target:'point',radius:1,effects:[newEffect('power')]}});const move=chooseAutomaticMove(g);assert.equal(move.id,c.id);assert(move.options.point);assert(previewCard(g,move.id,move.targetId,move.options).ok);simulateBandLive(g);assert(['won','lost'].includes(g.phase));assert.deepEqual(restoreBandLive(g),g);
});
test('free authored draw/refund combinations cannot trap automatic playback',()=>{
 const {g}=fixture({card:{cost:0,target:'audience',effects:[newEffect('energy'),newEffect('draw')]}});simulateBandLive(g);assert(['won','lost'].includes(g.phase));assert(g.played<500);assert.deepEqual(restoreBandLive(g),g);
});
test('ordered effects, tempo conditions and physical following reactions use actual positions',()=>{
 const card={target:'radius',radius:.4,effects:[{...newEffect('tempo'),amount:2,when:'tempo',conditionValue:3},newEffect('push'),newEffect('power')]};
 const {g,c}=fixture({card});g.tempo=3;moveSpectator(g,'f0',{x:300,y:150});moveSpectator(g,'f1',{x:330,y:150});g.fans[0].hp=1;g.fans[0].intent='attentive';g.fans[1].intent='following';
 const preview=previewCard(g,c.id,'f0');assert(preview.ok);assert.equal(preview.event.tempoGain,2);assert(preview.effects.some(e=>e.type==='motion'));assert.equal(preview.motions[0].frames.length,0,'Preview computes physics without allocating animation frames');const result=playCard(g,c.id,'f0');assert(result.motions[0].frames.length);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);
 const world=createWorld(44,4),catalog=createCatalog();const neutral=catalog.cards.find(c=>c.id==='neutral:blast');neutral.starter=1;neutral.minLevel=1;for(const c of catalog.cards.filter(c=>c.legacyKind==='note'))c.starter=2;validateCatalog(catalog);const game=createBandLive({people:world.people,songs:[{id:'a',title:'A',style:'Jazz'}],spatial:true,catalog});for(const a of game.actors)assert(game.cards.some(c=>c.actorId===a.id&&c.kind==='neutral:blast'));
});
