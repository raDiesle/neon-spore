import { describe, expect, it } from "bun:test";
import {
  createRng,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  VANE_CYCLE_BEATS,
  type VaneState,
  vaneColor,
  vaneFold,
  vaneOpen,
  vaneOpening,
  vanePhase,
  vanePivotCol,
  vaneTipCol,
  vaneWeakCol,
  type World,
} from "../src/index.js";
import { NO_SHELL } from "../src/shell.js";
import { colSpan } from "../src/types.js";

/**
 * THE VANE: the boss that bends the field instead of the beat.
 *
 * The claim the whole encounter rests on is one sentence — *something crossing
 * the arm three columns to its left comes out three columns to its right* —
 * and most of what is checked here is that sentence staying true and staying
 * the *only* one. A field that moved a second time, or moved something already
 * standing on it, would not be a harder boss, it would be a radar the pair
 * cannot believe, and `docs/spec/transfers-bosses.md` says that is the failure
 * mode this design is one edit away from.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);
const PIVOT = vanePivotCol(CFG);

function open(pins?: number, queue: SpawnEntry[] = []): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, queue, [], { kind: "vane", pins });
  return world;
}

function beats(world: World, n: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < n * TPB; t++) step(world, byTick.get(world.tick) ?? []);
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

/** Where a body authored into `col` actually comes down. */
function landed(col: number, kind: SpawnEntry["kind"], atBeat: number): number {
  const world = open(undefined, [{ beat: atBeat, col, kind, color: null }]);
  beats(world, atBeat + 1);
  const body = world.creatures[0];
  if (!body) throw new Error("nothing arrived");
  return body.col;
}

describe("the arm", () => {
  it("takes the field as a mechanism, not a body", () => {
    const world = open();
    // Nothing of it is on the grid: no creature to fall, to shoot, to ward or
    // to put a hand on. It hangs off the top edge.
    expect(world.creatures).toEqual([]);
    expect(vane(world).pins).toBe(CFG.vanePins);
  });

  it("holds the wave open even with an empty field", () => {
    const world = open();
    beats(world, VANE_CYCLE_BEATS * 2);
    expect(world.boss).not.toBeNull();
    expect(world.restBeat).toBe(0);
  });

  it("folds an arrival about the column its tip is standing in", () => {
    // Beat 1 of the wave: held hard left, tip at PIVOT - reach.
    const tip = vaneTipCol(CFG, CFG.vanePins, 1);
    expect(landed(0, "meteor", 0)).toBe(vaneFold(CFG, tip, 0, colSpan("meteor")));
    expect(landed(PIVOT, "meteor", 0)).toBe(vaneFold(CFG, tip, PIVOT, colSpan("meteor")));
  });

  it("leaves a body that comes in under the tip exactly where it was aimed", () => {
    const tip = vaneTipCol(CFG, CFG.vanePins, 1);
    expect(landed(tip, "meteor", 0)).toBe(tip);
  });

  it("throws in the other direction when the arm is at the other end", () => {
    // The wave's beat 7 is the far end of the sweep; a body authored to beat 6
    // arrives on it.
    const early = landed(0, "meteor", 0);
    const late = landed(0, "meteor", 6);
    expect(late).not.toBe(early);
    expect(late).toBe(vaneFold(CFG, vaneTipCol(CFG, CFG.vanePins, 7), 0, colSpan("meteor")));
  });

  /**
   * The honesty guarantee, and the reason this boss is a rule rather than
   * noise: it touches an arrival once, on the beat it arrives, and never again.
   * Everything standing on the field keeps the column it is standing in for the
   * whole of its fall, so a column the pair have said out loud stays said.
   */
  it("never moves anything twice", () => {
    const world = open(undefined, [{ beat: 0, col: 0, kind: "meteor", color: null }]);
    beats(world, 1);
    const col = world.creatures[0]!.col;
    for (let b = 0; b < 8; b++) {
      beats(world, 1);
      const body = world.creatures.find((c) => c.kind === "meteor");
      if (!body) break;
      expect(body.col).toBe(col);
    }
  });

  it("reaches further for every pin that comes out", () => {
    const near = vanePhase(CFG.vanePins).reach;
    const far = vanePhase(1).reach;
    expect(far).toBeGreaterThan(near);
    expect(vaneTipCol(CFG, 1, 1)).toBeLessThan(vaneTipCol(CFG, CFG.vanePins, 1));
  });
});

/**
 * One shot up `col`, fired now and followed for three beats — long enough for
 * it to cross the field and leave through the top, which is where the bearing
 * hangs and the only place this boss can be answered.
 */
function shoot(world: World, col: number, color: "red" | "cyan"): World {
  const at = world.tick;
  return beats(world, 3, [
    { tick: at, player: 1, command: { kind: "cannonCol", col } },
    { tick: at + 2, player: 2, command: { kind: "fire", color } },
  ]);
}

describe("the bearing", () => {
  it("is split at each end of the sweep and nowhere else", () => {
    const world = open();
    beats(world, 1);
    expect(vaneOpen(world)).toBe(true);
    beats(world, 3);
    expect(vaneOpen(world)).toBe(false);
    beats(world, 3);
    expect(vaneOpen(world)).toBe(true);
  });

  it("takes a pin from a shot in the split column, in the split's colour", () => {
    const world = beats(open(), 1);
    shoot(world, vaneWeakCol(CFG, world.waveBeat), vaneColor(vaneOpening(world.waveBeat)));
    expect(vane(world).pins).toBe(CFG.vanePins - 1);
    expect(world.score).toBe(CFG.scoreVanePin);
  });

  it("refuses the wrong colour, and books it against the colour balance", () => {
    const world = beats(open(), 1);
    const right = vaneColor(vaneOpening(world.waveBeat));
    shoot(world, vaneWeakCol(CFG, world.waveBeat), right === "red" ? "cyan" : "red");
    expect(vane(world).pins).toBe(CFG.vanePins);
    expect(world.balance.colorMisses).toBe(1);
  });

  it("refuses the wrong column, and does not call that a colour miss", () => {
    const world = beats(open(), 1);
    shoot(world, PIVOT, vaneColor(vaneOpening(world.waveBeat)));
    expect(vane(world).pins).toBe(CFG.vanePins);
    expect(world.balance.colorMisses).toBe(0);
  });

  it("refuses everything while the housing is shut", () => {
    // Cycle beat 4 is mid-sweep, and a shot fired there arrives before the arm
    // has finished travelling. Both columns and both colours, so nothing about
    // this is an aim that happened to be wrong.
    for (const col of [PIVOT - 1, PIVOT + 1]) {
      for (const color of ["red", "cyan"] as const) {
        const world = beats(open(), 4);
        expect(vaneOpen(world)).toBe(false);
        shoot(world, col, color);
        expect(vane(world).pins).toBe(CFG.vanePins);
      }
    }
  });

  it("gives one pin per opening and no more, so a spray cannot skip one", () => {
    const world = beats(open(), 1);
    const col = vaneWeakCol(CFG, world.waveBeat);
    const color = vaneColor(vaneOpening(world.waveBeat));
    const at = world.tick;
    beats(world, 3, [
      { tick: at, player: 1, command: { kind: "cannonCol", col } },
      { tick: at + 2, player: 2, command: { kind: "fire", color } },
      { tick: at + TPB, player: 2, command: { kind: "fire", color } },
    ]);
    expect(vane(world).pins).toBe(CFG.vanePins - 1);
  });

  it("is not reachable up a column that has something standing in it", () => {
    // A rock cannot be shot and stops a shot going up its column, so the arm
    // defends its own bearing with whatever it has just thrown into that lane.
    const world = beats(open(), 1);
    const col = vaneWeakCol(CFG, world.waveBeat);
    world.creatures.push({
      id: world.nextId++,
      kind: "meteor",
      col,
      row: 4,
      fromRow: 4,
      color: null,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      shell: NO_SHELL,
    });
    shoot(world, col, vaneColor(vaneOpening(world.waveBeat)));
    expect(vane(world).pins).toBe(CFG.vanePins);
  });

  it("goes down on its last pin and lets the wave finish", () => {
    const world = beats(open(1), 1);
    shoot(world, vaneWeakCol(CFG, world.waveBeat), vaneColor(vaneOpening(world.waveBeat)));
    expect(world.boss).toBeNull();
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreVanePin + CFG.scoreVaneDown);
  });
});

describe("a full cycle, pinned", () => {
  /**
   * A wave authored so that nothing lands in a column the pair have to fire up
   * on the beat they have to fire it. That is not a convenience — it is the
   * fight: a shot stops at the first body in its way, so the arm defends its
   * own bearing with whatever it has just thrown, and a wave that throws into
   * both weak columns is a wave with no answer in it.
   */
  const QUEUE: SpawnEntry[] = [
    { beat: 0, col: 1, kind: "meteor", color: null },
    { beat: 2, col: 4, kind: "meteor", color: null },
    { beat: 5, col: 5, kind: "slick", color: "red" },
    { beat: 8, col: 10, kind: "bulb", color: "cyan" },
    { beat: 11, col: 0, kind: "meteorMedium", color: null },
    { beat: 14, col: 0, kind: "slick", color: "red" },
  ];

  /** One answered opening in each of the first three, on the beat each opens. */
  const INPUTS: TimedCommand[] = [1, 7, 13].flatMap((beat, i) => [
    {
      tick: beat * TPB,
      player: 1 as const,
      command: { kind: "cannonCol" as const, col: vaneWeakCol(CFG, beat) },
    },
    {
      tick: beat * TPB + 4,
      player: 2 as const,
      command: { kind: "fire" as const, color: vaneColor(i) },
    },
  ]);

  /**
   * One run, and what it did along the way: where each arrival came down, and
   * which column the arm stood in on every beat. Both are collected as the
   * world ticks, because a body that has reached the hull is no longer there
   * to be asked at the end.
   */
  interface Run {
    world: World;
    /** Authored column, the wave beat it arrived on, the tip, where it landed. */
    landings: { authored: number; at: number; tip: number; col: number }[];
    /** The tip's column, one entry per wave beat from 1. */
    arm: number[];
  }

  function play(seed: number): Run {
    const world = createWorld({ ...CFG }, seed);
    startWave(
      world,
      0,
      QUEUE.map((e) => ({ ...e })),
      [],
      { kind: "vane" },
    );
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of INPUTS) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);

    const landings: Run["landings"] = [];
    const arm: number[] = [];
    const seen = new Set<number>();
    for (let t = 0; t < VANE_CYCLE_BEATS * 2 * TPB; t++) {
      const before = world.waveBeat;
      step(world, byTick.get(world.tick) ?? []);
      if (world.waveBeat !== before) {
        arm.push(vaneTipCol(CFG, vane(world).pins, world.waveBeat));
      }
      for (const c of world.creatures) {
        if (seen.has(c.id)) continue;
        seen.add(c.id);
        landings.push({
          authored: QUEUE[landings.length]!.col,
          at: world.waveBeat,
          tip: vaneTipCol(CFG, vane(world).pins, world.waveBeat),
          col: c.col,
        });
      }
    }
    return { world, landings, arm };
  }

  it("plays the same fight twice", () => {
    expect(hashWorld(play(1).world)).toBe(hashWorld(play(1).world));
  });

  /**
   * Nothing about this fight is drawn from the rng, so the seed never moves —
   * the same claim THE MIRROR and THE WARDEN make, and the one that lets a boss
   * be authored rather than balanced.
   */
  it("never reaches for the rng", () => {
    expect(play(1).world.rng.state).toBe(createRng(1).state);
    expect(play(999).world.rng.state).toBe(createRng(999).state);
  });

  /**
   * What the cycle *did*, written out so the fold can be checked by hand:
   * every landing is twice the tip less the authored column, and not one of
   * them is clamped against an edge, so each row is the whole rule rather than
   * the edge case. A moved number here names what changed, which a moved
   * fingerprint never does (`docs/decisions.md` #19).
   */
  it("throws every arrival to the far side of the arm, and says which column", () => {
    expect(play(1).landings).toEqual([
      { authored: 1, at: 1, tip: 3, col: 5 },
      { authored: 4, at: 3, tip: 3, col: 2 },
      { authored: 5, at: 6, tip: 7, col: 9 },
      { authored: 10, at: 9, tip: 9, col: 8 },
      { authored: 0, at: 12, tip: 1, col: 2 },
      { authored: 0, at: 15, tip: 1, col: 2 },
    ]);
  });

  /**
   * The arm, beat by beat, over two cycles: held three beats at an end, three
   * beats across, and reaching two columns wider from the moment the second pin
   * comes out. The health bar is the shape of this list.
   */
  it("stands where the tables say, and reaches further as its pins go", () => {
    expect(play(1).arm).toEqual([
      3, 3, 3, 4, 6, 7, 7, 7, 9, 6, 4, 1, 1, 1, 1, 4, 6, 9, 9, 9, 9, 6, 4, 1,
    ]);
  });

  it("answers all three openings", () => {
    const { world } = play(1);
    expect(vane(world).pins).toBe(CFG.vanePins - 3);
    expect(world.balance.colorHits).toBe(3);
    expect(vane(world).throwBeat).toBeGreaterThan(0);
  });

  it("carries the arm's own state into the fingerprint", () => {
    const a = play(1).world;
    const b = play(1).world;
    vane(b).pins -= 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
    const c = play(1).world;
    c.boss = { ...vane(c), throwCol: vane(c).throwCol + 1 };
    expect(hashWorld(a)).not.toBe(hashWorld(c));
  });
});
