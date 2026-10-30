import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {crowdStressFixture} from './bandlive-crowd-stress-fixture.mjs';
import {createWorld,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,previewCard,restoreBandLive,impactCrowd} from '../dist/bandlive.mjs';
import {createCatalog,validateCatalog,compileCard,newEffect,duplicateCard,retireCard,offeredCards} from '../dist/bandlive-catalog.mjs';
import {initializeCrowd,simulateImpulse,moveSpectator,inRadius,validateCrowd} from '../dist/bandlive-crowd.mjs';
import {claimLevelReward} from '../dist/level-rewards.mjs';
import {chooseAutomaticMove,simulateBandLive} from '../dist/bandlive-auto.mjs';
import {validatePersonDecks} from '../dist/bandlive-cards.mjs';
import {replaceLabCard} from '../dist/bandlive-lab-card.mjs';
import {applyShowCard} from '../dist/bandlive-show-card.mjs';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {restartTestShow,setTestResources,redrawTestHand} from '../dist/bandlive-test-controls.mjs';

test('complete lab controls reproduce crowds up to 50 without changing the live show',()=>{
 const world=preparedConcert({instruments:['drums','keys','voice']}).world,original=beginBandLiveConcert(world).game;chooseSong(original,original.songs[0].id);const before=structuredClone(original);
 for(const count of [3,6,12,25,50]){
  const game=restartTestShow(original,{count,seed:42});assert.equal(game.fans.length,count);assert.equal(game.turn,1);assert.equal(game.played,0);assert.equal(game.hand.length,5);validateCrowd(game);assert.equal(new Set(game.fans.map(f=>f.id)).size,count);
  assert.deepEqual(restartTestShow(game,{count,seed:42}),game);assert.deepEqual(restoreBandLive(game,{laboratory:true}),game);if(count>12)assert.throws(()=>restoreBandLive(game));
  assert.equal(replaceLabCard(game,game.catalog.cards[0]).fans.length,count);
  const hand=[...game.hand];setTestResources(game,0,10);assert.equal(game.energy,0);assert.equal(game.tempo,10);redrawTestHand(game);assert.notDeepEqual(game.hand,hand);assert.equal(new Set([...game.hand,...game.deck,...game.discard]).size,game.cards.length);restoreBandLive(game,{laboratory:true});
 }
 for(const count of [0,2,51,3.5,NaN])assert.throws(()=>restartTestShow(original,{count}));assert.throws(()=>setTestResources(original,4,0));assert.deepEqual(original,before);
});
function fixture({card=null,catalog=createCatalog(),spatial=true}={}){
 const people=createWorld(55,4).people;people[0].instrument='drums';
 if(card){const c=duplicateCard(catalog,'drums:note');Object.assign(c,card,{id:c.id,instrument:'drums',starter:0});people[0].bandLiveDecks={drums:[c.id,'note','note','special','special']};}
 const g=createBandLive({people,songs:[{id:'a',title:'A',style:'Jazz',turns:5}],seed:57,audienceSize:12,spatial,catalog});chooseSong(g,'a');
 for(const f of g.fans){f.hp=f.max=100;f.favorite='Jazz';f.effect='spotlight';f.effectValue=1;f.intent='bored';}
 const c=card?g.cards.find(c=>c.kind.includes(':copy-')):g.cards.find(c=>c.kind==='note');g.hand=[c.id];g.discard=[];g.deck=g.cards.filter(x=>x.id!==c.id).map(x=>x.id);
 return {g,c};
}

test('split impact moves every body horizontally away from a vertical line, with exact preview and save',()=>{
 const {g,c}=fixture({card:{target:'point',radius:.2,coreRadius:.1,outerScale:.1,effects:[newEffect('split')]}});
 g.fans.forEach((f,i)=>{f.position={x:i%2?770:350,y:60+Math.floor(i/2)*46};});g.physics.collisionRadius=16;
 g.fans[0].hp=0;g.fans[0].conquered=true;
 const before=structuredClone(g),point={x:560,y:180},preview=previewCard(g,c.id,'audience',{point});assert(preview.ok);assert.deepEqual(g,before);
 const area=preview.areas.find(a=>a.shape==='line');assert.equal(area.targets.length,12);assert.equal(area.center.x,560);assert(!preview.areas.some(a=>a.radius>0));
 const result=playCard(g,c.id,'audience',{point});assert(result.ok);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);
 for(const [i,f] of g.fans.entries()){assert.equal(f.position.y,before.fans[i].position.y);assert((f.position.x-before.fans[i].position.x)*(i%2?1:-1)>0);}
 assert.equal(result.motions[0].targets.length,12);assert.equal(result.motions[0].kind,'split');
 const onLine=structuredClone(before);onLine.fans=[{...onLine.fans[0],position:{...point}}];simulateImpulse(onLine,{center:point,targets:['f0'],kind:'split',strength:.5});assert(onLine.fans[0].position.x>point.x);assert.equal(onLine.fans[0].position.y,point.y);
});

test('split releases compressed columns at either wall, including conquered bodies and fifty spectators',()=>{
 for(const count of [8,50])for(const right of [false,true]){
  const {g}=fixture(),game=restartTestShow(g,{count,seed:42});
  game.fans.forEach((f,i)=>{f.position={x:right?1050:70,y:52+i*256/(count-1)};if(i%2===0){f.hp=0;f.conquered=true;}});
  const copy=structuredClone(game),args={center:{x:right?920:200,y:180},targets:game.fans.map(f=>f.id),kind:'split',strength:2};
  const result=simulateImpulse(game,args),again=simulateImpulse(copy,args);assert.deepEqual(result,again);validateCrowd(game);
  for(const [i,a] of game.fans.entries())for(const b of game.fans.slice(i+1))assert(Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y)>=game.physics.collisionRadius*2-1,`No compressed pair: ${count}, ${a.id}/${b.id}`);
  assert(Math.max(...game.fans.map(f=>f.position.x))-Math.min(...game.fans.map(f=>f.position.x))>32);
  assert.deepEqual(result.frames.at(-1).map(({id,x,y})=>({id,x,y})),game.fans.map(f=>({id:f.id,...f.position})));
  assert.deepEqual(restoreBandLive(game,{laboratory:true}),game);
 }
});

test('split combined with power keeps a separate circular area for power',()=>{
 const {g,c}=fixture({card:{target:'point',radius:1,coreRadius:0,effects:[newEffect('split'),{...newEffect('power'),impactStrength:0}]}}),point={x:560,y:180};
 const preview=previewCard(g,c.id,'audience',{point});assert(preview.ok);assert.equal(preview.areas.filter(a=>a.shape==='line').length,1);assert.equal(preview.areas.filter(a=>a.kind==='card'&&a.radius===1).length,1);
 playCard(g,c.id,'audience',{point});assert.deepEqual(g,preview.game);
});
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
test('radius boundaries and core/crown previews use the same positions as the actual hit',()=>{
 const {g,c}=fixture({card:{target:'point',radius:1,coreRadius:.4,outerScale:.5,effects:[{...newEffect('power'),impactStrength:0}]}}),point={x:320,y:160},unit=g.room.radiusUnit;
 for(const [i,f] of g.fans.entries())moveSpectator(g,f.id,i<3?{x:point.x+(i===0?.4*unit:i===1?unit:unit+.01),y:point.y}:{x:900,y:80+i*20});
 const before=structuredClone(g),preview=previewCard(g,c.id,null,{point});assert(preview.ok);assert.deepEqual(g,before);
 assert.deepEqual(preview.areas[0].center,point);assert.deepEqual(preview.areas[0].targets.map(t=>t.id),['f0','f1']);assert(!preview.event.hits.some(h=>h.id==='f2'),'A center outside the visible boundary is not a direct target');
 assert.equal(preview.event.hits.find(h=>h.id==='f0').gain,8);assert.equal(preview.event.hits.find(h=>h.id==='f1').gain,4);
 const actual=playCard(g,c.id,null,{point});assert.deepEqual(actual.areas,preview.areas);assert.deepEqual(g,preview.game);assert(!Object.hasOwn(actual.event,'areas'),'Preview geometry never grows the saved event history');
});
test('all conquest chains expose their own exact impact-time circle and displaced targets',()=>{
 const {g,c}=fixture();g.physics.hitStrength=1.5;
 for(const [i,f] of g.fans.entries())Object.assign(f,{hp:i===0?6:i===1?1:100,effect:'shock',effectValue:4,position:i===0?{x:400,y:130}:i===1?{x:480,y:220}:{x:740+(i%3)*100,y:70+(Math.floor((i-2)/3)%3)*90}});
 const before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok);assert.deepEqual(g,before);assert(preview.event.hits.some(h=>h.id==='f1'&&h.kind==='collision'));
 const chain=preview.areas.find(a=>a.kind==='conquest'&&a.sourceId==='f1');assert(chain);assert(chain.targets.some(t=>t.id==='f9'));assert(Math.hypot(g.fans[9].position.x-preview.game.fans[0].position.x,g.fans[9].position.y-preview.game.fans[0].position.y)>g.room.radiusUnit,'A later conquest can reach beyond the first circle');
 for(const area of preview.areas.filter(a=>a.kind==='conquest')){const event=preview.effects.find(e=>e.type==='conquest'&&e.fanId===area.sourceId);assert.deepEqual(area.targets.map(t=>t.id),event.targets);for(const t of area.targets)assert(Math.hypot(t.position.x-area.center.x,t.position.y-area.center.y)<=area.radius*g.room.radiusUnit+1e-6);}
 assert.deepEqual(chain.center,preview.game.fans[1].position);assert.notDeepEqual(chain.center,g.fans[1].position);const actual=playCard(g,c.id,'f0');assert.deepEqual(actual.areas,preview.areas);assert.deepEqual(g,preview.game);assert.deepEqual(restoreBandLive(g),g);
});
test('a radius following a pushed target exposes both ordered centers instead of reusing its initial circle',()=>{
 const {g,c}=fixture({card:{target:'radius',radius:1,effects:[{...newEffect('push'),strength:1.5},{...newEffect('power'),impactStrength:0}]}});g.physics.collisionPower=0;
 for(const [i,f] of g.fans.entries())moveSpectator(g,f.id,i===0?{x:260,y:130}:i===1?{x:480,y:220}:{x:740+(i%3)*100,y:70+(Math.floor((i-2)/3)%3)*90});
 const preview=previewCard(g,c.id,'f0');assert(preview.ok);const [first,second]=preview.areas.filter(a=>a.kind==='card');assert.deepEqual(first.center,g.fans[0].position);assert.notDeepEqual(second.center,first.center);assert.deepEqual(second.center,preview.game.fans[0].position);
 assert.deepEqual(preview.event.hits.filter(h=>h.kind!=='collision').map(h=>h.id).sort(),second.targets.map(t=>t.id).sort());for(const t of second.targets)assert(Math.hypot(t.position.x-second.center.x,t.position.y-second.center.y)<=g.room.radiusUnit+1e-6);
 const actual=playCard(g,c.id,'f0');assert.deepEqual(actual.areas,preview.areas);assert.deepEqual(g,preview.game);
});
function collisionLine(game){for(const [i,f] of game.fans.entries())moveSpectator(game,f.id,i<3?{x:300+i*120,y:180}:{x:740+(i%3)*100,y:60+Math.floor((i-3)/3)*90});}
test('collision optimization preserves complete reference trajectories for 12 and 50 spectators',()=>{
 // Recorded from 0568515; the 50-body vortex/return references include the collinear-contact fix.
 const references={12:{push:'01f5dad34ca5dc9694b9e06665a48373b44785ab36d144e7e6b416c0c37a59de',pull:'c59e1ede3f561fbfa413208d48a18fdedb87a6128bfe0df7bc24481f855043f2',vortex:'f52c5d8102cb8477dac1e2cf39e3cbf6caad8ae9d25afdbd8de91e0fadc3501c',jump:'a1a6f20063305a8ac0f11ab098cc3bc8c48cd1b967b9b5054ab83c721900788b',return:'cb92df0b800d89c94d4ec92e7132e34cacbbb9b54193d038253c7d575b527bbd'},50:{push:'049eabb6773ffafa1f4d04695a07c6ab9d07ce300a111b020cf115cfec4e1f14',pull:'dbcaf63006041dc9addfa597d1786363f803c65577116522ff08a78e25972d4b',vortex:'aa3278d65a110422c6665e85f5d78c6f36e8c2340fcb1254fa70493c548e5f09',jump:'42ef32c4456c7ffeb39533b81bedd7023e83a6a95f258ebe161b84d0adb6f2c7',return:'6cf3f700974cc629710ac633835af2bd49e4322b4c44d4624a36d202755d7cd2'}};
 for(const count of [12,50])for(const kind of Object.keys(references[count])){
  const {game}=crowdStressFixture(count),center={x:430,y:180},motion=simulateImpulse(game,{center,targets:inRadius(game,center,1.2,{alive:false}).map(f=>f.id),kind,strength:1.3});
  const digest=createHash('sha256').update(JSON.stringify({motion,positions:game.fans.map(f=>f.position)})).digest('hex');assert.equal(digest,references[count][kind],count+' spectators, '+kind);
 }
});
test('strong contacts transmit through several spectators and award hearts only to the struck bodies',()=>{
 const {g}=fixture();collisionLine(g);const args={center:{x:200,y:180},targets:['f0'],strength:2},copy=structuredClone(g),r=impactCrowd(g,args),other=impactCrowd(copy,args);assert.deepEqual(r,other);assert.deepEqual(g,copy);
 assert.equal(g.fans[0].hp,100,'The moving spectator does not earn hearts merely by hitting someone');assert.equal(g.fans[1].hp,98);assert.equal(g.fans[2].hp,98,'A struck body can hit the next body in turn');assert(g.fans[2].position.x>540);
 const pairs=r.motions[0].contacts.map(c=>c.a+':'+c.b);assert.equal(new Set(pairs).size,pairs.length,'No repeated rubbing rewards within one impulse');assert(r.motions[0].contacts.some(c=>c.a==='f1'&&c.b==='f2'));assert.deepEqual(restoreBandLive(g),g);
});
test('collision threshold, contact radius, heart gain and card bonus are independent adjustable rules',()=>{
 const make=()=>{const {g}=fixture();collisionLine(g);return g;},args={center:{x:200,y:180},targets:['f0'],strength:1};
 const high=make();high.physics.collisionThreshold=400;impactCrowd(high,args);assert.equal(high.fans[1].hp,100);assert(high.fans[1].position.x>420,'A small collision still transfers physical momentum');
 const zero=make();zero.physics.collisionPower=0;impactCrowd(zero,args);assert.equal(zero.fans[1].hp,100);
 const bonus=make();bonus.physics.collisionPower=5;impactCrowd(bonus,{...args,collisionPower:3});assert.equal(bonus.fans[1].hp,92,'The authored effect bonus adds to the crowd rule');
 const normal=impactCrowd(make(),args),large=make();large.physics.collisionRadius=48;const early=impactCrowd(large,args);assert(early.motions[0].contacts[0].frame<normal.motions[0].contacts[0].frame,'Larger bodies meet earlier');
 for(const mutate of [g=>g.physics.collisionPower=2.5,g=>g.physics.collisionThreshold=-1,g=>g.physics.collisionRadius=100,g=>g.physics.hitStrength=3]){const bad=make();mutate(bad);assert.throws(()=>restoreBandLive(bad));}
});
test('collision conquest is capped, triggers nearby following immediately and preserves the event stream',()=>{
 const {g}=fixture();collisionLine(g);g.physics.collisionPower=5;g.fans[1].hp=3;g.fans[2].intent='following';const r=impactCrowd(g,{center:{x:200,y:180},targets:['f0'],strength:2});
 assert(g.fans[1].conquered);assert.equal(r.hits.find(h=>h.id==='f1').gain,3);assert(g.fans[2].reactionUsed);assert(r.effects.some(e=>e.type==='reaction'&&e.fanId==='f2'));assert.equal(r.event.type,'motion');assert.deepEqual(restoreBandLive(g),g);
});
test('ordinary musical power causes knockback, collision hearts and an identical non-mutating preview',()=>{
 const {g,c}=fixture({card:{effects:[newEffect('power'),{...newEffect('tempo'),when:'conquest'}]}});collisionLine(g);moveSpectator(g,'f0',{x:400,y:130});moveSpectator(g,'f1',{x:480,y:220});g.physics.hitStrength=1.5;g.fans[1].hp=1;
 const before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok);assert.deepEqual(g,before);const r=playCard(g,c.id,'f0');assert.deepEqual(g,preview.game);assert(r.motions.some(m=>m.kind==='hit'));assert(r.event.hits.some(h=>h.kind==='collision'&&h.id==='f1'));assert(g.fans[1].conquered);assert.equal(r.event.tempoGain,0,'A collision conquest does not masquerade as a direct musical hit');assert.deepEqual(restoreBandLive(g),g);
 const disabled=structuredClone(before);disabled.physics.hitStrength=0;const still=playCard(disabled,c.id,'f0');assert.equal(still.motions.length,0);assert.equal(disabled.fans[1].hp,1);
});
test('early physical saves acquire collision settings without losing cards, positions or chosen tuning',()=>{
 const {g}=fixture(),old=structuredClone(g);old.physics={force:230,grip:5,rebound:.28,collisionPower:0};const restored=restoreBandLive(old);assert.equal(restored.physics.collisionPower,2);assert.equal(restored.physics.collisionThreshold,60);assert.equal(restored.physics.collisionRadius,32);assert.equal(restored.physics.force,420);assert.deepEqual(restored.cards,old.cards);assert.deepEqual(restored.fans,old.fans);
 old.physics.force=610;old.physics.grip=2;old.physics.collisionPower=4;const custom=restoreBandLive(old);assert.equal(custom.physics.force,610);assert.equal(custom.physics.grip,2);assert.equal(custom.physics.collisionPower,4);assert.deepEqual(restoreBandLive(custom),custom);
});
test('card knockback strength scales displacement independently of musical power',()=>{
 const distances=new Map();
 for(const strength of [0,.5,1,2,3]){
  const {g,c}=fixture({card:{effects:[{...newEffect('power'),impactStrength:strength}]}});g.physics.force=80;g.physics.hitStrength=1.5;g.physics.rebound=0;g.physics.collisionPower=0;
  for(const [i,f] of g.fans.entries())moveSpectator(g,f.id,i?{x:600+(i-1)%4*110,y:60+Math.floor((i-1)/4)*90}:{x:300,y:130});
  const before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok);assert.deepEqual(g,before);const result=playCard(g,c.id,'f0');assert.deepEqual(g,preview.game);assert.equal(result.event.hits.find(h=>h.id==='f0').gain,8,'The musical hit keeps the same hearts at every knockback strength');
  distances.set(strength,Math.hypot(g.fans[0].position.x-300,g.fans[0].position.y-130));assert.equal(result.motions.length,strength===0?0:1);assert.deepEqual(restoreBandLive(g),g);
  if(!strength)assert.deepEqual(g.fans.map(f=>f.position),before.fans.map(f=>f.position),'Zero skips the impulse entirely, including separation of idle bodies');
 }
 // The fixed-step sleep threshold leaves a tiny residual distance at rest.
 assert.equal(distances.get(0),0);for(const s of [.5,2,3])assert(Math.abs(distances.get(s)/distances.get(1)-s)<.02,'Card strength is a real multiplier, including above the old launch cap');
});
test('card-specific knockback drives collision hearts and still respects the global disable switch',()=>{
 for(const strength of [0,2]){
  const {g,c}=fixture({card:{effects:[{...newEffect('power'),impactStrength:strength}]}});collisionLine(g);moveSpectator(g,'f0',{x:400,y:130});moveSpectator(g,'f1',{x:480,y:220});g.physics.hitStrength=1.5;
  const before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok);const played=playCard(g,c.id,'f0');assert.deepEqual(g,preview.game);assert.equal(played.event.hits.find(h=>h.id==='f0'&&!h.kind).gain,8);
  assert.equal(played.event.hits.some(h=>h.kind==='collision'),strength>0);assert.equal(g.fans[1].hp<100,strength>0);assert.deepEqual(restoreBandLive(g),g);
  const disabled=structuredClone(before);disabled.physics.hitStrength=0;assert.equal(playCard(disabled,c.id,'f0').motions.length,0);assert.deepEqual(disabled.fans.map(f=>f.position),before.fans.map(f=>f.position));
 }
 const {g,c}=fixture({card:{effects:[{...newEffect('power'),impactStrength:0},newEffect('push')]}}),result=playCard(g,c.id,'f0');assert(result.motions.some(m=>m.kind==='push'),'A separate physical effect retains its own strength even when the musical recoil is zero');
});
test('catalogs and active shows without card knockback strength preserve their definitions and normal recoil',()=>{
 const old=createCatalog();for(const c of old.cards)for(const e of c.effects)delete e.impactStrength;validateCatalog(old);
 const {g,c}=fixture({catalog:old}),copy=structuredClone(g);assert.deepEqual(restoreBandLive(g),copy,'Restoring does not rewrite a frozen catalog or its compiled cards');
 const next=structuredClone(g);for(const e of next.cards.find(x=>x.id===c.id).definition.program)if(e.type==='power')e.impactStrength=1;
 const a=playCard(g,c.id,'f0'),b=playCard(next,c.id,'f0');assert.deepEqual(a,b);assert.deepEqual(g.fans,next.fans);assert.deepEqual(restoreBandLive(g),g);assert(g.cards.every(c=>c.definition.program.every(e=>!Object.hasOwn(e,'impactStrength'))));
});
test('invalid card knockback strength is rejected and nonstandard recoil is described on the card',()=>{
 const catalog=createCatalog(),c=catalog.cards.find(c=>c.id==='drums:note'),e=c.effects.find(e=>e.type==='power');
 for(const value of [-1,3.1,null,NaN,Infinity,'2']){e.impactStrength=value;assert.throws(()=>validateCatalog(catalog),/Force de repoussement/);}
 e.impactStrength=0;validateCatalog(catalog);assert(compileCard(c).description.includes('sans repoussement'));e.impactStrength=.5;assert(compileCard(c).description.includes('repoussement ×0.5'));
 e.impactStrength=1;const normal=compileCard(c).description;delete e.impactStrength;validateCatalog(catalog);assert.equal(compileCard(c).description,normal,'Missing and normal multipliers retain the previous description');
});
test('large authored tempo gains preserve the show cap and count only actual gains for rhythm',()=>{
 for(const amount of [12,100])for(const initial of [0,8,10]){
  const {g,c}=fixture({card:{effects:[{...newEffect('tempo'),amount}]}});g.tempo=initial;g.fans[0].intent='rhythm';g.physics.hitStrength=0;
  const before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok);assert.deepEqual(g,before);
  const result=playCard(g,c.id,'f0');assert.deepEqual(g,preview.game);assert.equal(g.tempo,10);assert.equal(result.event.tempoGain,10-initial);
  assert.equal(g.fans[0].reactionTempo,Math.min(3,10-initial));assert.equal(g.fans[0].reactionUsed,initial===0,'Overflow never advances rhythm or repeats its reward');assert.deepEqual(restoreBandLive(g),g);
 }
 const {g,c}=fixture({card:{effects:[{...newEffect('tempo'),amount:12},{...newEffect('power'),amount:0,formula:'tempo'},{...newEffect('tempo'),amount:12,when:'alternate'}]}});g.physics.hitStrength=0;
 const previous=g.cards.find(x=>x.actorId!==c.actorId&&x.kind==='note');g.hand.push(previous.id);g.deck=g.deck.filter(id=>id!==previous.id);assert(playCard(g,previous.id,'f1').ok);
 const preview=previewCard(g,c.id,'f0'),result=playCard(g,c.id,'f0');assert(result.ok);assert.deepEqual(g,preview.game);assert.equal(result.event.tempoGain,20);assert.equal(result.event.tempoSpent,10);assert.equal(g.tempo,10,'Each ordered gain is capped independently, even with alternation and a spend between them');assert.deepEqual(restoreBandLive(g),g);
});
test('six and one hundred authored strikes share power, stop at conquest and survive resumption',()=>{
 for(const strikes of [6,100])for(const remaining of [100,3]){
  const {g,c}=fixture({card:{effects:[{...newEffect('power'),strikes}]}});g.physics.hitStrength=0;g.fans[0].hp=remaining;
  const before=structuredClone(g),preview=previewCard(g,c.id,'f0');assert(preview.ok);assert.deepEqual(g,before);const result=playCard(g,c.id,'f0');assert.deepEqual(g,preview.game);
  const hits=result.event.hits.filter(h=>h.id==='f0');assert.equal(hits.reduce((n,h)=>n+h.gain,0),Math.min(remaining,8),'Six base power plus the matching style bonus is shared, never multiplied');
  assert(hits.length<=strikes);assert.equal(g.fans[0].hp,Math.max(0,remaining-8));if(strikes===6&&remaining===100)assert.deepEqual(hits.map(h=>h.power),[2,2,1,1,1,1]);
  if(remaining===3)assert.equal(hits.at(-1).after,0,'No further strikes are recorded after conquest');assert.deepEqual(restoreBandLive(g),g);
 }
});
test('expanded editor limits validate catalogs and report card, effect, field and allowed range',()=>{
 const world=createWorld(55,4),catalog=createCatalog(),c=catalog.cards.find(c=>c.id==='drums:note');c.effects=[{...newEffect('power'),strikes:6},{...newEffect('tempo'),amount:12},{...newEffect('tempo'),amount:12,when:'alternate'}];world.cardCatalog=catalog;
 validateCatalog(catalog);assert.deepEqual(restore(world).cardCatalog,catalog);assert.equal(compileCard(c).program[0].strikes,6);
 for(const [index,key] of [[0,'strikes'],[1,'amount']]){
  const original=c.effects[index][key];for(const value of [0,101,1.5,null,Infinity,'12']){
   c.effects[index][key]=value;assert.throws(()=>validateCatalog(catalog),error=>error.message.includes('carte « Note »')&&error.message.includes(`effet ${index+1}`)&&error.message.includes(index?'Tempo':'Frappes')&&error.message.includes('un entier entre 1 et 100'));
  }c.effects[index][key]=original;
 }
 validateCatalog(catalog);
});
test('successive laboratory cards preserve the live crowd, settings, resources and turn history',()=>{
 const {g}=fixture(),before=structuredClone(g),entry=structuredClone(g.catalog.cards.find(c=>c.id==='drums:note'));entry.effects[0].impactStrength=0;
 let lab=replaceLabCard(g,entry,{original:g});assert.deepEqual(g,before);const slot=lab.hand[0];assert(playCard(lab,slot,'f0').ok);lab.tempo=7;lab.physics.force=610;lab.physics.grip=2;lab.room.radiusUnit=225;moveSpectator(lab,'f0',{x:310,y:120});
 for(const instrument of ['keys','drums','keys']){
  const current=structuredClone(lab),card=structuredClone(g.catalog.cards.find(c=>c.id===instrument+':note'));card.effects[0].amount=12;lab=replaceLabCard(lab,card,{original:g});
  for(const key of ['fans','physics','room','turn','section','tempo','boost','relayBoosts','played','events','logs'])assert.deepEqual(lab[key],current[key],key+' survives a card swap');
  assert.equal(lab.energy,3);assert.equal(lab.cards.filter(c=>c.kind==='lab:test').length,1);assert.equal(lab.cards.find(c=>c.kind==='lab:test').instrument,instrument);assert(lab.hand.length<=5);assert(lab.hand.includes(lab.cards.find(c=>c.kind==='lab:test').id));
  for(const c of lab.cards.filter(c=>c.kind!=='lab:test'))assert.deepEqual(c,g.cards.find(x=>x.id===c.id),'Previous temporary slots regain their exact original card');
  assert.deepEqual(restoreBandLive(lab),lab);assert.deepEqual(current.events,lab.events);
 }
});
test('laboratory source cards survive scenario export/import and earlier trials without source metadata',()=>{
 const {g}=fixture(),card=structuredClone(g.catalog.cards.find(c=>c.id==='drums:note')),first=replaceLabCard(g,card,{original:g}),slot=first.hand[0],keys=structuredClone(g.catalog.cards.find(c=>c.id==='keys:note'));
 for(const old of [false,true]){
  const imported=JSON.parse(JSON.stringify(first));if(old)delete imported.catalog.cards.find(c=>c.id==='lab:test').labSourceKind;
  const next=replaceLabCard(restoreBandLive(imported),keys,{original:old?g:null});assert.deepEqual(next.cards.find(c=>c.id===slot),g.cards.find(c=>c.id===slot));assert.equal(next.cards.filter(c=>c.kind==='lab:test').length,1);assert.deepEqual(restoreBandLive(next),next);
 }
});
test('laboratory replacement is atomic, retains a valid card partition and works with a full catalog',()=>{
 const {g}=fixture();g.hand=g.cards.filter(c=>c.actorId===g.actors[0].id).map(c=>c.id);g.deck=g.cards.filter(c=>!g.hand.includes(c.id)).map(c=>c.id);while(g.catalog.cards.length<256)duplicateCard(g.catalog,'sax:note');validateCatalog(g.catalog);
 const before=structuredClone(g),entry=structuredClone(g.catalog.cards.find(c=>c.id==='keys:note')),next=replaceLabCard(g,entry,{original:g});assert.deepEqual(g,before);assert.equal(next.catalog.cards.length,256);assert.equal(next.hand.length,5);assert.equal(new Set([...next.hand,...next.deck,...next.discard]).size,next.cards.length);assert.deepEqual(restoreBandLive(next),next);
 entry.effects[0].strikes=101;assert.throws(()=>replaceLabCard(g,entry,{original:g}),/Frappes/);assert.deepEqual(g,before,'A rejected draft cannot partially replace the card or its catalog');
});
test('live card edits update every copy without rewriting the crowd, turn or previous casts',()=>{
 const {g,c}=fixture();g.physics.hitStrength=0;assert(playCard(g,c.id,'f0').ok);g.tempo=7;g.boost=4;g.physics.force=610;const before=structuredClone(g),entry=structuredClone(g.catalog.cards.find(c=>c.id==='drums:note'));entry.name='Note en direct';entry.cost=0;entry.effects[0].amount=12;entry.starter=0;
 const result=applyShowCard(g,entry),next=result.game;assert.deepEqual(g,before);assert.equal(result.updated,before.cards.filter(c=>c.instrument==='drums'&&c.kind==='note').length);assert(!result.inserted);assert(next.hand.includes(result.cardId));
 for(const key of ['fans','physics','room','energy','tempo','turn','section','boost','relayBoosts','played','events','logs'])assert.deepEqual(next[key],before[key],key+' stays unchanged by a live edit');
 assert(next.cards.filter(c=>c.instrument==='drums'&&c.kind==='note').every(c=>c.definition.name==='Note en direct'&&c.definition.power===12&&c.definition.cost===0));assert.equal(next.catalog.cards.find(c=>c.id===entry.id).starter,3,'Current starter metadata stays valid independently of the draft');
 const preview=previewCard(next,result.cardId,'f0');assert(preview.ok);assert(playCard(next,result.cardId,'f0').ok);assert.deepEqual(next,preview.game);assert.equal(next.events.at(-1).name,'Note en direct');assert.deepEqual(restoreBandLive(next),next);
});
test('new and neutral live cards enter the current hand without growing decks or refunding resources',()=>{
 for(const instrument of ['keys','neutral']){
  const {g}=fixture();g.hand=g.cards.filter(c=>c.actorId===g.actors[0].id).map(c=>c.id);g.deck=g.cards.filter(c=>!g.hand.includes(c.id)).map(c=>c.id);g.energy=1;g.tempo=4;
  const entry=structuredClone(g.catalog.cards.find(c=>c.id==='keys:note'));Object.assign(entry,{id:'neutral:live-copy',instrument,cost:0,starter:5});delete entry.legacyKind;
  const before=structuredClone(g),result=applyShowCard(g,entry),next=result.game;assert.deepEqual(g,before);assert(result.inserted);assert.equal(next.hand.length,5);assert.equal(next.cards.length,g.cards.length);assert.equal(next.energy,1);assert.equal(next.tempo,4);assert(next.hand.includes(result.cardId));assert.equal(next.catalog.cards.find(c=>c.id===entry.id).starter,0);assert.equal(new Set([...next.hand,...next.deck,...next.discard]).size,next.cards.length);assert.deepEqual(restoreBandLive(next),next);
 }
});
test('live card edits can prepare a copy before the song starts',()=>{
 const world=createWorld(55,4);world.people[0].instrument='drums';const game=createBandLive({people:world.people,songs:[{id:'a',title:'A',style:'Jazz'}],spatial:true}),card=structuredClone(game.catalog.cards.find(c=>c.id==='keys:note'));card.effects[0].amount=12;
 const edited=applyShowCard(game,card).game;assert.equal(edited.phase,'choose');assert.equal(edited.hand.length,0);chooseSong(edited,'a');assert(edited.hand.some(id=>edited.cards.find(c=>c.id===id).definition.power===12),'The chosen copy is ready when the song begins');assert.deepEqual(restoreBandLive(edited),edited);assert.equal(game.catalog.cards.find(c=>c.id===card.id).effects[0].amount,6);
});
test('live card edits and injected cards resume inside the real world without changing future decks',()=>{
 const world=preparedConcert().world;beginBandLiveConcert(world);const game=world.performance.bandLive.game;chooseSong(game,game.songs[0].id);const catalog=structuredClone(world.cardCatalog);
 const entry=duplicateCard(structuredClone(catalog),'guitar:note');entry.effects[0].amount=4;entry.effects[0].impactStrength=0;entry.cost=0;const result=applyShowCard(game,entry);Object.assign(game,result.game);
 assert.deepEqual(restore(world).performance.bandLive.game,game);assert.deepEqual(world.cardCatalog,catalog);assert(playCard(game,result.cardId,'f0').ok);assert.deepEqual(restore(world).performance.bandLive.game,game);assert.deepEqual(world.cardCatalog,catalog);
});
test('live card edits reject incompatible instruments, invalid effects and finished or legacy shows atomically',()=>{
 const {g}=fixture(),before=structuredClone(g),entry=structuredClone(g.catalog.cards.find(c=>c.id==='drums:note'));entry.instrument='keys';assert.throws(()=>applyShowCard(g,entry),/instrument compatible/);assert.deepEqual(g,before);
 entry.instrument='drums';entry.effects[0].strikes=101;assert.throws(()=>applyShowCard(g,entry),/Frappes/);entry.effects[0].strikes=1;assert.throws(()=>applyShowCard({...g,phase:'won'},entry),/show physique en cours/);assert.throws(()=>applyShowCard({...g,spatialVersion:undefined},entry),/show physique en cours/);assert.deepEqual(g,before);
 const full=structuredClone(g);while(full.catalog.cards.length<256)duplicateCard(full.catalog,'sax:note');const extra={...entry,id:'drums:live-copy',starter:0};delete extra.legacyKind;const result=applyShowCard(full,extra);assert.equal(result.game.catalog.cards.length,256);assert.deepEqual(restoreBandLive(result.game),result.game);
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
