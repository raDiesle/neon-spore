import { describe, expect, test } from "bun:test";
import { HELPER_GROUPS } from "../src/helpers-page.js";
import { SHIELD_GROUP } from "../src/helpers-shield.js";
import { parsePlace, placeToSearch, SHIELD_LAB } from "../src/place.js";
import { SHIELD_LOOKS, shieldLook } from "../src/shield-lab-looks.js";
import { askedBody, beatsLeft, ROCKS, ShieldRun } from "../src/shield-lab-run.js";

/**
 * THE SHIELD LAB's run without a canvas (`shield-lab-run.ts`; the scene and
 * the looks draw from it): AUTO's two hands turn every rock, no hands turn
 * none, the moment is the first of each kind's alone, and the field starts
 * over once the last rock is gone.
 */

/** Ticks until the field starts over, or the budget. */
function oneRun(auto: boolean, each: (r: ShieldRun) => void = () => {}): ShieldRun {
  const r = new ShieldRun();
  for (let i = 0; i < 120 * 120 && r.restarts === 0; i++) {
    each(r);
    r.tick(auto);
  }
  return r;
}

describe("THE SHIELD LAB's run", () => {
  test("AUTO turns every rock, and the field starts over after the last", () => {
    let deflected = 0;
    const r = oneRun(true, (x) => {
      deflected = Math.max(deflected, x.world.guard.deflected);
    });
    expect(r.restarts).toBe(1);
    expect(deflected).toBe(ROCKS.length);
  });

  test("with no hands nothing is turned", () => {
    let deflected = 0;
    const r = oneRun(false, (x) => {
      deflected = Math.max(deflected, x.world.guard.deflected);
    });
    expect(r.restarts).toBe(1);
    expect(deflected).toBe(0);
  });

  test("the moment belongs to the first of each kind, in the order they fall", () => {
    const firsts = new Map<number, boolean>();
    oneRun(true, (x) => {
      const c = askedBody(x.world);
      if (c && !firsts.has(c.id)) firsts.set(c.id, x.first(c));
    });
    // meteor, meteor, meteorMedium, meteor, meteorFast
    expect([...firsts.values()]).toEqual([true, false, true, false, true]);
  });

  test("beats left only ever shrinks for one rock, and is spent before it is answered", () => {
    const seen = new Map<number, number>();
    oneRun(true, (x) => {
      const c = askedBody(x.world);
      if (!c) return;
      const left = beatsLeft(x.world, c);
      expect(left).toBeLessThanOrEqual((seen.get(c.id) ?? Number.POSITIVE_INFINITY) + 1e-9);
      seen.set(c.id, left);
    });
    for (const last of seen.values()) expect(last).toBeLessThan(1);
  });
});

describe("THE SHIELD LAB's place and looks", () => {
  test("`?shieldlab=` round-trips", () => {
    const place = parsePlace("?shieldlab=lane");
    expect(place.lab).toBe(`${SHIELD_LAB}lane`);
    expect(placeToSearch(place)).toBe("?shieldlab=lane");
  });

  test("every look has its own key, and an unknown one is TETHER", () => {
    const keys = SHIELD_LOOKS.map((l) => l.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(shieldLook("gone").key).toBe("tether");
  });

  test("THE SHIELD stands first on HELPERS, with the lab and the torch's alarm", () => {
    expect(HELPER_GROUPS[0]).toBe(SHIELD_GROUP);
    expect(SHIELD_GROUP.lab).toBeDefined();
    expect((SHIELD_GROUP.rows ?? []).map((r) => r.name)).toContain("THE TORCH ALARM");
  });
});
