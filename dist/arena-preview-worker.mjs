import {arenaPreview} from './arena-engine.mjs?v=0.9.0';
let game;
self.onmessage=({data})=>{
 if(data.game){game=data.game;return;}
 const start=performance.now();try{const result=arenaPreview(game,data.card,data.target,data.point);self.postMessage({sequence:data.sequence,key:data.key,result:result.ok?{ok:true,event:result.event,areas:result.areas,effects:result.effects.filter(e=>e.type==='conquest'||e.type==='motion').map(e=>e.type==='motion'?{type:e.type,targets:e.targets}:e),game:{energy:result.game.energy,tempo:result.game.tempo,boost:result.game.boost,hand:result.game.hand,fans:result.game.fans.map(({id,hp,max,reactionUsed})=>({id,hp,max,reactionUsed}))}}:result,ms:performance.now()-start});}catch(error){self.postMessage({sequence:data.sequence,key:data.key,error:error.message});}
};
