import {catalogCard,compileCard,catalogStarter,offeredCards} from './bandlive-catalog.mjs?v=0.9.0';
export const INSTRUMENTS = Object.freeze({guitar:'Guitare',drums:'Batterie',bass:'Basse',voice:'Chant',keys:'Clavier',sax:'Saxophone',trumpet:'Trompette',percussion:'Percussions'});
export const SPECIALS = Object.freeze(Object.fromEntries(Object.entries({
  guitar:{name:'Solo',cost:2,target:'single',power:8,useTempo:true,solo:true,description:'8 puissance + tout le tempo sur un spectateur. Consomme le tempo.'},
  drums:{name:'Pulsation',cost:1,target:'audience',tempo:4,description:'+4 tempo.'},
  bass:{name:'Soutien',cost:0,target:'audience',tempo:1,boost:3,description:'+1 tempo. +3 puissance à la prochaine carte de puissance du tour.'},
  voice:{name:'Refrain',cost:2,target:'audience',power:5,description:'5 puissance sur tous les spectateurs.'},
  keys:{name:'Accord',cost:1,target:'audience',power:2,tempo:2,description:'+2 tempo. 2 puissance sur tous les spectateurs.'},
  sax:{name:'Improvisation',cost:2,target:'audience',power:0,useTempo:true,description:'Tout le tempo en puissance sur chaque spectateur. Consomme le tempo.'},
  trumpet:{name:'Fanfare',cost:0,target:'audience',tempo:2,description:'+2 tempo.'},
  percussion:{name:'Roulement',cost:1,target:'audience',tempo:1,boost:5,description:'+1 tempo. +5 puissance à la prochaine carte de puissance du tour.'},
}).map(([key,value])=>[key,Object.freeze(value)])));
export const NOTE = Object.freeze({name:'Note',cost:1,target:'single',power:6,description:'6 puissance sur un spectateur.'});

export const NEW_SPECIALS = Object.freeze({
  guitar:[{name:'Riff soutenu',cost:1,target:'single',power:5,tempoThreshold:4,thresholdPower:3,description:'5 puissance. +3 à partir de 4 tempo, sans le consommer.'},{name:'Accord explosif',cost:2,target:'single',power:8,consumeTempo:4,tempoMultiplier:2,description:'8 puissance. Consomme jusqu’à 4 tempo : +2 puissance par tempo consommé.'}],
  drums:[{name:'Mise en place',cost:1,target:'audience',tempo:3,draw:1,description:'+3 tempo. Pioche 1 carte.'},{name:'Frappe motrice',cost:1,target:'single',power:3,tempo:2,description:'3 puissance sur un spectateur. +2 tempo.'}],
  bass:[{name:'Groove stable',cost:1,target:'single',shape:'row',tempo:2,noBoredom:true,description:'+2 tempo. Empêche l’ennui de la rangée ciblée ce tour.'},{name:'Passage de relais',cost:1,target:'audience',relayBoost:4,draw:1,description:'Pioche 1 carte. +4 puissance à la prochaine carte de puissance d’un autre musicien ce tour.'}],
  voice:[{name:'Refrain entraînant',cost:1,target:'single',shape:'row',power:3,tempoThreshold:4,thresholdPower:2,description:'3 puissance sur une rangée. 5 à partir de 4 tempo, sans le consommer.'},{name:'Point culminant',cost:2,target:'audience',power:3,consumeTempo:3,description:'3 puissance sur tout le public. Consomme jusqu’à 3 tempo : +1 puissance par tempo consommé sur chaque cible.'}],
  keys:[{name:'Accord préparatoire',cost:1,target:'audience',tempo:2,draw:1,description:'+2 tempo. Pioche 1 carte.'},{name:'Harmonie expansive',cost:1,target:'single',shape:'row',power:3,consumeTempo:2,description:'3 puissance sur une rangée. Consomme jusqu’à 2 tempo : +1 puissance par tempo consommé sur chaque cible.'}],
  sax:[{name:'Phrase prolongée',cost:1,target:'single',power:5,tempoThreshold:3,thresholdDraw:1,description:'5 puissance. À partir de 3 tempo : pioche 1 carte, sans consommer le tempo.'},{name:'Écho mélodique',cost:2,target:'single',twoTargets:true,power:3,consumeTempo:4,description:'3 puissance sur 2 spectateurs distincts. Consomme jusqu’à 4 tempo une seule fois et ajoute cette quantité sur chaque cible.'}],
  trumpet:[{name:'Éclat cuivré',cost:1,target:'single',power:4,tempo:1,neighborTempo:2,description:'4 puissance et +1 tempo. Si un voisin immédiat est déjà conquis : +3 tempo au lieu de +1.'},{name:'Ralliement',cost:1,target:'single',shape:'row',tempo:2,turnStyle:true,description:'+2 tempo. Une rangée adopte le style de la chanson jusqu’à la fin du tour.'}],
  percussion:[{name:'Cadence croisée',cost:1,target:'audience',tempo:2,alternateTempo:2,description:'+2 tempo. +4 à la place si la carte précédente de ce tour vient d’un autre musicien.'},{name:'Frappe syncopée',cost:1,target:'single',power:4,tempo:1,tempoOnConquest:2,tempoCap:2,description:'4 puissance et +1 tempo. Si cette carte conquiert sa cible : +2 tempo supplémentaires.'}],
});
export const CARD_KINDS=Object.freeze(['note','special','new1','new2']);
export const starterDeck=()=>['note','note','note','special','special'];
export const specialChoices=(instrument,catalog,level=1,seed='')=>catalog?offeredCards(catalog,instrument,level,seed):['special','new1','new2'].map(kind=>({kind,...definitionFor(instrument,kind)}));
export function definitionFor(instrument,kind,catalog){if(catalog){const c=catalogCard(catalog,instrument,kind);if(c)return compileCard(c);}return kind==='note'?NOTE:kind==='special'?SPECIALS[instrument]:NEW_SPECIALS[instrument]?.[kind==='new1'?0:kind==='new2'?1:-1];}
export function validateDeck(deck){if(!Array.isArray(deck)||deck.length!==5||deck.some(k=>typeof k!=='string'||!CARD_KINDS.includes(k)&&!/^[-a-z0-9]+:[-a-z0-9:]{1,70}$/.test(k)))throw Error('Deck BandLive invalide.');return deck;}
export function validatePersonDecks(person,catalog){
  if(person.bandLiveDecks===undefined)return;
  const decks=person.bandLiveDecks;
  if(!decks||typeof decks!=='object'||Array.isArray(decks)||Object.keys(decks).some(k=>!Object.hasOwn(INSTRUMENTS,k)))throw Error('Collection de decks BandLive invalide.');
  Object.values(decks).forEach(validateDeck);
  for(const [instrument,deck] of Object.entries(decks))for(const kind of deck)if((catalog||!CARD_KINDS.includes(kind))&&!catalogCard(catalog||{cards:[]},instrument,kind))throw Error('Carte du deck absente du catalogue.');
  for(const reward of person.levelRewards||[])if(reward.status==='claimed')for(const kind of [reward.before,reward.after])if((catalog||!CARD_KINDS.includes(kind))&&!catalogCard(catalog||{cards:[]},reward.instrument,kind))throw Error('Carte déjà améliorée absente du catalogue. Conserve sa définition et retire-la plutôt que de la supprimer.');
}
export function musicianDeck(person,instrument=person.instrument,catalog){
  if(!Object.hasOwn(INSTRUMENTS,instrument))throw Error('Instrument BandLive invalide.');
  validatePersonDecks(person,catalog);
  return [...validateDeck(person.bandLiveDecks?.[instrument]||(catalog?catalogStarter(catalog,instrument):starterDeck()))];
}
export function rememberInstrumentDeck(person,instrument=person.instrument,catalog){
  const deck=musicianDeck(person,instrument,catalog);person.bandLiveDecks??={};person.bandLiveDecks[instrument]=deck;return deck;
}
export function changeBandLiveInstrument(person,instrument,catalog){
  if(!Object.hasOwn(INSTRUMENTS,instrument))throw Error('Instrument BandLive invalide.');
  rememberInstrumentDeck(person,person.instrument,catalog);rememberInstrumentDeck(person,instrument,catalog);person.instrument=instrument;
}
