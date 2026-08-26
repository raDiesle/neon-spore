import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, DEFAULT_CONFIG, type QueenState } from "@neon-spore/sim";
import { computeLayout, showsQueenHint, showsQueenShape, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { innerQuestionRadius, markOutline } from "../src/queen-glyph.js";
import { ballShare, drawMark, markGlow } from "../src/queen-weakpoint.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The Bulb Queen's whole design is an information split: player 1 is told
 * *what* is coming, player 2 is told *where*, and neither can answer a bloom
 * without saying their half out loud. That split lives entirely in what each
 * screen draws — so it is exactly the kind of rule a refactor can quietly
 * undo without a single type erroring.
 *
 * These cases hold both halves shut. They work by counting what reaches the
 * canvas: the colours a role's frame ever names are the colours that role can
 * possibly know. A leak shows up as a red or cyan on a screen that is not
 * entitled to one — which is what the last case in the earlier version of
 * this boss actually shipped.
 */

const CFG = DEFAULT_CONFIG;

/**
 * Every value that says "ammunition" — taken from the palette itself rather
 * than matched by shape. A pattern over hex digits looked like it worked and
 * did not: `PALETTE.cyan` is `#2FE0F0`, which the obvious `/#(FF|00)/` never
 * matches, so half of this file passed while proving nothing.
 */
const AMMO: readonly string[] = [
  PALETTE.red,
  PALETTE.redRim,
  PALETTE.redDark,
  PALETTE.cyan,
  PALETTE.cyanRim,
  PALETTE.cyanDark,
];

const namesAmmo = (colours: readonly string[]): boolean => colours.some((c) => AMMO.includes(c));

beforeAll(installCanvasGlobals);

function layoutFor(role: ViewRole) {
  return computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
}

function queenAt(color: Creature["color"]): Creature {
  return { id: 3, kind: "queen", col: 5, row: 2, fromRow: 2, color, holes: 0, petals: 9 };
}

/** Armoured and announced: a bloom is named, with a clock on it, not yet open. */
function bossState(overrides: Partial<QueenState> = {}): QueenState {
  return {
    kind: "queen",
    creatureId: 3,
    phase: 0,
    phaseBeat: 0,
    tellCol: 5,
    tellColor: "red",
    weakSide: 1,
    pickBeat: 0,
    spentSide: 0,
    openBeat: 6,
    closeBeat: 8,
    startPetals: 9,
    dropSide: 1,
    releaseBeat: -1,
    releaseSide: 0,
    scratch: [1, 1],
    ...overrides,
  };
}

/** Every colour string a role's mark hands to the canvas, both marks drawn. */
function coloursDrawn(role: ViewRole, queen: Creature, boss: QueenState, beat: number): string[] {
  const l = layoutFor(role);
  const { ctx } = stubCanvas();
  const seen: string[] = [];
  const spy = ctx as unknown as CanvasRenderingContext2D;
  for (const side of [-1, 1] as const) {
    drawMark(spy, l, 400, 300, 20, side, queen, boss, beat, 0.5, 1.2, 1);
    const glow = markGlow(l, side, queen, boss, beat);
    if (glow) seen.push(glow.hex);
  }
  return seen;
}

/**
 * Colours reach the canvas through `fillStyle`/`strokeStyle`, and the stub
 * validates but does not record them — so record them here by watching the
 * two setters the mark actually writes to.
 */
function paintedColours(role: ViewRole, queen: Creature, boss: QueenState, beat: number): string[] {
  const l = layoutFor(role);
  const { ctx } = stubCanvas();
  const seen: string[] = [];
  const proxy = new Proxy(ctx, {
    set(target, prop, value) {
      if ((prop === "fillStyle" || prop === "strokeStyle") && typeof value === "string") {
        seen.push(value);
      }
      return Reflect.set(target, prop, value);
    },
  }) as unknown as CanvasRenderingContext2D;
  for (const side of [-1, 1] as const) {
    drawMark(proxy, l, 400, 300, 20, side, queen, boss, beat, 0.5, 1.2, 1);
  }
  const glows = coloursDrawn(role, queen, boss, beat);
  return [...seen, ...glows];
}

/** The largest |x| or |y| any vertex of a path string reaches. */
function extent(d: string): number {
  const nums = d.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return Math.max(...nums.map((n) => Math.abs(Number(n))));
}

/** How many question-mark glyphs a role's mark draws — the dot is its tell. */
function glyphCount(
  role: ViewRole,
  queen: Creature,
  boss: QueenState,
  side: -1 | 1,
  beat: number,
): number {
  const l = layoutFor(role);
  const { ctx } = stubCanvas();
  let arcs = 0;
  const spy = new Proxy(ctx, {
    get(target, prop, receiver) {
      if (prop === "arc") {
        return (...args: number[]) => {
          arcs++;
          return (target as unknown as { arc: (...a: number[]) => void }).arc(...args);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as unknown as CanvasRenderingContext2D;
  drawMark(spy, l, 400, 300, 20, side, queen, boss, beat, 0, 1.2, 1);
  return arcs;
}

describe("the queen's information split", () => {
  describe("while she is armoured", () => {
    const queen = queenAt(null);
    const boss = bossState();

    for (const tellColor of ["red", "cyan"] as const) {
      it(`tells player 1 a ${tellColor} bloom is coming`, () => {
        const withColour = bossState({ tellColor });
        expect(namesAmmo(paintedColours("p1", queen, withColour, 4))).toBe(true);
      });

      it(`tells player 2 nothing about a ${tellColor} bloom`, () => {
        const withColour = bossState({ tellColor });
        const painted = paintedColours("p2", queen, withColour, 4);
        // It drew *something* — otherwise "no ammunition colour" would hold
        // for an empty frame and this would prove nothing at all.
        expect(painted.length).toBeGreaterThan(0);
        expect(namesAmmo(painted)).toBe(false);
      });
    }

    it("draws player 1's two marks identically, so the side never leaks", () => {
      const l = layoutFor("p1");
      // Both sides go through one call with one argument different. If that
      // argument ever reached the drawing, the two would diverge — and the
      // only thing that reads it is `markGlow`, checked right below.
      expect(markGlow(l, -1, queen, boss, 4)).toEqual(markGlow(l, 1, queen, boss, 4));
    });

    it("gives the two halves to the two roles, and never both to one", () => {
      // `test` is the solo view and deliberately holds both halves at once.
      expect([showsQueenShape("p1"), showsQueenHint("p1")]).toEqual([true, false]);
      expect([showsQueenShape("p2"), showsQueenHint("p2")]).toEqual([false, true]);
      expect([showsQueenShape("test"), showsQueenHint("test")]).toEqual([true, true]);
    });
  });

  describe("the mark that stayed shut", () => {
    const open = queenAt("red");
    const openBoss = bossState({ openBeat: 4, closeBeat: 6, weakSide: 1, spentSide: -1 });

    it("balls up small, and the real one does not", () => {
      // Ball size shows up as the outline's extent: `markOutline` normalises
      // by the creature's own half-extent, never the ball's, so a spent mark
      // genuinely shrinks instead of being scaled back to full size.
      const shut = extent(markOutline("cyan", "red", 1, 1, 0).d);
      const real = extent(markOutline("cyan", "red", 1, 0, 0).d);
      expect(shut).toBeLessThan(real * 0.6);
    });

    it("keeps the colour of armour — no ammunition glow left on it", () => {
      // Fully balled: the mark is spent and has no claim on the colour.
      expect(ballShare(openBoss, open, -1, 10, 0)).toBe(1);
      expect(markGlow(layoutFor("p1"), -1, open, openBoss, 10, 0)).toBeNull();
      // The one that opened still carries its colour, in full.
      expect(markGlow(layoutFor("p1"), 1, open, openBoss, 10, 0)).not.toBeNull();
    });

    it("grows back out of the ball once the bloom has closed", () => {
      const closed = queenAt(null);
      // `spentSide` is the side that stayed shut; `pickBeat` is the close.
      const after = bossState({ openBeat: -1, closeBeat: -1, pickBeat: 6, spentSide: -1 });
      expect(ballShare(after, closed, -1, 6, 0)).toBe(1);
      // MORPH_BEATS later it is a creature again, and the mark that was real
      // was never a ball at any point in between.
      expect(ballShare(after, closed, -1, 8, 0)).toBe(0);
      expect(ballShare(after, closed, 1, 6, 0)).toBe(0);
    });

    it("is not already a ball before the first bloom of a wave has closed", () => {
      const fresh = queenAt(null);
      const opening = bossState({ openBeat: -1, closeBeat: -1, pickBeat: 0, spentSide: 0 });
      for (const side of [-1, 1] as const) {
        expect(ballShare(opening, fresh, side, 0, 0)).toBe(0);
      }
    });
  });

  describe("player 1's question marks", () => {
    it("are drawn inside both shapes while the side is still unknown", () => {
      const queen = queenAt(null);
      const boss = bossState();
      for (const side of [-1, 1] as const) {
        expect(glyphCount("p1", queen, boss, side, 4)).toBe(1);
      }
    });

    it("are gone from the mark that has opened", () => {
      const queen = queenAt("red");
      const boss = bossState({ openBeat: 0, closeBeat: 6, weakSide: 1 });
      expect(glyphCount("p1", queen, boss, 1, 4)).toBe(0);
    });

    it("fit inside a slick, which is the half-height case", () => {
      // The glyph is 1.79 radii tall (`drawQuestionMark`'s own extremes).
      const slickShare = markOutline("cyan", "red", 1, 0, 0).ryShare;
      expect(innerQuestionRadius(1, slickShare) * 1.79).toBeLessThan(2 * slickShare);
    });
  });

  describe("once the bloom opens", () => {
    const queen = queenAt("red");
    const boss = bossState({ openBeat: 4, closeBeat: 6 });

    it("reveals the colour on the real mark for both players", () => {
      for (const role of ["p1", "p2"] as const) {
        const l = layoutFor(role);
        expect(markGlow(l, 1, queen, boss, 5)).not.toBeNull();
      }
    });

    it("leaves the decoy armoured — player 2 still sees no colour on it", () => {
      expect(markGlow(layoutFor("p2"), -1, queen, boss, 5)).toBeNull();
    });
  });
});
