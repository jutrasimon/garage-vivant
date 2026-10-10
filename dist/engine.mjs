import {
  NEED_DRAIN,
  ACTIVITY_EFFECTS,
  BAG_ACTIONS,
  TRAIT_CATALOG,
  V7_RULES,
  initializeV7Person,
  updateTraits,
  traitEffect,
  effectiveTraits,
  bagRowsV7,
  reserveToken,
  consumeToken,
  returnToken,
  emotionalMinute,
  weightedChoice,
  partnerWeight,
  interactionProbabilities,
  coolRelationV7,
  validateV7,
} from "./v7.mjs?v=0.7.0";
import {
  initializeV6Person,
  upgradeV6,
  markGrief,
  repairGrief,
} from "./social.mjs?v=0.7.0";
import {
  initializePerson,
  initializeGroup,
  initializeLife,
  upgradeLife,
  learningGain,
  changeDecadence,
  archiveSong,
  groupRehearsal,
  travelEngagement,
  lifeMinute,
  refreshOpportunity,
  validateLife,
} from "./life.mjs?v=0.7.0";
export const VERSION = "0.7.0";
export const NEEDS = {
  energy: "Énergie",
  social: "Lien social",
  fun: "Plaisir",
  expression: "Expression",
};
export const PERSONALITY = {
  creative: "Créativité",
  outgoing: "Extraversion",
  kind: "Empathie",
  discipline: "Discipline",
  stable: "Stabilité",
  ambition: "Ambition",
};
export const SKILLS = {
  guitar: "Guitare",
  bass: "Basse",
  drums: "Batterie",
  voice: "Chant",
  keys: "Clavier",
  sax: "Saxophone",
  trumpet: "Trompette",
  percussion: "Percussions",
  writing: "Composition",
};
export const GENRES = [
  "Indie",
  "Punk",
  "Folk",
  "Métal",
  "Jazz",
  "Électro",
  "Ska",
  "Pop",
];
export const TRAITS = Object.fromEntries(
  Object.entries(TRAIT_CATALOG).map(([k, t]) => [k, t.label]),
);
export const LEGACY_EMOTIONS = {
  joy: {
    label: "Joie",
    levels: ["Contentement", "Joie", "Euphorie"],
    color: "#c4a44d",
    tone: "lumineuse",
    icon: "☀",
  },
  sadness: {
    label: "Tristesse",
    levels: ["Mélancolie", "Tristesse", "Chagrin"],
    color: "#7794bb",
    tone: "mélancolique",
    icon: "☂",
  },
  anger: {
    label: "Colère",
    levels: ["Agacement", "Colère", "Rage"],
    color: "#cb785c",
    tone: "rageuse",
    icon: "ϟ",
  },
  fear: {
    label: "Peur",
    levels: ["Inquiétude", "Anxiété", "Panique"],
    color: "#a790b3",
    tone: "tendue",
    icon: "◈",
  },
  affection: {
    label: "Affection",
    levels: ["Sympathie", "Tendresse", "Amour"],
    color: "#c88fa0",
    tone: "intime",
    icon: "♡",
  },
  excitement: {
    label: "Enthousiasme",
    levels: ["Curiosité", "Enthousiasme", "Exaltation"],
    color: "#83a474",
    tone: "énergique",
    icon: "✦",
  },
};
export const EMOTIONS = {
  exaltation: {
    label: "Exaltation",
    levels: ["Exaltation"],
    color: "#c4a44d",
    tone: "exaltée",
    icon: "✦",
  },
  distress: {
    label: "Détresse",
    levels: ["Détresse"],
    color: "#a87ca4",
    tone: "tourmentée",
    icon: "◈",
  },
};
export function emotionDefinition(key) {
  return EMOTIONS[key] || LEGACY_EMOTIONS[key];
}
export const PRIORITIES = {
  0: "Interdit",
  1: "Haute",
  2: "Normale",
  3: "Basse",
};
export const ACTIONS = {
  relax: {
    label: "Décrocher",
    icon: "☀",
    duration: 45,
    description:
      "Pause pendant l’éveil : énergie +0,16 et plaisir +0,8 par minute; détresse −0,07. Ne remplace pas une nuit.",
  },
  social: {
    label: "Socialiser",
    icon: "♡",
    duration: 50,
    description:
      "Rejoint une personne ou une discussion. Acceptation puis résultat; recherche limitée à 30 minutes.",
  },
  practice: {
    label: "Pratiquer",
    icon: "♫",
    duration: 65,
    description:
      "Pratique son instrument seul; expression et compétence progressent.",
  },
  jam: {
    label: "Jammer",
    icon: "♬",
    duration: 85,
    description:
      "Propose ou rejoint une séance ouverte. La musique commence à deux; échanges toutes les 15 minutes de séance.",
  },
  write: {
    label: "Composer",
    icon: "✎",
    duration: 75,
    description:
      "Avance un projet persistant; plusieurs séances terminent une chanson.",
  },
  sleep: {
    label: "Dormir",
    icon: "☾",
    duration: 480,
    internal: true,
    description: "Sommeil quotidien hors sac; durée et horaire personnels.",
  },
};

export const PLACES = [
  {
    id: "g1",
    name: "Garage des Érables",
    kind: "garage",
    x: 100,
    y: 94,
    w: 220,
    h: 132,
    door: { x: 210, y: 253 },
    color: "#bdcced",
  },
  {
    id: "cafe",
    name: "Chez Jo · café des voisins",
    kind: "cafe",
    x: 420,
    y: 100,
    w: 210,
    h: 126,
    door: { x: 525, y: 253 },
    color: "#edc699",
  },
  {
    id: "g2",
    name: "Garage du Canal",
    kind: "garage",
    x: 755,
    y: 94,
    w: 225,
    h: 132,
    door: { x: 867, y: 253 },
    color: "#bdcfb4",
  },
  {
    id: "home1",
    name: "Maisons · rue des Érables",
    kind: "home",
    x: 90,
    y: 446,
    w: 205,
    h: 125,
    door: { x: 192, y: 420 },
    color: "#d5cbbd",
  },
  {
    id: "park",
    name: "Parc des Amplis",
    kind: "park",
    x: 400,
    y: 440,
    w: 250,
    h: 135,
    door: { x: 525, y: 420 },
    color: "#a9c69d",
  },
  {
    id: "shop",
    name: "Le disquaire",
    kind: "disquaire",
    x: 790,
    y: 444,
    w: 190,
    h: 125,
    door: { x: 885, y: 420 },
    color: "#d7bdd5",
  },
];
export const DEFAULTS = {
  drain: 1,
  music: 1,
  social: 1,
  conflict: 1,
  learning: 1,
  randomness: 0.3,
  relations: 1,
  emotionDecay: 1,
  romance: 1,
  compositionPace: 1,
};

export const clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));
export const round = (x) => Math.round(x) || 0;
export function rand(s) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
const pick = (s, a) => a[Math.floor(rand(s) * a.length)];
const range = (s, a, b) => a + rand(s) * (b - a);
const emptyEmotions = () =>
  Object.fromEntries(Object.keys(EMOTIONS).map((k) => [k, 0]));
const priorities = () =>
  Object.fromEntries(Object.keys(ACTIONS).map((k) => [k, 2]));
const musical = ["practice", "jam", "write"];
const sociable = ["social", "sleep"];
const names = [
  "Alex",
  "Sam",
  "Jo",
  "Charlie",
  "Lou",
  "Max",
  "Camille",
  "Noa",
  "Mika",
  "Robin",
  "Kim",
  "Fred",
  "Jules",
  "Morgan",
  "Éli",
  "Sacha",
  "Raphaël",
  "Ari",
  "Jess",
  "Rémi",
  "Léa",
  "Val",
  "Pat",
  "Mel",
];
const colors = [
  "#d67753",
  "#7192b3",
  "#9a79ad",
  "#c0a646",
  "#629c84",
  "#c78196",
  "#75894d",
  "#5b939d",
];
export const relKey = (a, b) => `${a}>${b}`;

export function relationship(s, a, b) {
  const key = relKey(a.id, b.id);
  if (!s.rels[key])
    s.rels[key] = {
      affinity: 0,
      trust: 10,
      tension: 0,
      collaboration: 0,
      couple: false,
      love: 0,
      meetings: 0,
      last: 0,
      lastAdvance: -1440,
      musicSessions: 0,
      grief: { strength: 0, time: s.time, cause: null },
    };
  return s.rels[key];
}
export function chemistry(a, b) {
  let similarity =
    1 -
    (Math.abs(a.personality.creative - b.personality.creative) +
      Math.abs(a.personality.discipline - b.personality.discipline)) /
      200;
  return clamp(
    25 +
      similarity * 30 +
      (a.genre === b.genre ? 25 : 0) +
      (a.instrument !== b.instrument ? 10 : -6) +
      (a.personality.kind + b.personality.kind) / 20,
  );
}
export function dominantEmotion(p) {
  const key =
      p.emotions.exaltation >= p.emotions.distress ? "exaltation" : "distress",
    value = p.emotions[key];
  return {
    key,
    value,
    level: 1,
    label: value < 10 ? "Paisible" : EMOTIONS[key].label,
    active: value >= 10,
  };
}

export function stamp(time) {
  return `J${Math.floor(time / 1440) + 1} ${String(Math.floor((time % 1440) / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
}
export function log(s, type, text, ids = [], details = {}) {
  const actor = s.people.find((p) => p.id === ids[0]);
  const linked = [
    "decision",
    "social",
    "music",
    "conflict",
    "support",
    "romance",
    "jam",
    "project",
  ].includes(type);
  const activityId =
    details.activityId || (linked ? actor?.action?.activityId : null);
  const e = {
    id: ++s.eventId,
    time: s.time,
    type,
    text,
    ids,
    ...details,
    ...(activityId ? { activityId } : {}),
  };
  s.events.unshift(e);
  s.events = s.events.slice(0, 500);
  const activity = s.activities?.find((a) => a.id === activityId);
  if (activity) {
    activity.ids = [...new Set([...activity.ids, ...ids])];
    activity.events.push(e);
    activity.events = activity.events.slice(-24);
  }
  return e;
}
function beginActivity(s, p, a) {
  const id = a.key === "jam" ? a.sessionId : `a${s.nextActivityId++}`;
  a.activityId = id;
  let row = s.activities.find((x) => x.id === id);
  if (!row) {
    row = {
      id,
      key: a.key,
      time: s.time,
      end: null,
      place: a.dest,
      ids: [],
      status: a.route.length ? "travel" : "active",
      activeMinutes: 0,
      events: [],
    };
    s.activities.unshift(row);
  }
  if (!row.ids.includes(p.id)) row.ids.push(p.id);
  const live = s.activities.filter((x) => !x.end),
    past = s.activities
      .filter((x) => x.end && s.time - x.end < 1440 * 14)
      .slice(0, Math.max(0, 240 - live.length));
  s.activities = [...live, ...past].sort((a, b) => b.time - a.time);
  return row;
}
function closeActivity(s, p, status = "completed") {
  const a = p.action,
    row = s.activities.find((x) => x.id === a?.activityId);
  if (!row) return;
  if (
    a.key === "jam" &&
    s.people.some((q) => q !== p && q.action?.sessionId === a.sessionId)
  )
    return;
  row.status = status;
  row.end = s.time;
  row.activeMinutes = Math.max(row.activeMinutes, a.elapsed);
}
export function journalEntries(
  s,
  { raw = false, filter = "all", selected = null } = {},
) {
  const matches = (e) =>
    filter === "all" ||
    (filter === "selected" && e.ids.includes(selected)) ||
    (filter === "social" &&
      ["social", "conflict", "support", "romance"].includes(e.type)) ||
    (filter === "music" &&
      ["music", "jam", "project", "song"].includes(e.type)) ||
    e.type === filter;
  if (raw) return s.events.filter(matches);
  const rows = s.activities
    .map((a) => ({
      ...a,
      type:
        a.key === "jam" ? "jam" : a.key === "write" ? "project" : "activity",
      session: true,
      text: `${ACTIONS[a.key]?.label || "Formation historique"} · ${a.ids.map((id) => s.people.find((p) => p.id === id)?.name || "Ancien voisin").join(", ")}`,
    }))
    .filter(
      (a) =>
        filter === "all" ||
        (filter === "selected" && a.ids.includes(selected)) ||
        (filter === "jam" && a.key === "jam") ||
        (filter === "music" && ["jam", "write", "practice"].includes(a.key)) ||
        filter === "decision" ||
        a.events.some(matches),
    );
  return [...rows, ...s.events.filter((e) => !e.activityId && matches(e))].sort(
    (a, b) => b.time - a.time || String(b.id).localeCompare(String(a.id)),
  );
}
export function chemistryKnowledge(s, a, b) {
  const sessions = Math.min(
    relationship(s, a, b).musicSessions || 0,
    relationship(s, b, a).musicSessions || 0,
  );
  const value = chemistry(a, b);
  return {
    sessions,
    confidence:
      sessions === 0
        ? "Inconnue"
        : sessions < 3
          ? "Impression incertaine"
          : sessions < 6
            ? "Tendance observée"
            : "Tendance confirmée",
    grade:
      sessions === 0
        ? "?"
        : value >= 80
          ? "Très prometteuse"
          : value >= 65
            ? "Prometteuse"
            : value >= 45
              ? "Contrastée"
              : "Difficile",
    known: sessions > 0,
  };
}
const TITLE_PARTS = {
  sadness: [
    "Le silence",
    "La dernière nuit",
    "Une chaise vide",
    "Les départs",
    "Le dernier bus",
  ],
  anger: [
    "Le mur",
    "Les amplis",
    "Les étincelles",
    "La tempête",
    "Les mots de trop",
  ],
  affection: [
    "Nos accords",
    "Une place",
    "Les mains",
    "Les retrouvailles",
    "Le cœur",
  ],
  fear: ["Les ombres", "Les murs", "Un souffle", "Les pas", "Le vertige"],
  joy: ["Les fenêtres", "Le matin", "Les érables", "Les lumières", "La rue"],
  excitement: [
    "Le départ",
    "Les néons",
    "La route",
    "Le volume",
    "Le premier refrain",
  ],
};
function projectTitle(s, emotion, p = null) {
  const endings = [
    "du quartier",
    "à minuit",
    "dans le garage",
    "sous la pluie",
    "du canal",
    "sans détour",
    "en suspens",
    "au loin",
    "de septembre",
    "au bout de la rue",
    "en mouvement",
    "à contretemps",
  ];
  const group =
    p &&
    s.groups.find((g) => g.archivedAt === null && g.members.includes(p.id));
  const memory = p?.memories[0]?.text || "";
  const place = p && PLACES.find((l) => l.id === p.place);
  const context = memory.includes("déclinées")
    ? "après les adieux"
    : memory.includes("Écouté")
      ? "après les mots"
      : group
        ? "de " + group.name.slice(0, 30)
        : place?.id === "g2"
          ? "au canal"
          : null;
  const base =
    pick(
      s,
      emotion === "distress"
        ? [...TITLE_PARTS.sadness, ...TITLE_PARTS.anger, ...TITLE_PARTS.fear]
        : emotion === "exaltation"
          ? [...TITLE_PARTS.joy, ...TITLE_PARTS.excitement]
          : TITLE_PARTS[emotion] || TITLE_PARTS.joy,
    ) +
    " " +
    (context && rand(s) < 0.55 ? context : pick(s, endings));
  let title = base,
    n = 2;
  while (
    s.projects.some((x) => x.title === title) ||
    s.songs.some((x) => x.title === title)
  )
    title = base + " · " + n++;
  return title;
}
function ensureProject(s, p) {
  let project = s.projects.find(
    (x) => x.id === p.draft.projectId && x.status !== "finished",
  );
  if (project) return project;
  const emotion = dominantEmotion(p).key;
  project = {
    id: `c${s.nextProjectId++}`,
    author: p.id,
    title: projectTitle(s, emotion, p),
    genre: p.genre,
    created: s.time,
    updated: s.time,
    work: 0,
    target: 300 + (100 - p.personality.discipline) * 0.75,
    sessions: 0,
    status: "idea",
    emotion,
    tone: emotionDefinition(emotion).tone,
    intensity: round(p.emotions[emotion]),
    sources: [],
    potential: round(
      clamp(
        p.skills.writing * 0.45 +
          p.skills[p.instrument] * 0.25 +
          (p.emotions[emotion] / 100) * (6 + p.personality.creative * 0.12) +
          traitEffect(p, "quality"),
      ),
    ),
    songId: null,
  };
  s.projects.push(project);
  p.draft.projectId = project.id;
  const idea = s.activities
    .flatMap((a) => a.events)
    .filter(
      (e) =>
        e.outcome === "idea" &&
        e.ids.includes(p.id) &&
        s.time - e.time < 1440 &&
        !s.projects.some(
          (x) =>
            x.id !== project.id &&
            x.author === p.id &&
            x.sources.some((c) => c.id === e.id),
        ),
    )
    .sort((a, b) => b.time - a.time)[0];
  if (idea) {
    p.draft.sources.push({ id: idea.id, time: idea.time, text: idea.text });
    p.draft.jamQuality = 4;
    p.draft.jamSamples = 1;
    project.sources = [...p.draft.sources];
  }
  return project;
}
export function compositionProject(s, p) {
  return (
    s.projects.find(
      (x) => x.id === p.draft.projectId && x.status !== "finished",
    ) || null
  );
}
function advanceProject(s, p) {
  const project = ensureProject(s, p);
  project.work = Math.min(
    project.target,
    project.work +
      s.params.compositionPace *
        (0.85 + p.personality.discipline / 300) *
        Math.max(0.1, 1 + traitEffect(p, "writing")),
  );
  project.updated = s.time;
  project.status =
    project.work / project.target < 0.25
      ? "idea"
      : project.work / project.target < 1
        ? "draft"
        : "ready";
  p.songProgress = clamp((project.work / project.target) * 100);
  project.potential = round(
    clamp(
      p.skills.writing * 0.45 +
        p.skills[p.instrument] * 0.25 +
        (project.intensity / 100) * (6 + p.personality.creative * 0.12) +
        traitEffect(p, "quality"),
    ),
  );
  if (p.draft.samples <= 75) {
    const result = Object.entries(p.draft.emotions).sort(
      (a, b) => b[1] - a[1],
    )[0];
    project.emotion = result[0];
    project.intensity = round(result[1] / Math.max(1, p.draft.samples));
    project.tone =
      project.intensity < 10
        ? "posée"
        : emotionDefinition(project.emotion).tone;
    project.sources = [...p.draft.sources];
  }
}

function memory(s, p, text, effect) {
  effect *=
    (p.traits.includes("sensitive") ? 1.5 : 1) *
    (1.3 - p.personality.stable / 200);
  const m = {
    id: `${p.id}-memory-${p.nextMemoryId++}`,
    created: s.time,
    text,
    effect: Math.round(effect * 10) / 10,
    until: s.time + 360,
    sourceId: s.eventId,
  };
  p.memories.unshift(m);
  p.memories = p.memories.slice(0, 6);
  p.memoryArchive ||= [];
  p.memoryArchive.unshift({ ...m });
  p.memoryArchive = p.memoryArchive.slice(0, 600);
}
export function feel(s, p, changes, source) {
  for (const [key, amount] of Object.entries(changes)) {
    if (!EMOTIONS[key]) throw Error("Émotion V7 inconnue : " + key);
    const multiplier =
      amount > 0
        ? Math.max(0, 1 + traitEffect(p, "reaction")) *
          (1.15 - p.personality.stable / 300)
        : 1;
    p.emotions[key] = clamp(p.emotions[key] + amount * multiplier);
    if (amount > 0 && source)
      p.emotionSources[key] = [
        { id: source.id, time: source.time, text: source.text },
        ...(p.emotionSources[key] || []).filter((x) => x.id !== source.id),
      ].slice(0, 3);
  }
  updateTraits(p);
}

function defaultDraft() {
  return {
    projectId: null,
    samples: 0,
    emotions: emptyEmotions(),
    sources: [],
    authors: [],
    jamQuality: 0,
    jamSamples: 0,
  };
}
export function addPerson(s) {
  if (s.people.length >= 24) return null;
  let n = s.nextId++,
    personality = Object.fromEntries(
      Object.keys(PERSONALITY).map((k) => [k, round(range(s, 20, 85))]),
    );
  let traits = [];
  for (let i = 0; i < 2; i++) {
    let t = pick(
      s,
      Object.keys(TRAITS).filter(
        (k) => !["alpha", "beta"].includes(k) && !TRAIT_CATALOG[k].valence,
      ),
    );
    if (!traits.includes(t)) traits.push(t);
  }
  let instrument = pick(
    s,
    Object.keys(SKILLS).filter((k) => k !== "writing"),
  );
  let start = pick(s, PLACES),
    door = start.door;
  let p = {
    id: `p${n}`,
    name: names[(n - 1) % names.length] + (n > 24 ? " " + n : ""),
    color: colors[(n - 1) % colors.length],
    age: round(range(s, 19, 47)),
    instrument,
    genre: pick(s, GENRES),
    personality,
    traits,
    skills: Object.fromEntries(
      Object.keys(SKILLS).map((k) => {
        const tier = rand(s),
          experienced = tier < 0.15,
          exceptional = tier < 0.03;
        return [
          k,
          round(
            range(
              s,
              k === instrument
                ? exceptional
                  ? 65
                  : experienced
                    ? 38
                    : 14
                : k === "writing" && exceptional
                  ? 35
                  : 4,
              k === instrument
                ? exceptional
                  ? 78
                  : experienced
                    ? 64
                    : 38
                : k === "writing"
                  ? exceptional
                    ? 55
                    : 28
                  : 18,
            ),
          ),
        ];
      }),
    ),
    needs: Object.fromEntries(
      Object.keys(NEEDS).map((k) => [k, round(range(s, 50, 90))]),
    ),
    x: door.x + range(s, -25, 25),
    y: door.y,
    home: "home1",
    place: start.id,
    action: null,
    candidates: [],
    memories: [],
    history: [],
    songProgress: 0,
    emotions: { exaltation: 12, distress: 0 },
    emotionSources: {},
    priorities: priorities(),
    draft: defaultDraft(),
    lastFormation: -1440,
    actionCounts: Object.fromEntries(
      Object.keys(ACTIONS).map((k) => [
        k,
        { started: 0, completed: 0, interrupted: 0 },
      ]),
    ),
    countsSince: s.time,
    reputation: {
      score: 0,
      skill: 0,
      catalogue: 0,
      recognition: 0,
      collaboration: 0,
    },
  };
  initializePerson(p);
  initializeV7Person(p, s.time, () => rand(s));
  s.people.push(p);
  if (!s.playerId) s.playerId = p.id;
  for (const b of s.people)
    if (b !== p) {
      relationship(s, p, b);
      relationship(s, b, p);
    }
  refreshReputation(s, p);
  log(s, "system", `${p.name} s’installe dans le quartier.`, [p.id]);
  return p;
}
export function createWorld(seed = 2040, count = 8) {
  const s = {
    version: VERSION,
    time: 480,
    rng: seed >>> 0,
    seed: seed >>> 0,
    nextId: 1,
    eventId: 0,
    nextSongId: 1,
    nextGroupId: 1,
    nextJamId: 1,
    nextActivityId: 1,
    nextProjectId: 1,
    activities: [],
    socialSessions: [],
    projects: [],
    people: [],
    rels: {},
    events: [],
    songs: [],
    groups: [],
    jams: [],
    params: { ...DEFAULTS },
    scenario: "Équilibre",
    history: [],
    decisionMode: "bag",
  };
  for (let i = 0; i < count; i++) addPerson(s);
  initializeLife(s);
  for (const p of s.people) {
    refreshReputation(s, p);
    decide(s, p);
  }
  return s;
}
export function groupsOf(s, p) {
  return s.groups.filter((g) => g.members.includes(p.id));
}
export function isMember(s, p) {
  return groupsOf(s, p).length > 0;
}
export function refreshReputation(s, p) {
  const songs = s.songs.filter((x) => x.authors.includes(p.id)),
    avg = songs.length
      ? songs.reduce((a, x) => a + x.quality, 0) / songs.length
      : 0;
  const known = s.people
    .filter((x) => x !== p)
    .map((x) => relationship(s, x, p));
  const skill = p.skills[p.instrument] * 0.25,
    catalogue = avg * 0.3 * (1 - Math.exp(-songs.length / 2)),
    recognition = Math.min(
      25,
      (p.showFame || 0) +
        [...songs]
          .sort(
            (a, b) => (b.resonance ?? b.quality) - (a.resonance ?? a.quality),
          )
          .slice(0, 8)
          .reduce((a, x) => a + (x.resonance ?? x.quality) / 100, 0) *
          3.125,
    ),
    collaboration = Math.min(
      20,
      known.reduce((a, r) => a + r.collaboration / 100, 0) * 5,
    );
  p.reputation = {
    score: round(clamp(skill + catalogue + recognition + collaboration)),
    skill: round(skill),
    catalogue: round(catalogue),
    recognition: round(recognition),
    collaboration: round(collaboration),
  };
  return p.reputation;
}
export function formationEligible(s, a, b) {
  if (a === b) return false;
  const ab = relationship(s, a, b),
    ba = relationship(s, b, a);
  return (
    ab.affinity >= 22 &&
    ba.affinity >= 22 &&
    Math.min(ab.trust, ba.trust) >= 18 &&
    Math.max(ab.tension, ba.tension) < 40 &&
    (Math.min(ab.collaboration, ba.collaboration) >= 10 ||
      Math.min(ab.affinity, ba.affinity) >= 40)
  );
}
export function formationPlan(s, p) {
  if (s.time - p.lastFormation < 720) return null;
  const peers = s.people
    .filter((q) => q !== p && formationEligible(s, p, q))
    .sort(
      (a, b) =>
        b.reputation.score +
        relationship(s, p, b).affinity -
        (a.reputation.score + relationship(s, p, a).affinity),
    );
  for (const q of peers) {
    const shared = s.groups.some(
      (g) =>
        g.archivedAt === null &&
        g.members.includes(p.id) &&
        g.members.includes(q.id),
    );
    if (shared) continue;
    const group = groupsOf(s, q).find(
      (g) =>
        g.archivedAt === null &&
        !g.members.includes(p.id) &&
        g.members.filter((id) =>
          formationEligible(
            s,
            p,
            s.people.find((x) => x.id === id),
          ),
        ).length >= Math.ceil(g.members.length / 2),
    );
    return { partner: q.id, groupId: group?.id || null };
  }
  return null;
}
export function createGroup(s, ids, { name = null, manual = false } = {}) {
  const members = [...new Set(ids)].filter((id) =>
    s.people.some((p) => p.id === id),
  );
  if (members.length < 2) return null;
  const existing = s.groups.find(
    (g) =>
      g.archivedAt === null &&
      g.members.length === members.length &&
      members.every((id) => g.members.includes(id)),
  );
  if (existing) return existing;
  const founders = members.slice(0, 2),
    p = s.people.find((x) => x.id === founders[0]),
    q = s.people.find((x) => x.id === founders[1]);
  if (!manual && !formationEligible(s, p, q)) return null;
  const group = {
    id: `g${s.nextGroupId++}`,
    name:
      name ||
      pick(s, [
        "Les Amplis du coin",
        "Rue des Érables",
        "Les Notes de travers",
        "Minuit au garage",
        "Les Voisins électriques",
        "Le Dernier Accord",
      ]) +
        " " +
        (s.nextGroupId - 1),
    members,
    founders,
    created: s.time,
    genre: p.genre,
    origin: manual ? "laboratoire" : "autonome",
  };
  initializeGroup(group, s.time);
  s.groups.push(group);
  const ev = log(
    s,
    "group",
    `${manual ? "Intervention : " : ""}${members.map((id) => s.people.find((p) => p.id === id).name).join(", ")} forment « ${group.name} ».`,
    members,
    { groupId: group.id },
  );
  for (const id of members) {
    const p = s.people.find((x) => x.id === id);
    p.lastFormation = s.time;
    feel(s, p, { exaltation: 23 }, ev);
  }
  return group;
}
export function scores(s, p) {
  return bagRowsV7(p);
}
function destination(s, p, key) {
  if (key === "sleep") return PLACES.find((x) => x.id === p.home);
  if (key === "relax") return PLACES.find((x) => x.kind === "park");
  if (key === "social") {
    const peers = s.people.filter(
      (q) =>
        q !== p &&
        !q.engagement &&
        q.action &&
        ["social", "relax"].includes(q.action.key),
    );
    const q = weightedChoice(
      peers,
      (q) => partnerWeight(s, p, q, relationship(s, p, q)),
      () => rand(s),
    );
    p.nextPartner = q?.id || null;
    if (q) return PLACES.find((x) => x.id === q.action.dest);
    return pick(
      s,
      PLACES.filter((x) => ["park", "cafe", "disquaire"].includes(x.kind)),
    );
  }
  return pick(
    s,
    PLACES.filter((x) => x.kind === "garage"),
  );
}

export function locationReason(s, p) {
  const a = p.action;
  if (!a) return "";
  if (a.key === "jam") {
    const j = s.jams.find((x) => x.id === a.sessionId);
    return `Rendez-vous commun pour la jam${j ? " proposée par " + (s.people.find((x) => x.id === j.host)?.name || "un voisin") : ""}.`;
  }
  if (musical.includes(a.key))
    return "Le garage possède les instruments et l’espace pour faire de la musique.";
  if (a.key === "sleep") return "La maison permet de récupérer son énergie.";
  if (a.key === "relax") return "Pause pendant l’éveil au parc, hors sommeil.";
  return "Un lieu de rencontre, choisi pour retrouver un voisin ou changer d’air.";
}
function routeTo(s, p, a, dest) {
  a.dest = dest.id;
  const slot = s.people.indexOf(p),
    target = {
      x: dest.door.x + ((slot % 6) - 2.5) * 28,
      y: dest.door.y + (Math.floor(slot / 6) - 0.5) * 34,
    };
  const same =
    p.place === dest.id && Math.hypot(p.x - target.x, p.y - target.y) < 100;
  a.route = same ? [] : [{ x: p.x, y: 340 }, { x: target.x, y: 340 }, target];
  if (same) {
    p.x = target.x;
    p.y = target.y;
  }
}
export function decide(s, p, forced = null, options = {}) {
  if (p.engagement) return p.action;
  if (p.action?.key === "sleep" && p.action.remaining > 0 && forced !== "sleep")
    return p.action;
  if (p.action?.remaining > 0) {
    if (p.action.elapsed > 0) p.actionCounts[p.action.key].interrupted++;
    closeActivity(s, p, p.action.elapsed > 0 ? "interrupted" : "cancelled");
    returnToken(p);
  }
  const key = forced || reserveToken(p, () => rand(s));
  if (!ACTIONS[key]) throw Error("Action V7 inconnue");
  // Record the counts used for this draw, including a freshly refilled cycle.
  p.candidates = forced
    ? []
    : bagRowsV7({
        bag: {
          ...p.bag,
          remaining: { ...p.bag.remaining, [key]: p.bag.remaining[key] + 1 },
        },
      });
  if (key === "sleep") {
    p.sleep.minutes = 0;
    p.sleep.started = s.time;
  }
  let dest = destination(s, p, key);
  p.actionCounts[key].started++;
  p.action = {
    key,
    dest: dest.id,
    remaining: key === "sleep" ? p.sleep.habitual : ACTIONS[key].duration,
    elapsed: 0,
    started: s.time,
    why: forced
      ? key === "sleep"
        ? "Sommeil quotidien hors sac"
        : "Intervention manuelle hors sac"
      : `Jeton ${ACTIONS[key].label} réservé sans remise · cycle ${p.bag.cycle}`,
    route: [],
    quality: 0,
    partners: [],
    solo: false,
    decision: structuredClone(p.candidates),
    mode: forced ? "manual" : "bag",
    waited: 0,
    sessionId: null,
    recovery: key === "sleep" ? "sleep" : key === "relax" ? "pause" : null,
    target: p.nextPartner || null,
    tokenStarted: false,
  };
  if (key === "jam") {
    const j = assignJam(s, p, options.sessionId, options);
    p.action.sessionId = j.id;
    dest = PLACES.find((x) => x.id === j.place);
  }
  routeTo(s, p, p.action, dest);
  beginActivity(s, p, p.action);
  if (key === "write") ensureProject(s, p);
  log(
    s,
    "decision",
    `${p.name} : ${ACTIONS[key].label.toLowerCase()}. ${p.action.why}.`,
    [p.id],
  );
  return p.action;
}
export function conflictRisk(s, a, b) {
  return interactionProbabilities(
    a,
    b,
    relationship(s, b, a),
    "discuss",
    s.params.conflict,
  ).negative;
}
export function interaction(s, a, b, type = "discuss", music = false) {
  if (
    a === b ||
    a.action?.key === "sleep" ||
    b.action?.key === "sleep" ||
    a.engagement ||
    b.engagement
  )
    return null;
  const ra = relationship(s, a, b),
    rb = relationship(s, b, a);
  if (
    type === "advance" &&
    (a.age < 18 ||
      b.age < 18 ||
      ra.love < V7_RULES.advanceThreshold ||
      s.time - ra.lastAdvance < 720)
  )
    return null;
  const probs = interactionProbabilities(a, b, rb, type, s.params.conflict);
  const acceptRoll = rand(s),
    accepted = acceptRoll < probs.acceptance;
  if (type === "advance") ra.lastAdvance = s.time;
  const roll = accepted ? rand(s) : null;
  const outcome = !accepted
    ? "refused"
    : roll < probs.positive
      ? "favorable"
      : roll < probs.positive + probs.neutral
        ? "neutral"
        : "unfavorable";
  const label = {
    discuss: "discuter",
    support: "soutenir",
    advance: "faire une avance",
  }[type];
  const event = log(
    s,
    outcome === "unfavorable"
      ? "conflict"
      : type === "support"
        ? "support"
        : type === "advance"
          ? "romance"
          : music
            ? "music"
            : "social",
    `${a.name} propose de ${label} à ${b.name} : ${outcome === "refused" ? "refus" : outcome === "favorable" ? "échange favorable" : outcome === "neutral" ? "échange neutre" : "échange défavorable"}.`,
    [a.id, b.id],
    {
      interaction: type,
      outcome,
      accepted,
      probabilities: probs,
      rolls: { acceptance: acceptRoll, result: roll },
      explanation:
        "Affinité et tension du destinataire, deux jauges émotionnelles, traits actifs. Aucune humeur.",
    },
  );
  const before = structuredClone({
    a: { emotions: a.emotions, needs: a.needs, relation: ra },
    b: { emotions: b.emotions, needs: b.needs, relation: rb },
  });
  if (!accepted) {
    feel(s, a, { distress: 1 }, event);
    event.changes = {
      before,
      after: structuredClone({
        a: { emotions: a.emotions, needs: a.needs, relation: ra },
        b: { emotions: b.emotions, needs: b.needs, relation: rb },
      }),
    };
    return { accepted, event, outcome };
  }
  for (const [p, q, r] of [
    [a, b, ra],
    [b, a, rb],
  ]) {
    p.needs.social = clamp(p.needs.social + 6);
    r.meetings++;
    r.last = s.time;
    if (outcome === "favorable") {
      const chemBonus = music ? Math.max(0, chemistry(a, b) - 50) / 100 : 0;
      r.affinity = clamp(
        r.affinity + (0.4 + chemBonus) * s.params.relations,
        -100,
        100,
      );
      r.trust = clamp(r.trust + 1);
      r.tension = clamp(r.tension - 3 * s.params.relations);
      repairGrief(r, 2);
      feel(s, p, { exaltation: 3 }, event);
    }
    if (outcome === "unfavorable") {
      r.affinity = clamp(r.affinity - 0.5 * s.params.relations, -100, 100);
      r.trust = clamp(r.trust - 1);
      r.tension = clamp(r.tension + 8 * s.params.relations);
      markGrief(s, r, event);
      feel(s, p, { distress: 5 }, event);
    }
    if (music)
      r.collaboration = clamp(
        r.collaboration + (outcome === "unfavorable" ? -1 : 2),
      );
  }
  if (type === "support" && outcome === "favorable") {
    feel(
      s,
      b,
      { distress: -12 * Math.max(0.1, 1 + traitEffect(a, "supportPower")) },
      event,
    );
    changeDecadence(s, b, -2, "Soutien de " + a.name);
  }
  if (type === "support" && outcome === "unfavorable")
    feel(s, b, { distress: 2 }, event);
  if (type === "advance" && outcome === "favorable") {
    ra.love = clamp(ra.love + 6);
    if (rb.love >= V7_RULES.advanceThreshold) rb.love = clamp(rb.love + 4);
  }
  if (type === "advance" && outcome === "unfavorable")
    ra.love = clamp(ra.love - 2);
  if (type === "discuss" && outcome === "favorable" && s.params.romance > 0) {
    for (const [p, r] of [
      [a, ra],
      [b, rb],
    ])
      if (
        p.age >= 18 &&
        a.age >= 18 &&
        b.age >= 18 &&
        r.love === 0 &&
        rand(s) <
          V7_RULES.romanticStart *
            s.params.romance *
            Math.max(0, 1 + traitEffect(p, "romanticStart"))
      )
        r.love = V7_RULES.advanceThreshold;
  }
  for (const p of [a, b])
    memory(
      s,
      p,
      `${outcome === "unfavorable" ? "Accrochage" : outcome === "favorable" ? "Bon moment" : "Échange"} avec ${p === a ? b.name : a.name}`,
      outcome === "unfavorable" ? -3 : outcome === "favorable" ? 2 : 0,
    );
  event.changes = {
    before,
    after: structuredClone({
      a: { emotions: a.emotions, needs: a.needs, relation: ra },
      b: { emotions: b.emotions, needs: b.needs, relation: rb },
    }),
  };
  if (
    outcome === "favorable" &&
    formationEligible(s, a, b) &&
    !s.groups.some(
      (g) =>
        g.archivedAt === null &&
        g.members.includes(a.id) &&
        g.members.includes(b.id),
    ) &&
    s.time - Math.max(a.lastFormation, b.lastFormation) >= 720
  ) {
    const existing = groupsOf(s, b).find(
      (g) =>
        g.archivedAt === null &&
        !g.members.includes(a.id) &&
        g.members.filter((id) =>
          formationEligible(
            s,
            a,
            s.people.find((p) => p.id === id),
          ),
        ).length >= Math.ceil(g.members.length / 2),
    );
    if (existing) {
      existing.members.push(a.id);
      a.lastFormation = b.lastFormation = s.time;
      const ev = log(
        s,
        "group",
        `${a.name} rejoint « ${existing.name} » après un échange favorable.`,
        [a.id, b.id],
        { groupId: existing.id },
      );
      feel(s, a, { exaltation: 12 }, ev);
    } else createGroup(s, [a.id, b.id]);
  }

  return { accepted, event, outcome };
}
export function support(s, a, b) {
  const before = b.emotions.distress;
  const result = interaction(s, a, b, "support");
  return result ? before - b.emotions.distress : 0;
}
export function advance(s, a, b) {
  return interaction(s, a, b, "advance");
}
export function interact(s, a, b, music = false) {
  const weights = {
    discuss: 10,
    support:
      b.emotions.distress >= 15
        ? Math.max(0, a.personality.kind / 20 + traitEffect(a, "support"))
        : 0,
    advance:
      relationship(s, a, b).love >= V7_RULES.advanceThreshold &&
      s.time - relationship(s, a, b).lastAdvance >= 720 &&
      a.age >= 18 &&
      b.age >= 18
        ? Math.max(0.1, 1 + traitEffect(a, "flirt") + traitEffect(b, "flirt")) *
          s.params.romance
        : 0,
  };
  const type = weightedChoice(
    Object.keys(weights).filter((k) => weights[k] > 0),
    (k) => weights[k],
    () => rand(s),
  );
  const result = interaction(s, a, b, type, music);
  return result?.outcome === "unfavorable"
    ? "conflict"
    : result?.outcome === "favorable"
      ? "positive"
      : result?.outcome || "unavailable";
}

export const MUSIC_OUTCOMES = {
  sync: "Se synchroniser",
  learn: "Apprendre un passage",
  idea: "Trouver une idée",
  debate: "Débattre d’une direction",
  clash: "Se marcher dessus",
  consolidate: "Consolider ses acquis",
};
export function musicalOutcome(s, a, b, j) {
  const chem = chemistry(a, b),
    skillA = a.skills[a.instrument],
    skillB = b.skills[b.instrument],
    empathy = (a.personality.kind + b.personality.kind) / 2,
    discipline = (a.personality.discipline + b.personality.discipline) / 2,
    gap = Math.abs(skillA - skillB),
    trust = Math.min(relationship(s, a, b).trust, relationship(s, b, a).trust),
    familiarity = Math.min(
      relationship(s, a, b).collaboration,
      relationship(s, b, a).collaboration,
    );
  const weights = {
    sync: 10 + chem * 0.2 + familiarity * 0.1,
    learn: 4 + (gap * empathy) / 180,
    idea:
      4 +
      (a.personality.creative + b.personality.creative) / 7 +
      Math.max(a.emotions.exaltation, b.emotions.exaltation) / 10,
    debate: (a.genre !== b.genre ? 18 : 3) + trust / 8,
    clash: conflictRisk(s, a, b) * 120,
    consolidate: 10 + discipline * 0.3,
  };
  let roll = rand(s) * Object.values(weights).reduce((x, y) => x + y, 0);
  const outcome =
    Object.keys(weights).find((k) => {
      roll -= weights[k];
      return roll < 0;
    }) || "consolidate";
  const count = j.outcomes[outcome] || 0,
    factor = Math.pow(0.6, count);
  j.outcomes[outcome] = count + 1;
  const novice = skillA <= skillB ? a : b,
    mentor = novice === a ? b : a;
  const text = {
    sync: `${a.name} et ${b.name} calent leurs rythmes et se synchronisent.`,
    learn: `${mentor.name} aide ${novice.name} à maîtriser un passage.`,
    idea: `${a.name} et ${b.name} trouvent une idée à reprendre en composition.`,
    debate: `${a.name} et ${b.name} explorent deux directions musicales différentes.`,
    clash: `${a.name} et ${b.name} se marchent dessus : tension et état émotionnel perturbent l’écoute.`,
    consolidate: `${a.name} et ${b.name} consolident leurs acquis dans une séance régulière.`,
  }[outcome];
  const explanations = {
    sync: `Compatibilité ${round(chem)}, complicité vécue ${round(familiarity)}.`,
    learn: `Écart de maîtrise ${round(gap)}, empathie ${round(empathy)}.`,
    idea: `Créativité ${round((a.personality.creative + b.personality.creative) / 2)} et exaltation du moment.`,
    debate: `${a.genre === b.genre ? "Styles proches" : "Styles différents"}, confiance mutuelle ${round(trust)}.`,
    clash: `Risque d’accrochage ${round(conflictRisk(s, a, b) * 100)} % : affinité, tension, exaltation, détresse et traits.`,
    consolidate: `Discipline moyenne ${round(discipline)} ; progrès réguliers.`,
  };
  const effects = {
    sync: "Complicité et confiance renforcées.",
    learn: `Maîtrise instrumentale de ${novice.name} améliorée ; confiance renforcée.`,
    idea: "Une inspiration conservée pour le prochain projet de chacun.",
    debate:
      "Expression créative et confiance ; légère tension sans hostilité automatique.",
    clash: "Complicité et confiance diminuent ; frustration et tension.",
    consolidate: "Petit progrès instrumental, complicité renforcée.",
  };
  const event = log(
    s,
    outcome === "clash" ? "conflict" : "music",
    text,
    [a.id, b.id],
    {
      activityId: j.id,
      outcome,
      explanation: explanations[outcome],
      effects: effects[outcome],
      repeatFactor: factor,
    },
  );
  for (const [p, q] of [
    [a, b],
    [b, a],
  ]) {
    const r = relationship(s, p, q),
      scale = s.params.relations * factor;
    const delta = {
      sync: [4, 3, -2, 5],
      learn: [3.5, 2, -1, 3],
      idea: [3.5, 2, -1, 3],
      debate: [2, 1, 1, 2],
      clash: [-3, -3, 6, -1],
      consolidate: [2.5, 1.5, -0.5, 3.5],
    }[outcome];
    r.affinity = clamp(
      r.affinity + delta[0] * scale * 0.1 * (0.7 + p.personality.kind / 150),
      -100,
      100,
    );
    r.trust = clamp(r.trust + delta[1] * scale);
    r.tension = clamp(
      r.tension +
        (delta[2] < 0 && r.grief?.strength > 0 ? delta[2] * 0.1 : delta[2]) *
          scale,
    );
    if (outcome === "clash") markGrief(s, r, event);
    r.collaboration = clamp(r.collaboration + delta[3] * scale);
    r.meetings++;
    r.last = s.time;
    if (outcome === "consolidate")
      p.skills[p.instrument] = clamp(
        p.skills[p.instrument] +
          learningGain(p, p.instrument, 0.6 * factor * s.params.learning),
      );
    if (outcome === "debate")
      p.needs.expression = clamp(p.needs.expression + 4 * factor);
    if (outcome === "clash") feel(s, p, { distress: 7 * factor }, event);
    else
      feel(s, p, { exaltation: (outcome === "idea" ? 9 : 4) * factor }, event);
    if (count === 0)
      memory(
        s,
        p,
        MUSIC_OUTCOMES[outcome] + ` avec ${q.name}`,
        outcome === "clash" ? -2 : 1.5,
      );
  }
  if (outcome === "learn")
    novice.skills[novice.instrument] = clamp(
      novice.skills[novice.instrument] +
        learningGain(
          novice,
          novice.instrument,
          (1 + gap / 40) * factor * s.params.learning,
        ),
    );
  return event;
}

function sampleDraft(s, p) {
  const d = p.draft;
  if (d.samples >= 75) return;
  d.samples++;
  for (const k of Object.keys(EMOTIONS)) d.emotions[k] += p.emotions[k];
  d.authors = [...new Set([...d.authors, p.id, ...p.action.partners])];
  const e = dominantEmotion(p);
  if (e.active)
    for (const source of p.emotionSources[e.key] || []) {
      if (!d.sources.some((x) => x.id === source.id))
        d.sources.push({ ...source, emotion: e.key });
    }
  d.sources = d.sources.slice(-8);
  if (p.action.partners.length) {
    d.jamQuality += p.action.quality / Math.max(1, p.action.elapsed / 15);
    d.jamSamples++;
  }
}
export function songOutcome(s, p) {
  const d = p.draft,
    samples = Math.max(1, d.samples),
    average = Object.fromEntries(
      Object.entries(d.emotions).map(([k, v]) => [k, v / samples]),
    );
  const project = compositionProject(s, p);
  const [sampleEmotion, sampleIntensity] = Object.entries(average).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const emotion = project?.emotion || sampleEmotion,
    intensity = project?.intensity ?? sampleIntensity;
  const craft = p.skills.writing * 0.45 + p.skills[p.instrument] * 0.25;
  const expression = (intensity / 100) * (6 + p.personality.creative * 0.12);
  const overwhelm =
    (Math.max(0, intensity - 72) * (100 - p.personality.stable)) / 190;
  const ensemble = d.jamSamples ? clamp(d.jamQuality / d.jamSamples, 0, 12) : 0;
  const perfection = traitEffect(p, "quality");
  const variance = range(s, 3, 13);
  const quality = clamp(
    craft + expression + ensemble + perfection + variance - overwhelm,
  );
  const fit = 0;
  const resonance = clamp(
    quality * 0.65 + intensity * 0.2 + fit + range(s, 0, 18),
  );
  return {
    emotion,
    intensity: round(intensity),
    tone: intensity < 10 ? "posée" : emotionDefinition(emotion).tone,
    quality: round(quality),
    resonance: round(resonance),
    breakdown: {
      craft: round(craft),
      expression: round(expression),
      ensemble: round(ensemble),
      perfection,
      overwhelm: round(overwhelm),
      variance: round(variance),
    },
  };
}
function releaseSong(s, p) {
  const project = ensureProject(s, p),
    result = songOutcome(s, p);
  const song = {
    id: s.nextSongId++,
    projectId: project.id,
    title: project.title,
    time: s.time,
    ...result,
    genre: project.genre,
    authors: [p.id],
    sources: [...p.draft.sources],
    hit: result.resonance >= 80,
  };
  s.songs.unshift(song);
  archiveSong(s, song);
  project.status = "finished";
  project.songId = song.id;
  project.updated = s.time;
  project.quality = song.quality;
  const ev = log(
    s,
    "song",
    `« ${song.title} » : une chanson ${result.tone} de ${p.name}. Qualité ${result.quality}/100.`,
    song.authors,
    { causes: song.sources.slice(-3) },
  );
  feel(s, p, { exaltation: song.hit ? 21 : 11 }, ev);
  memory(s, p, "Une chanson terminée", 5);
  p.draft = defaultDraft();
  p.songProgress = 0;
  refreshReputation(s, p);
  return song;
}

function finish(s, p) {
  const a = p.action;
  if (
    a.key === "social" &&
    (a.unansweredMinutes || 0) >= 30 &&
    p.needs.social < 50
  ) {
    const e = log(
      s,
      "social",
      `${p.name} repart déçu : personne n’était disponible pour échanger.`,
      [p.id],
      {
        explanation:
          "Attendre seul restaure un peu de détente, mais pas le lien social.",
      },
    );
    feel(s, p, { distress: 6 + (50 - p.needs.social) / 8 }, e);
  }
  p.actionCounts[a.key].completed++;
  if (a.key === "write") {
    const project = ensureProject(s, p);
    project.sessions++;
    log(
      s,
      "project",
      `${p.name} avance « ${project.title} » : ${round(p.songProgress)} %, ${project.sessions} séance${project.sessions > 1 ? "s" : ""}.`,
      [p.id],
      { projectId: project.id },
    );
    if (project.work >= project.target) releaseSong(s, p);
  }
  a.remaining = 0;
  closeActivity(s, p);
  decide(s, p);
}
function assignJam(s, p, sessionId, options = {}) {
  let session = options.newSession
    ? null
    : sessionId
      ? s.jams.find((j) => j.id === sessionId)
      : weightedChoice(
          s.jams.filter(
            (j) =>
              j.status !== "finished" &&
              j.elapsed < 60 &&
              s.time - j.created < 180,
          ),
          (j) => {
            const peers = j.participants
              .map((id) => s.people.find((p) => p.id === id))
              .filter((q) => q && q !== p);
            return peers.length
              ? peers.reduce(
                  (n, q) => n + partnerWeight(s, p, q, relationship(s, p, q)),
                  0,
                ) / peers.length
              : 1;
          },
          () => rand(s),
        );
  if (!session) {
    const dest = PLACES.find((x) => x.id === p.action.dest);
    session = {
      id: `j${s.nextJamId++}`,
      place: dest.kind === "garage" ? dest.id : "g1",
      host: p.id,
      participants: [],
      created: s.time,
      elapsed: 0,
      status: "waiting",
      playedPairs: [],
      outcomes: {},
      groupId: options.groupId || null,
      songId: options.songId || null,
    };
    s.jams.push(session);
    beginActivity(s, p, { ...p.action, sessionId: session.id });
    log(
      s,
      "jam",
      `${p.name} propose une jam au ${PLACES.find((x) => x.id === session.place).name}.`,
      [p.id],
      { activityId: session.id },
    );
  }
  if (!session.participants.includes(p.id)) session.participants.push(p.id);
  return session;
}

export function liveSessions(s) {
  const result = [];
  for (const j of s.jams.filter((j) => j.status === "active")) {
    const ids = j.participants.filter((id) => {
      const p = s.people.find((x) => x.id === id);
      return p?.action?.sessionId === j.id && !p.action.route.length;
    });
    if (ids.length >= 2) {
      const shared = s.groups.find((g) =>
        ids.every((id) => g.members.includes(id)),
      );
      result.push({
        id: j.id,
        type: "jam",
        label: shared ? `Jam · ${shared.name}` : "Jam ensemble",
        place: j.place,
        participants: ids,
      });
    }
  }
  for (const session of s.socialSessions || [])
    if (!session.ended && session.members.length >= 2)
      result.push({
        id: session.id,
        type: "social",
        label: "Échanges ensemble",
        place: session.place,
        participants: session.members,
        nextExchange: session.nextExchange,
      });
  return result;
}
function updateJams(s) {
  for (const j of [...s.jams]) {
    if (j.status === "finished") continue;
    const participants = s.people.filter(
        (p) => p.action?.key === "jam" && p.action.sessionId === j.id,
      ),
      present = participants.filter((p) => !p.action.route.length);
    j.participants = participants.map((x) => x.id);
    const row = s.activities.find((x) => x.id === j.id);
    if (!participants.length) {
      j.status = "finished";
      if (row) {
        row.status = "cancelled";
        row.end = s.time;
      }
      continue;
    }
    if (present.length < 2) {
      j.status = "waiting";
      if (row) row.status = "waiting";
      for (const p of present) {
        p.action.waited++;
        if (p.action.waited >= V7_RULES.jamSearchMinutes) {
          log(
            s,
            "jam",
            `${p.name} n’a plus de partenaire : la jam est annulée, le jeton est reporté sans remplacer la jam par une pratique.`,
            [p.id],
          );
          returnToken(p);
          p.action.remaining = 0;
          closeActivity(s, p, "cancelled");
          p.action = null;
          p.waitUntil = s.time + 15;
        }
      }
      continue;
    }
    if (j.status !== "active")
      log(
        s,
        "jam",
        `${present.map((x) => x.name).join(" et ")} commencent à jammer ensemble.`,
        present.map((x) => x.id),
      );
    j.status = "active";
    j.elapsed++;
    if (row) {
      row.status = "active";
      row.activeMinutes = j.elapsed;
    }
    for (let i = 0; i < present.length; i++)
      for (let k = i + 1; k < present.length; k++) {
        const key = [present[i].id, present[k].id].sort().join("/");
        if (!j.playedPairs.includes(key)) j.playedPairs.push(key);
      }
    for (const p of present) {
      const a = p.action;
      if (!a.tokenStarted) {
        consumeToken(p);
        a.tokenStarted = true;
      }
      a.elapsed++;
      a.remaining = Math.max(0, 85 - j.elapsed);
      a.partners = present.filter((q) => q !== p).map((q) => q.id);
      for (const [need, change] of Object.entries(ACTIVITY_EFFECTS.jam))
        p.needs[need] = clamp(p.needs[need] + change);
      p.skills[p.instrument] = clamp(
        p.skills[p.instrument] +
          learningGain(p, p.instrument, 0.013 * s.params.learning),
      );
    }
    groupRehearsal(s, j, present);
    if (j.elapsed % 15 === 0) {
      const a = weightedChoice(
          present,
          (p) => Math.max(0.05, 1 + traitEffect(p, "initiative")),
          () => rand(s),
        ),
        b = weightedChoice(
          present.filter((p) => p !== a),
          (q) => partnerWeight(s, a, q, relationship(s, a, q)),
          () => rand(s),
        );
      const result = interact(s, a, b, true);
      if (result === "positive" || result === "neutral")
        musicalOutcome(s, a, b, j);
    }
    if (j.elapsed >= 85) {
      j.status = "finished";
      if (row) {
        row.status = "completed";
        row.end = s.time;
      }
      for (const key of j.playedPairs) {
        const [aid, bid] = key.split("/"),
          a = s.people.find((x) => x.id === aid),
          b = s.people.find((x) => x.id === bid);
        if (a && b) {
          relationship(s, a, b).musicSessions++;
          relationship(s, b, a).musicSessions++;
        }
      }
      log(
        s,
        "jam",
        `La jam se termine : ${present.map((x) => x.name).join(", ")}.`,
        present.map((x) => x.id),
      );
      for (const p of participants) {
        p.action.remaining = 0;
        if (p.action.elapsed > 0) p.actionCounts.jam.completed++;
        refreshReputation(s, p);
        returnToken(p);
        decide(s, p);
      }
    }
  }
  s.jams = s.jams.filter(
    (j) => j.status !== "finished" || s.time - j.created < 300,
  );
}
function sleepMinute(s, p) {
  const sleep = p.sleep;
  if (p.action?.key === "sleep") {
    if (p.action.route.length) return false;
    p.action.elapsed++;
    p.action.remaining--;
    sleep.minutes++;
    p.needs.energy = clamp(p.needs.energy + 100 / sleep.required);
    if (p.action.remaining <= 0) {
      p.needs.energy = Math.min(
        p.needs.energy,
        clamp((100 * sleep.minutes) / sleep.required),
      );
      p.actionCounts.sleep.completed++;
      closeActivity(s, p);
      p.action = null;
      sleep.wakeAt = null;
      sleep.started = null;
      log(
        s,
        "system",
        `${p.name} se réveille après ${sleep.minutes} minutes; énergie ${round(p.needs.energy)}.`,
        [p.id],
      );
    }
    return true;
  }
  if (s.time >= sleep.nextBedtime && !p.engagement) {
    decide(s, p, "sleep");
    sleep.started = s.time;
    sleep.minutes = 0;
    sleep.wakeAt = s.time + p.sleep.habitual + p.action.route.length * 15;
    const candidate = Math.floor(s.time / 1440) * 1440 + sleep.bedtime;
    sleep.nextBedtime = candidate > s.time ? candidate : candidate + 1440;
    return true;
  }
  return false;
}
function socialSessionsMinute(s) {
  s.socialSessions ||= [];
  const active = [];
  for (const place of PLACES) {
    const initiators = s.people.filter(
      (p) =>
        p.action?.key === "social" &&
        !p.action.route.length &&
        !p.engagement &&
        p.place === place.id,
    );
    const peers = s.people.filter(
      (p) =>
        p.action &&
        ["social", "relax"].includes(p.action.key) &&
        !p.action.route.length &&
        !p.engagement &&
        p.place === place.id,
    );
    if (!initiators.length || peers.length < 2) continue;
    let session = s.socialSessions.find(
      (x) => x.place === place.id && !x.ended,
    );
    if (!session) {
      session = {
        id: "social-" + s.nextActivityId++,
        place: place.id,
        members: [],
        created: s.time,
        nextExchange: s.time,
        ended: null,
      };
      s.socialSessions.push(session);
    }
    session.members = peers.map((p) => p.id);
    active.push(session.id);
    if (s.time < session.nextExchange) continue;
    session.nextExchange = s.time + V7_RULES.exchangeMinutes;
    const initiator = weightedChoice(
      initiators,
      (p) => Math.max(0.05, 1 + traitEffect(p, "initiative")),
      () => rand(s),
    );
    const recipient =
      peers.find((p) => p.id === initiator.action.target && p !== initiator) ||
      weightedChoice(
        peers.filter((p) => p !== initiator),
        (q) => partnerWeight(s, initiator, q, relationship(s, initiator, q)),
        () => rand(s),
      );
    for (const p of [initiator, recipient])
      if (p.action.key === "social") {
        if (!p.action.tokenStarted) {
          consumeToken(p);
          p.action.tokenStarted = true;
        }
        p.action.hadContact = true;
      }
    initiator.action.target = null;
    const outcome = interact(s, initiator, recipient);
    initiator.encounterVisual = recipient.encounterVisual = {
      until: s.time + 15,
      outcome,
      partner: outcome === "conflict" ? "#!$?" : "♡",
    };
  }
  for (const session of s.socialSessions)
    if (!session.ended && !active.includes(session.id)) session.ended = s.time;
  s.socialSessions = s.socialSessions.filter(
    (x) => !x.ended || s.time - x.ended < 1440,
  );
}
export function step(s, minutes = 1) {
  for (let tick = 0; tick < minutes; tick++) {
    if (s.performance?.status === "playing" || s.showEventId) break;
    s.time++;
    for (const p of s.people) {
      p.memories = p.memories.filter((m) => m.until > s.time);
      for (const [k, d] of Object.entries(NEED_DRAIN))
        p.needs[k] = clamp(
          p.needs[k] -
            d *
              s.params.drain *
              (k === "energy" && p.action?.key === "sleep"
                ? 0
                : k === "social"
                  ? effectiveTraits(p).includes("loner")
                    ? 0.5
                    : 1 + p.personality.outgoing / 200
                  : 1),
        );
      emotionalMinute(p, s.params);
      if (travelEngagement(s, p)) continue;
      if (sleepMinute(s, p) && !p.action?.route.length) continue;
      if (!p.action) {
        if (s.time < p.waitUntil) continue;
        decide(s, p);
      }
      const action = p.action;
      if (action.route.length) {
        const t = action.route[0],
          distance = Math.hypot(t.x - p.x, t.y - p.y),
          speed = 12;
        if (distance <= speed) {
          p.x = t.x;
          p.y = t.y;
          action.route.shift();
          if (!action.route.length) p.place = action.dest;
        } else {
          p.x += ((t.x - p.x) / distance) * speed;
          p.y += ((t.y - p.y) / distance) * speed;
        }
        continue;
      }
      if (action.key === "jam" || action.key === "sleep") continue;
      if (!action.tokenStarted && action.key !== "social") {
        consumeToken(p);
        action.tokenStarted = true;
      }
      const row = s.activities.find((x) => x.id === action.activityId);
      if (row) {
        row.status = "active";
        row.activeMinutes = action.elapsed + 1;
      }
      action.elapsed++;
      action.remaining--;
      const effects = ACTIVITY_EFFECTS[action.key];
      for (const [k, d] of Object.entries(effects))
        p.needs[k] = clamp(
          p.needs[k] +
            d *
              (k === "expression" &&
              effectiveTraits(p).includes("perfectionist")
                ? 0.8
                : 1),
        );
      if (action.key === "relax") feel(s, p, { distress: -0.07 });
      if (musical.includes(action.key)) {
        p.skills[p.instrument] = clamp(
          p.skills[p.instrument] +
            learningGain(
              p,
              p.instrument,
              0.009 *
                s.params.learning *
                (effectiveTraits(p).includes("virtuoso") ? 1.4 : 1),
            ),
        );
        if (action.key === "write") {
          p.skills.writing = clamp(
            p.skills.writing +
              learningGain(p, "writing", 0.018 * s.params.learning),
          );
          sampleDraft(s, p);
          advanceProject(s, p);
        }
      }
      if (
        action.key === "social" &&
        !action.tokenStarted &&
        action.elapsed >= V7_RULES.searchMinutes
      ) {
        returnToken(p);
        closeActivity(s, p, "cancelled");
        p.action = null;
        p.waitUntil = s.time + 15;
        log(
          s,
          "social",
          `${p.name} reporte son jeton social : personne disponible. Aucun refus.`,
          [p.id],
        );
        continue;
      }
      if (action.remaining <= 0) finish(s, p);
    }
    updateJams(s);
    socialSessionsMinute(s);
    lifeMinute(s);
    for (const r of Object.values(s.rels)) coolRelationV7(r);
    if (s.time % 30 === 0)
      for (const p of s.people) {
        p.history.push({ time: s.time, ...p.emotions });
        p.history = p.history.slice(-96);
      }
    if (s.time % 60 === 0) {
      for (const p of s.people) refreshReputation(s, p);
      for (const [key, r] of Object.entries(s.rels)) {
        if (s.time - r.last > 1440) {
          r.affinity *= 0.999;
          r.love *= 0.999;
        }
        const [aid, bid] = key.split(">");
        if (aid >= bid) continue;
        const back = s.rels[bid + ">" + aid];
        if (!back) continue;
        if (
          !r.couple &&
          !back.couple &&
          r.love >= V7_RULES.coupleThreshold &&
          back.love >= V7_RULES.coupleThreshold &&
          rand(s) < V7_RULES.coupleChance
        ) {
          r.couple = back.couple = true;
          log(s, "romance", "Un couple se forme.", [aid, bid]);
        } else if (
          (r.couple || back.couple) &&
          Math.min(r.love, back.love) < V7_RULES.breakupThreshold &&
          rand(s) < V7_RULES.breakupChance
        ) {
          r.couple = back.couple = false;
          log(s, "romance", "Un couple se sépare.", [aid, bid]);
        }
      }
      s.history.push({
        time: s.time,
        exaltation: round(
          s.people.reduce((n, p) => n + p.emotions.exaltation, 0) /
            s.people.length,
        ),
        distress: round(
          s.people.reduce((n, p) => n + p.emotions.distress, 0) /
            s.people.length,
        ),
      });
      s.history = s.history.slice(-168);
    }
  }
  return s;
}
export function advanceSleeping(s) {
  let minutes = 0;
  while (
    s.people.every((p) => p.action?.key === "sleep") &&
    minutes < 1440 &&
    !s.showEventId &&
    s.performance?.status !== "playing"
  ) {
    step(s);
    minutes++;
  }
  return minutes;
}
export function removePerson(s, id) {
  if (s.people.length <= 1) return;
  const departing = s.people.find((p) => p.id === id);
  if (departing) {
    closeActivity(s, departing, "interrupted");
    const row = s.activities.find((x) => x.id === departing.action?.activityId);
    if (row && departing.action?.key === "jam")
      log(s, "jam", `${departing.name} quitte la session.`, [id], {
        activityId: row.id,
      });
  }
  s.people = s.people.filter((p) => p.id !== id);
  if (s.playerId === id) s.playerId = s.people[0].id;
  for (const k of Object.keys(s.rels))
    if (k.split(">").includes(id)) delete s.rels[k];
  for (const p of s.people)
    if (p.action) p.action.partners = p.action.partners.filter((x) => x !== id);
  for (const g of s.groups) {
    if (g.members.includes(id)) {
      g.alumni ||= [];
      g.alumni.push({
        id,
        name: departing?.name || "Ancien voisin",
        left: s.time,
      });
    }
    g.members = g.members.filter((x) => x !== id);
    g.founders = g.founders.filter((x) => x !== id);
    if (!g.members.length) {
      g.archivedAt = s.time;
      g.development = 0;
    }
  }
  for (const b of s.bookings) {
    if (
      ["applied", "booked", "assembling"].includes(b.status) &&
      b.members.filter((id) => s.people.some((p) => p.id === id)).length < 2
    ) {
      b.status = "cancelled";
      refreshOpportunity(s, b.opportunityId);
      for (const p of s.people)
        if (p.engagement?.bookingId === b.id) {
          p.engagement = null;
          decide(s, p);
        }
    }
  }
  for (const session of s.socialSessions)
    session.members = session.members.filter((member) => member !== id);
  for (const j of s.jams)
    j.participants = j.participants.filter((x) => x !== id);
  log(s, "system", "Un personnage quitte le quartier.", [id]);
}
export function scenario(s, name) {
  s.scenario = name;
  s.params = { ...DEFAULTS };
  if (name === "Tensions") {
    s.params.conflict = 2.4;
    s.params.relations = 1.4;
    const ev = log(s, "system", "Expérience : le quartier est à cran.");
    for (const p of s.people) {
      p.needs.social = 30;
      p.personality.kind = 25;
      p.traits = [...new Set([...p.traits, "hot"])];
      feel(s, p, { distress: 40 }, ev);
      decide(s, p, "social");
    }
  } else if (name === "Soirée jam") {
    const day = Math.floor(s.time / 1440);
    s.time = day * 1440 + 1080 + (s.time % 1440 > 1080 ? 1440 : 0);
    for (const p of s.people) {
      p.needs.energy = 85;
      p.needs.expression = 25;
      p.needs.social = 35;
      decide(s, p, "jam");
    }
  } else if (name === "Cœur brisé") {
    if (s.people.length < 3) while (s.people.length < 3) addPerson(s);
    const [a, b, c] = s.people;
    for (const p of [a, b, c]) {
      p.emotions = emptyEmotions();
      p.emotionSources = {};
      p.memories = [];
      p.needs.energy = 90;
    }
    a.songProgress = 0;
    a.draft = defaultDraft();
    a.personality.creative = 90;
    a.personality.stable = 25;
    const r = relationship(s, a, b),
      rb = relationship(s, b, a);
    r.affinity = 40;
    r.love = 10;
    r.lastAdvance = -1440;
    rb.affinity = -100;
    rb.tension = 100;
    c.personality.kind = 95;
    const result = advance(s, a, b);
    feel(s, a, { distress: 46 }, result?.event);
    decide(s, a, "write");
    log(
      s,
      "system",
      `Expérience préparée : ${a.name} compose après un rejet. ${c.name} peut l’apaiser lors d’un échange disponible.`,
      [a.id, b.id, c.id],
    );
  } else if (name === "Équilibre") {
    for (const p of s.people) decide(s, p);
  }
  log(s, "system", `Scénario : ${name}.`);
}
// Migration adds new systems without resetting the existing cast, relationships or clock.
function migrate(raw) {
  if (["0.5.0", "0.5.1", "0.6.0"].includes(raw.version)) {
    return raw;
  }
  if (raw.version === "0.4.0") {
    raw.version = VERSION;
    upgradeLife(raw);
    return raw;
  }
  const upgrade = raw.version !== VERSION;
  const old = raw.version === "0.1.0",
    previous = ["0.1.0", "0.2.0"].includes(raw.version);
  if (!previous && !["0.3.0", VERSION].includes(raw.version)) return raw;
  if (old) {
    raw.version = VERSION;
    raw.params = { ...DEFAULTS, ...raw.params };
    raw.decisionMode = "utility";
    raw.nextSongId = Math.max(0, ...raw.songs.map((x) => x.id)) + 1;
    raw.band = {
      name: "Les Voisins du garage",
      leader: raw.people[0].id,
      members: raw.people.slice(0, 3).map((x) => x.id),
      genre: "Indie",
      focus: "balanced",
      rehearsal: null,
    };
    for (const p of raw.people) {
      for (const k of ["sax", "trumpet", "percussion"]) p.skills[k] = 10;
      p.emotions = { ...emptyEmotions(), exaltation: 12 };
      p.emotionSources = {};
      p.priorities = priorities();
      p.draft = defaultDraft();
      p.lastRecruit = -1440;
      if (p.action) {
        p.action.started = raw.time - p.action.elapsed;
        p.action.mode = "utility";
        p.action.decision = [];
      }
    }
    for (const [key, r] of Object.entries(raw.rels)) {
      const [a, b] = key
        .split(">")
        .map((id) => raw.people.find((p) => p.id === id));
      if (a && b) {
        r.couple = false;
        r.love = 0;
        r.lastAdvance = -1440;
      }
    }
    for (const song of raw.songs) {
      song.sources = [];
      song.emotion = "joy";
      song.tone = "non mesurée (V0.1)";
      song.intensity = 0;
      song.resonance = null;
      song.breakdown = null;
      song.hit = false;
      song.band = null;
    }
  }
  if (previous) {
    raw.version = VERSION;
    raw.groups = raw.band
      ? [
          {
            id: "g1",
            name: raw.band.name,
            members: [...raw.band.members],
            founders: [raw.band.leader],
            created: raw.time,
            genre: raw.band.genre,
            origin: "migration",
          },
        ]
      : [];
    raw.nextGroupId = raw.groups.length + 1;
    raw.nextJamId = 1;
    raw.jams = [];
    delete raw.band;
    for (const p of raw.people) {
      delete p.needs.food;
      delete p.money;
      delete p.lastRecruit;
      p.lastFormation = -1440;
      p.actionCounts = Object.fromEntries(
        Object.keys(ACTIONS).map((k) => [
          k,
          { started: 0, completed: 0, interrupted: 0 },
        ]),
      );
      p.countsSince = raw.time;
      p.priorities = Object.fromEntries(
        Object.keys(ACTIONS).map((k) => [k, p.priorities?.[k] ?? 2]),
      );
      p.action = null;
      p.candidates = [];
      p.reputation = {
        score: 0,
        skill: 0,
        catalogue: 0,
        recognition: 0,
        collaboration: 0,
      };
    }
    log(
      raw,
      "system",
      "Migration V0.3 : alimentation et travail retirés. Compteurs d’actions démarrés maintenant ; ancien band conservé comme groupe.",
    );
    for (const p of raw.people) refreshReputation(raw, p);
  }
  if (upgrade) {
    raw.version = VERSION;
    raw.params = { ...DEFAULTS, ...raw.params };
    raw.activities = [];
    raw.projects = [];
    raw.nextActivityId = 1;
    raw.nextProjectId = 1;
    for (const r of Object.values(raw.rels)) r.musicSessions = 0;
    for (const j of raw.jams) {
      j.playedPairs = [];
      j.outcomes = {};
    }
    for (const p of raw.people) {
      p.draft.projectId = null;
      if (p.action) {
        beginActivity(raw, p, p.action);
        if (p.action.key === "write") {
          const project = ensureProject(raw, p);
          project.work = Math.min(project.target - 1, p.action.elapsed);
          project.sessions = 0;
          p.songProgress = (project.work / project.target) * 100;
        }
      }
    }
    log(
      raw,
      "system",
      "V0.4 : projets de chansons et bilans de sessions. La découverte de chimie commence maintenant ; aucune expérience passée inventée.",
    );
  }
  if (upgrade) upgradeLife(raw);
  return raw;
}
function upgradeV7(s) {
  for (const p of s.people) {
    const old = p.emotions,
      oldSources = p.emotionSources,
      oldDraft = p.draft;
    const oldWeights = p.bag?.custom ? p.bag.weights : null;
    if (
      !old ||
      Object.values(old).some((v) => !Number.isFinite(v) || v < 0 || v > 100) ||
      !oldDraft ||
      !Number.isFinite(oldDraft.samples) ||
      oldDraft.samples < 0 ||
      !oldDraft.emotions ||
      Object.values(oldDraft.emotions).some((v) => !Number.isFinite(v) || v < 0)
    )
      throw Error("Émotions héritées invalides.");
    if (
      oldWeights &&
      Object.values(oldWeights).some(
        (v) => !Number.isFinite(v) || v < 0 || v > 100,
      )
    )
      throw Error("Sac hérité invalide.");
    initializeV7Person(p, s.time, () => rand(s));
    if (Object.keys(EMOTIONS).every((k) => Number.isFinite(old[k])))
      p.emotions = { exaltation: old.exaltation, distress: old.distress };
    else
      p.emotions = {
        exaltation: clamp((old.joy || 0) + (old.excitement || 0)),
        distress: clamp(
          (old.sadness || 0) + (old.anger || 0) + (old.fear || 0),
        ),
      };
    p.emotionSources = {
      exaltation: [
        ...(oldSources.joy || []),
        ...(oldSources.excitement || []),
      ].slice(0, 3),
      distress: [
        ...(oldSources.sadness || []),
        ...(oldSources.anger || []),
        ...(oldSources.fear || []),
      ].slice(0, 3),
    };
    delete p.needs.comfort;
    p.history = [];
    if (oldWeights) {
      const composition = Object.fromEntries(
        BAG_ACTIONS.map((k) => [
          k,
          Math.round(oldWeights[k === "relax" ? "sleep" : k] || 0),
        ]),
      );
      if (Object.values(composition).some((n) => n > 0)) {
        p.bag.composition = composition;
        p.bag.cycleComposition = { ...composition };
        p.bag.remaining = { ...composition };
      }
    }
    p.actionCounts.relax = p.actionCounts.sleep || {
      started: 0,
      completed: 0,
      interrupted: 0,
    };
    p.actionCounts.sleep = { started: 0, completed: 0, interrupted: 0 };
    delete p.actionCounts.form;
    for (const k of Object.keys(ACTIONS)) {
      p.actionCounts[k] ||= { started: 0, completed: 0, interrupted: 0 };
      p.priorities[k] ??= 2;
    }
    delete p.priorities.form;
    if (p.action?.key === "sleep") {
      p.action.key = "relax";
      p.action.recovery = "pause";
    }
    if (p.action?.key === "form") {
      const row = s.activities.find((x) => x.id === p.action.activityId);
      if (row) {
        row.status = "cancelled";
        row.end = s.time;
      }
      p.action = null;
    }
    if (p.action) {
      p.action.mode = "manual";
      p.action.why = "Activité héritée poursuivie hors sac, sans jeton V7";
      p.action.decision = [];
      p.action.tokenStarted = true;
    }
    p.draft = {
      ...oldDraft,
      emotions: { exaltation: 0, distress: 0 },
      samples: 0,
    };
    const project = s.projects.find((x) => x.id === p.draft.projectId);
    if (project && project.status !== "finished") {
      project.emotion = dominantEmotion(p).key;
      project.intensity = round(p.emotions[project.emotion]);
      project.tone = EMOTIONS[project.emotion].tone;
    }
    updateTraits(p);
  }
  for (const r of Object.values(s.rels)) {
    delete r.attraction;
    r.couple = false;
  }
  s.socialSessions = [];
  s.together = [];
  s.encounters = {};
  s.history = [];
  s.decisionMode = "bag";
  s.version = VERSION;
  log(
    s,
    "system",
    "Migration V7 : confort et humeur retirés; sac fini, quatre besoins et deux jauges. Chansons, projets, groupes et shows conservés. Affection non convertie en amour.",
  );
}
export function restore(input) {
  if (
    !input ||
    ![
      "0.1.0",
      "0.2.0",
      "0.3.0",
      "0.4.0",
      "0.5.0",
      "0.5.1",
      "0.6.0",
      VERSION,
    ].includes(input.version) ||
    !Array.isArray(input.people) ||
    !input.people.length ||
    input.people.length > 24 ||
    !Array.isArray(input.songs) ||
    !input.params ||
    !input.rels
  )
    throw Error("Sauvegarde incompatible ou incomplète.");
  const raw = JSON.parse(JSON.stringify(input));
  if (input.version !== VERSION) {
    migrate(raw);
    for (const p of raw.people)
      p.legacyActionCounts = {
        version: input.version,
        counts: structuredClone(p.actionCounts),
      };
    upgradeV6(raw);
    upgradeV7(raw);
  }
  const num = (v, min = 0, max = 100) =>
    Number.isFinite(v) && v >= min && v <= max;
  const source = (x) =>
    x &&
    Number.isInteger(x.id) &&
    Number.isFinite(x.time) &&
    typeof x.text === "string";
  if (
    !Array.isArray(raw.history) ||
    !Number.isInteger(raw.time) ||
    raw.time < 0 ||
    !Number.isInteger(raw.rng) ||
    !Number.isInteger(raw.nextId) ||
    !Number.isInteger(raw.eventId) ||
    !Number.isInteger(raw.nextSongId) ||
    !Array.isArray(raw.events) ||
    !["utility", "bag"].includes(raw.decisionMode)
  )
    throw Error("Monde invalide.");
  const ids = new Set();
  for (const p of raw.people) {
    if (
      !/^p\d+$/.test(p.id) ||
      ids.has(p.id) ||
      typeof p.name !== "string" ||
      p.name.length > 80 ||
      typeof p.color !== "string" ||
      !/^#[0-9a-f]{6}$/i.test(p.color) ||
      !num(p.age, 16, 100) ||
      !Object.hasOwn(SKILLS, p.instrument) ||
      p.instrument === "writing" ||
      !GENRES.includes(p.genre) ||
      !Array.isArray(p.traits) ||
      p.traits.some((t) => !Object.hasOwn(TRAITS, t)) ||
      !num(p.x, 0, 1100) ||
      !num(p.y, 0, 670) ||
      !Array.isArray(p.memories) ||
      !Array.isArray(p.history) ||
      !num(p.songProgress) ||
      !Number.isFinite(p.lastFormation) ||
      !Number.isFinite(p.countsSince)
    )
      throw Error("Personnage invalide.");
    if (
      p.memories.some(
        (m) =>
          typeof m.text !== "string" ||
          !Number.isFinite(m.effect) ||
          !Number.isFinite(m.until),
      ) ||
      p.history.some(
        (h) =>
          !Number.isFinite(h.time) || !num(h.exaltation) || !num(h.distress),
      )
    )
      throw Error("Historique invalide.");
    ids.add(p.id);
    for (const [key, shape] of [
      ["needs", NEEDS],
      ["personality", PERSONALITY],
      ["skills", SKILLS],
      ["emotions", EMOTIONS],
    ])
      for (const k of Object.keys(shape))
        if (!num(p[key]?.[k])) throw Error("Statistique invalide.");
    for (const key of Object.keys(ACTIONS))
      if (
        !Number.isInteger(p.priorities?.[key]) ||
        !num(p.priorities[key], 0, 3)
      )
        throw Error("Priorité invalide.");
    if (
      !p.emotionSources ||
      Object.values(p.emotionSources).some(
        (xs) => !Array.isArray(xs) || xs.some((x) => !source(x)),
      ) ||
      !p.draft ||
      !Array.isArray(p.draft.sources) ||
      p.draft.sources.some((x) => !source(x)) ||
      !Array.isArray(p.draft.authors) ||
      !num(p.draft.samples, 0, 1e9) ||
      !num(p.draft.jamSamples, 0, 1e9) ||
      !Number.isFinite(p.draft.jamQuality) ||
      Object.keys(EMOTIONS).some((k) => !num(p.draft.emotions[k], 0, 1e12))
    )
      throw Error("Composition ou émotion invalide.");
    if (
      !PLACES.some((x) => x.id === p.home) ||
      !PLACES.some((x) => x.id === p.place) ||
      (p.action &&
        (!Object.hasOwn(ACTIONS, p.action.key) ||
          !PLACES.some((x) => x.id === p.action.dest) ||
          !Array.isArray(p.action.route) ||
          p.action.route.some((x) => !num(x.x, 0, 1100) || !num(x.y, 0, 670)) ||
          !Number.isFinite(p.action.elapsed) ||
          !Number.isFinite(p.action.remaining) ||
          !Number.isFinite(p.action.quality) ||
          !Array.isArray(p.action.partners) ||
          !Array.isArray(p.action.decision)))
    )
      throw Error("Activité invalide.");
  }
  for (const k of Object.keys(DEFAULTS))
    if (!num(raw.params[k], 0, 3)) throw Error("Paramètre invalide.");
  for (const [key, r] of Object.entries(raw.rels)) {
    if (key.split(">").length !== 2 || key.split(">").some((x) => !ids.has(x)))
      throw Error("Relation invalide.");
    for (const k of [
      "affinity",
      "trust",
      "tension",
      "collaboration",
      "love",
      "meetings",
      "last",
      "lastAdvance",
    ])
      if (!Number.isFinite(r[k])) throw Error("Relation invalide.");
    for (const k of ["trust", "tension", "collaboration", "love"])
      if (!num(r[k])) throw Error("Relation hors limites.");
    if (!num(r.affinity, -100, 100)) throw Error("Affinité invalide.");
  }
  if (
    raw.events.some(
      (e) =>
        typeof e.text !== "string" ||
        !Array.isArray(e.ids) ||
        !Number.isFinite(e.time) ||
        (e.causes &&
          (!Array.isArray(e.causes) || e.causes.some((x) => !source(x)))),
    ) ||
    raw.songs.some(
      (s) =>
        !Number.isInteger(s.id) ||
        s.id < 1 ||
        typeof s.title !== "string" ||
        !Array.isArray(s.authors) ||
        !Number.isFinite(s.time) ||
        !num(s.quality) ||
        !Array.isArray(s.sources) ||
        s.sources.some((x) => !source(x)) ||
        !emotionDefinition(s.emotion),
    )
  )
    throw Error("Journal invalide.");
  if (
    !Array.isArray(raw.groups) ||
    !Array.isArray(raw.jams) ||
    !Number.isInteger(raw.nextGroupId) ||
    !Number.isInteger(raw.nextJamId)
  )
    throw Error("Groupes ou sessions invalides.");
  const groupIds = new Set();
  for (const g of raw.groups) {
    if (
      !/^g\d+$/.test(g.id) ||
      groupIds.has(g.id) ||
      typeof g.name !== "string" ||
      !Array.isArray(g.members) ||
      (!g.members.length && !Number.isFinite(g.archivedAt)) ||
      new Set(g.members).size !== g.members.length ||
      g.members.some((x) => !ids.has(x)) ||
      !Array.isArray(g.founders) ||
      !GENRES.includes(g.genre) ||
      !Number.isFinite(g.created)
    )
      throw Error("Groupe invalide.");
    groupIds.add(g.id);
  }
  for (const j of raw.jams)
    if (
      !/^j\d+$/.test(j.id) ||
      !PLACES.some((p) => p.id === j.place) ||
      !Array.isArray(j.participants) ||
      j.participants.some((id) => !ids.has(id)) ||
      !num(j.elapsed, 0, 85) ||
      !Number.isFinite(j.created) ||
      !["waiting", "active", "finished"].includes(j.status)
    )
      throw Error("Jam invalide.");
  for (const p of raw.people) {
    for (const k of Object.keys(ACTIONS))
      for (const f of ["started", "completed", "interrupted"])
        if (
          !Number.isInteger(p.actionCounts?.[k]?.[f]) ||
          p.actionCounts[k][f] < 0
        )
          throw Error("Compteur invalide.");
    if (!num(p.reputation?.score)) throw Error("Réputation invalide.");
    if (
      p.action?.key === "jam" &&
      !raw.jams.some((j) => j.id === p.action.sessionId)
    )
      throw Error("Session manquante.");
  }
  if (
    !Array.isArray(raw.activities) ||
    !Array.isArray(raw.projects) ||
    !Number.isInteger(raw.nextActivityId) ||
    raw.nextActivityId < 1 ||
    !Number.isInteger(raw.nextProjectId) ||
    raw.nextProjectId < 1
  )
    throw Error("Projets ou activités invalides.");
  const projectIds = new Set();
  const activityIds = new Set();
  for (const project of raw.projects) {
    if (
      !/^c\d+$/.test(project.id) ||
      typeof project.author !== "string" ||
      projectIds.has(project.id) ||
      typeof project.title !== "string" ||
      !Number.isFinite(project.target) ||
      project.target <= 0 ||
      !num(project.work, 0, project.target) ||
      !Number.isInteger(project.sessions) ||
      project.sessions < 0 ||
      !["idea", "draft", "ready", "finished"].includes(project.status) ||
      !emotionDefinition(project.emotion) ||
      !GENRES.includes(project.genre) ||
      !Array.isArray(project.sources) ||
      project.sources.some((x) => !source(x)) ||
      !num(project.potential) ||
      !num(project.intensity) ||
      !Number.isFinite(project.created) ||
      !Number.isFinite(project.updated)
    )
      throw Error("Projet invalide.");
    projectIds.add(project.id);
  }
  for (const p of raw.people)
    if (
      p.draft.projectId &&
      (!projectIds.has(p.draft.projectId) ||
        raw.projects.find((x) => x.id === p.draft.projectId).author !== p.id)
    )
      throw Error("Projet manquant.");
  if (
    raw.nextProjectId <=
    Math.max(0, ...raw.projects.map((x) => Number(x.id.slice(1))))
  )
    throw Error("Identifiant de projet invalide.");
  for (const a of raw.activities) {
    if (
      typeof a.id !== "string" ||
      activityIds.has(a.id) ||
      (!ACTIONS[a.key] && a.key !== "form") ||
      !Array.isArray(a.ids) ||
      !Array.isArray(a.events) ||
      a.events.some((e) => !source(e) || !Array.isArray(e.ids)) ||
      !Number.isFinite(a.time) ||
      !Number.isFinite(a.activeMinutes) ||
      ![
        "travel",
        "active",
        "waiting",
        "completed",
        "interrupted",
        "cancelled",
      ].includes(a.status)
    )
      throw Error("Bilan invalide.");
    activityIds.add(a.id);
  }
  for (const p of raw.people)
    if (p.action && !activityIds.has(p.action.activityId))
      throw Error("Bilan manquant.");
  for (const r of Object.values(raw.rels))
    if (!Number.isInteger(r.musicSessions) || r.musicSessions < 0)
      throw Error("Découverte invalide.");
  for (const j of raw.jams)
    if (
      !Array.isArray(j.playedPairs) ||
      j.playedPairs.some((x) => typeof x !== "string") ||
      !j.outcomes ||
      typeof j.outcomes !== "object" ||
      Object.values(j.outcomes).some((v) => !Number.isInteger(v) || v < 0)
    )
      throw Error("Expérience musicale invalide.");
  if (raw.nextId <= Math.max(...raw.people.map((p) => Number(p.id.slice(1)))))
    throw Error("Identifiant de personnage invalide.");
  validateLife(raw);
  validateV7(raw);
  return raw;
}
