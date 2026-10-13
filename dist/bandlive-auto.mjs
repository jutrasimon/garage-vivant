import {songTurns} from './song-rules.mjs?v=0.8.0';
import {availableSongs,chooseSong,canPlay,cardById,cardDefinition,previewCard,playCard,endTurn} from './bandlive.mjs?v=0.8.0';

// Duration first, then the share of the venue audience with a matching style.
export function rankShowSongs(songs,styles=[]){
  const affinity=s=>styles.filter(style=>style===s.style).length;
  return songs.map((song,index)=>({song,index})).sort((a,b)=>songTurns(b.song)-songTurns(a.song)||affinity(b.song)-affinity(a.song)||a.index-b.index).map(x=>x.song);
}
export function shortlistShowSongs(songs,styles=[]){return songs.length>6?rankShowSongs(songs,styles).slice(0,6):songs;}

// Use the real resolver, including two-target cards, row effects and conquest
// chains. Deterministic greedy play; it does not guarantee a successful show.
export function chooseAutomaticMove(game){
  let best=null;const alive=game.fans.filter(f=>f.hp>0);
  for(const id of game.hand){
    if(!canPlay(game,id))continue;
    const d=cardDefinition(cardById(game,id));
    for(const target of d.target==='single'?alive:[null]){
      for(const second of d.twoTargets?alive.filter(f=>f!==target):[null]){
        for(const discardId of d.discard?game.hand.filter(x=>x!==id):[null]){
          const options={...(second?{secondTargetId:second.id}:{}),...(discardId?{discardId}:{})};
          const result=previewCard(game,id,target?.id,options);if(!result.ok)continue;
          const next=result.game;
          const power=game.fans.reduce((n,f,i)=>n+f.hp-next.fans[i].hp+(f.hp>0&&next.fans[i].hp===0?5:0),0);
          const support=Math.max(0,next.tempo-game.tempo)*1.6+Math.max(0,next.boost-game.boost)*1.4+(d.relayBoost||0)+Math.max(0,next.hand.length-game.hand.length+1)*2+(d.noBoredom?2:0)+(d.turnStyle?2:0);
          const score=(power+support)/(d.cost+.65);
          if(score>0&&(!best||score>best.score))best={id,targetId:target?.id,options,score};
        }
      }
    }
  }
  return best;
}
export function simulateBandLive(game,onStep=()=>{}){
  let guard=0;
  while(!['won','lost'].includes(game.phase)){
    if(++guard>500)throw Error('La simulation a dépassé sa limite d’actions.');
    if(game.phase==='choose'){
      const songs=rankShowSongs(availableSongs(game),game.fans.filter(f=>f.hp>0).map(f=>f.favorite));
      if(!songs.length)throw Error('Aucune chanson disponible.');
      chooseSong(game,songs[0].id);
    }else{
      const move=chooseAutomaticMove(game);
      if(move)playCard(game,move.id,move.targetId,move.options);else endTurn(game);
    }
    onStep();
  }
  return game;
}
