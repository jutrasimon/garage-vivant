import {catalogCard,compileCard,validateCatalog} from './bandlive-catalog.mjs?v=0.9.0';
import {restoreBandLive} from './bandlive.mjs?v=0.9.0';

// Replace only the temporary card. Crowd, turn history and physical settings stay live.
export function replaceLabCard(game,card,{original=null}={}){
 validateCatalog({format:'garage-vivant-bandlive-cards',version:1,cards:[card]},{starters:false});
 const next=structuredClone(game),previous=next.cards.filter(c=>c.kind==='lab:test'),recipes=next.catalog.cards.filter(c=>c.id!=='lab:test');
 for(const c of previous){
  const old=next.catalog.cards.find(x=>x.id==='lab:test'),fromShow=original?.cards.find(x=>x.id===c.id&&x.instrument===c.instrument);
  const find=kind=>typeof kind==='string'?catalogCard({cards:recipes},c.instrument,kind):null;
  const source=find(old?.labSourceKind)||find(fromShow?.kind)||recipes.find(x=>[c.instrument,'neutral'].includes(x.instrument));
  if(!source)throw Error('Aucune carte disponible pour remplacer le précédent essai.');
  c.kind=source.legacyKind||source.id;c.definition=compileCard(source);
  next.actors.find(a=>a.id===c.actorId).bandLiveDeck[Number(c.id.split(':').at(-1))]=c.kind;
 }
 next.catalog.cards=recipes;
 const owner=next.actors.find(a=>a.instrument===card.instrument)||next.actors[0];
 const slot=previous.find(c=>c.actorId===owner.id)||next.cards.find(c=>c.actorId===owner.id&&next.hand.includes(c.id))||next.cards.find(c=>c.actorId===owner.id);
 const recipe={...structuredClone(card),id:'lab:test',instrument:owner.instrument,starter:0,enabled:true,labSourceKind:slot.kind};delete recipe.legacyKind;
 // A full catalog can drop an unused, non-starting entry in the isolated copy.
 if(next.catalog.cards.length===256){const used=new Set(next.cards.map(c=>catalogCard(next.catalog,c.instrument,c.kind)?.id)),unused=next.catalog.cards.find(c=>!c.starter&&!used.has(c.id));if(!unused)throw Error('Le catalogue du laboratoire est plein.');next.catalog.cards=next.catalog.cards.filter(c=>c!==unused);}
 next.catalog.cards.push(recipe);owner.bandLiveDeck[Number(slot.id.split(':').at(-1))]='lab:test';slot.kind='lab:test';slot.definition=compileCard(recipe);
 const hand=next.hand.filter(id=>id!==slot.id);next.deck=next.deck.filter(id=>id!==slot.id);next.discard=next.discard.filter(id=>id!==slot.id);
 if(hand.length===5)next.deck.push(hand.pop());next.hand=[slot.id,...hand];next.energy=3;
 return restoreBandLive(next);
}
