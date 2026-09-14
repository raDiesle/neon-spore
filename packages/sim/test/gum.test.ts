import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { gumIsFlung } from "../src/gum.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE GUM: a body the field's ordinary answers do nothing to, swiped away in
 * the air by a hand — either seat's, either way — or splashed across the
 * ship.
 *
 * What these pin is what a phone cannot show. That a bolt goes through it;
 * that a thumb resting on it is worth nothing and it keeps falling under the
 * finger; that a carry from either seat, either way, flings it level along
 * its row and out through the wall, on the crossing rock's own path; that one
 * standing on the ship's row is past swiping; and that one which reaches the
 * hull breaks it without a scar — the splash is the picture and the crack is
 * not part of it.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const SHIP = hullRow(CFG);
/** Comfortably past `gumSwipeMilli`, in tiles of the grip's own measure. */
const FAR = CFG.gumSwipeMilli + 300;

const gum = (col: number): SpawnEntry => ({ beat: 0, col, kind: "gum", color: null });

/** A gum authored at beat 0 lands on beat 1 at row 0 and falls a row a beat,
 * so it stands on the ship's row on beat `SHIP + 1` and is *seen* there — and
 * resolved — on the beat after. */
const LANDED_BY = TPB * (SHIP + 3);
/** A tick on which it is mid-field, a few rows above the ship. */
const MID = TPB * 3 + 2;

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
const grip = (tick: number, id: number, player: 1 | 2 = 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
/** A hand that has come `milli` from where it grabbed — the cumulative
 * distance a device reports, never an increment (`grip-push.ts`). */
const carry = (tick: number, id: number, milli: number, player: 1 | 2 = 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "gripBody", on: true, fromMilli: milli, id },
});
const swipe = (tick: number, id: number, milli: number, player: 1 | 2 = 2): TimedCommand[] => [
  grip(tick, id, player),
  carry(tick + 1, id, milli, player),
];

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
const idOf = (col: number): number => only(play([gum(col)], MID).world).id;
/** The beat after `tick`, when a carry heard on `tick` is answered. */
const nextBeat = (tick: number): number => (Math.floor(tick / TPB) + 1) * TPB;

describe("a body nothing but a hand answers", () => {
  it("falls straight down its lane", () => {
    const c = only(play([gum(2)], MID).world);
    expect(c.col).toBe(2);
    expect(c.row).toBe(2);
    expect(gumIsFlung(c)).toBe(false);
  });

  it("lets a bolt pass through it in the air", () => {
    const { world, events } = play([gum(2)], MID + 2, [aim(MID, 2), fire(MID)]);
    expect(world.bullets).toHaveLength(1);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.creatures).toHaveLength(1);
  });

  it("splashes across the hull when it reaches the ship, and breaks it without a scar", () => {
    const { world, events } = play([gum(2)], LANDED_BY);
    expect(world.creatures).toHaveLength(0);
    const hit = events.filter((e) => e.type === "breach");
    expect(hit).toHaveLength(1);
    expect(hit[0]).toMatchObject({ kind: "gum", col: 2 });
    expect(world.scars).toHaveLength(0);
    expect(events.some((e) => e.type === "gumFlung")).toBe(false);
  });
});

describe("the swipe", () => {
  const ID = idOf(2);

  it("does nothing while the thumb only rests on it, and the gum keeps falling", () => {
    const held = play([gum(2)], nextBeat(MID) + 1, [grip(MID, ID)]);
    const idle = play([gum(2)], nextBeat(MID) + 1);
    expect(gumIsFlung(only(held.world))).toBe(false);
    expect(only(held.world).row).toBe(only(idle.world).row);
    expect(held.events.some((e) => e.type === "gumFlung")).toBe(false);
  });

  it("flings it the way the hand went, level along its row, on the beat the carry is earned", () => {
    const at = nextBeat(MID + 1);
    const { world, events } = play([gum(2)], at + 1, [...swipe(MID, ID, FAR)]);
    const c = only(world);
    expect(gumIsFlung(c)).toBe(true);
    expect(c.rockDir).toBe(1);
    expect(c.rockRow).toBe(c.row);
    expect(c.col).toBe(2 + CFG.gumFlingCols);
    const flung = events.filter((e) => e.type === "gumFlung");
    expect(flung).toHaveLength(1);
    expect(flung[0]).toMatchObject({ dir: 1, col: 2 });
  });

  it("goes the other way for a hand carried the other way", () => {
    const at = nextBeat(MID + 1);
    const c = only(play([gum(8)], at + 1, [...swipe(MID, idOf(8), -FAR)]).world);
    expect(c.rockDir).toBe(-1);
    expect(c.col).toBe(8 - CFG.gumFlingCols);
  });

  it("is either seat's", () => {
    const at = nextBeat(MID + 1);
    const c = only(play([gum(2)], at + 1, [...swipe(MID, ID, FAR, 1)]).world);
    expect(gumIsFlung(c)).toBe(true);
  });

  it("leaves the field at the wall and never reaches the ship", () => {
    const row = only(play([gum(2)], nextBeat(MID + 1) + 1, [...swipe(MID, ID, FAR)]).world).row;
    const { world, events } = play([gum(2)], LANDED_BY + TPB * 3, [...swipe(MID, ID, FAR)]);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "breach")).toBe(false);
    expect(world.retries).toBe(0);
    expect(row).toBeLessThan(SHIP);
  });

  it("is refused once it stands on the ship's row", () => {
    const t = TPB * (SHIP + 1) + 1;
    const { world, events } = play([gum(2)], LANDED_BY, [...swipe(t, ID, FAR)]);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "gumFlung")).toBe(false);
    expect(events.filter((e) => e.type === "breach")).toHaveLength(1);
  });

  it("is in the hash once flung", () => {
    const at = nextBeat(MID + 1);
    const flung = play([gum(2)], at + 1, [...swipe(MID, ID, FAR)]).world;
    const idle = play([gum(2)], at + 1).world;
    expect(hashWorld(flung)).not.toBe(hashWorld(idle));
  });

  it("replays the same", () => {
    const inputs = [...swipe(MID, ID, FAR)];
    const a = play([gum(2)], LANDED_BY, inputs).world;
    const b = play([gum(2)], LANDED_BY, inputs).world;
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
