// V7 rules shared by simulation, inspectors and documentation tests.
export const BAG_ACTIONS = ["relax", "social", "practice", "jam", "write"];
export const BAG_SAMPLES = [
  [2, 2, 2, 2, 2],
  [2, 7, 2, 3, 1],
  [3, 2, 10, 3, 2],
  [4, 3, 5, 5, 13],
  [5, 9, 5, 17, 4],
  [24, 12, 10, 8, 6],
  [10, 4, 24, 8, 34],
  [20, 20, 20, 20, 20],
];
export const NEED_DRAIN = {
  energy: 0.065,
  social: 0.035,
  fun: 0.04,
  expression: 0.05,
};
export const ACTIVITY_EFFECTS = {
  relax: { fun: 0.8, energy: 0.16 },
  social: { fun: 0.35 },
  practice: { expression: 0.6, fun: 0.26, energy: -0.055 },
  write: { expression: 0.65, fun: 0.2, energy: -0.03 },
  jam: { expression: 0.7, fun: 0.5, social: 0.6, energy: -0.05 },
};
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
export const V7_RULES = Object.freeze({
  exchangeMinutes: 15,
  searchMinutes: 30,
  jamSearchMinutes: 90,
  romanticStart: 0.035,
  advanceThreshold: 5,
  coupleThreshold: 40,
  breakupThreshold: 25,
  coupleChance: 0.08,
  breakupChance: 0.15,
});
export const TRAIT_CATALOG = {
  night: {
    label: "Oiseau de nuit",
    description:
      "Coucher à 2 h plutôt qu’à 23 h. La durée de sommeil reste personnelle.",
    effects: {},
  },
  shy: {
    label: "Timide",
    description: "Initiative sociale −0,35; acceptation −0,05.",
    effects: { initiative: -0.35, accept: -0.05 },
  },
  hot: {
    label: "Impulsif",
    description: "Résultat favorable −0,08; risque défavorable +0,12.",
    effects: { positive: -0.08, negative: 0.12 },
  },
  perfectionist: {
    label: "Perfectionniste",
    description: "Satisfaction d’expression ×0,8; qualité d’écriture +8.",
    effects: { quality: 8 },
  },
  friendly: {
    label: "Chaleureux",
    description: "Acceptation +0,08; résultat favorable +0,08.",
    effects: { accept: 0.08, positive: 0.08 },
  },
  loner: {
    label: "Solitaire",
    description:
      "Érosion du besoin social divisée par deux; initiative sociale −0,3.",
    effects: { initiative: -0.3 },
  },
  virtuoso: {
    label: "Oreille musicale",
    description:
      "Apprentissage instrumental pendant la pratique/composition ×1,4.",
    effects: {},
  },
  lazy: {
    label: "Relax",
    description:
      "Trait conservé; son ancien bonus de choix est débranché du sac V7.",
    effects: {},
    disconnected: true,
  },
  sensitive: {
    label: "Sensible",
    description:
      "Hausses émotionnelles ×1,3; intensité descriptive des souvenirs ×1,5.",
    effects: { reaction: 0.3 },
  },
  alpha: {
    label: "Alpha",
    description: "Poids de prise d’initiative +1; incompatible avec Bêta.",
    effects: { initiative: 1 },
    exclusive: "beta",
  },
  beta: {
    label: "Bêta",
    description: "Poids de prise d’initiative −0,65; incompatible avec Alpha.",
    effects: { initiative: -0.65 },
    exclusive: "alpha",
  },
  irritable: {
    label: "Hargneux",
    description: "Acceptation −0,15; risque défavorable +0,18.",
    effects: { accept: -0.15, negative: 0.18 },
    valence: "negative",
  },
  withdrawn: {
    label: "Renfermé",
    description: "Initiative −0,6; acceptation −0,15.",
    effects: { initiative: -0.6, accept: -0.15 },
    valence: "negative",
  },
  fragile: {
    label: "À fleur de peau",
    description: "Hausses émotionnelles +40 %; risque défavorable +0,08.",
    effects: { reaction: 0.4, negative: 0.08 },
    valence: "negative",
  },
  distracted: {
    label: "Distrait",
    description: "Progression de composition ×0,75; résultat favorable −0,06.",
    effects: { writing: -0.25, positive: -0.06 },
    valence: "negative",
  },
  demanding: {
    label: "Exigeant",
    description: "Acceptation −0,1; qualité d’écriture +4.",
    effects: { accept: -0.1, quality: 4 },
    valence: "negative",
  },
  stubborn: {
    label: "Obstiné",
    description: "Risque défavorable +0,1; progression de composition +10 %.",
    effects: { negative: 0.1, writing: 0.1 },
    valence: "negative",
  },
  expansive: {
    label: "Expansif",
    description: "Initiative +0,6; résultat favorable +0,08.",
    effects: { initiative: 0.6, positive: 0.08 },
    valence: "positive",
  },
  daring: {
    label: "Audacieux",
    description:
      "Poids des avances +1; naissance du lien ×1,25; risque défavorable +0,05.",
    effects: { flirt: 1, romanticStart: 0.25, negative: 0.05 },
    valence: "positive",
  },
  inspired: {
    label: "Inspiré",
    description: "Progression de composition +25 %; qualité d’écriture +6.",
    effects: { writing: 0.25, quality: 6 },
    valence: "positive",
  },
  generous: {
    label: "Attentionné",
    description: "Poids du soutien +2; résultat favorable du soutien +0,15.",
    effects: { support: 2, supportQuality: 0.15 },
    valence: "positive",
  },
  receptive: {
    label: "Réceptif",
    description: "Acceptation +0,12; résultat favorable +0,06.",
    effects: { accept: 0.12, positive: 0.06 },
    valence: "positive",
  },
  calming: {
    label: "Apaisant",
    description: "Poids du soutien +1; efficacité d’un soutien réussi +30 %.",
    effects: { support: 1, supportPower: 0.3 },
    valence: "positive",
  },
};
export function effectiveTraits(p) {
  return [...new Set([...(p.traits || []), ...(p.activeTraits || [])])];
}
export function traitEffect(p, key) {
  return effectiveTraits(p).reduce(
    (n, t) => n + (TRAIT_CATALOG[t]?.effects[key] || 0),
    0,
  );
}
export function updateTraits(p) {
  p.activeTraits = [
    ...new Set(
      p.emotionalThresholds
        .filter((t) => p.emotions[t.axis] >= t.threshold)
        .map((t) => t.trait),
    ),
  ];
  return p.activeTraits;
}
export function newBag(index = 0) {
  const composition = Object.fromEntries(
    BAG_ACTIONS.map((k, i) => [k, BAG_SAMPLES[index % BAG_SAMPLES.length][i]]),
  );
  return {
    composition,
    cycleComposition: { ...composition },
    remaining: { ...composition },
    consumed: Object.fromEntries(BAG_ACTIONS.map((k) => [k, 0])),
    reserved: null,
    cycle: 1,
  };
}
export function editTokens(p, key, value) {
  if (!BAG_ACTIONS.includes(key)) return false;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) return false;
  const next = { ...p.bag.composition, [key]: n };
  if (!Object.values(next).some((n) => n > 0)) return false;
  p.bag.composition = next;
  return true;
}
export function bagRowsV7(p) {
  const total = Object.values(p.bag.remaining).reduce((a, b) => a + b, 0);
  return BAG_ACTIONS.map((key) => ({
    key,
    score: p.bag.remaining[key],
    base: p.bag.cycleComposition[key],
    remaining: p.bag.remaining[key],
    consumed: p.bag.consumed[key],
    chance: total ? (p.bag.remaining[key] / total) * 100 : 0,
    why: `${p.bag.remaining[key]} jetons restants sur ${p.bag.cycleComposition[key]}`,
    blocked: p.bag.remaining[key] === 0 ? "Épuisé pour ce cycle" : null,
  }));
}
export function reserveToken(p, random) {
  const b = p.bag;
  if (b.reserved) return b.reserved;
  if (!Object.values(b.remaining).some((n) => n > 0)) {
    b.cycle++;
    b.cycleComposition = { ...b.composition };
    b.remaining = { ...b.composition };
    b.consumed = Object.fromEntries(BAG_ACTIONS.map((k) => [k, 0]));
  }
  let roll = random() * Object.values(b.remaining).reduce((a, b) => a + b, 0);
  const key = BAG_ACTIONS.find((k) => (roll -= b.remaining[k]) < 0);
  b.remaining[key]--;
  b.reserved = key;
  return key;
}
export function consumeToken(p) {
  if (!p.bag.reserved) return;
  p.bag.consumed[p.bag.reserved]++;
  p.bag.reserved = null;
}
export function returnToken(p) {
  if (!p.bag.reserved) return;
  p.bag.remaining[p.bag.reserved]++;
  p.bag.reserved = null;
}
export function initializeV7Person(p, time, random) {
  p.bag = newBag(Math.max(0, Number(p.id.slice(1)) - 1));
  p.emotions = { exaltation: 12, distress: 0 };
  p.emotionSources = {};
  p.history = [];
  p.needThresholds = Object.fromEntries(
    ["energy", "social", "fun", "expression"].map((k) => {
      const low = 20 + Math.floor(random() * 16);
      return [
        k,
        {
          low,
          critical: Math.max(5, low - 15),
          high: 85 + Math.floor(random() * 11),
          lowRate: 0.04,
          criticalRate: 0.1,
          highRate: 0.035,
        },
      ];
    }),
  );
  const count = 1 + Math.floor(random() * 2);
  p.emotionalThresholds = [];
  for (let i = 0; i < count; i++) {
    const axis = random() < 0.5 ? "distress" : "exaltation",
      normal = random() < 0.8;
    const valence = (axis === "distress") === normal ? "negative" : "positive";
    const choices = Object.keys(TRAIT_CATALOG).filter(
      (k) =>
        TRAIT_CATALOG[k].valence === valence &&
        !p.emotionalThresholds.some((t) => t.trait === k),
    );
    p.emotionalThresholds.push({
      axis,
      threshold: 25 + Math.floor(random() * 61),
      trait: choices[Math.floor(random() * choices.length)],
    });
  }
  const socialRole = random();
  if (socialRole < 0.2) p.traits.push("alpha");
  else if (socialRole < 0.4) p.traits.push("beta");
  p.sleep = {
    bedtime: effectiveTraits(p).includes("night") ? 120 : 1380,
    required: (6 + Math.floor(random() * 5)) * 60,
    habitual: 0,
    nextBedtime: 0,
    wakeAt: null,
    started: null,
    minutes: 0,
  };
  p.sleep.habitual = p.sleep.required;
  const day = Math.floor(time / 1440),
    candidate = day * 1440 + p.sleep.bedtime;
  p.sleep.nextBedtime = candidate > time ? candidate : candidate + 1440;
  p.pressures = [];
  p.waitUntil = 0;
  updateTraits(p);
}
export function emotionalMinute(p, params) {
  const pressure = [];
  let distress = 0,
    exaltation = 0;
  for (const [need, t] of Object.entries(p.needThresholds)) {
    const value = p.needs[need];
    if (value < t.low) {
      const rate = value < t.critical ? t.criticalRate : t.lowRate;
      distress += rate;
      pressure.push({
        need,
        axis: "distress",
        rate,
        threshold: value < t.critical ? t.critical : t.low,
      });
    } else if (value >= t.high) {
      exaltation += t.highRate;
      pressure.push({
        need,
        axis: "exaltation",
        rate: t.highRate,
        threshold: t.high,
      });
    }
  }
  const decay = (0.025 + p.personality.stable * 0.00065) * params.emotionDecay;
  p.emotions.exaltation = clamp(p.emotions.exaltation + exaltation - decay);
  p.emotions.distress = clamp(p.emotions.distress + distress - decay);
  p.pressures = pressure;
  p.emotionDecay = decay;
  updateTraits(p);
}
export function partnerWeight(s, p, q, relation) {
  const shared = s.groups.filter(
    (g) =>
      g.archivedAt === null &&
      g.members.includes(p.id) &&
      g.members.includes(q.id),
  );
  const groupBonus = Math.max(0, ...shared.map((g) => 1 + g.development / 8));
  const close = relation.affinity >= 75 ? 6 : 0;
  return Math.max(
    0.1,
    1 +
      Math.max(0, relation.affinity) / 20 -
      relation.tension / 30 +
      groupBonus +
      close,
  );
}
export function weightedChoice(items, weight, random) {
  if (!items.length) return null;
  const weights = items.map((x) => Math.max(0.01, weight(x)));
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  return items.find((x, i) => (roll -= weights[i]) < 0) || items.at(-1);
}
export function interactionProbabilities(
  a,
  b,
  r,
  type = "discuss",
  conflict = 1,
) {
  const acceptance = clamp(
    0.55 +
      r.affinity * 0.003 -
      r.tension * 0.004 +
      b.emotions.exaltation * 0.001 -
      b.emotions.distress * 0.002 +
      traitEffect(b, "accept"),
    0.05,
    0.95,
  );
  let positive = clamp(
    0.45 +
      r.affinity * 0.0025 -
      r.tension * 0.002 +
      (a.emotions.exaltation + b.emotions.exaltation) * 0.0007 -
      (a.emotions.distress + b.emotions.distress) * 0.001 +
      traitEffect(a, "positive") +
      traitEffect(b, "positive") +
      (type === "support"
        ? a.personality.kind / 500 + traitEffect(a, "supportQuality")
        : 0),
    0.08,
    0.8,
  );
  let negative = clamp(
    (0.15 +
      r.tension * 0.003 -
      r.affinity * 0.001 +
      (a.emotions.distress + b.emotions.distress) * 0.001 +
      traitEffect(a, "negative") +
      traitEffect(b, "negative")) *
      conflict,
    0.03,
    0.7,
  );
  if (positive + negative > 0.95) {
    const factor = 0.95 / (positive + negative);
    positive *= factor;
    negative *= factor;
  }
  return {
    acceptance,
    positive,
    neutral: 1 - positive - negative,
    negative,
    base: { acceptance: 0.55, positive: 0.45, negative: 0.15 },
    modifiers: {
      accept: traitEffect(b, "accept"),
      positive: traitEffect(a, "positive") + traitEffect(b, "positive"),
      negative: traitEffect(a, "negative") + traitEffect(b, "negative"),
      support:
        type === "support"
          ? a.personality.kind / 500 + traitEffect(a, "supportQuality")
          : 0,
      conflict,
    },
    inputs: {
      affinity: r.affinity,
      tension: r.tension,
      initiator: { ...a.emotions },
      recipient: { ...b.emotions },
      initiatorTraits: effectiveTraits(a),
      recipientTraits: effectiveTraits(b),
    },
  };
}
export function coolRelationV7(r) {
  const friendship = Math.max(0, r.affinity) / 100;
  r.grief ||= { strength: 0, time: 0, cause: null };
  r.grief.strength = Math.max(0, r.grief.strength - 0.015);
  const floor = Math.min(15, r.grief.strength * 0.45);
  r.tension = clamp(Math.max(floor, r.tension - (0.02 + 0.18 * friendship)));
  if (r.tension >= 30)
    r.affinity = clamp(r.affinity - 0.0005 * (r.tension - 20), -100, 100);
}
export const DISCONNECTED = [
  {
    id: "memory-mood",
    label: "Poids des souvenirs sur l’humeur",
    reason:
      "Humeur supprimée. Souvenirs conservés comme histoire et sources de chansons; poids historique sans effet autonome.",
  },
  {
    id: "six-tones",
    label: "Nuances des six émotions en composition",
    reason:
      "Les nouvelles chansons distinguent exaltation et détresse. Les six anciennes nuances ne sont pas simulées; chansons historiques conservées.",
  },
  {
    id: "personality-choice",
    label: "Personnalité et priorités dans la pige",
    reason:
      "Retirées du choix d’action. Les effets conservés de personnalité agissent ailleurs; aucun score caché ne remplace le sac.",
  },
  {
    id: "lazy-choice",
    label: "Bonus de choix du trait Relax",
    reason: "Trait historique conservé, ancien bonus de score débranché.",
  },
];
export function validateV7(s) {
  const finite = (v, a = 0, b = 100) => Number.isFinite(v) && v >= a && v <= b;
  if (
    !Array.isArray(s.socialSessions) ||
    s.socialSessions.some(
      (x) =>
        typeof x.id !== "string" ||
        !Array.isArray(x.members) ||
        x.members.some((id) => !s.people.some((p) => p.id === id)) ||
        !Number.isFinite(x.nextExchange) ||
        !Number.isFinite(x.created) ||
        (x.ended !== null && !Number.isFinite(x.ended)),
    )
  )
    throw Error("Séance sociale invalide.");
  for (const r of Object.values(s.rels))
    if (typeof r.couple !== "boolean" || "attraction" in r)
      throw Error("Lien amoureux V7 invalide.");
  for (const p of s.people) {
    const b = p.bag;
    if (
      !b ||
      !Number.isInteger(b.cycle) ||
      b.cycle < 1 ||
      !["composition", "cycleComposition", "remaining", "consumed"].every(
        (field) =>
          b[field] &&
          Object.keys(b[field]).length === 5 &&
          BAG_ACTIONS.every(
            (k) => Number.isInteger(b[field][k]) && finite(b[field][k]),
          ),
      )
    )
      throw Error("Sac V7 invalide.");
    if (
      !Object.values(b.composition).some((n) => n > 0) ||
      !Object.values(b.cycleComposition).some((n) => n > 0) ||
      (b.reserved !== null && !BAG_ACTIONS.includes(b.reserved))
    )
      throw Error("Cycle V7 invalide.");
    for (const k of BAG_ACTIONS)
      if (
        b.remaining[k] + b.consumed[k] + (b.reserved === k ? 1 : 0) !==
        b.cycleComposition[k]
      )
        throw Error("Jetons V7 incohérents.");
    if (
      Object.keys(p.emotions).length !== 2 ||
      Object.keys(p.needs).length !== 4 ||
      (p.traits.includes("alpha") && p.traits.includes("beta"))
    )
      throw Error("Champs V7 ou traits incompatibles.");
    const active = [
      ...new Set(
        p.emotionalThresholds
          ?.filter((t) => p.emotions[t.axis] >= t.threshold)
          .map((t) => t.trait),
      ),
    ];
    if (
      !Array.isArray(p.activeTraits) ||
      active.length !== p.activeTraits.length ||
      active.some((t) => !p.activeTraits.includes(t))
    )
      throw Error("Traits actifs incohérents.");
    if (
      b.reserved &&
      (!p.action ||
        p.action.mode !== "bag" ||
        p.action.key !== b.reserved ||
        p.action.tokenStarted)
    )
      throw Error("Réservation sans activité.");
    if (
      !Number.isFinite(p.waitUntil) ||
      p.waitUntil < 0 ||
      !Array.isArray(p.pressures)
    )
      throw Error("Attente V7 invalide.");
    if (
      !p.sleep ||
      !finite(p.sleep.bedtime, 0, 1439) ||
      !finite(p.sleep.required, 240, 900) ||
      !finite(p.sleep.habitual, 240, 900) ||
      !Number.isFinite(p.sleep.nextBedtime) ||
      !finite(p.sleep.minutes, 0, 1e6) ||
      (p.sleep.started !== null && !Number.isFinite(p.sleep.started)) ||
      (p.sleep.wakeAt !== null && !Number.isFinite(p.sleep.wakeAt))
    )
      throw Error("Sommeil V7 invalide.");
    if (
      !Array.isArray(p.activeTraits) ||
      !Array.isArray(p.emotionalThresholds) ||
      p.emotionalThresholds.some(
        (t) =>
          !["exaltation", "distress"].includes(t.axis) ||
          !finite(t.threshold) ||
          !TRAIT_CATALOG[t.trait],
      ) ||
      p.activeTraits.some((t) => !TRAIT_CATALOG[t])
    )
      throw Error("Traits V7 invalides.");
    if (
      !p.needThresholds ||
      Object.keys(p.needThresholds).length !== 4 ||
      Object.entries(p.needThresholds).some(
        ([k, t]) =>
          !["energy", "social", "fun", "expression"].includes(k) ||
          !finite(t.low) ||
          !finite(t.critical) ||
          !finite(t.high) ||
          t.critical >= t.low ||
          t.low >= t.high ||
          ![t.lowRate, t.criticalRate, t.highRate].every((v) =>
            finite(v, 0, 1),
          ),
      )
    )
      throw Error("Seuils V7 invalides.");
  }
}
