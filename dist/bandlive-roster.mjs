import {activeGroup} from './groups.mjs?v=0.8.7';
import {eligibleSongs} from './life.mjs?v=0.8.7';
import {RULES,createBandLive} from './bandlive.mjs?v=0.8.7';

// Resolve only the module's draft. Group membership, canonical songs, mastery
// and the world's RNG are read without being changed.
export function resolveBandLivePlan(world,draft,{canStart=true}={}) {
  const groups=world.groups.filter(activeGroup);
  if(!groups.some(g=>g.id===draft.groupId)){
    draft.groupId=(groups.find(g=>g.members.includes(world.playerId))||groups[0])?.id||'';
    draft.memberIds=null;
  }
  const group=groups.find(g=>g.id===draft.groupId)||null;
  const people=group?group.members.map(id=>world.people.find(p=>p.id===id)).filter(Boolean):[];
  draft.memberIds=Array.isArray(draft.memberIds)?[...new Set(draft.memberIds)].filter(id=>people.some(p=>p.id===id)):people.slice(0,RULES.maxMembers).map(p=>p.id);
  if(!Number.isInteger(draft.seed)||draft.seed<0||draft.seed>4294967295)draft.seed=2040;
  if(!Number.isInteger(draft.audienceSize)||draft.audienceSize<RULES.minAudience||draft.audienceSize>RULES.maxAudience)draft.audienceSize=RULES.minAudience;
  const members=draft.memberIds.map(id=>people.find(p=>p.id===id));
  const songs=group?eligibleSongs(world,group).map(song=>({
    id:`song-${song.id}`,sourceSongId:song.id,title:song.title,style:song.genre,
    authors:[...song.authors],authorNames:song.authors.map(id=>song.authorNames?.[id]||world.people.find(p=>p.id===id)?.name||id),
    quality:song.quality,...(song.turns!==undefined?{turns:song.turns}:{}),mastery:group.repertoire.find(r=>r.songId===song.id).mastery,
  })):[];
  if(group&&!songs.length)songs.push({id:'jam-'+group.id,sourceSongId:null,title:'Jam libre',style:group.genre,quality:40,mastery:0,turns:3,authors:[...group.members],authorNames:people.map(p=>p.name)});
  const reason=!group?'Crée un groupe dans le quartier pour jouer avec BandLive.':members.length<RULES.minMembers?'Choisis au moins deux musiciens du groupe.':members.length>RULES.maxMembers?'Choisis vingt-quatre musiciens maximum pour BandLive.':!songs.length?'Adopte une composition dans le répertoire du groupe pour prendre la scène.':!canStart?'Termine le spectacle en cours avant de prendre la scène avec BandLive.':'';
  return {groups,group,people,members,songs,ready:!reason,reason};
}

export function createBandLiveFromWorld(world,draft) {
  const plan=resolveBandLivePlan(world,draft);
  if(!plan.ready)throw Error(plan.reason);
  return createBandLive({people:plan.members,groupId:plan.group.id,groupName:plan.group.name,songs:plan.songs,seed:draft.seed,audienceSize:draft.audienceSize});
}
