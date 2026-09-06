import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, midCol, ticksPerBeat } from "../src/config.js";
import { grateGapCols, grateIsOpen, grateMask } from "../src/grate.js";
import { isGrippable } from "../src/grippable.js";
import { hashWorld } from "../src/hash.js";
import { hullPercent } from "../src/hull.js";
import { fallTilesPerBeat, isMeteorKind, isWardable } from "../src/kinds.js";
import { spanOf, spawnSpan } from "../src/span.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE GRATE: a live line the width of the field, with gaps burnt through it.
 *
 * What is worth pinning here is the half a reader of `grate.ts` cannot check
 * by eye — that the wall really does cover every column, that it comes down at
 * twice a slick's speed, that the **column alone** answers it with the trigger
 * making no difference either way, that a dome in a gap costs the hull nothing
 * and a dome in the way costs it `grateDamage`, that a call landing on the last
 * possible beat still saves the ship, and that a second device walking the same
 * beats arrives at the same fingerprint.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Where the shield answers, written out by hand for `guard.test.ts`'s reason:
 * a test that asks the rule where the rule is cannot fail when the rule is
 * wrong. */
const SHIELD = HULL - 1;

const grate = (gaps: number[]): SpawnEntry => ({
  beat: 0,
  col: 0,
  kind: "grate",
  color: null,
  gaps,
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

interface Run {
  world: World;
  events: SimEvent[];
  /** The wall's row after each beat it was still on the field for. */
  rows: number[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = [], seed = 0): Run {
  const world = createWorld({ ...CFG }, seed, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  const rows: number[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
    const wall = world.creatures.find((c) => c.kind === "grate");
    if (wall && (t + 1) % TPB === 0) rows.push(wall.row);
  }
  return { world, events, rows };
}

/** The wall on the field, or undefined once it is gone. */
const wallOf = (w: World): Creature | undefined => w.creatures.find((c) => c.kind === "grate");

describe("THE GRATE, as a kind", () => {
  it("is not a rock, so the cannon is never offered a crater in it", () => {
    expect(isMeteorKind("grate")).toBe(false);
    expect(isWardable("grate")).toBe(false);
  });

  it("refuses a hand: a wall has no column for one to be on", () => {
    expect(isGrippable("grate")).toBe(false);
    expect(isGrippable("meteor")).toBe(true);
  });

  it("comes down two rows a beat — twice a slick, and the second tier's own", () => {
    expect(fallTilesPerBeat("grate")).toBe(fallTilesPerBeat("meteorMedium"));
    expect(fallTilesPerBeat("grate")).toBe(2 * fallTilesPerBeat("slick"));
  });

  it("is as wide as the field before it arrives and after", () => {
    expect(spawnSpan(CFG.cols, { kind: "grate" })).toBe(CFG.cols);
    const { world } = run([grate([2])], TPB * 2);
    expect(spanOf(wallOf(world) as Creature)).toBe(CFG.cols);
  });
});

describe("where a wall is open", () => {
  it("opens exactly the columns it was given, and nothing either side", () => {
    const mask = grateMask(CFG, [0, 5]);
    const body = { grateGaps: mask } as Creature;
    expect(grateGapCols(CFG, body)).toEqual([0, 5]);
  });

  it("drops a gap off the end of the field rather than wrapping it round", () => {
    const body = { grateGaps: grateMask(CFG, [CFG.cols + 3]) } as Creature;
    // Not column 3, which is what a mask taken modulo the width would give —
    // and a way through nobody was shown is worse than none at all.
    expect(grateGapCols(CFG, body)).toEqual([midCol(CFG)]);
  });

  it("gives a wall with no gaps left one in the middle", () => {
    const body = { grateGaps: grateMask(CFG, []) } as Creature;
    expect(grateGapCols(CFG, body)).toEqual([midCol(CFG)]);
  });

  it("is open in the gap and shut everywhere else", () => {
    const { world } = run([grate([4])], TPB * 2);
    const wall = wallOf(world) as Creature;
    for (let col = 0; col < CFG.cols; col++) {
      expect(grateIsOpen(wall, col)).toBe(col === 4);
    }
  });
});

describe("a wall reaching the ship", () => {
  /** Beats from the wave's start to the beat the wall stands at or past the
   * shield's row. It enters on row 0 at beat 1 and takes two rows a beat. */
  const beatsToShield = 1 + Math.ceil(SHIELD / fallTilesPerBeat("grate"));
  const ticksPast = TPB * (beatsToShield + 2);

  it("goes over the ship when the dome is in the gap, with no trigger at all", () => {
    const { world, events } = run([grate([4])], ticksPast, [shieldTo(TPB, 4)]);
    expect(wallOf(world)).toBeUndefined();
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "gratePass")).toBe(true);
    expect(world.guard.deflected).toBe(1);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreDeflect);
  });

  it("breaks the hull when the dome is not, however hard the trigger is pressed", () => {
    // The trigger held down through the whole descent. A rock would be turned
    // by this; a wall does not care, and that is the creature.
    const presses: TimedCommand[] = [];
    for (let t = 0; t < ticksPast; t += 10) presses.push(guard(t));
    const { world, events } = run([grate([4])], ticksPast, [shieldTo(TPB, 0), ...presses]);
    expect(wallOf(world)).toBeUndefined();
    // The breach itself rather than the hull afterwards: the ship mends
    // `hullRegenPerSecond` while the run plays on, so a reading taken at the
    // end of it is the damage minus however long the test happened to run.
    const breach = events.find((e) => e.type === "breach");
    expect(breach && breach.type === "breach" && breach.damage).toBe(CFG.grateDamage);
    expect(hullPercent(world)).toBeLessThan(100);
    expect(world.guard.deflected).toBe(0);
    // Right column, wrong moment is a failure class this creature has not got.
    expect(world.guard.mistimed).toBe(0);
    expect(world.guard.tries).toBe(1);
  });

  it("breaks the hull in the shield's own column and nowhere else", () => {
    const { world } = run([grate([4])], ticksPast, [shieldTo(TPB, 2)]);
    expect(world.scars.map((s) => s.col)).toEqual([2]);
  });

  it("is still answerable on the beat it lands: a late call saves the ship", () => {
    // Nothing moves until the wall is already standing at the shield's row —
    // the one beat of grace every arrival gets, and the reason a number that
    // crossed the room late is still worth saying.
    const late = TPB * beatsToShield;
    const { world } = run([grate([4])], ticksPast, [shieldTo(late, 4)]);
    expect(hullPercent(world)).toBe(100);
    expect(world.guard.deflected).toBe(1);
  });

  it("passes through a wall with two gaps by either of them", () => {
    for (const col of [1, 6]) {
      const { world } = run([grate([1, 6])], ticksPast, [shieldTo(TPB, col)]);
      expect(hullPercent(world)).toBe(100);
    }
  });
});

describe("a bolt and a wall", () => {
  it("goes straight through: the cannon has nothing to say to one", () => {
    // A rock in the same place would take the shot and wear a crater. A wall
    // is answered by where the dome is standing and by nothing else, so a
    // bolt fired up its column reaches whatever is above it — and player 2's
    // job while one is coming down is unchanged rather than suspended.
    const queue: SpawnEntry[] = [
      { beat: 0, col: 0, kind: "grate", color: null, gaps: [4] },
      { beat: 0, col: 4, kind: "slick", color: "red" },
    ];
    const fire: TimedCommand[] = [
      { tick: 0, player: 1, command: { kind: "cannonCol", col: 4 } },
      { tick: TPB * 2, player: 2, command: { kind: "fire", color: "red" } },
    ];
    const { world } = run(queue, TPB * 5, fire);
    expect(world.creatures.some((c) => c.kind === "slick")).toBe(false);
    const wall = wallOf(world) as Creature;
    // And no crater on it either: a wall is not a rock, so there was nothing
    // for the shot to leave a mark in on the way past.
    expect(wall.holes).toBe(0);
  });
});

describe("two devices", () => {
  it("fingerprint the same run identically", () => {
    const inputs = [shieldTo(TPB, 4), guard(TPB * 3), shieldTo(TPB * 4, 2)];
    const a = run([grate([4, 0])], TPB * 14, inputs, 5);
    const b = run([grate([4, 0])], TPB * 14, inputs, 5);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });

  it("notices a wall opened somewhere else", () => {
    const a = run([grate([4])], TPB * 4, [], 5);
    const b = run([grate([2])], TPB * 4, [], 5);
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
