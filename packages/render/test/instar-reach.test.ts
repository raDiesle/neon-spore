import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { instarFire } from "../src/instar-ebb.js";
import { drawFront } from "../src/instar-front.js";
import { seeFrontBody } from "../src/instar-front-body.js";
import { instarAt, instarFarEnd, instarHeadAt } from "../src/instar-place.js";
import type { Look } from "../src/instar-plate.js";
import { drawProfile } from "../src/instar-profile.js";
import {
  type Box,
  FRONT_REACH,
  frontCore,
  PROFILE_REACH,
  profileCore,
} from "../src/instar-reach.js";
import { instarThreat } from "../src/instar-shape.js";
import { instarBody } from "../src/instar-sway.js";
import { instarHandover, instarNeck, instarTurn } from "../src/instar-turn.js";
import { computeLayout } from "../src/layout.js";
import { acting, hung, TPB } from "./instar-kit.js";
import { installPixelGlobals, PIXEL_VIEWPORT } from "./pixel-harness.js";

/**
 * **No paint of THE INSTAR falls outside the box it is left undrawn by**
 * (`instar-reach.ts`). Both views are drawn into real pixels on a canvas seven
 * screens wide and tall, at every morph, window and landing of the script, and how far
 * the paint reaches past each view's own geometry is held under the margin
 * the drawer grows it by — before the drawer's safety on top.
 */

/** How many ticks apart the walk samples, and the canvas's resolution. */
const EVERY = 40;
const K = 0.15;
const MUL = 7;

installPixelGlobals();
const world = hung();
const l = computeLayout(PIXEL_VIEWPORT, world.cfg, "p1");
const W = Math.ceil(l.width * MUL * K);
const H = Math.ceil(l.height * MUL * K);
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
const off = { x: (l.width * (MUL - 1)) / 2, y: (l.height * (MUL - 1)) / 2 };

/** What `draw` painted, in layout pixels — or null for nothing. */
function painted(draw: () => void): (Box & { edge: boolean }) | null {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(K, 0, 0, K, off.x * K, off.y * K);
  ctx.save();
  draw();
  ctx.restore();
  const d = ctx.getImageData(0, 0, W, H).data;
  let x0 = W;
  let x1 = -1;
  let y0 = H;
  let y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if ((d[(y * W + x) * 4 + 3] ?? 0) > 2) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  if (x1 < 0) return null;
  const edge = x0 === 0 || y0 === 0 || x1 === W - 1 || y1 === H - 1;
  return {
    x0: x0 / K - off.x,
    x1: (x1 + 1) / K - off.x,
    y0: y0 / K - off.y,
    y1: (y1 + 1) / K - off.y,
    edge,
  };
}

const past = (p: Box, b: Box) => ({
  left: b.x0 - p.x0,
  right: p.x1 - b.x1,
  up: b.y0 - p.y0,
  down: p.y1 - b.y1,
});

describe("THE INSTAR's reach", () => {
  it("stays inside each view's box over the whole script", () => {
    const front = { worst: 0, at: "" };
    const side = { left: 0, right: 0, up: 0, down: 0 };
    const sideAt: Record<string, string> = {};
    const s0 = acting(world, 0);
    const base = world.beat;
    for (let cur = 0; cur < s0.steps.length; cur++) {
      const s = acting(world, cur);
      const st = s.steps[cur]!;
      for (const phase of ["morph", "act", "land"] as const) {
        s.phase = phase;
        s.phaseBeat = base;
        s.progress = st.marks.map((m) => (phase === "land" ? m.need : 0));
        const beats =
          phase === "morph" ? st.morphBeats : phase === "act" ? st.windowBeats : st.landBeats;
        for (let t = 0; t < beats * TPB; t += EVERY) {
          const beat = base + Math.floor(t / TPB);
          const bp = (t % TPB) / TPB;
          const held = phase === "land" ? 1 : 0;
          const { f } = instarBody(s, world.cfg, beat, bp, held);
          const { head, r } = instarHeadAt(l, f);
          const threat = phase === "land" ? held : instarThreat(s, beat, bp);
          const fire = instarFire(s, f, beat, bp, held);
          const look: Look = {
            f,
            head,
            r,
            time: beat / 2,
            fade: 1,
            hurt: 0,
            threat,
            fire,
            harden: 0,
            shoveUp: 0,
            shoveDown: 0,
          };
          const at = `${cur} ${st.pose} ${phase} ${(t / TPB).toFixed(2)}`;
          const h = instarHandover(f.side);
          if (h < 0.99) {
            const p = painted(() => drawFront(ctx, l, look));
            if (p) {
              expect(p.edge, `the face-on view runs off the test's canvas, ${at}`).toBe(false);
              const neck = instarNeck(head, r);
              const seen = seeFrontBody(look, neck, instarFarEnd(l, f), instarTurn(f.side));
              const m = past(p, frontCore(head, neck, seen));
              const worst = Math.max(m.left, m.right, m.up, m.down) / r;
              if (worst > front.worst) Object.assign(front, { worst, at });
            }
          }
          if (h > 0.01) {
            const p = painted(() => drawProfile(ctx, l, look));
            if (p) {
              expect(p.edge, `the side-on view runs off the test's canvas, ${at}`).toBe(false);
              const m = past(p, profileCore(l, f));
              for (const k of ["left", "right", "up", "down"] as const) {
                const v = (m[k] * 1000) / l.gridWidth;
                if (v > side[k]) {
                  side[k] = v;
                  sideAt[k] = at;
                }
              }
            }
          }
        }
      }
    }
    if (process.env.REACH) console.log(front, side, sideAt, instarAt(l, 0, 0));
    expect(front.worst, `the face-on view's reach, ${front.at}`).toBeLessThan(FRONT_REACH);
    for (const k of ["left", "right", "up", "down"] as const)
      expect(side[k], `the side-on view's reach ${k}, ${sideAt[k]}`).toBeLessThan(PROFILE_REACH[k]);
  }, 120_000);
});
