// One persistent experience pool. Thresholds: 40, 120, 240, 400, 600…
export const levelThreshold=level=>20*(level-1)*level;
export function xpProgress(person){
 const xp=person.xp||0,level=1+Math.floor((Math.sqrt(1+xp/5)-1)/2),start=levelThreshold(level),next=levelThreshold(level+1);
 return {xp,level,earned:xp-start,needed:next-start,next,percent:(xp-start)/(next-start)*100};
}
export function grantXp(person,amount){
 if(!Number.isSafeInteger(amount)||amount<=0)throw Error('Gain d’XP invalide.');
 const before=xpProgress(person);person.xp=before.xp+amount;
 const after=xpProgress(person);
 for(let level=before.level+1;level<=after.level;level++){person.levelRewards??=[];person.levelRewards.push({level,instrument:person.instrument,status:'pending'});}
 return {id:person.id,name:person.name,before:before.xp,after:after.xp,gain:amount,levelBefore:before.level,levelAfter:after.level};
}
