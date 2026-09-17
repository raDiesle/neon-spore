import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { badgeBox, band } from "../src/guide-tide.js";
import { crest } from "../src/guide-tide-plate.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The two things the owner asked TIDE for after he had taken it, 16 September
 * 2026, and they are here because both are the kind a later edit undoes
 * without meaning to: a number nudged back, a path swapped for the rounded
 * rectangle it replaced.
 *
 * *It looks strange that "PLAYER 1 · SCREEN" text is too near the bottom of
 * the button, and maybe we can move text in the button a little bit more to
 * top* — so the words are held off the badge's foot rather than merely drawn
 * inside it.
 *
 * *The top line, maybe not so much height, and more interesting, maybe
 * something alien organic* — so the crest is held to its new ceiling, and its
 * lower edge is held to being an edge that moves. A flat one is the shelf he
 * asked to be rid of, and nothing else about the shape can be checked from a
 * log.
 */

const CFG = DEFAULT_CONFIG;
const SIZES = [
  { width: 390, height: 844, dpr: 2 },
  { width: 320, height: 568, dpr: 1 },
  { width: 900, height: 1600, dpr: 2 },
];

beforeAll(installCanvasGlobals);

describe("the badge at the top of a page of film", () => {
  it("keeps both its rows clear of its own foot, at every size", () => {
    for (const size of SIZES) {
      const { ctx } = stubCanvas();
      const l = computeLayout(size, CFG, "p1");
      ctx.texts = [];
      band(ctx as never, l, { seat: 1, age: 2 });
      const texts = ctx.texts as TextBox[];
      const badge = badgeBox(l);
      const rows = texts.filter((t) => t.text === "TUTORIAL" || t.text.endsWith("· SCREEN"));
      expect(rows, `${size.width}: the badge wrote neither row`).toHaveLength(2);
      for (const t of rows) {
        // Four pixels is the whole of the ask: the name's descenders used to
        // reach to within three of the rim, which is what reads as *too near
        // the bottom*.
        expect(t.y + t.h, `${size.width}: "${t.text}" on the badge's foot`).toBeLessThan(
          badge.y + badge.h - 4,
        );
        expect(t.y, `${size.width}: "${t.text}" above the badge`).toBeGreaterThan(badge.y);
      }
      // And the name is the lower of the two, which is the order the row was
      // written in and the only thing that makes "more to top" mean anything.
      const tag = rows.find((t) => t.text === "TUTORIAL") as TextBox;
      const name = rows.find((t) => t.text !== "TUTORIAL") as TextBox;
      expect(name.y).toBeGreaterThan(tag.y);
    }
  });
});

/** Every y the crest drew at, off the stub's ordered log. */
function ys(log: readonly string[]): number[] {
  const out: number[] = [];
  for (const call of log) {
    const open = call.indexOf("(");
    if (open < 0 || !call.endsWith(")")) continue;
    const name = call.slice(0, open);
    if (!name.includes("moveTo") && !name.includes("lineTo") && !name.includes("CurveTo")) continue;
    const nums = call
      .slice(open + 1, -1)
      .split(",")
      .map(Number);
    for (let i = 1; i < nums.length; i += 2) out.push(nums[i] as number);
  }
  return out;
}

describe("the crest inside a plate", () => {
  const BOX = { x: 40, y: 100, w: 200, h: 60 };

  function drawn(box = BOX): number[] {
    const { ctx } = stubCanvas();
    ctx.log = [];
    crest(ctx as never, box, "#C05CFF", 0.6);
    return ys(ctx.log ?? []);
  }

  it("hangs no deeper than seven into the plate", () => {
    // Four and a half of floor and two and a half of swell. It was a flat
    // nine, and the owner asked for less; a number moved back here is that
    // ask undone.
    const deep = Math.max(...drawn()) - BOX.y;
    expect(deep).toBeLessThanOrEqual(5 + 7 + 0.01);
    expect(deep).toBeGreaterThan(5);
  });

  it("has a lower edge that moves, rather than a straight one", () => {
    const rows = drawn().filter((y) => y > BOX.y + 5 + 1.5);
    const lo = Math.min(...rows);
    const hi = Math.max(...rows);
    expect(rows.length, "no lower edge was walked at all").toBeGreaterThan(6);
    // Four pixels of travel at least: an edge that moves by one is the
    // straight line the owner asked to be rid of, with a wobble in it.
    expect(hi - lo, "the crest's foot barely moves").toBeGreaterThan(4);
  });

  it("gives two plates on a row two different edges, without either being random", () => {
    const left = drawn({ ...BOX, x: 10 });
    const right = drawn({ ...BOX, x: 260 });
    expect(left).not.toEqual(right);
    // And the same plate draws the same edge on the next frame: the phase is a
    // fact about the box, so both phones and every frame agree.
    expect(drawn({ ...BOX, x: 10 })).toEqual(left);
  });

  it("draws nothing at all on a plate too narrow to hold one", () => {
    const { ctx } = stubCanvas();
    crest(ctx as never, { x: 0, y: 0, w: 12, h: 30 }, "#C05CFF", 0.6);
    expect(ctx.calls).toBe(0);
  });
});
