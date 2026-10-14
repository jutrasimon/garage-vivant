import {rule} from './design-rules.mjs?v=0.8.14';
const duration=n=>n%60===0?`${n/60} h`:`${n} min`;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const mean=xs=>xs.length?xs.reduce((n,x)=>n+x,0)/xs.length:0;
const person=(s,id)=>s.people.find(p=>p.id===id);
const relation=(s,a,b)=>s.rels[`${a}>${b}`]||{affinity:0,love:0,tension:0};
export const activeGroup=g=>!!g&&g.archivedAt===null&&g.state!=='dissolved';
export const activeGroups=(s,id)=>s.groups.filter(g=>activeGroup(g)&&g.members.includes(id));
export function musicalChemistry(a,b){
 const similarity=1-(Math.abs(a.personality.creative-b.personality.creative)+Math.abs(a.personality.discipline-b.personality.discipline))/200;
 return clamp(25+similarity*30+(a.genre===b.genre?25:0)+(a.instrument!==b.instrument?10:-6)+(a.personality.kind+b.personality.kind)/20);
}
export function groupStyle(s,g){
 const songs=g.repertoire.filter(r=>r.active!==false).map(r=>s.songs.find(x=>x.id===r.songId)).filter(Boolean);
 const counts={};for(const x of songs)counts[x.genre]=(counts[x.genre]||0)+1;
 const best=Math.max(0,...Object.values(counts)),ties=Object.keys(counts).filter(k=>counts[k]===best).sort();
 return {genre:ties.includes(g.genre)?g.genre:ties[0]||g.initialGenre||g.genre,counts};
}
export function groupSkills(s,g){
 const members=g.members.map(id=>person(s,id)).filter(Boolean),keys=Object.keys(members[0]?.skills||{});
 return Object.fromEntries(keys.map(k=>{const xs=members.map(p=>p.skills[k]),min=Math.min(...xs),max=Math.max(...xs);return [k,{mean:mean(xs),min,max,minIds:members.filter(p=>p.skills[k]===min).map(p=>p.id),maxIds:members.filter(p=>p.skills[k]===max).map(p=>p.id)}];}));
}
export function catalogueReputation(s,g){
 const qs=s.songs.filter(x=>x.ownerGroupId===g.id).map(x=>x.quality).sort((a,b)=>b-a).slice(0,3);
 return .2*mean(qs)*Math.min(1,qs.length/3);
}
export function refreshGroup(s,g){g.genre=groupStyle(s,g).genre;g.reputation=clamp(g.showReputation+catalogueReputation(s,g));}
export function attachment(s,p,g){
 const peers=g.members.filter(id=>id!==p.id).map(id=>person(s,id)).filter(Boolean);
 const songs=g.repertoire.filter(r=>r.active!==false).map(r=>s.songs.find(x=>x.id===r.songId)).filter(Boolean);
 const styles=songs.length?songs:g.founders.map(id=>person(s,id)).filter(Boolean);
 const f=mean(peers.map(q=>clamp(relation(s,p.id,q.id).affinity))),t=mean(peers.map(q=>relation(s,p.id,q.id).tension));
 const h=mean(peers.map(q=>musicalChemistry(p,q))),style=styles.length?100*styles.filter(x=>x.genre===p.genre).length/styles.length:50;
 const terms={coordination:g.development,affinity:rule(s,'groups.attachment.affinity')*(f-50),style:rule(s,'groups.attachment.style')*(style-50),chemistry:rule(s,'groups.attachment.chemistry')*(h-50),reputation:rule(s,'groups.attachment.reputation')*g.reputation,tension:-rule(s,'groups.attachment.tension')*t};
 return {value:clamp(Object.values(terms).reduce((n,x)=>n+x,0)),terms};
}
export function pairEligible(s,a,b){
 if(!a||!b||a===b)return false;const ab=relation(s,a.id,b.id),ba=relation(s,b.id,a.id);
 return ((Math.min(ab.affinity,ba.affinity)>=rule(s,'groups.affinity'))||(Math.min(ab.love,ba.love)>=rule(s,'groups.love')))&&Math.max(ab.tension,ba.tension)<rule(s,'groups.tension');
}
export function membershipReason(s,host,target,g=null){
 if(!host||!target||host===target)return 'Partenaires invalides.';
 if(host.engagement||target.engagement||[host,target].some(p=>p.action?.key==='sleep'))return 'Partenaire indisponible.';
 const elapsed=s.time-(g?target.lastFormation:Math.max(host.lastFormation,target.lastFormation));
 if(elapsed<(g?rule(s,'groups.recruitmentDelay'):rule(s,'groups.membershipDelay')))return `${duration(g?rule(s,'groups.recruitmentDelay'):rule(s,'groups.membershipDelay'))} doivent s’écouler depuis la dernière formation ou adhésion.`;
 if(!pairEligible(s,host,target))return 'Affinité ou amour réciproque insuffisant, ou tension excessive.';
 if(g){if(!activeGroup(g)||!g.members.includes(host.id))return 'Groupe indisponible.';if(g.members.includes(target.id))return 'Déjà membre.';if(g.members.filter(id=>pairEligible(s,target,person(s,id))).length<Math.ceil(g.members.length/2))return 'Liens insuffisants avec la moitié des membres.';}
 else if(s.groups.some(x=>activeGroup(x)&&x.members.includes(host.id)&&x.members.includes(target.id)))return 'Ces musiciens partagent déjà un groupe.';
 return null;
}
export function membershipChance(s,host,target,g=null){
 const r=relation(s,target.id,host.id),others=activeGroups(s,target.id),max=Math.max(0,...others.map(x=>attachment(s,target,x).value));
 const prospective=g||{members:[host.id,target.id],founders:[host.id,target.id],repertoire:[],development:18,reputation:0,genre:host.genre};
 const attract=attachment(s,target,prospective).value;
 return clamp(.4+r.affinity/200+r.love/400+musicalChemistry(host,target)/1000-r.tension/250+attract/500,.1,.95)/(1+.75*others.length)*Math.max(.1,1-max/100);
}
export function proposeMembership(s,host,target,g,ctx,{manual=false,name=null}={}){
 const reason=membershipReason(s,host,target,g);if(reason)return {ok:false,message:reason};
 if(!g&&ctx.canCreate&&!ctx.canCreate(name))return {ok:false,message:'Création refusée : nom indisponible ou banque épuisée.'};
 const key=[host.id,target.id].sort().join(':'),last=s.groupState.proposals[key]??-1e9;
 if(s.time-last<rule(s,'groups.pairDelay'))return {ok:false,message:`Cette paire a déjà reçu une proposition dans les dernières ${duration(rule(s,'groups.pairDelay'))}.`};
 if(!manual){
  const current=activeGroups(s,host.id).filter(x=>x!==g),max=Math.max(0,...current.map(x=>attachment(s,host,x).value));
  const chance=(g?rule(s,'groups.recruitmentProposal'):rule(s,'groups.proposal'))/(1+current.length**2)*Math.max(.05,1-max/100);
  s.groupState.metrics.eligible++;if(ctx.random()>=chance)return {ok:false,message:'Aucune proposition.'};
 }
 s.groupState.proposals[key]=s.time;s.groupState.metrics.proposed++;
 const chance=membershipChance(s,host,target,g),roll=ctx.random(),accepted=roll<chance;
 ctx.emit('group',`${host.name} propose ${g?'de rejoindre « '+g.name+' »':'de former un groupe'} à ${target.name} : ${accepted?'accepté':'refusé'}.`,[host.id,target.id],{membership:true,groupId:g?.id||null,chance,roll,accepted});
 if(!accepted){ctx.refused?.(host);return {ok:false,message:'Proposition déclinée.',chance};}
 if(g){g.members.push(target.id);g.memberships[target.id]={joined:s.time,nextCheck:s.time+rule(s,'groups.departureGrace')};target.lastFormation=s.time;ctx.joined?.(target);}
 else {g=ctx.create([host.id,target.id],{manual:true,name,origin:manual?'player':'autonome'});if(!g)return {ok:false,message:'Création refusée : nom indisponible.'};}
 s.groupState.metrics.accepted++;return {ok:true,message:`${target.name} rejoint « ${g.name} ».`,groupId:g.id,chance};
}
export function considerMembership(s,a,b,ctx){
 if(!pairEligible(s,a,b))return;
 const options=[{host:a,target:b,g:null},...activeGroups(s,a.id).filter(g=>!membershipReason(s,a,b,g)).map(g=>({host:a,target:b,g})),...activeGroups(s,b.id).filter(g=>!membershipReason(s,b,a,g)).map(g=>({host:b,target:a,g}))].filter(o=>!membershipReason(s,o.host,o.target,o.g));
 if(!options.length)return;const weights=options.map(o=>(o.g?rule(s,'groups.recruitmentWeight'):1)*(1+(o.g?attachment(s,o.target,o.g).value:18)/25)),total=weights.reduce((a,b)=>a+b,0);let roll=ctx.random()*total,index=0;while(index<weights.length-1&&(roll-=weights[index])>=0)index++;const o=options[index];return proposeMembership(s,o.host,o.target,o.g,ctx);
}
export function initializeGroupState(s){s.groupState={nextRequestId:1,requests:[],proposals:{},metrics:{eligible:0,proposed:0,accepted:0,adoptions:0,practiceRequests:0,practices:0,departures:0,dissolutions:0,relations:{attempts:0,admitted:0,favorable:0,neutral:0,unfavorable:0,gained:0,lost:0,erosion:0}}};}
export function initializeGroupData(s,g,random){
 g.initialGenre=g.genre;g.genre=g.initialGenre=g.founders.length?person(s,g.founders[Math.floor(random()*g.founders.length)])?.genre||g.genre:g.genre;
 g.state=g.archivedAt===null?'active':'dissolved';g.dissolvedReason=g.state==='dissolved'?'Archive historique':null;g.finalMembers=g.state==='dissolved'?[...g.members]:[];
 g.showReputation=g.reputation;g.memberships=Object.fromEntries(g.members.map(id=>[id,{joined:s.time,nextCheck:s.time+rule(s,'groups.departureGrace')}]));
 g.nextAdoption=s.time+Math.floor(random()*rule(s,'groups.decisionMinutes'))+1;g.nextPractice=s.time+Math.floor(random()*rule(s,'groups.decisionMinutes'))+1;
 for(const row of g.repertoire)row.active??=true;
}
export function adoptionReason(s,g,song){if(!activeGroup(g)||!song)return 'Groupe ou chanson introuvable.';if(song.ownerGroupId)return 'Cette chanson appartient déjà à un groupe.';if(!song.authors.some(id=>g.members.includes(id)))return 'Aucun auteur n’est membre du groupe.';return null;}
export function adoptSong(s,g,song,ctx){
 const reason=adoptionReason(s,g,song);if(reason)return {ok:false,message:reason};
 song.ownerGroupId=g.id;song.adoptedAt=s.time;g.repertoire.push({songId:song.id,mastery:0,rehearsals:0,active:true});refreshGroup(s,g);s.groupState.metrics.adoptions++;
 ctx.emit('group',`« ${g.name} » adopte « ${song.title} ».`,g.members,{groupId:g.id,songId:song.id,adoption:true});return {ok:true,message:'Chanson adoptée.'};
}
export function requestRehearsal(s,g,songId,place,ctx){
 if(!ctx.validPlace?.(place))return {ok:false,message:'Lieu de répétition indisponible.'};
 if(!activeGroup(g)||!g.repertoire.some(r=>r.songId===songId&&r.active!==false))return {ok:false,message:'Choisis un morceau actif du répertoire.'};
 if(s.groupState.requests.some(x=>x.groupId===g.id&&['open','playing'].includes(x.status)))return {ok:false,message:'Une répétition de ce groupe est déjà en préparation ou en cours.'};
 const req={id:'rehearsal-'+s.groupState.nextRequestId++,groupId:g.id,songId,place,created:s.time,expires:s.time+rule(s,'groups.invitationMinutes'),status:'open',firstArrival:null,started:null,invited:[...g.members]};s.groupState.requests.push(req);
 for(const id of g.members){const p=person(s,id);p.invitationQueue.push({id:req.id+':'+id,requestId:req.id,created:s.time,expires:req.expires,status:'pending',resolved:null,reason:null});}
 s.groupState.metrics.practiceRequests++;ctx.emit('group',`« ${g.name} » appelle une répétition.`,g.members,{groupId:g.id,requestId:req.id,songId});return {ok:true,message:'Invitations à pratiquer ajoutées aux files.',requestId:req.id};
}
function rehearsalAvailable(s,req){
 const g=s.groups.find(g=>g.id===req?.groupId);
 return !!req&&['open','playing'].includes(req.status)&&s.time<req.expires&&activeGroup(g)&&g.repertoire.some(r=>r.songId===req.songId&&r.active!==false);
}
export function resolveInvitation(s,p,ctx){
 for(const inv of p.invitationQueue.filter(x=>x.status==='pending').sort((a,b)=>a.created-b.created||a.id.localeCompare(b.id))){
  const req=s.groupState.requests.find(x=>x.id===inv.requestId),g=s.groups.find(x=>x.id===req?.groupId);
  const invalid=!rehearsalAvailable(s,req)||s.time>=inv.expires||!g.members.includes(p.id);
  let reason=invalid?'Invitation expirée ou activité indisponible.':p.needs.energy<15?'Énergie insuffisante.':ctx.nearShow?.(p,req)?'Spectacle trop proche.':null;
  const chance=reason?null:clamp(.55+attachment(s,p,g).value/250+(p.needs.energy-50)/300-p.emotions.distress/700,.1,.95),roll=reason?null:ctx.random(),accepted=!reason&&roll<chance;
  inv.status=accepted?'accepted':invalid?'expired':'refused';inv.resolved=s.time;inv.reason=reason||(accepted?'Participation acceptée.':'Invitation déclinée.');inv.chance=chance;inv.roll=roll;
  ctx.emit('group',`${p.name} : ${inv.reason}`,[p.id],{groupId:g?.id,requestId:req?.id,invitation:true,chance,roll,accepted});
  if(accepted){ctx.start(p,req);return true;}
 }
 return false;
}
export function rehearsalReady(s,p,ctx){
 const id=p.action?.rehearsalId;if(!id)return true;
 const req=s.groupState.requests.find(x=>x.id===id),g=s.groups.find(x=>x.id===req?.groupId);
 if(!rehearsalAvailable(s,req)){if(req){req.status='closed';for(const q of s.people.filter(q=>q.action?.rehearsalId===id))ctx.close(q,'cancelled');}else ctx.close(p,'interrupted');return false;}
 if(!g.members.includes(p.id)){ctx.close(p,'interrupted');return false;}
 // The request, including a request saved in V7.2, names the actual piece.
 p.action.songId=req.songId;p.action.content='song';
 const present=s.people.filter(q=>q.action?.rehearsalId===id&&!q.action.route.length&&!q.engagement);
 if(req.status==='open'){
  req.firstArrival??=s.time;
  if(present.length>=2){req.status='playing';req.started=s.time;s.groupState.metrics.practices++;ctx.emit('group',`« ${g.name} » commence sa répétition.`,present.map(x=>x.id),{groupId:g.id,requestId:id});}
  else if(s.time>=req.expires||s.time-req.firstArrival>=rule(s,'groups.waitMinutes')){req.status='closed';for(const q of present)ctx.close(q,'cancelled');return false;}
  else{p.action.waited++;const row=s.activities.find(x=>x.id===p.action.activityId);if(row)row.status='waiting';return false;}
 }
 return true;
}
export function leaveGroup(s,g,p,reason,ctx){
 if(!activeGroup(g)||!g.members.includes(p.id))return false;
 g.members=g.members.filter(id=>id!==p.id);g.alumni.push({id:p.id,name:p.name,left:s.time,reason});delete g.memberships[p.id];s.groupState.metrics.departures++;
 for(const inv of p.invitationQueue)if(inv.status==='pending'&&s.groupState.requests.find(r=>r.id===inv.requestId)?.groupId===g.id){inv.status='cancelled';inv.resolved=s.time;inv.reason='Départ du groupe.';}
 if(p.action?.groupId===g.id)ctx.close(p,'interrupted');ctx.cancelMember?.(g,p);
 ctx.emit('group',`${p.name} quitte « ${g.name} » : ${reason}.`,[p.id],{groupId:g.id,departure:true});refreshGroup(s,g);if(g.members.length<2)dissolveGroup(s,g,'Moins de deux membres.',ctx);return true;
}
export function dissolveGroup(s,g,reason,ctx){
 if(!activeGroup(g))return false;
 g.state='dissolved';g.archivedAt=s.time;g.dissolvedReason=reason;g.finalMembers=[...g.members];
 for(const id of g.members){const p=person(s,id);if(p){g.alumni.push({id,name:p.name,left:s.time,reason});if(p.action?.groupId===g.id)ctx.close(p,'interrupted');}}
 g.members=[];g.memberships={};s.groupState.metrics.dissolutions++;
 for(const req of s.groupState.requests.filter(x=>x.groupId===g.id))req.status='closed';
 for(const p of s.people)for(const inv of p.invitationQueue)if(inv.status==='pending'&&s.groupState.requests.find(r=>r.id===inv.requestId)?.groupId===g.id){inv.status='cancelled';inv.resolved=s.time;inv.reason=reason;}
 ctx.cancelGroup?.(g);ctx.emit('group',`« ${g.name} » se dissout : ${reason}`,g.finalMembers,{groupId:g.id,dissolution:true});return true;
}
function weighted(xs,weight,random){if(!xs.length)return null;const ws=xs.map(weight);let r=random()*ws.reduce((a,b)=>a+b,0),i=0;while(i<xs.length-1&&(r-=ws[i])>=0)i++;return xs[i];}
export function groupsMinute(s,ctx){
 for(const p of s.people)for(const inv of p.invitationQueue)if(inv.status==='pending'&&s.time>=inv.expires){inv.status='expired';inv.resolved=s.time;inv.reason='Délai écoulé.';}
 for(const req of s.groupState.requests){
  const participants=s.people.filter(p=>p.action?.rehearsalId===req.id);
  if(!rehearsalAvailable(s,req)||req.status==='playing'&&!participants.length)req.status='closed';
  if(req.status==='closed')for(const p of participants)ctx.close(p,'cancelled');
 }
 for(const p of s.people)p.invitationQueue=p.invitationQueue.filter(x=>x.status==='pending'||s.time-(x.resolved??x.created)<1440);
 s.groupState.requests=s.groupState.requests.filter(r=>r.status!=='closed'||s.time-Math.max(r.expires,r.started||0)<1440||s.people.some(p=>p.action?.rehearsalId===r.id)||s.people.some(p=>p.invitationQueue.some(x=>x.requestId===r.id)));
 for(const g of s.groups.filter(activeGroup)){
  refreshGroup(s,g);if(g.development<=0||g.members.length<2){dissolveGroup(s,g,g.development<=0?'Coordination épuisée.':'Moins de deux membres.',ctx);continue;}
 }
 for(const p of s.people){
  const groups=activeGroups(s,p.id).sort((a,b)=>attachment(s,p,a).value-attachment(s,p,b).value);
  for(const g of groups){const m=g.memberships[p.id];if(!m||s.time<m.nextCheck)continue;m.nextCheck=s.time+rule(s,'groups.departureMinutes');
   if(ctx.closeShow?.(p,g))continue;const score=attachment(s,p,g).value,alternative=groups.some(x=>x!==g&&attachment(s,p,x).value-score>=rule(s,'groups.alternativeGap'));
   const chance=Math.min(.3,(score<rule(s,'groups.lowAttachment')?rule(s,'groups.departureChance'):0)+(alternative?rule(s,'groups.alternativeChance'):0));if(chance&&ctx.random()<chance){leaveGroup(s,g,p,alternative?'Autre groupe plus attirant.':'Attachement faible.',ctx);break;}
  }
 }
 const active=s.groups.filter(g=>activeGroup(g)&&(s.time>=g.nextAdoption||s.time>=g.nextPractice));for(let i=active.length-1;i>0;i--){const j=Math.floor(ctx.random()*(i+1));[active[i],active[j]]=[active[j],active[i]];}
 for(const g of active){
  if(s.time>=g.nextAdoption){g.nextAdoption=s.time+rule(s,'groups.decisionMinutes');let songs=s.songs.filter(x=>!adoptionReason(s,g,x));if(songs.some(x=>!x.weak))songs=songs.filter(x=>!x.weak);const song=weighted(songs,x=>1+x.quality/10+(x.genre===g.genre?2:0),ctx.random);if(song&&ctx.random()<clamp(.15+song.quality/200+(song.genre===g.genre?.15:0),.15,.8))adoptSong(s,g,song,ctx);}
  if(s.time>=g.nextPractice){g.nextPractice=s.time+rule(s,'groups.decisionMinutes');const rows=g.repertoire.filter(r=>r.active!==false);if(rows.length&&ctx.random()<(g.development<rule(s,'groups.fragileCoordination')?rule(s,'groups.fragileRehearsalChance'):rule(s,'groups.rehearsalChance'))){const row=weighted(rows,r=>1+(100-r.mastery)/20,ctx.random);requestRehearsal(s,g,row.songId,ctx.place(),ctx);}}
 }
 for(const [key,time]of Object.entries(s.groupState.proposals))if(s.time-time>rule(s,'groups.pairDelay'))delete s.groupState.proposals[key];
}
export function upgradeGroups(s,random,ctx){
 initializeGroupState(s);s.legacyV71={trust:{},sharedRepertoires:[],propertyResolutions:[],confirmedBookings:[]};
 for(const [key,r]of Object.entries(s.rels)){s.legacyV71.trust[key]=r.trust;delete r.trust;}
 for(const p of s.people){p.invitationQueue=[];p.lastFormation=p.lastFormation??-1e9;}
 for(const g of s.groups){const oldGenre=g.genre;initializeGroupData(s,g,random);g.genre=g.initialGenre=oldGenre;for(const m of Object.values(g.memberships))m.joined=null;}
 for(const song of s.songs){
  const candidates=s.groups.filter(g=>g.repertoire.some(r=>r.songId===song.id)).sort((a,b)=>(b.repertoire.find(r=>r.songId===song.id).mastery-a.repertoire.find(r=>r.songId===song.id).mastery)||a.created-b.created||a.id.localeCompare(b.id));
  song.ownerGroupId=candidates[0]?.id||null;song.adoptedAt=null;
  if(candidates.length>1){s.legacyV71.propertyResolutions.push({songId:song.id,ownerGroupId:song.ownerGroupId});for(const g of candidates.slice(1)){s.legacyV71.sharedRepertoires.push({groupId:g.id,...g.repertoire.find(r=>r.songId===song.id)});g.repertoire=g.repertoire.filter(r=>r.songId!==song.id);}}
 }
 for(const b of s.bookings)if(['booked','assembling','playing'].includes(b.status)){b.legacySetlist=true;b.absences={};s.legacyV71.confirmedBookings.push(b.id);}
 for(const g of s.groups){g.showReputation=Math.max(0,g.reputation-catalogueReputation(s,g));refreshGroup(s,g);if(g.state==='dissolved'||g.development===0||g.members.length<2){g.finalMembers=[...g.members];for(const id of g.members)g.alumni.push({id,name:person(s,id)?.name||'Ancien voisin',left:g.archivedAt??s.time,reason:'Migration : groupe historique.'});g.members=[];g.memberships={};g.state='dissolved';g.archivedAt??=s.time;g.dissolvedReason||='Migration : groupe historique.';}}
 for(const p of s.people)if(p.action?.key==='practice'&&p.action.groupId&&!s.groups.find(g=>g.id===p.action.groupId)?.repertoire.some(r=>r.songId===p.action.songId))p.action.groupId=null;
 for(const g of s.groups.filter(g=>g.state==='dissolved'))ctx?.cancelGroup(g);
 s.version='0.7.2';
}
export function validateGroups(s,places){
 const finite=(v,a=0,b=1e12)=>Number.isFinite(v)&&v>=a&&v<=b,fail=message=>{throw Error(message);};
 if(!s.groupState||!Array.isArray(s.groupState.requests)||!Number.isInteger(s.groupState.nextRequestId)||s.groupState.nextRequestId<1||!s.groupState.proposals||!s.groupState.metrics)fail('État des groupes invalide.');
 for(const key of ['eligible','proposed','accepted','adoptions','practiceRequests','practices','departures','dissolutions'])if(!Number.isInteger(s.groupState.metrics[key])||s.groupState.metrics[key]<0)fail('Compteur de groupe invalide.');
 for(const [key,time]of Object.entries(s.groupState.proposals))if(!/^p\d+:p\d+$/.test(key)||!finite(time))fail('Proposition invalide.');
 if(!s.groupState.metrics.relations||Object.values(s.groupState.metrics.relations).some(v=>!finite(v)))fail('Mesure relationnelle invalide.');
 if(Object.values(s.rels).some(r=>Object.hasOwn(r,'trust')))fail('Confiance interdite dans les relations actuelles.');
 const requestIds=new Set(s.groupState.requests.map(r=>r.id));if(requestIds.size!==s.groupState.requests.length)fail('Demandes dupliquées.');
 for(const g of s.groups){
  if(!['active','dissolved'].includes(g.state)||!finite(g.showReputation,0,100)||!g.memberships||!finite(g.nextAdoption)||!finite(g.nextPractice)||!Array.isArray(g.finalMembers)||!Array.isArray(g.alumni)||!g.initialGenre)fail('Groupe V7.2 invalide.');
  if(g.state==='active'&&(g.archivedAt!==null||g.members.length<2||g.development<=0)||g.state==='dissolved'&&(g.archivedAt===null||g.members.length))fail('État de dissolution incohérent.');
  if(Object.keys(g.memberships).length!==g.members.length)fail('Appartenance incohérente.');
  for(const id of g.members){const m=g.memberships[id];if(!m||!finite(m.nextCheck)||m.joined!==null&&!finite(m.joined))fail('Appartenance invalide.');}
  for(const r of g.repertoire){const song=s.songs.find(x=>x.id===r.songId);if(!song||song.ownerGroupId!==g.id||typeof r.active!=='boolean')fail('Propriété du répertoire incohérente.');}
 }
 for(const song of s.songs)if(!Object.hasOwn(song,'ownerGroupId')||song.ownerGroupId!==null&&!s.groups.some(g=>g.id===song.ownerGroupId&&g.repertoire.some(r=>r.songId===song.id))||song.adoptedAt!==null&&!finite(song.adoptedAt))fail('Propriétaire de chanson invalide.');
 for(const req of s.groupState.requests){
  const g=s.groups.find(g=>g.id===req.groupId);
  if(!/^rehearsal-\d+$/.test(req.id)||Number(req.id.split('-')[1])>=s.groupState.nextRequestId||!g||!s.songs.some(x=>x.id===req.songId&&x.ownerGroupId===g.id)||!['open','playing','closed'].includes(req.status)||!finite(req.created)||!finite(req.expires,req.created)||!places.some(x=>x.id===req.place&&x.kind==='garage')||!Array.isArray(req.invited)||new Set(req.invited).size!==req.invited.length||req.firstArrival!==null&&!finite(req.firstArrival)||req.started!==null&&!finite(req.started)||req.status==='playing'&&req.started===null||req.status!=='closed'&&!activeGroup(g))fail('Demande de répétition invalide.');
 }
 for(const p of s.people){
  if(!Array.isArray(p.invitationQueue)||new Set(p.invitationQueue.map(x=>x.id)).size!==p.invitationQueue.length)fail('File invalide.');
  for(const inv of p.invitationQueue){const req=s.groupState.requests.find(r=>r.id===inv.requestId);if(!req||!req.invited.includes(p.id)||inv.id!==req.id+':'+p.id||!['pending','accepted','refused','expired','cancelled'].includes(inv.status)||!finite(inv.created)||!finite(inv.expires,inv.created)||inv.status!=='pending'&&!finite(inv.resolved)||inv.status==='pending'&&inv.resolved!==null||typeof inv.reason!=='string'&&inv.reason!==null||inv.chance!=null&&!finite(inv.chance,0,1)||inv.roll!=null&&!finite(inv.roll,0,1))fail('Invitation invalide.');}
  if(p.action?.rehearsalId){const req=s.groupState.requests.find(r=>r.id===p.action.rehearsalId);if(!req||!req.invited.includes(p.id)||p.action.key!=='practice'||p.action.groupId!==req.groupId||p.action.dest!==req.place)fail('Participation invalide.');}
 }
 for(const b of s.bookings){
  if(b.legacySetlist&&!s.legacyV71?.confirmedBookings?.includes(b.id))fail('Setlist historique invalide.');
  if(!b.legacySetlist&&['applied','booked','assembling','playing'].includes(b.status)&&(b.setlist||[b.songId]).some(id=>id!==null&&!s.songs.some(x=>x.id===id&&x.ownerGroupId===b.groupId)))fail('Setlist sans propriété.');
 }
}
