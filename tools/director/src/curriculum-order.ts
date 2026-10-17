import { controlSet, type Wave, waveKeys } from "@neon-spore/content";
import { placeable } from "./compose-block.js";
import { isLesson } from "./compose-starts.js";
import { STEPS, TUTORIAL_LAST_ID } from "./compose-steps.js";
import { isFault, panelCost, thingCost } from "./curriculum-cost.js";
import { introducesAt, regularAt } from "./list-reading.js";

/**
 * **The order new things are taught in** — `docs/spec/wave-curriculum.md`
 * §4.1, decision 9. The list after the tutorial arc is cut into **units** —
 * a wave that teaches something new and the guided waves after it — and the
 * units are put in rising cost (`curriculum-cost.ts`), bodies and levers
 * taking turns, each after every unit whose thing it carries.
 *
 * What the composer wrote is not part of a unit: every block's regular
 * waves, a lesson's and a review's are written again for the new order
 * (`waves:order`). A regular wave an author wrote by hand goes behind the
 * unit that teaches the last thing it needs, and the bosses are placed
 * again by `bossOrder`.
 */

/** A body opens a block with a body or a pod in it; a lever is a fault or a
 * panel, taught by a lesson. */
export type UnitKind = "body" | "fault" | "panel";

export interface Unit {
  head: Wave;
  /** The head and the guided waves after it, in order. */
  waves: Wave[];
  kind: UnitKind;
  cost: number;
  /** The heads of the units that teach something its waves carry. */
  needs: ReadonlySet<string>;
}

export interface Curriculum {
  /** Up to FINALE, which nothing here moves. */
  arc: Wave[];
  /** Every unit after the arc, in the order they ship. */
  units: Unit[];
  /** Regular waves an author wrote after the arc, and the units each needs. */
  written: { wave: Wave; needs: ReadonlySet<string>; after: string }[];
  /** Every boss after the arc, in the order they ship. */
  bosses: Wave[];
  /** The waves that shipped before the hold was taught: the ones a move
   * past THE LANCE puts on the full panel. One shipped after it on STANDARD 5
   * is there on purpose — THE LEAK's rehearsal fills nothing under a hold. */
  beforeHold: ReadonlySet<string>;
}

/** Whether a wave is one the composer wrote: a head's id and a step's name,
 * or a review block's or a filler's. */
export function isComposed(id: string, heads: ReadonlySet<string>): boolean {
  return STEPS.some(
    (s) =>
      id.endsWith(s.name) &&
      (heads.has(id.slice(0, -s.name.length)) || /^(review|filler)[A-Z]/.test(id)),
  );
}

/** What a unit's head costs: its dearest new thing. */
function costOf(waves: readonly Wave[], at: number): { kind: UnitKind; cost: number } {
  const things = introducesAt(waves, at);
  const panel = controlSet(waves[at]?.controls).id;
  const cost = Math.max(...things.map((t) => (t === "panel" ? panelCost(panel) : thingCost(t))));
  if (placeable(waves, at) !== undefined) return { kind: "body", cost };
  return { kind: things.some(isFault) ? "fault" : "panel", cost };
}

/** The list after the arc, cut into units, hand-written regular waves and
 * bosses, with what each needs taught first. */
export function splitCurriculum(waves: readonly Wave[]): Curriculum {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const opens = (i: number) =>
    !waves[i]?.boss && (placeable(waves, i) !== undefined || isLesson(waves, i));
  const heads = new Set(waves.flatMap((w, i) => (i > finale && opens(i) ? [w.id] : [])));
  const units: (Unit & { needs: Set<string> })[] = [];
  const written: { wave: Wave; needs: Set<string>; after: string }[] = [];
  const bosses: Wave[] = [];
  // Who carries each key first: the arc, a boss, or a unit by its head.
  const teacher = new Map<string, string>();
  const hold = waves.findIndex((w) => waveKeys(w).includes("the hold"));
  const beforeHold = new Set(waves.slice(0, hold === -1 ? waves.length : hold).map((w) => w.id));
  for (const [i, w] of waves.entries()) {
    if (i > finale && (w.boss || isComposed(w.id, heads))) {
      if (w.boss) for (const k of waveKeys(w)) if (!teacher.has(k)) teacher.set(k, "");
      if (w.boss) bosses.push(w);
      continue;
    }
    if (i > finale && opens(i))
      units.push({ head: w, waves: [], ...costOf(waves, i), needs: new Set() });
    const unit = units[units.length - 1];
    const owner = i <= finale || !unit ? "" : unit.head.id;
    for (const k of waveKeys(w)) if (!teacher.has(k)) teacher.set(k, owner);
    if (i <= finale || !unit) continue;
    if (regularAt(waves, i)) written.push({ wave: w, needs: new Set(), after: owner });
    else unit.waves.push(w);
  }
  const needsOf = (ws: readonly Wave[], self: string) =>
    new Set(
      ws.flatMap(waveKeys).flatMap((k) => {
        const by = teacher.get(k) ?? "";
        return by === "" || by === self ? [] : [by];
      }),
    );
  for (const u of units) u.needs = needsOf(u.waves, u.head.id);
  for (const w of written) w.needs = needsOf([w.wave], "");
  return { arc: waves.slice(0, finale + 1), units, written, bosses, beforeHold };
}

/**
 * Units taught first after the arc, in this order, whatever they cost: the
 * owner, 16 October 2026 — *after root wave of "real" i suggest after to have
 * "hollow"*. FINALE is the real pods' exam, so the husk, the pod that is a
 * lie, comes straight after it.
 */
export const FIRST_AFTER_ARC: readonly string[] = ["theHusk"];

/**
 * The unit decision 9 teaches next, after `placed`, out of `left`: one of
 * `FIRST_AFTER_ARC` while any is ready, otherwise cheapest
 * first, never a lever after a lever, a lever once enough bodies have come
 * since the last one to spread the rest evenly, and only once every unit it
 * needs is placed. Ties keep the order they came in; the arc ends on a body.
 * A unit in `refused` is passed over — one the composer could not fill here
 * (`waves:order`), which waits for the next place.
 */
export function pickNext(
  left: readonly Unit[],
  placed: readonly Unit[],
  refused: ReadonlySet<string> = new Set(),
): Unit | undefined {
  const done = new Set(placed.map((u) => u.head.id));
  // A stable sort: equal costs keep their order.
  const ready = [...left]
    .sort((a, b) => a.cost - b.cost)
    .filter((u) => !refused.has(u.head.id) && [...u.needs].every((n) => done.has(n)));
  const first = FIRST_AFTER_ARC.flatMap((id) => ready.filter((u) => u.head.id === id))[0];
  if (first) return first;
  const lever = (placed[placed.length - 1]?.kind ?? "body") !== "body";
  let since = 0;
  while (since < placed.length && placed[placed.length - 1 - since]?.kind === "body") since++;
  const body = ready.find((u) => u.kind === "body");
  const next = ready.find((u) => u.kind !== "body");
  const bodies = left.filter((u) => u.kind === "body").length;
  const due = since >= Math.ceil(bodies / (left.length - bodies + 1));
  return lever && body ? body : !lever && next && due ? next : ready[0];
}

/** The units in the order decision 9 teaches them, nothing refused. */
export function teachingOrder(units: readonly Unit[]): Unit[] {
  const left = [...units];
  const out: Unit[] = [];
  while (left.length > 0) {
    const pick = pickNext(left, out);
    if (!pick) throw new Error(`nothing ready: ${left.map((u) => u.head.id).join(", ")}`);
    left.splice(left.indexOf(pick), 1);
    out.push(pick);
  }
  return out;
}

/** A wave on STANDARD 5 after the hold is taught, put on the full panel. */
function fullPanel(wave: Wave): Wave {
  if (wave.boss || controlSet(wave.controls).id !== "standard5") return wave;
  const { controls: _c, ...rest } = wave;
  return rest;
}

/**
 * The waves a unit adds to the list, placed after `placed`: the unit's own,
 * then each hand-written regular wave whose needs it completes — or, needing
 * nothing past the arc, that shipped behind it. Once the hold is taught
 * (`list` carries it), a wave that shipped on STANDARD 5 before it is played
 * on the full panel, so the hold is never taken away again.
 */
export function unitWaves(
  cur: Curriculum,
  unit: Unit,
  placed: readonly Unit[],
  list: readonly Wave[],
): Wave[] {
  const done = new Set([...placed, unit].map((u) => u.head.id));
  const behind = cur.written.filter((w) =>
    w.needs.size === 0
      ? w.after === unit.head.id
      : w.needs.has(unit.head.id) && [...w.needs].every((n) => done.has(n)),
  );
  let hold = list.some((w) => waveKeys(w).includes("the hold"));
  const out: Wave[] = [];
  for (const w of [...unit.waves, ...behind.map((b) => b.wave)]) {
    out.push(hold && cur.beforeHold.has(w.id) ? fullPanel(w) : w);
    hold ||= waveKeys(w).includes("the hold");
  }
  return out;
}

/** The list in teaching order, with nothing composed and no boss after the
 * arc: the arc, then each unit's waves (`unitWaves`). */
export function teachingList(cur: Curriculum, order: readonly Unit[]): Wave[] {
  let out = [...cur.arc];
  for (const [i, u] of order.entries())
    out = [...out, ...unitWaves(cur, u, order.slice(0, i), out)];
  return out;
}
