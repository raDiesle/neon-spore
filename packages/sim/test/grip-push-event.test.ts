import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * **The lane change, said out loud.**
 *
 * THE PUSH moved a body a column and pushed nothing, so the seat that is not
 * holding it heard the change only if they happened to be looking — on the one
 * mechanic whose whole point is that the two of them are looking at different
 * things. The arithmetic of the carry is pinned next door in
 * `grip-push.test.ts`; what these pin is who the event names, because that is
 * the part a hand pulling the other way gets wrong.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, rows: 200 };
const TPB = ticksPerBeat(CFG);
const ROCK: SpawnEntry[] = [{ beat: 0, col: 5, kind: "meteor", color: null }];

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});

const push = (tick: number, player: 1 | 2, id: number, tiles: number): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: "gripBody",
    on: true,
    fromMilli: Math.round(tiles * CFG.gripPushMilli),
    id,
  },
});

/** Every carry pushed over `beats` beats, in the order the mixer would read
 * them — `world.events` is emptied at the top of every tick (`step.ts`). */
function carries(beats: number, inputs: TimedCommand[]): Extract<SimEvent, { type: "carry" }>[] {
  const w = createWorld({ ...CFG }, 0, ROCK);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const seen: Extract<SimEvent, { type: "carry" }>[] = [];
  const until = w.tick + TPB * beats;
  while (w.tick < until) {
    step(w, byTick.get(w.tick) ?? []);
    for (const e of w.events) if (e.type === "carry") seen.push(e);
  }
  return seen;
}

describe("a body carried a column says so", () => {
  it("names the seat whose hand it was, the column it went to and the way it went", () => {
    const seen = carries(3, [grip(TPB, 2, 1), push(TPB, 2, 1, 1)]);
    expect(seen).toEqual([{ type: "carry", player: 2, col: 6, row: seen[0]?.row ?? -1, dir: 1 }]);
    expect(seen[0]?.row).toBeGreaterThanOrEqual(0);
  });

  it("goes the other way with the hand", () => {
    const seen = carries(3, [grip(TPB, 1, 1), push(TPB, 1, 1, -1)]);
    expect(seen.map((e) => [e.player, e.col, e.dir])).toEqual([[1, 4, -1]]);
  });

  it("says it once per column and not once per beat the hand is held", () => {
    // A thumb held still keeps sending the same distance, which is one column
    // earned and not one a beat (`grip-push.ts`).
    const held = [1, 2, 3, 4, 5, 6].map((b) => push(TPB * b, 1, 1, 1));
    expect(carries(8, [grip(TPB, 1, 1), ...held])).toHaveLength(1);
  });

  it("names both hands when both pulled the same way, so each hears its own", () => {
    const seen = carries(3, [
      grip(TPB, 1, 1),
      grip(TPB, 2, 1),
      push(TPB, 1, 1, 1),
      push(TPB, 2, 1, 1),
    ]);
    expect(seen.map((e) => e.player)).toEqual([1, 2]);
  });

  it("says nothing at all when the two hands cancel, because nothing moved", () => {
    const seen = carries(3, [
      grip(TPB, 1, 1),
      grip(TPB, 2, 1),
      push(TPB, 1, 1, 1),
      push(TPB, 2, 1, -1),
    ]);
    expect(seen).toEqual([]);
  });

  it("names only the hand that paid, never the other one resting on the same body", () => {
    // Both seats are holding it and only one has moved. A hand that is charged
    // nothing has nothing to say about a column it did not buy — asking who
    // *grips* rather than who spent would put a carry on both phones with one
    // thumb on the field.
    const seen = carries(3, [grip(TPB, 1, 1), grip(TPB, 2, 1), push(TPB, 2, 1, 1)]);
    expect(seen.map((e) => [e.player, e.dir])).toEqual([[2, 1]]);
  });
});
