import { midCol } from "../src/config.js";
import {
  GOVERNOR_DOWN_MILLI,
  type GovernorState,
  type GovernorStep,
  governorBoss,
  governorLitStep,
  governorOff,
  governorPace,
} from "../src/governor.js";
import { governorOnMark, governorOpenMarks } from "../src/governor-mark.js";
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
 * THE GOVERNOR's test rig: a script installed, and a tap sent as a thumb
 * would send it — an edge, down and lifted — on the mark it is for. Shared by
 * `governor.test.ts` and `governor-hub.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

const mark = (seat: 1 | 2, markMilli: number) => ({ seat, markMilli });

/** A script of the shipped wave's shape, written out: sim tests do not read content. */
export const SCRIPT: readonly GovernorStep[] = [
  {
    ask: "tap",
    marks: [mark(1, 250), mark(2, 750)],
    ordered: false,
    paceMilli: 7,
    color: "either",
    beats: 7,
  },
  {
    ask: "tap",
    marks: [mark(1, 625), mark(2, 125)],
    ordered: false,
    paceMilli: 8,
    color: "either",
    beats: 7,
  },
  { ask: "fire", marks: [], ordered: false, paceMilli: 3, color: "red", beats: 10 },
  {
    ask: "retap",
    marks: [mark(2, 250), mark(1, 500), mark(2, 750)],
    ordered: true,
    paceMilli: 8,
    color: "either",
    beats: 8,
  },
  { ask: "fire", marks: [], ordered: false, paceMilli: 4, color: "either", beats: 10 },
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

/** A tap from `player`, down and lifted on the next tick; the event types of both. */
export function tap(world: World, player: 1 | 2): string[] {
  const down = { kind: "drag", target: "governorTap", on: true, fromMilli: 0 } as const;
  const up = { ...down, on: false };
  return [
    ...tick(world, [{ tick: world.tick, player, command: down }]),
    ...tick(world, [{ tick: world.tick, player, command: up }]),
  ];
}

/** Until the needle is on mark `i` of the lit step. */
export function toMark(world: World, i: number): Set<string> {
  return runUntil(world, (w) => governorOnMark(w, governor(w), i));
}

/** The next open mark landed by its own seat, on the mark; the event types of the tap. */
export function tapMark(world: World): string[] {
  const s = governor(world);
  const i = governorOpenMarks(s)[0];
  const seat = i === undefined ? undefined : governorLitStep(s)?.marks[i]?.seat;
  if (i === undefined || seat === undefined) throw new Error("no mark is open");
  toMark(world, i);
  return tap(world, seat);
}

/** Until the needle points straight down, give or take a tick's turn: the tip in the middle of the gap, for a bolt meeting it now. */
export function toDown(world: World): void {
  runUntil(world, (w) => {
    const g = governor(w);
    return governorOff(g.needleMilli, GOVERNOR_DOWN_MILLI) <= governorPace(w, g);
  });
}

/** Whether the needle will point straight down, give or take a tick's turn, once it has turned `ahead` more thousandths. */
export function governorTicksDown(world: World, ahead: number): boolean {
  const g = governor(world);
  return governorOff(g.needleMilli + ahead, GOVERNOR_DOWN_MILLI) <= governorPace(world, g);
}

/** Answer the lit step, whichever it asks: every mark tapped, or the colour it wants fired as the needle points down. */
export function answer(world: World): Set<string> {
  const s = governor(world);
  const lit = governorLitStep(s);
  if (lit === null) throw new Error("nothing is lit");
  const cursor = s.cursor;
  const seen = new Set<string>();
  if (lit.ask === "fire") {
    toDown(world);
    governorStruck(world, shot(lit.color === "either" ? "red" : lit.color));
  } else {
    while (governor(world).cursor === cursor && governor(world).phase === "lit") {
      for (const t of tapMark(world)) seen.add(t);
    }
  }
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
