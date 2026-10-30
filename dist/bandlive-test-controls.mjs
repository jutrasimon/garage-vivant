import {createBandLive,chooseSong,restoreBandLive} from './bandlive.mjs?v=0.9.0';

export function restartTestShow(source,{count=source.fans.length,seed=source.seed}={}){
 if(!Number.isInteger(count)||count<3||count>50)throw Error('Choisis de 3 à 50 spectateurs.');
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('La graine doit être un entier entre 0 et 4294967295.');
 const game=createBandLive({people:source.actors,groupId:source.groupId,groupName:source.groupName,songs:source.songs,seed,audienceSize:Math.min(12,count),audienceRules:source.audienceRules,songOrder:source.songOrder,freeSetlist:!!source.freeSetlist,spatial:true,catalog:source.catalog});
 game.physics=structuredClone(source.physics);game.room=structuredClone(source.room);
 const templates=game.fans;
 game.fans=Array.from({length:count},(_,i)=>({...structuredClone(templates[i%templates.length]),id:'f'+i,name:templates[i%templates.length].name+(i>=templates.length?' '+(Math.floor(i/templates.length)+1):'')}));
 // Fit the test crowd inside the same arena, without changing production placement.
 const cols=Math.min(10,Math.ceil(count/2)),rows=Math.ceil(count/cols),r=game.room;
 const dx=(r.width-2*r.margin)/Math.max(1,cols-1),dy=(r.height-2*r.margin)/Math.max(1,rows-1);
 let random=seed>>>0;const jitter=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296-.5;};
 for(const [i,fan] of game.fans.entries())fan.position={x:Math.max(r.margin,Math.min(r.width-r.margin,r.margin+i%cols*dx+jitter()*Math.min(30,Math.max(0,dx-64)))),y:Math.max(r.margin,Math.min(r.height-r.margin,r.margin+Math.floor(i/cols)*dy+jitter()*Math.min(24,Math.max(0,dy-64))))};
 game.initialFanHp=game.fans.map(f=>f.hp);
 chooseSong(game,game.songOrder?.[0]||source.usedSongs?.[0]||game.songs[0].id);
 return restoreBandLive(game,{laboratory:true});
}

export function setTestResources(game,energy,tempo){
 if(!Number.isInteger(energy)||energy<0||energy>3||!Number.isInteger(tempo)||tempo<0||tempo>10)throw Error('Énergie : 0 à 3. Tempo : 0 à 10.');
 game.energy=energy;game.tempo=tempo;
}

export function redrawTestHand(game){
 if(game.phase!=='play')throw Error('Redémarre le show pour reprendre les essais.');
 game.deck.push(...game.discard.splice(0),...game.hand.splice(0));
 game.hand=game.deck.splice(0,5);
}
