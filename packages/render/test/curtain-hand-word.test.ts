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
 * `SHOVEPULL` on the navigator's screen (7 October 2026). Both are drawn here
 * as the game draws them, and the boxes the words land in are compared.
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
  return { cue: ctx.texts.find((t) => t.text === cue?.word) ?? null, hand };
}

function meet(a: TextBox, b: TextBox): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe("THE CURTAIN's cue word and the hand's word", () => {
  for (const seats of [[1], [2], [1, 2]] as const) {
    it(`stand apart under SHOVE with seat ${seats.join(" and ")} on the sheet`, () => {
      for (const role of ["p1", "p2"] as const) {
        const { cue, hand } = words(held(seats), layout(role));
        expect(cue?.text).toBe("SHOVE");
        if (cue === null) continue;
        expect(meet(cue, hand)).toBe(false);
        // Stacked, not scattered: the hand's word is the line under the verb.
        expect(hand.y).toBeGreaterThan(cue.y);
        expect(hand.y - (cue.y + cue.h)).toBeLessThan(6);
      }
    });
  }

  it("stand apart under LIFT while the rail is jammed", () => {
    const world = held([1]);
    const c = body(world);
    c.phase = "pinned";
    c.phaseBeat = world.beat;
    const { cue, hand } = words(world, layout("p1"));
    expect(cue?.text).toBe("LIFT");
    if (cue !== null) expect(meet(cue, hand)).toBe(false);
  });

  it("leaves the hand's word where it always stood when no cue is up", () => {
    const world = held([1]);
    const c = body(world);
    c.phase = "pinned";
    c.phaseBeat = world.beat;
    // LIFT is the pilot's alone, so the navigator's sheet has no cue on it.
    const l = layout("p2");
    const { cue, hand } = words(world, l);
    expect(cue).toBeNull();
    // The box's top is its baseline less the 9px font's ascent.
    const under = handWordY(tileCY(l, CFG.curtainRow), l.tile * 0.8);
    expect(hand.y).toBeCloseTo(under - 9 * 0.8, 6);
  });
});
