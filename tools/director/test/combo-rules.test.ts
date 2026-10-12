import { describe, expect, test } from "bun:test";
import type { Point } from "@neon-spore/content";
import { pullTrackPoint } from "@neon-spore/render";
import { HOLD_PULL, HOLD_TAP } from "../src/combo-hold-partner.js";
import type { ComboRule } from "../src/combo-kinds.js";
import { COMBO_RULES, comboRuleOf } from "../src/combo-lab-combos.js";
import { downShape } from "../src/combo-lab-rule.js";
import { PLUG } from "../src/combo-plug.js";
import { HOLD_SWIPE } from "../src/combo-swipe.js";
import { FIELD_ACTIONS } from "../src/field-actions.js";
import { HOLD_AT } from "../src/hold-lab-rule.js";
import { LAB_TILE, LAB_W } from "../src/pull-lab-shapes.js";

/**
 * Every combo THE COMBO LAB plays (`combo-lab-combos.ts`), through its own
 * `ComboRule` and nothing else, as the lab drives it: AUTO's loop shows one
 * counted and one refused at least, and each new combo's own answer to a
 * thumb that does its part, and to one that does not.
 */

const STEP = 1 / 60;

function run<S>(r: ComboRule<S>, s: S, seconds: number): void {
  for (let t = 0; t < seconds; t += STEP) r.tick(s, STEP);
}

/** AUTO's thumb, one loop of it, driving the rule exactly as the lab does. */
function autoLoop<S>(r: ComboRule<S>): S {
  const s = r.fresh();
  let down = false;
  for (let t = 0; t < r.loop; t += STEP) {
    const th = r.thumb(t);
    if (th.down && !down) r.press(s, th.at);
    if (th.down) r.move(s, th.at);
    if (!th.down && down) r.lift(s);
    down = th.down;
    r.tick(s, STEP);
  }
  return s;
}

describe("THE COMBO LAB's combos", () => {
  test.each(COMBO_RULES.map((r) => [r.key, r]))(
    "%s: AUTO's loop counts once and refuses at least once",
    (_k, r) => {
      const t = r.tally(autoLoop(r));
      expect(t.counted).toBe(1);
      expect(t.refused).toBeGreaterThanOrEqual(1);
    },
  );

  test("every combo the CONTROLS page names is one the lab plays, and every one is named", () => {
    const named = FIELD_ACTIONS.flatMap((a) => a.types.flatMap((t) => t.comboLab ?? []));
    const keys = COMBO_RULES.map((r) => r.key);
    for (const k of named) expect(keys).toContain(k);
    for (const k of keys.filter((k) => k !== "beats")) expect(named).toContain(k);
  });

  test("an unknown key opens on the first", () => {
    expect(comboRuleOf("nothing")).toBe(COMBO_RULES[0] as ComboRule<unknown>);
  });
});

describe.each([
  ["holdpull", HOLD_PULL],
  ["holdtap", HOLD_TAP],
])("%s", (_k, r) => {
  test("held long enough, counted the moment the partner is done", () => {
    const s = r.fresh();
    r.press(s, HOLD_AT);
    run(r, s, 1);
    expect(r.tally(s).counted).toBe(0);
    run(r, s, 2);
    expect(r.tally(s).counted).toBe(1);
    r.lift(s);
    expect(r.tally(s).refused).toBe(0);
  });

  test("let go while the partner works: refused", () => {
    const s = r.fresh();
    r.press(s, HOLD_AT);
    run(r, s, 0.9);
    r.lift(s);
    expect(r.tally(s)).toEqual({ counted: 0, refused: 1, strayed: 0 });
  });
});

describe("PULL ONCE THE PARTNER HAS PRESSED", () => {
  const track = downShape(LAB_W * 0.3).track;
  const at = (k: number): Point => {
    const q = pullTrackPoint(track, k);
    return { x: q.x, y: q.y };
  };
  const pull = (s: ReturnType<typeof PLUG.fresh>, from: number, to: number): void => {
    for (let k = from; k <= to + 0.0001; k += 0.05) PLUG.move(s, at(Math.min(1, k)));
  };

  test("the whole way before the press is thrown back, refused", () => {
    const s = PLUG.fresh();
    PLUG.press(s, at(0));
    pull(s, 0, 1);
    expect(PLUG.tally(s)).toEqual({ counted: 0, refused: 1, strayed: 0 });
  });

  test("waited halfway for the press, then the whole way: counted", () => {
    const s = PLUG.fresh();
    PLUG.press(s, at(0));
    pull(s, 0, 0.5);
    run(PLUG, s, 1.4);
    pull(s, 0.5, 1);
    expect(PLUG.tally(s).counted).toBe(1);
    expect(PLUG.tally(s).refused).toBe(0);
  });
});

describe("HOLD, THEN SWIPE", () => {
  const right = { x: HOLD_AT.x + LAB_TILE * 1.5, y: HOLD_AT.y };
  const left = { x: HOLD_AT.x - LAB_TILE * 1.5, y: HOLD_AT.y };

  test("the beats held are not a count: the swipe the asked way is", () => {
    const s = HOLD_SWIPE.fresh();
    HOLD_SWIPE.press(s, HOLD_AT);
    run(HOLD_SWIPE, s, 2);
    expect(HOLD_SWIPE.tally(s).counted).toBe(0);
    HOLD_SWIPE.move(s, right);
    HOLD_SWIPE.lift(s);
    expect(HOLD_SWIPE.tally(s)).toEqual({ counted: 1, refused: 0, strayed: 0 });
  });

  test("swiped the other way, or let go before the beats: refused", () => {
    const s = HOLD_SWIPE.fresh();
    HOLD_SWIPE.press(s, HOLD_AT);
    run(HOLD_SWIPE, s, 2);
    HOLD_SWIPE.move(s, left);
    HOLD_SWIPE.lift(s);
    run(HOLD_SWIPE, s, 1);
    HOLD_SWIPE.press(s, HOLD_AT);
    run(HOLD_SWIPE, s, 0.3);
    HOLD_SWIPE.lift(s);
    expect(HOLD_SWIPE.tally(s)).toEqual({ counted: 0, refused: 2, strayed: 0 });
  });
});
