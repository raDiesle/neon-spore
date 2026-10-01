import { describe, expect, it } from "bun:test";
import {
  createRng,
  createWorld,
  hashWorld,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  VANE_CYCLE_BEATS,
  vaneColor,
  vanePhase,
  vaneTipCol,
  vaneWeakCol,
  type World,
} from "../src/index.js";
import { ARM, CFG, TPB, vane } from "./vane-fixture.js";

/**
 * THE VANE over two whole cycles with its first pins answered: the same fight
 * twice, never a draw from the rng, every landing and every beat of the arm
 * written out, and the arm's state in the fingerprint.
 */
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
    { beat: 0, col: 4, kind: "meteor", color: null },
    { beat: 3, col: 5, kind: "slick", color: "red" },
    { beat: 6, col: 10, kind: "bulb", color: "cyan" },
    { beat: 10, col: 0, kind: "meteorMedium", color: null },
    { beat: 12, col: 0, kind: "slick", color: "red" },
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
      command: { kind: "fire" as const, color: vaneColor(CFG, i) },
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
    /** Authored column, the wave beat it crossed the arm on, the tip, where it landed. */
    landings: { authored: number; at: number; tip: number; col: number }[];
    /** The tip's column, one entry per wave beat from 1. */
    arm: number[];
  }

  function play(seed: number): Run {
    // The arm reaches the hull mid-cycle; the hull is held so the whole cycle
    // is seen rather than the field stopping for the retry (`wave-fail.ts`).
    const world = createWorld({ ...CFG, hullInvulnerable: true }, seed);
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
    const authored = new Map<number, number>();
    const seen = new Set<number>();
    for (let t = 0; t < VANE_CYCLE_BEATS * 2 * TPB; t++) {
      const before = world.waveBeat;
      step(world, byTick.get(world.tick) ?? []);
      if (world.waveBeat !== before) {
        arm.push(vaneTipCol(CFG, vane(world).pins, world.waveBeat));
      }
      for (const c of world.creatures) {
        if (!authored.has(c.id)) authored.set(c.id, QUEUE[authored.size]!.col);
        if (seen.has(c.id) || c.row < ARM) continue;
        seen.add(c.id);
        landings.push({
          authored: authored.get(c.id)!,
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
      { authored: 1, at: 3, tip: 3, col: 5 },
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
      3, 3, 3, 4, 6, 7, 7, 9, 9, 6, 4, 1, 1, 1, 1, 4, 6, 9, 9, 9, 9, 6, 4, 1,
    ]);
  });

  /**
   * The cycle's own openings answer only while SWING lasts, which is the first
   * two pins. The third shot of the run is fired at an end of the sweep the
   * housing no longer splits at — the arm is in VEER by then and wants a thumb
   * on it — so it costs a colour miss and nothing else (`vane-hand.test.ts`
   * takes the third pin the way the pair now has to).
   */
  it("answers the openings its first phase has, and no more", () => {
    const { world } = play(1);
    expect(vane(world).pins).toBe(CFG.vanePins - 2);
    expect(vanePhase(vane(world).pins).name).toBe("VEER");
    expect(world.balance.colorHits).toBe(2);
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
