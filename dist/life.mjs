import {clamp,round,rand,log,feel,decide,relationship,createGroup,formationEligible,PLACES,GENRES,ACTIONS,step,refreshReputation} from './engine.mjs';
import {CARDS,CURSES,INTENTIONS,defaultDeck,availableCards,createPerformance,advancePerformance,validatePerformance} from './stage.mjs';

export function initializePerson(p) {
  const index=Number(p.id.slice(1));
  p.identity={accessory:['hair','glasses','cap','brows','moustache','earring'][index%6],accent:index%3===0?'scarf':null,movement:p.personality.outgoing>65?'flamboyant':p.traits.includes('shy')?'shy':p.personality.stable<40?'nervous':'calm'};
  p.decadence=0;p.decadenceHistory=[];p.deck=defaultDeck(p);p.showFame=0;p.invitationCooldown={};p.engagement=null;
}
export function initializeGroup(g,time) {
  Object.assign(g,{development:18,reputation:0,lastWorked:time,archivedAt:null,repertoire:[],moments:[],shows:[],alumni:[]});
}
export function initializeLife(s) {
  s.playerId=s.people[0]?.id||null;s.bookings=[];s.nextBookingId=1;s.nextPerformanceId=1;s.performance=null;s.showHistory=[];
  s.archiveThreshold=25;s.songArchive=[];
  s.season={started:s.time,ended:false,endedAt:null,opportunities:[
    {id:'o1',name:'La cour des voisins',venue:'g1',day:2,styles:['Indie','Folk','Pop'],crowd:8},
    {id:'o2',name:'Les Amplis au parc',venue:'park',day:4,styles:['Ska','Jazz','Électro'],crowd:10},
    {id:'o3',name:'Une nuit au Canal',venue:'g2',day:6,styles:['Punk','Métal','Indie'],crowd:12},
    {id:'o4',name:'Finale · Fête des Érables',venue:'g1',day:8,styles:['Pop','Indie','Ska','Folk'],crowd:12,final:true}
  ].map(o=>({...o,time:s.time+(o.day-1)*1440+600,status:'open',bookingId:null}))};
}
export function upgradeLife(s) {
  for(const p of s.people) initializePerson(p);
  for(const g of s.groups) initializeGroup(g,s.time);
  initializeLife(s);
  log(s,'system','V0.5 : saison locale, shows à cartes, déchéance et répertoire. Compétences, chansons et souvenirs conservés.');
}
export function bandStage(g) {return g.archivedAt!==null?'Archivé':g.development<25?'Embryonnaire':g.development<50?'En place':g.development<75?'Rodé':'Affirmé';}
export function nextCurse(p) {return CURSES.find(c=>c.threshold>p.decadence)||null;}
export function learningGain(p,key,gain) {return gain*Math.max(.16,1-p.skills[key]/115);}
export function changeDecadence(s,p,amount,reason) {
  const before=p.decadence;p.decadence=clamp(before+amount);
  if(Math.abs(amount)>=1) {p.decadenceHistory.unshift({time:s.time,amount:Math.round((p.decadence-before)*10)/10,reason});p.decadenceHistory=p.decadenceHistory.slice(0,8);}
  const previous=CURSES.filter(c=>before>=c.threshold).length,current=CURSES.filter(c=>p.decadence>=c.threshold).length;
  if(current!==previous) log(s,'decadence',`${p.name} : ${current>previous?'un seuil de déchéance ajoute une carte maudite':'la récupération retire une carte maudite'}.`,[p.id],{explanation:reason});
}
export function archiveSong(s,song) {
  if(song.quality<s.archiveThreshold&&!s.songArchive.some(x=>x.id===song.id)) s.songArchive.push({id:song.id,time:s.time,reason:`Qualité ${song.quality} sous le seuil ${s.archiveThreshold}`,auto:true});
}
export function isArchivedSong(s,id) {return s.songArchive.some(x=>x.id===id);}
export function eligibleSongs(s,g) {return s.songs.filter(song=>song.authors.some(id=>g.members.includes(id)));}
export function groupRehearsal(s,j,present) {
  const common=s.groups.filter(g=>g.archivedAt===null&&present.every(p=>g.members.includes(p.id)));
  if(!j.groupId&&common.length===1) j.groupId=common[0].id;
  const g=s.groups.find(g=>g.id===j.groupId&&g.archivedAt===null);
  if(!g || present.length<2 || present.some(p=>!g.members.includes(p.id))) return;
  g.lastWorked=s.time;g.development=clamp(g.development+.07*Math.min(1,present.length/4));
  if(!j.songId&&!g.members.includes(s.playerId)&&g.repertoire.length)j.songId=[...g.repertoire].sort((a,b)=>b.mastery-a.mastery)[0].songId;
  const row=g.repertoire.find(r=>r.songId===j.songId);
  if(row) row.mastery=clamp(row.mastery+.12*(.65+g.development/200)*Math.min(1,present.length/g.members.length));
  if(j.elapsed===85) {if(row)row.rehearsals++;g.moments.unshift({time:s.time,type:'rehearsal',text:row?`Répétition de « ${s.songs.find(x=>x.id===row.songId)?.title} »`:'Jam commune',participants:present.map(p=>p.id)});g.moments=g.moments.slice(0,12);}
}
function result(ok,message,extra={}) {return {ok,message,...extra};}
export function acceptance(s,host,target,group=null) {
  const r=relationship(s,target,host);
  return clamp(.53+r.affinity*.004+r.trust*.002-r.tension*.004-target.decadence*.002+(group?.development||0)*.0015,.1,.97);
}
export function availability(s,p,time,duration=100) {
  const conflict=s.bookings.find(b=>['booked','assembling','playing'].includes(b.status)&&b.members.includes(p.id)&&Math.abs(b.time-time)<duration);
  return conflict?{available:false,reason:`Déjà engagé avec ${s.groups.find(g=>g.id===conflict.groupId)?.name||'un autre band'}`,booking:conflict}:{available:true,reason:p.decadence>=85?'Fiabilité fragile : risque d’absence':'Disponible'};
}
function invite(s,cmd) {
  const host=s.people.find(p=>p.id===cmd.actorId),target=s.people.find(p=>p.id===cmd.targetId),g=cmd.groupId?s.groups.find(g=>g.id===cmd.groupId&&g.archivedAt===null):null;
  if(!host||!target||host===target||cmd.groupId&&(!g||!g.members.includes(host.id))) return result(false,'Invitation impossible.');
  if(g?.members.includes(target.id)) return result(false,'Ce musicien est déjà membre.');
  const key=g?.id||host.id,until=target.invitationCooldown[key]||0;
  if(until>s.time) return result(false,`Nouvelle invitation possible dans ${round((until-s.time)/60*10)/10} h.`);
  const chance=acceptance(s,host,target,g),accepted=rand(s)<chance;
  const ev=log(s,'group',accepted?`${target.name} accepte de jouer avec ${host.name}.`:`${target.name} décline l’invitation de ${host.name}.`,[host.id,target.id],{outcome:accepted?'accepted':'rejected',explanation:`Affinité, confiance, tensions et fiabilité : ${round(chance*100)} % de chances.`,chance});
  if(!accepted) {target.invitationCooldown[key]=s.time+360;feel(s,host,{sadness:5},ev);return result(false,'Invitation déclinée. Délai de 6 h avant de réinviter.',{chance});}
  let group=g;
  if(group) group.members.push(target.id);else {group=createGroup(s,[host.id,target.id],{manual:true,name:cmd.name||null});group.origin='player';}
  feel(s,target,{excitement:8,affection:4},ev);return result(true,`${target.name} rejoint ${group.name}.`,{groupId:group.id,chance});
}
function rehearse(s,cmd) {
  const g=s.groups.find(g=>g.id===cmd.groupId&&g.archivedAt===null),host=s.people.find(p=>p.id===cmd.actorId);
  if(!g||!host||!g.members.includes(host.id)) return result(false,'Choisis un band dont tu fais partie.');
  if(cmd.songId!==null&&!g.repertoire.some(r=>r.songId===Number(cmd.songId))) return result(false,'Cette chanson ne fait pas partie du répertoire.');
  const partners=g.members.map(id=>s.people.find(p=>p.id===id)).filter(p=>p&&p.id!==host.id&&p.needs.energy>=25&&!p.engagement&&p.priorities.jam>0&&(!p.action||['practice','social','relax','jam'].includes(p.action.key)));
  if(host.needs.energy<15||host.engagement||!partners.length) return result(false,'Pas de partenaire disponible et reposé.');
  const chosen=partners.filter(p=>rand(s)<acceptance(s,host,p,g));
  if(!chosen.length) return result(false,'Les membres disponibles préfèrent poursuivre leur activité.');
  decide(s,host,'jam',{newSession:true,groupId:g.id,songId:cmd.songId===null?null:Number(cmd.songId),noInvite:true});
  const sid=host.action.sessionId,j=s.jams.find(j=>j.id===sid);j.groupId=g.id;j.songId=cmd.songId===null?null:Number(cmd.songId);
  for(const p of chosen) {decide(s,p,'jam',{sessionId:sid,noInvite:true});p.action.why=`Répétition acceptée avec ${g.name}`;}
  host.action.why=`Répétition de ${g.name}`;
  log(s,'jam',`${g.name} se donne rendez-vous : ${chosen.length+1} musiciens, ${j.songId?s.songs.find(x=>x.id===j.songId)?.title:'jam libre'}.`,[host.id,...chosen.map(p=>p.id)],{activityId:sid,groupId:g.id});
  return result(true,'Rendez-vous lancé. La répétition commence avec deux membres sur place.');
}
function book(s,cmd) {
  const g=s.groups.find(g=>g.id===cmd.groupId&&g.archivedAt===null),host=s.people.find(p=>p.id===cmd.actorId),o=s.season.opportunities.find(o=>o.id===cmd.opportunityId),song=s.songs.find(song=>song.id===Number(cmd.songId));
  if(!host||!g||!g.members.includes(host.id)||!o||!['open','booked'].includes(o.status)||o.time<=s.time||!INTENTIONS[cmd.intention]||!song||!g.repertoire.some(r=>r.songId===song.id)) return result(false,'Choisis un band actif, une chanson de son répertoire et une occasion à venir.');
  if(s.bookings.some(b=>b.groupId===g.id&&b.opportunityId===o.id&&['booked','assembling','playing'].includes(b.status)))return result(false,'Ce band a déjà un engagement sur cette occasion.');
  const requested=[...new Set(cmd.members||g.members)].filter(id=>g.members.includes(id));
  if(!requested.includes(host.id)||requested.length<2) return result(false,'Il faut ton musicien et au moins un partenaire.');
  const members=[],refused=[];
  for(const id of requested) {
    const p=s.people.find(p=>p.id===id),state=p&&availability(s,p,o.time);
    if(!p)continue;
    if(!state.available) {refused.push({id,reason:state.reason});if(id!==host.id){const r=relationship(s,p,host);r.tension=clamp(r.tension+4);log(s,'conflict',`${p.name} doit choisir entre deux engagements : ${state.reason}.`,[p.id,host.id]);}continue;}
    if(id!==host.id&&rand(s)>=acceptance(s,host,p,g)) {refused.push({id,reason:'Préfère ne pas s’engager cette fois'});continue;}
    members.push(id);
  }
  if(refused.some(r=>r.id===host.id))log(s,'conflict',`${host.name} renonce à un engagement incompatible avec son autre band.`,[host.id],{explanation:refused.find(r=>r.id===host.id).reason});
  if(!members.includes(host.id)||members.length<2) return result(false,'La formation n’a pas deux confirmations. Essaie d’autres membres ou une autre occasion.',{refused});
  const b={id:`b${s.nextBookingId++}`,groupId:g.id,songId:song.id,opportunityId:o.id,time:o.time,intention:cmd.intention,members,status:'booked',refused,created:s.time,performanceId:null};s.bookings.push(b);o.status='booked';o.bookingId=b.id;
  log(s,'booking',`${g.name} réserve « ${o.name} » : ${members.length} confirmations.`,members,{groupId:g.id,bookingId:b.id,explanation:refused.map(r=>`${s.people.find(p=>p.id===r.id)?.name} : ${r.reason}`).join(' · ')});
  return result(true,`${o.name} réservé. ${members.length} musiciens confirmés.`,{bookingId:b.id,refused});
}
export function command(s,cmd) {
  if(!cmd||typeof cmd.type!=='string') return result(false,'Commande invalide.');
  if(s.performance?.status==='playing' && !['avatar'].includes(cmd.type)) return result(false,'Le show est en cours. Les décisions reprennent au bilan.');
  const actor=s.people.find(p=>p.id===(cmd.actorId||s.playerId));
  if(!actor) return result(false,'Musicien introuvable.');
  cmd={...cmd,actorId:actor.id};
  switch(cmd.type) {
    case 'avatar': s.playerId=actor.id;return result(true,`Tu incarnes ${actor.name}.`);
    case 'action':
      if(!ACTIONS[cmd.key])return result(false,'Action inconnue.');
      if(actor.engagement)return result(false,'Ce musicien est en route vers un show.');
      if(actor.needs.energy<15&&cmd.key!=='sleep')return result(false,'Énergie critique : il faut se reposer.');
      if(actor.id!==s.playerId&&cmd.request!==false){const host=s.people.find(p=>p.id===s.playerId),willingness=acceptance(s,host,actor);if(rand(s)>=willingness){log(s,'decision',`${actor.name} préfère poursuivre son activité plutôt que ${ACTIONS[cmd.key].label.toLowerCase()}.`,[actor.id,host.id],{explanation:'Proposition du musicien joueur; le partenaire conserve son autonomie.'});return result(false,`${actor.name} décline la proposition.`);}}
      if(cmd.key==='form'&&!s.people.some(q=>formationEligible(s,actor,q))) return result(false,'Les liens ne sont pas encore suffisants.');
      decide(s,actor,cmd.key);return result(true,`${actor.name} : ${ACTIONS[cmd.key].label}.`);
    case 'invite':return invite(s,cmd);
    case 'rehearse':return rehearse(s,cmd);
    case 'book':return book(s,cmd);
    case 'repertoire': {
      const g=s.groups.find(g=>g.id===cmd.groupId&&g.archivedAt===null),song=s.songs.find(x=>x.id===Number(cmd.songId));
      if(!g||!g.members.includes(actor.id)||!song||!song.authors.some(id=>g.members.includes(id)))return result(false,'Seules les compositions des membres peuvent entrer au répertoire.');
      if(cmd.remove)g.repertoire=g.repertoire.filter(r=>r.songId!==song.id);else if(!g.repertoire.some(r=>r.songId===song.id))g.repertoire.push({songId:song.id,mastery:0,rehearsals:0});
      return result(true,cmd.remove?'Chanson retirée du répertoire.':'Chanson ajoutée. Sa maîtrise collective commence à zéro.');
    }
    case 'deck': {
      if(!Array.isArray(cmd.cards)||cmd.cards.length<8||cmd.cards.length>10||new Set(cmd.cards).size!==cmd.cards.length||cmd.cards.some(id=>!availableCards(actor).includes(id)))return result(false,'Choisis 8 à 10 cartes musicales distinctes et débloquées.');
      actor.deck=[...cmd.cards];return result(true,'Deck préparé. Les cartes maudites remplacent toujours des emplacements.');
    }
    case 'excess':
      if(actor.engagement||actor.needs.energy<15)return result(false,'Ce n’est pas le moment : engagement ou épuisement.');
      changeDecadence(s,actor,18,'Une soirée d’excès choisie');actor.needs.energy=clamp(actor.needs.energy-8);const ev=log(s,'decadence',`${actor.name} prolonge la fête : déchéance +18, énergie −8.`,[actor.id]);feel(s,actor,{excitement:18,joy:8},ev);decide(s,actor,'relax');return result(true,'La fête se prolonge. Les effets sur le deck restent visibles.');
    case 'archive': {
      const song=s.songs.find(x=>x.id===Number(cmd.songId));if(!song)return result(false,'Chanson introuvable.');
      if(cmd.restore)s.songArchive=s.songArchive.filter(x=>x.id!==song.id);else if(!isArchivedSong(s,song.id))s.songArchive.push({id:song.id,time:s.time,reason:'Archivage manuel',auto:false});
      return result(true,cmd.restore?'Chanson restaurée.':'Chanson archivée, sans suppression.');
    }
    case 'revive': {
      const g=s.groups.find(g=>g.id===cmd.groupId&&g.members.includes(actor.id));if(!g)return result(false,'Band introuvable.');
      g.archivedAt=null;g.development=10;g.lastWorked=s.time;log(s,'group',`${g.name} reprend vie.`,g.members);return result(true,'Band relancé. Il faudra entretenir sa coordination.');
    }
    case 'cancelBooking': {
      const b=s.bookings.find(b=>b.id===cmd.bookingId&&b.members.includes(actor.id)&&b.status==='booked');if(!b)return result(false,'Cet engagement ne peut plus être annulé.');
      b.status='cancelled';const o=s.season.opportunities.find(o=>o.id===b.opportunityId);const other=s.bookings.find(x=>x!==b&&x.opportunityId===o.id&&['booked','assembling','playing'].includes(x.status));o.status=other?'booked':o.time>s.time?'open':'missed';o.bookingId=other?.id||null;return result(true,'Engagement annulé.');
    }
    case 'replay': {
      const old=s.performance;if(!old||old.status!=='finished')return result(false,'Le show doit être terminé.');
      const people=old.actors.map(p=>({...p,needs:{energy:p.startingEnergy},skills:{[p.instrument]:p.skill}}));
      const group={id:old.groupId,name:old.groupName,development:old.development,repertoire:[{songId:old.song.id,mastery:old.mastery}]};
      s.performance=createPerformance({id:`p-show${s.nextPerformanceId++}`,seed:old.seed,people,group,song:{...old.song,genre:old.genre},opportunity:old.sourceOpportunity,intention:old.intention,preview:true});
      return result(true,'Replay du même tirage, sans appliquer les conséquences une deuxième fois.');
    }
    case 'preview': {
      const g=s.groups.find(g=>g.id===cmd.groupId&&g.members.includes(actor.id)),song=s.songs.find(x=>x.id===Number(cmd.songId));
      if(!g||g.archivedAt!==null||!song||!g.repertoire.some(r=>r.songId===song.id))return result(false,'Choisis une chanson du répertoire de ton band.');
      const members=(cmd.members||g.members).filter(id=>g.members.includes(id)).map(id=>s.people.find(p=>p.id===id)).filter(Boolean);
      if(members.length<2)return result(false,'Il faut au moins deux musiciens.');
      s.performance=createPerformance({id:`p-show${s.nextPerformanceId++}`,seed:Math.floor(rand(s)*4294967296),people:members,group:g,song,opportunity:{id:'preview',name:'Répétition générale',styles:[g.genre,'Indie'],crowd:8},intention:cmd.intention||'tight',preview:true});
      return result(true,'Répétition générale : aucun gain de réputation ni conséquence de show.');
    }
    default:return result(false,'Commande inconnue.');
  }
}
function assemble(s,b) {
  b.status='assembling';const o=s.season.opportunities.find(o=>o.id===b.opportunityId),place=PLACES.find(p=>p.id===o.venue);
  for(const id of b.members) {
    const p=s.people.find(p=>p.id===id);if(!p)continue;
    const old=p.action;if(old){const row=s.activities.find(a=>a.id===old.activityId);if(row&&old.key!=='jam'){row.end=s.time;row.status='interrupted';}if(old.elapsed>0)p.actionCounts[old.key].interrupted++;}
    p.action=null;p.engagement={bookingId:b.id,dest:place.id,route:[{x:p.x,y:340},{x:place.door.x,y:340},{x:place.door.x+(b.members.indexOf(id)%6-2.5)*25,y:place.door.y}],arrived:false};
  }
  log(s,'booking',`${s.groups.find(g=>g.id===b.groupId)?.name} se met en route pour ${o.name}.`,b.members,{bookingId:b.id});
}
export function travelEngagement(s,p) {
  const a=p.engagement;if(!a)return false;
  if(a.route.length) {const t=a.route[0],d=Math.hypot(t.x-p.x,t.y-p.y);if(d<=12){p.x=t.x;p.y=t.y;a.route.shift();}else{p.x+=(t.x-p.x)*12/d;p.y+=(t.y-p.y)*12/d;}}
  if(!a.route.length){p.place=a.dest;a.arrived=true;p.needs.energy=clamp(p.needs.energy+.1);}
  return true;
}
function cancelAtDoor(s,b,reason) {
  b.status='missed';const o=s.season.opportunities.find(o=>o.id===b.opportunityId);if(o)o.status='missed';
  log(s,'show',`Show reporté : ${reason}.`,b.members,{bookingId:b.id});for(const p of s.people)if(p.engagement?.bookingId===b.id){p.engagement=null;decide(s,p);}
}
export function lifeMinute(s) {
  for(const p of s.people) {
    const key=p.action?.key;
    if(key==='sleep'&&!p.action.route.length) changeDecadence(s,p,-.025,'Repos');
    else if(key==='relax'&&!p.action.route.length)changeDecadence(s,p,-.006,'Détente');
    else if(p.needs.energy<25&&(s.time%1440<360||s.time%1440>1320)&&['jam','practice','write'].includes(key))changeDecadence(s,p,.025,'Nuit sacrifiée malgré la fatigue');
  }
  if(s.time%60===0)for(const g of s.groups)if(g.archivedAt===null&&!g.members.includes(s.playerId)&&g.repertoire.length<3){const candidate=eligibleSongs(s,g).filter(song=>!isArchivedSong(s,song.id)&&!g.repertoire.some(r=>r.songId===song.id)).sort((a,b)=>(b.quality+(b.genre===g.genre?20:0))-(a.quality+(a.genre===g.genre?20:0)))[0];if(candidate){g.repertoire.push({songId:candidate.id,mastery:0,rehearsals:0});log(s,'group',`${g.name} retient « ${candidate.title} » dans son répertoire.`,g.members,{groupId:g.id,explanation:'Choix autonome selon le style et la qualité; seules les compositions des membres sont admissibles.'});}}
  if(s.time%60===0)for(const g of s.groups)if(g.archivedAt===null&&s.time-g.lastWorked>2880){const before=g.development;g.development=clamp(g.development-.24);if(before>0&&g.development===0){g.archivedAt=s.time;log(s,'group',`${g.name} s’éteint faute d’activités communes. Son histoire est conservée.`,g.members,{groupId:g.id});}}
  for(const b of s.bookings) {
    if(b.status==='booked'&&s.time>=b.time-60) assemble(s,b);
    if(b.status==='assembling'&&s.time>=b.time) {
      const g=s.groups.find(g=>g.id===b.groupId),song=s.songs.find(x=>x.id===b.songId),o=s.season.opportunities.find(o=>o.id===b.opportunityId);
      const present=b.members.map(id=>s.people.find(p=>p.id===id)).filter(p=>p?.engagement?.bookingId===b.id&&p.engagement.arrived&&p.needs.energy>=8);
      if(!g||!song||present.length<2){cancelAtDoor(s,b,'moins de deux musiciens présents et fonctionnels');continue;}
      s.performance=createPerformance({id:`p-show${s.nextPerformanceId++}`,seed:Math.floor(rand(s)*4294967296),people:present,group:g,song,opportunity:o,intention:b.intention});b.status='playing';b.performanceId=s.performance.id;break;
    }
  }
  for(const o of s.season.opportunities)if(o.status==='open'&&s.time>o.time+100){o.status='missed';log(s,'season',`${o.name} est passé. Le quartier aura d’autres occasions.`);}
  if(!s.season.ended&&s.season.opportunities.every(o=>['played','missed'].includes(o.status))) {s.season.ended=true;s.season.endedAt=s.time;log(s,'season','La saison locale se termine. Le bilan conserve les shows, les bands et leurs histoires.');}
}
export function completePerformance(s) {
  const show=s.performance;
  if(!show||show.status!=='finished'||show.applied)return false;
  if(s.showHistory.some(r=>r.id===show.id)){show.applied=true;return false;}
  show.applied=true;if(show.preview)return true;
  const b=s.bookings.find(b=>b.performanceId===show.id),g=s.groups.find(g=>g.id===show.groupId),o=s.season.opportunities.find(o=>o.id===show.opportunityId),r=show.result;
  const record={id:show.id,time:s.time,groupId:show.groupId,groupName:show.groupName,songId:show.song.id,songTitle:show.song.title,opportunityId:show.opportunityId,opportunityName:show.opportunityName,intention:show.intention,members:show.actors.map(p=>p.id),...r};s.showHistory.push(record);
  if(b)b.status='played';if(o)o.status='played';
  if(g){g.development=clamp(g.development+2+r.score*.055);g.reputation=clamp(g.reputation+r.score*.16);g.lastWorked=s.time;g.shows.push(show.id);g.moments.unshift({time:s.time,type:'show',text:`${show.opportunityName} · ${r.score}/100`,participants:record.members});g.moments=g.moments.slice(0,12);const song=g.repertoire.find(x=>x.songId===show.song.id);if(song)song.mastery=clamp(song.mastery+3);}
  const event=log(s,'show',`${show.groupName} joue « ${show.song.title} » : ${r.conquered}/${r.total} fans conquis, accueil ${r.score}/100.`,record.members,{groupId:show.groupId,showId:show.id,explanation:`Écriture ${r.quality}, interprétation ${r.interpretation}, ${r.combos} combos, ${r.errors} erreurs. Les goûts du public et les zones d’impact ont compté.`});
  for(const actor of show.actors) {
    const p=s.people.find(p=>p.id===actor.id);if(!p)continue;
    p.needs.energy=clamp(p.needs.energy-15-actor.energyLoss);p.showFame=clamp(p.showFame+r.score*.055,0,25);feel(s,p,r.score>=45?{joy:12,excitement:10}:{sadness:10,anger:4},event);
    if(show.intention==='wild')changeDecadence(s,p,5+actor.errors,'Tout donner pendant un show');
    for(const partner of show.actors.filter(q=>q.id!==p.id)) {const q=s.people.find(p=>p.id===partner.id);if(!q)continue;const relation=relationship(s,p,q);relation.trust=clamp(relation.trust+(r.score>=45?2:-1));relation.collaboration=clamp(relation.collaboration+2);if(actor.errors>=2)relation.tension=clamp(relation.tension+3);}
    refreshReputation(s,p);
  }
  for(const p of s.people)if(p.engagement?.bookingId===b?.id){p.engagement=null;decide(s,p);}
  if(!s.season.ended&&s.season.opportunities.every(o=>['played','missed'].includes(o.status))){s.season.ended=true;s.season.endedAt=s.time;log(s,'season','La saison locale se termine.');}
  return true;
}
export function playTicks(s,ticks) {if(s.performance?.status!=='playing')return;advancePerformance(s.performance,ticks);if(s.performance.status==='finished')completePerformance(s);}
export function advanceToBooking(s,id) {
  const b=s.bookings.find(b=>b.id===id&&['booked','assembling'].includes(b.status));if(!b)return result(false,'Aucun engagement à venir.');
  step(s,Math.max(0,b.time-s.time));return result(true,'Préparation et déplacements simulés jusqu’au show.');
}
export function seasonSummary(s) {
  const shows=s.showHistory.filter(show=>show.time>=s.season.started),best=[...shows].sort((a,b)=>b.score-a.score)[0];
  return {shows:shows.length,fans:shows.reduce((n,r)=>n+r.conquered,0),average:shows.length?round(shows.reduce((n,r)=>n+r.score,0)/shows.length):0,best,bands:s.groups.filter(g=>g.created>=s.season.started).length};
}
export function newSeason(s) {
  if(!s.season.ended)return result(false,'La saison actuelle n’est pas terminée.');
  s.seasonHistory||=[];s.seasonHistory.push({...seasonSummary(s),started:s.season.started,endedAt:s.season.endedAt});
  const fresh={time:s.time,people:s.people};initializeLife(fresh);s.season=fresh.season;
  s.bookingArchive||=[];s.bookingArchive.push(...s.bookings);s.bookings=[];
  log(s,'season','Une nouvelle saison locale commence. Les musiciens et les bands poursuivent leur histoire.');return result(true,'Nouvelle saison lancée. Le quartier et ses histoires sont conservés.');
}
export function validateLife(s) {
  const num=(v,a=0,b=100)=>Number.isFinite(v)&&v>=a&&v<=b;
  if(!s.people.some(p=>p.id===s.playerId)||!Array.isArray(s.bookings)||!Array.isArray(s.showHistory)||!Array.isArray(s.songArchive)||!num(s.archiveThreshold)||!Number.isInteger(s.nextBookingId)||s.nextBookingId<1||!Number.isInteger(s.nextPerformanceId)||s.nextPerformanceId<1||!s.season||!Array.isArray(s.season.opportunities)||s.season.opportunities.length!==4||!num(s.season.started,0,1e12))throw Error('Saison invalide.');
  for(const p of s.people) {
    if(!num(p.decadence)||!num(p.showFame,0,25)||!Array.isArray(p.decadenceHistory)||!p.identity||!['hair','glasses','cap','brows','moustache','earring'].includes(p.identity.accessory)||!['calm','nervous','flamboyant','shy'].includes(p.identity.movement)||!Array.isArray(p.deck)||p.deck.length<8||p.deck.length>10||new Set(p.deck).size!==p.deck.length||p.deck.some(id=>!CARDS[id]||CARDS[id].tag==='curse')||!p.invitationCooldown||typeof p.invitationCooldown!=='object')throw Error('Personnage V5 invalide.');
    if(p.engagement&&(!s.bookings.some(b=>b.id===p.engagement.bookingId)||!PLACES.some(l=>l.id===p.engagement.dest)||!Array.isArray(p.engagement.route)||p.engagement.route.some(t=>!num(t.x,0,1100)||!num(t.y,0,670))))throw Error('Engagement invalide.');
  }
  for(const g of s.groups)if(!num(g.development)||!num(g.reputation)||!Number.isFinite(g.lastWorked)||g.archivedAt!==null&&!Number.isFinite(g.archivedAt)||!Array.isArray(g.repertoire)||new Set(g.repertoire.map(r=>r.songId)).size!==g.repertoire.length||g.repertoire.some(r=>!s.songs.some(song=>song.id===r.songId)||!num(r.mastery)||!Number.isInteger(r.rehearsals)||r.rehearsals<0)||!Array.isArray(g.moments)||!Array.isArray(g.shows))throw Error('Développement de band invalide.');
  for(const o of s.season.opportunities)if(typeof o.id!=='string'||!Number.isInteger(o.time)||!['open','booked','played','missed'].includes(o.status)||!Array.isArray(o.styles)||o.styles.some(g=>!GENRES.includes(g))||!PLACES.some(l=>l.id===o.venue)||!num(o.crowd,8,12))throw Error('Occasion invalide.');
  const ids=new Set();for(const b of s.bookings){if(typeof b.id!=='string'||ids.has(b.id)||!s.groups.some(g=>g.id===b.groupId)||!s.songs.some(song=>song.id===b.songId)||!s.season.opportunities.some(o=>o.id===b.opportunityId)||!Number.isInteger(b.time)||!Array.isArray(b.members)||b.members.length<2||new Set(b.members).size!==b.members.length||!INTENTIONS[b.intention]||!['booked','assembling','playing','played','cancelled','missed'].includes(b.status))throw Error('Réservation invalide.');ids.add(b.id);}
  for(const row of s.songArchive)if(!s.songs.some(song=>song.id===row.id)||typeof row.reason!=='string'||!Number.isFinite(row.time))throw Error('Archive invalide.');
  if(s.performance)validatePerformance(s.performance);
}
