import { MAX_BEARING_STEP, NO_BEARING, TURN } from "../src/bearing.js";
import { midCol } from "../src/config.js";
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
import { type ValveState, valveBoss, valveMark } from "../src/valve.js";

/**
 * THE VALVE's test rig: a wave installed, a hand on the wheel, a thumb on the
 * pin, and the places a test starts from — the wheel on its mark, frozen, and
 * the first pin out. Shared by `valve.test.ts` and `valve-run.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);
export const MARKS = [250, 600, 850] as const;

export function install(marks: readonly number[] = MARKS): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "valve", marks });
  return world;
}

export function valve(world: World): ValveState {
  const s = valveBoss(world);
  if (s === null) throw new Error("the wave installed no valve");
  return s;
}

export const wheel = (tick: number, player: 1 | 2, at: number, on = true): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "valveWheel", on, fromMilli: on ? at : -1 },
});

export const pin = (
  tick: number,
  player: 1 | 2,
  depth = 0,
  on = true,
  id?: number,
): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "valvePin", on, fromMilli: 0, fromYMilli: depth, id },
});

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats; every event type seen. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 12): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the drum never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/**
 * The pilot's hand turned `by` thousandths of a turn, signed, a `stride` a
 * tick — a hand that has just gone on takes one tick to be a reference. Every
 * event type seen.
 */
export function turn(world: World, by: number, stride = 40, player: 1 | 2 = 1): Set<string> {
  const seen = new Set<string>();
  const s = valve(world);
  let at = s.handMilli === NO_BEARING ? 0 : s.handMilli;
  if (s.handMilli === NO_BEARING)
    for (const t of tick(world, [wheel(world.tick, player, at)])) seen.add(t);
  let left = by;
  while (left !== 0) {
    const d = Math.sign(left) * Math.min(stride, Math.abs(left));
    at = (((at + d) % TURN) + TURN) % TURN;
    left -= d;
    for (const t of tick(world, [wheel(world.tick, player, at)])) seen.add(t);
  }
  return seen;
}

/** The wheel turned onto this movement's mark the short way, a lap first in the third. */
export function turnOnto(world: World): Set<string> {
  const s = valve(world);
  const lap = s.movement === 3 ? CFG.valveLapMilli : 0;
  const ahead = (((valveMark(s) - s.wheelMilli) % TURN) + TURN) % TURN;
  return turn(world, lap + (ahead <= MAX_BEARING_STEP ? ahead : ahead - TURN));
}

/** The navigator's tap on the pin: down, and up again the next tick. */
export function freeze(world: World): Set<string> {
  const seen = new Set(tick(world, [pin(world.tick, 2)]));
  for (const t of tick(world, [pin(world.tick, 2, 0, false)])) seen.add(t);
  return seen;
}

/** A thumb drawing the pin to `depth`, and off. */
export function pull(world: World, player: 1 | 2 = 1, depth = 700): Set<string> {
  const seen = new Set(tick(world, [pin(world.tick, player, depth)]));
  for (const t of tick(world, [pin(world.tick, player, 0, false)])) seen.add(t);
  return seen;
}

/** A tap on the pin by `player`: down, and up again the next tick. */
export function tap(world: World, player: 1 | 2): Set<string> {
  const seen = new Set(tick(world, [pin(world.tick, player)]));
  for (const t of tick(world, [pin(world.tick, player, 0, false)])) seen.add(t);
  return seen;
}

/** Both thumbs down on the pin until the drum leaves this phase, then both up. */
export function chord(world: World, beats = 12): Set<string> {
  const phase = valve(world).phase;
  const seen = new Set(tick(world, [pin(world.tick, 1), pin(world.tick, 2)]));
  for (const t of runUntil(world, (w) => valve(w).phase !== phase, beats)) seen.add(t);
  for (const t of tick(world, [pin(world.tick, 1, 0, false), pin(world.tick, 2, 0, false)]))
    seen.add(t);
  return seen;
}

/** `player`'s thumb rubbing the pin through `reversals`, reported a tick each, and off. */
export function rub(world: World, player: 1 | 2, reversals: number): Set<string> {
  const seen = new Set<string>();
  for (let n = 0; n <= reversals; n++)
    for (const t of tick(world, [pin(world.tick, player, 0, true, n)])) seen.add(t);
  for (const t of tick(world, [pin(world.tick, player, 0, false)])) seen.add(t);
  return seen;
}

/** Whatever the story between the pins asks next, answered (`valve-story.ts`). */
export function answerStory(world: World): Set<string> {
  const s = valve(world);
  if (s.phase === "jet") return tap(world, 2);
  if (s.phase === "brace" || s.phase === "seal") return chord(world);
  if (s.phase === "wipe") {
    const seen = rub(world, 1, CFG.valveWipeRubs);
    for (const t of answerStory(world)) seen.add(t);
    return seen;
  }
  return new Set();
}

export function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** Settled, and the first mark lit. */
export function toTurn(world: World): void {
  runUntil(world, (w) => valve(w).phase === "turn");
}

/** One whole movement answered: turned, frozen, pulled, and the story after it. */
export function answerMovement(world: World): void {
  runUntil(world, (w) => valve(w).phase === "turn");
  turnOnto(world);
  freeze(world);
  pull(world);
  answerStory(world);
}
