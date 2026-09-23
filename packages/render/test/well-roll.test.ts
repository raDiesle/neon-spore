import { describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, type World } from "@neon-spore/sim";
import { computeLayout, type Layout, rolledLayout } from "../src/layout.js";
import { type Field, touchDown, touchMove } from "../src/touch.js";
import { wellCol, wellOnSeam } from "../src/touch-well.js";
import { wellAngle, wellAt, wellHub } from "../src/well.js";

/**
 * **THE WELL's face turned, and the finger that has to follow it.**
 *
 * The roll is one number on the layout and it is read in exactly two places —
 * `wellAngle`, which turns a column into an angle to draw at, and the hit
 * test, which turns an angle back into a column (`well-roll.ts`). Everything
 * else on this picture asks one of those two, so the property worth a test is
 * not that any particular numeral moved: it is that **the two doors stay each
 * other's inverse at every offset**. A lane that rolled the drawing and not
 * the answer would leave the pilot's thumb taking the lane that used to be
 * under it, on a projection whose entire content is that it agrees with his
 * hand — and nothing else in the suite would go red, because every other well
 * test stands on a face at nought.
 *
 * The wrap is the other half. A face turned a sector and a half puts column
 * ten at an angle a square face reads as minus two, and the old hit test
 * clamped a negative sector to column 0 — so the cases below walk a whole turn
 * and a bit past it, which is further than the simulation ever rolls
 * (`wellRollSectors`) and is deliberately so: the arithmetic should not know
 * where the boss stops.
 */

const CFG = DEFAULT_CONFIG;
const FLAT: Layout = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

/** The same layout with the face turned, in thousandths of a sector. */
const at = (milli: number): Layout => ({ ...FLAT, wellRoll: milli });

/** A point where a column is drawn, on the hull ring. */
const onRing = (l: Layout, col: number) => wellAt(l, wellAngle(l, col), wellHub(l));

/** Every roll worth asking about: square, part of a sector, whole sectors, a
 * full turn of the face, and past one. */
const ROLLS = [0, 250, 500, 1000, 1500, 3000, 7000, 12_000, 13_250];

describe("the rolled face", () => {
  it("answers a finger with the column it drew there", () => {
    for (const milli of ROLLS) {
      const l = at(milli);
      for (let col = 0; col < CFG.cols; col++) {
        const p = onRing(l, col);
        expect(wellCol(l, p.x, p.y), `roll ${milli}, column ${col}`).toBe(col);
      }
    }
  });

  it("carries the seam round with it", () => {
    for (const milli of ROLLS) {
      const l = at(milli);
      // The sector before column 0 is the one that holds no column.
      const p = wellAt(l, wellAngle(l, -1), wellHub(l));
      expect(wellOnSeam(l, p.x, p.y), `roll ${milli}`).toBe(true);
      expect(wellCol(l, p.x, p.y)).toBeNull();
      // And nowhere a column is drawn is the seam.
      const four = onRing(l, 4);
      expect(wellOnSeam(l, four.x, four.y)).toBe(false);
    }
  });

  it("still keeps the two ends of the field apart", () => {
    const l = at(1500);
    const last = onRing(l, CFG.cols - 1);
    const first = onRing(l, 0);
    expect(wellCol(l, last.x, last.y)).toBe(CFG.cols - 1);
    expect(wellCol(l, first.x, first.y)).toBe(0);
    // Two sectors apart through the seam, turned face or not.
    const gap = wellAngle(l, 0) - wellAngle(l, CFG.cols - 1);
    expect(Math.round((gap / (2 * Math.PI)) * (CFG.cols + 1))).toBe(2 - (CFG.cols + 1));
  });
});

/** A world on a wave with no well at all. */
function plainWorld(): World {
  return createWorld(CFG, 2, []);
}

describe("rolledLayout", () => {
  it("hands back the layout itself when no face is turning", () => {
    const l = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
    // The same object, not a copy: an ordinary wave allocates nothing per
    // frame and nothing per touch, which is `flippedLayout`'s arrangement.
    expect(rolledLayout(l, plainWorld())).toBe(l);
    expect(l.wellRoll).toBe(0);
  });
});

/** The pilot's screen, with the well up. */
function wellField(seat: 1 | 2 = 1): Field {
  return {
    creatures: [],
    cannonCol: 5,
    shieldCol: 2,
    beatPhase: 0.5,
    skinY: null,
    beat: 0,
    waveBeat: 0,
    tick: 0,
    seat,
    cfg: CFG,
    boss: null,
    controls: controlSet("default"),
    faults: [],
    well: true,
  };
}

describe("a thumb on the seam", () => {
  it("takes hold of it wherever the face has carried it", () => {
    const l = at(2500);
    const p = wellAt(l, wellAngle(l, -1), wellHub(l) * 1.6);
    const t = touchDown(l, p.x, p.y, wellField());
    expect(t).toMatchObject({
      player: 1,
      command: { kind: "drag", target: "wellSeam", on: true, fromMilli: 0 },
    });
    expect(t?.hold).toMatchObject({ kind: "drag", target: "wellSeam" });
  });

  it("reports how far round the ring it has come, not how far across", () => {
    const l = at(2500);
    const p = wellAt(l, wellAngle(l, -1), wellHub(l) * 1.6);
    const t = touchDown(l, p.x, p.y, wellField());
    if (!t?.hold) throw new Error("the seam answered nothing");
    // A sector clockwise of where it grabbed: one sector, in thousandths.
    const on = wellAt(l, wellAngle(l, 0), wellHub(l) * 1.6);
    const moved = touchMove(l, t.hold, on.x, on.y);
    expect(moved?.command).toMatchObject({ kind: "drag", target: "wellSeam", fromMilli: 1000 });
  });

  it("is not offered to the navigator, who has no face in front of her", () => {
    const l = at(2500);
    const p = wellAt(l, wellAngle(l, -1), wellHub(l) * 1.6);
    expect(touchDown(l, p.x, p.y, wellField(2))).toBeNull();
  });
});
