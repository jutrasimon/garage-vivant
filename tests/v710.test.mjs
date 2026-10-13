import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createGroup,restore,removePerson,step,decide,log,relationship} from '../dist/engine.mjs';
import {groupsMinute,proposeMembership} from '../dist/groups.mjs';
import {groupContext} from '../dist/life.mjs';
import {GROUP_RULES as R} from '../dist/group-rules.mjs';
import {readMapOptions,MAP_DEFAULTS} from '../dist/map-options.mjs';

test('Starting bands vary reproducibly, fit the population and survive serialization',()=>{
 const counts=new Set();for(let seed=1;seed<=20;seed++){
 const s=createWorld(seed,8,{setup:'varied'});counts.add(s.groups.length);assert(s.groups.length>=1&&s.groups.length<=4);
 assert.equal(new Set(s.groups.flatMap(g=>g.members)).size,s.groups.flatMap(g=>g.members).length);
 assert(s.groups.every(g=>g.members.length>=2&&g.development>=35&&g.development<=50&&g.origin==='départ'));
 assert(s.songs.length===(s.groups.length===1?2:3)||s.groups.length>1&&s.songs.length===4);assert.deepEqual(restore(s),s);assert.deepEqual(createWorld(seed,8,{setup:'varied'}),s);
 }assert.equal(counts.size,2);
 for(const count of [2,3,4,8,24])for(const setup of ['none','large','medium','small','varied'])assert.doesNotThrow(()=>restore(createWorld(761,count,{setup})));
 assert.equal(createWorld(1,8,{setup:'none'}).groups.length,0);
});
test('Nicknames and all appearance properties persist without rerolling a legacy save',()=>{
 const s=createWorld(76);const p=s.people[0];p.name='Renée';p.nickname='La Basse';p.color='#aabbcc';Object.assign(p.identity,{accessory:'glasses',accent:'scarf',movement:'flamboyant'});
 assert.deepEqual(restore(s),s);const invalid=structuredClone(s);invalid.people[0].nickname=42;assert.throws(()=>restore(invalid));
 invalid.people[0].nickname='';invalid.people[0].identity.accent='invented';assert.throws(()=>restore(invalid));
 delete p.nickname;assert.deepEqual(restore(s),s);
});
test('Removal preserves authorship and archives and refuses an ongoing show atomically',()=>{
 const s=createWorld(762,3);const [p,q]=s.people;const g=createGroup(s,[p.id,q.id],{manual:true});decide(s,p,'write');
 const work=s.projects.find(x=>x.authors.includes(p.id));p.name='Nom final';
 s.performance={status:'playing'};const before=structuredClone(s);assert.equal(removePerson(s,p.id).ok,false);assert.deepEqual(s,before);s.performance=null;
 assert(removePerson(s,p.id).ok);assert.equal(g.state,'dissolved');assert.equal(g.alumni.find(x=>x.id===p.id).name,'Nom final');
 if(work)assert.equal(work.authorNames[p.id],'Nom final');assert(!s.people.some(x=>x.id===p.id));assert.deepEqual(restore(s),s);step(s,60);assert.doesNotThrow(()=>restore(s));
 removePerson(s,q.id);assert.equal(removePerson(s,s.people[0].id).ok,false);
});
test('Display options ignore malformed preferences and formation is raised by exactly 12.5 percent',()=>{
 assert.deepEqual(readMapOptions({getItem:()=>'{'}),MAP_DEFAULTS);
 const prefs=readMapOptions({getItem:()=>JSON.stringify({actions:false,collective:true,names:'bad'})});assert.equal(prefs.actions,false);assert.equal(prefs.collective,true);assert.equal(prefs.names,true);
 assert(Math.abs(R.proposal/.28-1.125)<1e-10);assert(R.fragileRehearsalChance>R.rehearsalChance);assert.equal(R.departureGrace,4320);
});

test('Fragile bands make real practice calls more often without duplicating invitations or inventing songs',()=>{
 const s=createWorld(763,4),g=createGroup(s,s.people.map(p=>p.id),{manual:true});
 g.nextAdoption=1e12;g.nextPractice=s.time;g.development=30;
 const ctx={...groupContext(s),random:()=>.6};groupsMinute(s,ctx);assert.equal(s.groupState.requests.length,0);
 const song={id:1,ownerGroupId:g.id,quality:50,genre:g.genre};s.songs.push(song);g.repertoire.push({songId:1,mastery:0,active:true});
 g.nextPractice=s.time;groupsMinute(s,ctx);assert.equal(s.groupState.requests.length,1);assert.equal(g.development,30);
 g.nextPractice=s.time;groupsMinute(s,ctx);assert.equal(s.groupState.requests.length,1);
 s.groupState.requests[0].status='closed';g.development=50;g.nextPractice=s.time;groupsMinute(s,ctx);assert.equal(s.groupState.requests.length,1);
});

test('Recruitment never rewrites historical event participants, including after reload',()=>{
 const s=createWorld(764,3),[a,b,c]=s.people,g=createGroup(s,[a.id,b.id],{manual:true});
 const ev=log(s,'group','La formation actuelle',g.members),before=[...ev.ids];
 for(const p of s.people)for(const q of s.people)if(p!==q)Object.assign(relationship(s,p,q),{affinity:80,tension:0});
 const twin=restore(s);
 for(const world of [s,twin])assert(proposeMembership(world,world.people[0],world.people[2],world.groups[0],{...groupContext(world),random:()=>0}).ok);
 assert.deepEqual(ev.ids,before);assert.deepEqual(s,twin);
});
