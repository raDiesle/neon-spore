import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { hullPercent } from "../src/hull.js";
import { isMeteorKind, isWardable } from "../src/kinds.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { veerChangesLeft, veerHeading, veerRowIsChange, veerRowsToChange } from "../src/veer.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE VEER: a rock that steps a lane to one side three times on the way down.
 *
 * What is worth pinning here is the half a reader of `veer.ts` cannot check by
 * eye — that it really does fall like every other rock, that it changes lane
 * exactly `veerChanges` times and on the rows it says it does, that a change is
 * one column and never two, that it never steps off the field, that `veerDir`
 * is the side of the change that is still to come rather than the one just
 * taken, that the shield still answers it, and that a second device walking
 * the same beats arrives at the same fingerprint.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Where the shield answers a rock: one row above the ship, written out by
 * hand for `guard.test.ts`'s reason — a test that asks the rule where the rule
 * is cannot fail when the rule is wrong. */
const SHIELD = HULL - 1;
/** A creature listed at wave-beat 0 stands on row `r` at beat `r + 1`. */
const tickOfRow = (row: number): number => TPB * (row + 1);

const veer = (col: number): SpawnEntry => ({ beat: 0, col, kind: "veer", color: null });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

interface Step {
  beat: number;
  row: number;
  col: number;
  /** The side it was aiming at *before* this beat's move. */
  aim: number;
}

interface Run {
  world: World;
  events: SimEvent[];
  /** One entry per beat the body was on the field, in order. */
  walk: Step[];
}

/** Play `ticks` ticks and record where the one body stood on every beat. */
function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = [], seed = 0): Run {
  const world = createWorld({ ...CFG }, seed, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  const walk: Step[] = [];
  let aim = 0;
  for (let t = 0; t < ticks; t++) {
    const before: Creature | undefined = world.creatures.find((c) => c.kind === "veer");
    if (before) aim = veerHeading(before);
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
    const body = world.creatures.find((c) => c.kind === "veer");
    if (body && (t + 1) % TPB === 0) {
      walk.push({ beat: world.beat, row: body.row, col: body.col, aim });
    }
  }
  return { world, events, walk };
}

describe("THE VEER", () => {
  it("is a rock: dead, indestructible, and the shield's to answer", () => {
    expect(isMeteorKind("veer")).toBe(true);
    expect(isWardable("veer")).toBe(true);
  });

  it("comes down a row a beat, the same as the slowest tier", () => {
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    for (const [i, s] of walk.entries()) expect(s.row).toBe(Math.min(i, HULL));
  });

  it("changes lane exactly three times, one column each, on rows 3, 6 and 9", () => {
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    const moved = walk.filter((s, i) => i > 0 && s.col !== walk[i - 1]!.col);
    expect(moved.length).toBe(CFG.veerChanges);
    expect(moved.map((s) => s.row)).toEqual([3, 6, 9]);
    for (const [i, s] of walk.entries()) {
      if (i === 0) continue;
      expect(Math.abs(s.col - walk[i - 1]!.col)).toBeLessThanOrEqual(1);
    }
  });

  it("holds the lane it settles in for the rest of the fall", () => {
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    const settled = walk.filter((s) => s.row >= 9);
    const cols = new Set(settled.map((s) => s.col));
    expect(settled.length).toBeGreaterThan(3);
    expect(cols.size).toBe(1);
  });

  it("takes the side it was aiming at, not the one it re-aims to", () => {
    // The whole of what player 1 is told: `veerDir` before a beat is the side
    // the *next* change takes, so the column it lands in is readable a whole
    // three rows ahead. A roll taken after the move would make the arrow a
    // report rather than a warning.
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    for (const [i, s] of walk.entries()) {
      if (i === 0 || !veerRowIsChange(CFG, s.row)) continue;
      expect(s.col).toBe(walk[i - 1]!.col + s.aim);
    }
  });

  it("never steps off the field, from either wall", () => {
    for (const col of [0, CFG.cols - 1]) {
      const { walk } = run([veer(col)], tickOfRow(HULL) + TPB);
      for (const s of walk) {
        expect(s.col).toBeGreaterThanOrEqual(0);
        expect(s.col).toBeLessThanOrEqual(CFG.cols - 1);
      }
    }
  });

  it("stops asking for a call once the last change is spent", () => {
    expect(veerChangesLeft(CFG, 0)).toBe(CFG.veerChanges);
    expect(veerChangesLeft(CFG, 9)).toBe(0);
    expect(veerRowsToChange(CFG, 0)).toBe(CFG.veerRowsApart);
    expect(veerRowsToChange(CFG, 2)).toBe(1);
    expect(veerRowsToChange(CFG, 9)).toBeNull();
  });

  it("is turned by a ward in the lane it actually lands in, and not the one it left", () => {
    // The wave in one test. The shield parked in the column the rock entered
    // answers nothing, because by the ship it is somewhere else; the shield
    // moved to where it settles turns it, and the hull is whole.
    const ticks = tickOfRow(HULL) + TPB * 2;
    const settled = run([veer(3)], ticks).walk.find((s) => s.row === 9);
    expect(settled).toBeDefined();
    const landed = settled?.col ?? 3;
    expect(landed).not.toBe(3);

    const stale = run([veer(3)], ticks, [shieldTo(0, 3), guard(tickOfRow(SHIELD))]);
    expect(hullPercent(stale.world)).toBeLessThan(100);

    const told = run([veer(3)], ticks, [shieldTo(0, landed), guard(tickOfRow(SHIELD))]);
    expect(told.events.some((e) => e.type === "deflect")).toBe(true);
    expect(hullPercent(told.world)).toBe(100);
  });

  it("fingerprints the same twice", () => {
    const ticks = tickOfRow(HULL) + TPB;
    const a = run([veer(3), veer(5)], ticks);
    const b = run([veer(3), veer(5)], ticks);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });
});
