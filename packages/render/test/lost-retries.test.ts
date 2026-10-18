import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { lostButtons } from "../src/lost-boxes.js";
import { drawLostRetries, retriesBaseline } from "../src/lost-retries.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The run's retries under the lost screen's buttons, counting up by one
 * (`lost-retries.ts`): the old number stands, rolls out, and the new one lands.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, DEFAULT_CONFIG, "p1");

beforeAll(installCanvasGlobals);

function said(age: number, retries = 2): string[] {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  drawLostRetries(ctx as never, L, { age, retries, guided: false });
  return (ctx.texts as TextBox[]).map((t) => t.text);
}

describe("the lost screen's retries", () => {
  it("is not there before the buttons have settled", () => {
    expect(said(0)).toHaveLength(0);
  });

  it("shows the old count, then rolls it up by one", () => {
    expect(said(1.1)).toContain("2");
    expect(said(1.1)).not.toContain("3");
    // Mid-roll both numbers are in the window.
    const rolling = said(1.5);
    expect(rolling).toContain("2");
    expect(rolling).toContain("3");
    // Landed, with the `+1` rising off it; then the `+1` is gone.
    expect(said(1.9)).toEqual(expect.arrayContaining(["3", "+1"]));
    expect(said(1.9)).not.toContain("2");
    expect(said(4)).not.toContain("+1");
    expect(said(4)).toContain("3");
  });

  it("counts from nothing on the run's first loss", () => {
    expect(said(4, 0)).toContain("1");
  });

  it("stands under the lowest button, on both layouts", () => {
    for (const guided of [false, true]) {
      const quit = lostButtons(L, guided).quit;
      expect(retriesBaseline(L, guided)).toBeGreaterThan(quit.y + quit.h + 40);
      expect(retriesBaseline(L, guided) + 30).toBeLessThan(L.playHeight);
    }
  });
});
