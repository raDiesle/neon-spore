import { describe, expect, test } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { beats, livingBodyKinds, livingMotion } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { clearBakedCaches } from "../src/baked.js";
import { drawOwnLight } from "../src/creature-detail.js";
import { bodyShade } from "../src/creature-glance.js";
import { drawGlancedLayer } from "../src/glance-layer.js";
import type { Layout } from "../src/layout.js";
import { installPixelGlobals } from "./pixel-harness.js";

/**
 * **A turned body's layer holds the whole of its own light** — the plume and
 * the halo `drawOwnLight` lays round it — and no more than that.
 *
 * The layer is cleared and copied every frame over its whole box, so the box
 * is cut to `ownLightReach`; this proves the cut takes nothing. The light is
 * drawn turned at the reach `bodyShade` gives it and again at twice that, and
 * the two pictures must be the same to the last bit. Exactly, because the
 * geometry is chosen to round nowhere: the body's centre on whole pixels and
 * a swing of a quarter radius, so every transform the layer composes is the
 * same number at either reach and only a cut could tell them apart. On the
 * game's own numbers the transforms round differently at two reaches and
 * the seam's pixels move by a step or two, which hides a faint cut.
 *
 * Every pose a living body takes (`livingMotion`'s furthest offset either
 * way), every phase of the plume's curl, both swings, and a shell with either
 * plate off, whose light comes out of the open side (`plateLightShift`).
 */

const TILE = 40;
/** A living body's radius at that tile: `drawGlancedLiving`'s 0.4. */
const R = TILE * 0.4;
const X = 256;
const Y = 256;
const SIZE = 512;
const LAYOUT = { tile: TILE } as Layout;

/** The furthest any living body's pose moves it, either way, in pixels. */
function furthestPose(): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  for (const kind of livingBodyKinds()) {
    const motion = livingMotion(kind);
    for (let i = 0; i <= 2000; i++) {
      const p = motion.poseAt(beats(i / 50));
      dx = Math.max(dx, Math.abs(p.dx));
      dy = Math.max(dy, Math.abs(p.dy));
    }
  }
  return { dx: dx * TILE, dy: dy * TILE };
}

const BODIES: Record<string, Creature> = {
  slick: { kind: "slick", col: 4, shell: 0 } as unknown as Creature,
  "shell, left plate off": { kind: "shell", col: 4, shell: 0b10 } as unknown as Creature,
  "shell, right plate off": { kind: "shell", col: 4, shell: 0b01 } as unknown as Creature,
};

function drawLight(
  c: Creature,
  swing: number,
  pose: { x: number; y: number },
  t: number,
  grow: number,
): Uint8ClampedArray {
  const ctx = createCanvas(SIZE, SIZE).getContext("2d") as unknown as CanvasRenderingContext2D;
  const shade = bodyShade({ l: LAYOUT, c }, { r: R, lit: true });
  const grown = { ...shade, reach: shade.reach * grow, up: shade.up * grow };
  const f = { x: X, y: Y, r: R, hold: 0, swing, roll: 0 };
  drawGlancedLayer(ctx, f, grown, (g) => {
    drawOwnLight(g, LAYOUT, c, X, Y, pose.x, pose.y, R, "#4fd8ff", t);
    return [];
  });
  return ctx.getImageData(0, 0, SIZE, SIZE).data;
}

describe("a turned body's layer", () => {
  installPixelGlobals();
  const { dx, dy } = furthestPose();
  for (const [name, c] of Object.entries(BODIES)) {
    test(`holds all of its own light: ${name}`, () => {
      clearBakedCaches();
      let drawn = 0;
      for (const swing of [-0.25 * R, 0.25 * R]) {
        for (const pose of [
          { x: -dx, y: -dy },
          { x: dx, y: dy },
          { x: -dx, y: dy },
          { x: dx, y: -dy },
        ]) {
          for (let t = 0; t < 7; t += 0.5) {
            const cut = drawLight(c, swing, pose, t, 1);
            const whole = drawLight(c, swing, pose, t, 2);
            expect(Buffer.from(cut).equals(Buffer.from(whole))).toBe(true);
            drawn++;
          }
        }
      }
      expect(drawn).toBe(2 * 4 * 14);
    });
  }
});
