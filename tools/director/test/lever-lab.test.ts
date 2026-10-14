import { describe, expect, test } from "bun:test";
import { pullTrackPoint } from "@neon-spore/render";
import { BEAT_SECONDS } from "../src/hold-lab-rule.js";
import { leverLoop, leverThumb } from "../src/lever-lab-auto.js";
import { freshLever, inZone, leverValue, lift, move, press, tick } from "../src/lever-lab-rule.js";
import {
  atOf,
  LEVER_ASKS,
  LEVER_GROOVES,
  LEVER_PAIRS,
  type LeverSetup,
  leverSetup,
  mineShape,
  setupKey,
} from "../src/lever-lab-setup.js";
import { LAB_TILE } from "../src/pull-lab-shapes.js";

/**
 * THE LEVER LAB's rule and its thumb, without a canvas (`lever-lab.ts` draws;
 * this is what it draws *from*): the depth is the value and stands while
 * held, a zone held through its beats counts once, a lift springs it back,
 * let go early is refused, half a tile off the groove fails — and a pair
 * asks the zone of each lever, or of the two summed.
 */

const STEP = 1 / 60;

function run(setup: LeverSetup, l: ReturnType<typeof freshLever>, seconds: number): void {
  for (let t = 0; t < seconds; t += STEP) tick(setup, l, STEP);
}

/** The lever taken at its rest and carried to `depth`, in small steps as a hand would. */
function carry(setup: LeverSetup, depth: number, sign: 1 | -1 = 1) {
  const l = freshLever(setup);
  const s = mineShape(setup);
  const rest = pullTrackPoint(s.track, s.origin);
  expect(press(setup, l, { x: rest.x, y: rest.y })).toBe(true);
  for (let i = 1; i <= 30; i++) {
    const q = pullTrackPoint(s.track, atOf(s, (depth * i) / 30, sign));
    move(setup, l, { x: q.x, y: q.y });
  }
  return l;
}

const hold = (setup: LeverSetup): number => setup.beats.beats * BEAT_SECONDS;

describe("THE LEVER LAB's rule", () => {
  test("the depth stands where the thumb has it, and is the value", () => {
    const setup = leverSetup("depth-down-one-2");
    const l = carry(setup, 0.45);
    run(setup, l, 2);
    expect(leverValue(setup, l)).toBeCloseTo(0.45, 1);
    expect(l.mine.phase).toBe("held");
  });

  test("asked a depth only, carried to the end counts nothing, and a lift is not refused", () => {
    const setup = leverSetup("depth-down-one-2");
    const l = carry(setup, 1);
    run(setup, l, 3);
    lift(setup, l);
    expect(l.mine.counted).toBe(0);
    expect(l.mine.refused).toBe(0);
  });

  test("past the grip and held through its beats, it counts once and springs back on the lift", () => {
    const setup = leverSetup("grip-down-one-2");
    const l = carry(setup, 0.8);
    expect(inZone(setup, l)).toBe(true);
    run(setup, l, hold(setup) + 0.5);
    expect(l.mine.counted).toBe(1);
    expect(l.mine.phase).toBe("full");
    lift(setup, l);
    run(setup, l, 2);
    expect(l.mine.refused).toBe(0);
    expect(l.mine.phase).toBe("idle");
    expect(l.mine.at).toBe(mineShape(setup).origin);
  });

  test("let go in the zone before the count is refused", () => {
    const setup = leverSetup("grip-down-one-2");
    const l = carry(setup, 0.8);
    run(setup, l, hold(setup) * 0.5);
    lift(setup, l);
    expect(l.mine.verdict).toBe("refused");
    expect(l.mine.refused).toBe(1);
  });

  test("short of the grip the hold never fills", () => {
    const setup = leverSetup("grip-down-one-2");
    const l = carry(setup, 0.4);
    run(setup, l, hold(setup) * 2);
    expect(l.fill).toBe(0);
    expect(l.mine.counted).toBe(0);
  });

  test("past a band is too deep", () => {
    const setup = leverSetup("band-down-one-2");
    expect(inZone(setup, carry(setup, 0.55))).toBe(true);
    expect(inZone(setup, carry(setup, 0.95))).toBe(false);
  });

  test("a sideways groove counts either way", () => {
    const setup = leverSetup("grip-sideways-one-1");
    for (const sign of [1, -1] as const) {
      const l = carry(setup, 0.8, sign);
      run(setup, l, hold(setup) + 0.3);
      expect(l.mine.counted).toBe(1);
    }
  });

  test("half a tile off the groove fails", () => {
    const setup = leverSetup("grip-down-one-2");
    const l = carry(setup, 0.5);
    const q = pullTrackPoint(mineShape(setup).track, 0.5);
    move(setup, l, { x: q.x + LAB_TILE * 0.7, y: q.y });
    expect(l.mine.verdict).toBe("strayed");
    expect(l.mine.strayed).toBe(1);
  });

  test("TWO · EACH waits on the partner's lever coming into the zone too", () => {
    const setup = leverSetup("grip-down-both-2");
    const l = carry(setup, 0.8);
    expect(inZone(setup, l)).toBe(false);
    run(setup, l, hold(setup) + 1.2);
    expect(l.mine.counted).toBe(1);
  });

  test("TWO · SUMMED reads the mean of the two", () => {
    const setup = leverSetup("band-down-summed-2");
    const l = carry(setup, 0.6);
    run(setup, l, 2);
    expect(leverValue(setup, l)).toBeCloseTo((0.6 + l.theirs) / 2, 5);
    expect(l.theirs).toBeGreaterThan(0.45);
  });

  test("a setup is one key in the URL, and back", () => {
    for (const k of ["grip-down-one-2", "band-sideways-summed-4", "depth-down-both-1"])
      expect(setupKey(leverSetup(k))).toBe(k);
    expect(setupKey(leverSetup("grip"))).toBe("grip-down-one-2");
  });
});

describe("AUTO's thumb in THE LEVER LAB", () => {
  const all = LEVER_ASKS.flatMap((a) =>
    LEVER_GROOVES.flatMap((g) =>
      LEVER_PAIRS.map((p) => leverSetup(`${a.key}-${g.key}-${p.key}-2`)),
    ),
  );

  test("one loop is one count and two refusals, or nothing asked of a depth", () => {
    for (const setup of all) {
      const l = freshLever(setup);
      let down = false;
      const loop = leverLoop(setup);
      for (let t = 0; t < loop.end; t += STEP) {
        const th = leverThumb(setup, t);
        if (th.down && !down) press(setup, l, th.at);
        if (th.down) move(setup, l, th.at);
        if (!th.down && down) lift(setup, l);
        down = th.down;
        tick(setup, l, STEP);
      }
      const asked = setup.ask.zone !== null;
      const name = setupKey(setup);
      expect(l.mine.counted, name).toBe(asked ? 1 : 0);
      expect(l.mine.refused, name).toBe(asked ? 2 : 0);
      expect(l.mine.strayed, name).toBe(0);
    }
  });
});
