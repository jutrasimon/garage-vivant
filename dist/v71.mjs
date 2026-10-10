import {editTokens} from './v7.mjs?v=0.7.1';
// Rules chosen for V7.1, using the existing needs, emotions and musical records.
export const ACTION_KEYS = ['relax','social','practice','jam','write','decadence'];
export const V71_RULES = Object.freeze({cycleMinutes:15,searchMinutes:30,abandonMinutes:14*1440,chainMinutes:12*60,weakGap:12,referenceSongs:5,secondaryChance:.15,learningPlateau:2});
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
export const normalizeName=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const groupHeads=['Les Chiens','Les Corbeaux','Les Satellites','Les Passagers','Les Lucioles','Les Renards','Les Orages','Les Machines','Les Fantômes','Les Éclats','Les Balises','Les Courants','Les Astres','Les Épaves','Les Insomniaques','Les Rebelles','Les Nomades','Les Caravelles','Les Traversiers','Les Grives','Les Zéphyrs','Les Boussoles','Les Béliers','Les Horizons','Les Rivages','Les Vautours','Les Écureuils','Les Brumes','Les Escales','Les Rochers','Les Phalènes','Les Comètes'];
const groupEnds=['de cuivre','de velours','du large','de traverse','électriques','sauvages','de bitume','du nord','des marées','de papier','de braise','du dimanche','en cavale','des combles','de granit','sans sommeil','des tempêtes','du couchant','du grenier','de porcelaine','des frontières','de cristal','de charbon','du zénith','des hangars','du vendredi','de traverse','de dentelle','du plateau','de cendres','des aurores','du périphérique'];
const songSubjects=['le fleuve','la lumière','la ville','ton ombre','le matin','le silence','la nuit','le vent','notre histoire','la poussière','le ciel','la mémoire','la neige','le temps','la mer','la pluie'];
const songVerbs=['se tait','nous attend','prend feu','revient','change de peau','s’éloigne','respire','nous échappe','se relève','s’efface','bascule','s’éveille','ralentit','nous emporte','tient encore','disparaît'];
const songPlaces=['au bout du monde','sur le quai','derrière la vitre','avant le départ','sous les néons','sans un mot','à contretemps','dans tes mains','au dernier étage','après l’orage','entre deux trains','près du canal','à l’aube','loin d’ici','pour la dernière fois','au bord du jour'];
export function nameRegistry(s){
 if(!s.musicNames)s.musicNames=[];
 const seen=new Set(s.musicNames.map(x=>x.normalized));
 for(const [kind,items] of [['group',s.groups],['song',[...s.projects,...s.songs]]])for(const item of items||[]){const name=item.name||item.title,key=normalizeName(name);if(!seen.has(key)){s.musicNames.push({name,normalized:key,kind});seen.add(key);}}
 return s.musicNames;
}
export function reserveMusicName(s,kind,name){
 const registry=nameRegistry(s),key=normalizeName(name);
 if(!key||registry.some(x=>x.normalized===key))return false;
 if(kind==='group'&&registry.some(x=>x.kind==='group'&&normalizeName(x.name.split(' ').slice(0,4).join(' '))===normalizeName(name.split(' ').slice(0,4).join(' '))))return false;
 registry.push({name,normalized:key,kind});return true;
}
export function musicName(s,kind,random){
 const registry=nameRegistry(s),used=new Set(registry.map(x=>x.normalized));
 const identities=new Set(registry.filter(x=>x.kind==='group').map(x=>normalizeName(x.name.split(' ').slice(0,4).join(' '))));
 const total=kind==='group'?groupHeads.length*groupEnds.length*songPlaces.length:songSubjects.length*songVerbs.length*songPlaces.length*4;
 const start=Math.floor(random()*total);
 for(let step=0;step<total;step++){
  const n=(start+step)%total;
  const name=kind==='group'?`${groupHeads[n%groupHeads.length]} ${groupEnds[Math.floor(n/groupHeads.length)%groupEnds.length]} ${songPlaces[Math.floor(n/(groupHeads.length*groupEnds.length))%songPlaces.length]}`:`${['Quand','Là où','Tant que','Depuis que'][Math.floor(n/(songSubjects.length*songVerbs.length*songPlaces.length))%4]} ${songSubjects[n%songSubjects.length]} ${songVerbs[Math.floor(n/songSubjects.length)%songVerbs.length]} ${songPlaces[Math.floor(n/(songSubjects.length*songVerbs.length))%songPlaces.length]}`;
  // Groups may share a grammatical head, but not their central two-part identity.
  const identity=kind==='group'?name.split(' ').slice(0,4).join(' '):null;
  if(kind==='group'&&identities.has(normalizeName(identity)))continue;
  // Full registry uniqueness is global, including archives and abandoned works.
  const key=normalizeName(name);if(!used.has(key)){s.musicNames.push({name,normalized:key,kind});return name;}
 }
 return null;
}
export function initializeV71(p,random){
 p.actionRanges ||= Object.fromEntries(ACTION_KEYS.map((key,i)=>{const base=[45,90,65,85,75,50][i],factor=.8+random()*.4;return [key,{min:Math.round(base*factor*.65),max:Math.round(base*factor*1.4)}];}));
 p.secondaryInstruments ||= Object.keys(p.skills).filter(k=>k!==p.instrument&&k!=='writing'&&p.skills[k]>=25);
 p.learningWork ||= Object.fromEntries(Object.keys(p.skills).map(k=>[k,0]));
 p.songMastery ||= {};
 p.excessEpisodes ||= [];
 p.decadenceTokens ??= 0;
 p.actionCounts.decadence ||= {started:0,completed:0,interrupted:0};
 p.priorities.decadence ??= 2;
}
export function setupAction(p,random){
 const a=p.action;if(!a||a.key==='sleep')return;
 const r=p.actionRanges[a.key];a.duration=Math.round(r.min+random()*(r.max-r.min));a.remaining=a.duration;
 a.cycleRemaining=V71_RULES.cycleMinutes;a.cycles=0;a.instrument=p.instrument;a.groupId=null;a.songId=null;a.content='technique';a.admitted=false;a.admissionAttempts=[];
}
export function chooseInstrument(p,random){return p.secondaryInstruments.length&&random()<V71_RULES.secondaryChance?p.secondaryInstruments[Math.floor(random()*p.secondaryInstruments.length)]:p.instrument;}
export function plateauGain(p,key,gain){
 const adjusted=gain*Math.max(.16,1-p.skills[key]/115)*(1+p.emotions.exaltation/200+(p.needs.fun-50)/200);
 p.learningWork[key]+=adjusted*.9;
 let jump=0;while(p.learningWork[key]>=V71_RULES.learningPlateau){p.learningWork[key]-=V71_RULES.learningPlateau;jump+=V71_RULES.learningPlateau;}
 return adjusted*.1+jump;
}
export function shouldLeave(p,random,negative=false){
 const a=p.action,r=p.actionRanges[a.key];
 if(p.needs.energy<12||negative&&p.emotions.distress>80)return true;
 if(a.elapsed<r.min)return false;
 if(a.elapsed>=r.max)return true;
 const satisfied=a.key==='social'?p.needs.social>85:a.key==='jam'||a.key==='write'?p.needs.expression>90:false;
 const pressure=Math.max(0,(35-Math.min(p.needs.energy,p.needs.fun,p.needs.social))/100);
 return random()<Math.min(.85,.1+pressure+(satisfied?.35:0)+(a.elapsed-a.duration>0?.25:0));
}
export function decadenceCount(p){const base=(p.deck||[]).length||9;return Math.min(Math.ceil(base*.6),Math.floor(p.decadence/20));}
export function weakReference(s,song){
 const authors=song.authors||[];
 const references=authors.map(id=>{const others=s.songs.filter(x=>x.id!==song.id&&x.authors.includes(id)).map(x=>x.quality).sort((a,b)=>b-a).slice(0,V71_RULES.referenceSongs).sort((a,b)=>a-b);return others.length>=3?others[Math.floor(others.length/2)]:null;}).filter(x=>x!==null);
 return references.length?references.reduce((a,b)=>a+b,0)/references.length:null;
}
export function classifySongs(s){for(const song of s.songs){song.qualityReference=weakReference(s,song);song.weak=!song.keepActive&&song.qualityReference!==null&&song.quality<song.qualityReference-V71_RULES.weakGap;}}
export function upgradeV71(s,random){
 nameRegistry(s);
 for(const p of s.people){
  initializeV71(p,random);
  const b=p.bag;
  for(const field of ['composition','cycleComposition','remaining','consumed'])b[field].decadence??=0;
  b.pendingRemoval ||= Object.fromEntries(ACTION_KEYS.map(k=>[k,0]));
  if(b.reserved){b.consumed[b.reserved]++;b.reserved=null;}
  for(const k of ACTION_KEYS)editTokens(p,k,b.composition[k]);
  const nuisance=decadenceCount(p);editTokens(p,'decadence',nuisance);p.decadenceTokens=nuisance;
  p.waitUntil=0;
  p.drafts ||= {};
  if(p.draft.projectId)p.drafts[p.draft.projectId]=structuredClone(p.draft);
  for(const j of s.jams)j.creditedPairs ||= [];
  if(p.action){const old=p.action,remaining=old.remaining;setupAction(p,random);old.remaining=remaining;old.duration=Math.max(1,old.elapsed+remaining);old.tokenStarted=true;if(old.key==='jam'){const j=s.jams.find(x=>x.id===old.sessionId);if(j?.songId&&j.groupId){old.key='practice';old.groupId=j.groupId;old.songId=j.songId;old.content='song';old.sessionId=null;}}}
 }
 for(const project of s.projects){project.authors||=[project.author];project.authorNames||=Object.fromEntries(project.authors.map(id=>[id,s.people.find(p=>p.id===id)?.name||"Ancien voisin"]));project.groupId??=null;project.minutes??=0;project.contributions||={};}
 // Legacy completed songs remain unchanged until a new composition triggers classification.
 s.version='0.7.1';
}
export function validateV71(s){
 const finite=(x,a=0,b=1e9)=>Number.isFinite(x)&&x>=a&&x<=b;
 if(!Array.isArray(s.musicNames)||new Set(s.musicNames.map(x=>x.normalized)).size!==s.musicNames.length||s.musicNames.some(x=>!['group','song'].includes(x.kind)||typeof x.name!=='string'||!x.name.trim()||x.normalized!==normalizeName(x.name)))throw Error('Registre musical invalide.');
 for(const p of s.people){
  if(!p.actionRanges||ACTION_KEYS.some(k=>!finite(p.actionRanges[k]?.min,1)||!finite(p.actionRanges[k]?.max,p.actionRanges[k].min)))throw Error('Fourchettes invalides.');
  if(!Array.isArray(p.secondaryInstruments)||p.secondaryInstruments.some(k=>k===p.instrument||k==='writing'||!(k in p.skills)))throw Error('Instruments secondaires invalides.');
  if(!p.learningWork||Object.keys(p.skills).some(k=>!finite(p.learningWork[k],0,V71_RULES.learningPlateau)))throw Error('Travail d’apprentissage invalide.');
  if(!p.songMastery||Object.values(p.songMastery).some(x=>!finite(x,0,100)))throw Error('Maîtrise personnelle invalide.');
  if(!Array.isArray(p.excessEpisodes)||p.excessEpisodes.some(x=>!finite(x))||!Number.isInteger(p.decadenceTokens)||p.decadenceTokens<0)throw Error('Chaîne de déchéance invalide.');
  if(!p.drafts||Object.values(p.drafts).some(d=>!finite(d.samples)||!d.emotions||Object.values(d.emotions).some(x=>!finite(x))))throw Error('Brouillons multiples invalides.');
 }
 for(const p of s.people){const a=p.action;if(a&&a.key!=='sleep'&&(!finite(a.duration,1)||!finite(a.cycleRemaining,1,V71_RULES.cycleMinutes)||!Number.isInteger(a.cycles)||a.cycles<0||!Array.isArray(a.admissionAttempts)||typeof a.admitted!=='boolean'||!(a.instrument in p.skills)||a.instrument==='writing'))throw Error('Séance personnelle invalide.');}
 for(const j of s.jams)if(!Array.isArray(j.creditedPairs)||j.creditedPairs.some(x=>typeof x!=='string'))throw Error('Crédit de séance invalide.');
 for(const project of s.projects)if(!Array.isArray(project.authors)||!project.authors.includes(project.author)||!finite(project.minutes)||!project.contributions||Object.values(project.contributions).some(x=>!finite(x)))throw Error('Contributions invalides.');
}
