import { describe, expect, it } from "bun:test";
import {
  clampSpanCol,
  colSpan,
  createWorld,
  DEFAULT_CONFIG,
  fallTilesPerBeat,
  hashWorld,
  hullPercent,
  hullRow,
  occupiesCol,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  spanOf,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * A rock's **width is authored**, and this is the file that holds that to
 * being a real fact about the field rather than a picture.
 *
 * Speed is the kind — the five tiers, `meteor` through `meteorFastest` — and
 * size is a number beside it (`RockSize`, `WaveEntry.size`). The whole reason
 * that is worth testing separately from the torch is that the torch's width
 * was always readable off its kind, so every rule that asked `colSpan(kind)`
 * happened to be right. A two-tile *meteor* is the first body for which that
 * question and "how wide is this thing" are different questions, and each
 * test below is one place that used to be allowed to confuse them.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
const RATE = fallTilesPerBeat("meteor");
const IMPACT_BEAT = Math.ceil(HULL / RATE) + 1;
const IMPACT_TICK = TPB * IMPACT_BEAT;

const big = (col: number): SpawnEntry => ({ beat: 0, col, kind: "meteor", color: null, span: 2 });
const small = (col: number): SpawnEntry => ({ beat: 0, col, kind: "meteor", color: null });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

function run(
  queue: SpawnEntry[],
  ticks: number,
  inputs: TimedCommand[] = [],
): { world: ReturnType<typeof createWorld>; events: SimEvent[] } {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

describe("spanOf", () => {
  it("falls back to the kind's own width when nothing was authored", () => {
    expect(spanOf({ kind: "meteor" })).toBe(colSpan("meteor"));
    expect(spanOf({ kind: "torch" })).toBe(colSpan("torch"));
    expect(spanOf({ kind: "slick" })).toBe(1);
  });

  it("takes the authored width over the kind's", () => {
    expect(spanOf({ kind: "meteor", span: 2 })).toBe(2);
  });

  it("answers for a scar and for a queue entry, not only for a creature", () => {
    // All three carry the same two fields, which is why there is one rule and
    // not three copies of the same `??`.
    const scar = { col: 1, beat: 4, kind: "meteor", span: 2 } as const;
    expect(spanOf(scar)).toBe(2);
    expect(spanOf(big(1))).toBe(2);
  });
});

describe("a two-tile meteor on the field", () => {
  it("occupies both of its columns", () => {
    const { world } = run([big(2)], TPB * 2);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    expect(c && spanOf(c)).toBe(2);
    expect(c && occupiesCol(c, 2)).toBe(true);
    expect(c && occupiesCol(c, 3)).toBe(true);
    expect(c && occupiesCol(c, 1)).toBe(false);
    expect(c && occupiesCol(c, 4)).toBe(false);
  });

  it("is deflected by a shield standing in its right-hand column", () => {
    // The column the wave did not name. A rule asking `colSpan("meteor")`
    // would answer 1 here and let the rock through with the shield on it.
    const { world, events } = run([big(2)], IMPACT_TICK + 1, [
      shieldTo(10, 3),
      guard(IMPACT_TICK - 20),
    ]);
    expect(world.guard.deflected).toBe(1);
    expect(events.some((e) => e.type === "deflect" && e.span === 2)).toBe(true);
  });

  it("scars both columns and breaks the hull once, not twice", () => {
    const { world, events } = run([big(2)], IMPACT_TICK + 1);
    const breaches = events.filter((e) => e.type === "breach");
    expect(breaches).toHaveLength(1);
    expect(breaches[0]?.type === "breach" && breaches[0].span).toBe(2);
    expect(world.scars.map((s) => s.col).sort()).toEqual([2, 3]);
    // Every scar carries the width, so a crater is drawn at the size of the
    // rock that made it rather than at its kind's.
    expect(world.scars.every((s) => spanOf(s) === 2)).toBe(true);
    const oneWide = run([small(2)], IMPACT_TICK + 1).world;
    expect(hullPercent(world)).toBe(hullPercent(oneWide));
  });

  it("is pulled back onto the field when the last column was authored", () => {
    const { world } = run([big(CFG.cols - 1)], TPB * 2);
    expect(world.creatures[0]?.col).toBe(CFG.cols - 2);
    expect(clampSpanCol(CFG.cols - 1, CFG.cols, 2)).toBe(CFG.cols - 2);
  });
});

describe("the fingerprint", () => {
  it("notices that one rock is wide and the other is not", () => {
    // Two devices that disagree about a width disagree about which columns the
    // shield has to cover — a deflection on one screen and a breach on the
    // other, which is the desync this field exists to catch.
    const wide = run([big(2)], TPB * 2).world;
    const narrow = run([small(2)], TPB * 2).world;
    expect(hashWorld(wide)).not.toBe(hashWorld(narrow));
  });
});
