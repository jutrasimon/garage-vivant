import {xpProgress} from './progression.mjs?v=0.8.3';
import {characterPortrait,characterName} from './character-view.mjs?v=0.8.3';
import {INSTRUMENTS} from './bandlive-cards.mjs?v=0.8.3';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function xpHTML(p){const x=xpProgress(p);return `<span class="person-xp"><b>Niv. ${x.level}</b><span role="progressbar" aria-label="XP de ${esc(p.name)}" aria-valuemin="0" aria-valuemax="${x.needed}" aria-valuenow="${x.earned}"><i style="width:${x.percent}%"></i></span><small>${x.earned}/${x.needed} XP</small>${(p.levelRewards||[]).some(r=>r.status==='pending')?'<em>✦ Amélioration disponible</em>':''}</span>`;}
export function levelRewardButton(p){const count=(p.levelRewards||[]).filter(r=>r.status==='pending').length;return count?`<button class="level-reward-open" data-open-level-rewards="${esc(p.id)}" aria-label="Améliorer le deck de ${esc(p.name)}">✦ Améliorer le deck · ${count} choix</button>`:'';}
export function personCard(p,{interactive=true}={}){
 if(!p)return '';
 const portrait=typeof document==='undefined'?`<span class="character-portrait" style="background:${esc(p.color)}" aria-label="${esc(p.name)}"></span>`:characterPortrait({...p,identity:p.identity||{}},48);
 const card=`<${interactive?'button':'div'} class="person-card" ${interactive?`data-person="${esc(p.id)}"`:''}>${portrait}<span class="person-card-info"><strong>${esc(characterName(p))}</strong><small>${INSTRUMENTS[p.instrument]} · ${esc(p.genre)}</small><small>Maîtrise ${Math.round(p.skills?.[p.instrument]??p.skill??0)}/100 · Énergie ${Math.round(p.needs?.energy??0)}/100</small>${xpHTML(p)}</span></${interactive?'button':'div'}>`;
 return interactive?`<div class="person-summary">${card}${levelRewardButton(p)}</div>`:card;
}
