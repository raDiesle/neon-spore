import { describe, expect, test } from "bun:test";
import { pullTrackPoint } from "@neon-spore/render";
import { comboLoop, comboThumb, holdSeconds } from "../src/combo-lab-auto.js";
import {
  COMBOS,
  type Combo,
  comboOf,
  freshCombo,
  type LabCombo,
  liftCombo,
  moveCombo,
  PARTNER_WAKES,
  partnerAt,
  pressCombo,
  tickCombo,
} from "../src/combo-lab-rule.js";
import { COMBO_LAB, parsePlace, placeToSearch } from "../src/place.js";

/**
 * THE COMBO LAB's rule and its thumb, without a canvas (`combo-lab.ts` draws;
 * this is what it draws *from*): a pull carried the whole way is not counted
 * but held, and counted only when the hold is done — the partner's pull, or
 * its beats; let go at the end too soon, or short, it is refused.
 */

const STEP = 1 / 60;

function run(c: Combo, s: LabCombo, seconds: number): void {
  for (let t = 0; t < seconds; t += STEP) tickCombo(c, s, STEP);
}

/** Pressed on the knob and carried the whole way down its track. */
function pullWhole(c: Combo, s: LabCombo): void {
  const at = (k: number) => {
    const q = pullTrackPoint(c.shape.track, k);
    return { x: q.x, y: q.y };
  };
  expect(pressCombo(c, s, at(0))).toBe(true);
  for (let k = 0; k <= 1.0001; k += 0.05) moveCombo(c, s, at(Math.min(1, k)));
}

describe("THE COMBO LAB's rule", () => {
  test.each(COMBOS.map((c) => [c.key, c]))("%s: the whole way is a hold, not a count", (_k, c) => {
    const s = freshCombo(c);
    pullWhole(c, s);
    expect(s.phase).toBe("hold");
    expect(s.counted).toBe(0);
    expect(s.pull.verdict).toBe(null);
  });

  test.each(COMBOS.map((c) => [c.key, c]))(
    "%s: held to the end of its hold, counted once",
    (_k, c) => {
      const s = freshCombo(c);
      pullWhole(c, s);
      run(c, s, holdSeconds(c) + 0.2);
      expect(s.verdict).toBe("counted");
      expect(s.counted).toBe(1);
      expect(s.phase).toBe("done");
      liftCombo(c, s);
      expect(s.refused).toBe(0);
    },
  );

  test("let go at the end before the partner is done: refused, and their knob goes home", () => {
    const c = comboOf("partner");
    const s = freshCombo(c);
    pullWhole(c, s);
    run(c, s, PARTNER_WAKES + 0.6);
    expect(partnerAt(s)).toBeGreaterThan(0.2);
    liftCombo(c, s);
    expect(s.verdict).toBe("refused");
    expect(s.refused).toBe(1);
    run(c, s, 0.6);
    expect(partnerAt(s)).toBe(0);
  });

  test("the partner does not start until the hold is on", () => {
    const c = comboOf("partner");
    const s = freshCombo(c);
    run(c, s, 3);
    expect(partnerAt(s)).toBe(0);
    pullWhole(c, s);
    run(c, s, PARTNER_WAKES * 0.9);
    expect(partnerAt(s)).toBe(0);
  });

  test("a short pull is refused, as in the PULL LAB", () => {
    const c = comboOf("beats");
    const s = freshCombo(c);
    const q = pullTrackPoint(c.shape.track, 0);
    pressCombo(c, s, { x: q.x, y: q.y });
    for (let k = 0.05; k <= 0.5; k += 0.05) {
      const p = pullTrackPoint(c.shape.track, k);
      moveCombo(c, s, { x: p.x, y: p.y });
    }
    liftCombo(c, s);
    expect(s.verdict).toBe("refused");
    expect(s.refused).toBe(1);
  });

  test("a counted knob comes back fresh once the hand is off, the tallies kept", () => {
    const c = comboOf("beats");
    const s = freshCombo(c);
    pullWhole(c, s);
    run(c, s, holdSeconds(c) + 0.2);
    expect(s.waiting).toBe(true);
    liftCombo(c, s);
    run(c, s, 2);
    expect(s.waiting).toBe(false);
    expect(s.counted).toBe(1);
    expect(s.pull.at).toBe(0);
  });
});

describe("THE COMBO LAB's AUTO", () => {
  test.each(COMBOS.map((c) => [c.key, c]))(
    "%s: one loop is one count and two refusals",
    (_k, c) => {
      const s = freshCombo(c);
      let down = false;
      const end = comboLoop(c).end;
      for (let t = 0; t < end - STEP; t += STEP) {
        const th = comboThumb(c, t);
        if (th.down && !down) pressCombo(c, s, th.at);
        if (th.down) moveCombo(c, s, th.at);
        if (!th.down && down) liftCombo(c, s);
        down = th.down;
        tickCombo(c, s, STEP);
      }
      expect([s.counted, s.refused, s.strayed]).toEqual([1, 2, 0]);
    },
  );
});

describe("THE COMBO LAB in the URL", () => {
  test("combolab= round-trips as COMBO_LAB and the combo, with no sheet", () => {
    const place = parsePlace("?sheet=controls&combolab=beats&pullsheet=1");
    expect(place.lab).toBe(`${COMBO_LAB}beats`);
    expect(place.labSheet).toBe(false);
    expect(placeToSearch(place)).toBe("?sheet=controls&combolab=beats");
  });
});
