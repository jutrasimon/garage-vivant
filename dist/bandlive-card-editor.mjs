import {INSTRUMENTS,validatePersonDecks} from './bandlive-cards.mjs?v=0.9.0';
import {EFFECTS,CONDITIONS,RARITIES,createCatalog,validateCatalog,compileCard,newEffect,duplicateCard,retireCard} from './bandlive-catalog.mjs?v=0.9.0';
import {cardFace,escapeCard as esc} from './card-view.mjs?v=0.9.0';
import {cardFieldHelp} from './bandlive-card-help.mjs?v=0.9.0';
const options=(values,selected)=>Object.entries(values).map(([id,name])=>`<option value="${esc(id)}" ${id===String(selected)?'selected':''}>${esc(name)}</option>`).join('');
export function createCardEditor({getWorld,onSave,onTest}){
 const host=document.createElement('section');host.className='bl-card-editor';host.hidden=true;host.role='dialog';host.setAttribute('aria-label','Atelier de cartes');host.setAttribute('aria-modal','true');document.body.append(host);
 let owner,draft,selected,category='guitar',showRetired=false,history=[],status='',previousFocus;
 const card=()=>draft.cards.find(c=>c.id===selected);
 const remember=()=>{history.push(JSON.stringify(draft));history=history.slice(-30);};
 let activeHelp=null,helpTimer,helpFrame;
 const format=n=>Number(n).toLocaleString('fr-CA');
 function hideHelp(){clearTimeout(helpTimer);cancelAnimationFrame(helpFrame);if(activeHelp)activeHelp.hidden=true;activeHelp=null;}
 function showHelp(button){
  hideHelp();const tip=host.querySelector('#'+button.dataset.ceHelp);if(!tip)return;
  activeHelp=tip;tip.hidden=false;const anchor=button.getBoundingClientRect(),box=tip.getBoundingClientRect(),gap=10;
  const left=Math.max(gap,Math.min(anchor.left,innerWidth-box.width-gap));
  const below=anchor.bottom+gap,top=below+box.height<=innerHeight-gap?below:Math.max(gap,anchor.top-box.height-gap);
  tip.style.left=left+'px';tip.style.top=top+'px';
 }
 function fieldShell(label,key,control,help,{effect=null,checkbox=false,hint=''}={}){
  const id=`ce-${effect??'card'}-${key}`,description=`${id}-help`,error=`${id}-error`,hintId=`${id}-hint`;
  return `<div class="ce-field ${checkbox?'ce-checkbox':''}"><div class="ce-field-heading"><label for="${id}">${esc(label)}</label><button type="button" class="ce-help" data-ce-help="${description}" aria-label="Aide : ${esc(label)}" aria-describedby="${description}">?</button></div>${control(id,`${description} ${error}${hint?' '+hintId:''}`)}${hint?`<small id="${hintId}" class="ce-field-hint">${esc(hint)}</small>`:''}<span id="${description}" role="tooltip" class="ce-tooltip" hidden>${esc(help)}</span><small id="${error}" class="ce-field-error" hidden></small></div>`;
 }
 function field(label,key,value,{select,min=0,max=100,step=1,type='number',effect=null,factor=1}={}){
  const numeric=!select&&type==='number',range=numeric&&key!=='coreRadius'?` Valeurs : ${format(min)} à ${format(max)}${step===1?' (entiers)':''}.`:'';
  const e=effect===null?null:card().effects[effect],help=cardFieldHelp(key,e)+range;
  const hint=numeric?(key==='coreRadius'?'De 0 au rayon extérieur.':`De ${format(min)} à ${format(max)}${step===1?' · nombres entiers':''}.`)+(e?.type==='tempo'&&key==='amount'?' La jauge du show reste limitée à 10; le surplus est perdu.':key==='strikes'?' La puissance totale est partagée entre les frappes.':''):'';
  return fieldShell(label,key,(id,description)=>{const attrs=`id="${id}" data-ce-field="${key}" data-ce-label="${esc(label)}" aria-describedby="${description}" ${effect!==null?`data-ce-effect="${effect}"`:''}`;return select?`<select ${attrs}>${options(select,value)}</select>`:`<input ${attrs} type="${type}" value="${esc(numeric?(Number.isFinite(value)?Math.round(value*factor*1e6)/1e6:''):value)}" ${numeric?`min="${min}" max="${max}" step="${step}" data-ce-factor="${factor}"`:'maxlength="70" required'}>`;},help,{effect,hint});
 }
 function checkbox(label,key,checked,attrs,{effect=null}={}){return fieldShell(label,key,(id,description)=>`<input id="${id}" type="checkbox" ${attrs} aria-describedby="${description}" ${checked?'checked':''}>`,cardFieldHelp(key),{effect,checkbox:true});}
 function effectHTML(e,i){
  const fields=Object.entries(EFFECTS[e.type].fields).filter(([key])=>e.type!=='power'||!['limit','multiplier'].includes(key)||e.formula!=='fixed').filter(([key])=>key!=='limit'||e.formula==='spend').map(([k,f])=>field(f.label,k,e[k]===undefined&&f.optional?f.value:e[k],{effect:i,select:f.options,min:f.min,max:f.max,step:f.step})).join('');
  return `<fieldset class="ce-effect"><legend>Effet ${i+1}</legend><div class="ce-effect-head">${field('Effet','type',e.type,{effect:i,select:Object.fromEntries(Object.entries(EFFECTS).map(([k,v])=>[k,v.name]))})}<button data-ce-action="up" data-index="${i}" ${!i?'disabled':''} aria-label="Monter l’effet ${i+1}">↑</button><button data-ce-action="down" data-index="${i}" ${i===card().effects.length-1?'disabled':''} aria-label="Descendre l’effet ${i+1}">↓</button><button data-ce-action="remove-effect" data-index="${i}" ${card().effects.length===1?'disabled':''}>Retirer l’effet</button></div><div class="ce-fields">${fields}${field('Condition','when',e.when,{effect:i,select:CONDITIONS})}${e.when==='tempo'?field('Seuil de tempo','conditionValue',e.conditionValue??3,{effect:i,min:0,max:10}):''}${e.type==='power'?checkbox('Bonus à partir d’un seuil de tempo','threshold',!!e.threshold,`data-ce-threshold="${i}"`,{effect:i})+(e.threshold?field('Seuil','threshold-tempo',e.threshold.tempo,{effect:i,max:10})+field('Bonus','threshold-bonus',e.threshold.bonus,{effect:i,max:30}):''):''}</div></fieldset>`;
 }
 function validateFields(){
  const c=card(),core=host.querySelector('[data-ce-field="coreRadius"]');if(core)core.max=String(Number.isFinite(c.radius)?c.radius:3);
  let firstError='';
  for(const el of host.querySelectorAll('input[data-ce-field]')){
   const key=el.dataset.ceField,n=el.valueAsNumber,min=Number(el.min),max=Number(el.max);let error='';
   if(el.type==='number'){
    if(!Number.isFinite(n))error='Saisis un nombre.';
    else if(key==='coreRadius'&&Number.isFinite(c.radius)&&n>c.radius)error=`Le cœur ne peut pas dépasser le rayon extérieur (${format(c.radius)}).`;
    else if(n<min||n>max)error=`Choisis une valeur entre ${format(min)} et ${format(max)}.`;
    else if(el.step==='1'&&!Number.isInteger(n))error='Choisis un nombre entier.';
   }else if(!el.value.trim())error='Le nom ne peut pas être vide.';
   else if(el.value.length>70)error='Le nom est limité à 70 caractères.';
   el.setAttribute('aria-invalid',String(!!error));const message=host.querySelector('#'+el.id+'-error');message.textContent=error;message.hidden=!error;
   if(error&&!firstError)firstError=el.dataset.ceLabel+' : '+error;
  }
  if(!firstError)try{validateCatalog({...draft,cards:[c]},{starters:false});}catch(error){firstError=error.message;}
  const message=host.querySelector('[data-ce-validation]');message.textContent=firstError;message.hidden=!firstError;
  host.querySelector('[data-ce-action="test"]').disabled=!!firstError;host.querySelector('[data-ce-action="save"]').disabled=!!firstError;
  return !firstError;
 }
 function preview(){const c=card();
  const crown=host.querySelector('[data-ce-crown]');if(crown)crown.hidden=!c.coreRadius;
  for(const el of host.querySelectorAll('[data-ce-starter]')){const count=draft.cards.filter(x=>x.enabled&&[el.dataset.ceStarter,'neutral'].includes(x.instrument)).reduce((n,x)=>n+x.starter,0);el.querySelector('b').textContent=`${count}/5`;el.classList.toggle('ce-error',count!==5);}
  for(const el of host.querySelectorAll('[data-ce-select]')){const item=draft.cards.find(x=>x.id===el.dataset.ceSelect);el.querySelector('strong').textContent=item.name;el.querySelector('small').textContent=`${item.cost} énergie · ${RARITIES[item.rarity].name} · niv. ${item.minLevel}${item.enabled?'':' · retirée'}`;}
  host.querySelector('[data-ce-action="undo"]').disabled=!history.length;
  host.querySelector('.ce-preview-card').innerHTML=validateFields()?cardFace({card:compileCard(c),owner:INSTRUMENTS[c.instrument]||'Neutre',instrument:c.instrument==='neutral'?'voice':c.instrument}):'<div class="ce-preview-invalid"><strong>Aperçu en pause</strong><p>Corrige les champs signalés pour voir une carte jouable.</p></div>';host.querySelector('[data-ce-status]').textContent=status;}
 function render({resetForm=false}={}){
  const scrolls=['.ce-body','.ce-body>main','.ce-body>aside:not(.ce-preview)','.ce-preview','.ce-card-list'].map(selector=>{const el=host.querySelector(selector);return {selector,top:el?.scrollTop||0,left:el?.scrollLeft||0};});
  const active=document.activeElement,focus=host.contains(active)?active.id?'#'+CSS.escape(active.id):active.dataset.ceAction?`[data-ce-action="${active.dataset.ceAction}"]${active.dataset.index!==undefined?`[data-index="${active.dataset.index}"]`:''}`:null:null;
  hideHelp();
  const list=draft.cards.filter(c=>c.instrument===category&&(showRetired||c.enabled));if(!list.some(c=>c.id===selected))selected=list[0]?.id;
  const c=card();host.innerHTML=`<header><div><small>BANDLIVE · CRÉATION</small><h2>Atelier de cartes</h2></div><button data-ce-action="close" aria-label="Fermer l’atelier">✕</button></header>
   <div class="ce-body"><aside>${field('Instrument','category',category,{select:{...INSTRUMENTS,neutral:'Neutre · tous les musiciens'}})}${checkbox('Voir les cartes retirées','retired',showRetired,'data-ce-retired')}<button data-ce-action="new">＋ Nouvelle carte</button>
   <div class="ce-card-list" role="navigation" aria-label="Cartes de cet instrument">${list.map(x=>`<button data-ce-select="${esc(x.id)}" aria-current="${x.id===selected?'true':'false'}"><strong>${esc(x.name)}</strong><small>${x.cost} énergie · ${RARITIES[x.rarity].name} · niv. ${x.minLevel}${x.enabled?'':' · retirée'}</small></button>`).join('')}</div></aside>
   <main>${c?`<div class="ce-card-actions"><button data-ce-action="duplicate">Dupliquer la carte</button><button data-ce-action="${c.enabled?'retire':'restore'}">${c.enabled?'Retirer la carte':'Restaurer la carte'}</button></div>
    <div class="ce-fields">${field('Nom','name',c.name,{type:'text'})}${!c.legacyKind?field('Instrument de la carte','instrument',c.instrument,{select:{...INSTRUMENTS,neutral:'Neutre · tous les musiciens'}}):''}${field('Coût en énergie','cost',c.cost,{max:3})}${field('Rareté','rarity',c.rarity,{select:Object.fromEntries(Object.entries(RARITIES).map(([k,v])=>[k,v.name]))})}${field('Niveau minimal d’obtention','minLevel',c.minLevel,{min:1,max:100})}${field('Exemplaires au départ','starter',c.starter,{max:5})}${field('Cible','target',c.target,{select:{single:'Un spectateur',duo:'Deux spectateurs',audience:'Tout le public',radius:'Zone autour d’un spectateur',point:'Endroit au sol'}})}${['radius','point'].includes(c.target)?field('Rayon extérieur','radius',c.radius,{min:.2,max:3,step:.1})+field('Rayon du cœur (0 = zone uniforme)','coreRadius',c.coreRadius,{min:0,max:c.radius,step:.1})+`<div data-ce-crown ${c.coreRadius?'':'hidden'}>${field('Puissance de la couronne (%)','outerScale',c.outerScale,{min:0,max:100,step:.1,factor:100})}</div>`:''}</div>
    <p data-ce-validation class="ce-validation" role="status" hidden></p><p class="ce-note">Les effets se jouent dans cet ordre. La conquête en chaîne suit les effets de la carte. Les ressources sont plafonnées; la main contient au plus cinq cartes.</p>${c.effects.map(effectHTML).join('')}<button data-ce-action="add-effect" ${c.effects.length>=12?'disabled':''}>＋ Ajouter un effet</button>`:'<p>Crée une carte pour cet instrument.</p>'}</main>
   <aside class="ce-preview"><h3>Aperçu</h3><div class="ce-preview-card"></div><p>Test immédiat dans cette scène, sur une copie du show. Tu peux modifier et rejouer la carte sans recommencer : la foule et les réglages restent en place.</p><h3>Decks de départ</h3>${Object.entries(INSTRUMENTS).map(([id,name])=>{const count=draft.cards.filter(x=>x.enabled&&[id,'neutral'].includes(x.instrument)).reduce((n,x)=>n+x.starter,0);return `<p data-ce-starter="${id}" class="${count!==5?'ce-error':''}">${name} : <b>${count}/5</b></p>`;}).join('')}<p>Les cartes neutres sont proposées à tous les instruments. Les cartes retirées restent dans les decks déjà acquis.</p></aside></div>
   <footer><p data-ce-status role="status">${esc(status)}</p><div><button data-ce-action="undo" ${!history.length?'disabled':''}>Annuler</button><button data-ce-action="export">Exporter JSON</button><button data-ce-action="import">Importer JSON</button><input data-ce-file type="file" accept="application/json" hidden><button data-ce-action="test" ${!c?'disabled':''}>Tester ici ↗</button><button data-ce-action="save" class="primary">Appliquer le catalogue</button></div></footer>`;
  if(c)preview();
  for(const {selector,top,left} of scrolls){const el=host.querySelector(selector);if(el){el.scrollTop=resetForm&&['.ce-body','.ce-body>main'].includes(selector)?0:top;el.scrollLeft=left;}}
  if(focus&&!resetForm)host.querySelector(focus)?.focus({preventScroll:true});
 }
 function close(){hideHelp();host.hidden=true;previousFocus?.focus?.();}
 host.addEventListener('pointerover',e=>{
  clearTimeout(helpTimer);if(e.target.closest('.ce-tooltip'))return;
  const field=e.target.closest('.ce-field');if(!field||field.contains(e.relatedTarget)&&!e.target.closest('[data-ce-help]'))return;
  const button=field.querySelector('[data-ce-help]');helpTimer=setTimeout(()=>showHelp(button),200);
 });
 host.addEventListener('pointerout',e=>{const field=e.target.closest('.ce-field');if(field&&!field.contains(e.relatedTarget)){clearTimeout(helpTimer);helpTimer=setTimeout(hideHelp,150);}});
 host.addEventListener('focusin',e=>{hideHelp();if(e.target.matches('[data-ce-help]')){const button=e.target;button.scrollIntoView({block:'nearest'});helpFrame=requestAnimationFrame(()=>{if(document.activeElement===button&&!host.hidden)showHelp(button);});}});
 host.addEventListener('focusout',e=>{if(e.target.matches('[data-ce-help]'))hideHelp();});
 host.addEventListener('scroll',e=>{if(!e.target.closest?.('.ce-tooltip')){if(activeHelp)hideHelp();else clearTimeout(helpTimer);}},true);
 window.addEventListener('resize',hideHelp);
 host.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();if(activeHelp)hideHelp();else close();}if(e.key==='Tab'){const elements=[...host.querySelectorAll('button:not([disabled]),input:not([hidden]),select,textarea')].filter(el=>el.offsetParent!==null),first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 host.addEventListener('input',e=>{
  const el=e.target;if(!el.matches('[data-ce-field]')||el.tagName==='SELECT')return;
  const c=card(),key=el.dataset.ceField;if(!c)return;remember();const value=el.type==='number'?(Number.isFinite(el.valueAsNumber)?el.valueAsNumber/Number(el.dataset.ceFactor||1):null):el.value;
  if(el.dataset.ceEffect!==undefined){const effect=c.effects[Number(el.dataset.ceEffect)];if(key.startsWith('threshold-'))effect.threshold[key.slice(10)]=value;else effect[key]=value;}else c[key]=value;
  status='Brouillon modifié.';preview();
 });
 host.addEventListener('change',async e=>{
  const el=e.target;if(el.matches('[data-ce-file]')){try{const value=JSON.parse(await el.files[0].text());validateCatalog(value);remember();draft=value;status='Catalogue importé en brouillon.';render();}catch(error){status=error.message;host.querySelector('[data-ce-status]').textContent=status;}return;}
  if(el.matches('[data-ce-retired]')){showRetired=el.checked;render();return;}
  if(el.matches('[data-ce-threshold]')){remember();const effect=card().effects[Number(el.dataset.ceThreshold)];if(el.checked)effect.threshold={tempo:3,bonus:2};else delete effect.threshold;render();return;}
  if(el.matches('input[data-ce-field]'))return;
  if(el.tagName!=='SELECT'||!el.matches('[data-ce-field]'))return;
  const key=el.dataset.ceField;if(key==='category'){category=el.value;render({resetForm:true});return;}remember();
  if(el.dataset.ceEffect!==undefined){const i=Number(el.dataset.ceEffect);if(key==='type')card().effects[i]=newEffect(el.value);else{card().effects[i][key]=el.value;if(key==='when'&&el.value==='tempo')card().effects[i].conditionValue=3;}}else{card()[key]=el.value;if(key==='instrument')category=el.value;}
  render();
 });
 host.addEventListener('click',async e=>{
  const help=e.target.closest('[data-ce-help]');if(help){showHelp(help);return;}if(e.target.closest('.ce-tooltip'))return;hideHelp();
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.ceSelect){selected=button.dataset.ceSelect;render({resetForm:true});return;}
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
   render({resetForm:action==='duplicate'||action==='new'});
  }catch(error){status=error.message;host.querySelector('[data-ce-status]').textContent=status;}
 });
 return {open(){previousFocus=document.activeElement;if(!draft||owner!==getWorld()){owner=getWorld();draft=structuredClone(owner.cardCatalog||createCatalog());history=[];}host.hidden=false;render();host.querySelector('button').focus();},close};
}
