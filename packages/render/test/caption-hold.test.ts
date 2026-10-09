import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { guideScene, type SceneStep, sceneScript, stepSpan, WAVES } from "@neon-spore/content";
import { beatPhase, DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { bandControlSet } from "../src/band.js";
import type { AnchorPoint } from "../src/caption-anchor.js";
import { CaptionHold } from "../src/caption-hold.js";
import { filmLayout } from "../src/guide-film.js";
import { captionBox } from "../src/guide-tide-caption-box.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * **A caption about a body outlives the body, until the page is rebuilt**
 * (`caption-hold.ts`). THE BEATBOX's last page is the case that found it: the
 * box goes quiet a beat after the last tap, and the words *STOPPING IS THE
 * ANSWER* were up for 55 of the page's 269 ticks.
 */

const body = (text: string): SceneStep => ({ tick: 0, seat: 1, text, anchor: { at: "body" } });
const RING: AnchorPoint = { x: 100, y: 200, r: 20, clear: 16 };

describe("the hold", () => {
  it("keeps the last ring of a body page once the body has gone", () => {
    const hold = new CaptionHold();
    const page = body("A");
    expect(hold.through(page, RING)).toBe(RING);
    expect(hold.through(page, null)).toBe(RING);
  });

  it("has nothing to keep on a page whose body has not come yet", () => {
    expect(new CaptionHold().through(body("A"), null)).toBeNull();
  });

  it("does not carry one page's ring onto another", () => {
    const hold = new CaptionHold();
    hold.through(body("A"), RING);
    expect(hold.through(body("B"), null)).toBeNull();
  });

  it("forgets on a reset, which is the world under the film being rebuilt", () => {
    const hold = new CaptionHold();
    const page = body("A");
    hold.through(page, RING);
    hold.reset();
    expect(hold.through(page, null)).toBeNull();
  });

  it("leaves every other anchor to answer for itself", () => {
    const hold = new CaptionHold();
    const step: SceneStep = { tick: 0, seat: 1, text: "A", anchor: { at: "pod" } };
    hold.through(step, RING);
    expect(hold.through(step, null)).toBeNull();
  });
});

describe("THE BEATBOX's last page", () => {
  const CFG = { ...DEFAULT_CONFIG, briefings: true };
  const wave = WAVES.findIndex((w) => w.guide?.scene === "theBeatbox");
  const scene = guideScene("theBeatbox");
  const last = scene.steps.length - 1;
  const page = scene.steps[last]!;

  /** Ticks of the page with no caption, played as the stage plays it. */
  function bare(hold: CaptionHold | undefined): { bare: number; of: number } {
    const { ctx } = stubCanvas();
    const { l } = filmLayout(computeLayout({ width: 390, height: 844, dpr: 1 }, CFG, "p2"), CFG, 2);
    const run = new SceneRun(sceneScript("theBeatbox", wave, CFG));
    const set = bandControlSet(undefined, run.world);
    const span = stepSpan(scene, last);
    run.restart(span.from);
    let count = 0;
    for (let t = span.from; t < span.to; t++) {
      const c = ctx as unknown as CanvasRenderingContext2D;
      const phase = beatPhase(CFG, run.world.tick);
      if (!captionBox(c, l, run.world, set, page, phase, undefined, hold)) count++;
      run.advance([]);
    }
    return { bare: count, of: span.to - span.from };
  }

  it("is about a body, and loses it for most of its span", () => {
    expect(page.anchor.at).toBe("body");
    const { bare: n, of } = bare(undefined);
    expect(n / of).toBeGreaterThan(0.5);
  });

  it("keeps its words up to the end of the span with the hold", () => {
    expect(bare(new CaptionHold()).bare).toBe(0);
  });
});
