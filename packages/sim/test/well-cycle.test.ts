import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NO_WELL_GRIP, type WellState } from "../src/well.js";

/**
 * **THE WELL's clock**: the face slips, a thumb on the seam holds it still,
 * and once it has slipped as far as it slips a thumb turns it home.
 *
 * One sentence, and it is the whole boss: *the clock slips — hold it, then
 * turn it home.* What the pair are actually being asked for is talking — the
 * pilot's shortcut is that the hour under a numeral is the column under it,
 * and the slip takes that away from him while she still has the flat field in
 * front of her (`src/well.ts`).
 *
 * The cases here are the cycle, one per edge, plus the two that say the
 * mistakes are not possible: a thumb that never lifts cannot hold the face
 * forever, and the navigator's thumb is not heard at all. That the field is
 * untouched by any of it is `well.test.ts`, next door, which is the older and
 * the more important claim.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function wellWorld(): World {
  const world = createWorld(CFG, 5);
  startWave(world, 3, [], [], { kind: "well" });
  return world;
}

function face(world: World): WellState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "well") throw new Error("no well installed");
  return boss;
}

/** A thumb on the seam, carried `fromMilli` thousandths of a sector round. */
function seam(world: World, on: boolean, fromMilli: number): TimedCommand[] {
  return [
    { tick: world.tick, player: 1, command: { kind: "drag", target: "wellSeam", on, fromMilli } },
  ];
}

function run(world: World, ticks: number, cmds: (w: World) => TimedCommand[]): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    step(world, cmds(world));
    seen.push(...world.events);
  }
  return seen;
}

const SILENT = (): TimedCommand[] => [];

/** Beats of rolling it takes to reach the far end with nothing holding it. */
const ROLL_BEATS = (CFG.wellRollSectors * 1000) / CFG.wellRollMilli;

describe("THE WELL's clock", () => {
  it("rests first, then starts to slip", () => {
    const world = wellWorld();
    const early = run(world, TPB * CFG.wellStillBeats - 1, SILENT);
    expect(face(world).phase, "it slipped during the rest").toBe("still");
    expect(early.some((e) => e.type === "wellRoll")).toBe(false);
    const on = run(world, TPB, SILENT);
    expect(face(world).phase).toBe("rolling");
    expect(
      on.some((e) => e.type === "wellRoll"),
      "the slip was never announced",
    ).toBe(true);
  });

  it("slips a quarter of a sector a beat until it is wound", () => {
    const world = wellWorld();
    run(world, TPB * (CFG.wellStillBeats + 1), SILENT);
    expect(face(world).offsetMilli).toBe(CFG.wellRollMilli);
    const rest = run(world, TPB * ROLL_BEATS, SILENT);
    const b = face(world);
    expect(b.offsetMilli, "it slipped past the far end").toBe(CFG.wellRollSectors * 1000);
    expect(b.phase).toBe("wound");
    expect(rest.some((e) => e.type === "wellWound")).toBe(true);
  });

  // The budget is THE CAIRN's shape: a hold that cost nothing would be a thumb
  // parked on the seam for the whole wave and no reason to talk at all.
  it("holds still under a thumb, for four beats and no more", () => {
    const world = wellWorld();
    run(world, TPB * (CFG.wellStillBeats + 1), SILENT);
    const held = face(world).offsetMilli;
    const events = run(world, TPB * CFG.wellHoldBeats, (w) => seam(w, true, 0));
    expect(face(world).offsetMilli, "the hold did not hold").toBe(held);
    expect(events.filter((e) => e.type === "wellHeld").length).toBe(CFG.wellHoldBeats);
    // And the last beat of it says nought left, which is what the pair count.
    const last = events.filter((e) => e.type === "wellHeld").at(-1);
    expect(last).toEqual({ type: "wellHeld", left: 0 });
    // Spent: the thumb is still down and the face goes on slipping under it.
    run(world, TPB, (w) => seam(w, true, 0));
    expect(face(world).offsetMilli).toBe(held + CFG.wellRollMilli);
  });

  it("is turned home from the far end, and starts over", () => {
    const world = wellWorld();
    run(world, TPB * (CFG.wellStillBeats + ROLL_BEATS + 1), SILENT);
    expect(face(world).phase).toBe("wound");
    // A grab records where the seam stood; the carry is counted from there, so
    // turning it the whole way back is the offset, negated.
    const max = CFG.wellRollSectors * 1000;
    const home = run(world, 1, (w) => seam(w, true, -max));
    const b = face(world);
    expect(b.offsetMilli, "the seam is not at twelve").toBe(0);
    expect(b.phase, "the cycle did not start over").toBe("still");
    expect(b.heldBeats, "the hold was not given back").toBe(0);
    expect(home.some((e) => e.type === "wellHome")).toBe(true);
  });

  it("lets go when the thumb lifts", () => {
    const world = wellWorld();
    run(world, TPB * (CFG.wellStillBeats + 1), (w) => seam(w, true, 0));
    expect(face(world).gripMilli).not.toBe(NO_WELL_GRIP);
    run(world, 1, (w) => seam(w, false, 0));
    expect(face(world).gripMilli).toBe(NO_WELL_GRIP);
  });

  // The seat is the argument: a well is drawn on the pilot's screen and on his
  // alone, so a seam on hers is a handle she cannot see (`render/well.ts`).
  it("does not hear the navigator", () => {
    const world = wellWorld();
    run(world, TPB * (CFG.wellStillBeats + 1), SILENT);
    const before = face(world).offsetMilli;
    run(world, TPB * CFG.wellHoldBeats, (w) => [
      {
        tick: w.tick,
        player: 2,
        command: { kind: "drag", target: "wellSeam", on: true, fromMilli: 0 },
      },
    ]);
    expect(face(world).gripMilli, "her thumb took hold of it").toBe(NO_WELL_GRIP);
    expect(face(world).offsetMilli).toBe(before + CFG.wellRollMilli * CFG.wellHoldBeats);
  });
});
