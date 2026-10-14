import {INSTRUMENTS,validatePersonDecks} from './bandlive-cards.mjs?v=0.9.0';
import {EFFECTS,CONDITIONS,RARITIES,createCatalog,validateCatalog,compileCard,newEffect,duplicateCard,retireCard} from './bandlive-catalog.mjs?v=0.9.0';
import {cardFace,escapeCard as esc} from './card-view.mjs?v=0.9.0';
const options=(values,selected)=>Object.entries(values).map(([id,name])=>`<option value="${esc(id)}" ${id===String(selected)?'selected':''}>${esc(name)}</option>`).join('');
export function createCardEditor({getWorld,onSave,onTest}){
 const host=document.createElement('section');host.className='bl-card-editor';host.hidden=true;host.role='dialog';host.setAttribute('aria-label','Atelier de cartes');host.setAttribute('aria-modal','true');document.body.append(host);
 let owner,draft,selected,category='guitar',showRetired=false,history=[],status='',previousFocus;
 const card=()=>draft.cards.find(c=>c.id===selected);
 const remember=()=>{history.push(JSON.stringify(draft));history=history.slice(-30);};
 function field(label,key,value,{select,min=0,max=100,step=1,type='number',effect=null}={}){return `<label>${esc(label)}${select?`<select data-ce-field="${key}" ${effect!==null?`data-ce-effect="${effect}"`:''}>${options(select,value)}</select>`:`<input data-ce-field="${key}" ${effect!==null?`data-ce-effect="${effect}"`:''} type="${type}" value="${esc(value)}" ${type==='number'?`min="${min}" max="${max}" step="${step}"`:''}>`}</label>`;}
 function effectHTML(e,i){
  const fields=Object.entries(EFFECTS[e.type].fields).filter(([key])=>e.type!=='power'||!['limit','multiplier'].includes(key)||e.formula!=='fixed').filter(([key])=>key!=='limit'||e.formula==='spend').map(([k,f])=>field(f.label,k,e[k],{effect:i,select:f.options,min:f.min,max:f.max,step:f.step})).join('');
  return `<fieldset class="ce-effect"><legend>Effet ${i+1}</legend><div class="ce-effect-head">${field('Effet','type',e.type,{effect:i,select:Object.fromEntries(Object.entries(EFFECTS).map(([k,v])=>[k,v.name]))})}<button data-ce-action="up" data-index="${i}" ${!i?'disabled':''} aria-label="Monter l’effet ${i+1}">↑</button><button data-ce-action="down" data-index="${i}" ${i===card().effects.length-1?'disabled':''} aria-label="Descendre l’effet ${i+1}">↓</button><button data-ce-action="remove-effect" data-index="${i}" ${card().effects.length===1?'disabled':''}>Retirer l’effet</button></div><div class="ce-fields">${fields}${field('Condition','when',e.when,{effect:i,select:CONDITIONS})}${e.when==='tempo'?field('Seuil de tempo','conditionValue',e.conditionValue??3,{effect:i,min:0,max:10}):''}${e.type==='power'?`<label><input data-ce-threshold="${i}" type="checkbox" ${e.threshold?'checked':''}> Bonus à partir d’un seuil de tempo</label>${e.threshold?field('Seuil','threshold-tempo',e.threshold.tempo,{effect:i,max:10})+field('Bonus','threshold-bonus',e.threshold.bonus,{effect:i,max:30}):''}`:''}</div></fieldset>`;
 }
 function preview(){const c=card();
  const crown=host.querySelector('[data-ce-crown]');if(crown)crown.hidden=!c.coreRadius;
  for(const el of host.querySelectorAll('[data-ce-starter]')){const count=draft.cards.filter(x=>x.enabled&&[el.dataset.ceStarter,'neutral'].includes(x.instrument)).reduce((n,x)=>n+x.starter,0);el.querySelector('b').textContent=`${count}/5`;el.classList.toggle('ce-error',count!==5);}
  for(const el of host.querySelectorAll('[data-ce-select]')){const item=draft.cards.find(x=>x.id===el.dataset.ceSelect);el.querySelector('strong').textContent=item.name;el.querySelector('small').textContent=`${item.cost} �nergie � ${RARITIES[item.rarity].name} � niv. ${item.minLevel}${item.enabled?'':' � retir�e'}`;}
  host.querySelector('[data-ce-action="undo"]').disabled=!history.length;
host.querySelector('.ce-preview-card').innerHTML=cardFace({card:compileCard(c),owner:INSTRUMENTS[c.instrument]||'Neutre',instrument:c.instrument==='neutral'?'voice':c.instrument});host.querySelector('[data-ce-status]').textContent=status;}
 function render(){
  const list=draft.cards.filter(c=>c.instrument===category&&(showRetired||c.enabled));if(!list.some(c=>c.id===selected))selected=list[0]?.id;
  const c=card();host.innerHTML=`<header><div><small>BANDLIVE · CRÉATION</small><h2>Atelier de cartes</h2></div><button data-ce-action="close" aria-label="Fermer l’atelier">✕</button></header><div class="ce-body"><aside>${field('Instrument','category',category,{select:{...INSTRUMENTS,neutral:'Neutre · tous les musiciens'}})}<label><input data-ce-retired type="checkbox" ${showRetired?'checked':''}> Voir les cartes retirées</label><button data-ce-action="new">＋ Nouvelle carte</button><div class="ce-card-list" role="navigation" aria-label="Cartes de cet instrument">${list.map(x=>`<button data-ce-select="${esc(x.id)}" aria-current="${x.id===selected?'true':'false'}"><strong>${esc(x.name)}</strong><small>${x.cost} énergie · ${RARITIES[x.rarity].name} · niv. ${x.minLevel}${x.enabled?'':' · retirée'}</small></button>`).join('')}</div></aside><main>${c?`<div class="ce-card-actions"><button data-ce-action="duplicate">Dupliquer la carte</button><button data-ce-action="${c.enabled?'retire':'restore'}">${c.enabled?'Retirer la carte':'Restaurer la carte'}</button></div><div class="ce-fields">${field('Nom','name',c.name,{type:'text'})}${!c.legacyKind?field('Instrument de la carte','instrument',c.instrument,{select:{...INSTRUMENTS,neutral:'Neutre · tous les musiciens'}}):''}${field('Coût en énergie','cost',c.cost,{max:3})}${field('Rareté','rarity',c.rarity,{select:Object.fromEntries(Object.entries(RARITIES).map(([k,v])=>[k,v.name]))})}${field('Niveau minimal d’obtention','minLevel',c.minLevel,{min:1,max:100})}${field('Exemplaires au départ','starter',c.starter,{max:5})}${field('Cible','target',c.target,{select:{single:'Un spectateur',duo:'Deux spectateurs',audience:'Tout le public',radius:'Zone autour d’un spectateur',point:'Endroit au sol'}})}${['radius','point'].includes(c.target)?field('Rayon extérieur','radius',c.radius,{min:.2,max:3,step:.1})+field('Rayon du cœur (0 = zone uniforme)','coreRadius',c.coreRadius,{min:0,max:3,step:.1})+`<div data-ce-crown ${c.coreRadius?'':'hidden'}>${field('Puissance de la couronne','outerScale',c.outerScale,{min:0,max:1,step:.1})}</div>`:''}</div><p class="ce-note">Les effets se jouent dans cet ordre. La conquête en chaîne suit les effets de la carte. Les ressources sont plafonnées; la main contient au plus cinq cartes.</p>${c.effects.map(effectHTML).join('')}<button data-ce-action="add-effect" ${c.effects.length>=12?'disabled':''}>＋ Ajouter un effet</button>`:'<p>Crée une carte pour cet instrument.</p>'}</main><aside class="ce-preview"><h3>Aperçu</h3><div class="ce-preview-card"></div><button data-ce-action="test" ${!c?'disabled':''}>Tester dans la foule ↗</button><p>Le test utilise une copie du show. Les changements du catalogue s’appliquent aux prochains shows.</p><h3>Decks de départ</h3>${Object.entries(INSTRUMENTS).map(([id,name])=>{const count=draft.cards.filter(x=>x.enabled&&[id,'neutral'].includes(x.instrument)).reduce((n,x)=>n+x.starter,0);return `<p data-ce-starter="${id}" class="${count!==5?'ce-error':''}">${name} : <b>${count}/5</b></p>`;}).join('')}<p>Les cartes neutres sont proposées à tous les instruments. Les cartes retirées restent dans les decks déjà acquis.</p></aside></div><footer><p data-ce-status role="status">${esc(status)}</p><div><button data-ce-action="undo" ${!history.length?'disabled':''}>Annuler</button><button data-ce-action="export">Exporter JSON</button><button data-ce-action="import">Importer JSON</button><input data-ce-file type="file" accept="application/json" hidden><button data-ce-action="save" class="primary">Appliquer le catalogue</button></div></footer>`;
  if(c)preview();
 }
 function close(){host.hidden=true;previousFocus?.focus?.();}
 host.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')close();if(e.key==='Tab'){const elements=[...host.querySelectorAll('button:not([disabled]),input:not([hidden]),select,textarea')].filter(el=>el.offsetParent!==null),first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 host.addEventListener('input',e=>{
  const el=e.target;if(!el.matches('[data-ce-field]')||el.tagName==='SELECT')return;
  const c=card(),key=el.dataset.ceField;if(!c)return;remember();const value=el.type==='number'?Number(el.value):el.value;
  if(el.dataset.ceEffect!==undefined){const effect=c.effects[Number(el.dataset.ceEffect)];if(key.startsWith('threshold-'))effect.threshold[key.slice(10)]=value;else effect[key]=value;}else c[key]=value;
  status='Brouillon modifié.';preview();
 });
 host.addEventListener('change',async e=>{
  const el=e.target;if(el.matches('[data-ce-file]')){try{const value=JSON.parse(await el.files[0].text());validateCatalog(value);remember();draft=value;status='Catalogue importé en brouillon.';render();}catch(error){status=error.message;host.querySelector('[data-ce-status]').textContent=status;}return;}
  if(el.matches('[data-ce-retired]')){showRetired=el.checked;render();return;}
  if(el.matches('[data-ce-threshold]')){remember();const effect=card().effects[Number(el.dataset.ceThreshold)];if(el.checked)effect.threshold={tempo:3,bonus:2};else delete effect.threshold;render();return;}
  if(el.matches('input[data-ce-field]'))return;
  if(el.tagName!=='SELECT'||!el.matches('[data-ce-field]'))return;
  const key=el.dataset.ceField;if(key==='category'){category=el.value;render();return;}remember();
  if(el.dataset.ceEffect!==undefined){const i=Number(el.dataset.ceEffect);if(key==='type')card().effects[i]=newEffect(el.value);else{card().effects[i][key]=el.value;if(key==='when'&&el.value==='tempo')card().effects[i].conditionValue=3;}}else{card()[key]=el.value;if(key==='instrument')category=el.value;}
  render();
 });
 host.addEventListener('click',async e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.ceSelect){selected=button.dataset.ceSelect;render();return;}
  const action=button.dataset.ceAction,c=card();if(!action)return;
  try{
   if(action==='close'){close();return;}
   if(action==='save'){validateCatalog(draft);for(const person of getWorld().people)validatePersonDecks(person,draft);getWorld().cardCatalog=structuredClone(draft);onSave();status='Catalogue appliqué aux prochains shows. Les shows en cours gardent leurs règles.';history=[];render();return;}
   if(action==='test'){validateCatalog({...draft,cards:[c]},{starters:false});onTest(structuredClone(c));close();return;}
   if(action==='export'){const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='BandLive-cartes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
   if(action==='import'){host.querySelector('[data-ce-file]').click();return;}
   if(action==='undo'){if(history.length)draft=JSON.parse(history.pop());render();return;}
   remember();
   if(action==='duplicate'){selected=duplicateCard(draft,selected).id;status='Copie indépendante créée.';}
   if(action==='retire'){retireCard(draft,selected);status='Carte retirée. Complète le deck de départ si nécessaire avant d’appliquer.';}
   if(action==='restore'){c.enabled=true;status='Carte restaurée.';}
   if(action==='new'){const source=draft.cards.find(x=>x.instrument===category)||{...createCatalog().cards[0],instrument:category};if(!draft.cards.includes(source))draft.cards.push({...source,id:category+':template',starter:0});const copy=duplicateCard(draft,source.id);copy.name='Nouvelle carte';copy.effects=[newEffect()];selected=copy.id;}
   if(action==='add-effect')c.effects.push(newEffect());
   if(action==='remove-effect')c.effects.splice(Number(button.dataset.index),1);
   if(action==='up'||action==='down'){const i=Number(button.dataset.index),j=i+(action==='up'?-1:1);[c.effects[i],c.effects[j]]=[c.effects[j],c.effects[i]];}
   render();
  }catch(error){status=error.message;host.querySelector('[data-ce-status]').textContent=status;}
 });
 return {open(){previousFocus=document.activeElement;if(!draft||owner!==getWorld()){owner=getWorld();draft=structuredClone(owner.cardCatalog||createCatalog());history=[];}host.hidden=false;render();host.querySelector('button').focus();},close};
}
