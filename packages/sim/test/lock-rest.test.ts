import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  lockChargeMilli,
  lockedBody,
  lockReady,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE LOCK's rest (`lock-rest.ts`): the first lock is instant, the shot it
 * steers home spends it, and a hand on a body is no aim again until
 * `lockRestMs` has run — whichever body the hand is on.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const REST = Math.round((CFG.lockRestMs * CFG.tickHz) / 1000);

const cmd = (tick: number, player: 1 | 2, command: TimedCommand["command"]): TimedCommand => ({
  tick,
  player,
  command,
});
const grip = (tick: number, id: number) => cmd(tick, 1, { kind: "grip", id });
const fire = (tick: number) => cmd(tick, 2, { kind: "fire", color: "red" });

/** Two red slicks either side of a cannon parked in column 4, so neither
 * stands in the other's horizontal leg. */
const FAR: SpawnEntry[] = [
  { beat: 0, col: 8, kind: "slick", color: "red" },
  { beat: 0, col: 0, kind: "slick", color: "red" },
];

function run(beats: number, inputs: TimedCommand[]) {
  const w = createWorld({ ...CFG }, 0, FAR);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of [cmd(0, 1, { kind: "cannonCol", col: 4 }), ...inputs])
    byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const until = w.tick + TPB * beats;
  while (w.tick < until) step(w, byTick.get(w.tick) ?? []);
  return w;
}

describe("the first lock of a wave", () => {
  it("is ready before anything has been fired", () => {
    const w = run(1, []);
    expect(lockReady(w)).toBe(true);
    expect(lockChargeMilli(w)).toBe(1000);
  });

  it("locks the body the tick the hand is down", () => {
    const w = run(2, [grip(TPB, 1)]);
    expect(lockedBody(w)?.id).toBe(1);
  });
});

describe("a locked shot that lands", () => {
  // The hand on body 1, a shot, then the hand moved to body 2 and a second
  // shot, each a beat after the last so every command is past the input delay.
  const twice = [grip(TPB, 1), fire(2 * TPB), grip(4 * TPB, 2), fire(5 * TPB)];

  it("spends the lock: the body it reached is gone, and the rest has begun", () => {
    const w = run(4, twice);
    expect(w.creatures.map((c) => c.id)).toEqual([2]);
    expect(lockReady(w)).toBe(false);
    expect(lockedBody(w)).toBeUndefined();
  });

  it("leaves the next shot dumb, wherever the hand has gone", () => {
    const w = run(7, twice);
    expect(w.creatures.map((c) => c.id)).toEqual([2]);
  });

  it("locks again once the rest has run, with the hand never lifted", () => {
    const restBeats = Math.ceil(REST / TPB);
    const w = run(4 + restBeats, twice.slice(0, 3));
    expect(lockReady(w)).toBe(true);
    expect(lockedBody(w)?.id).toBe(2);
  });
});

describe("the rest", () => {
  it("is lockRestMs long, counted down tick by tick", () => {
    expect(REST).toBe(CFG.tickHz * 4);
  });
});
