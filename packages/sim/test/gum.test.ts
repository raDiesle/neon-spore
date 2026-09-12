import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { gumFlingDir, gumIsStuck } from "../src/gum.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE GUM, and the two things about it that are new to this simulation.
 *
 * The first is an arrival that does not **end** at the ship. Everything else
 * that reaches the hull either breaks it or is turned away by the guard; a
 * gum sticks, and from that beat on it is a fact about the ship rather than a
 * body on the field — the cannon under it fires nothing.
 *
 * The second is an answer made of the seats **reversed**. THE BALLOON asks for
 * two hands at once; this asks for one hand where the other seat's control is
 * standing. Player 1 parks the cannon and cannot swipe, player 2 swipes and
 * cannot park, and a swipe with no cannon under it moves nothing at all. The
 * wrong way is charged a lane, once per grab.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const SHIP = hullRow(CFG);
/** Comfortably past `gumSwipeMilli`. */
const FAR = CFG.gumSwipeMilli + 300;

const gum = (col: number): SpawnEntry => ({ beat: 0, col, kind: "gum", color: null });

/** A gum authored at beat 0 lands on beat 1 at row 0 and falls a row a beat,
 * so it stands on the ship's row on beat `SHIP + 1` and is *seen* there — and
 * sticks — on the beat after (`gumLands` reads `fromRow`). */
const STUCK_BY = TPB * (SHIP + 3);

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color: "red" },
});
const swipe = (tick: number, milli: number, id: number, player: 1 | 2 = 2): TimedCommand[] => [
  { tick, player, command: { kind: "drag", target: "gum", on: true, fromMilli: 0, id } },
  {
    tick: tick + 1,
    player,
    command: { kind: "drag", target: "gum", on: true, fromMilli: milli, id },
  },
];
const lift = (tick: number, id: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "drag", target: "gum", on: false, fromMilli: 0, id },
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

/** The id a first arrival gets, read off a run rather than assumed. */
const idOf = (col: number): number => only(play([gum(col)], STUCK_BY).world).id;

describe("a body that sticks", () => {
  it("falls straight down its lane and sticks to the ship once, saying so once", () => {
    const { world, events } = play([gum(2)], STUCK_BY + TPB * 3);
    const c = only(world);
    expect(gumIsStuck(c)).toBe(true);
    expect(c.col).toBe(2);
    expect(c.row).toBe(SHIP);
    expect(events.filter((e) => e.type === "gumStick")).toHaveLength(1);
    expect(events.some((e) => e.type === "breach")).toBe(false);
    expect(world.retries).toBe(0);
  });

  it("is not stuck before the beat it is seen standing on the hull", () => {
    const { world } = play([gum(2)], TPB * (SHIP + 1) + 1);
    expect(gumIsStuck(only(world))).toBe(false);
  });

  it("lets a bolt pass through it in the air", () => {
    // A red bolt up the lane it is falling in, on a beat it is mid-field:
    // the bolt keeps going and the gum keeps falling.
    const t = TPB * 4 + 2;
    const { world, events } = play([gum(2)], t + 2, [aim(t, 2), fire(t)]);
    expect(world.bullets).toHaveLength(1);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.creatures).toHaveLength(1);
  });

  it("refuses the shot from under it, and says so, and fires from beside it", () => {
    const t = STUCK_BY + 2;
    const under = play([gum(2)], t + 2, [aim(t, 2), fire(t)]);
    expect(under.world.bullets).toHaveLength(0);
    expect(under.events.filter((e) => e.type === "gumBlock")).toHaveLength(1);
    const beside = play([gum(2)], t + 2, [aim(t, 3), fire(t)]);
    expect(beside.world.bullets).toHaveLength(1);
    expect(beside.events.some((e) => e.type === "gumBlock")).toBe(false);
  });
});

describe("the swipe", () => {
  const ID = idOf(2);
  /** Column 2 of eleven is nearer the left wall. */
  const AWAY = gumFlingDir(CFG.cols, { col: 2, span: 1 } as Creature);
  const t = STUCK_BY + 2;

  it("goes toward the nearer wall", () => {
    expect(AWAY).toBe(-1);
    expect(gumFlingDir(CFG.cols, { col: 8, span: 1 } as Creature)).toBe(1);
  });

  it("moves nothing while the cannon is not under it", () => {
    const { world, events } = play([gum(2)], t + 4, [aim(t, 6), ...swipe(t + 1, AWAY * FAR, ID)]);
    const c = only(world);
    expect(gumIsStuck(c)).toBe(true);
    expect(c.gumPull).toBe(0);
    expect(events.some((e) => e.type === "gumFlung" || e.type === "gumSpread")).toBe(false);
  });

  it("flings it off the ship toward the nearer wall, for the score", () => {
    const { world, events } = play([gum(2)], t + 4, [aim(t, 2), ...swipe(t + 1, AWAY * FAR, ID)]);
    expect(world.creatures).toHaveLength(0);
    expect(world.score).toBe(CFG.scoreGumFlung);
    const flung = events.find((e) => e.type === "gumFlung");
    expect(flung).toMatchObject({ dir: AWAY, col: 2 });
  });

  it("spreads it a lane wider the wrong way, once per grab", () => {
    const wrong = -AWAY * FAR;
    const { world, events } = play([gum(2)], t + 8, [
      aim(t, 2),
      ...swipe(t + 1, wrong, ID),
      // Carried further still on the same grab: nothing more happens.
      {
        tick: t + 3,
        player: 2,
        command: { kind: "drag", target: "gum", on: true, fromMilli: wrong * 2, id: ID },
      },
    ]);
    const c = only(world);
    expect(c.span).toBe(1 + CFG.gumSpreadCols);
    // Pushed rightward, it grows to the right: the left edge stays.
    expect(c.col).toBe(2);
    expect(events.filter((e) => e.type === "gumSpread")).toHaveLength(1);
    expect(world.score).toBe(0);
  });

  it("may be tried again after the hand lifts, and the cannon still under it flings it", () => {
    const wrong = -AWAY * FAR;
    const { world } = play([gum(2)], t + 10, [
      aim(t, 2),
      ...swipe(t + 1, wrong, ID),
      lift(t + 3, ID),
      ...swipe(t + 4, AWAY * FAR, ID),
    ]);
    expect(world.creatures).toHaveLength(0);
  });

  it("is player 2's and nobody else's", () => {
    const { world } = play([gum(2)], t + 4, [aim(t, 2), ...swipe(t + 1, AWAY * FAR, ID, 1)]);
    expect(gumIsStuck(only(world))).toBe(true);
  });

  it("is in the hash while it is held", () => {
    const grabbed = play([gum(2)], t + 3, [aim(t, 2), ...swipe(t + 1, 200, ID)]).world;
    const idle = play([gum(2)], t + 3, [aim(t, 2)]).world;
    expect(hashWorld(grabbed)).not.toBe(hashWorld(idle));
  });

  it("replays the same", () => {
    const inputs = [aim(t, 2), ...swipe(t + 1, -AWAY * FAR, ID), lift(t + 3, ID)];
    const a = play([gum(2)], t + 6, inputs).world;
    const b = play([gum(2)], t + 6, inputs).world;
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
