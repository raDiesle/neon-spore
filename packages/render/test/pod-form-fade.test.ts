import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { drawPodForm, POD_FORMS, podFormFor } from "../src/pod-forms.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A pod form drawn where somebody else chose — the maw's grip and THE PULSE's
 * lane (`drawPodForm`) — honours the fade it is asked for, though every layer
 * of the seed sets `globalAlpha` outright (`pod-fade.ts`). Without it, a pod
 * far up THE PULSE's lane would arrive at full strength the moment its
 * sphere was filled.
 */

beforeAll(installCanvasGlobals);

/** The alpha at every fill and stroke `draw` makes. */
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

/** A pod id for each form, found by asking which one an id wears. */
const ids = POD_FORMS.map((f) => {
  let id = 0;
  while (podFormFor(id) !== f.draw) id++;
  return id;
});

describe("a pod form, faded", () => {
  for (const [i, id] of ids.entries()) {
    for (const fake of [false, true]) {
      it(`${POD_FORMS[i]?.name}${fake ? "'s fake" : ""}: draws nothing above the fade, and the same at full`, () => {
        const draw = (alpha: number) => (c: CanvasRenderingContext2D) =>
          drawPodForm(c, id, 100, 100, 20, 3.1, 0.6, fake, alpha);
        const full = alphas(draw(1));
        const half = alphas(draw(0.4));
        expect(full.length).toBeGreaterThan(0);
        expect(half).toHaveLength(full.length);
        for (let i = 0; i < full.length; i++) {
          expect(half[i] ?? 0).toBeCloseTo((full[i] ?? 0) * 0.4, 6);
        }
      });
    }
  }

  it("is faded by the context's own alpha, as THE SCOUT's torn load fades it", () => {
    const at = (alpha: number) =>
      alphas((c) => {
        c.globalAlpha = alpha;
        drawPodForm(c, 3, 100, 100, 20, 1.2, Number.POSITIVE_INFINITY);
      });
    const full = at(1);
    const torn = at(0.3);
    expect(torn).toHaveLength(full.length);
    for (let i = 0; i < full.length; i++) {
      expect(torn[i] ?? 0).toBeCloseTo((full[i] ?? 0) * 0.3, 6);
    }
  });

  it("leaves the context's alpha where it found it", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    c.globalAlpha = 0.8;
    drawPodForm(c, 3, 100, 100, 20, 1.2, Number.POSITIVE_INFINITY, false, 0.5);
    expect(c.globalAlpha).toBe(0.8);
  });
});
