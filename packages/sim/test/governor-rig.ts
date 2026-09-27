import { midCol } from "../src/config.js";
import {
  type GovernorState,
  type GovernorStep,
  governorBoss,
  governorGovernor,
  governorLitStep,
  governorOnMark,
  governorTapper,
} from "../src/governor.js";
import { governorStruck } from "../src/governor-shot.js";
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
 * THE GOVERNOR's test rig: a script installed, a pad pressed as a thumb would
 * press it — one drag per pad, the pad as `id`, on the seat's own side — and a
 * tap sent as an edge, down and lifted. Shared by `governor.test.ts` and
 * `governor-hub.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly GovernorStep[] = [
  { ask: "tap", tapper: 1, markMilli: 250, paceMilli: 3, color: "either", beats: 10 },
  { ask: "tap", tapper: 1, markMilli: 500, paceMilli: 3, color: "either", beats: 10 },
  { ask: "tap", tapper: 1, markMilli: 750, paceMilli: 3, color: "either", beats: 10 },
  { ask: "tap", tapper: 2, markMilli: 125, paceMilli: 3, color: "either", beats: 10 },
  { ask: "tap", tapper: 2, markMilli: 625, paceMilli: 3, color: "either", beats: 10 },
  { ask: "tap", tapper: 2, markMilli: 375, paceMilli: 3, color: "either", beats: 10 },
  { ask: "fire", tapper: 1, markMilli: 0, paceMilli: 0, color: "red", beats: 3 },
  { ask: "retap", tapper: 1, markMilli: 875, paceMilli: 4, color: "either", beats: 8 },
  { ask: "fire", tapper: 1, markMilli: 0, paceMilli: 0, color: "cyan", beats: 3 },
  { ask: "retap", tapper: 2, markMilli: 500, paceMilli: 5, color: "either", beats: 6 },
  { ask: "fire", tapper: 2, markMilli: 0, paceMilli: 0, color: "either", beats: 3 },
];

export function install(steps: readonly GovernorStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "governor", steps });
  return world;
}

export function governor(world: World): GovernorState {
  const s = governorBoss(world);
  if (s === null) throw new Error("the wave installed no governor");
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
    if (world.tick >= end) throw new Error("the governor never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => governor(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** One pad of `player`'s chord, `target` its own side unless a test says otherwise. */
export function pad(
  world: World,
  player: 1 | 2,
  id: number,
  on: boolean,
  target = player === 1 ? "governorChordLeft" : "governorChordRight",
): string[] {
  const command = { kind: "drag", target, on, fromMilli: 0, id } as TimedCommand["command"];
  return tick(world, [{ tick: world.tick, player, command }]);
}

/** Both of `player`'s pads down, or both up; the event types of both ticks. */
export function chord(world: World, player: 1 | 2, on: boolean): string[] {
  return [...pad(world, player, 0, on), ...pad(world, player, 1, on)];
}

/** A tap from `player`, down and lifted on the next tick; the event types of both. */
export function tap(world: World, player: 1 | 2): string[] {
  const down = { kind: "drag", target: "governorTap", on: true, fromMilli: 0 } as const;
  const up = { ...down, on: false };
  return [
    ...tick(world, [{ tick: world.tick, player, command: down }]),
    ...tick(world, [{ tick: world.tick, player, command: up }]),
  ];
}

/** Until the needle is on the lit mark. */
export function toMark(world: World): Set<string> {
  return runUntil(world, (w) => governorOnMark(w, governor(w)));
}

/** The tap the lit step wants: the governing seat braking, then its tapper on the mark. */
export function tapMark(world: World): string[] {
  const s = governor(world);
  const tapper = governorTapper(s);
  const brake = governorGovernor(s);
  if (tapper === null || brake === null) throw new Error("no tap is lit");
  chord(world, brake, true);
  toMark(world);
  const events = tap(world, tapper);
  chord(world, brake, false);
  return events;
}

/** Answer the lit step, whichever it asks: a tap on the mark, or the colour it wants. */
export function answer(world: World): Set<string> {
  const s = governor(world);
  const lit = governorLitStep(s);
  if (lit === null) throw new Error("nothing is lit");
  const cursor = s.cursor;
  const seen = new Set<string>();
  if (lit.ask === "fire") governorStruck(world, shot(lit.color === "either" ? "red" : lit.color));
  else for (const t of tapMark(world)) seen.add(t);
  for (const t of runUntil(world, (w) => governor(w).cursor > cursor)) seen.add(t);
  return seen;
}

/** A governor with the steps before `n` answered and step `n` lit. */
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
