import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshHydra,
  type HydraState,
  type HydraStep,
  hydraHeadOf,
  hydraLeft,
  hydraLitStep,
  hydraMawCol,
  hydraNext,
  hydraSideCol,
} from "./hydra.js";
import { closeSlow, openSlow } from "./slow.js";
import { MILLI, type World } from "./world.js";

/**
 * THE HYDRA's clock: the body coming in, each level's heads coming for the
 * ship, an eye opening and blinking shut, a maw opening, the body rearing
 * back between levels, and a level run out striking the hull.
 *
 * The cut, the coil and the eye are heard on the tick (`hydra-hand.ts`) and a
 * shot where it leaves the field (`hydra-shot.ts`); each stops its head there,
 * the instant it is done, through `hydraTakes`.
 *
 * **A level's window is THE SLOW** — the owner's rule of 22 September 2026
 * for every choreographed step: opened as the heads come, shut the instant
 * the last is stopped or the time runs out. **The eyes are tapped, so they
 * get the window's fuse at the beat's own rate** (the owner, 6 October 2026,
 * on THE GOVERNOR: *apply no slow if tap control is required*).
 */

export function installHydra(world: World, steps: readonly HydraStep[]): HydraState {
  const s = freshHydra(world.beat, steps);
  world.events.push({ type: "hydraEnter", col: midCol(world.cfg) });
  return s;
}

/** One beat of THE HYDRA: heads come, an eye blinks, a level runs out, the body sinks away. */
export function stepHydra(world: World, s: HydraState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.hydraSpentBeats) {
      world.events.push({ type: "hydraOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.hydraEnterBeats) light(world, s);
  else if (s.phase === "rear" && since >= cfg.hydraRearBeats) light(world, s);
  else if (s.phase === "heads") {
    const step = hydraLitStep(s);
    if (step !== null && since >= step.beats) strike(world, s, step);
    else blink(world, s);
  }
}

/**
 * The next level's heads come, every one of them. A thumb still down from
 * before keeps nothing: what it cuts or turns is counted from its next press.
 */
function light(world: World, s: HydraState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "heads";
  s.phaseBeat = world.beat;
  s.goneMask = 0;
  s.cutMilli = [0, 0];
  s.spent = [s.down[0], s.down[1]];
  s.turning = [false, false];
  s.unwoundMilli = [0, 0];
  s.lidOpen = [false, false];
  s.blinkBeat = [-1, -1];
  world.events.push({ type: "hydraHeads", head: step.head, col: midCol(world.cfg) });
  openSlow(world, step.beats + 1, "ask", step.head === "eye" ? MILLI : world.cfg.slowRateMilli);
  if (step.head === "eye") {
    open(world, s, 0);
    open(world, s, 1);
  }
  if (step.head === "maw") mawOpens(world, s);
}

/** A side's next eye opens, for `hydraStareBeats`. */
function open(world: World, s: HydraState, seat: 0 | 1): void {
  const i = hydraHeadOf(s, seat);
  if (i < 0) return;
  s.lidOpen[seat] = true;
  s.blinkBeat[seat] = world.beat + world.cfg.hydraStareBeats;
  world.events.push({ type: "hydraOpen", seat, piece: i, col: hydraSideCol(world, seat) });
}

/** An `eye` level's beat: an eye left open too long blinks shut, and one shut long enough opens. */
function blink(world: World, s: HydraState): void {
  if (hydraLitStep(s)?.head !== "eye") return;
  for (const seat of [0, 1] as const) {
    const i = hydraHeadOf(s, seat);
    if (i < 0 || s.blinkBeat[seat] < 0 || world.beat < s.blinkBeat[seat]) continue;
    if (!s.lidOpen[seat]) {
      open(world, s, seat);
      continue;
    }
    s.lidOpen[seat] = false;
    s.blinkBeat[seat] = world.beat + world.cfg.hydraBlinkBeats;
    world.events.push({ type: "hydraBlink", seat, piece: i, col: hydraSideCol(world, seat) });
  }
}

/** The next maw still shut opens, fire in it. */
function mawOpens(world: World, s: HydraState): void {
  const i = hydraNext(s);
  if (i >= 0) world.events.push({ type: "hydraMaw", piece: i, col: hydraMawCol(world, s, i) });
}

/**
 * The level ran out with a head still coming: that head strikes the hull —
 * the bite lands, the coil crushes, the eye's stare burns, the maw's fire
 * comes down — and the wave is lost (`bossStrikesHull`). One strike, because
 * one is the wave.
 */
function strike(world: World, s: HydraState, step: HydraStep): void {
  closeSlow(world);
  s.phase = "struck";
  s.phaseBeat = world.beat;
  let piece = -1;
  let col = midCol(world.cfg);
  if (step.head === "maw") {
    piece = hydraNext(s);
    col = hydraMawCol(world, s, piece);
  } else {
    for (const seat of [0, 1] as const) {
      piece = hydraHeadOf(s, seat);
      if (piece < 0) continue;
      col = hydraSideCol(world, seat);
      break;
    }
  }
  world.events.push({ type: "hydraStrike", head: step.head, piece, col });
  bossStrikesHull(world, s.kind, col, 0, step.head);
}

/**
 * Head `i` of the lit level is stopped. The level's last ends the level, and
 * the script's last the fight. An eye stopped lets its side's next one open
 * after a blink; a maw quenched opens the next.
 */
export function hydraTakes(world: World, s: HydraState, i: number): void {
  const step = hydraLitStep(s);
  if (step === null) return;
  s.goneMask |= 1 << i;
  s.pieces += 1;
  if (hydraLeft(s) > 0) {
    if (step.head === "maw") mawOpens(world, s);
    return;
  }
  closeSlow(world);
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.lidOpen = [false, false];
  s.blinkBeat = [-1, -1];
  const col = midCol(world.cfg);
  world.events.push({ type: "hydraCleared", head: step.head, col });
  if (s.cursor < s.steps.length) {
    s.phase = "rear";
    return;
  }
  s.phase = "spent";
  world.events.push({ type: "hydraSpent", col });
}

/** An eye tapped shut: the side's next opens after a blink. */
export function hydraEyeShut(world: World, s: HydraState, seat: 0 | 1): void {
  s.lidOpen[seat] = false;
  s.blinkBeat[seat] = world.beat + world.cfg.hydraBlinkBeats;
}
