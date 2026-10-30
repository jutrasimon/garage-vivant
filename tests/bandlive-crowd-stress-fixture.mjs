import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {beginBandLiveConcert} from '../dist/bandlive-concert.mjs';
import {chooseSong} from '../dist/bandlive.mjs';
import {compileCard,duplicateCard,newEffect} from '../dist/bandlive-catalog.mjs';

// A direct module stress scene, independent of the playable audience-size limit.
export function crowdStressFixture(count=50){
 const world=preparedConcert({large:true,instruments:['drums','keys','voice']}).world,game=beginBandLiveConcert(world).game;chooseSong(game,game.songs[0].id);
 const original=game.fans;
 game.fans=Array.from({length:count},(_,i)=>({...structuredClone(original[i%original.length]),id:'f'+i,name:'Fan '+i,hp:100,max:100,conquered:false,effect:'spotlight',reactionUsed:false,intent:'bored',position:{x:80+i%10*106,y:52+Math.floor(i/10)*64}}));game.initialFanHp=game.fans.map(f=>f.hp);
 const card=game.cards.find(c=>c.kind==='note'),recipe=duplicateCard(game.catalog,'drums:note');Object.assign(recipe,{target:'point',radius:1.2,coreRadius:.45,effects:[newEffect('power'),newEffect('vortex'),newEffect('tempo')]});card.kind=recipe.id;card.definition=compileCard(recipe);game.hand=[card.id];game.discard=[];game.deck=game.cards.filter(c=>c.id!==card.id).map(c=>c.id);
 return {world,game,card};
}
