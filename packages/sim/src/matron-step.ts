import { midCol, ticksPerBeat } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import {
  freshMatron,
  type MatronState,
  type MatronStep,
  type MatronThrow,
  matronBoss,
  matronLeft,
  matronLitStep,
  matronLobesAll,
  matronLobesLeft,
  matronPodCol,
} from "./matron.js";
import { spawnOne } from "./spawn.js";
import { MILLI, type World } from "./world.js";

/**
 * THE MATRON's clock: she comes down, hangs a clutch, throws while it hangs,
 * rears back between clutches and sinks away beaten.
 *
 * What takes a lobe off her is not here: it is the ordinary catch at the maw
 * (`pod-arrive.ts`), which tells her through `matronPodTaken` on the tick. A
 * pod whose ring runs out is the ordinary lost pod (`cargoLost`) — the wave
 * is lost there, and nothing of hers needs to strike.
 */

export function installMatron(world: World, steps: readonly MatronStep[]): MatronState {
  const s = freshMatron(world.beat, steps);
  world.events.push({ type: "matronEnter", col: midCol(world.cfg), lobes: matronLobesAll(s) });
  return s;
}

/** One beat of THE MATRON: a clutch hung, a throw, a rear, the sinking away. */
export function stepMatron(world: World, s: MatronState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.matronSpentBeats) {
      world.events.push({ type: "matronOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.matronEnterBeats) hang(world, s);
  else if (s.phase === "rear" && since >= cfg.matronRearBeats) hang(world, s);
  else if (s.phase === "hang") throwDue(world, s, since);
}

/** The next clutch is hung off her lobes, every pod on the level's ring. */
function hang(world: World, s: MatronState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "hang";
  s.phaseBeat = world.beat;
  s.takenMask = 0;
  s.thrown = 0;
  s.hung = step.pods.map((_, i) => {
    const id = world.nextId++;
    world.pods.push({
      id,
      colMilli: matronPodCol(world, step, i) * MILLI,
      rowMilli: world.cfg.matronPodRow * MILLI,
      driftMilli: 0,
      loose: false,
      kind: "pod",
      dueTicks: step.beats * ticksPerBeat(world.cfg),
      crossMilli: 0,
    });
    return id;
  });
  world.events.push({ type: "matronHang", col: midCol(world.cfg), pods: step.pods.length });
  // Whatever is due on the beat she hangs it is thrown with it.
  throwDue(world, s, 0);
}

/** Every throw of the lit level whose beat has come, in order. */
function throwDue(world: World, s: MatronState, since: number): void {
  const step = matronLitStep(s);
  if (step === null) return;
  for (let t = step.throws[s.thrown]; t !== undefined && t.at <= since; t = step.throws[s.thrown]) {
    throwOne(world, t);
    s.thrown += 1;
  }
}

/** One throw down its column, as the arrival it is. */
function throwOne(world: World, t: MatronThrow): void {
  const col = Math.max(0, Math.min(world.cfg.cols - 1, midCol(world.cfg) + t.offset));
  if (t.what === "rock") spawnOne(world, { beat: world.beat, col, kind: "meteor", color: null });
  else if (t.what === "torch")
    spawnOne(world, { beat: world.beat, col, kind: "torch", color: null });
  else spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(t.what), color: t.what });
  world.events.push({ type: "matronThrow", col, what: t.what });
}

/**
 * The pod with id `podId` was swallowed. If it was one of hers, its lobe
 * goes; the clutch's last ends the level, and the script's last the fight.
 * A no-op for every pod a wave hung (`pod-arrive.ts`).
 */
export function matronPodTaken(world: World, podId: number): void {
  const s = matronBoss(world);
  if (s === null) return;
  const step = matronLitStep(s);
  const i = s.hung.indexOf(podId);
  if (step === null || i < 0) return;
  s.takenMask |= 1 << i;
  s.taken += 1;
  const col = matronPodCol(world, step, i);
  world.events.push({ type: "matronLobe", col, piece: i, left: matronLobesLeft(s) });
  if (matronLeft(s) > 0) return;
  world.events.push({ type: "matronCleared", col: midCol(world.cfg), level: s.cursor });
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.hung = [];
  if (s.cursor < s.steps.length) {
    s.phase = "rear";
    return;
  }
  s.phase = "spent";
  world.events.push({ type: "matronSpent", col: midCol(world.cfg) });
}
