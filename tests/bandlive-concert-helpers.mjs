import {readFileSync} from 'node:fs';
import {createWorld,createGroup,decide,relationship,restore} from '../dist/engine.mjs';
import {command,advanceToBooking} from '../dist/life.mjs';
import {selectBands} from '../dist/calendar.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {newBag} from '../dist/v7.mjs';

const template=restore(JSON.parse(readFileSync(new URL('v071-world.json',import.meta.url)))).songs[0];
export function preparedConcert({instruments=['guitar','drums','bass','sax'],setlistLength=2,intention='tight',venue='g1',large=false,following=false,followingComposed=false,legacyBandLive=false}={}) {
  const world=createWorld(39,Math.max(8,instruments.length));
  for(const [i,p] of world.people.entries()){
    if(instruments[i])p.instrument=instruments[i];
    p.decadence=0;p.needs.energy=100;p.personality.discipline=95;
    decide(world,p,'relax');p.bag=newBag();
    for(const field of ['composition','cycleComposition','remaining'])p.bag[field]={relax:10,social:0,practice:0,jam:0,write:0,decadence:0};
    for(const q of world.people)if(p!==q)Object.assign(relationship(world,p,q),{affinity:95,tension:0});
  }
  const group=createGroup(world,world.people.slice(0,instruments.length).map(p=>p.id),{manual:true,name:'Les Cubes du Canal'});
  const next=following?createGroup(world,world.people.slice(instruments.length,instruments.length+2).map(p=>p.id),{manual:true,name:'Les Voisins'}):null;
  for(const g of [group,next].filter(Boolean)){g.development=70;g.nextPractice=g.nextAdoption=g.nextBookingAttempt=1e12;for(const m of Object.values(g.memberships))m.nextCheck=1e12;}
  world.songs=Array.from({length:Math.max(1,setlistLength)},(_,i)=>({...structuredClone(template),id:i+1,projectId:null,title:['La mémoire du canal','Les rues de verre','Un écho dans la ville'][i]||'Chanson '+i,genre:i%2?'Pop':'Indie',groupId:group.id,ownerGroupId:group.id,adoptedAt:world.time}));
  world.nextSongId=world.songs.length+1;
  group.repertoire=world.songs.map(s=>({songId:s.id,mastery:60,rehearsals:0,active:true}));
  const opportunity=world.season.opportunities[large?3:0];
  Object.assign(opportunity,{time:world.time+240,day:Math.floor((world.time+240)/1440)+1,venue,final:large,crowd:large?24:12,styles:['Indie','Folk','Pop'],selectionAt:world.time+120});
  let booked;
  for(let i=0;i<80;i++){
    booked=command(world,{type:'book',actorId:group.members[0],groupId:group.id,opportunityId:opportunity.id,slotId:opportunity.slots[0].id,setlist:world.songs.map(s=>s.id),members:group.members,intention});
    if(booked.ok){const b=world.bookings.find(b=>b.id===booked.bookingId);if(b.members.length===instruments.length)break;command(world,{type:'cancelBooking',actorId:group.members[0],bookingId:b.id});}
  }
  if(!booked?.ok)throw Error('Could not reserve test concert.');
  if(next){
    let nextSong=null;
    if(followingComposed){nextSong=world.nextSongId++;world.songs.push({...structuredClone(template),id:nextSong,projectId:null,title:'Le retour des voisins',genre:'Pop',groupId:next.id,ownerGroupId:next.id,adoptedAt:world.time});next.repertoire=[{songId:nextSong,mastery:60,rehearsals:0,active:true}];}
    let other;for(let i=0;i<40&&!other?.ok;i++)other=command(world,{type:'book',actorId:next.members[0],groupId:next.id,opportunityId:opportunity.id,slotId:opportunity.slots[1].id,setlist:[nextSong],members:next.members,intention:'tight'});if(!other.ok)throw Error('Could not reserve following band.');
  }
  if(large)selectBands(world,opportunity);
  const arrived=advanceToBooking(world,booked.bookingId);
  if(!arrived.ok||world.performance?.groupId!==group.id)throw Error('Musicians did not arrive at their concert.');
  if(legacyBandLive)beginBandLiveConcert(world,{spatial:false});
  restore(world);
  return {world,groupId:group.id,bookingId:booked.bookingId,opportunityId:opportunity.id};
}
