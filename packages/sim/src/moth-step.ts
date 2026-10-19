import { bossStrikesHull } from "./boss-strike.js";
import { broodSpawnBody } from "./brood-lay.js";
import { midCol } from "./config.js";
import {
  freshMoth,
  type MothBellyStep,
  type MothState,
  type MothStep,
  type MothWingsStep,
  mothClampCentre,
  mothLitStep,
  mothSeesLight,
} from "./moth.js";
import { nextInt } from "./rng.js";
import { occupiesCol } from "./span.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MOTH's clock — fluttering in, a step lit, following or fleeing the
 * light, sinking and landing, resting between steps, and the beats after the
 * last. What a bolt does to it is `moth-shot.ts`.
 *
 * **No step opens THE SLOW**, THE BROOD's argument (`brood-step.ts`): the
 * field round the moth is the ordinary field, and a slick it sheds is an
 * ordinary body falling. A spot's window is the moth's own notice — four
 * beats from the cannon stopping — and a belly's is its sinking, six; both
 * are learnt by watching it, and a slowed field would teach a fall no other
 * wave has.
 */

export function installMoth(world: World, steps: readonly MothStep[]): MothState {
  const s = freshMoth(world, steps);
  world.events.push({ type: "mothEnter", col: midCol(world.cfg) });
  return s;
}

/** One beat of THE MOTH. */
export function stepMoth(world: World, s: MothState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  look(world, s);
  if (s.phase === "spent") {
    if (since >= cfg.mothSpentBeats) {
      world.events.push({ type: "mothOut", col: s.centre });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter") {
    if (since >= cfg.mothEnterBeats) light(world, s);
    return;
  }
  if (s.phase === "rest") {
    if (since >= cfg.mothRestBeats) light(world, s);
    return;
  }
  const step = mothLitStep(s);
  if (step === null) return;
  if (step.kind === "wings") shed(world, s, step);
  if (s.centre === world.cannonCol && mothSeesLight(world, s)) sink(world, s, step);
  else if (step.kind === "wings") drift(world, s);
  else hop(world, s, step);
}

/** Where the cannon stands, and since when: the moth only turns to a still light. */
function look(world: World, s: MothState): void {
  if (world.cannonCol === s.seenCol) return;
  s.seenCol = world.cannonCol;
  s.seenBeat = world.beat;
  // The light moved out from under it: it breaks off and rises.
  if (s.settle > 0 && s.centre !== world.cannonCol) s.settle = 0;
}

/** The next step lights: its spots on the wings, or its belly ready to open. */
function light(world: World, s: MothState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "flit";
  s.phaseBeat = world.beat;
  s.spots = step.kind === "wings" ? [...step.spots] : [];
  s.hits = 0;
  s.settle = 0;
  s.flitBeat = world.beat;
  world.events.push({ type: "mothStep", col: s.centre, step: s.cursor });
}

/** It hangs over a still cannon and sinks; sunk all the way, it lands on it. */
function sink(world: World, s: MothState, step: MothStep): void {
  s.settle += 1;
  if (s.settle === 1) world.events.push({ type: "mothSettle", col: s.centre });
  if (s.settle < world.cfg.mothLandBeats) return;
  s.landed += 1;
  s.settle = 0;
  world.events.push({ type: "mothLand", col: s.centre });
  bossStrikesHull(world, "moth", s.centre, world.cfg.mothRow, "land");
  if (step.kind === "belly") mothFlee(world, s);
}

/** A light still long enough draws it a column nearer, at its own pace. */
function drift(world: World, s: MothState): void {
  const cfg = world.cfg;
  if (!mothSeesLight(world, s)) return;
  if (world.beat - s.flitBeat < cfg.mothDriftBeats) return;
  const to = mothClampCentre(cfg, world.cannonCol);
  if (to === s.centre) return;
  flyTo(world, s, s.centre + Math.sign(to - s.centre));
}

/** On a belly step it will not come to the light: it hops away on its own count. */
function hop(world: World, s: MothState, step: MothBellyStep): void {
  if (world.beat - s.flitBeat >= step.hopEvery) mothFlee(world, s);
}

/**
 * It flies to a new column two or more from where it was and not over the
 * cannon — which of them is the seeded rng's.
 */
export function mothFlee(world: World, s: MothState): void {
  const cfg = world.cfg;
  const lo = mothClampCentre(cfg, 0);
  const hi = mothClampCentre(cfg, cfg.cols - 1);
  const free: number[] = [];
  for (let c = lo; c <= hi; c++) {
    if (Math.abs(c - s.centre) >= 2 && c !== world.cannonCol) free.push(c);
  }
  const to = free[nextInt(world.rng, Math.max(1, free.length))] ?? s.centre;
  flyTo(world, s, to);
}

function flyTo(world: World, s: MothState, to: number): void {
  const by = to - s.centre;
  s.flitBeat = world.beat;
  if (by === 0) return;
  s.centre = to;
  s.settle = 0;
  world.events.push({ type: "mothFlit", col: to, by });
}

/** A wings step's slick, shaken off a wing tip where nothing already falls near it. */
function shed(world: World, s: MothState, step: MothWingsStep): void {
  const every = step.dustEvery ?? 0;
  const since = world.beat - s.phaseBeat;
  if (every <= 0 || since <= 0 || since % every !== 0) return;
  const cfg = world.cfg;
  const row = cfg.mothRow + 1;
  const free: number[] = [];
  for (let c = s.centre - cfg.mothSpan; c <= s.centre + cfg.mothSpan; c++) {
    if (c < 0 || c >= cfg.cols || c === s.centre) continue;
    if (world.creatures.some((b) => occupiesCol(b, c) && b.row <= row + 1)) continue;
    free.push(c);
  }
  if (free.length === 0) return;
  const col = free[nextInt(world.rng, free.length)] ?? s.centre;
  const color: Color = "red";
  broodSpawnBody(world, col, color, row);
  s.shed += 1;
  world.events.push({ type: "mothDust", col });
}
