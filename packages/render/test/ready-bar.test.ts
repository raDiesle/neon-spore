import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, toReadyPage, type World } from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The way back off the gate, on the glass rather than only in the code.**
 *
 * A seat on the last page of a guide could always page back — `guideStepHeard`
 * refuses only a seat that has said READY (`sim/guide-steps.ts`) — and the bar
 * under the page carried BACK for it. Nobody could see it: two of the bar's
 * three hang in the top bezel (`guide-tide-bar.ts`) and the gate drew its band
 * *after* the bar, straight over both. The owner, 20 September 2026: *on the
 * Ready? screen it should also be possible to go back through the steps of the
 * tutorial.*
 *
 * So the order is the assertion. A button drawn under the thing that covers it
 * is a button that does not exist, and this is the one page in the guide where
 * the two are drawn in the other order.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const SIZE = { width: 390, height: 844, dpr: 2 };
const WAVE = WAVES.findIndex((w) => w.guide?.scene);

beforeAll(installCanvasGlobals);

/** A world on the last page of a stepped guide: the gate. */
function atTheGate(): World {
  const world = createWorld(CFG, 3);
  startWave(world, WAVE, [], [], null, true, waveGuideSteps(WAVE));
  toReadyPage(world, 1);
  toReadyPage(world, 2);
  return world;
}

function gate(): TextBox[] {
  const { ctx } = stubCanvas();
  const l = computeLayout(SIZE, CFG, "p1");
  ctx.texts = [];
  drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, atTheGate(), { role: "p1" });
  return ctx.texts as TextBox[];
}

function said(texts: TextBox[], word: string): number {
  return texts.findIndex((t) => t.text === word);
}

describe("the bar on the gate", () => {
  it("draws BACK after the band, so the membrane is not over it", () => {
    const texts = gate();
    const band = said(texts, "TUTORIAL");
    const back = said(texts, "BACK");
    expect(band, "the band says TUTORIAL on every page").toBeGreaterThanOrEqual(0);
    expect(back, "the gate carries BACK").toBeGreaterThanOrEqual(0);
    expect(back).toBeGreaterThan(band);
  });

  it("draws the whole bar last, the three of them together", () => {
    const texts = gate();
    const band = said(texts, "TUTORIAL");
    for (const word of ["BACK", "REPLAY", "NEXT"]) {
      expect(said(texts, word), word).toBeGreaterThan(band);
    }
  });

  it("still says the wave's name and number, which is what the band does not", () => {
    const texts = gate();
    expect(said(texts, `WAVE ${WAVE + 1}`)).toBeGreaterThanOrEqual(0);
    expect(said(texts, WAVES[WAVE]?.name ?? "")).toBeGreaterThanOrEqual(0);
    // The nameplate is the film pages' and not this one's: the gate says both
    // already, in twenty-one point (`guide-head.test.ts`).
    expect(said(texts, `WAVE ${WAVE + 1} · ${WAVES[WAVE]?.name}`)).toBe(-1);
  });
});
