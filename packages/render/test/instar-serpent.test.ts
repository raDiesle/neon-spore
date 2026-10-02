import { afterEach, describe, expect, it } from "bun:test";
import { NO_SLOW } from "@neon-spore/sim";
import { seeFrontBody } from "../src/instar-front-body.js";
import type { Look } from "../src/instar-plate.js";
import {
  flightGrown,
  INSTAR_SERPENT,
  instarSerpent,
  REST,
  serpentAt,
} from "../src/instar-serpent.js";
import { INSTAR_FLIGHT_ENDS } from "../src/instar-shape.js";
import { acting, hung, TPB } from "./instar-kit.js";

/**
 * **THE INSTAR swims down its length** (`instar-serpent.ts`): the wave runs
 * from the neck to the rear, a crest and a quarter along the
 * body, and a crest takes four beats; the wave is the perch's swim grown in flight, with
 * no jump at either end of a flight; it swims on a step that stays too, but
 * holds still under THE SLOW; the wings take its beat only in flight; and
 * with the candidate off there is no wave at all.
 */

const END = 12;
const NO_WINDOW = { slowFromBeat: 0, slowToBeat: NO_SLOW };

/** The spine at `u`, `clock` beats in, in full flight, with the growth to the rear divided out. */
function phaseOf(clock: number, u: number): number {
  const sw = serpentAt(clock, 1);
  if (!sw) throw new Error(`no wave at ${clock}`);
  return sw.across(u) / 3 ** u;
}

describe("THE INSTAR's serpentine swim", () => {
  afterEach(() => {
    INSTAR_SERPENT.amount = 0;
  });

  it("carries what the neck does down to the rear, a crest every four beats", () => {
    INSTAR_SERPENT.amount = 1;
    for (let k = 0; k < END * TPB; k++) {
      const t = k / TPB;
      // A crest comes round every four beats, at the neck as anywhere.
      expect(phaseOf(t + 4, 0)).toBeCloseTo(phaseOf(t, 0), 9);
      // The spine `u` along does what the neck did `5u` beats before — a crest
      // and a quarter along the body — so every crest runs tailward.
      for (const u of [0.25, 0.5, 1]) expect(phaseOf(t, u)).toBeCloseTo(phaseOf(t - 5 * u, 0), 9);
    }
  });

  it("is the perch's swim grown in flight, with no jump at either end", () => {
    INSTAR_SERPENT.amount = 1;
    expect(flightGrown(0, END)).toBe(0);
    expect(flightGrown(END, END)).toBe(0);
    expect(serpentAt(0, 0)?.env).toBe(REST);
    expect(serpentAt(0, 1)?.env).toBe(1);
    let was = (serpentAt(0, 0)?.across(1) ?? 0) * REST;
    for (let k = 1; k <= END * TPB; k++) {
      const sw = serpentAt(k / TPB, flightGrown(k / TPB, END));
      const tail = sw ? sw.across(1) * sw.env : 0;
      expect(Math.abs(tail - was), `tick ${k}`).toBeLessThan(0.05);
      was = tail;
    }
    // Never past three quarters of a head radius at the rear.
    for (let k = 0; k < 4 * TPB; k++)
      expect(Math.abs(serpentAt(k / TPB, 1)?.across(1) ?? 0)).toBeLessThanOrEqual(0.75 + 1e-9);
  });

  it("swims on every step, beats the wings only in flight, and is off with the candidate off", () => {
    const world = hung();
    const s = acting(world, 0);
    const flies = s.steps.findIndex((st) => st.arrive === "passes" || st.arrive === "cross");
    const stays = s.steps.findIndex((st) => st.arrive === "stay");
    expect(flies).toBeGreaterThanOrEqual(0);
    expect(stays).toBeGreaterThanOrEqual(0);
    const at = (cursor: number) => {
      s.cursor = cursor;
      s.phase = "morph";
      s.phaseBeat = world.beat - 2;
      return instarSerpent(s, world.cfg, NO_WINDOW, world.beat, 0);
    };
    expect(at(flies)).toBeUndefined();
    INSTAR_SERPENT.amount = 1;
    expect(at(flies)?.fly).toBeGreaterThan(0.9);
    expect(at(stays)?.fly).toBe(0);
    expect(at(stays)?.env).toBe(REST);
    const step = s.steps[flies];
    s.cursor = flies;
    s.phaseBeat = world.beat - (step?.morphBeats ?? 0) * INSTAR_FLIGHT_ENDS;
    const landed = instarSerpent(s, world.cfg, NO_WINDOW, world.beat, 0);
    expect(landed?.fly).toBe(0);
    expect(landed?.env).toBe(REST);
  });

  it("holds still under THE SLOW, where the marks are up", () => {
    INSTAR_SERPENT.amount = 1;
    const world = hung();
    const s = acting(world, 0);
    const open = { slowFromBeat: world.beat - 2, slowToBeat: world.beat + 4 };
    const hushed = instarSerpent(s, world.cfg, open, world.beat, 0);
    expect(hushed?.env ?? 0).toBeLessThanOrEqual(REST * 0.05 + 1e-9);
  });

  it("swims face-on too: the tube rises and dips going back, the neck held under the head", () => {
    INSTAR_SERPENT.amount = 1;
    const neck = { x: 0, y: 0 };
    const rear = { x: 0, y: -200 };
    const seen = (serpent: Look["serpent"]) =>
      seeFrontBody({ r: 40, time: 1, serpent } as Look, neck, rear, 0);
    const still = seen(undefined);
    const swum = seen(serpentAt(1.3, 0));
    expect(swum[0]?.c.y).toBeCloseTo(still[0]?.c.y ?? Number.NaN, 9);
    const moved = swum.map((q, i) => Math.abs(q.c.y - (still[i]?.c.y ?? 0)));
    expect(Math.max(...moved)).toBeGreaterThan(1);
  });
});
