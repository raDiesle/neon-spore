import { midCol } from "../src/config.js";
import {
  type FlueState,
  type FlueStep,
  flueBoss,
  flueEmberCol,
  flueLitStep,
  flueSteady,
  flueTapper,
} from "../src/flue.js";
import { flueStruck } from "../src/flue-shot.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE FLUE's test rig: a script installed, a tap sent as a thumb would send
 * it — an edge naming the column it went down on — and a stir sent as any
 * command at all, the shield slid. Shared by `flue.test.ts` and
 * `flue-core.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly FlueStep[] = [
  { ask: "vent", rester: 2, notches: [-2, 1], color: "either", beats: 12 },
  { ask: "vent", rester: 1, notches: [2, -1], color: "either", beats: 12 },
  { ask: "fire", rester: "both", notches: [], color: "red", beats: 3 },
  { ask: "damper", rester: "both", notches: [], color: "either", beats: 8 },
  { ask: "fire", rester: "both", notches: [], color: "cyan", beats: 3 },
  { ask: "damper", rester: "both", notches: [], color: "either", beats: 6 },
  { ask: "fire", rester: "both", notches: [], color: "either", beats: 3 },
];

export function install(steps: readonly FlueStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "flue", steps });
  return world;
}

export function flue(world: World): FlueState {
  const s = flueBoss(world);
  if (s === null) throw new Error("the wave installed no flue");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats; every event type seen. Generous, for THE SLOW. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 60): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the flue never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => flue(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** Until the lit vent's ember stops dead. */
export function toSteady(world: World): Set<string> {
  return runUntil(world, (w) => flueSteady(w, flue(w)));
}

/** A tap from `player` on `col`, down and lifted on the next tick; the event types of both. */
export function tap(world: World, player: 1 | 2, col: number): string[] {
  const down = { kind: "drag", target: "flueTap", on: true, fromMilli: 0, id: col } as const;
  const up = { ...down, on: false };
  return [
    ...tick(world, [{ tick: world.tick, player, command: down }]),
    ...tick(world, [{ tick: world.tick, player, command: up }]),
  ];
}

/** A command from `player` that is not a tap: the shield slid, which is enough to stir. */
export function stir(world: World, player: 1 | 2): string[] {
  return tick(world, [{ tick: world.tick, player, command: { kind: "shieldCol", col: MID } }]);
}

/** The tap the lit vent wants: its tapper, on the ember's column. */
export function tapEmber(world: World): string[] {
  const s = flue(world);
  const tapper = flueTapper(s);
  if (tapper === null) throw new Error("no vent is lit");
  return tap(world, tapper, flueEmberCol(world.cfg, s));
}

/** Answer the lit step, whichever it asks: three taps, both hands off, or the colour it wants. */
export function answer(world: World): Set<string> {
  const s = flue(world);
  const step = flueLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  const cursor = s.cursor;
  const seen = new Set<string>();
  if (step.ask === "vent") {
    for (const t of toSteady(world)) seen.add(t);
    for (let n = 0; n < 3; n += 1) for (const t of tapEmber(world)) seen.add(t);
  } else if (step.ask === "fire") {
    flueStruck(world, shot(step.color === "either" ? "red" : step.color));
  }
  for (const t of runUntil(world, (w) => flue(w).cursor > cursor)) seen.add(t);
  return seen;
}

/** A flue with the steps before `n` answered and step `n` lit. */
export function toStep(n: number, seed = 0): World {
  const world = install(SCRIPT, seed);
  toLit(world);
  for (let i = 0; i < n; i += 1) {
    answer(world);
    toLit(world);
  }
  return world;
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}
