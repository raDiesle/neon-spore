import { afterEach, describe, expect, it } from "bun:test";
import { INSTAR_SERPENT, instarSerpent, serpentAt } from "../src/instar-serpent.js";
import { INSTAR_FLIGHT_ENDS } from "../src/instar-shape.js";
import { acting, hung, TPB } from "./instar-kit.js";

/**
 * **THE INSTAR swims down its length in flight** (`instar-serpent.ts`): the
 * crest of the wave is further toward the rear on every frame of a flight
 * than on the frame before, until it leaves the body and the next comes in at
 * the neck; the wave grows out of nothing and dies back into it, with no jump
 * on the way; and with the candidate off, or on a step that stays where it
 * is, there is no wave at all.
 */

const END = 12;
const SAMPLES = 64;

/** Where along the body the wave stands highest toward the screen's bottom. */
function crest(b: number): number {
  const sw = serpentAt(b, END);
  if (!sw) throw new Error(`no wave at ${b}`);
  let best = 0;
  let at = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    // Normalised by the growth to the rear, so the crest is the wave's phase, not its size.
    const v = sw.across(u) / (1 / 3 + (2 / 3) * u);
    if (v > best) [best, at] = [v, u];
  }
  return at;
}

describe("THE INSTAR's serpentine flight", () => {
  afterEach(() => {
    INSTAR_SERPENT.amount = 0;
  });

  it("moves the crest tailward every frame of a flight", () => {
    INSTAR_SERPENT.amount = 1;
    let was = crest(1 / TPB);
    let wraps = 0;
    for (let k = 2; k < END * TPB; k++) {
      const now = crest(k / TPB);
      // A crest that left the rear is followed by the next one at the neck.
      if (now < was - 0.5) wraps++;
      else expect(now, `tick ${k}`).toBeGreaterThanOrEqual(was);
      was = now;
    }
    expect(wraps).toBeGreaterThan(1);
  });

  it("grows from nothing at the start and dies to nothing at the landing, with no jump", () => {
    INSTAR_SERPENT.amount = 1;
    expect(serpentAt(0, END)).toBeUndefined();
    expect(serpentAt(END, END)).toBeUndefined();
    let was = 0;
    for (let k = 1; k < END * TPB; k++) {
      const sw = serpentAt(k / TPB, END);
      const tail = sw ? (sw.across(1) + sw.shiver(1)) * sw.env : 0;
      expect(Math.abs(tail - was), `tick ${k}`).toBeLessThan(0.1);
      was = tail;
    }
    expect(Math.abs(was)).toBeLessThan(0.01);
  });

  it("is not there with the candidate off, nor on a step that stays", () => {
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
      return instarSerpent(s, world.beat, 0);
    };
    expect(at(flies)).toBeUndefined();
    INSTAR_SERPENT.amount = 1;
    expect(at(flies)).toBeDefined();
    expect(at(stays)).toBeUndefined();
    const step = s.steps[flies];
    s.cursor = flies;
    s.phaseBeat = world.beat - (step?.morphBeats ?? 0) * INSTAR_FLIGHT_ENDS;
    expect(instarSerpent(s, world.beat, 0)).toBeUndefined();
  });
});
