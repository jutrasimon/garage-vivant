import {
  TRAIT_CATALOG,
  effectiveTraits,
  DISCONNECTED,
  NEED_DRAIN,
  ACTIVITY_EFFECTS,
  partnerWeight,
  traitEffect,
} from "./v7.mjs?v=0.7.0";
import {
  ACTIONS,
  NEEDS,
  EMOTIONS,
  scores,
  stamp,
  relationship,
} from "./engine.mjs?v=0.7.0";
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const n = (x) => Math.round(x * 1000) / 1000;
export function rapinHTML(s, p) {
  const rows = scores(s, p),
    b = p.bag;
  const exhausted = !Object.values(b.remaining).some((n) => n > 0),
    futureTotal = Object.values(b.composition).reduce((a, b) => a + b, 0);
  const displayed = exhausted
    ? rows.map((r) => ({
        ...r,
        chance: (b.composition[r.key] / futureTotal) * 100,
      }))
    : rows;
  return `<section class="rapin-pool"><div class="section-head">SAC RAPIN · CYCLE ${b.cycle}</div><p>Sans remise. ${b.reserved ? `Réservé : ${ACTIONS[b.reserved].label}.` : "Aucun jeton réservé."} Les besoins ne changent pas la pige. ${exhausted ? "Aucun jeton restant : les chances affichées anticipent le prochain remplissage; une réservation éventuelle doit d’abord se terminer." : ""}</p><div class="bag-strip">${displayed.map((r, i) => `<span style="width:${r.chance}%;background:hsl(${i * 55} 30% 60%)" title="${ACTIONS[r.key].label} ${r.chance.toFixed(1)} %"></span>`).join("")}</div><div class="bag-rows">${displayed.map((r) => `<div class="bag-row" data-key="bag-${p.id}-${r.key}"><span>${ACTIONS[r.key].label}<small>Cycle : ${b.cycleComposition[r.key]} · restants ${r.remaining} · consommés ${r.consumed}${b.reserved === r.key ? " · 1 réservé" : ""}</small></span><label>Prochain cycle<input data-bag-weight="${p.id}:${r.key}" aria-label="Jetons ${ACTIONS[r.key].label}" type="number" min="0" max="100" step="1" value="${b.composition[r.key]}"></label><b>${r.chance.toFixed(1)} %<small>${exhausted ? "après remplissage" : "prochaine pige"}</small></b></div>`).join("")}</div><p class="muted">${Object.values(b.cycleComposition).reduce((a, b) => a + b, 0)} jetons dans ce cycle. Les changements s’appliquent au prochain remplissage. Une action impossible reporte son jeton. Interventions et sommeil sont hors sac.</p></section>`;
}
export function thresholdsHTML(p, s) {
  return `<section data-stable="thresholds"><div class="section-head">SEUILS ET PRESSIONS</div><div class="v7-table-scroll"><table class="v7-table"><thead><tr><th>Besoin</th><th>Critique</th><th>Bas</th><th>Comblé</th><th>Actuel</th></tr></thead><tbody>${Object.entries(
    p.needThresholds,
  )
    .map(
      ([k, t]) =>
        `<tr><td>${NEEDS[k]}</td><td>&lt; ${t.critical} : +${t.criticalRate}/min détresse</td><td>&lt; ${t.low} : +${t.lowRate}/min détresse</td><td>≥ ${t.high} : +${t.highRate}/min exaltation</td><td>${
          (p.pressures || [])
            .filter((x) => x.need === k)
            .map((x) => `+${x.rate}/min ${EMOTIONS[x.axis].label}`)
            .join("") || "aucune pression"
        }</td></tr>`,
    )
    .join(
      "",
    )}</tbody></table></div><p>Décroissance naturelle de chaque jauge : −${n(p.emotionDecay || 0)}/min.</p><h3>Sources des besoins</h3><p>Usure de base par minute : ${Object.entries(
    NEED_DRAIN,
  )
    .map(([k, v]) => `${NEEDS[k]} −${v} ×${s?.params.drain ?? 1}`)
    .join(
      " · ",
    )}. Social : ×0,5 si Solitaire, sinon ×(1 + extraversion/200). Énergie : aucune usure pendant le sommeil, y compris le trajet.</p><p>${
    p.action?.key === "sleep"
      ? `Sommeil réel : énergie +${n(100 / p.sleep.required)}/min, plafonnée au réveil selon la durée obtenue.`
      : p.action
        ? `Effets d’activité par minute sur place : ${Object.entries(
            ACTIVITY_EFFECTS[p.action.key] || {},
          )
            .map(([k, v]) => `${NEEDS[k]} ${v > 0 ? "+" : ""}${v}`)
            .join(
              " · ",
            )}. Expression ×0,8 pour Perfectionniste pendant pratique/composition.`
        : "Aucune activité sur place."
  }</p><p>Les échanges acceptés ajoutent +6 social. Les événements de musique, excès et spectacles peuvent aussi modifier les besoins : effets dans leur journal.</p><h3>Traits conditionnels</h3>${p.emotionalThresholds.map((t) => `<p><b>${esc(TRAIT_CATALOG[t.trait].label)}</b> · ${EMOTIONS[t.axis].label} ≥ ${t.threshold} · ${p.activeTraits.includes(t.trait) ? "ACTIF" : "inactif"}<br><small>${esc(TRAIT_CATALOG[t.trait].description)} Retrait sous ${t.threshold}.</small></p>`).join("")}<p>Traits actifs : ${
    effectiveTraits(p)
      .map((t) => esc(TRAIT_CATALOG[t].label))
      .join(", ") || "aucun"
  }</p><h3>Sommeil hors sac</h3><p>Coucher habituel : ${String(Math.floor(p.sleep.bedtime / 60)).padStart(2, "0")}:${String(p.sleep.bedtime % 60).padStart(2, "0")} · besoin ${(p.sleep.required / 60).toFixed(0)} h · durée ${(p.sleep.habitual / 60).toFixed(0)} h.</p><p>Prochain coucher : ${stamp(p.sleep.nextBedtime)}. ${p.action?.key === "sleep" ? `${p.action.remaining} min restantes.` : "Éveillé."}</p></section>`;
}
export function catalogueHTML() {
  return `<section id="trait-catalog"><div class="section-head">CATALOGUE DES TRAITS</div><input data-trait-search type="search" placeholder="Solitaire, Alpha, Inspiré…" aria-label="Rechercher un trait"><div>${Object.entries(
    TRAIT_CATALOG,
  )
    .map(
      ([k, t]) =>
        `<article data-catalog-trait="${esc((t.label + " " + t.description).toLocaleLowerCase())}"><h3>${esc(t.label)}${t.disconnected ? " · débranché" : ""}</h3><p>${esc(t.description)}</p>${t.exclusive ? `<small>Incompatible avec ${TRAIT_CATALOG[t.exclusive].label}.</small>` : ""}</article>`,
    )
    .join("")}</div></section>`;
}
export function connectionsHTML() {
  return `<details id="v7-connections"><summary>Raccords V7 débranchés · ${DISCONNECTED.length}</summary>${DISCONNECTED.map((x) => `<p><b>${esc(x.label)}</b><br>${esc(x.reason)}</p>`).join("")}<p>Ces limites sont documentées dans les DDD. Aucun ancien calcul ne reprend la main.</p></details>`;
}
export function exchangeTrace(e) {
  if (!e.probabilities) return "";
  const p = e.probabilities,
    i = p.inputs;
  return `<details class="v7-trace" data-key="trace-${e.id}"><summary>Voir le tirage et ses effets</summary><p>${esc(e.interaction)} · ${esc(e.outcome)} · destinataire : affinité ${n(i.affinity)}, tension ${n(i.tension)}.</p><p>Initiateur : exaltation ${n(i.initiator.exaltation)}, détresse ${n(i.initiator.distress)}. Destinataire : exaltation ${n(i.recipient.exaltation)}, détresse ${n(i.recipient.distress)}.</p><p>Traits initiateur : ${i.initiatorTraits.map((t) => esc(TRAIT_CATALOG[t]?.label || t)).join(", ") || "aucun"}. Traits destinataire : ${i.recipientTraits.map((t) => esc(TRAIT_CATALOG[t]?.label || t)).join(", ") || "aucun"}.</p><p>Acceptation ${(p.acceptance * 100).toFixed(1)} % · tirage ${(e.rolls.acceptance * 100).toFixed(1)} %. Résultat : favorable ${(p.positive * 100).toFixed(1)} %, neutre ${(p.neutral * 100).toFixed(1)} %, défavorable ${(p.negative * 100).toFixed(1)} %${e.rolls.result === null ? " · non tiré après refus" : ` · tirage ${(e.rolls.result * 100).toFixed(1)} %`}.</p><p>Base : acceptation 55 %, favorable 45 %, défavorable 15 %. Modificateurs de traits et réglage : ${esc(JSON.stringify(p.modifiers))}. Les apports relationnels et émotionnels, les bornes et la normalisation sont détaillés dans le DDD Interactions.</p><pre>${esc(JSON.stringify(e.changes, null, 2))}</pre></details>`;
}

export function sessionHTML(s, p) {
  const jam =
    p.action?.key === "jam"
      ? s.jams.find((j) => j.id === p.action.sessionId)
      : null;
  const social = s.socialSessions?.find(
    (x) => !x.ended && x.members.includes(p.id),
  );
  const session = jam || social;
  const peers = (jam ? jam.participants : social?.members || [])
    .map((id) => s.people.find((p) => p.id === id))
    .filter(Boolean);
  return `<section data-stable="session-v7"><div class="section-head">SÉANCE ET PARTENAIRES</div>${session ? `<p>${jam ? "Jam" : "Échanges sociaux"} · ${esc(session.id)} · ${jam ? `${jam.status}; ${jam.elapsed} minutes jouées; admission ${jam.elapsed < 60 && s.time - jam.created < 180 ? "ouverte" : "fermée"}` : `prochain échange ${stamp(social.nextExchange)}`}. Un seul échange par tranche de 15 minutes.</p><p>${peers.map((q) => `${esc(q.name)} : initiative ${n(Math.max(0.05, 1 + traitEffect(q, "initiative")))}${q !== p ? `, poids de partenaire pour ${esc(p.name)} ${n(partnerWeight(s, p, q, relationship(s, p, q)))}` : ""}`).join("<br>")}</p>` : "<p>Aucune séance collective active. Une intention sociale ou une jam peut chercher une séance; la proximité seule ne lance pas d’échange.</p>"}<p>Poids partenaire : max(0,1; 1 + affinité positive/20 − tension/30 + bonus de groupe + Inséparables). Groupe commun : max(1 + développement/8); Inséparables : +6 à partir de 75 d’affinité dans cette direction.</p></section>`;
}
