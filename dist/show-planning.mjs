import {eligibleSongs,availability,performanceSong} from './life.mjs?v=0.5.1';

// One shared preparation model for the screen and its commands. Viewing it never
// changes the world: invitations, repertoire and bookings remain explicit commands.
export function resolveShowPlan(s,plan){
 const groups=s.groups.filter(g=>g.archivedAt===null&&g.members.length);
 if(!groups.some(g=>g.id===plan.groupId)){plan.groupId=groups.find(g=>g.members.includes(s.playerId))?.id||groups[0]?.id||null;plan.songId=undefined;plan.members=null;plan.actorId=null;}
 const group=groups.find(g=>g.id===plan.groupId);
 if(!group)return {groups,group:null,songs:[],openings:[],members:[],ready:false,reason:'Crée un band ou relance un groupe archivé pour jouer.'};
 if(!group.members.includes(plan.actorId))plan.actorId=group.members.includes(s.playerId)?s.playerId:group.members[0];
 const songs=eligibleSongs(s,group).sort((a,b)=>Number(group.repertoire.some(r=>r.songId===b.id))-Number(group.repertoire.some(r=>r.songId===a.id))||b.quality-a.quality);
 if(plan.songId===undefined)plan.songId=songs[0]?.id??null;
 if(plan.songId!==null&&!songs.some(song=>song.id===plan.songId))plan.songId=null;
 plan.members=[...new Set([plan.actorId,...(plan.members||group.members)])].filter(id=>group.members.includes(id));
 const pending=s.bookings.filter(b=>['booked','assembling','playing'].includes(b.status));
 const openings=s.season.opportunities.filter(o=>o.time>s.time&&['open','booked'].includes(o.status)||pending.some(b=>b.groupId===group.id&&b.opportunityId===o.id));
 if(!openings.some(o=>o.id===plan.opportunityId))plan.opportunityId=openings[0]?.id||null;
 const opportunity=openings.find(o=>o.id===plan.opportunityId),booking=pending.find(b=>b.groupId===group.id&&b.opportunityId===plan.opportunityId);
 const members=plan.members.map(id=>s.people.find(p=>p.id===id)).filter(Boolean),song=performanceSong(s,group,plan.songId),available=members.filter(p=>opportunity&&availability(s,p,opportunity.time).available);
 const host=members.find(p=>p.id===plan.actorId),hostAvailable=host&&opportunity&&availability(s,host,opportunity.time).available;
 const reason=booking?'Ce show est réservé. Tu peux l’annuler ou avancer jusqu’à la scène.':!opportunity?'Plus de date à venir : lance une nouvelle saison.':members.length<2?'Choisis au moins deux musiciens.':!hostAvailable?'L’organisateur a déjà un engagement à cette heure.':available.length<2?'Il faut au moins deux musiciens sans engagement concurrent.':'';
 return {groups,group,songs,openings,opportunity,booking,members,song,host,available,ready:!reason,reason};
}
