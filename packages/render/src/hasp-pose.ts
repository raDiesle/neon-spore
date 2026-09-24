import {
  HASP_COUNT,
  type HaspState,
  haspBurning,
  haspHeatMilli,
  haspHeld,
  haspWorking,
  haspWoundMilli,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **How far through a pose THE HASP is**, and how far each clasp stands open
 * — the clock the door is posed off (§20, *Animation*).
 *
 * Its own page off `hasp-draw.ts` for `spool-pose.ts`'s reason: next door
 * is *what the door looks like*, and here is *where the fight has got to*,
 * read off the boss and the beat alone, so nothing is kept between frames and
 * a restart poses the row from the state (`restart.test.ts`).
 *
 * **The five poses are one number per clasp** — how far its two halves have
 * swung — plus the wheel's own turn. Sealed is nought; the wheel being wound
 * creeps the working clasp ajar; a swinging hasp eases to its rest over the
 * beats the simulation gives the swing; the row clearing takes all three
 * wider together. A pose is never cut to.
 */

/** Where an opened clasp rests while the rest of the row is still being worked. */
const AJAR = 0.55;
/** How far a wheel wound all the way has pried its own clasp before it gives. */
const CREEP = 0.14;
/** How far the whole row swings when it clears. */
const CLEAR = 1.35;
/** How many turns the hubs spin down through as the row clears. */
const SPIN_DOWN = 1.6;

/** How far through a phase the scene is, 0..1, counted from the beat it began. */
function through(s: HaspState, beats: number, beat: number, beatPhase: number): number {
  const done = (beat - s.phaseBeat + beatPhase) / Math.max(1, beats);
  return Math.min(1, Math.max(0, done));
}

/** How far up out of the dark the row has come, 0..1 — 1 everywhere but the opening still. */
export function haspStillPhase(
  s: HaspState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "still" ? through(s, cfg.haspStillBeats, beat, beatPhase) : 1;
}

/** How far the row has swung clear, 0..1; nought until the last hasp has gone. */
export function haspClearing(
  s: HaspState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "clear" ? smoothstep(through(s, cfg.haspClearBeats, beat, beatPhase)) : 0;
}

/** The clasp up to be worked, counted from the ship; `HASP_COUNT` once none is. */
export function haspWorkIndex(s: HaspState): number {
  return HASP_COUNT - s.hasps;
}

/** Whether clasp `i` has been wound open, the one swinging right now included. */
export function haspOpened(s: HaspState, i: number): boolean {
  return i < HASP_COUNT - s.hasps;
}

/**
 * **How far clasp `i` stands open**: nought sealed, `AJAR` once opened, and
 * past 1 as the row clears.
 *
 * `wound` is whether this screen is shown the winding. The creep of the
 * working clasp under a wheel being turned is the fourth standard — the
 * picture deformed by how far the answer has got — and it is the navigator's
 * alone: on the pilot's screen a clasp that crept would be the wheel he may
 * never be shown, told in the shape of the lid over it.
 */
export function haspGape(
  s: HaspState,
  cfg: SimConfig,
  i: number,
  beat: number,
  beatPhase: number,
  wound: boolean,
): number {
  if (s.phase === "clear") {
    return AJAR + (CLEAR - AJAR) * haspClearing(s, cfg, beat, beatPhase);
  }
  if (s.phase === "swing" && i === haspWorkIndex(s) - 1) {
    return AJAR * smoothstep(through(s, cfg.haspSwingBeats, beat, beatPhase));
  }
  if (haspOpened(s, i)) return AJAR;
  if (wound && haspWorking(s) && i === haspWorkIndex(s)) {
    return (CREEP * haspWoundMilli(s, cfg)) / 1000;
  }
  return 0;
}

/**
 * **Whether the working wheel is free to turn** — her whole question, and
 * the one thing her screen says about his hand without ever saying it is a
 * hand. A level, like the gate it draws (`sim/hasp.ts`, `haspHeld`).
 */
export function haspFree(s: HaspState, cfg: SimConfig): boolean {
  return haspWorking(s) && !haspBurning(s) && haspHeld(s, cfg);
}

/**
 * Where hub `i`'s spokes stand, in turns. The working wheel stands where her
 * hand has left it; an opened one where it was when it gave; and as the row
 * clears every hub spins down together, fast and then slowing, which is the
 * payoff's *wheel-hubs spinning down*.
 */
export function haspSpokeTurns(
  s: HaspState,
  cfg: SimConfig,
  i: number,
  beat: number,
  beatPhase: number,
): number {
  const own = i === haspWorkIndex(s) || haspOpened(s, i) ? s.wheelMilli / 1000 : 0;
  if (s.phase !== "clear") return own;
  const t = through(s, cfg.haspClearBeats, beat, beatPhase);
  return own + SPIN_DOWN * (1 - (1 - t) * (1 - t)) * (i % 2 === 0 ? 1 : -1);
}

/**
 * **The latch's colour**: cool rock at a fresh grip, drifting through the
 * pod's amber to ember as his hand runs out — the pilot's whole readout, and
 * the one departure from the colour statement, because it is a hand's own
 * feeling and never a target (§20, *Colour*). A burnt latch is drawn cooling
 * back from ember to dark over the burn's own beats.
 */
export function haspLatchHex(
  s: HaspState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): string {
  if (haspBurning(s)) {
    const since = (beat - s.burnBeat + beatPhase) / Math.max(1, cfg.haspBurnBeats);
    return mixHex(PALETTE.ember, PALETTE.rockDark, since);
  }
  // The simulation counts the heat in whole beats; read at the fraction of
  // this one, so the drift is a drift and not six steps. A thumb resting on
  // the latch short of the grip is not holding it, and is not warmed.
  const heat = haspHeld(s, cfg) ? haspHeatMilli(s, cfg, beat + beatPhase) / 1000 : 0;
  return heat < 0.5
    ? mixHex(PALETTE.rock, PALETTE.pod, heat * 2)
    : mixHex(PALETTE.pod, PALETTE.ember, heat * 2 - 1);
}
