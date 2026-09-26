import type { SimConfig } from "./config.js";
import { openSlow } from "./slow.js";
import {
  THROAT_PHASES,
  type ThroatPhase,
  type ThroatState,
  throatHomeCol,
  throatMouthCol,
  throatSnap,
  throatStride,
} from "./throat.js";
import { throatEvertBeatsLeft, throatInhales } from "./throat-clock.js";
import { throatChoked, throatFed } from "./throat-feed.js";
import { throatCinched, throatRelease } from "./throat-hand.js";
import { throatLift } from "./throat-pull.js";
import type { World } from "./world.js";

/**
 * **THE THROAT's clock**: the phase it has earned, the breath it takes and
 * the column a hand has dragged its mouth to.
 *
 * It runs on the **beat** and from `stepBoss`, because every number in this
 * fight is a count somebody says out loud: the beats to the next inhale and
 * the column the mouth will be in. A pull that happened between beats would
 * be a pull nobody could name a moment for — which is also why the two hands
 * this fight gained on 19 September 2026 are *heard* on the tick and *spent*
 * here (`throat-hand.ts`).
 *
 * What the clock finds when it arrives — the fling that chokes a ring and the
 * mouthful that re-tightens one — is `throat-feed.ts`, cut off this page the
 * same day.
 *
 * **Order inside a beat is the pair's window**, and it is the whole reason the
 * lift is not in the fall loop. `beat.ts` runs the fall, which `throatHolds`
 * has already refused for anything the throat has hold of; then this steps,
 * and it **swallows before it lifts**. A body hauled up into the mouth
 * therefore stands in it for a whole inhale before it goes down — which is
 * the window player 2 fires her colour into, and the design's step 7 is
 * nothing but that window missed.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installThroat(world: World): ThroatState {
  return {
    kind: "throat",
    phase: "still",
    phaseBeat: world.beat,
    slack: 0,
    mouthFrom: throatHomeCol(world.cfg),
    chokedBeat: -1,
    fedBeat: -1,
    cinchBeat: -1,
    breath: 0,
    haulStep: 0,
  };
}

/**
 * The phase this many slack rings has **earned**, which is not always the
 * phase the fight is in.
 *
 * `stepThroat` only ever moves forward through `THROAT_PHASES`, and that is a
 * decision rather than an oversight: a swallowed creature re-tightens a ring,
 * and a tube that un-tightened its way back to a standing mouth would undo
 * work the pair can *see* it has done. What a heal costs is rings — which is
 * to say the fight is longer than it was — and never the ground gained.
 */
export function throatPhaseFor(cfg: SimConfig, slack: number): ThroatPhase {
  if (slack >= cfg.throatRings) return "everts";
  if (slack >= cfg.throatRings - 1) return "open";
  if (slack >= 2) return "quick";
  return slack >= 1 ? "slide" : "still";
}

/**
 * One beat of the gullet: the eversion if it is beaten, then the phase it has
 * earned, then the inhale — swallow, and after that lift.
 */
export function stepThroat(world: World, b: ThroatState): void {
  const cfg = world.cfg;
  if (b.phase === "everts") {
    // The tube is through its own mouth and so is the boss. Nulled here rather
    // than on the last choke, so the picture has the whole eversion to run
    // before the wave is allowed to end under it (`bossHoldsWave`).
    if (throatEvertBeatsLeft(cfg, b, world.beat) <= 0) world.boss = null;
    return;
  }
  // A fling that arrived this beat, before the phase is read off the rings:
  // the ring it chokes is what may have just earned the eversion.
  throatChoked(world, b);
  if (advance(world, b) === "everts") {
    // The payoff, slowed: a closed contour turning through its own opening is
    // the one thing in this fight nobody may press anything during, which is
    // exactly what THE SLOW is for (`docs/decisions.md` #33).
    openSlow(world, cfg.throatEvertBeats, "show");
    // Said on the beat the last ring went slack and not on the beat the boss
    // is nulled, because the sound is the ending starting: THE SLOW is open
    // for `throatEvertBeats` after this and the pair watches the whole turn.
    world.events.push({ type: "throatEvert", col: b.mouthFrom });
    return;
  }
  // The pilot's carry, before the breath: what a haul buys is a mouth that is
  // somewhere else when the inhale lands, and a haul taken after the swallow
  // would be a column moved off an empty mouth.
  throatHaul(world, b);
  if (!throatBreathes(world, b)) return;
  // The breath itself, before what it costs: player 2 has been counting down
  // to this beat out loud, and a swallow heard in the same tick is the bill
  // arriving *after* the moment she was counting to rather than instead of it.
  world.events.push({ type: "throatInhale", col: throatMouthCol(cfg, b, world.beat) });
  throatFed(world, b);
  throatLift(world, b);
}

/**
 * **Whether the gullet actually inhales this beat**, which is the cadence and
 * the navigator's thumb together (`throat-hand.ts`).
 *
 * The grid stays a pure function of the phase (`throatInhales`) because player
 * 2's readout is drawn from it and a readout that flinched every time she
 * touched a ring would be unreadable. What her thumb changes is this: while it
 * is down the gullet does not breathe at all, and every inhale the grid would
 * have had goes onto `breath`. Held to `throatCinchBeats` the ring tears out,
 * so the freeze is bounded by a number the pair can count.
 *
 * Then the bill, one inhale a beat until it is paid — and a beat the grid was
 * going to inhale on anyway counts against it, which is what keeps the debt
 * from being immortal in `open`, where the grid is every beat.
 */
function throatBreathes(world: World, b: ThroatState): boolean {
  const cfg = world.cfg;
  if (throatCinched(b)) {
    if (!throatInhales(cfg, b, world.beat)) return false;
    b.breath = Math.min(cfg.throatCinchBeats, b.breath + 1);
    if (b.breath >= cfg.throatCinchBeats) throatRelease(world, b);
    return false;
  }
  if (b.breath <= 0) return throatInhales(cfg, b, world.beat);
  b.breath -= 1;
  return true;
}

/**
 * **The mouth dragged a column sideways**, once, on the beat after the carry
 * (`throat-hand.ts`).
 *
 * Spent whatever the phase, so a haul heard on the last beat of `open` cannot
 * sit on the state waiting for a phase that never comes — `haulStep` is in the
 * fingerprint and a pending number that outlives its phase is a number two
 * devices could spend on different beats. The move itself is refused outside
 * `open`, which is where the wire's own gate already is; this is the second
 * copy on purpose, because a command arriving from a peer is not one this
 * device's hand refused.
 *
 * `throatSnap` and not a raw clamp: the mouth has to land on a stop its own
 * stride can reach, which is `advance`'s rule said about a hand instead of
 * about a phase change.
 */
function throatHaul(world: World, b: ThroatState): void {
  const step = b.haulStep;
  b.haulStep = 0;
  if (step === 0 || b.phase !== "open") return;
  const cfg = world.cfg;
  const standing = throatMouthCol(cfg, b, world.beat);
  b.mouthFrom = throatSnap(cfg, standing + step, throatStride(cfg, b));
  // Said here and not where the carry was heard, because the column in the
  // event is the one the mouth *landed* on and `throatSnap` is what decides
  // it. A `throatHaul` pushed from the tick would have to do this arithmetic
  // a second time to know what to pan, and the second copy is the one that
  // would disagree the day the snap changes.
  world.events.push({ type: "throatHaul", col: b.mouthFrom });
}

/**
 * Forward through `THROAT_PHASES` to whatever the rings have earned, and never
 * back — `throatPhaseFor` says why. It **returns** the phase it settled on
 * rather than leaving the caller to re-read the field, because a mutation
 * narrowing cannot be seen through: the eversion has to be answered on the
 * beat the last ring choked, not the beat after.
 *
 * Every change re-anchors both clocks: `phaseBeat` is the origin the inhale is
 * counted from and the beat the mouth's travel starts at, and `mouthFrom` is
 * snapped to a stop the new stride can reach (`throatSnap`). The mouth
 * therefore never jumps — it carries on from the column it was standing in —
 * and the count starts where the pair watched the tube change.
 */
function advance(world: World, b: ThroatState): ThroatPhase {
  const cfg = world.cfg;
  const want = throatPhaseFor(cfg, b.slack);
  if (THROAT_PHASES.indexOf(want) <= THROAT_PHASES.indexOf(b.phase)) return b.phase;
  const standing = throatMouthCol(cfg, b, world.beat);
  b.phase = want;
  b.phaseBeat = world.beat;
  b.mouthFrom = throatSnap(cfg, standing, throatStride(cfg, b));
  return want;
}
