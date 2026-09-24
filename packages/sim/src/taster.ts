import type { SimConfig } from "./config.js";
import { otherColor } from "./kinds.js";
import { spendLean } from "./spend.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TASTER: what you have already spent.
 *
 * **The question no other boss asks** — not *can you agree on when*, not *can
 * you stop shooting*, but *what have the two of you been leaning on for the
 * last thirty beats*. Every other fight in this game is answered inside its
 * own cycle; this one is answered out of the pair's own habits, and it is the
 * first boss in the game with a memory of the **players** rather than of
 * itself (`spend.ts`, `docs/spec/bosses-choreographed.md` §4).
 *
 * A low crested body hugs the top row with a fan of blades standing out of it,
 * one per column. **Health is the fan**: a blade struck off is gone and the
 * crest under it is soft, so the silhouette thins from wherever the pair has
 * been working and there is no bar anywhere.
 *
 * **The rule is one sentence, fixed, and inverted.** A blade grows out of the
 * crest over `tasterGrowBeats` and its colour **sets** on the last of them, to
 * whichever colour the pair has spent more of — and a blade is struck off only
 * by the colour it is **not**. Feed it its own colour and the edge thickens
 * instead, and now it takes two. So the correct play is to spend the colour you
 * do not need, which no shipped wave has ever rewarded, and the pair's sentence
 * is the flat opposite of a warding call: *you are nine red to four, give me
 * cyan for the next eight.*
 *
 * It reacts to the pair, which `docs/spec/bosses.md`'s *fixed and learnable* allows on exactly
 * two conditions and both are held here: it reads **what they spent** and never
 * how well they played — the ledger cannot tell a hit from a miss — and every
 * blade announces itself a full cycle ahead, because it stands there growing,
 * colourless, for four beats before it decides.
 *
 * The fight has five movements, read off the state rather than kept
 * (`tasterPhase`):
 *
 * - **opening** — one blade at a time, the whole rule and nothing else.
 * - **fanning**, after `tasterFanShorn` gone — `tasterFanBlades` grow at once,
 *   and they all read the same ledger, so three arrive in one colour. The
 *   pilot's thumb on a growing blade **pins** it, and it cannot decide while he
 *   holds it: `tasterPinBeats` of ledger bought at the price of a blade that
 *   comes up thick when the hold runs out.
 * - **hurrying**, after `tasterHurryShorn` — the window shortens to
 *   `tasterFastWindowBeats`, and every `tasterEdgeBeats` every standing blade
 *   **re-edges** to the current majority: a shiver along the crest, and the
 *   pair's earlier work undone unless they have cut the crest through. The
 *   navigator's thumb carried `tasterWipeMilli` across a soft column cuts it
 *   by hand — the same cut a bolt makes, and **the only one in this fight
 *   that spends no colour**.
 * - **closed**, with `tasterClosedBlades` left — the last blades interlock over
 *   the body, edged in both colours, and nothing reaches them at all until the
 *   pilot has carried the interlock `tasterPryMilli` apart. It stands open
 *   `tasterPryBeats`, and in that window `tasterPryFills` beams in the colour
 *   the ledger says the pair has spent **least** of open it.
 * - **out** — the fan unlocks outward and the boss stands `tasterOutBeats` more
 *   so the wave cannot end on the same beat.
 *
 * **Three of those are answered on the picture rather than on the panel** (the
 * §6.2 ask): the fan is the one thing both screens see whole, so it is the one
 * part of this fight either thumb can point at, and each movement asks a
 * different hand of a different seat (`taster-hand.ts`).
 *
 * **It is a fixture and not a body** (`bossFillsWave`): it falls nothing at all,
 * and the arrivals the pair answers — which are what loads the ledger in the
 * first place — are the wave's own. The clock is `taster-step.ts`, the
 * fingerprint `taster-hash.ts`, the numbers `config-taster.ts`.
 */

/** The movements, in the order render and the tests name them by. */
export const TASTER_PHASES = ["opening", "fanning", "hurrying", "closed", "out"] as const;

export type TasterPhase = (typeof TASTER_PHASES)[number];

/** One blade of the fan. */
export interface TasterBlade {
  /**
   * The colour down its edge — the colour it has grown toward, and therefore
   * the one colour that cannot break it. `null` while it is still growing.
   */
  edge: Color | null;
  /** Shots of the other colour it still takes: one, or more where its own thickened it. */
  layers: number;
  /** `world.beat` it began growing on; `-1` while it has not started. */
  growBeat: number;
  /** `world.beat` its colour last set or re-set on; `-1` while it is growing. */
  setBeat: number;
  /** Struck off. Gone for good, and the crest under it soft. */
  shorn: boolean;
}

/** Everything THE TASTER remembers between beats. */
export interface TasterState {
  kind: "taster";
  /** The leftmost column of the crest; blade `i` stands over `col + i`. */
  col: number;
  blades: TasterBlade[];
  /** Blades struck off: what moves the fight along. */
  shorn: number;
  /** Shots taken into the soft crest, where a blade used to be. */
  crest: number;
  /** `world.beat` the crest opened for good on; `-1` while the fan can re-edge. */
  liftBeat: number;
  /** `world.beat` the fan last re-edged on. */
  edgeBeat: number;
  /** The blade the pilot's thumb is holding out of its decision; `-1` for none. */
  pin: number;
  /** Beats that pin has stood, spent at `tasterPinBeats`. */
  pinBeats: number;
  /** The soft column the navigator's thumb is on; `-1` for none. */
  wipe: number;
  /** Whether the carry under way has already spent its cut. */
  wiped: boolean;
  /** How far the pilot has carried the interlock, in thousandths of a tile. */
  pryMilli: number;
  /** `world.beat` the interlock was prised open on; `-1` while it is shut. */
  pryBeat: number;
  /** Beams in the weak colour taken inside this pry, out at `tasterPryFills`. */
  pryFills: number;
  /** `world.beat` the beam ended it on; `-1` while it stands. */
  outBeat: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function tasterBoss(world: World): TasterState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "taster" ? boss : null;
}

/** Blades standing: grown, edged and not struck off. */
export function tasterStanding(t: TasterState): number {
  let n = 0;
  for (const k of t.blades) if (!k.shorn && k.setBeat >= 0) n += 1;
  return n;
}

/** Blades out of the crest and not yet decided. */
export function tasterGrowing(t: TasterState): number {
  let n = 0;
  for (const k of t.blades) if (!k.shorn && k.growBeat >= 0 && k.setBeat < 0) n += 1;
  return n;
}

/** Which movement the fan is in, read off what has happened to it. */
export function tasterPhase(t: TasterState, cfg: SimConfig): TasterPhase {
  if (t.outBeat >= 0) return "out";
  if (t.shorn >= t.blades.length - cfg.tasterClosedBlades) return "closed";
  if (t.shorn >= cfg.tasterHurryShorn) return "hurrying";
  if (t.shorn >= cfg.tasterFanShorn) return "fanning";
  return "opening";
}

/** The blade over `col`, or `-1` where the crest does not reach. */
export function tasterBladeAt(t: TasterState, col: number): number {
  const i = col - t.col;
  return i >= 0 && i < t.blades.length ? i : -1;
}

/**
 * How deep the window it is tasting over is, in beats — the design's *it
 * tastes faster*, which is the whole of the third movement.
 */
export function tasterWindow(t: TasterState, cfg: SimConfig): number {
  const phase = tasterPhase(t, cfg);
  return phase === "opening" || phase === "fanning"
    ? cfg.tasterWindowBeats
    : cfg.tasterFastWindowBeats;
}

/**
 * The colour the pair has been leaning on, which is the colour the next blade
 * grows in — `null` on a dead heat, which is a real answer and the one the
 * design is trying to teach (`spend.ts`).
 */
export function tasterLean(world: World, t: TasterState): Color | null {
  return spendLean(world, tasterWindow(t, world.cfg));
}

/**
 * **The colour the closed fan has never grown toward**, which is the one the
 * beam has to be in — the colour the ledger says the pair has spent least of.
 *
 * `null` on a dead heat, and that is the interesting case rather than an edge
 * one: a pair that has spent evenly has no colour it is short of, so the
 * interlock has nothing it is weak to and they have to lean *deliberately*
 * before the beam goes in. The one moment in this fight where the trap runs
 * the other way round.
 */
export function tasterWeak(world: World, t: TasterState): Color | null {
  const lean = tasterLean(world, t);
  return lean === null ? null : otherColor(lean);
}

/** Whether the crest is open under this blade: struck off, and soft. */
export function tasterSoft(t: TasterState, i: number): boolean {
  return t.blades[i]?.shorn === true;
}

/** Whether the crest has been cut through, and the fan can no longer re-edge. */
export function tasterLifted(t: TasterState): boolean {
  return t.liftBeat >= 0;
}

/**
 * The blades in the order the fan opens them: **from the middle outward**, the
 * design's own step 1.
 *
 * A pure function of the width rather than a stored cursor, for the reason
 * `throat.ts` gives about a moving mouth: a cursor has to be stepped by
 * something, and what grows a blade here is the same beat that reads the
 * ledger. The middle first is not decoration — the middle column is the one
 * the cannon starts under and the one a beam is cheapest to stand in, so the
 * fan opens where the pair is already looking and thins outward from there.
 */
export function tasterOrder(width: number): number[] {
  const out: number[] = [];
  const mid = Math.floor((width - 1) / 2);
  for (let d = 0; d < width; d++) {
    // Right of the middle before left of it, arbitrarily and consistently: the
    // two are a mirror pair and something has to go first.
    if (mid + d < width) out.push(mid + d);
    if (d > 0 && mid - d >= 0) out.push(mid - d);
  }
  return out;
}

/**
 * **Whether the interlock stands prised apart**, and therefore whether the
 * beam reaches anything at all. A pure function of the beat the carry reached
 * the bottom on, for `tasterPhase`'s reason: a flag stepped down once a beat
 * would be read by `tasterStruck` on the other side of `onBeat` from where it
 * was written, and the tick a beam lands on is what this window decides.
 */
export function tasterPried(t: TasterState, beat: number, cfg: SimConfig): boolean {
  return t.pryBeat >= 0 && beat - t.pryBeat < cfg.tasterPryBeats;
}

/**
 * **Whether the pin has run out**, which is the beat the held blade decides
 * anyway and comes up thick. One place rather than three, because the step
 * and the hand disagreeing about it would be a blade the pilot thinks he is
 * still holding (`packages/sim/test/purity.test.ts`).
 */
export function tasterPinSpent(t: TasterState, cfg: SimConfig): boolean {
  return t.pin >= 0 && t.pinBeats >= cfg.tasterPinBeats;
}
