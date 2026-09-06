import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { hullPercent } from "../src/hull.js";
import { isMeteorKind, isWardable } from "../src/kinds.js";
import { createRng } from "../src/rng.js";
import type { Creature, TimedCommand } from "../src/types.js";
import {
  veerDist,
  veerHeading,
  veerPickChange,
  veerRowIsChange,
  veerRowsToChange,
  veerStepCol,
} from "../src/veer.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE VEER: a rock that steps a lane to one side every `veerRowsApart` rows,
 * all the way down.
 *
 * What is worth pinning here is the half a reader of `veer.ts` cannot check by
 * eye — that it really does fall like every other rock, that it changes lane on
 * every row the spacing names and goes on doing it to the ship, that a change
 * is never wider than `veerMaxDist`, that it never steps off the field, that
 * `veerDir` and `veerDist` are the side and width of the change still to come
 * rather than the one just taken, that the shield still answers it, and that a
 * second device walking the same beats arrives at the same fingerprint.
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
  /** The width it was aiming at *before* this beat's move. */
  dist: number;
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
  let dist = 0;
  for (let t = 0; t < ticks; t++) {
    const before: Creature | undefined = world.creatures.find((c) => c.kind === "veer");
    if (before) {
      aim = veerHeading(before);
      dist = veerDist(before);
    }
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
    const body = world.creatures.find((c) => c.kind === "veer");
    if (body && (t + 1) % TPB === 0) {
      walk.push({ beat: world.beat, row: body.row, col: body.col, aim, dist });
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

  it("changes lane up to veerMaxDist columns each time, on rows 3, 6, 9 and 12", () => {
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    const moved = walk.filter((s, i) => i > 0 && s.col !== walk[i - 1]!.col);
    expect(moved.map((s) => s.row)).toEqual([3, 6, 9, 12]);
    for (const [i, s] of walk.entries()) {
      if (i === 0) continue;
      expect(Math.abs(s.col - walk[i - 1]!.col)).toBeLessThanOrEqual(CFG.veerMaxDist);
    }
  });

  it("never settles: the last change lands one row above the row the shield answers at", () => {
    // The creature, in one number. There used to be a tail of straight fall
    // below the last change, and a pair could park the shield in the lane the
    // rock had arrived in and stop listening — which is what every other rock
    // already rewards. The last step now comes on the row above the shield's.
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    const moved = walk.filter((s, i) => i > 0 && s.col !== walk[i - 1]!.col);
    expect(moved.at(-1)?.row).toBe(SHIELD - 1);
  });

  it("takes the side and width it was aiming at, not the ones it re-aims to", () => {
    // The whole of what player 1 is told: `veerDir` and `veerDist` before a
    // beat are the side and width the *next* change takes, so the column it
    // lands in is readable a whole three rows ahead. A roll taken after the
    // move would make the arrow a report rather than a warning.
    const { walk } = run([veer(3)], tickOfRow(HULL) + TPB);
    for (const [i, s] of walk.entries()) {
      if (i === 0 || !veerRowIsChange(CFG, s.row)) continue;
      expect(s.col).toBe(walk[i - 1]!.col + s.aim * s.dist);
    }
  });

  it("rolls a width other than one, across enough rocks", () => {
    // If every roll came out one tile the number above the arrow would never
    // say anything but "1", and the whole point of showing it is that it
    // varies. `veerMaxDist` is 4 by default, so the widths seen across enough
    // seeds and columns must include something wider than the old fixed step.
    const cols = CFG.cols;
    const widths = new Set<number>();
    for (let seed = 0; seed < 64; seed++) {
      const rng = createRng(seed);
      for (let col = 0; col < cols; col++) {
        widths.add(veerPickChange(rng, col, cols, CFG.veerMaxDist).dist);
      }
    }
    expect(Math.max(...widths)).toBeGreaterThan(1);
    for (const w of widths) {
      expect(w).toBeGreaterThanOrEqual(1);
      expect(w).toBeLessThanOrEqual(CFG.veerMaxDist);
    }
  });

  it("never picks a change that would take it off the field, however the roll goes", () => {
    const cols = CFG.cols;
    for (let seed = 0; seed < 64; seed++) {
      const rng = createRng(seed);
      for (let col = 0; col < cols; col++) {
        const { dir, dist } = veerPickChange(rng, col, cols, CFG.veerMaxDist);
        const to = veerStepCol(col, cols, dir, dist);
        expect(to).toBeGreaterThanOrEqual(0);
        expect(to).toBeLessThan(cols);
      }
    }
  });

  it("draws from the stream exactly twice a pick, wall or no wall", () => {
    // Two devices consume the same rng whatever column the rock is standing
    // in. Folding a fitting test into either draw would spend a number in
    // the middle of the field and none against a wall.
    const middle = createRng(7);
    const edge = createRng(7);
    veerPickChange(middle, 5, CFG.cols, CFG.veerMaxDist);
    veerPickChange(edge, 0, CFG.cols, CFG.veerMaxDist);
    expect(middle.state).toBe(edge.state);
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

  it("has a change ahead of it at every height, and asks for a call the whole way", () => {
    expect(veerRowIsChange(CFG, 0)).toBe(false);
    for (let row = 1; row <= HULL; row++) {
      expect(veerRowIsChange(CFG, row)).toBe(row % CFG.veerRowsApart === 0);
      expect(veerRowsToChange(CFG, row)).toBeGreaterThan(0);
      expect(veerRowsToChange(CFG, row)).toBeLessThanOrEqual(CFG.veerRowsApart);
    }
    expect(veerRowsToChange(CFG, 0)).toBe(CFG.veerRowsApart);
    expect(veerRowsToChange(CFG, 2)).toBe(1);
  });

  it("is turned by a ward in the lane it actually lands in, and not the one it left", () => {
    // The wave in one test. The shield parked in the column the rock entered
    // answers nothing, because by the ship it is somewhere else; the shield
    // moved to where it settles turns it, and the hull is whole.
    // A named seed, and the three runs share it: on seed 0 the four changes
    // happen to bring this rock back to the column it entered, which would
    // make the parked shield right by luck and prove nothing.
    const SEED = 1;
    const ticks = tickOfRow(HULL) + TPB * 2;
    const settled = run([veer(3)], ticks, [], SEED).walk.find((s) => s.row === SHIELD - 1);
    expect(settled).toBeDefined();
    const landed = settled?.col ?? 3;
    expect(landed).not.toBe(3);

    const stale = run([veer(3)], ticks, [shieldTo(0, 3), guard(tickOfRow(SHIELD))], SEED);
    expect(hullPercent(stale.world)).toBeLessThan(100);

    const told = run([veer(3)], ticks, [shieldTo(0, landed), guard(tickOfRow(SHIELD))], SEED);
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
