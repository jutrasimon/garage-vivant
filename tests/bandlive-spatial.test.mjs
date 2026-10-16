import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,restore} from '../dist/engine.mjs';
import {createBandLive,chooseSong,playCard,previewCard,restoreBandLive,impactCrowd} from '../dist/bandlive.mjs';
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
function collisionLine(game){for(const [i,f] of game.fans.entries())moveSpectator(game,f.id,i<3?{x:300+i*120,y:180}:{x:740+(i%3)*100,y:60+Math.floor((i-3)/3)*90});}
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
