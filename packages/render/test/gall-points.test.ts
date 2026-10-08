import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { drawGallPoints } from "../src/gall-points.js";
import { gallPointAt } from "../src/gall-shape.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GALL's seam named for saying out loud (`render/src/gall-points.ts`):
 * one number under each point, one to four left to right as drawn, each
 * half's full on its own seat's screen and dim on the other's.
 */

beforeAll(() => installCanvasGlobals());

type Said = { text: string; x: number; fill: string };

/** Every `fillText` a draw makes, with the fill it was made in; everything else is swallowed. */
function said(role: ViewRole): Said[] {
  const out: Said[] = [];
  const state: Record<string, unknown> = {};
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key === "fillText") {
        return (text: string, x: number) => out.push({ text, x, fill: String(target.fillStyle) });
      }
      if (key in target) return target[key as string];
      return () => {};
    },
    set(target, key, value) {
      target[key as string] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  drawGallPoints(ctx, computeLayout(VIEWPORT, CFG, role), CFG, 0, 1);
  return out;
}

const FULL = rgba(PALETTE.hullRim, 1);

describe("THE GALL's numbered points", () => {
  it("numbers the points one to four, under each, on every screen", () => {
    for (const role of ["p1", "p2", "test"] as const) {
      const l = computeLayout(VIEWPORT, CFG, role);
      const texts = said(role);
      expect(texts.map((t) => t.text)).toEqual(["1", "2", "3", "4"]);
      texts.forEach((t, p) => {
        expect(t.x).toBe(gallPointAt(l, CFG, p).x);
      });
    }
  });

  it("draws a seat's own half full and the partner's dim, and both full on the test screen", () => {
    const full = (role: ViewRole) => said(role).map((t) => t.fill === FULL);
    expect(full("p1")).toEqual([true, true, false, false]);
    expect(full("p2")).toEqual([false, false, true, true]);
    expect(full("test")).toEqual([true, true, true, true]);
  });
});
