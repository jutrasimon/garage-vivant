import { showTitleHTML } from "./show-view.mjs?v=0.7.1";
import {
  ACTIONS,
  SKILLS,
  EMOTIONS,
  stamp,
  round,
  scores,
} from "./engine.mjs?v=0.7.1";
import {
  bandStage,
  eligibleSongs,
  availability,
  acceptance,
} from "./life.mjs?v=0.7.1";
import {
  pendingBooking,
  eventById,
  morale,
  assess,
} from "./calendar.mjs?v=0.7.1";
import { CARDS, INTENTIONS } from "./stage.mjs?v=0.7.1";
import { resolveShowPlan } from "./show-planning.mjs?v=0.7.1";
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
export function bandsHTML(s, chosen = null, query = "", archives = false) {
  const groups = s.groups.filter(
    (g) =>
      (archives || g.archivedAt === null) &&
      g.name.toLowerCase().includes(query.toLowerCase()),
  );
  const g = groups.find((g) => g.id === chosen) || groups[0];
  return `<div class="bands-browser"><aside class="bands-index"><label>Rechercher un band<input id="band-search" value="${esc(query)}" type="search"></label><label><input id="band-archives" type="checkbox" ${archives ? "checked" : ""}> Inclure les archives</label>${
    groups
      .map((x) => {
        const b = pendingBooking(s, x.id);
        return `<button class="band-row ${x.id === g?.id ? "selected" : ""}" data-group-select="${x.id}" data-key="band-row-${x.id}"><strong>Groupe · ${esc(x.name)}</strong><small>${esc(x.genre)} · ${x.members.length} membres · ${bandStage(x)}</small><small>Réputation ${round(x.reputation)} · moral ${round(morale(x, s.time))}${b ? ` · ${b.status === "applied" ? "Candidature" : "Show"} ${stamp(b.time)}` : ""}</small></button>`;
      })
      .join("") || "<p>Aucun band dans cette liste.</p>"
  }</aside>${
    g
      ? `<article class="panel band-detail" data-key="band-detail-${g.id}"><div class="section-head">${esc(g.genre)} · ${bandStage(g)}</div><h2>Groupe · « ${esc(g.name)} »</h2><div class="result-stats"><span><b>${round(g.development)}</b>Coordination</span><span><b>${round(g.reputation)}</b>Réputation</span><span><b>${round(morale(g, s.time))}</b>Moral</span></div>${(
          g.moraleEffects || []
        )
          .filter((e) => e.until > s.time)
          .map(
            (e) =>
              `<p class="muted">${esc(e.reason)} · ${e.amount > 0 ? "+" : ""}${e.amount} · fin ${stamp(e.until)}</p>`,
          )
          .join(
            "",
          )}<div class="inline-actions">${g.archivedAt === null ? `<button data-open-shows="${g.id}" class="primary">Préparer / réserver</button><button data-rehearse="${g.id}">Répéter</button>` : `<button data-revive="${g.id}">Relancer</button>`}${g.members.includes(s.playerId) ? `<button data-invite-group="${g.id}">Inviter</button>` : ""}</div><details open data-key="members-${g.id}"><summary>Membres</summary><div class="inline-actions">${g.members.map((id) => `<button data-person="${id}">${esc(person(s, id)?.name)} · ${SKILLS[person(s, id)?.instrument] || ""}</button>`).join("")}</div></details><details open data-key="repertoire-${g.id}"><summary>Répertoire du band · ${g.repertoire.length} morceaux</summary><p class="muted">Les morceaux adoptés et leur maîtrise collective. La setlist est l’ordre choisi pour un show.</p>${g.repertoire.map((r) => `<div class="repertoire-row"><b>Chanson · « ${esc(s.songs.find((x) => x.id === r.songId)?.title)} »</b><small>${round(r.mastery)}/100 · ${r.rehearsals} répétitions</small><button data-v6-remove-song="${g.id}:${r.songId}">Retirer</button></div>`).join("") || "<p>Jam libre disponible même sans chanson.</p>"}<details data-key="catalogue-${g.id}"><summary>Catalogue des membres : ajouter au répertoire</summary>${
          eligibleSongs(s, g)
            .filter((song) => !g.repertoire.some((r) => r.songId === song.id))
            .map(
              (song) =>
                `<div class="repertoire-row">Chanson « ${esc(song.title)} » · ${song.quality}/100 <button data-v6-add-song="${g.id}:${song.id}">Adopter</button></div>`,
            )
            .join("") || "<p>Aucune nouvelle composition.</p>"
        }</details></details><details open data-key="shows-${g.id}"><summary>Shows passés · ${g.shows.length}</summary>${
          s.showHistory
            .filter((r) => r.groupId === g.id)
            .slice()
            .reverse()
            .map(
              (r) =>
                `<details data-key="history-${r.id}"><summary>${stamp(r.time)} · ${esc(r.opportunityName)} · ${r.score}/100</summary><p>${esc(r.role || "Prestation")} · ${r.conquered}/${r.total} fans conquis</p><p>${(r.songs || [{ title: r.songTitle }]).map((x) => esc(x.title)).join(" → ")}</p>${r.effects ? `<p>Réputation ${round(r.effects.before.reputation)} → ${round(r.effects.after.reputation)} · moral ${round(r.effects.before.morale)} → ${round(r.effects.after.morale)}</p>` : ""}${r.trace ? `<button data-history-replay="${r.id}">Revoir la dernière chanson</button>` : ""}</details>`,
            )
            .join("") || "<p>Aucun show joué.</p>"
        }</details><details data-key="story-${g.id}"><summary>Histoire et départs</summary><p>Créé ${stamp(g.created)}</p>${(g.alumni || []).map((p) => `<p>${esc(p.name)} quitte le band ${stamp(p.left)}</p>`).join("")}${g.moments.map((m) => `<p>${stamp(m.time)} · ${esc(m.text)}</p>`).join("")}</details></article>`
      : ""
  }</div>`;
}
export { rapinHTML } from "./v7-view.mjs?v=0.7.1";
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
  return `<div class="season-heading"><div><span class="eyebrow">LES QUATRE PROCHAINES DATES</span><h2>Prendre la scène.</h2><p>Scènes locales : premier arrivé. Gros shows : candidature et choix de l’organisateur.</p></div>${s.performance?.status === "finished" ? '<button id="last-show">Dernier bilan</button>' : ""}</div>${calendarHTML(s, plan.opportunityId)}<div id="show-feedback" class="show-feedback" role="status" data-retain hidden></div>${bookings.map((b) => `<article class="upcoming-show" data-key="booking-${b.id}"><strong>${esc(s.groups.find((g) => g.id === b.groupId)?.name)} · ${esc(eventById(s, b.opportunityId)?.name)}</strong><p>${b.status === "applied" ? "CANDIDATURE EN ATTENTE" : "RÉSERVATION CONFIRMÉE"} · ${esc(b.role)} · ${stamp(b.time)}</p><p>${(b.setlist || [b.songId]).map((id) => (id === null ? "Jam libre" : esc(s.songs.find((x) => x.id === id)?.title))).join(" → ")}</p><div class="inline-actions">${b.status === "applied" ? "" : `<button data-advance-booking="${b.id}" class="primary">Avancer jusqu’au show</button>`}<button data-edit-booking="${b.id}">Voir / modifier</button><button data-cancel-booking="${b.id}">${b.status === "applied" ? "Retirer la candidature" : "Annuler"}</button></div></article>`).join("")}${
    group
      ? `<div class="panel show-form"><div class="show-fields"><label>Band<select id="show-group">${groups.map((g) => `<option value="${g.id}" ${g.id === group.id ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select></label><label>Date<select id="show-opportunity">${prep.openings.map((x) => `<option value="${x.id}" ${x.id === o?.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label><label>Créneau<select id="show-slot">${slots.map((x) => `<option value="${x.id}" ${x.id === slot?.id ? "selected" : ""}>${x.role} · ${x.duration} min</option>`).join("") || "<option>Aucune place</option>"}</select></label><label>Intention<select id="show-intention">${Object.entries(
          INTENTIONS,
        )
          .map(
            ([id, x]) =>
              `<option value="${id}" ${id === plan.intention ? "selected" : ""}>${x.label}</option>`,
          )
          .join(
            "",
          )}</select></label></div><p>${o?.final ? `L’organisateur affecte les créneaux. Sélection ${o.selected ? "terminée" : stamp(o.selectionAt)} · découverte ${o.organizer.discovery ? "favorisée" : "possible"}` : "Premier arrivé, premier servi"} · un engagement futur par band.</p>${a ? `<p class="risk-label">${a.risk} · ${a.reasons.map(esc).join(" · ")}</p>` : ""}<div class="section-head">SETLIST · ${plan.setlist.length * 4}/${slot?.duration || 0} MINUTES MUSICALES</div>${plan.setlist.map((id, i) => `<div class="setlist-line" data-key="set-${i}"><b>${i + 1}.</b><select data-set-song="${i}"><option value="free" ${id === null ? "selected" : ""}>Jam libre · 4 min</option>${songs.map((x) => `<option value="${x.id}" ${x.id === id ? "selected" : ""}>Chanson « ${esc(x.title)} » · ${x.quality}/100</option>`).join("")}</select><button data-set-up="${i}" ${i ? "" : "disabled"}>↑</button><button data-set-remove="${i}">Retirer</button></div>`).join("")}<button id="set-add" ${plan.setlist.length * 4 + 4 > (slot?.duration || 0) ? "disabled" : ""}>Ajouter un morceau</button><div class="section-head">FORMATION · ${members.length} CHOISIS</div><div class="formation-choices">${group.members
          .map((id) => {
            const p = person(s, id);
            return `<label data-key="member-${id}"><input data-show-member="${id}" type="checkbox" ${plan.members.includes(id) ? "checked" : ""} ${id === host?.id ? "disabled" : ""}><span><b>${esc(p.name)}</b><small>${SKILLS[p.instrument]} · énergie ${round(p.needs.energy)}</small></span><button data-deck="${id}" type="button">Deck</button></label>`;
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
  if (show.status === "playing") return showTitleHTML(show);
  const record = s.showHistory.find((x) => x.id === show.id),
    expected = show.sourceOpportunity?.organizer?.exigence || 30,
    success = r.score >= expected;
  const effect = (label, key) => {
    const before = record.effects.before[key],
      after = record.effects.after[key],
      delta = after - before;
    return `<span>${label}<b>${delta >= 0 ? "+" : ""}${Math.round(delta)}</b><small>${Math.round(before)} → ${Math.round(after)}</small></span>`;
  };
  return `<div class="show-result"><span class="eyebrow">${show.preview ? "ESSAI SANS RÉCOMPENSE" : esc(show.opportunityName)} · ${esc(show.role || "Prestation")}</span><h2>${esc(show.groupName)}</h2><p class="result-headline">${success ? "Le public a embarqué !" : "Une scène plus exigeante que la prestation."}</p><div class="result-stats"><span><b>${r.conquered} / ${r.total}</b>Fans conquis</span><span><b>${r.score}/100</b>Accueil du public</span><span><b>${expected}/100</b>Attentes de cette scène</span></div>${record?.effects ? `<div class="result-effects">${effect("Réputation", "reputation")}${effect("Moral", "morale")}${effect("Coordination", "development")}</div>` : ""}<p>${(show.songResults || []).map((x) => esc(x.title)).join(" → ") || esc(show.song.title)}</p><details><summary>Détails musicaux</summary><p>Composition ${r.quality}/100 · interprétation ${r.interpretation}/100 · ${r.combos} enchaînements · ${r.errors} erreurs</p></details><div class="inline-actions"><button id="replay-show">Revoir</button><button id="next-slot" class="primary">Groupe suivant / terminer la soirée</button><button data-return-preparation>Retour aux dates</button></div></div>`;
}

export function seasonHTML() {
  return "";
}
