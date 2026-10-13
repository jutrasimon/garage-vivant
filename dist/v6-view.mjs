import {personCard} from './person-card.mjs?v=0.8.4';
import {songTurns,songQualityHTML,songQualityTier} from './song-rules.mjs?v=0.8.4';
import {groupLinkHTML} from './group-link.mjs?v=0.8.4';
import {compositionCreditHTML} from './catalogue.mjs?v=0.8.4';
import { attachment, groupSkills, groupStyle, catalogueReputation, adoptionReason } from './groups.mjs?v=0.8.4';
import { showTitleHTML } from "./show-view.mjs?v=0.8.4";
import {
  ACTIONS,
  SKILLS,
  EMOTIONS,
  stamp,
  round,
  scores,
} from "./engine.mjs?v=0.8.4";
import {
  bandStage,
  eligibleSongs,
  availability,
  acceptance,
} from "./life.mjs?v=0.8.4";
import {
  pendingBooking,
  eventById,
  morale,
  assess,
} from "./calendar.mjs?v=0.8.4";
import { CARDS, INTENTIONS } from "./stage.mjs?v=0.8.4";
import { resolveShowPlan } from "./show-planning.mjs?v=0.8.4";
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const person = (s, id) => s.people.find((p) => p.id === id);
export function calendarHTML(s, selected = null) {
  return `<div class="season-slots">${s.season.opportunities.map((o) => `<button class="season-slot ${selected === o.id ? "selected" : ""}" data-opportunity="${o.id}" data-key="date-${o.id}"><span>${o.final ? "★ GROS SHOW · SÉLECTION" : "SCÈNE LOCALE · PREMIER ARRIVÉ"}</span><b>${esc(o.name)}</b><small>${stamp(o.time)} · ${o.crowd} fans · ${o.slots.filter((x) => !x.bookingId).length}/${o.slots.length} créneaux</small><small>${esc(o.styles.join(" / "))}</small><em>${o.final ? (o.selected ? "Affiche choisie" : `Résultats ${stamp(o.selectionAt)}`) : "Réserver →"}</em></button>`).join("")}</div>`;
}
function skillsHTML(s,g){
 const stats=groupSkills(s,g);
 return `<details open data-key="skills-${g.id}"><summary>Compétences des membres · moyenne et étendue</summary>${Object.entries(stats).map(([key,row])=>{
  const marks=new Map();for(const [label,value]of [['Minimum',row.min],['Moyenne',row.mean],['Maximum',row.max]]){const k=value.toFixed(2);if(!marks.has(k))marks.set(k,{value,labels:[]});marks.get(k).labels.push(label);}
  return `<div class="group-skill"><span>${SKILLS[key]}</span><div class="skill-axis" aria-label="${SKILLS[key]} : minimum ${round(row.min)}, moyenne ${round(row.mean)}, maximum ${round(row.max)}"><i style="left:${row.min}%;width:${row.max-row.min}%"></i>${[...marks.values()].map(m=>`<b style="left:${m.value}%" title="${m.labels.join(' / ')} : ${round(m.value)}${m.labels.includes('Minimum')?' · min : '+esc(row.minIds.map(id=>person(s,id)?.name).join(', ')):''}${m.labels.includes('Maximum')?' · max : '+esc(row.maxIds.map(id=>person(s,id)?.name).join(', ')):''}" class="${m.labels.includes('Moyenne')?'mean':''}"></b>`).join('')}</div><small>${round(row.min)} — <strong>${round(row.mean)}</strong> — ${round(row.max)}</small></div>`;
 }).join('')||'<p>Aucun membre actif.</p>'}<p class="muted">Minimum — moyenne — maximum, sur la même échelle de 0 à 100. Les marqueurs identiques sont regroupés.</p></details>`;
}
export function bandsHTML(s,chosen=null,query='',archives=false,bandLiveEnabled=false){
 const groups=s.groups.filter(g=>(archives?g.archivedAt!==null:g.archivedAt===null)&&g.name.toLowerCase().includes(query.toLowerCase())),g=groups.find(g=>g.id===chosen)||groups[0];
 const activeCount=s.groups.filter(g=>g.archivedAt===null).length,archiveCount=s.groups.length-activeCount;
 const index=`<aside class="bands-index"><div class="band-filters" role="group" aria-label="État des groupes"><button data-band-view="active" aria-pressed="${!archives}">Actifs (${activeCount})</button><button data-band-view="archives" aria-pressed="${archives}">Archives (${archiveCount})</button></div><label>Rechercher un groupe<input id="band-search" value="${esc(query)}" type="search"></label><p class="muted">${archives?'Groupes dissous : répertoires, anciens membres et histoire conservés.':'Les groupes dissous restent consultables dans Archives.'}</p>${groups.map(x=>`<button class="band-row ${x.id===g?.id?'selected':''}" data-group-select="${x.id}" data-key="band-row-${x.id}"><strong>Groupe · ${esc(x.name)}</strong><small>${esc(x.genre)} · ${x.archivedAt===null?x.members.length+' membres':new Set(x.alumni.map(p=>p.id)).size+' anciens membres'} · ${bandStage(x)}</small><small>Coordination ${round(x.development)} · réputation ${round(x.reputation)}</small></button>`).join('')||`<p>${query?'Aucun groupe correspondant à cette recherche.':archives?'Aucun groupe dissous pour le moment.':'Aucun groupe actif. Les groupes dissous sont dans Archives.'}</p>`}</aside>`;
 if(!g)return `<div class="bands-browser">${index}</div>`;
 const active=g.archivedAt===null,own=g.members.includes(s.playerId),style=groupStyle(s,g);
 const members=g.members.map(id=>{const p=person(s,id),a=attachment(s,p,g);return `<div class="group-member">${personCard(p)}<span>Attachement ${round(a.value)}/100</span><details data-key="attachment-${g.id}-${id}"><summary>Pourquoi rester ?</summary><p>Coordination ${round(a.terms.coordination)} · affinités ${round(a.terms.affinity)} · styles ${round(a.terms.style)} · compatibilité musicale · réputation ${round(a.terms.reputation)} · tensions ${round(a.terms.tension)}.</p></details>${own&&id===s.playerId?`<button data-leave-group="${g.id}" class="text-button">Quitter</button>`:''}</div>`;}).join('');
 const alumni=[...new Map(g.alumni.map(p=>[p.id,p])).values()],former=alumni.map(p=>`<div class="group-member">${person(s,p.id)?`${personCard(person(s,p.id))}`:`<strong>${esc(p.name)}</strong>`}<span>Ancien membre</span></div>`).join('');
 const songs=g.repertoire.map(r=>{const song=s.songs.find(x=>x.id===r.songId);return `<div class="repertoire-row"><button data-song-details="song:${r.songId}" class="text-button">Chanson · « ${esc(song.title)} »</button>${compositionCreditHTML(s,song)}<small>${songQualityHTML(song)} · ${song.quality}/100 · ${songTurns(song)} tours · ${r.rehearsals} cycles · ${r.active?'Active':'Mise de côté'}</small>${active?`<div class="inline-actions">${r.active?`<button data-rehearse="${g.id}:${r.songId}">Répéter</button>`:''}<button data-v6-${r.active?'remove':'add'}-song="${g.id}:${r.songId}">${r.active?'Mettre de côté':'Réactiver'}</button></div>`:''}</div>`;}).join('');
 const requests=s.groupState.requests.filter(r=>r.groupId===g.id&&r.status!=='closed');
 const report=s.showHistory.filter(r=>r.groupId===g.id).slice().reverse().map(r=>`<details data-key="history-${r.id}"><summary>${stamp(r.time)} · ${esc(r.opportunityName)} · ${r.score}/100</summary><p>${r.conquered}/${r.total} spectateurs conquis · ${(r.songs||[{title:r.songTitle}]).map(x=>esc(x.title)).join(' → ')}</p>${r.trace?`<button data-history-replay="${r.id}">${r.mode==='bandlive'?'Rejouer BandLive · répétition':'Revoir la dernière chanson'}</button>`:''}</details>`).join('');
 return `<div class="bands-browser">${index}<article class="panel band-detail" data-key="band-detail-${g.id}"><h2>${esc(g.name)} · ${esc(g.genre)}</h2><p>${esc(g.genre)} · ${bandStage(g)} · ${g.id} · créé ${stamp(g.created)}</p>${!active?`<p>Dissolution définitive ${stamp(g.archivedAt)} : ${esc(g.dissolvedReason)}</p>`:''}<div class="result-stats"><span><b>${round(g.development)}</b>Coordination</span><span><b>${round(g.reputation)}</b>Réputation</span><span><b>${round(morale(g,s.time))}</b>Moral de scène</span></div><p class="muted">Réputation : spectacles ${round(g.showReputation)} + catalogue ${round(catalogueReputation(s,g))}. Couleur musicale : ${Object.entries(style.counts).map(([k,n])=>`${esc(k)} ${n}`).join(' · ')||'fondateurs : '+esc(g.initialGenre)}.</p>${(g.moraleEffects||[]).filter(e=>e.until>s.time).map(e=>`<p>${esc(e.reason)} · ${e.amount} · fin ${stamp(e.until)}</p>`).join('')}<div class="inline-actions">${active?`<button data-open-shows="${g.id}" class="primary">Préparer / réserver</button>${bandLiveEnabled?`<button data-bandlive-open data-bandlive-group="${g.id}">Jouer avec BandLive</button>`:''}${own?`<button data-invite-group="${g.id}">Inviter</button>`:''}`:''}</div><details open data-key="members-${g.id}"><summary>${active?'Membres · '+g.members.length:'Anciens membres · '+alumni.length}</summary>${active?members||'<p>Aucun membre actif.</p>':former||'<p>Aucun ancien membre renseigné.</p>'}</details>${active?skillsHTML(s,g):''}<details open data-key="repertoire-${g.id}"><summary>Répertoire · ${g.repertoire.length} morceaux</summary><p class="muted">Le groupe conserve ses morceaux même si leur auteur quitte. La pratique entraîne les musiciens et augmente la coordination; les shows donnent aussi de l’XP aux participants.</p>${songs||'<p>Aucune chanson adoptée. Une improvisation reste possible en spectacle.</p>'}${active?`<details data-key="catalogue-${g.id}"><summary>Compositions disponibles à adopter</summary>${s.songs.filter(x=>!adoptionReason(s,g,x)).map(song=>`<div class="repertoire-row"><button data-song-details="song:${song.id}" class="text-button">Chanson · « ${esc(song.title)} »</button>${compositionCreditHTML(s,song)}<small>${songQualityHTML(song)} · Qualité ${song.quality}/100</small><button data-v6-add-song="${g.id}:${song.id}">Adopter</button></div>`).join('')||'<p>Aucune composition disponible.</p>'}</details>`:''}</details>${active?`<p class="muted">Prochaine recherche de chanson : ${stamp(g.nextAdoption)} · prochaine décision de pratique : ${stamp(g.nextPractice)}. Une décision ne garantit pas un appel.</p>`:''}<details open data-key="requests-${g.id}"><summary>Appels de pratique · ${requests.length}</summary>${requests.map(r=>`<p>« ${esc(s.songs.find(x=>x.id===r.songId)?.title)} » · ${r.status==='playing'?'En cours':'Invitations en attente'} · échéance ${stamp(r.expires)}</p>`).join('')||'<p>Aucun appel en cours.</p>'}</details><details data-key="shows-${g.id}"><summary>Shows passés · ${g.shows.length}</summary>${report||'<p>Aucun show joué.</p>'}</details><details data-key="story-${g.id}"><summary>Fondateurs, histoire et départs</summary><p>Fondateurs : ${g.founders.map(id=>esc(person(s,id)?.name||g.alumni.find(p=>p.id===id)?.name||'Ancien voisin')).join(', ')}</p>${g.alumni.map(p=>`<p>${esc(p.name)} · départ ${stamp(p.left)} · ${esc(p.reason||'Historique')}</p>`).join('')}${g.moments.map(m=>`<p>${stamp(m.time)} · ${esc(m.text)}</p>`).join('')}</details></article></div>`;
}
export { rapinHTML } from "./v7-view.mjs?v=0.8.4";
export function showSetupHTML(s, plan) {
  const prep = resolveShowPlan(s, plan),
    {
      groups,
      group,
      songs,
      opportunity: o,
      members,
      host,
      ready,
      reason,
    } = prep;
  const bookings = s.bookings.filter((b) =>
    ["applied", "booked", "assembling", "playing"].includes(b.status),
  );
  const slots =
    o?.slots.filter(
      (x) => !x.bookingId || x.bookingId === plan.editBookingId,
    ) || [];
  if (!slots.some((x) => x.id === plan.slotId)) plan.slotId = slots[0]?.id;
  const slot = slots.find((x) => x.id === plan.slotId);
  plan.setlist ||= [plan.songId ?? null];
  if (!plan.setlist.length) plan.setlist = [null];
  const a = group && o ? assess(s, group, o) : null;
  return `<div class="season-heading"><div><span class="eyebrow">LES QUATRE PROCHAINES DATES</span><h2>Prendre la scène.</h2><p>BandLive : 2 à 6 musiciens, 1 ou 2 compositions sans jam. Le choix du mode se fait avant de lancer la première chanson, pour chaque band.</p><p>Scènes locales : premier arrivé. Gros shows : candidature et choix de l’organisateur.</p></div>${s.performance?.status === "finished" ? '<button id="last-show">Dernier bilan</button>' : ""}</div>${calendarHTML(s, plan.opportunityId)}<div id="show-feedback" class="show-feedback" role="status" data-retain hidden></div>${bookings.map((b) => `<article class="upcoming-show" data-key="booking-${b.id}"><strong>${groupLinkHTML(s.groups.find(g=>g.id===b.groupId))} · ${esc(eventById(s, b.opportunityId)?.name)}</strong><p>${b.status === "applied" ? "CANDIDATURE EN ATTENTE" : "RÉSERVATION CONFIRMÉE"} · ${esc(b.role)} · ${stamp(b.time)}</p><p>${(b.setlist || [b.songId]).map((id) => (id === null ? "Jam libre" : esc(s.songs.find((x) => x.id === id)?.title))).join(" → ")}</p><div class="inline-actions">${b.status === "applied" ? "" : `<button data-advance-booking="${b.id}" class="primary">Avancer jusqu’au show</button>`}<button data-edit-booking="${b.id}">Voir / modifier</button><button data-cancel-booking="${b.id}">${b.status === "applied" ? "Retirer la candidature" : "Annuler"}</button></div></article>`).join("")}${
    group
      ? `<div class="panel show-form"><div class="show-fields"><label>Band<select id="show-group">${groups.map((g) => `<option value="${g.id}" ${g.id === group.id ? "selected" : ""}>${esc(g.name)} · ${esc(g.genre)}</option>`).join("")}</select></label><label>Date<select id="show-opportunity">${prep.openings.map((x) => `<option value="${x.id}" ${x.id === o?.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label><label>Créneau<select id="show-slot">${slots.map((x) => `<option value="${x.id}" ${x.id === slot?.id ? "selected" : ""}>${x.role} · ${x.duration} min</option>`).join("") || "<option>Aucune place</option>"}</select></label><label>Intention<select id="show-intention">${Object.entries(
          INTENTIONS,
        )
          .map(
            ([id, x]) =>
              `<option value="${id}" ${id === plan.intention ? "selected" : ""}>${x.label}</option>`,
          )
          .join(
            "",
          )}</select></label></div><p>${o?.final ? `L’organisateur affecte les créneaux. Sélection ${o.selected ? "terminée" : stamp(o.selectionAt)} · découverte ${o.organizer.discovery ? "favorisée" : "possible"}` : "Premier arrivé, premier servi"} · un engagement futur par band.</p>${a ? `<p class="risk-label">${a.risk} · ${a.reasons.map(esc).join(" · ")}</p>` : ""}<div class="section-head">SETLIST · ${plan.setlist.length * 4}/${slot?.duration || 0} MINUTES MUSICALES</div>${plan.setlist.map((id, i) => `<div class="setlist-line" data-key="set-${i}"><b>${i + 1}.</b><select data-set-song="${i}"><option value="free" ${id === null ? "selected" : ""}>Jam libre · 4 min</option>${songs.map((x) => `<option value="${x.id}" ${x.id === id ? "selected" : ""}>Chanson « ${esc(x.title)} » · ${songQualityTier(x).label} · ${x.quality}/100</option>`).join("")}</select><button data-set-up="${i}" ${i ? "" : "disabled"}>↑</button><button data-set-remove="${i}">Retirer</button></div>`).join("")}<button id="set-add" ${plan.setlist.length * 4 + 4 > (slot?.duration || 0) ? "disabled" : ""}>Ajouter un morceau</button><div class="section-head">FORMATION · ${members.length} CHOISIS</div><div class="formation-choices">${group.members
          .map((id) => {
            const p = person(s, id);
            return `<label data-key="member-${id}"><input data-show-member="${id}" type="checkbox" ${plan.members.includes(id) ? "checked" : ""} ${id === host?.id ? "disabled" : ""}>${personCard(p,{interactive:false})}<button data-deck="${id}" type="button">Deck</button></label>`;
          })
          .join(
            "",
          )}</div><p class="show-blocker">${esc(reason)}</p><div class="inline-actions"><button id="book-show" class="primary" ${ready && slot && plan.setlist.length * 4 <= slot.duration ? "" : "disabled"}>${plan.editBookingId ? "Modifier et reconfirmer" : o?.final ? "Poser la candidature" : "Réserver le créneau"}</button><button id="preview-show" ${members.length < 2 ? "disabled" : ""}>Essayer maintenant</button><button id="planned-rehearsal" ${plan.songId===null?'disabled':''}>${plan.songId===null?'Choisir un morceau pour répéter':'Pratiquer ce morceau'}</button><button data-close-preparation>Retour au quartier</button></div></div>`
      : '<div class="panel"><p>Crée un band pour prendre la scène.</p><button data-start-band>Monter un band</button></div>'
  }`;
}
export function showStatusHTML(s) {
  const show = s.performance;
  if (!show) return "";
  const r = show.result,
    total = show.totalTicks || 2160;
  const card = show.events.filter((e) => e.type === "card").at(-1),
    impact = show.events
      .filter(
        (e) =>
          e.type === "impact" &&
          e.cardId === card?.cardId &&
          e.actorId === card?.actorId,
      )
      .at(-1),
    c = CARDS[card?.cardId];
  if (show.status === "playing") return showTitleHTML(show,s.groups.find(g=>g.id===show.groupId));
  const record = s.showHistory.find((x) => x.id === show.id),
    expected = show.sourceOpportunity?.organizer?.exigence || 30,
    success = r.score >= expected;
  const effect = (label, key) => {
    const before = record.effects.before[key],
      after = record.effects.after[key],
      delta = after - before;
    return `<span>${label}<b>${delta >= 0 ? "+" : ""}${Math.round(delta)}</b><small>${Math.round(before)} → ${Math.round(after)}</small></span>`;
  };
  return `<div class="show-result"><span class="eyebrow">${show.preview ? "ESSAI SANS RÉCOMPENSE" : esc(show.opportunityName)} · ${esc(show.role || "Prestation")}</span><h2>${groupLinkHTML(s.groups.find(g=>g.id===show.groupId),show.groupName)}</h2><p class="result-headline">${success ? "Le public a embarqué !" : "Une scène plus exigeante que la prestation."}</p><div class="result-stats"><span><b>${r.conquered} / ${r.total}</b>Fans conquis</span><span><b>${r.score}/100</b>Accueil du public</span><span><b>${expected}/100</b>Attentes de cette scène</span></div>${record?.effects ? `<div class="result-effects">${effect("Réputation", "reputation")}${effect("Moral", "morale")}${effect("Coordination", "development")}</div>` : ""}<p>${(show.songResults || []).map((x) => esc(x.title)).join(" → ") || esc(show.song.title)}</p><details><summary>Détails musicaux</summary><p>Composition ${r.quality}/100 · interprétation ${r.interpretation}/100 · ${r.combos} enchaînements · ${r.errors} erreurs</p></details><div class="inline-actions"><button id="replay-show">Revoir</button><button id="next-slot" class="primary">Groupe suivant / terminer la soirée</button><button data-return-preparation>Retour aux dates</button></div></div>`;
}

export function seasonHTML() {
  return "";
}
