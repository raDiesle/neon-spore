import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_GESTURES, type InstarGesture } from "@neon-spore/sim";
import { drawInstarGlyph } from "../src/instar-glyphs.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Every gesture draws its own glyph** (`instar-glyphs.ts`). Until 27
 * September 2026 a gesture with no branch fell through to the hold's two
 * thumbprints, so SHIELD, SUCK and SHOOT marks drew a hold under their own
 * words. Each gesture's picture is drawn into a logging context and no two
 * are the same; a shoot mark draws none, its crosshair being the mark.
 */

beforeAll(installCanvasGlobals);

/** Every call the glyph makes, with its numbers — the stub's own log leaves a path's points out. */
function picture(gesture: InstarGesture): string {
  const { ctx } = stubCanvas();
  ctx.strokeStyle = ctx.fillStyle = PALETTE.text;
  const calls: string[] = [];
  const recording = new Proxy(ctx, {
    get(target, key) {
      const v = Reflect.get(target, key);
      if (typeof v !== "function") return v;
      return (...args: unknown[]) => {
        const shown = args.map((a) => (typeof a === "number" ? a.toFixed(1) : typeof a));
        if (key !== "save" && key !== "restore") calls.push(`${String(key)}(${shown.join(",")})`);
        return v.apply(target, args);
      };
    },
    set: (target, key, v) => Reflect.set(target, key, v),
  });
  drawInstarGlyph(recording as unknown as CanvasRenderingContext2D, gesture, 100, 100, 30, 0);
  return calls.join("\n");
}

describe("THE INSTAR's glyphs", () => {
  const drawn = INSTAR_GESTURES.filter((g) => g !== "shoot");

  it("draws something for every gesture but the shoot mark's", () => {
    for (const g of drawn) expect(picture(g), g).not.toBe("");
    expect(picture("shoot")).toBe("");
  });

  it("draws no gesture's glyph with another's branch", () => {
    for (const [i, a] of drawn.entries()) {
      for (const b of drawn.slice(i + 1)) expect(picture(a), `${a} vs ${b}`).not.toBe(picture(b));
    }
  });
});
