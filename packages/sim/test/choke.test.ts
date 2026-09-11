import { describe, expect, it } from "bun:test";
import { chokeIsStuck, chokeTapsSoFar } from "../src/choke.js";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE CHOKE, and the two things about it that are new to this simulation.
 *
 * The first is a body that takes a **control** rather than a lane: from the
 * beat it lands the cannon strip answers nobody and the cannon walks the hull
 * wall to wall on its own, a column a beat, while player 2's trigger goes on
 * working from wherever it happens to be.
 *
 * The second is an answer that is a **count** rather than a place. Nothing
 * gets it off but player 1 pressing the dead strip `chokeTaps` times, a lift
 * between each — a thumb held down is one press however long it stays, and
 * the other seat's thumb is nothing.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const SHIP = hullRow(CFG);
const MID = Math.floor(CFG.cols / 2);

const choke = (col: number, beat = 0): SpawnEntry => ({ beat, col, kind: "choke", color: null });

/** A choke authored at beat 0 lands on beat 1 at row 0 and falls a row a
 * beat, stands on the ship's row on beat `SHIP + 1` and is *seen* there — and
 * takes the cannon — on the tick that starts the beat after (`chokeLands`
 * reads `fromRow`). One beat earlier it is still a body in the air. */
const STUCK_BY = TPB * (SHIP + 2);

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const press = (tick: number, id: number, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "choke", on: true, fromMilli: 0, id },
});
const lift = (tick: number, id: number, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "choke", on: false, fromMilli: 0, id },
});
/** `n` fresh taps from `from`, two ticks apart, each with its lift. */
function taps(from: number, n: number, id: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let k = 0; k < n; k++) out.push(press(from + k * 2, id), lift(from + k * 2 + 1, id));
  return out;
}

interface Run {
  world: World;
  events: SimEvent[];
  /** The cannon's column at the start of every tick, for reading the walk. */
  cannon: number[];
}

function play(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  const cannon: number[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
    cannon.push(world.cannonCol);
  }
  return { world, events, cannon };
}

const only = (world: World): Creature => {
  expect(world.creatures).toHaveLength(1);
  return world.creatures[0] as Creature;
};

describe("THE CHOKE takes the cannon", () => {
  it("falls its lane, is not stopped, and takes hold on the beat it is drawn standing", () => {
    const early = play([choke(1)], STUCK_BY - TPB);
    expect(chokeIsStuck(only(early.world))).toBe(false);
    const { world, events } = play([choke(1)], STUCK_BY);
    const c = only(world);
    expect(chokeIsStuck(c)).toBe(true);
    expect(c.col).toBe(MID);
    expect(events.filter((e) => e.type === "chokeGrip")).toHaveLength(1);
    expect(events.some((e) => e.type === "breach")).toBe(false);
    expect(world.hullMilli).toBe(100_000);
  });

  it("walks the cannon a column a beat and turns at the walls", () => {
    const beats = CFG.cols * 2 + 2;
    const { cannon } = play([choke(3)], STUCK_BY + TPB * beats);
    const walked = cannon.filter((_, t) => t >= STUCK_BY && t % TPB === STUCK_BY % TPB);
    // From the middle away from the nearer wall — right, at an odd count —
    // one column a beat, and every step is a step: never the same column twice.
    for (let i = 1; i < walked.length; i++) {
      expect(Math.abs((walked[i] as number) - (walked[i - 1] as number))).toBe(1);
    }
    expect(Math.min(...walked)).toBe(0);
    expect(Math.max(...walked)).toBe(CFG.cols - 1);
  });

  it("swallows the strip: a slide moves nothing while it has the cannon", () => {
    const { world } = play([choke(1)], STUCK_BY + TPB, [aim(STUCK_BY + 2, 0)]);
    expect(world.cannonCol).not.toBe(0);
    const free = play([], STUCK_BY + TPB, [aim(STUCK_BY + 2, 0)]);
    expect(free.world.cannonCol).toBe(0);
  });
});

describe("player 1 taps it off", () => {
  const stuckId = (): number => only(play([choke(1)], STUCK_BY).world).id;

  it("counts a fresh press once, however long the thumb stays down", () => {
    const id = stuckId();
    const held = play([choke(1)], STUCK_BY + 40, [
      press(STUCK_BY + 1, id),
      press(STUCK_BY + 3, id),
      press(STUCK_BY + 9, id),
    ]);
    expect(chokeTapsSoFar(only(held.world))).toBe(1);
    const tapped = play([choke(1)], STUCK_BY + 40, taps(STUCK_BY + 1, 3, id));
    expect(chokeTapsSoFar(only(tapped.world))).toBe(3);
    expect(tapped.events.filter((e) => e.type === "chokeTap")).toHaveLength(3);
  });

  it("hears nothing from the other seat", () => {
    const id = stuckId();
    const { world } = play([choke(1)], STUCK_BY + 20, [
      press(STUCK_BY + 1, id, 2),
      lift(STUCK_BY + 2, id, 2),
      press(STUCK_BY + 3, id, 2),
    ]);
    expect(chokeTapsSoFar(only(world))).toBe(0);
  });

  it("lets go at chokeTaps, for the score, and the strip is a strip again", () => {
    const id = stuckId();
    const n = CFG.chokeTaps;
    const freedAt = STUCK_BY + 1 + (n - 1) * 2;
    const { world, events } = play([choke(1)], freedAt + TPB, [
      ...taps(STUCK_BY + 1, n, id),
      aim(freedAt + 2, 0),
    ]);
    expect(world.creatures).toHaveLength(0);
    expect(events.filter((e) => e.type === "chokeFreed")).toHaveLength(1);
    // Its own score, and the wave's for the field it left empty.
    expect(world.score).toBe(CFG.scoreChokeFreed + CFG.scoreWave);
    expect(world.cannonCol).toBe(0);
    // One short, and it still has the cannon.
    const short = play([choke(1)], freedAt + TPB, taps(STUCK_BY + 1, n - 1, id));
    expect(chokeIsStuck(only(short.world))).toBe(true);
  });

  it("takes a fast thumb five seconds or more to get off", () => {
    // Two ticks a tap is far faster than a thumb; the count is what makes the
    // time, and at the tempo the game plays at it has to be at least five
    // seconds of it, or the wave's whole question — keep going — is not asked.
    const fastTapSeconds = 0.16;
    expect(CFG.chokeTaps * fastTapSeconds).toBeGreaterThanOrEqual(5);
  });

  it("fingerprints the same twice", () => {
    const id = stuckId();
    const inputs = [...taps(STUCK_BY + 1, 12, id), aim(STUCK_BY + 5, 2)];
    const a = play([choke(2), choke(4, 8)], STUCK_BY + TPB * 6, inputs);
    const b = play([choke(2), choke(4, 8)], STUCK_BY + TPB * 6, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });
});
