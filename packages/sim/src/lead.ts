import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE LEAD: where it will be.
 *
 * **The question no other boss asks** — *not where a thing is, but where it
 * will be when the shot arrives.* A body paces the top of the field, one
 * column a beat, turning at the walls, with a **stalk** standing out of it
 * that **leans** the way it is about to go. A shot that leaves the top of the
 * field spends `leadFlightBeats` in the air above it before it is **judged**
 * against the body's column on that beat; it takes a segment off the stalk
 * if the body is there and is a **miss** if not — and on a beat every judged
 * shot missed, the body **doubles back**, so the pair's next sum starts from
 * the other direction. Player 2 is shown the column and never the lean;
 * player 1 is shown the lean and never the column — *her column plus his
 * direction times the pace times the flight*, and the lead is a number they
 * say (`docs/spec/bosses-choreographed.md` §11; the split is the look's,
 * `render/view-role-clocks.ts`).
 *
 * **Health is the stalk**, `leadSegments` long, one segment a hit and one
 * hit a beat at most. From `leadFastSegments` left it **runs**,
 * `leadFastCols` a beat, and drops a torch behind itself and a rock in the
 * column a shot has to be put in, on a cadence; from `leadForecastSegments`
 * the lean stops saying where it goes next beat and says where it goes the
 * beat after — the wall turn a beat early. With one segment left it
 * **stops dead**, stalk upright and nothing able to touch it, for
 * `leadStillBeats`, and then makes a **pass** toward the farther wall at
 * `leadPassCols` a beat that only **the beam standing in its column** ends:
 * a pass that reaches the wall is another still and a pass back, and a
 * beam short of `leadStillFills` stops it dead where it met it, another still
 * again. THE SLOW is open from the beat it stops to the beat the pass ends.
 *
 * **The still is the one state a hand may reach into** (`lead-hand.ts`).
 * While it stands there, the navigator's thumb on the stalk keeps it
 * standing — the fuse does not burn — and it passes the beat she lets go.
 * Every other state refuses a hand for the reason the design gives:
 * `grippable.ts` refuses a hand on a boss body because a hand on a body
 * would steer every shot into it, and steering is what this boss is. The
 * still is the hole in that argument — `leadShootable` is false there and
 * `lead-shot.ts` registers no flight at all — so a thumb on the stalk can
 * steer nothing, and the only thing it has to give is **time**.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it is
 * among the creatures, no hand takes hold of it, and the arrivals under it
 * are the wave's own until it runs.
 *
 * The clock is `lead-step.ts`, the shot that leaves the top `lead-shot.ts`,
 * the fingerprint `lead-hash.ts`, the numbers `config-lead.ts`. This file is
 * the shape and the questions asked of it.
 */

/** One shot in the air above the field, waiting to be judged. */
export interface LeadFlight {
  /** The column it left the top of the field by. */
  col: number;
  /** The beat it is judged against the body on. */
  dueBeat: number;
}

/** Everything THE LEAD remembers between beats. */
export interface LeadState {
  kind: "lead";
  /** The column the body stands over. */
  col: number;
  /** The way it moves on its next beat. */
  dir: -1 | 1;
  /** What the stalk says: the way it goes next beat, or the beat after, or nothing while still. Only the pilot is shown it. */
  lean: -1 | 0 | 1;
  /** Segments left on the stalk. One is the last movement; zero is the end. */
  segments: number;
  /** Shots in the air above the field, oldest first (`lead-shot.ts`). */
  flights: LeadFlight[];
  /** `world.beat` it stopped dead on; `-1` while it moves. */
  stillBeat: number;
  /** `world.beat` the current pass began on; `-1` while it is not passing. */
  passBeat: number;
  /** `world.beat` the beam took the last segment on; `-1` while it stands. */
  downBeat: number;
  /** `world.beat` the navigator's thumb went on the stalk; `-1` while nothing holds it. */
  heldBeat: number;
  /** `world.beat` the stalk was let go of or tore free on; `-1` until one of those happens in this still. */
  freeBeat: number;
  /** Beams that have met a pass, of `leadStillFills`. */
  stillFills: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function leadBoss(world: World): LeadState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "lead" ? boss : null;
}

/** Whether it is stopped dead: one segment left and no pass under way. */
export function leadStill(s: LeadState): boolean {
  return s.stillBeat >= 0 && s.passBeat < 0 && s.downBeat < 0;
}

/** Whether a thumb is on the stalk, holding it where it stands. */
export function leadHolding(s: LeadState): boolean {
  return s.heldBeat >= 0;
}

/** Whether the stalk is there to be taken: it stands still, and no thumb has been on it this still. A hand is refused once it has been let go of, so letting go is the decision it is meant to be. */
export function leadGrippable(s: LeadState): boolean {
  return leadStill(s) && !leadHolding(s) && s.freeBeat < 0;
}

/** Whether a thumb has held past `leadHoldBeats` and the stalk tears out from under it. */
export function leadTorn(s: LeadState, beat: number, cfg: SimConfig): boolean {
  return leadHolding(s) && beat - s.heldBeat >= cfg.leadHoldBeats;
}

/** Whether it is on its last pass, the one the beam ends. */
export function leadPassing(s: LeadState): boolean {
  return s.passBeat >= 0 && s.downBeat < 0;
}

/** Whether it is down to the segment only the beam can take — the last one, which is not a number anyone tunes. */
export function leadLast(s: LeadState): boolean {
  return s.segments <= LAST_SEGMENT;
}

/** The one segment the beam takes. */
const LAST_SEGMENT = 1;

/** Whether an ordinary shot can take a segment now: paces, with more than the last on the stalk. */
export function leadShootable(s: LeadState): boolean {
  return !leadLast(s) && s.downBeat < 0;
}

/** Whether it runs — the fast pace, the torch behind and the rock ahead. */
export function leadRunning(s: LeadState, cfg: SimConfig): boolean {
  return leadShootable(s) && s.segments <= cfg.leadFastSegments;
}

/** Whether the lean says the beat after next rather than the next. */
export function leadForecasts(s: LeadState, cfg: SimConfig): boolean {
  return leadShootable(s) && s.segments <= cfg.leadForecastSegments;
}

/** Columns it moves a beat, now. */
export function leadPace(s: LeadState, cfg: SimConfig): number {
  if (leadLast(s)) return cfg.leadPassCols;
  return leadRunning(s, cfg) ? cfg.leadFastCols : cfg.leadPaceCols;
}

/** Where a body at `col` facing `dir` is after one beat at `pace`, and the way it faces then: it stops at a wall and turns there. */
export function leadWalk(
  col: number,
  dir: -1 | 1,
  pace: number,
  cfg: SimConfig,
): { col: number; dir: -1 | 1 } {
  const last = cfg.cols - 1;
  const to = Math.max(0, Math.min(last, col + dir * pace));
  const turned: -1 | 1 = to === 0 ? 1 : to === last ? -1 : dir;
  return { col: to, dir: turned };
}

/** Where it is `ahead` beats from now at its pace, walls and all, and the way it faces then. */
export function leadAhead(
  s: LeadState,
  cfg: SimConfig,
  ahead: number,
): { col: number; dir: -1 | 1 } {
  let at = { col: s.col, dir: s.dir };
  for (let i = 0; i < ahead; i++) at = leadWalk(at.col, at.dir, leadPace(s, cfg), cfg);
  return at;
}

/** The way it will be moving `ahead` beats from now — what the stalk leans. */
export function leadHeading(s: LeadState, cfg: SimConfig, ahead: number): -1 | 1 {
  return leadAhead(s, cfg, ahead).dir;
}

/** The column a shot leaving the top of the field this beat has to be put in — where the body is on the beat it is judged. */
export function leadAim(s: LeadState, cfg: SimConfig): number {
  return leadAhead(s, cfg, cfg.leadFlightBeats).col;
}

/** The column a shot *pressed* this beat has to be put in: the beat it climbs the field, then the beats it hangs above it — the pair's sum. */
export function leadLead(s: LeadState, cfg: SimConfig): number {
  return leadAhead(s, cfg, cfg.leadFlightBeats + 1).col;
}

/** The way a pass from `col` goes: toward the farther wall, the middle going right. */
export function leadPassDir(col: number, cfg: SimConfig): -1 | 1 {
  return col <= midCol(cfg) ? 1 : -1;
}

/** Whether a body that moved from `from` to `to` this beat went through `col`. */
export function leadCrossed(from: number, to: number, col: number): boolean {
  return col >= Math.min(from, to) && col <= Math.max(from, to);
}

/**
 * **THE SLOW over the ask**: open from now for `wait` beats of still and the
 * longest pass after them, and shut by whichever ends the pass first — the
 * beam (`leadMet`) or the wall, which opens it again (`docs/decisions.md` #33).
 */
export function leadAsk(world: World, wait: number): void {
  const cfg = world.cfg;
  openSlow(world, wait + Math.ceil((cfg.cols - 1) / cfg.leadPassCols) + 1);
}
