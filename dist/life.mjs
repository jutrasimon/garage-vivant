import {grantXp} from './progression.mjs?v=0.8.3';
import {rule} from './design-rules.mjs?v=0.8.3';
import { followingConcertPerformance,beginBandLiveConcert,skipBandLiveExchange } from './bandlive-concert.mjs?v=0.8.3';
import { initializeGroupState, proposeMembership, requestRehearsal, adoptSong, refreshGroup, groupsMinute, leaveGroup, dissolveGroup, activeGroup } from './groups.mjs?v=0.8.3';
import { plateauGain, decadenceCount, availableMusicName, musicName } from "./v71.mjs?v=0.8.3";
import { editTokens } from "./v7.mjs?v=0.8.3";
import { initializeV6Person } from "./social.mjs?v=0.8.3";
import {
  initializeCalendar,
  upgradeCalendar,
  calendarMinute,
  bookShow,
  modifyBooking,
  eventById,
  rollCalendar,
  morale,
  moraleEffect,
  validateCalendar,
} from "./calendar.mjs?v=0.8.3";
import {
  clamp,
  round,
  rand,
  log,
  feel,
  decide,
  interruptActivity,
  relationship,
  createGroup,
  formationEligible,
  startRecomposition,
  PLACES,
  GENRES,
  ACTIONS,
  step,
  refreshReputation,
} from "./engine.mjs?v=0.8.3";
import {
  CARDS,
  CURSES,
  INTENTIONS,
  defaultDeck,
  availableCards,
  createPerformance,
  advancePerformance,
  validatePerformance,
} from "./stage.mjs?v=0.8.3";

export function initializePerson(p) {
  initializeV6Person(p);
  const index = Number(p.id.slice(1));
  p.identity = {
    accessory: ["hair", "glasses", "cap", "brows", "moustache", "earring"][
      index % 6
    ],
    accent: index % 3 === 0 ? "scarf" : null,
    movement:
      p.personality.outgoing > 65
        ? "flamboyant"
        : p.traits.includes("shy")
          ? "shy"
          : p.personality.stable < 40
            ? "nervous"
            : "calm",
  };
  p.decadence = 0;
  p.decadenceHistory = [];
  p.deck = defaultDeck(p);
  p.showFame = 0;
  p.invitationCooldown = {};
  p.engagement = null;
  p.invitationQueue = [];
}
export function initializeGroup(g, time) {
  Object.assign(g, {
    development: 18,
    reputation: 0,
    lastWorked: time,
    archivedAt: null,
    repertoire: [],
    moments: [],
    shows: [],
    alumni: [],
  });
}
export function initializeLife(s) {
  s.playerId = s.people[0]?.id || null;
  s.bookings = [];
  s.nextBookingId = 1;
  s.nextPerformanceId = 1;
  s.performance = null;
  s.showHistory = [];
  s.archiveThreshold = 25;
  s.songArchive = [];
  s.showEventId = null;
  s.together = [];
  s.encounters = {};
  s.nextTogetherId = 1;
  initializeCalendar(s);
  initializeGroupState(s);
}
export function upgradeLife(s) {
  for (const p of s.people) initializePerson(p);
  for (const g of s.groups) initializeGroup(g, s.time);
  initializeLife(s);
  log(
    s,
    "system",
    "V0.5 : saison locale, shows à cartes, déchéance et répertoire. Compétences, chansons et souvenirs conservés.",
  );
}
export function bandStage(g) {
  return g.archivedAt !== null
    ? "Archivé"
    : g.development < 25
      ? "Embryonnaire"
      : g.development < 50
        ? "En place"
        : g.development < 75
          ? "Rodé"
          : "Affirmé";
}
export function nextCurse(p) {
  const count=decadenceCount(p);return count<Math.min(5,Math.ceil(p.deck.length*.6))?{...CURSES[Math.min(count,3)],threshold:(count+1)*20}:null;
}
export function learningGain(p, key, gain) {
  return plateauGain(p,key,gain);
}
export function changeDecadence(s, p, amount, reason) {
  const before = p.decadence;
  p.decadence = clamp(before + amount);
  if (Math.abs(amount) >= 1) {
    p.decadenceHistory.unshift({
      time: s.time,
      amount: Math.round((p.decadence - before) * 10) / 10,
      reason,
    });
    p.decadenceHistory = p.decadenceHistory.slice(0, 8);
  }
  if(p.bag){const count=decadenceCount(p);if(count!==p.decadenceTokens){editTokens(p,"decadence",count);p.decadenceTokens=count;}}
  const previous=decadenceCount({...p,decadence:before}),current=decadenceCount(p);
  if (current !== previous)
    log(
      s,
      "decadence",
      `${p.name} : ${current > previous ? "un seuil de déchéance ajoute une carte maudite" : "la récupération retire une carte maudite"}.`,
      [p.id],
      { explanation: reason },
    );
}
export function archiveSong(s, song) {
  if (
    song.weak &&
    !s.songArchive.some((x) => x.id === song.id)
  )
    s.songArchive.push({
      id: song.id,
      time: s.time,
      reason: `Qualité ${song.quality} comparée à la référence de l’auteur ${song.qualityReference}`,
      auto: true,
    });
}
export function isArchivedSong(s, id) {
  return s.songArchive.some((x) => x.id === id) || !!s.songs.find(x=>x.id===id)?.weak;
}
export function eligibleSongs(s,g){return s.songs.filter(song=>song.ownerGroupId===g.id&&g.repertoire.some(r=>r.songId===song.id&&r.active!==false));}
export function groupContext(s){
 return {
  validPlace:id=>PLACES.some(x=>x.id===id&&x.kind==='garage'),
  canCreate:name=>name?availableMusicName(s,'group',name):!!musicName(s,'group',()=>0,{reserve:false}),
  random:()=>rand(s),emit:(...args)=>log(s,...args),create:(ids,options)=>createGroup(s,ids,options),
  close:(p,status)=>interruptActivity(s,p,status),
  start:(p,req)=>decide(s,p,'practice',{groupId:req.groupId,songId:req.songId,rehearsalId:req.id,place:req.place}),
  place:()=>PLACES.filter(x=>x.kind==='garage')[Math.floor(rand(s)*PLACES.filter(x=>x.kind==='garage').length)].id,
  nearShow:(p,req)=>s.bookings.some(b=>{
   if(!['booked','assembling','playing'].includes(b.status)||!b.members.includes(p.id)||b.time<s.time)return false;
   const place=PLACES.find(x=>x.id===req.place),journey=showJourney(s,{...p,x:place.door.x,y:place.door.y},b);
   const approach=Math.ceil((Math.abs(p.y-340)+Math.abs(p.x-place.door.x)+Math.abs(place.door.y-340))/12)+3;
   return journey&&s.time+approach+rule(s,'groups.waitMinutes')+p.actionRanges.practice.max>=journey.departure;
  }),
  closeShow:(p,g)=>s.bookings.some(b=>b.groupId===g.id&&['booked','assembling','playing'].includes(b.status)&&b.members.includes(p.id)&&b.time-s.time<=rule(s,'groups.nearShow')),
  refused:p=>feel(s,p,{distress:3}),joined:p=>feel(s,p,{exaltation:12}),
  cancelMember:(g,p)=>{for(const b of s.bookings.filter(b=>b.groupId===g.id&&['applied','booked','assembling'].includes(b.status))){const remaining=b.members.filter(id=>id!==p.id);if(p.engagement?.bookingId===b.id)p.engagement=null;if(remaining.length<2)cancelBooking(s,b);else b.members=remaining;}},
  cancelGroup:g=>{for(const b of s.bookings.filter(b=>b.groupId===g.id&&['applied','booked','assembling'].includes(b.status)))cancelBooking(s,b);}
 };
}
export function groupRehearsal(s, j, present) {
  const g=s.groups.find(g=>g.id===j.groupId&&g.archivedAt===null);
  const row=g?.repertoire.find(r=>r.songId===j.songId);
  if(!g||!row||row.active===false||present.length<2||present.some(p=>!g.members.includes(p.id)))return;
  g.lastWorked=s.time;
  // One group gain per completed collective cycle, never during travel or waiting.
  if (j.elapsed > 0 && j.elapsed % 15 === 0 && g.lastRehearsalCycle!==s.time) {
    g.lastRehearsalCycle=s.time;
    if (row) row.rehearsals++;
    g.development=clamp(g.development+1);
    g.moments.unshift({
      time: s.time,
      type: "rehearsal",
      text: row
        ? `Répétition de « ${s.songs.find((x) => x.id === row.songId)?.title} »`
        : "Jam commune",
      participants: present.map((p) => p.id),
    });
    g.moments = g.moments.slice(0, 12);
  }
}
function result(ok, message, extra = {}) {
  return { ok, message, ...extra };
}
export function acceptance(s, host, target, group = null) {
  const r = relationship(s, target, host);
  return clamp(
    0.53 +
      r.affinity * 0.004 +
      r.tension * 0.004 -
      target.decadence * 0.002 +
      (group?.development || 0) * 0.0015,
    0.1,
    0.97,
  );
}
export function availability(
  s,
  p,
  time,
  duration = 100,
  eventId = null,
  slotId = null,
) {
  const conflict = s.bookings.find(
    (b) =>
      ["applied", "booked", "assembling", "playing"].includes(b.status) &&
      b.members.includes(p.id) &&
      Math.abs(b.time - time) < Math.max(duration, 180) &&
      !(
        eventId === b.opportunityId &&
        (b.status === "applied" || (slotId && slotId !== b.slotId))
      ),
  );
  return conflict
    ? {
        available: false,
        reason: `Déjà engagé avec ${s.groups.find((g) => g.id === conflict.groupId)?.name || "un autre band"}`,
        booking: conflict,
      }
    : {
        available: true,
        reason:
          p.decadence >= 85
            ? "Fiabilité fragile : risque d’absence"
            : "Disponible",
      };
}
function invite(s,cmd){
 const host=s.people.find(p=>p.id===cmd.actorId),target=s.people.find(p=>p.id===cmd.targetId),g=cmd.groupId?s.groups.find(g=>g.id===cmd.groupId):null;
 if(cmd.groupId&&!g)return result(false,'Groupe introuvable.');
 return proposeMembership(s,host,target,g,groupContext(s),{manual:true,name:cmd.name||null});
}
function rehearse(s,cmd){
 const g=s.groups.find(g=>g.id===cmd.groupId),host=s.people.find(p=>p.id===cmd.actorId);
 if(!activeGroup(g)||!host||!g.members.includes(host.id))return result(false,'Choisis un groupe dont tu fais partie.');
 return requestRehearsal(s,g,Number(cmd.songId),groupContext(s).place(),groupContext(s));
}
export function performanceSong(s, g, id) {
  if (id !== null) return s.songs.find((song) => song.id === Number(id));
  const skill =
    g.members
      .map((id) => s.people.find((p) => p.id === id))
      .filter(Boolean)
      .reduce((n, p) => n + p.skills[p.instrument], 0) /
    Math.max(1, g.members.length);
  return {
    id: null,
    title: "Jam libre · " + g.genre,
    genre: g.genre,
    quality: round(clamp(skill * 0.35 + g.development * 0.15, 10, 45)),
    intensity: 40,
    emotion: "excitement",
    tone: "improvisée",
  };
}
function book(s, cmd) {
  return bookShow(s, cmd, acceptance, availability);
}
export function command(s, cmd) {
  if (!cmd || typeof cmd.type !== "string")
    return result(false, "Commande invalide.");
  if(s.performance?.bandLive&&s.showEventId&&['preview','replay','skip'].includes(cmd.type))return result(false,'Termine ou interromps le show BandLive avant de lancer une autre prestation.');
  if (
    s.performance?.status === "playing" &&
    !["avatar", "cancelBooking", "cancelPerformance", "skip"].includes(cmd.type)
  )
    return result(
      false,
      "Le show est en cours. Les décisions reprennent au bilan.",
    );
  const actor = s.people.find((p) => p.id === (cmd.actorId || s.playerId));
  if (!actor) return result(false, "Musicien introuvable.");
  cmd = { ...cmd, actorId: actor.id };
  switch (cmd.type) {
    case "skip":
      skipShow(s, !!cmd.all);
      return result(
        true,
        "Spectacle résolu. Les conséquences sont appliquées une seule fois.",
      );
    case "avatar":
      s.playerId = actor.id;
      return result(true, `Tu incarnes ${actor.name}.`);
    case "action":
      if (!ACTIONS[cmd.key]) return result(false, "Action inconnue.");
      if(cmd.projectId&&!s.projects.some(x=>x.id===cmd.projectId&&x.authors.includes(actor.id)&&!['finished','abandoned'].includes(x.status)))return result(false,"Projet absent, abandonné ou attribué à un autre auteur.");
      if (actor.engagement)
        return result(false, "Ce musicien est en route vers un show.");
      if (actor.action?.key === "sleep")
        return result(false, "Ce musicien dort; attendre son réveil.");
      if (ACTIONS[cmd.key]?.internal)
        return result(false, "Le sommeil est géré par l’horaire quotidien.");
      if (actor.id !== s.playerId && cmd.request !== false) {
        const host = s.people.find((p) => p.id === s.playerId),
          willingness = acceptance(s, host, actor);
        if (rand(s) >= willingness) {
          log(
            s,
            "decision",
            `${actor.name} préfère poursuivre son activité plutôt que ${ACTIONS[cmd.key].label.toLowerCase()}.`,
            [actor.id, host.id],
            {
              explanation:
                "Proposition du musicien joueur; le partenaire conserve son autonomie.",
            },
          );
          return result(false, `${actor.name} décline la proposition.`);
        }
      }
      decide(s, actor, cmd.key, {projectId:cmd.projectId,newProject:cmd.newProject});
      return result(true, `${actor.name} : ${ACTIONS[cmd.key].label}.`);
    case "invite":
      return invite(s, cmd);
    case "rehearse":
      return rehearse(s, cmd);
    case "recompose":
      return startRecomposition(s,actor,Number(cmd.songId));
    case "book":
      return book(s, cmd);
    case "modifyBooking":
      return modifyBooking(s, cmd, acceptance, availability);
    case "repertoire": {
      const g=s.groups.find(g=>g.id===cmd.groupId),song=s.songs.find(x=>x.id===Number(cmd.songId));
      if(!activeGroup(g)||!g.members.includes(actor.id)||!song)return result(false,'Groupe ou chanson indisponible.');
      const row=g.repertoire.find(r=>r.songId===song.id);
      if(row){row.active=!cmd.remove;refreshGroup(s,g);return result(true,cmd.remove?'Morceau mis de côté. Propriété et maîtrise conservées.':'Morceau réactivé.');}
      if(cmd.remove)return result(false,'Morceau absent du répertoire.');
      return adoptSong(s,g,song,groupContext(s));
    }
    case "leaveGroup": {
      const g=s.groups.find(g=>g.id===cmd.groupId);
      return result(!!g&&leaveGroup(s,g,actor,'Départ manuel.',groupContext(s)),'Départ du groupe demandé.');
    }
    case "deck": {
      if (
        !Array.isArray(cmd.cards) ||
        cmd.cards.length < 8 ||
        cmd.cards.length > 10 ||
        new Set(cmd.cards).size !== cmd.cards.length ||
        cmd.cards.some((id) => !availableCards(actor).includes(id))
      )
        return result(
          false,
          "Choisis 8 à 10 cartes musicales distinctes et débloquées.",
        );
      actor.deck = [...cmd.cards];
      return result(
        true,
        "Deck préparé. La déchéance ajoute ses cartes maudites.",
      );
    }
    case "excess":
      if (actor.engagement || actor.needs.energy < 15)
        return result(
          false,
          "Ce n’est pas le moment : engagement ou épuisement.",
        );
      changeDecadence(s, actor, 18, "Une soirée d’excès choisie");
      actor.needs.energy = clamp(actor.needs.energy - 8);
      const ev = log(
        s,
        "decadence",
        `${actor.name} prolonge la fête : déchéance +18, énergie −8.`,
        [actor.id],
      );
      feel(s, actor, { exaltation: 26 }, ev);
      decide(s, actor, "decadence");
      return result(
        true,
        "La fête se prolonge. Les effets sur le deck restent visibles.",
      );
    case "archive": {
      const song = s.songs.find((x) => x.id === Number(cmd.songId));
      if (!song) return result(false, "Chanson introuvable.");
      if(cmd.restore){song.keepActive=true;song.weak=false;}
      if (cmd.restore)
        s.songArchive = s.songArchive.filter((x) => x.id !== song.id);
      else if (!isArchivedSong(s, song.id))
        s.songArchive.push({
          id: song.id,
          time: s.time,
          reason: "Archivage manuel",
          auto: false,
        });
      return result(
        true,
        cmd.restore
          ? "Chanson restaurée."
          : "Chanson archivée, sans suppression.",
      );
    }
    case "revive": return result(false,'Une dissolution est définitive.');

    case "cancelBooking": {
      const b = s.bookings.find(
        (b) =>
          b.id === cmd.bookingId &&
          b.members.includes(actor.id) &&
          ["applied", "booked", "assembling", "playing"].includes(b.status),
      );
      if (!b) return result(false, "Cet engagement ne peut plus être annulé.");
      cancelBooking(s, b);
      return result(
        true,
        "Engagement annulé. Les musiciens reprennent leur vie.",
      );
    }
    case "cancelPerformance": {
      const show = s.performance;
      if (!show || show.status !== "playing")
        return result(false, "Aucun spectacle en cours.");
      if (show.preview) {
        s.performance = null;
        return result(true, "Essai arrêté. Aucune conséquence de show.");
      }
      const b = s.bookings.find(
        (b) => b.performanceId === show.id && b.members.includes(actor.id),
      );
      if (!b) return result(false, "Choisis un membre du band sur scène.");
      cancelBooking(s, b);
      return result(true, "Show interrompu, sans récompense.");
    }
    case "replay": {
      const old = s.performance;
      if (!old || old.status !== "finished")
        return result(false, "Le show doit être terminé.");
      const people = old.actors.map((p) => ({
        ...p,
        needs: { energy: p.startingEnergy },
        skills: { [p.instrument]: p.skill },
      }));
      const group = {
        id: old.groupId,
        name: old.groupName,
        development: old.development,
        stageMorale: old.morale ?? 60,
        repertoire: [{ songId: old.song.id, mastery: old.mastery }],
      };
      s.performance = createPerformance({
        id: `p-show${s.nextPerformanceId++}`,
        seed: old.seed,
        people,
        group,
        song: { ...old.song, genre: old.genre },
        opportunity: old.sourceOpportunity,
        intention: old.intention,
        preview: true,
        totalTicks: old.totalTicks || 2160,
      });
      if (old.initialFans) {
        s.performance.fans = JSON.parse(JSON.stringify(old.initialFans));
        s.performance.initialFans = JSON.parse(JSON.stringify(old.initialFans));
      }
      return result(
        true,
        "Replay du même tirage, sans appliquer les conséquences une deuxième fois.",
      );
    }
    case "preview": {
      const g = s.groups.find(
          (g) => g.id === cmd.groupId && g.members.includes(actor.id),
        ),
        song = g && performanceSong(s, g, cmd.songId);
      if (
        !g ||
        g.archivedAt !== null ||
        !song ||
        (song.id !== null && !g.repertoire.some((r) => r.songId === song.id&&r.active!==false))
      )
        return result(false, "Choisis une chanson du répertoire de ton band.");
      const members = (cmd.members || g.members)
        .filter((id) => g.members.includes(id))
        .map((id) => s.people.find((p) => p.id === id))
        .filter(Boolean);
      if (members.length < 2)
        return result(false, "Il faut au moins deux musiciens.");
      s.performance = createPerformance({
        id: `p-show${s.nextPerformanceId++}`,
        seed: Math.floor(rand(s) * 4294967296),
        people: members,
        group: g,
        song,
        opportunity: {
          id: "preview",
          name: "Répétition générale",
          styles: [g.genre, "Indie"],
          crowd: 8,
        },
        intention: cmd.intention || "tight",
        preview: true,
      });
      return result(
        true,
        "Répétition générale : aucun gain de réputation ni conséquence de show.",
      );
    }
    default:
      return result(false, "Commande inconnue.");
  }
}
function cancelBooking(s, b) {
  const live =
    s.performance?.status === "playing" &&
    !s.performance.preview &&
    s.performance.id === b.performanceId;
  if (live) {
    for (const a of s.performance.actors) {
      const p = s.people.find((p) => p.id === a.id);
      if (p) p.needs.energy = clamp(p.needs.energy - 5);
    }
    s.performance = null;
    s.showEventId = null;
  }
  b.status = "cancelled";
  const occasion = eventById(s, b.opportunityId),
    slot = occasion?.slots.find((x) => x.bookingId === b.id);
  if (slot) slot.bookingId = null;
  const band = s.groups.find((g) => g.id === b.groupId);
  if (band) band.nextBookingAttempt = s.time + 360;
  refreshOpportunity(s, b.opportunityId);
  for (const p of s.people)
    if (p.engagement?.bookingId === b.id) {
      p.engagement = null;
      decide(s, p);
    }
  log(
    s,
    "booking",
    `${s.groups.find((g) => g.id === b.groupId)?.name || "Le band"} annule son engagement${live ? " après le début du show" : ""}.`,
    b.members,
    { bookingId: b.id },
  );
}
export function showJourney(s,p,b){
 const o=eventById(s,b.opportunityId),place=PLACES.find(x=>x.id===o?.venue);if(!place)return null;
 const route=[{x:p.x,y:340},{x:place.door.x,y:340},{x:place.door.x+((b.members.indexOf(p.id)%6)-2.5)*25,y:place.door.y}];
 let previous=p,minutes=0;for(const point of route){minutes+=Math.max(1,Math.ceil(Math.hypot(point.x-previous.x,point.y-previous.y)/12));previous=point;}
 return {dest:place.id,route,minutes,departure:b.time-rule(s,'groups.arrivalMargin')-minutes};
}
export function departForShow(s,p){
 if(p.engagement||s.performance?.status==='playing')return false;
 const b=s.bookings.filter(b=>['booked','assembling'].includes(b.status)&&b.members.includes(p.id)&&!b.absences?.[p.id]).sort((a,b)=>a.time-b.time)[0];
 if(!b)return false;const journey=showJourney(s,p,b);if(!journey||s.time<journey.departure)return false;
 b.absences||={};const chance=p.decadence>=rule(s,'groups.absenceThreshold')?Math.min(.2,(p.decadence-rule(s,'groups.absenceThreshold'))*rule(s,'groups.absenceSlope')):0;
 if(chance&&rand(s)<chance){b.absences[p.id]={time:s.time,reason:'Déchéance extrême',chance};log(s,'conflict',`${p.name} manque son spectacle : déchéance extrême.`,b.members,{bookingId:b.id,groupId:b.groupId});return false;}
 const sleeping=p.action?.key==='sleep';interruptActivity(s,p);
 if(sleeping){p.sleep.wakeAt=null;p.sleep.started=null;p.sleep.nextBedtime=s.time;}
 p.engagement={bookingId:b.id,dest:journey.dest,route:journey.route,arrived:false};b.status='assembling';
 log(s,'booking',`${p.name} part au spectacle (${journey.minutes} min de trajet).`,[p.id],{bookingId:b.id,groupId:b.groupId,departure:true,travelMinutes:journey.minutes});return true;
}
export function travelEngagement(s, p) {
  const a = p.engagement;
  if (!a) return false;
  if (a.route.length) {
    const t = a.route[0],
      d = Math.hypot(t.x - p.x, t.y - p.y);
    if (d <= 12) {
      p.x = t.x;
      p.y = t.y;
      a.route.shift();
    } else {
      p.x += ((t.x - p.x) * 12) / d;
      p.y += ((t.y - p.y) * 12) / d;
    }
  }
  if (!a.route.length) {
    p.place = a.dest;
    a.arrived = true;
  }
  return true;
}
export function refreshOpportunity(s, id) {
  const o = eventById(s, id);
  if (!o) return;
  for (const slot of o.slots || []) {
    const b = s.bookings.find((x) => x.id === slot.bookingId);
    if (b && ["cancelled", "missed", "rejected"].includes(b.status))
      slot.bookingId = null;
  }
  const bookings = s.bookings.filter((b) => b.opportunityId === id),
    active = bookings.find((b) =>
      ["applied", "booked", "assembling", "playing"].includes(b.status),
    );
  o.bookingId = active?.id || null;
  o.status = active
    ? "booked"
    : bookings.some((b) => b.status === "played")
      ? "played"
      : s.time >= o.time
        ? "missed"
        : "open";
}
function cancelAtDoor(s, b, reason) {
  b.status = "missed";
  refreshOpportunity(s, b.opportunityId);
  log(s, "show", `Show reporté : ${reason}.`, b.members, { bookingId: b.id });
  for (const p of s.people)
    if (p.engagement?.bookingId === b.id) {
      p.engagement = null;
      decide(s, p);
    }
}
export function lifeMinute(s) {
  calendarMinute(s, acceptance, availability);
  for (const p of s.people) {
    const key = p.action?.key;
    if (key === "sleep" && !p.action.route.length)
      changeDecadence(s, p, -0.025, "Repos");
    else if (key === "relax" && !p.action.route.length)
      changeDecadence(s, p, -0.006, "Détente");
    else if (
      p.needs.energy < 25 &&
      (s.time % 1440 < 360 || s.time % 1440 > 1320) &&
      ["jam", "practice", "write"].includes(key)
    )
      changeDecadence(s, p, 0.025, "Nuit sacrifiée malgré la fatigue");
  }
  if(s.time%60===0)for(const g of s.groups.filter(activeGroup))if(s.time-g.lastWorked>2880)g.development=clamp(g.development-.24);
  groupsMinute(s,groupContext(s));
  // Everyone travels before selecting the first ready slot. Booking order must
  // never put the headliner ahead of an opening act or strand a shared member.
  const scheduled = [...s.bookings].sort(
    (a, b) =>
      a.time - b.time ||
      (eventById(s, a.opportunityId)?.slots.findIndex(
        (x) => x.id === a.slotId,
      ) ?? 0) -
        (eventById(s, b.opportunityId)?.slots.findIndex(
          (x) => x.id === b.slotId,
        ) ?? 0),
  );
  for (const b of scheduled) {
    if (["booked","assembling"].includes(b.status) && s.time >= b.time) {
      const g = s.groups.find((g) => g.id === b.groupId),
        song = g && performanceSong(s, g, b.songId),
        o = eventById(s, b.opportunityId);
      const present = b.members
        .map((id) => s.people.find((p) => p.id === id))
        .filter(
          (p) =>
            p?.engagement?.arrived &&
            s.bookings.find((x) => x.id === p.engagement.bookingId)
              ?.opportunityId === b.opportunityId,
        );
      if (present.length < 2 && g && song && s.time < b.time + 20) break;
      if (!g || !song || present.length < 2) {
        cancelAtDoor(s, b, "moins de deux musiciens présents");
        continue;
      }
      g.stageMorale = morale(g, s.time);
      s.performance = createPerformance({
        id: `p-show${s.nextPerformanceId++}`,
        seed: Math.floor(rand(s) * 4294967296),
        people: present,
        group: g,
        song,
        opportunity: o,
        intention: b.intention,
      });
      s.showEventId = o.id;
      b.status = "playing";
      b.performanceId = s.performance.id;
      s.performance.setlist = b.setlist || [b.songId];
      s.performance.songIndex = 0;
      s.performance.songResults = [];
      s.performance.role = b.role;
      break;
    }
  }
  for (const o of s.eventArchive)
    if (o.status === "open" && s.time > o.time + 100) o.status = "missed";
}
export function completePerformance(s) {
  const show = s.performance;
  if (!show || show.status !== "finished" || show.applied) return false;
  if (s.showHistory.some((r) => r.id === show.id)) {
    show.applied = true;
    return false;
  }
  show.applied = true;
  if (show.preview) return true;
  const b = s.bookings.find((b) => b.performanceId === show.id),
    g = s.groups.find((g) => g.id === show.groupId),
    o = eventById(s, show.opportunityId),
    r = show.result;
  const firstShow=!!g&&!g.shows.length;
  const record = {
    firstShow,
    trace: JSON.parse(JSON.stringify(show)),
    id: show.id,
    time: s.time,
    groupId: show.groupId,
    groupName: show.groupName,
    songId: show.song.id,
    songTitle: show.song.title,
    opportunityId: show.opportunityId,
    opportunityName: show.opportunityName,
    intention: show.intention,
    members: show.actors.map((p) => p.id),
    ...r,
  };
  s.showHistory.push(record);
  for (const r of s.showHistory.slice(0, -12)) delete r.trace;
  if (b) {
    b.status = "played";
    refreshOpportunity(s, b.opportunityId);
  } else if (o) o.status = "played";
  const before = g
    ? {
        reputation: g.reputation,
        development: g.development,
        morale: morale(g, s.time),
      }
    : null;
  if (activeGroup(g)) {
    g.development = clamp(g.development + 2 + r.score * 0.055);
    const expected = o?.organizer?.exigence || 30;
    g.showReputation = clamp(
      g.showReputation +
        (r.score >= expected
          ? r.score * 0.12
          : -Math.min(10, (expected - r.score) * 0.18)),
    );
    refreshGroup(s,g);
    moraleEffect(
      s,
      g,
      r.score >= expected ? 6 : -Math.min(15, 5 + (expected - r.score) * 0.15),
      r.score >= expected ? "Show réussi" : "Public déçu",
    );
    g.lastWorked = s.time;
    g.shows.push(show.id);
    g.moments.unshift({
      time: s.time,
      type: "show",
      text: `${show.opportunityName} · ${r.score}/100`,
      participants: record.members,
    });
    g.moments = g.moments.slice(0, 12);
    const song = g.repertoire.find((x) => x.songId === show.song.id);
    // Retain legacy mastery in saves, without adding a level to the song.
  }
  if (g) {
    record.effects = {
      before,
      after: {
        reputation: g.reputation,
        development: g.development,
        morale: morale(g, s.time),
      },
    };
    record.songs = show.songResults?.length
      ? show.songResults
      : [{ title: show.song.title, ...r }];
    record.role = show.role;
  }
  const event = log(
    s,
    "show",
    `${show.groupName} joue « ${show.song.title} » : ${r.conquered}/${r.total} fans conquis, accueil ${r.score}/100.`,
    record.members,
    {
      groupId: show.groupId,
      showId: show.id,
      explanation: `Écriture ${r.quality}, interprétation ${r.interpretation}, ${r.combos} combos, ${r.errors} erreurs. Les goûts du public et les zones d’impact ont compté.`,
    },
  );
  for (const actor of show.actors) {
    const p = s.people.find((p) => p.id === actor.id);
    if (!p) continue;
    p.needs.energy = clamp(
      p.needs.energy -
        15 -
        actor.energyLoss -
        (show.energyLossByActor?.[actor.id] || 0),
    );
    const xp=10+Math.round(r.score/5)+(firstShow?20:0)+(r.conquered===r.total?15:0);
    const gain=grantXp(p,xp);record.individualXp??=[];record.individualXp.push(gain);
    if(gain.levelAfter>gain.levelBefore)log(s,'music',`${p.name} atteint le niveau ${gain.levelAfter} ! Spectacle · +${xp} XP.`,[p.id],{xp:gain});
    p.showFame = clamp(p.showFame + r.score * 0.055, 0, 25);
    feel(s, p, r.score >= 45 ? { exaltation: 22 } : { distress: 14 }, event);
    if (show.intention === "wild")
      changeDecadence(s, p, 5 + actor.errors, "Tout donner pendant un show");
    for (const partner of show.actors.filter((q) => q.id !== p.id)) {
      const q = s.people.find((p) => p.id === partner.id);
      if (!q) continue;
      const relation = relationship(s, p, q);
      relation.collaboration = clamp(relation.collaboration + 2);
      if (actor.errors >= 2) relation.tension = clamp(relation.tension + 3);
    }
    refreshReputation(s, p);
  }
  for (const p of s.people)
    if (p.engagement?.bookingId === b?.id) {
      p.engagement = null;
      decide(s, p);
    }
  rollCalendar(s);
  return true;
}
export function playTicks(s, ticks) {
  if (s.performance?.status !== "playing" || s.performance.bandLive) return;
  advancePerformance(s.performance, ticks);
  if (s.performance.status !== "finished") return;
  const old = s.performance,
    b = s.bookings.find((b) => b.performanceId === old.id),
    g = s.groups.find((g) => g.id === old.groupId);
  old.songResults ||= [];
  old.songResults.push({
    title: old.song.title,
    id: old.song.id,
    ...old.result,
  });
  if (!old.preview && b && old.songIndex + 1 < (b.setlist || []).length) {
    const nextIndex = old.songIndex + 1,
      song = performanceSong(s, g, b.setlist[nextIndex]),
      people = old.actors.map((a) => ({
        ...a,
        needs: { energy: a.energy },
        skills: { [a.instrument]: a.skill },
      }));
    const next = createPerformance({
      id: old.id,
      seed: (old.seed + nextIndex * 7919) >>> 0,
      people,
      group: g,
      song,
      opportunity: old.sourceOpportunity,
      intention: old.intention,
    });
    Object.assign(next, {
      fans: old.fans.map((f) => ({ ...f })),
      initialFans: old.fans.map((f) => ({ ...f })),
      energyLossByActor: Object.fromEntries(
        old.actors.map((a) => [
          a.id,
          (old.energyLossByActor?.[a.id] || 0) + a.energyLoss,
        ]),
      ),
      setlist: b.setlist,
      songIndex: nextIndex,
      songResults: old.songResults,
      role: old.role,
      presentationStarted: true,
    });
    s.performance = next;
    return;
  }
  if (old.songResults.length > 1) {
    const xs = old.songResults;
    old.result = {
      ...old.result,
      interpretation: round(
        xs.reduce((n, r) => n + r.interpretation, 0) / xs.length,
      ),
      quality: round(xs.reduce((n, r) => n + r.quality, 0) / xs.length),
      errors: xs.reduce((n, r) => n + r.errors, 0),
      combos: xs.reduce((n, r) => n + r.combos, 0),
    };
  }
  completePerformance(s);
}
export function nextSlot(s, previous = s.performance) {
  if(previous?.bandLive&&s.performance?.id===previous.id&&s.performance.status==='playing')return false;
  // Every exit route carries the full venue audience, including Shows and interruptions.
  const old = followingConcertPerformance(previous);
  if (!old || old.preview) {
    s.showEventId = null;
    return false;
  }
  const o = eventById(s, old.opportunityId);
  const waiting =
    o?.slots
      .map((x) =>
        s.bookings.find(
          (b) =>
            b.id === x.bookingId && ["booked", "assembling"].includes(b.status),
        ),
      )
      .filter(Boolean) || [];
  for (const b of waiting) {
    const g = s.groups.find((g) => g.id === b.groupId),
      people = b.members
        .map((id) => s.people.find((p) => p.id === id))
        .filter(
          (p) =>
            p &&
            (p.engagement?.arrived ||
              s.showHistory.some(
                (r) =>
                  r.opportunityId === old.opportunityId &&
                  r.members.includes(p.id),
              )),
        );
    if (!g || people.length < 2) {
      cancelAtDoor(s, b, "formation insuffisante");
      continue;
    }
    const song = performanceSong(s, g, b.setlist[0]);
    if (!song) {
      cancelAtDoor(s, b, "chanson indisponible");
      continue;
    }
    g.stageMorale = morale(g, s.time);
    s.performance = createPerformance({
      id: `p-show${s.nextPerformanceId++}`,
      seed: Math.floor(rand(s) * 4294967296),
      people,
      group: g,
      song,
      opportunity: o,
      intention: b.intention,
    });
    s.performance.fans = old.fans.map((f) => ({
      ...f,
      meter: Math.min(30, f.meter * 0.2),
      reacted: false,
      reactedAt: null,
      lastHit: null,
      receptivity: Math.min(1.1, f.receptivity),
    }));
    s.performance.initialFans = JSON.parse(JSON.stringify(s.performance.fans));
    Object.assign(s.performance, {
      setlist: b.setlist,
      songIndex: 0,
      songResults: [],
      role: b.role,
    });
    b.status = "playing";
    b.performanceId = s.performance.id;
    s.showEventId = o.id;
    return true;
  }
  s.showEventId = null;
  return false;
}
// User-driven continuation keeps eligible bands in BandLive. Classic simulation
// still uses nextSlot directly and never creates an interactive game by itself.
export function nextBandLiveSlot(s,previous=s.performance,enabled=true){
  const continuing=!!previous?.bandLive&&enabled;
  if(previous===s.performance&&previous?.applied)skipBandLiveExchange(s);
  if(!nextSlot(s,previous))return {advanced:false,interactive:false};
  if(!continuing)return {advanced:true,interactive:false};
  const result=beginBandLiveConcert(s);
  return {advanced:true,interactive:result.ok,reason:result.ok?'':result.message};
}

export function skipShow(s, all = false) {
  if(s.performance?.bandLive&&s.performance.status==='playing')return;
  let guard = 0;
  do {
    while (s.performance?.status === "playing" && guard++ < 100)
      playTicks(s, 100000);
    if (!all) break;
  } while (guard < 100 && nextSlot(s));
}
export function advanceToBooking(s, id) {
  const b = s.bookings.find(
    (b) => b.id === id && ["booked", "assembling"].includes(b.status),
  );
  if (!b) return result(false, "Aucun engagement à venir.");
  step(s, Math.max(1, b.time + 20 - s.time));
  if (s.performance?.status === "playing")
    return result(
      true,
      s.performance.id === b.performanceId
        ? "Le band est sur scène. Le spectacle se joue automatiquement."
        : "Un autre band passe avant : son show démarre maintenant.",
    );
  return result(
    false,
    b.status === "missed"
      ? "Show manqué : moins de deux musiciens sont arrivés avec assez d’énergie. Choisis une autre date du calendrier."
      : "Cet engagement n’a pas atteint la scène. Tu peux l’annuler et choisir une autre date.",
  );
}
export function seasonSummary(s) {
  const shows = s.showHistory.filter((show) => show.time >= s.season.started),
    best = [...shows].sort((a, b) => b.score - a.score)[0];
  return {
    shows: shows.length,
    fans: shows.reduce((n, r) => n + r.conquered, 0),
    average: shows.length
      ? round(shows.reduce((n, r) => n + r.score, 0) / shows.length)
      : 0,
    best,
    bands: s.groups.filter((g) => g.created >= s.season.started).length,
  };
}
export function newSeason(s) {
  rollCalendar(s);
  return result(true, "Le calendrier se renouvelle automatiquement.");
}
export function validateLife(s) {
  const num = (v, a = 0, b = 100) => Number.isFinite(v) && v >= a && v <= b;
  if (
    !s.people.some((p) => p.id === s.playerId) ||
    !Array.isArray(s.bookings) ||
    !Array.isArray(s.showHistory) ||
    !Array.isArray(s.songArchive) ||
    !num(s.archiveThreshold) ||
    !Number.isInteger(s.nextBookingId) ||
    s.nextBookingId < 1 ||
    !Number.isInteger(s.nextPerformanceId) ||
    s.nextPerformanceId < 1 ||
    !s.season ||
    !Array.isArray(s.season.opportunities) ||
    s.season.opportunities.length !== 4 ||
    !num(s.season.started, 0, 1e12)
  )
    throw Error("Saison invalide.");
  for (const p of s.people) {
    if (
      !num(p.decadence) ||
      !num(p.showFame, 0, 25) ||
      !Array.isArray(p.decadenceHistory) ||
      !p.identity ||
      !["hair", "glasses", "cap", "brows", "moustache", "earring"].includes(
        p.identity.accessory,
      ) ||
      !["calm", "nervous", "flamboyant", "shy"].includes(p.identity.movement) ||
      ![null,"scarf"].includes(p.identity.accent) ||
      !Array.isArray(p.deck) ||
      p.deck.length < 8 ||
      p.deck.length > 10 ||
      new Set(p.deck).size !== p.deck.length ||
      p.deck.some((id) => !CARDS[id] || CARDS[id].tag === "curse") ||
      !p.invitationCooldown ||
      typeof p.invitationCooldown !== "object"
    )
      throw Error("Personnage V5 invalide.");
    if (
      p.engagement &&
      (!s.bookings.some((b) => b.id === p.engagement.bookingId) ||
        !PLACES.some((l) => l.id === p.engagement.dest) ||
        !Array.isArray(p.engagement.route) ||
        p.engagement.route.some((t) => !num(t.x, 0, 1100) || !num(t.y, 0, 670)))
    )
      throw Error("Engagement invalide.");
  }
  for (const g of s.groups)
    if (
      !num(g.development) ||
      !num(g.reputation) ||
      !Number.isFinite(g.lastWorked) ||
      (g.archivedAt !== null && !Number.isFinite(g.archivedAt)) ||
      !Array.isArray(g.repertoire) ||
      new Set(g.repertoire.map((r) => r.songId)).size !== g.repertoire.length ||
      g.repertoire.some(
        (r) =>
          !s.songs.some((song) => song.id === r.songId) ||
          !num(r.mastery) ||
          !Number.isInteger(r.rehearsals) ||
          r.rehearsals < 0,
      ) ||
      !Array.isArray(g.moments) ||
      !Array.isArray(g.shows)
    )
      throw Error("Développement de band invalide.");
  for (const o of s.season.opportunities)
    if (
      typeof o.id !== "string" ||
      !Number.isInteger(o.time) ||
      !["open", "booked", "played", "missed"].includes(o.status) ||
      !Array.isArray(o.styles) ||
      o.styles.some((g) => !GENRES.includes(g)) ||
      !PLACES.some((l) => l.id === o.venue) ||
      !num(o.crowd, 8, 36)
    )
      throw Error("Occasion invalide.");
  const ids = new Set();
  for (const b of s.bookings) {
    if (
      typeof b.id !== "string" ||
      ids.has(b.id) ||
      !s.groups.some((g) => g.id === b.groupId) ||
      (b.songId !== null && !s.songs.some((song) => song.id === b.songId)) ||
      !eventById(s, b.opportunityId) ||
      !Number.isInteger(b.time) ||
      !Array.isArray(b.members) ||
      b.members.length < 2 ||
      new Set(b.members).size !== b.members.length ||
      !INTENTIONS[b.intention] ||
      ![
        "applied",
        "rejected",
        "booked",
        "assembling",
        "playing",
        "played",
        "cancelled",
        "missed",
      ].includes(b.status)
    )
      throw Error("Réservation invalide.");
    ids.add(b.id);
  }
  for (const row of s.songArchive)
    if (
      !s.songs.some((song) => song.id === row.id) ||
      typeof row.reason !== "string" ||
      !Number.isFinite(row.time)
    )
      throw Error("Archive invalide.");
  for (const r of s.showHistory)
    if (
      typeof r.id !== "string" ||
      typeof r.groupName !== "string" ||
      typeof r.songTitle !== "string" ||
      typeof r.opportunityName !== "string" ||
      !Number.isFinite(r.time) ||
      !Array.isArray(r.members) ||
      !num(r.score) ||
      !num(r.quality) ||
      !num(r.interpretation) ||
      !num(r.conquered, 0, 36) ||
      !num(r.total, 8, 36) ||
      r.conquered > r.total ||
      !num(r.combos, 0, 600) ||
      !num(r.errors, 0, 600)
    )
      throw Error("Historique de show invalide.");
  if (
    s.nextBookingId <=
    Math.max(0, ...s.bookings.map((b) => Number(b.id.slice(1))))
  )
    throw Error("Identifiant de réservation invalide.");
  if (s.performance) validatePerformance(s.performance);
  if(s.performance?.bandLive){const show=s.performance,live=show.bandLive,b=s.bookings.find(b=>b.id===live.bookingId);if(!b||b.performanceId!==show.id||b.groupId!==show.groupId||b.opportunityId!==show.opportunityId||b.status!==(show.status==='finished'?'played':'playing')||live.game.actors.some(a=>!b.members.includes(a.id)))throw Error('Engagement BandLive incohérent.');}
  validateCalendar(s);
}
