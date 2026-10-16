import { midCol, ticksPerBeat } from "./config.js";
import { NO_DUE, type Pod } from "./pod-types.js";
import { freePod } from "./pods.js";
import {
  freshSwindle,
  type SwindleState,
  type SwindleStep,
  swindleBoss,
  swindleLitStep,
  swindlePodCol,
  swindleRealAll,
  swindleRealLeft,
} from "./swindle.js";
import { MILLI, type World } from "./world.js";

/**
 * THE SWINDLE's clock: she comes in, hangs a hand, trades its pods across and
 * lets them go on their beats, rears back between hands and goes beaten.
 *
 * **A swap glides on the pod's own crossing** (`Pod.crossMilli`, THE CLAW's):
 * set on the beat it begins, so `advancePods` carries both pods a tick at a
 * time, and stopped on the beat it ends with each pod set exactly on the
 * column it was going to. A pod shot loose on the way falls the ordinary way
 * and is left out of the stop.
 *
 * What takes a pod off her is not here: it is the ordinary receipt at the maw
 * (`pod-arrive.ts`), which tells her through `swindlePodTaken` and
 * `swindleHuskRefused` on the tick.
 */

export function installSwindle(world: World, steps: readonly SwindleStep[]): SwindleState {
  const s = freshSwindle(world.beat, steps);
  world.events.push({ type: "swindleEnter", col: midCol(world.cfg), pods: swindleRealAll(s) });
  return s;
}

/** One beat of THE SWINDLE: a hand hung, a glide begun and ended, a pod let
 * go, a hand cleared, the going away. */
export function stepSwindle(world: World, s: SwindleState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.swindleSpentBeats) {
      world.events.push({ type: "swindleOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.swindleEnterBeats) hang(world, s);
  else if (s.phase === "rear" && since >= cfg.swindleRearBeats) hang(world, s);
  else if (s.phase === "hang") play(world, s, since);
}

/** The next hand is hung in a row, every pod moored and on no clock. */
function hang(world: World, s: SwindleState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "hang";
  s.phaseBeat = world.beat;
  s.swapped = 0;
  s.dropped = 0;
  s.hung = step.pods.map((p, i) => {
    const id = world.nextId++;
    world.pods.push({
      id,
      colMilli: swindlePodCol(world, step, i) * MILLI,
      rowMilli: world.cfg.swindlePodRow * MILLI,
      driftMilli: 0,
      loose: false,
      kind: p.kind,
      dueTicks: NO_DUE,
      crossMilli: 0,
    });
    return id;
  });
  world.events.push({ type: "swindleHang", col: midCol(world.cfg), pods: step.pods.length });
}

/** A beat of the hand: the glide ended, the next begun, the pods let go, and
 * the hand cleared once nothing of it is left on the field. */
function play(world: World, s: SwindleState, since: number): void {
  const step = swindleLitStep(s);
  if (step === null) return;
  if (s.glide.length > 0 && since >= s.glideEnd) endGlide(world, s);
  for (let w = step.swaps[s.swapped]; w !== undefined && w.at <= since; w = step.swaps[s.swapped]) {
    if (s.glide.length > 0) break;
    s.swapped += 1;
    beginGlide(world, s, w.a, w.b, since);
  }
  for (let d = step.drops[s.dropped]; d !== undefined && d.at <= since; d = step.drops[s.dropped]) {
    s.dropped += 1;
    const pod = hungPod(world, s, d.pod);
    if (pod === undefined || pod.loose) continue;
    pod.crossMilli = 0;
    freePod(world, pod);
    world.events.push({ type: "swindleDrop", col: colOf(pod), piece: d.pod });
  }
  if (s.hung.some((id) => world.pods.some((p) => p.id === id))) return;
  world.events.push({ type: "swindleCleared", col: midCol(world.cfg), level: s.cursor });
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.hung = [];
  s.glide = [];
  s.glideTo = [];
  if (s.cursor < s.steps.length) {
    s.phase = "rear";
    return;
  }
  s.phase = "spent";
  world.events.push({ type: "swindleSpent", col: midCol(world.cfg) });
}

/** Pods `a` and `b` of the hand begin to trade places; both must still hang. */
function beginGlide(world: World, s: SwindleState, a: number, b: number, since: number): void {
  const pa = hungPod(world, s, a);
  const pb = hungPod(world, s, b);
  if (pa === undefined || pb === undefined || pa.loose || pb.loose) return;
  const ticks = world.cfg.swindleSwapBeats * ticksPerBeat(world.cfg);
  s.glide = [pa.id, pb.id];
  s.glideTo = [pb.colMilli, pa.colMilli];
  s.glideEnd = since + world.cfg.swindleSwapBeats;
  pa.crossMilli = Math.round((pb.colMilli - pa.colMilli) / ticks);
  pb.crossMilli = Math.round((pa.colMilli - pb.colMilli) / ticks);
  world.events.push({ type: "swindleSwap", col: colOf(pa), to: colOf(pb) });
}

/** The glide is over: each pod still hanging stopped exactly on its column. */
function endGlide(world: World, s: SwindleState): void {
  s.glide.forEach((id, k) => {
    const pod = world.pods.find((p) => p.id === id);
    if (pod === undefined || pod.loose) return;
    pod.crossMilli = 0;
    pod.colMilli = s.glideTo[k] ?? pod.colMilli;
  });
  s.glide = [];
  s.glideTo = [];
}

function hungPod(world: World, s: SwindleState, i: number): Pod | undefined {
  const id = s.hung[i];
  return id === undefined ? undefined : world.pods.find((p) => p.id === id);
}

function colOf(pod: Pod): number {
  return Math.round(pod.colMilli / MILLI);
}

/** A real pod was swallowed. If it was one of hers, she is down one. A no-op
 * for every pod a wave hung (`pod-arrive.ts`). */
export function swindlePodTaken(world: World, pod: Pod): void {
  const s = swindleBoss(world);
  const i = s === null ? -1 : s.hung.indexOf(pod.id);
  if (s === null || i < 0) return;
  s.taken += 1;
  world.events.push({ type: "swindleTaken", col: colOf(pod), piece: i, left: swindleRealLeft(s) });
}

/** A husk was refused. If it was one of hers, she says so. A no-op for every
 * husk a wave hung (`pod-arrive.ts`). */
export function swindleHuskRefused(world: World, pod: Pod): void {
  const s = swindleBoss(world);
  const i = s === null ? -1 : s.hung.indexOf(pod.id);
  if (s === null || i < 0) return;
  world.events.push({ type: "swindleRefused", col: colOf(pod), piece: i });
}
