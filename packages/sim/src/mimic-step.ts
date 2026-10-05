import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { freshMimic, type MimicState, type MimicStep, mimicStep, mimicTiles } from "./mimic.js";
import { mimicFrame } from "./mimic-frame.js";
import { mimicShapesOfSize } from "./mimic-shapes.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * THE MIMIC's clock, once a beat: the slap into shape, a picture's window and
 * its change, the mottle and the reach after it, the flinch, the roll, the
 * core's window, the clench, and the fall.
 *
 * The brush and the taps are heard on the tick (`mimic-hand.ts`), and call
 * back in here.
 *
 * **Every picture is picked by the seeded `Rng`** from the pictures that
 * fill its step's frame, less the one the half wore last and the one the
 * other half wears now; where it stands is the frame's, never picked
 * (`mimic-frame.ts`). The fight climbs by the frame the wave authors.
 *
 * **No SLOW** — the owner, 5 October 2026, *but no slow here*: the field's
 * colour split was the slow's, and it ringed every tile red and green. The
 * windows are authored long in plain beats instead, and the fuse that
 * counts them is drawn from the step, not from a window.
 */

export function installMimic(world: World, steps: readonly MimicStep[]): MimicState {
  world.events.push({ type: "mimicEnter", col: midCol(world.cfg) });
  return freshMimic(world.beat, steps, mimicTiles(world));
}

export function stepMimic(world: World, s: MimicState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  const col = midCol(cfg);
  if (s.phase === "spent") {
    if (since >= cfg.mimicSpentBeats) {
      world.events.push({ type: "mimicOut", col });
      world.boss = null;
    }
    return;
  }
  const step = mimicStep(s);
  if (s.phase === "entering" && since >= cfg.mimicEnterBeats) next(world, s);
  else if (s.phase === "peeled" && since >= cfg.mimicPeelBeats) next(world, s);
  else if (s.phase === "clench" && since >= cfg.mimicClenchBeats) next(world, s);
  else if (s.phase === "mimicking" && since >= cfg.mimicMimicBeats) reach(world, s);
  else if (s.phase === "rolling" && since >= (step?.beats ?? 0)) {
    s.cursor += 1;
    next(world, s);
  } else if (s.phase === "sign" && step !== null) sign(world, s, step, since);
  else if (s.phase === "core" && step !== null && since >= step.beats) closed(world, s);
}

/** A beat of a picture's window: the change, then the window run out. */
function sign(world: World, s: MimicState, step: MimicStep, since: number): void {
  if (step.changes && !s.changed && since >= world.cfg.mimicChangeBeats) {
    s.changed = true;
    for (const seat of [1, 2] as const) {
      const i = seat - 1;
      if (s.signs[i] === -1 || s.peeled[i]) continue;
      place(world, s, step, seat, [s.signs[i] ?? -1, s.signs[1 - i] ?? -1]);
    }
    world.events.push({
      type: "mimicChange",
      signs: [s.signs[0], s.signs[1]],
      col: midCol(world.cfg),
    });
  }
  if (since < step.beats) return;
  world.events.push({ type: "mimicLapse", col: midCol(world.cfg) });
  mimicry(world, s);
}

/**
 * The picture `side` painted is exact: that half peels, every arm draws back
 * up a step, and the step is done once each half that asked has peeled.
 * Called by the tap that finished it (`mimic-hand.ts`).
 */
export function mimicPeeled(world: World, s: MimicState, side: 0 | 1): void {
  const sign = s.signs[side] ?? -1;
  s.peeled[side] = true;
  s.peels += 1;
  s.reaches = Math.max(0, s.reaches - 1);
  world.events.push({
    type: "mimicPeel",
    side,
    sign,
    at: s.origins[side] ?? 0,
    peels: s.peels,
    col: midCol(world.cfg),
  });
  const owed = ([0, 1] as const).some((i) => s.signs[i] !== -1 && !s.peeled[i]);
  if (owed) return;
  s.cursor += 1;
  s.phase = "peeled";
  s.phaseBeat = world.beat;
}

/** The skin left mottled. */
function mimicry(world: World, s: MimicState): void {
  s.phase = "mimicking";
  s.phaseBeat = world.beat;
}

/** The mimicry over: an arm reaches a step down, the last of a movement's the hull, and the step again. */
function reach(world: World, s: MimicState): void {
  const col = midCol(world.cfg);
  s.reaches += 1;
  world.events.push({ type: "mimicReach", reaches: s.reaches, col });
  if (s.reaches >= world.cfg.mimicReaches) {
    s.reaches = 0;
    bossStrikesHull(world, "mimic", col);
  }
  const step = mimicStep(s);
  if (step !== null) surface(world, s, step);
}

/** The core's window run out: the skin closes over it, and the split before it comes back. */
function closed(world: World, s: MimicState): void {
  world.events.push({ type: "mimicClose", col: midCol(world.cfg) });
  s.cursor = Math.max(0, s.cursor - 1);
  next(world, s);
}

/** The core tapped: the mimic clenches and the cursor moves on. Called by the tap. */
export function mimicClenched(world: World, s: MimicState): void {
  s.cursor += 1;
  s.phase = "clench";
  s.phaseBeat = world.beat;
}

/** The next step: a picture, a split, the core, a roll, or, with none, the mimic spent. */
function next(world: World, s: MimicState): void {
  const step = mimicStep(s);
  const col = midCol(world.cfg);
  s.phaseBeat = world.beat;
  if (step === null) {
    s.phase = "spent";
    s.signs = [-1, -1];
    world.events.push({ type: "mimicSpent", col });
    return;
  }
  if (step.ask === "roll") {
    s.phase = "rolling";
    s.reaches = 0;
    s.signs = [-1, -1];
    world.events.push({ type: "mimicRoll", col });
    return;
  }
  if (step.ask === "core") {
    s.phase = "core";
    s.signs = [-1, -1];
    world.events.push({ type: "mimicCore", col });
    return;
  }
  surface(world, s, step);
}

/** A picture, or two, put up on a bare board. */
function surface(world: World, s: MimicState, step: MimicStep): void {
  const old: [number, number] = [s.signs[0] ?? -1, s.signs[1] ?? -1];
  s.phase = "sign";
  s.phaseBeat = world.beat;
  s.changed = false;
  s.peeled = [false, false];
  s.signs = [-1, -1];
  s.paint.fill(0);
  for (const seat of [1, 2] as const) {
    const draws = step.ask === "split" || seat !== step.reader;
    if (draws) place(world, s, step, seat, [old[seat - 1] ?? -1, s.signs[2 - seat] ?? -1]);
  }
  world.events.push({ type: "mimicSign", signs: [s.signs[0], s.signs[1]], col: midCol(world.cfg) });
}

/**
 * Seat `seat`'s picture, by the seeded `Rng`: one that fills the step's
 * frame and is never one of `avoid`, standing in that frame.
 */
function place(
  world: World,
  s: MimicState,
  step: MimicStep,
  seat: 1 | 2,
  avoid: readonly number[],
): void {
  const fits = mimicShapesOfSize(step.size);
  const free = fits.filter((i) => !avoid.includes(i));
  const pool = free.length > 0 ? free : fits;
  const frame = mimicFrame(world.cfg, step, seat);
  const i = seat - 1;
  s.signs[i] = pool[nextInt(world.rng, pool.length)] ?? 0;
  s.origins[i] = frame.col + frame.row * world.cfg.cols;
}
