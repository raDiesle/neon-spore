import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { msToTicks } from "../src/config-derived.js";
import { NO_GRIP } from "../src/grip.js";
import { handMeans } from "../src/hand.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { weightPressMilli, weightPressTicks } from "../src/weight.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE WEIGHT, and the one thing about it that is new to this simulation: an
 * answer that is **worth nothing until both seats make it at the same time**.
 *
 * THE BALLOON already asks for two hands, and the difference is what each hand
 * is. A balloon has a handle per seat, fixed in advance, and each pull is worth
 * something on its own — it stretches that side, and the other player can see it
 * stretch. Here both hands are the same gesture on the same body, neither is
 * worth a thousandth alone, and the only thing either player is shown is their
 * own thumb (`render/weight.ts`). So what the tests below hold is mostly
 * *nothing happening*: one hand for a whole wave, two hands a beat apart, a hand
 * that lifts a tick early — all of them are a body still falling.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const SHIP = hullRow(CFG);
/** Ticks both thumbs have to be down. The rule reads it off the config the same
 * way, so this is the figure and not a copy of it. */
const CRUSH = msToTicks(CFG, CFG.weightCrushMs);

const weight = (col: number): SpawnEntry => ({ beat: 0, col, kind: "weight", color: null });

const press = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
const lift = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id: NO_GRIP },
});

interface Run {
  world: World;
  events: SimEvent[];
}

function play(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
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

const only = (world: World): Creature => {
  expect(world.creatures).toHaveLength(1);
  return world.creatures[0] as Creature;
};

/** The id the body gets: the first thing this wave spawns. */
const ID = 1;
/** A tick the body is comfortably on the field and nowhere near the hull. */
const MID = TPB * 3;

describe("a hand on a weight", () => {
  it("is a press for either seat, and neither a brake nor an aim", () => {
    // The third thing a hand can be (`hand.ts`). A brake would let one player
    // buy time alone and an aim would let the pilot shoot it, and the creature
    // is that neither is on offer.
    expect(handMeans("weight", 1)).toBe("press");
    expect(handMeans("weight", 2)).toBe("press");
  });

  it("does nothing at all on its own, however long it is held", () => {
    // A whole wave of one thumb. The body is exactly where it would have been
    // with nobody touching it, and the press has counted nothing.
    const held = play([weight(3)], TPB * (SHIP + 1), [press(1, 1, ID)]);
    const alone = play([weight(3)], TPB * (SHIP + 1));
    expect(weightPressTicks(only(held.world))).toBe(0);
    expect(only(held.world).row).toBe(only(alone.world).row);
    expect(held.events.some((e) => e.type === "weightCrushed")).toBe(false);
  });

  it("does not slow it, which a hand on a rock would", () => {
    // `grippedFallTiles` reads `handMeans` and asks for a brake; a press is not
    // one, so the fall rate is untouched and `dragMilli` never moves.
    const held = play([weight(3)], MID, [press(1, 1, ID), press(1, 2, ID)]);
    expect(only(held.world).dragMilli).toBe(0);
  });
});

describe("both hands on a weight", () => {
  it("crush it once the press has held for the whole window", () => {
    const run = play([weight(3)], MID + CRUSH + 4, [press(MID, 1, ID), press(MID, 2, ID)]);
    expect(run.world.creatures).toEqual([]);
    const crushed = run.events.filter((e) => e.type === "weightCrushed");
    expect(crushed).toHaveLength(1);
    expect(crushed[0]).toEqual({ type: "weightCrushed", col: 3, row: expect.any(Number) });
  });

  it("do not crush it a tick early", () => {
    // The window is a floor and not a guess: one tick short is a body still
    // falling, which is what makes `weightCrushMs` worth tuning.
    const run = play([weight(3)], MID + CRUSH - 1, [press(MID, 1, ID), press(MID, 2, ID)]);
    expect(run.world.creatures).toHaveLength(1);
    expect(weightPressTicks(only(run.world))).toBe(CRUSH - 1);
  });

  it("count the streak, because it is the one kill both seats made together", () => {
    const run = play([weight(3)], MID + CRUSH + 4, [press(MID, 1, ID), press(MID, 2, ID)]);
    expect(run.world.balance.streak).toBe(1);
    expect(run.world.balance.bestStreak).toBe(1);
  });

  it("spend the whole press when one of them lifts, rather than banking it", () => {
    // Two players who each press for most of the window separately have done
    // nothing. Holding the count back would make this a body worn down by taking
    // turns, and taking turns is the one thing it must not reward.
    const nearly = CRUSH - 2;
    const run = play([weight(3)], MID + nearly + 4, [
      press(MID, 1, ID),
      press(MID, 2, ID),
      lift(MID + nearly, 2),
      press(MID + nearly + 1, 2, ID),
    ]);
    // Still there, and the count is back near nought rather than two short of
    // full: the window has to be earned again from the beginning.
    expect(run.world.creatures).toHaveLength(1);
    expect(weightPressTicks(only(run.world))).toBeLessThan(4);
  });

  it("give nothing to a pair who arrive a beat apart and hold a beat each", () => {
    // The mistake the wave is written about: both of them press, neither of them
    // at the same time as the other.
    const run = play([weight(3)], MID + TPB * 3, [
      press(MID, 1, ID),
      lift(MID + TPB, 1),
      press(MID + TPB + 1, 2, ID),
      lift(MID + TPB * 2, 2),
    ]);
    expect(run.world.creatures).toHaveLength(1);
    expect(run.events.some((e) => e.type === "weightCrushed")).toBe(false);
  });
});

describe("a weight nobody stops", () => {
  it("reaches the hull and fails the wave", () => {
    // No shot reaches it and the shield has nothing to say to it, so a pair who
    // never agree on a beat lose the wave to it.
    const run = play([weight(3)], TPB * (SHIP + 3));
    expect(run.world.retries).toBe(1);
    expect(run.events.some((e) => e.type === "waveFailed")).toBe(true);
  });

  it("is not answered by a shot in either colour", () => {
    const shots: TimedCommand[] = [
      { tick: TPB, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: TPB * 2, player: 2, command: { kind: "fire", color: "red" } },
      { tick: TPB * 3, player: 2, command: { kind: "fire", color: "cyan" } },
    ];
    const run = play([weight(3)], TPB * (SHIP + 1), shots);
    expect(run.world.creatures).toHaveLength(1);
  });
});

describe("the readout", () => {
  it("is nought before a press and full on the tick it gives", () => {
    const before = play([weight(3)], MID, [press(MID - 1, 1, ID), press(MID - 1, 2, ID)]);
    expect(weightPressMilli(before.world, only(before.world))).toBeGreaterThan(0);

    const fresh = play([weight(3)], MID);
    expect(weightPressMilli(fresh.world, only(fresh.world))).toBe(0);
  });

  it("never reads full before the body has actually given", () => {
    // The rounding belongs to the picture and must never decide the moment
    // (`balloonTension` and `lidIsOpen` are on the same arrangement). A body
    // still on the field one tick short may read 999 and must not read 1000.
    const run = play([weight(3)], MID + CRUSH - 1, [press(MID, 1, ID), press(MID, 2, ID)]);
    expect(weightPressMilli(run.world, only(run.world))).toBeLessThan(1000);
  });
});

describe("determinism", () => {
  it("fingerprints the same twice, press and all", () => {
    // Two runs in one process, never a pinned constant (`docs/decisions.md` #19):
    // what matters for lockstep is that two phones on the same build agree.
    const inputs = [press(MID, 1, ID), press(MID, 2, ID), lift(MID + 3, 1), press(MID + 5, 1, ID)];
    const a = play([weight(3), weight(5)], MID + CRUSH * 2, inputs);
    const b = play([weight(3), weight(5)], MID + CRUSH * 2, inputs);
    expect(hashWorld(b.world)).toBe(hashWorld(a.world));
  });

  it("fingerprints differently from a run where only one hand pressed", () => {
    // The press is in the hash, so a world where both thumbs are down is not the
    // world where one is — which is the whole reason it is in there.
    const both = play([weight(3)], MID + 4, [press(MID, 1, ID), press(MID, 2, ID)]);
    const one = play([weight(3)], MID + 4, [press(MID, 1, ID)]);
    expect(hashWorld(one.world)).not.toBe(hashWorld(both.world));
  });
});
