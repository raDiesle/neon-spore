import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { curtainBody, type World } from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { drawCueText } from "../src/boss-cue-text.js";
import { drawCurtain } from "../src/curtain-draw.js";
import { handWordY } from "../src/grip.js";
import { computeLayout, type Layout, tileCY, type ViewRole } from "../src/layout.js";
import { stubCanvas, type TextBox } from "./canvas-stub.js";
import { body, stood } from "./curtain-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

/**
 * **THE CURTAIN's cue word and the hand ring's word are never one word**
 * (`curtain-hand-word.ts`). With a hand on the sheet the ring's `PULL` and the
 * cue's `SHOVE` hung the same distance under the sheet's middle and read as
 * `SHOVEPULL` on the navigator's screen (7 October 2026). Since 13 October
 * 2026 neither verb is written (`asksGrab`), and the hand's word keeps its
 * own place under both. Drawn here as the game draws them.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

/** The fabric hung over its core, with each named seat's thumb on it. */
function held(seats: readonly (1 | 2)[]): World {
  const world = stood(false);
  const sheet = curtainBody(world, body(world));
  if (sheet === undefined) throw new Error("no fabric");
  if (seats.includes(1)) world.gripP1 = sheet.id;
  if (seats.includes(2)) world.gripP2 = sheet.id;
  return world;
}

/** Every word this screen writes for THE CURTAIN: the sheet's own, then its cue. */
function words(world: World, l: Layout): { cue: TextBox | null; hand: TextBox } {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  const paper = ctx as unknown as CanvasRenderingContext2D;
  drawCurtain(paper, l, world, body(world), world.beat, 0, 0);
  const cue = bossCue(l, world, 0, () => l.hullY);
  if (cue !== null) drawCueText(paper, cue, 0, l.width);
  const hand = ctx.texts.find((t) => t.text.endsWith("PULL") || t.text.endsWith("PULLS"));
  if (hand === undefined) throw new Error("no hand word was written");
  return { cue: ctx.texts.find((t) => t.text === cue?.word && t !== hand) ?? null, hand };
}

describe("THE CURTAIN's cue word and the hand's word", () => {
  /** Where `grip.ts` puts the hand's word: the box's top is its baseline less the 9px font's ascent. */
  const under = (l: Layout): number => handWordY(tileCY(l, CFG.curtainRow), l.tile * 0.8) - 9 * 0.8;

  for (const seats of [[1], [2], [1, 2]] as const) {
    it(`write no SHOVE, and the hand's word where it always stood, with seat ${seats.join(" and ")} on the sheet`, () => {
      for (const role of ["p1", "p2"] as const) {
        const l = layout(role);
        const { cue, hand } = words(held(seats), l);
        // A grab on the field says no word (`asksGrab`, the owner, 13 October 2026).
        expect(cue).toBeNull();
        expect(hand.y).toBeCloseTo(under(l), 6);
      }
    });
  }

  // The hem is the pull while the rail is jammed, and a pull says no word: the
  // owner, 13 October 2026, on THE CURTAIN'S HEM — *remove* the P1 PULLS under it.
  it("write no word at all while the rail is jammed, on either screen", () => {
    const world = held([1]);
    const c = body(world);
    c.phase = "pinned";
    c.phaseBeat = world.beat;
    for (const role of ["p1", "p2"] as const) {
      expect(() => words(world, layout(role))).toThrow("no hand word was written");
    }
  });
});
