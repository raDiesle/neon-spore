import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { TO_THE_END } from "../src/fault-placed.js";
import { harpoonBody, harpoonDangerMilli, harpoonStillTicks } from "../src/harpoon.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * **THE LEECH and THE LIMPET as malfunctions**: a body fired at a control,
 * kept off by keeping that control moving.
 *
 * The owner asked for both by name on 14 September 2026. They ship as
 * *creatures* as well — a body that falls down a lane and is shaken off
 * (`cling.test.ts` next door) — and the first thing this file holds is that
 * the two arrivals do not interfere: a fault reels in **the body it fired**
 * and never one a wave spawned. That was not a hypothetical. The first draft
 * reeled in whatever it found of the right kind and deleted fourteen tests'
 * worth of creature out from under them.
 *
 * The rest is the three things the creature could not do: arrive without
 * falling, be judged **between beats** — a beat and a half is not a number of
 * beats — and leave when the pencil that placed it runs out.
 */

const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

/** A world on a wave placing this fault, run for `ticks` with no hands on it. */
function fired(kind: "leech" | "limpet", ticks: number, beats = TO_THE_END, moveEvery = 0): World {
  const world = createWorld({ ...CFG }, 3);
  startWave(world, 0, [], [], null, false, 0, [{ kind, at: 0, beats }]);
  for (let t = 0; t < ticks; t++) {
    // A control that keeps moving, when the caller asks for one: the column
    // alternates, which is the whole of what the pair has to keep doing.
    if (moveEvery > 0 && t % moveEvery === 0) {
      const to = t % (moveEvery * 2) === 0 ? 2 : 4;
      if (kind === "leech") world.cannonCol = to;
      else world.shieldCol = to;
    }
    step(world, []);
  }
  return world;
}

describe("a body fired at a control", () => {
  it("is on the control from the first beat of the placement, without falling", () => {
    for (const kind of ["leech", "limpet"] as const) {
      const world = fired(kind, TPB);
      const body = harpoonBody(world, kind);
      expect(body, kind).toBeDefined();
      expect(body?.clingStuck).toBe(true);
      // No lane and no fall: it is on the control's own column already.
      expect(body?.col).toBe(kind === "leech" ? world.cannonCol : world.shieldCol);
    }
  });

  it("loses the round when the control has stood still for the count", () => {
    const of = harpoonStillTicks(createWorld({ ...CFG }, 0));
    // A beat and a half at the shipped tempo, which is the owner's own figure
    // and is why the count is in ticks at all.
    expect(of).toBe(Math.round(1.5 * TPB));
    const world = fired("leech", of + 4);
    expect(harpoonBody(world, "leech")).toBeUndefined();
    expect(world.events.some((e) => e.type === "clingBlast")).toBe(false);
    // The blast is on the tick it happens; by the end of the run the scar is
    // what is left of it.
    expect(world.scars.length).toBeGreaterThan(0);
  });

  it("never gets there while the control keeps moving", () => {
    // Every half-beat, which is inside the count — the pair that keeps sliding
    // never sees the end of it.
    const world = fired("leech", TPB * 8, TO_THE_END, Math.floor(TPB / 2));
    expect(harpoonBody(world, "leech")).toBeDefined();
    expect(world.scars).toHaveLength(0);
  });

  it("is reeled in when the pencil runs out, with nothing broken", () => {
    // Placed for two beats: gone on the third, and no scar, because leaving is
    // not a hit (`harpoon.ts`).
    const world = fired("limpet", TPB * 4, 2, Math.floor(TPB / 2));
    expect(harpoonBody(world, "limpet")).toBeUndefined();
    expect(world.scars).toHaveLength(0);
    expect(world.events.some((e) => e.type === "clingFreed")).toBe(false);
  });
});

describe("the danger the control is in", () => {
  it("is nought on arrival and a thousand at the count", () => {
    const world = fired("leech", 2);
    expect(harpoonDangerMilli(world, "leech")).toBeLessThan(100);
    const late = fired("leech", harpoonStillTicks(world));
    expect(harpoonDangerMilli(late, "leech")).toBeGreaterThan(900);
  });

  it("starts again from the beginning on every move", () => {
    const of = harpoonStillTicks(createWorld({ ...CFG }, 0));
    const world = createWorld({ ...CFG }, 3);
    startWave(world, 0, [], [], null, false, 0, [{ kind: "leech", at: 0, beats: TO_THE_END }]);
    for (let t = 0; t < of - 2; t++) step(world, []);
    expect(harpoonDangerMilli(world, "leech")).toBeGreaterThan(800);
    world.cannonCol = world.cannonCol === 2 ? 3 : 2;
    step(world, []);
    expect(harpoonDangerMilli(world, "leech")).toBe(0);
  });
});

describe("the two ways the same body arrives", () => {
  it("leaves a wave's own clinger alone", () => {
    // A creature-placed limpet, on a wave that places no fault at all. Nothing
    // in `harpoon.ts` owns it, so nothing in `harpoon.ts` may take it away.
    const queue: SpawnEntry[] = [{ beat: 0, col: 3, kind: "limpet", color: null }];
    const world = createWorld({ ...CFG }, 3);
    startWave(world, 0, queue, [], null, false, 0, []);
    for (let t = 0; t < TPB * 12; t++) step(world, []);
    expect(world.creatures.some((c) => c.kind === "limpet")).toBe(true);
  });
});
