import {catalogCard,compileCard,validateCatalog} from './bandlive-catalog.mjs?v=0.9.0';
import {restoreBandLive} from './bandlive.mjs?v=0.9.0';

// Live editing changes future casts; completed hits and the current turn stay intact.
export function applyShowCard(game,card){
 if(!game?.spatialVersion||!game.catalog||!['choose','play'].includes(game.phase))throw Error('Ouvre un show physique en cours pour y appliquer la carte.');
 validateCatalog({format:'garage-vivant-bandlive-cards',version:1,cards:[card]},{starters:false});
 const next=structuredClone(game),old=next.catalog.cards.find(c=>c.id===card.id);
 const matches=next.cards.filter(c=>catalogCard(next.catalog,c.instrument,c.kind)?.id===card.id);
 if(matches.some(c=>![c.instrument,'neutral'].includes(card.instrument)))throw Error('Cette carte doit garder un instrument compatible avec ses musiciens, ou devenir Neutre.');
 if(old?.starter&&old.instrument!==card.instrument)throw Error('Pour changer l’instrument d’une carte de départ pendant le show, duplique-la d’abord.');
 const recipe={...structuredClone(card),starter:old?.starter??0,enabled:old?.enabled??true};
 if(old?.legacyKind)recipe.legacyKind=old.legacyKind;else delete recipe.legacyKind;
 let slot=matches.find(c=>next.hand.includes(c.id))||matches[0];
 if(!slot){
  const owner=next.actors.find(a=>a.instrument===card.instrument)||(card.instrument==='neutral'?next.actors[0]:null);
  if(!owner)throw Error('Aucun musicien de cet instrument ne participe au show. Utilise une carte Neutre ou le labo.');
  slot=next.cards.find(c=>c.actorId===owner.id&&next.hand.includes(c.id))||next.cards.find(c=>c.actorId===owner.id);
  slot.kind=recipe.legacyKind||recipe.id;owner.bandLiveDeck[Number(slot.id.split(':').at(-1))]=slot.kind;
 }
 if(old)next.catalog.cards[next.catalog.cards.indexOf(old)]=recipe;
 else{
  if(next.catalog.cards.length===256){const used=new Set(game.cards.map(c=>catalogCard(game.catalog,c.instrument,c.kind)?.id)),unused=next.catalog.cards.find(c=>!c.starter&&!used.has(c.id));if(!unused)throw Error('Le catalogue de ce show est plein.');next.catalog.cards=next.catalog.cards.filter(c=>c!==unused);}
  next.catalog.cards.push(recipe);
 }
 for(const c of matches.length?matches:[slot])c.definition=compileCard(recipe);
 // Keep a five-card hand and move a copy here without refunding energy or tempo.
 if(!next.hand.includes(slot.id)){
  next.deck=next.deck.filter(id=>id!==slot.id);next.discard=next.discard.filter(id=>id!==slot.id);
  if(next.phase==='play'){if(next.hand.length===5)next.deck.push(next.hand.pop());next.hand.push(slot.id);}else next.deck.push(slot.id);
 }
 return {game:restoreBandLive(next),cardId:slot.id,updated:matches.length||1,inserted:!matches.length};
}
