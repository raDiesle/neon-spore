import { describe, expect, test } from "bun:test";
import { PULL_KNOB, pullTrackPoint } from "@neon-spore/render";
import type { Variant } from "../../versus/variant.js";
import { AUTO_SECONDS, autoThumb } from "../src/pull-lab-auto.js";
import { pullLooks } from "../src/pull-lab-paint.js";
import {
  freshPull,
  knobAt,
  lift,
  move,
  press,
  progress,
  type ShortPull,
  STRAY_TILES,
  type Stray,
  tick,
} from "../src/pull-lab-rule.js";
import {
  LAB_H,
  LAB_SHAPES,
  LAB_TILE,
  LAB_W,
  type LabShape,
  labShape,
} from "../src/pull-lab-shapes.js";
import { MOMENTS, pullAt } from "../src/pull-lab-sheet.js";

/**
 * The PULL LAB's rule and its thumb, without a canvas (`pull-lab.ts` draws;
 * this is what it draws *from*): every shape can be taken, pulled the whole
 * way and counted once, and a short lift is refused or ignored as the bar
 * says — the decision the SUGGESTED line on PULL PAST A DISTANCE asks for.
 */

/** Where the whole of `shape`'s pull ends: the far end, or for a two-way pull, the 1 end. */
function farEnd(shape: LabShape) {
  if (shape.direction === "free") {
    const [a, b] = shape.track.pts;
    return {
      x: (b?.x ?? 0) + ((b?.x ?? 0) - (a?.x ?? 0)),
      y: (b?.y ?? 0) + ((b?.y ?? 0) - (a?.y ?? 0)),
    };
  }
  return pullTrackPoint(shape.track, 1);
}

/** Walk the thumb from the knob to `to` in small steps, as a mouse would. */
function walk(
  shape: LabShape,
  pull: ReturnType<typeof freshPull>,
  to: { x: number; y: number },
  stray: Stray = "free",
) {
  const from = knobAt(shape, pull);
  for (let i = 1; i <= 60; i++) {
    const u = i / 60;
    move(shape, pull, { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u }, stray);
  }
}

/** `k` of the way along `shape`'s path and `tiles` off it, to its side. */
function offPath(shape: LabShape, k: number, tiles: number) {
  const q = pullTrackPoint(shape.track, k);
  return { x: q.x - q.dy * tiles * LAB_TILE, y: q.y + q.dx * tiles * LAB_TILE };
}

/** Follow the path from the knob to `k`, drifting out to `tiles` off it as
 * the thumb goes — the way a real one wanders, round a bend and not across it. */
function drift(
  shape: LabShape,
  pull: ReturnType<typeof freshPull>,
  k: number,
  tiles: number,
  stray: Stray = "free",
) {
  for (let i = 1; i <= 60; i++) {
    const u = i / 60;
    move(shape, pull, offPath(shape, shape.origin + (k - shape.origin) * u, tiles * u), stray);
  }
}

describe("the generic pull", () => {
  test("every shape lies inside the lab's field", () => {
    for (const s of LAB_SHAPES) {
      for (const p of s.track.pts) {
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(LAB_W);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeLessThan(LAB_H);
      }
    }
  });

  test("every shape counts once when pulled the whole way, and goes home", () => {
    for (const s of LAB_SHAPES) {
      const pull = freshPull(s);
      expect(press(s, pull, knobAt(s, pull))).toBe(true);
      walk(s, pull, farEnd(s));
      expect(pull.phase).toBe("full");
      expect(pull.verdict).toBe("counted");
      move(s, pull, farEnd(s));
      lift(s, pull, "refuse");
      expect(pull.counted).toBe(1);
      expect(pull.refused).toBe(0);
      for (let i = 0; i < 120; i++) tick(s, pull, 1 / 60);
      expect(pull.phase).toBe("idle");
      expect(pull.at).toBe(s.origin);
    }
  });

  test("a press far from the knob takes nothing", () => {
    const s = labShape("down");
    const pull = freshPull(s);
    const k = knobAt(s, pull);
    expect(press(s, pull, { x: k.x + 200, y: k.y })).toBe(false);
    expect(pull.phase).toBe("idle");
  });

  for (const [short, verdict, refused] of [
    ["refuse", "refused", 1],
    ["ignore", "ignored", 0],
  ] as [ShortPull, string, number][]) {
    test(`a short lift is ${verdict} when the bar says ${short}`, () => {
      const s = labShape("curve");
      const pull = freshPull(s);
      press(s, pull, knobAt(s, pull));
      walk(s, pull, pullTrackPoint(s.track, 0.4));
      expect(progress(s, pull)).toBeGreaterThan(0.3);
      lift(s, pull, short);
      expect(pull.verdict).toBe(verdict as "refused" | "ignored");
      expect(pull.refused).toBe(refused);
      expect(pull.counted).toBe(0);
    });
  }

  test("a two-way pull takes the sign of the way it went", () => {
    const s = labShape("signed");
    const pull = freshPull(s);
    press(s, pull, knobAt(s, pull));
    walk(s, pull, pullTrackPoint(s.track, 0));
    expect(pull.sign).toBe(-1);
    expect(pull.verdict).toBe("counted");
  });
});

describe("a thumb off the path", () => {
  const pathed = LAB_SHAPES.filter((s) => s.direction !== "free");

  test("is nothing while the rule is free, as every pull in the game has it", () => {
    for (const s of pathed) {
      const pull = freshPull(s);
      press(s, pull, knobAt(s, pull));
      drift(s, pull, s.origin > 0 ? 0.2 : 0.5, 2);
      expect([s.key, pull.phase, pull.strayed]).toEqual([s.key, "held", 0]);
    }
  });

  for (const stray of ["tile", "half"] as Stray[]) {
    const limit = STRAY_TILES[stray] as number;
    test(`fails past ${limit} of a tile, and not inside it`, () => {
      for (const s of pathed) {
        const k = s.origin > 0 ? 0.2 : 0.5;
        const inside = freshPull(s);
        press(s, inside, knobAt(s, inside));
        drift(s, inside, k, limit * 0.8, stray);
        expect([s.key, inside.phase, inside.strayed]).toEqual([s.key, "held", 0]);
        const out = freshPull(s);
        press(s, out, knobAt(s, out));
        drift(s, out, k, limit * 1.6, stray);
        expect([s.key, out.phase, out.verdict, out.strayed]).toEqual([s.key, "home", "strayed", 1]);
        lift(s, out, "refuse");
        expect(out.refused).toBe(0);
      }
    });
  }

  test("never fails the rope, which has no path", () => {
    const s = labShape("rope");
    const pull = freshPull(s);
    press(s, pull, knobAt(s, pull));
    walk(s, pull, { x: LAB_W * 0.9, y: LAB_H * 0.5 }, "half");
    expect(pull.strayed).toBe(0);
  });

  test("AUTO's short pull strays when the rule is on, so the loop shows both", () => {
    for (const s of pathed) {
      const pull = freshPull(s);
      let down = false;
      for (let t = 0; t < AUTO_SECONDS; t += 1 / 60) {
        const th = autoThumb(s, t, true);
        if (th.down && !down) press(s, pull, th.at);
        if (th.down) move(s, pull, th.at, "tile");
        if (!th.down && down) lift(s, pull, "refuse");
        down = th.down;
        tick(s, pull, 1 / 60);
      }
      expect([s.key, pull.counted, pull.strayed, pull.refused]).toEqual([s.key, 1, 1, 0]);
    }
  });
});

describe("AUTO's thumb", () => {
  test("pulls every shape the whole way once and short once, every loop", () => {
    for (const s of LAB_SHAPES) {
      const pull = freshPull(s);
      let down = false;
      for (let t = 0; t < AUTO_SECONDS; t += 1 / 60) {
        const th = autoThumb(s, t);
        if (th.down && !down) press(s, pull, th.at);
        if (th.down) move(s, pull, th.at);
        if (!th.down && down) lift(s, pull, "refuse");
        down = th.down;
        tick(s, pull, 1 / 60);
      }
      expect([s.key, pull.counted, pull.refused]).toEqual([s.key, 1, 1]);
    }
  });
});

describe("the EVERY LOOK sheet", () => {
  test("each moment shows the state it is labelled with, on every shape", () => {
    const want: Record<string, [string, string | null]> = {
      WAITING: ["idle", null],
      "HELD · HALF WAY": ["held", null],
      COUNTED: ["full", "counted"],
      "SHORT · HELD": ["held", null],
      "SHORT · REFUSED": ["home", "refused"],
    };
    for (const s of LAB_SHAPES) {
      for (const m of MOMENTS) {
        const { pull } = pullAt(s, m.at);
        expect([s.key, m.label, pull.phase, pull.verdict]).toEqual([
          s.key,
          m.label,
          ...(want[m.label] ?? []),
        ]);
      }
    }
  });

  test("the LOOK picker takes a candidate by the records it patches, never by its slot", () => {
    const where = { file: "packages/render/src/pull-knob.ts", symbol: "PULL_KNOB" };
    const pull: Variant = {
      slot: "any:slot",
      name: "a",
      sentence: "",
      dir: "",
      patches: [{ target: PULL_KNOB, reached: () => PULL_KNOB, where, fields: {} }],
    };
    const other: Variant = {
      ...pull,
      name: "b",
      patches: [{ ...pull.patches[0], target: {} } as never],
    };
    expect(pullLooks([pull, other])).toEqual([pull]);
  });
});
