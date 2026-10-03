import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import { throatHue } from "../src/throat-hue.js";
import { showsMimicPaint, showsMimicSign } from "../src/view-role-clocks-c.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { CORE, count, frame, posed, SPLIT } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MIMIC, drawn (`render/src/mimic-draw.ts`, `mimic-board.ts`): the mantle
 * and its mottle on every screen; the picture's wanted squares on the
 * reader's board and never the painter's; a painted square marked right or
 * wrong on the reader's and bare of marks on the painter's; a split's two
 * pictures one to each screen; and the core lit only while it is bare to be
 * tapped — set rather than played to; `sim/test/mimic*.test.ts` prove the
 * rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

/** A square the picture wants and nobody has painted: its colour, faint (`mimic-tile.ts`). */
const wanted = (mode: "red" | "cyan") => rgba(throatHue(mode).hex, 0.28);
/** The harness's pictures: the pilot's red at column 1, the navigator's cyan at column 7, both on row 2. */
const tile = (col: number, row: number) => col + row * CFG.cols;
/** A square of the navigator's cross that wants cyan, and one no picture stands on. */
const RIGHT = tile(8, 2);
const STRAY = tile(0, 10);

describe("THE MIMIC's body", () => {
  it.each(ROLES)("draws the skin, the mottle and the outline, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w));
    expect(count(drawn, PALETTE.mimicSkin)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.mimicMottle)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.mimicSkinDark)).toBeGreaterThan(0);
  });

  it("shows the picture to the reader and never to the painter", () => {
    // The pilot reads; the navigator paints a cyan cross.
    const reader = frame("p1", (w) => posed(w));
    const painter = frame("p2", (w) => posed(w));
    expect(count(reader, wanted("cyan"))).toBeGreaterThan(0);
    expect(count(painter, wanted("cyan"))).toBe(0);
    expect(
      count(
        frame("test", (w) => posed(w)),
        wanted("cyan"),
      ),
    ).toBeGreaterThan(0);
  });

  it("ticks a right square and crosses a stray on the reader's board, and marks neither on the painter's", () => {
    const right = (w: Parameters<typeof posed>[0]) =>
      posed(w, "sign", undefined, (s) => {
        s.paint[RIGHT] = 2;
      });
    const stray = (w: Parameters<typeof posed>[0]) =>
      posed(w, "sign", undefined, (s) => {
        s.paint[STRAY] = 2;
      });
    const bare = (role: "p1" | "p2", colour: string) =>
      count(
        frame(role, (w) => posed(w)),
        colour,
      );
    expect(count(frame("p1", right), PALETTE.good)).toBeGreaterThan(bare("p1", PALETTE.good));
    expect(count(frame("p1", stray), PALETTE.red)).toBeGreaterThan(bare("p1", PALETTE.red));
    expect(count(frame("p2", right), PALETTE.good)).toBe(bare("p2", PALETTE.good));
    expect(count(frame("p2", stray), PALETTE.red)).toBe(bare("p2", PALETTE.red));
    // The painter still sees what was painted, solid in its colour.
    const cyan = throatHue("cyan").hex;
    expect(count(frame("p2", right), cyan)).toBeGreaterThan(bare("p2", cyan));
  });

  it("gives each screen one picture of a split, and the test screen both", () => {
    const p1 = frame("p1", (w) => posed(w, "sign", SPLIT));
    const p2 = frame("p2", (w) => posed(w, "sign", SPLIT));
    const test = frame("test", (w) => posed(w, "sign", SPLIT));
    // Each seat reads the other's: the pilot the navigator's cyan, the navigator the pilot's red.
    expect(count(p1, wanted("cyan"))).toBeGreaterThan(0);
    expect(count(p1, wanted("red"))).toBe(0);
    expect(count(p2, wanted("red"))).toBeGreaterThan(0);
    expect(count(p2, wanted("cyan"))).toBe(0);
    expect(count(test, wanted("red")) * count(test, wanted("cyan"))).toBeGreaterThan(0);
  });

  it("takes a peeled half's picture off the screen that read it", () => {
    const peeled = frame("p1", (w) =>
      posed(w, "sign", SPLIT, (s) => {
        s.peeled = [false, true];
      }),
    );
    // The pilot reads the navigator's half: with that half peeled, nothing is left to read.
    expect(count(peeled, wanted("cyan"))).toBe(0);
  });

  it.each(ROLES)("lights the core in its colour only while it is bare, on %s", (role) => {
    const bare = frame(role, (w) => posed(w, "core", CORE));
    const whole = frame(role, (w) => posed(w, "rolling", { ...CORE, ask: "roll", beats: 2 }));
    expect(count(bare, PALETTE.redRim)).toBeGreaterThan(count(whole, PALETTE.redRim));
    expect(count(bare, PALETTE.mimicCore)).toBeGreaterThan(0);
  });
});

describe("THE MIMIC's split, by seat", () => {
  it("shows a seat's sign to the other seat and its pad to itself, and both to test", () => {
    expect(showsMimicSign("p1", 2)).toBe(true);
    expect(showsMimicSign("p2", 2)).toBe(false);
    expect(showsMimicPaint("p2", 2)).toBe(true);
    expect(showsMimicPaint("p1", 2)).toBe(false);
    expect(showsMimicSign("test", 1)).toBe(true);
    expect(showsMimicPaint("test", 1)).toBe(true);
  });
});
