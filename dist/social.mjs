// Legacy V6 migration only. Live V7 rules are in v7.mjs.
import { ACTIONS } from "./engine.mjs?v=0.7.0";
import { upgradeCalendar } from "./calendar.mjs?v=0.7.0";
import { editTokens, coolRelationV7 } from "./v7.mjs?v=0.7.0";
export function initializeV6Person(p) {
  p.bag = null;
  p.memoryArchive = [];
  p.nextMemoryId = 1;
  p.togetherId = null;
}
export function upgradeV6(s) {
  s.showEventId ??= null;
  s.together ||= [];
  s.encounters ||= {};
  s.nextTogetherId ||= 1;
  upgradeCalendar(s);
  for (const p of s.people) {
    p.memoryArchive ||= [];
    p.nextMemoryId ||= 1;
    p.priorities ||= {};
    p.actionCounts ||= {};
    for (const k of Object.keys(ACTIONS))
      p.actionCounts[k] ||= { started: 0, completed: 0, interrupted: 0 };
    if (p.actionCounts.relax) {
      for (const k of ["started", "completed", "interrupted"])
        p.actionCounts.sleep[k] += p.actionCounts.relax[k];
      delete p.actionCounts.relax;
    }
    for (const m of p.memories) {
      m.id ||= `${p.id}-memory-${p.nextMemoryId++}`;
      m.created ??= null;
    }
  }
  for (const r of Object.values(s.rels))
    r.grief ||= { strength: 0, time: s.time, cause: null };
  return s;
}
export const editBag = editTokens;
export function coolRelation(s, r) {
  coolRelationV7(r);
}
export function markGrief(s, r, event) {
  r.grief = {
    strength: Math.min(100, (r.grief?.strength || 0) + 6),
    time: s.time,
    cause: event?.text || "Accrochage",
  };
}
export function repairGrief(r, amount = 4) {
  if (r.grief) r.grief.strength = Math.max(0, r.grief.strength - amount);
}
