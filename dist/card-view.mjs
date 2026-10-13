import {instrumentArt} from './show-view.mjs?v=0.8.0';
export const escapeCard=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cardFace({card,owner,instrument}){
 const esc=escapeCard,target=card.twoTargets?'Deux spectateurs':card.shape==='row'?'Une rangée':card.target==='single'?'Un spectateur':'Tout le public';
 return `<span class="bl-card-face"><span class="bl-card-content"><span class="bl-card-head"><span class="bl-cost">${card.cost}</span><strong>${esc(card.name)}</strong></span><span class="bl-card-art">${instrumentArt(instrument,Object.hasOwn(card,'power')?'impact':'rhythm')}</span><span class="bl-card-owner">${esc(owner)}</span><span class="bl-card-rule">${esc(card.description)}</span><small>${target}</small></span></span>`;
}
