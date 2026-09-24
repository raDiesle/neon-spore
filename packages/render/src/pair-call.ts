import {
  type BatonState,
  batonLandTick,
  type DiastoleState,
  diastoleClampHolds,
  liftTogetherUntil,
  NO_LIFT,
  type SimConfig,
  type SurgeState,
  surgeHeld,
  type TasterState,
  tasterPried,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawInstarBanner } from "./instar-word.js";
import type { Layout } from "./layout.js";

/**
 * **The second seat's clock, on every boss that has one.**
 *
 * The owner, 20 September 2026: *for any in-game action which requires one
 * player to hit a specific point in time related to the other player's
 * action, it should show text and visual for when is the right point in time
 * for the other player to act… this is a generic rule for bosses with
 * choreographed state actions.* THE INSTAR said it first (`instar-call.ts`);
 * this is the same line for the rest.
 *
 * **A coupling is a rule that judges one seat's act against when the other
 * seat acted**, not against the beat. The choreographed bosses were read for
 * that shape on 23 September 2026, and these are the ones that have it:
 *
 * - **THE TASTER** — his carry prises the interlock, and her beam reaches the
 *   body only for `tasterPryBeats` after it (`tasterPried`).
 * - **THE DIASTOLE** — his clamp holds the right chamber, and her beam lands
 *   only inside its window (`diastoleClampHolds`).
 * - **THE BATON** — his launch puts a bead in the air, and her shot has to
 *   meet it before it lands (`batonLandTick`); unstruck, the socket relights.
 * - **THE SURGE** — the first thumb off starts a
 *   beat, and the second has to lift inside it (`liftTogetherUntil`).
 *
 * And the ones that do not, so nobody reads them again: THE GORGE's pry and
 * beam are both the navigator's; THE BATON's crossing is judged against
 * the beat, whoever went before; THE CAIRN,
 * THE ORRERY, THE HASP, THE GIMBAL, THE RATCHET and THE SPOOL keep world
 * clocks or ask for two hands at once, which is a live check with no moment
 * in it (`test/pair-call.test.ts` pins the silence).
 *
 * **Only the running clock is said** — the seat still out, by name, and the
 * beats it has left — because that is the one moment in each of these fights
 * that *is* a point in time. THE INSTAR also states its rule before anybody
 * has acted, and it can because its window is a pose the script puts up; here
 * the moment a coupling could start is whenever the first seat chooses, and a
 * line standing over the whole fight waiting for it would be a line nobody
 * reads by the time it matters.
 *
 * **The same sentence on both screens**, for `instar-call.ts`'s reason
 * (`docs/decisions.md` #34): it names who and how long, never what, and the
 * verb stays on the cue in the seat that owns it.
 */

/** What a seat is called out loud, which is what the pair calls each other. */
export function seatCalled(seat: 1 | 2): string {
  return seat === 1 ? "P1" : "P2";
}

export interface PairCall {
  /** The grammar line, over the sentence. */
  kind: string;
  /** The sentence itself. */
  word: string;
}

/**
 * The running clock as a pair hears it: the seat by name, and the whole beats
 * still standing, never fewer than one while the window is open.
 */
export function nowCall(who: string, beatsLeft: number): PairCall {
  const beats = Math.max(1, Math.ceil(beatsLeft));
  return { kind: `${who} NOW`, word: `${beats} ${beats === 1 ? "BEAT" : "BEATS"} LEFT` };
}

/** Whose clock is running, and how many beats of it are left. */
interface Waiting {
  seat: 1 | 2;
  left: number;
}

function taster(t: TasterState, cfg: SimConfig, beat: number, phase: number): Waiting | null {
  if (!tasterPried(t, beat, cfg)) return null;
  return { seat: 2, left: t.pryBeat + cfg.tasterPryBeats - (beat + phase) };
}

function diastole(b: DiastoleState, beat: number, phase: number): Waiting | null {
  if (b.phase !== "alone" || !diastoleClampHolds(b, beat)) return null;
  return { seat: 2, left: b.clampUntil - (beat + phase) };
}

/** The unstruck bead of the pass that lands first — the one her shot is owed to. */
function baton(b: BatonState, cfg: SimConfig, tick: number): Waiting | null {
  if (b.stage !== "passing") return null;
  let land = Number.POSITIVE_INFINITY;
  for (const bead of b.beads) {
    if (!bead.flying || bead.struck || bead.final) continue;
    land = Math.min(land, batonLandTick(cfg, bead));
  }
  if (land === Number.POSITIVE_INFINITY || tick >= land) return null;
  return { seat: 2, left: (land - tick) / ticksPerBeat(cfg) };
}

/**
 * THE SURGE's lift: a first thumb off, the other
 * still down, and the tick the second one has until.
 */
function lift(
  liftTick: number,
  held: (seat: 1 | 2) => boolean,
  cfg: SimConfig,
  tick: number,
): Waiting | null {
  if (liftTick === NO_LIFT || held(1) === held(2)) return null;
  const until = liftTogetherUntil(cfg, liftTick);
  if (tick > until) return null;
  return { seat: held(1) ? 1 : 2, left: (until - tick) / ticksPerBeat(cfg) };
}

function surge(s: SurgeState, cfg: SimConfig, tick: number): Waiting | null {
  return lift(s.liftTick, (seat) => surgeHeld(s, seat), cfg, tick);
}

function waiting(world: World, phase: number): Waiting | null {
  const boss = world.boss;
  const cfg = world.cfg;
  switch (boss?.kind) {
    case "taster":
      return taster(boss, cfg, world.beat, phase);
    case "diastole":
      return diastole(boss, world.beat, phase);
    case "baton":
      return baton(boss, cfg, world.tick);
    case "surge":
      return surge(boss, cfg, world.tick);
    default:
      return null;
  }
}

/**
 * The line for this frame, or `null` where no seat is on the other's clock.
 * THE INSTAR is not here: its call is drawn with its marks (`instar-call.ts`).
 */
export function pairCall(world: World, beatPhase: number): PairCall | null {
  const w = waiting(world, beatPhase);
  return w === null ? null : nowCall(seatCalled(w.seat), w.left);
}

/** Where the line stands: THE INSTAR's place, clear of the hull. */
export const PAIR_CALL_ABOVE_HULL_TILES = 1.6;

export function drawPairCall(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  const call = pairCall(world, beatPhase);
  if (call === null) return;
  // Bright on both screens: the line is the pair's, not either seat's.
  const y = l.hullY - l.tile * PAIR_CALL_ABOVE_HULL_TILES;
  drawInstarBanner(ctx, l, call.word, y, true, call.kind);
}
