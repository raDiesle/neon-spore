import { describe, expect, it } from "bun:test";
import { arms } from "../src/wisp-arms.js";
import type { WispFringe } from "../src/wisp-look.js";

/**
 * Each of THE WISP's arms is a ribbon lit across its width, and the light has
 * to stay across the ribbon when it sways. The band was once built level with
 * the arm's *root*, so a swung arm's lower half ran past the band's ends and
 * went one flat colour — lit or shade — the whole way down.
 *
 * A recording context rather than a frame: what is being asked is where each
 * arm's gradient line stands against the outline filled with it, and a
 * picture of a twenty-pixel arm cannot answer that.
 */

interface Arm {
  readonly band: readonly [number, number, number, number];
  readonly outline: readonly [number, number][];
}

function drawArms(t: number): Arm[] {
  const out: Arm[] = [];
  let band: [number, number, number, number] | null = null;
  let outline: [number, number][] = [];
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(target, key) {
      if (key in target) return target[key as string];
      if (key === "createLinearGradient")
        return (x0: number, y0: number, x1: number, y1: number) => {
          band = [x0, y0, x1, y1];
          return { addColorStop() {} };
        };
      if (key === "beginPath") return () => (outline = []);
      if (key === "moveTo" || key === "lineTo")
        return (x: number, y: number) => outline.push([x, y]);
      if (key === "fill")
        return () => {
          if (band) out.push({ band, outline });
          band = null;
        };
      return () => {};
    },
    set(target, key, value) {
      target[key as string] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  const f: WispFringe = {
    ctx,
    rx: 10,
    ry: 10,
    t,
    j: { crouch: 0, land: 0 } as WispFringe["j"],
    dive: 0,
    air: 0,
    heading: 0,
    noise: 0,
    haze: (hex) => hex,
  };
  arms(f);
  return out;
}

/** Where a point falls along the band: 0 at its lit end, 1 at its shade end. */
function along(band: Arm["band"], x: number, y: number): number {
  const [x0, y0, x1, y1] = band;
  const dx = x1 - x0;
  const dy = y1 - y0;
  return ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy);
}

describe("THE WISP's arms", () => {
  it("keep every arm's outline inside its own light as it sways", () => {
    let arms = 0;
    for (let t = 0; t < 8; t += 0.37) {
      for (const arm of drawArms(t)) {
        arms++;
        const inside = arm.outline.filter(([x, y]) => {
          const u = along(arm.band, x, y);
          return u >= 0 && u <= 1;
        });
        expect(inside.length / arm.outline.length, `t ${t.toFixed(2)}`).toBeGreaterThan(0.95);
      }
    }
    expect(arms).toBeGreaterThan(40);
  });

  it("put the lit end on the key's side, the left", () => {
    for (const arm of drawArms(1.3)) expect(arm.band[0]).toBeLessThan(arm.band[2]);
  });
});
