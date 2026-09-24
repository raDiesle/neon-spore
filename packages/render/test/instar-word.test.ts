import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { drawInstarWord } from "../src/instar-word.js";
import { computeLayout } from "../src/layout.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The kind line THE INSTAR's own scanner box never drew**
 * (`render/src/instar-word.ts`).
 *
 * The owner's brief for this box, 17 September 2026: *"one word … and above
 * it what kind of action is required"* (`docs/spec/bosses.md` §11.32). Only
 * the word ever landed; `docs/decisions.md` #34 built the second line onto
 * every other boss's cue and left this box, the one it generalised from,
 * one line short. This file is the box asked directly, `boss-cue.test.ts`'s
 * own way with `drawCueText` — the box is drawn on its own rather than
 * through a frame, since what is at stake is which lines land, not a pixel.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

function drawn(word: string, kind?: string): TextBox[] {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  drawInstarWord(ctx as unknown as CanvasRenderingContext2D, L, word, 200, 400, 1, true, kind);
  return ctx.texts as TextBox[];
}

describe("THE INSTAR's scanner box", () => {
  it("draws one line when no kind is given — THE STARE's and THE FILAMENT's own calls", () => {
    const texts = drawn("P1'S");
    expect(texts.map((t) => t.text)).toEqual(["P1'S"]);
  });

  it("draws the kind above the verb when the two differ", () => {
    const texts = drawn("TAP TAP", "PRESS");
    expect(texts.map((t) => t.text).sort()).toEqual(["PRESS", "TAP TAP"]);
    const kind = texts.find((t) => t.text === "PRESS");
    const word = texts.find((t) => t.text === "TAP TAP");
    expect(kind, "no kind line drawn").toBeTruthy();
    expect(word, "no verb drawn").toBeTruthy();
    expect((kind as TextBox).y).toBeLessThan((word as TextBox).y);
  });

  it("never draws CARRY: the verb is the motion already, the owner's 24 September", () => {
    expect(drawn("PULL DOWN", "CARRY").map((t) => t.text)).toEqual(["PULL DOWN"]);
  });

  it("hangs off the mark's other side when this one would push it back over the mark", () => {
    // THE INSTAR's egg clutch, near the right edge: the box clamped to the
    // glass stood over the swipe it named (24 September 2026).
    const { ctx } = stubCanvas();
    ctx.texts = [];
    const mark = L.width - 20;
    const c = ctx as unknown as CanvasRenderingContext2D;
    drawInstarWord(c, L, "SWIPE DOWN", mark + 30, 400, 1, true, undefined, mark - 30);
    const x = (ctx.texts as TextBox[])[0]?.x ?? mark;
    expect(x).toBeLessThan(mark - 30);
  });

  it("draws once when the kind is the verb said twice, THE TURN mark's own case", () => {
    const texts = drawn("TURN", "TURN");
    expect(texts.map((t) => t.text)).toEqual(["TURN"]);
  });
});
