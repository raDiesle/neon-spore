import { describe, expect, it } from "bun:test";
import {
  BOSS_KINDS,
  bossFillsWave,
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  type SimConfig,
  type SimEvent,
  SPLICE_FIRST_STRAWS,
  SPLICE_SETTLE_BEATS,
  type SpliceState,
  spliceEntranceRow,
  spliceSpreadCol,
  spliceStraws,
  spliceWanted,
  spliceWantedAfterFlights,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SPLICE: straws fed in the order the numbers say.
 *
 * Almost everything here is about **when** something is judged rather than
 * what. The fight's one verb is the SUCK the pair already has, so there is no
 * new command to test; what is new is that the answer to it arrives
 * `spliceFeedBeats` after the press, that a press at another straw in between
 * is a second number on its way and one at the same straw is nothing, that
 * they land in the order they were sucked, that a wrong one costs the hull in the column it was made in, and
 * that a spent clock is the eater — a verdict on the beat it bites and a
 * breach on the beat it lands.
 *
 * The tangle itself is laid from the seeded rng, so a test may not author one —
 * it asks the state what it laid and plays against that, which is also what a
 * pair does.
 */

const CFG: SimConfig = DEFAULT_CONFIG;

/** A world with the fight installed and nothing else in it. */
function spliceWorld(rounds: number[], cfg: SimConfig = CFG): World {
  const world = createWorld(cfg, 7);
  startWave(world, 3, [], [], { kind: "splice", rounds: rounds.map((beats) => ({ beats })) });
  return world;
}

function fight(world: World): SpliceState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "splice") throw new Error("no splice installed");
  return boss;
}

/** Stand the cannon under an entrance and open the maw, on the two seats. */
function feed(world: World, entrance: number): void {
  const col = fight(world).entranceCols[entrance] as number;
  step(world, [{ tick: world.tick, player: 1, command: { kind: "cannonCol", col } }]);
  step(world, [{ tick: world.tick, player: 2, command: { kind: "intake" } }]);
}

/** Run for `n` beats and hand back everything the fight said in them. */
function beats(world: World, n: number, cfg: SimConfig = CFG): SimEvent[] {
  const said: SimEvent[] = [];
  for (let t = 0; t < ticksPerBeat(cfg) * n; t++) {
    step(world, []);
    said.push(...world.events);
  }
  return said;
}

describe("THE SPLICE", () => {
  it("fills its own wave and is in BOSS_KINDS after the twelve before it", () => {
    expect(bossFillsWave("splice")).toBe(true);
    // It was the last name on the list until THE SCOUT was appended after it
    // on 16 September 2026. What the list is about is that a name is
    // **appended, never inserted** — the index is a wire value
    // (`boss-kinds.ts`) — so the assertion is its place in the order rather
    // than its place at the end. Written as a *distance from the end* at
    // first, which is the same mistake in slower motion: THE REPRISE was
    // appended the same week and the row went red without a wire value having
    // moved. The index is the fact, and `length` below is what holds the
    // list append-only.
    expect(BOSS_KINDS.indexOf("splice")).toBe(12);
    expect(BOSS_KINDS.length, "a kind was inserted rather than appended").toBeGreaterThan(12);
  });

  it("lays a round of straws the pair can tell apart", () => {
    const s = fight(spliceWorld([24]));
    expect(s.entranceCols.length).toBe(SPLICE_FIRST_STRAWS);
    expect(spliceStraws(1)).toBe(SPLICE_FIRST_STRAWS + 1);
    // Off both walls, so *the leftmost* names a straw rather than the wall.
    expect(s.entranceCols[0]).toBeGreaterThan(0);
    expect(s.entranceCols[s.entranceCols.length - 1]).toBeLessThan(CFG.cols - 1);
    expect(s.entranceCols).toEqual([
      spliceSpreadCol(0, 2, CFG.cols),
      spliceSpreadCol(1, 2, CFG.cols),
    ]);
    // Never the identity: two straight straws side by side would leave the
    // navigator with nothing to trace and nothing to say.
    expect(s.topOf).not.toEqual([0, 1]);
  });

  it("judges a feed when it arrives, not when it is pressed", () => {
    const world = spliceWorld([40]);
    const s = fight(world);
    feed(world, spliceWanted(s));
    expect(s.flights.length, "the number left its top end").toBe(1);
    expect(s.fed, "judged on the press").toBe(0);
    beats(world, CFG.spliceFeedBeats);
    expect(s.fed, "judged on arrival").toBe(1);
    expect(s.flights).toEqual([]);
    expect(failHolds(world), "a right feed cost the hull").toBe(false);
  });

  it("takes the next suck at another straw while a number is coming down", () => {
    // The owner, 25 September 2026: while it is falling, the cannon may already
    // be at the next pipe. Both arrive, first sucked first, and both are right.
    const world = spliceWorld([40]);
    const s = fight(world);
    const first = spliceWanted(s);
    feed(world, first);
    beats(world, 1);
    const second = spliceWantedAfterFlights(s);
    expect(second, "the next straw is the other one").toBe(first === 0 ? 1 : 0);
    feed(world, second);
    expect(s.flights.map((f) => f.straw)).toEqual([first, second]);
    beats(world, CFG.spliceFeedBeats - 1);
    expect(s.fed, "the first landed on its own beat").toBe(1);
    beats(world, 1);
    expect(s.fed, "the second landed a beat later").toBe(2);
    expect(s.passBeat, "the round was not cleared").not.toBe(-1);
    expect(failHolds(world)).toBe(false);
  });

  it("will not suck a straw whose number is already coming down", () => {
    // Its top end is empty: there is nothing there to take, so the press is
    // nothing rather than a second number — and not a mistake either.
    const world = spliceWorld([40]);
    const s = fight(world);
    const right = spliceWanted(s);
    feed(world, right);
    const before = s.flights.map((f) => ({ ...f }));
    beats(world, 1);
    feed(world, right);
    expect(s.flights, "a second suck took hold").toEqual(before);
    expect(failHolds(world)).toBe(false);
  });

  it("judges numbers in the order they land, so the wrong one first costs", () => {
    const world = spliceWorld([40]);
    const s = fight(world);
    const right = spliceWanted(s);
    const wrong = right === 0 ? 1 : 0;
    feed(world, wrong);
    feed(world, right);
    expect(s.flights.length).toBe(2);
    beats(world, CFG.spliceFeedBeats);
    expect(s.fed).toBe(0);
    expect(failHolds(world), "a wrong number landing first is free").toBe(true);
  });

  it("costs the hull for a wrong feed, in the column it was made in", () => {
    const world = spliceWorld([40]);
    const s = fight(world);
    const wrong = spliceWanted(s) === 0 ? 1 : 0;
    const col = s.entranceCols[wrong] as number;
    feed(world, wrong);
    const said = beats(world, CFG.spliceFeedBeats);
    expect(s.fed).toBe(0);
    expect(failHolds(world), "a wrong feed is free").toBe(true);
    // The place is on the event, because the burst is drawn on the mouth the
    // maw was under rather than anywhere the damage lands (`effects-spark.ts`).
    const wrongly = said.find((e) => e.type === "spliceWrong");
    expect(wrongly, "nothing was said about it").toBeDefined();
    expect(wrongly).toEqual({
      type: "spliceWrong",
      col,
      row: spliceEntranceRow(CFG),
      straw: wrong,
      clock: false,
    });
  });

  it("sends the eater when the round's beats run out with nothing coming down", () => {
    const world = spliceWorld([6]);
    const s = fight(world);
    const said = beats(world, 7);
    // No straw was at fault, which is what -1 says and what `clock` is for.
    expect(said.find((e) => e.type === "spliceWrong")).toMatchObject({ straw: -1, clock: true });
    expect(s.eatBeat, "nothing took the number").not.toBe(-1);
    expect(s.eatCol).toBe(world.cannonCol);
    // The verdict is on the bite; the hull waits for the eater to arrive.
    expect(failHolds(world), "the hull broke before the eater landed").toBe(false);
    const landed = beats(world, CFG.spliceEatBeats);
    expect(failHolds(world), "the clock was free").toBe(true);
    // Slime, not a rock: the thing that came down is alive.
    expect(landed.find((e) => e.type === "breach")).toMatchObject({ col: s.eatCol, kind: "slick" });
  });

  it("shuts the maw once the eater has bitten", () => {
    const world = spliceWorld([4]);
    const s = fight(world);
    beats(world, 5);
    expect(s.eatBeat).not.toBe(-1);
    feed(world, spliceWanted(s));
    expect(s.flights, "a suck took hold of a round already lost").toEqual([]);
  });

  it("does not let the clock take a round while a number is in the air", () => {
    // The press was made in time; the two beats of travel are the fight's own.
    const world = spliceWorld([4]);
    const s = fight(world);
    beats(world, 3);
    feed(world, spliceWanted(s));
    beats(world, CFG.spliceFeedBeats - 1);
    expect(failHolds(world), "the clock ran on a pair who had answered").toBe(false);
    expect(s.eatBeat, "the eater bit a number already in the air").toBe(-1);
    beats(world, 1);
    expect(s.fed).toBe(1);
  });

  it("takes itself off the world when the last round is fed", () => {
    // Held hull, so a round can be played to the end without the wave ending
    // under it — the one caller that reaches the restart path at all.
    const cfg: SimConfig = { ...CFG, hullInvulnerable: true };
    const world = spliceWorld([80], cfg);
    const s = fight(world);
    for (let n = 0; n < s.topOf.length; n++) {
      feed(world, spliceWanted(s));
      for (let t = 0; t < ticksPerBeat(cfg) * cfg.spliceFeedBeats; t++) step(world, []);
    }
    expect(s.passBeat, "the round was not cleared").not.toBe(-1);
    for (let t = 0; t < ticksPerBeat(cfg) * SPLICE_SETTLE_BEATS; t++) step(world, []);
    expect(world.boss, "the last tangle stayed standing").toBe(null);
  });

  it("lays the next round rather than ending on the first of several", () => {
    const cfg: SimConfig = { ...CFG, hullInvulnerable: true };
    const world = spliceWorld([80, 80], cfg);
    const s = fight(world);
    for (let n = 0; n < SPLICE_FIRST_STRAWS; n++) {
      feed(world, spliceWanted(s));
      for (let t = 0; t < ticksPerBeat(cfg) * cfg.spliceFeedBeats; t++) step(world, []);
    }
    for (let t = 0; t < ticksPerBeat(cfg) * SPLICE_SETTLE_BEATS; t++) step(world, []);
    expect(s.round).toBe(1);
    expect(s.entranceCols.length, "a round that did not grow").toBe(SPLICE_FIRST_STRAWS + 1);
    expect(s.fed).toBe(0);
  });
});
