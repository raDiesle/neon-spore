import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { introEar } from "../src/intro-ear.js";
import { computeLayout } from "../src/layout.js";
import { drawChew } from "../src/maw.js";
import { drawPodCore } from "../src/pods.js";
import { drawPulseArrival } from "../src/pulse-body.js";
import { globe } from "../src/recoil-globe.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A fade set around a glowed line reaches the line.
 *
 * `strokeGlow` does not read the context's alpha and leaves it at 1
 * (`glow-alpha.test.ts`), so a picture that faded a body by setting
 * `globalAlpha` and then glowed its edge drew that edge — and everything after
 * it — at full strength over a fill at a third. These are the callers the
 * 24 September 2026 tally found doing it once the stub's `restore` put the
 * alpha back as a browser does; the rest of that list was the stub.
 */

beforeAll(installCanvasGlobals);

/** The alpha of every stroke and fill one picture makes. */
function alphas(draw: (ctx: CanvasRenderingContext2D) => void): number[] {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const at: number[] = [];
  const stroke = c.stroke.bind(c);
  const fill = c.fill.bind(c);
  c.stroke = (p?: Path2D) => {
    at.push(c.globalAlpha);
    stroke(p as Path2D);
  };
  c.fill = ((...a: unknown[]) => {
    at.push(c.globalAlpha);
    (fill as (...b: unknown[]) => void)(...a);
  }) as typeof c.fill;
  draw(c);
  return at;
}

describe("THE PULSE's arrival far up its lane", () => {
  for (const lane of ["pod", "slick"] as const) {
    it(`draws a ${lane} no more present than its fade, edge and core included`, () => {
      // `near` 0 is the faintest an arrival is drawn: 0.35.
      const at = alphas((ctx) =>
        drawPulseArrival(ctx, { x: 100, y: 100, r: 20, lane, seed: 3, time: 1, near: 0 }),
      );
      expect(at.length).toBeGreaterThan(0);
      expect(Math.max(...at)).toBeLessThanOrEqual(0.35 + 1e-9);
    });
  }
});

describe("a pod's core", () => {
  it("is drawn under the caller's fade — THE MOULT's cargo mark coming in", () => {
    const at = alphas((ctx) => {
      ctx.globalAlpha = 0.4;
      drawPodCore(ctx, 1, "ward");
    });
    expect(at.length).toBeGreaterThan(0);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.4 + 1e-9);
  });
});

describe("THE RECOIL's spent rib", () => {
  it("is drawn at seven tenths on its near half as well as its far", () => {
    const cage = (left: number) =>
      alphas((ctx) =>
        globe({
          ctx,
          x: 100,
          y: 100,
          inner: 20,
          hoop: 30,
          struts: 4,
          left,
          strain: 1,
          metal: "#88ccff",
          dark: "#102030",
          burnt: "#ff6030",
          glow: 1,
          time: 0.3,
          phase: 0,
        }),
      );
    // Whole at 1 are the equator's two halves and the two poles' bolts, and
    // nothing else once every rib is spent; a whole cage adds its ribs' cores.
    const whole = (at: number[]) => at.filter((a) => a === 1).length;
    expect(whole(cage(0))).toBe(2 + 2 * 2);
    expect(whole(cage(4))).toBeGreaterThan(whole(cage(0)));
  });
});

describe("the ship and the screens", () => {
  it("draws the skin coming apart at the maw no more present than its heat", () => {
    // `chew` 0.4 is the hottest any piece gets: 0.25 + 0.75 * 0.4.
    const l = computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, "p1");
    const at = alphas((ctx) =>
      drawChew(ctx, l, { armed: 0, intake: 0, chew: 0.4, charge: 0 }, 0.2, 200, (x) => ({
        x,
        y: 600,
      })),
    );
    expect(at.length).toBeGreaterThan(0);
    expect(Math.max(...at)).toBeLessThanOrEqual(0.55 + 1e-9);
  });

  it("brings the intro ear's arcs in with the voice, not whole the frame it starts", () => {
    // What is whole at a murmur is the ear itself, and no more of it than in
    // silence: the two arcs' cores stay under the fade.
    const whole = (cup: number) =>
      alphas((ctx) => introEar(ctx, 100, 100, 40, "#88ccff", 1, cup)).filter((a) => a === 1).length;
    expect(whole(0.3)).toBe(whole(0));
  });
});
