import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { BODY_AURA, bodyAura } from "../src/body-aura.js";
import { LIVING_SKIN } from "../src/living-skin.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The light a bright body throws round its own contour (`body-aura.ts`): its
 * path stroked wide under the fill, so what shows is outside the line only.
 */

beforeAll(installCanvasGlobals);

interface Op {
  readonly op: "stroke" | "fill";
  readonly alpha: number;
  readonly width: number;
  readonly mode: string;
}

function ops(draw: (ctx: CanvasRenderingContext2D) => void): Op[] {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const at: Op[] = [];
  const stroke = c.stroke.bind(c);
  const fill = c.fill.bind(c);
  const note = (op: Op["op"]): void => {
    at.push({ op, alpha: c.globalAlpha, width: c.lineWidth, mode: c.globalCompositeOperation });
  };
  c.stroke = (p?: Path2D) => {
    note("stroke");
    stroke(p as Path2D);
  };
  c.fill = ((...a: unknown[]) => {
    note("fill");
    (fill as (...b: unknown[]) => void)(...a);
  }) as typeof c.fill;
  draw(c);
  return at;
}

const BODY = { hex: PALETTE.red, rim: PALETTE.redRim, dark: PALETTE.redDark };

describe("a body's aura", () => {
  it("is its passes, widest and faintest first, additively", () => {
    const at = ops((ctx) => bodyAura(ctx, new Path2D(), PALETTE.cyan, 20, 1, 0));
    expect(at.length).toBe(BODY_AURA.passes);
    for (const o of at) expect(o.mode).toBe("lighter");
    for (let i = 1; i < at.length; i++) {
      expect(at[i]?.width ?? 0).toBeLessThan(at[i - 1]?.width ?? 0);
      expect(at[i]?.alpha ?? 0).toBeGreaterThan(at[i - 1]?.alpha ?? 0);
    }
    // Both sides of the line: the outer half reaches `reach` of the radius.
    expect((at[0]?.width ?? 0) / 2).toBeCloseTo(20 * BODY_AURA.reach);
  });

  it("reaches as far on screen whatever scale the body is drawn under", () => {
    const wide = (scale: number): number =>
      (ops((ctx) => bodyAura(ctx, new Path2D(), PALETTE.cyan, 20, scale, 0))[0]?.width ?? 0) *
      scale;
    expect(wide(0.27)).toBeCloseTo(wide(1));
  });

  it("fades with the body it is under, and leaves the context as it found it", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    c.globalAlpha = 0.4;
    c.lineWidth = 3;
    c.lineJoin = "bevel";
    const at = ops((d) => {
      d.globalAlpha = 0.4;
      bodyAura(d, new Path2D(), PALETTE.cyan, 20, 1, 0);
    });
    const full = ops((d) => bodyAura(d, new Path2D(), PALETTE.cyan, 20, 1, 0));
    expect(at[0]?.alpha ?? 0).toBeCloseTo((full[0]?.alpha ?? 0) * 0.4);
    bodyAura(c, new Path2D(), PALETTE.cyan, 20, 1, 0);
    expect(c.globalAlpha).toBeCloseTo(0.4);
    expect(c.lineWidth).toBe(3);
    expect(c.lineJoin).toBe("bevel");
    expect(c.globalCompositeOperation).toBe("source-over");
  });

  it("is laid under a living body's flesh, so none of it lands on the body", () => {
    const at = ops((ctx) =>
      LIVING_SKIN.paint(ctx, new Path2D(), "nonzero", {
        ...BODY,
        r: 14,
        scale: 0.3,
        rx: 40,
        ry: 40,
        rot: 0,
        t: 0,
      }),
    );
    const firstFill = at.findIndex((o) => o.op === "fill");
    expect(firstFill).toBe(BODY_AURA.passes);
    for (const o of at.slice(0, firstFill)) expect(o.mode).toBe("lighter");
  });
});
