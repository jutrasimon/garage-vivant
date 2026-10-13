// Cumulative XP for levels 1–6. Beyond that, each interval grows by 40%.
const thresholds=[0,80,180,360,650,1100];
export const levelThreshold=level=>level<=thresholds.length?thresholds[level-1]:1100+Math.round(630*(1.4**(level-6)-1)/.4);
export function xpProgress(person){
 const xp=person.xp||0;let level=1;while(xp>=levelThreshold(level+1))level++;
 const start=levelThreshold(level),next=levelThreshold(level+1);
 return {xp,level,earned:xp-start,needed:next-start,next,percent:(xp-start)/(next-start)*100};
}
// Keep levels, rewards and progress within the level from early 0.8.0 trials.
export function migrateXp(person){
 if(person.xp===undefined||person.xpCurve===2)return;
 const xp=person.xp,level=1+Math.floor((Math.sqrt(1+xp/5)-1)/2),oldStart=20*(level-1)*level;
 const migrated=levelThreshold(level)+Math.floor((xp-oldStart)/(40*level)*(levelThreshold(level+1)-levelThreshold(level)));
 if(!Number.isSafeInteger(migrated)||migrated<0)throw Error('XP individuelle invalide.');
 person.xp=migrated;
 person.xpCurve=2;
}
export function grantXp(person,amount){
 if(!Number.isSafeInteger(amount)||amount<=0)throw Error('Gain d’XP invalide.');
 migrateXp(person);const before=xpProgress(person),xp=before.xp+amount;
 if(!Number.isSafeInteger(xp))throw Error('XP individuelle invalide.');
 person.xp=xp;person.xpCurve=2;
 const after=xpProgress(person);
 for(let level=before.level+1;level<=after.level;level++){person.levelRewards??=[];person.levelRewards.push({level,instrument:person.instrument,status:'pending'});}
 return {id:person.id,name:person.name,before:before.xp,after:after.xp,gain:amount,levelBefore:before.level,levelAfter:after.level};
}
