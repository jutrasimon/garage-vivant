import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorld,createGroup,restore,step,decide,relationship,compositionProject,VERSION,removePerson} from '../dist/engine.mjs';
import {CARDS,CURSES,activeDeck,createPerformance,advancePerformance,SHOW_TICKS,validatePerformance} from '../dist/stage.mjs';
import {command,playTicks,completePerformance,advanceToBooking,groupRehearsal,lifeMinute,newSeason,learningGain,isArchivedSong} from '../dist/life.mjs';
const copy=x=>JSON.parse(JSON.stringify(x));
// A real V4 save preserves skills, project progress, music-session knowledge and history.
const legacy=JSON.parse(readFileSync(new URL('./v04-world.json',import.meta.url)));
const migrated=restore(legacy);assert.equal(migrated.version,VERSION);assert.equal(migrated.time,legacy.time);
assert.deepEqual(migrated.songs,legacy.songs);assert.deepEqual(migrated.projects,legacy.projects);assert.deepEqual(migrated.activities,legacy.activities);assert.deepEqual(migrated.rels,legacy.rels);
for(let i=0;i<legacy.people.length;i++){const a=migrated.people[i],b=legacy.people[i];assert.deepEqual(a.skills,b.skills);assert.deepEqual(a.actionCounts,b.actionCounts);assert.deepEqual(a.draft,b.draft);assert.deepEqual(a.needs,b.needs);assert.deepEqual(a.memories,b.memories);}
assert.equal(migrated.groups[0].name,legacy.groups[0].name);assert.equal(migrated.groups[0].repertoire.length,0);
const future=restore(copy(migrated));step(migrated,350);step(future,350);assert.deepEqual(migrated,future);

function prepared(seed=205,count=4){
 const s=createWorld(seed,count);
 for(const p of s.people){p.needs.energy=100;for(const k in p.priorities)p.priorities[k]=0;p.priorities.sleep=2;decide(s,p,'sleep');}
 const p=s.people[0];let id;
 for(let n=0;n<8&&!s.songs.length;n++){p.needs.energy=100;decide(s,p,'write');id=compositionProject(s,p).id;const completed=p.actionCounts.write.completed;for(let t=0;t<220&&p.actionCounts.write.completed===completed;t++)step(s);}
 assert(s.songs.length);const song=s.songs[0],g=createGroup(s,s.people.map(p=>p.id),{manual:true});
 for(const a of s.people)for(const b of s.people)if(a!==b)Object.assign(relationship(s,a,b),{affinity:80,trust:85,tension:0});
 assert(command(s,{type:'repertoire',groupId:g.id,songId:song.id}).ok);
 return {s,g,song};
}
const {s,g,song}=prepared();const snapshot=copy(s);
assert.equal(g.repertoire[0].mastery,0);assert(!command(s,{type:'repertoire',groupId:g.id,songId:99999}).ok);
// Five unique cards, reactions bounded to one per spectator, stable results at any playback rate.
for(const n of [2,4,10,24]) {
 const cast=createWorld(8,n),band=createGroup(cast,cast.people.map(p=>p.id),{manual:true});band.development=70;band.repertoire=[{songId:song.id,mastery:70}];
 const show=createPerformance({id:'test',seed:902,people:cast.people,group:band,song,opportunity:{id:'o',name:'Test',styles:['Indie','Ska'],crowd:12}});
 for(const p of show.actors){assert(p.deck.length>=8&&p.deck.length<=10);assert.equal(new Set(p.hand).size,5);assert(p.hand.every(id=>p.deck.includes(id)));}
 const fast=copy(show),slow=copy(show);advancePerformance(fast,SHOW_TICKS);while(slow.status==='playing')advancePerformance(slow,7);assert.deepEqual(slow,fast);
 assert.equal(fast.events.filter(e=>e.type==='card').length,n*5);assert(fast.events.filter(e=>e.type==='reaction').length<=12);assert(new Set(fast.events.filter(e=>e.type==='reaction').map(e=>e.fanId)).size===fast.events.filter(e=>e.type==='reaction').length);validatePerformance(fast);
}
const setup={id:'prepared',seed:17,people:s.people,group:g,song,opportunity:{id:'o',name:'Test',styles:['Indie'],crowd:10}};
const weak=createPerformance(setup);g.development=80;g.repertoire[0].mastery=90;const strong=createPerformance(setup);advancePerformance(weak,SHOW_TICKS);advancePerformance(strong,SHOW_TICKS);assert(strong.result.score>weak.result.score,'Rehearsal and coordination must affect actual crowd results');
// Same seed and same hand in replay, with no duplicate world rewards.
assert(command(s,{type:'preview',groupId:g.id,songId:song.id}).ok);const previewStart=copy(s.performance);playTicks(s,SHOW_TICKS);const originalEvents=copy(s.performance.events);assert.equal(s.showHistory.length,0);assert(!completePerformance(s));assert(command(s,{type:'replay'}).ok);assert.deepEqual(s.performance.actors.map(p=>p.hand),previewStart.actors.map(p=>p.hand));playTicks(s,SHOW_TICKS);assert.deepEqual(s.performance.events,originalEvents);assert.equal(s.showHistory.length,0);

// Actual reservations, physical arrival, frozen world during show, restore midway and one application.
const booked=prepared(888),op=booked.s.season.opportunities.find(o=>o.time>booked.s.time);let reservation;
for(let i=0;i<6&&!reservation?.ok;i++)reservation=command(booked.s,{type:'book',groupId:booked.g.id,songId:booked.song.id,opportunityId:op.id,intention:'tight'});
assert(reservation.ok);assert(advanceToBooking(booked.s,reservation.bookingId).ok);assert.equal(booked.s.performance.status,'playing');const clock=booked.s.time;step(booked.s,500);assert.equal(booked.s.time,clock);playTicks(booked.s,480);const restored=restore(copy(booked.s));playTicks(booked.s,SHOW_TICKS);playTicks(restored,SHOW_TICKS);assert.deepEqual(booked.s,restored);assert.equal(booked.s.showHistory.length,1);const fame=booked.s.people[0].showFame;assert(!completePerformance(booked.s));assert.equal(booked.s.people[0].showFame,fame);assert.equal(booked.s.bookings[0].status,'played');assert(booked.g.reputation>0);assert.equal(op.status,'played');assert(booked.s.people.every(p=>!p.engagement));restore(booked.s);

// Real incompatible commitments produce a refusal and tension, rather than penalizing membership.
const overlap=prepared(222,4),[a,b,c,d]=overlap.s.people;const other=createGroup(overlap.s,[a.id,c.id,d.id],{manual:true});command(overlap.s,{type:'repertoire',groupId:other.id,songId:overlap.song.id});const occasion=overlap.s.season.opportunities.find(o=>o.time>overlap.s.time);let first;
for(let n=0;n<8&&!first?.ok;n++)first=command(overlap.s,{type:'book',groupId:overlap.g.id,songId:overlap.song.id,opportunityId:occasion.id,intention:'tight',members:[a.id,b.id]});assert(first.ok);
const refused=command(overlap.s,{type:'book',groupId:other.id,songId:overlap.song.id,opportunityId:occasion.id,intention:'tight',members:[a.id,c.id]});assert(!refused.ok);assert(refused.refused.some(r=>r.id===a.id&&r.reason.includes('engagé')));assert(overlap.s.events.some(e=>e.type==='conflict'&&e.text.includes('incompatible')));

// Several independent bands share a local bill. A first set cannot close the season
// or erase another band's confirmed booking; departures preserve that same bill.
assert(command(overlap.s,{type:'avatar',actorId:c.id}).ok);let second;
for(let n=0;n<8&&!second?.ok;n++)second=command(overlap.s,{type:'book',groupId:other.id,songId:overlap.song.id,opportunityId:occasion.id,intention:'tight',members:[c.id,d.id]});assert(second.ok);
const departure=restore(copy(overlap.s));removePerson(departure,a.id);assert.equal(departure.bookings.find(b=>b.id===first.bookingId).status,'cancelled');assert.equal(departure.season.opportunities.find(o=>o.id===occasion.id).status,'booked');restore(departure);
for(const o of overlap.s.season.opportunities)if(o!==occasion)o.status='missed';
assert(advanceToBooking(overlap.s,first.bookingId).ok);playTicks(overlap.s,SHOW_TICKS);assert.equal(occasion.status,'booked');assert.equal(overlap.s.season.ended,false);assert(!newSeason(overlap.s).ok);
step(overlap.s,1);assert.equal(overlap.s.performance.status,'playing');playTicks(overlap.s,SHOW_TICKS);assert.equal(overlap.s.showHistory.length,2);assert.equal(occasion.status,'played');assert.equal(overlap.s.season.ended,true);restore(overlap.s);

const emptyBand=createWorld(63,3),former=emptyBand.people.slice(0,2).map(p=>p.id),oldBand=createGroup(emptyBand,former,{manual:true});for(const id of former)removePerson(emptyBand,id);assert(emptyBand.groups.includes(oldBand));assert.equal(oldBand.members.length,0);assert.equal(oldBand.alumni.length,2);assert(oldBand.archivedAt!==null);restore(emptyBand);

// Group credit needs actual presence and an unambiguous group. A multi-band pair cannot credit both.
const rehearsal=prepared(555,3),pair=rehearsal.s.people.slice(0,2),band2=createGroup(rehearsal.s,pair.map(p=>p.id),{manual:true});const j={id:'isolated',groupId:null,songId:null,elapsed:1};const before=rehearsal.g.development;groupRehearsal(rehearsal.s,j,pair);assert.equal(rehearsal.g.development,before);assert.equal(j.groupId,null);j.groupId=rehearsal.g.id;j.songId=rehearsal.song.id;groupRehearsal(rehearsal.s,j,pair);assert(rehearsal.g.development>before);assert(rehearsal.g.repertoire[0].mastery>0);const mastery=rehearsal.g.repertoire[0].mastery;groupRehearsal(rehearsal.s,j,pair.slice(0,1));assert.equal(rehearsal.g.repertoire[0].mastery,mastery);
rehearsal.g.development=.1;rehearsal.g.lastWorked=0;rehearsal.s.time=60*100;lifeMinute(rehearsal.s);assert(rehearsal.g.archivedAt!==null);assert(rehearsal.s.groups.includes(rehearsal.g));assert(command(rehearsal.s,{type:'revive',groupId:rehearsal.g.id}).ok);assert.equal(rehearsal.g.archivedAt,null);

// Deck curses occupy slots and cannot be removed by equipment edits; recovery removes them.
const musician=s.people[0];musician.decadence=90;assert.equal(activeDeck(musician).filter(id=>CARDS[id].tag==='curse').length,4);const count=activeDeck(musician).length;assert(!command(s,{type:'deck',cards:['absent']}).ok);assert.equal(activeDeck(musician).length,count);musician.decadence=25.01;musician.needs.energy=100;decide(s,musician,'sleep');musician.action.route=[];step(s,10);assert(musician.decadence<25);assert(!activeDeck(musician).some(id=>CARDS[id].tag==='curse'));
assert(learningGain(musician,musician.instrument,1)>0);musician.skills[musician.instrument]=90;const high=learningGain(musician,musician.instrument,1);musician.skills[musician.instrument]=20;assert(learningGain(musician,musician.instrument,1)>high);

// A lone socializer gains relaxation, never free social fulfillment, and gets a session-level frustration.
const alone=createWorld(314,2);for(const p of alone.people){p.priorities.social=0;p.priorities.jam=0;decide(alone,p,'sleep');p.action.route=[];p.place='home1';p.needs.energy=100;}
const loner=alone.people[0];loner.needs.social=20;decide(alone,loner,'social');loner.action.route=[];loner.place='park';const social=loner.needs.social;step(alone,50);assert(loner.needs.social<social);assert(alone.events.some(e=>e.text.includes('repart déçu')));

// Archives are reversible and never truncate the catalogue, including legacy music.
const archive=restore(snapshot),historicalCount=archive.songs.length;assert(command(archive,{type:'archive',songId:archive.songs[0].id}).ok);assert(isArchivedSong(archive,archive.songs[0].id));assert.equal(archive.songs.length,historicalCount);assert(command(archive,{type:'archive',songId:archive.songs[0].id,restore:true}).ok);assert(!isArchivedSong(archive,archive.songs[0].id));
for(const o of archive.season.opportunities)o.status='missed';archive.season.ended=true;const oldCatalogue=copy(archive.songs),oldSkills=copy(archive.people[0].skills);assert(newSeason(archive).ok);assert.deepEqual(archive.songs,oldCatalogue);assert.deepEqual(archive.people[0].skills,oldSkills);assert(!archive.season.ended);restore(archive);
const broken=copy(archive);broken.people[0].decadence=101;assert.throws(()=>restore(broken));const badHand=copy(booked.s);badHand.performance.actors[0].hand[1]=badHand.performance.actors[0].hand[0];assert.throws(()=>restore(badHand));
console.log('V5 passed: V4 preservation, deterministic 2–24-member shows, physical bounded chains, actual preparation effects, replay, live save, no double reward, competing commitments, rehearsal ownership, group archives, curses/recovery, social presence and reversible catalogue.');
