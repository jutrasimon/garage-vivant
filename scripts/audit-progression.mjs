import {mkdir,writeFile} from 'node:fs/promises';
import {createWorld,step,restore} from '../dist/engine.mjs';
import {beginBandLiveConcert,commitBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {simulateBandLive} from '../dist/bandlive-auto.mjs';
import {completePerformance,nextSlot} from '../dist/life.mjs';
import {xpProgress} from '../dist/progression.mjs';

// Autonomous neighbourhoods; shows use the deterministic automatic player.
// This measures pacing rather than prescribing a daily practice quota.
const samples=[],firstShows=[],median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
for(let seed=1;seed<=12;seed++){
 const world=createWorld(seed,3,{setup:'varied'}),start=world.time,days=[];let guard=0;
 while(world.time<start+16*1440){
  if(++guard>50000)throw Error('La simulation ne progresse plus.');
  if(world.performance?.status==='playing'){
   const result=beginBandLiveConcert(world);if(!result.ok)throw Error(result.message);
   simulateBandLive(world.performance.bandLive.game,()=>commitBandLiveConcert(world,completePerformance));
   const record=world.showHistory.find(r=>r.id===world.performance.id);
   if(record.firstShow)firstShows.push(...record.individualXp.map(x=>({...x,day:(world.time-start)/1440})));
   nextSlot(world);continue;
  }
  if(world.showEventId){nextSlot(world);continue;}
  step(world);
  const day=(world.time-start)/1440;
  if([4,8,12,16].includes(day))days.push({day,people:world.people.map(p=>({id:p.id,xp:p.xp||0,level:xpProgress(p).level,shows:world.showHistory.filter(r=>r.individualXp?.some(x=>x.id===p.id)).length}))});
 }
 restore(world);samples.push({seed,days});
}
const summary=[4,8,12,16].map(day=>{
 const people=samples.flatMap(s=>s.days.find(d=>d.day===day).people);
 return {day,medianXp:median(people.map(p=>p.xp)),medianLevel:median(people.map(p=>p.level)),minXp:Math.min(...people.map(p=>p.xp)),maxXp:Math.max(...people.map(p=>p.xp)),medianShows:median(people.map(p=>p.shows))};
});
const report={method:'12 graines, 3 musiciens, 16 jours autonomes, shows simulés avec les vrais gains; niveaux non garantis à une date fixe.',summary,firstShow:{participants:firstShows.length,medianDay:median(firstShows.map(x=>x.day)),medianXpBefore:median(firstShows.map(x=>x.before)),medianXpAfter:median(firstShows.map(x=>x.after))},samples};
await mkdir('test-results',{recursive:true});await writeFile('test-results/progression-audit.json',JSON.stringify(report,null,2)+'\n');
console.table(summary);console.log('Rapport : test-results/progression-audit.json');
