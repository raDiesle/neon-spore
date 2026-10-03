import { type GimbalState, gimbalAligned, OUTER } from "@neon-spore/sim";
import { gimbalDrumR, gimbalRingR, type Point } from "./gimbal-shape.js";
import { halo, strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GIMBAL locked** — the picture of both rings standing true, asked for
 * by name (the owner, 3 October 2026: *increase the visual if it's correct*).
 *
 * Since the marks were swapped, both true is the one moment both screens are
 * told the same thing, and it is the moment the pair has to count down and
 * let go together (`sim/gimbal-let-go.ts`). So it has to be unmissable from
 * across a room, on a phone held at arm's length, and it has to read as
 * *locked* rather than as *hit*:
 *
 * - **a cross of light along both pivot axes** — the outer ring's top and
 *   bottom, the inner's sides — the gimbal's own geometry lit end to end, so
 *   the lock is drawn as the two rings' right angle and not as a burst;
 * - **the drum lit from inside**, the core it will open on at the hatch
 *   showing through its seam for the length of the lock;
 * - **a ring of light thrown off the drum** the moment the pair comes true
 *   (`GimbalFx.locked`, thrown on the frame it starts), out past the outer rim, so the instant of it is seen
 *   even by the seat looking at the other phone.
 *
 * The rims themselves go white-hot in `gimbal-ring.ts`. Everything here is
 * drawn in the plane the rings are, after the drum and before the rings, so
 * the light is *through* the cradle and the rims stand on it. Five draws, two
 * of them sprite blits: the budget rows are `frame-budget.test.ts`'s.
 */
export function drawGimbalBeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: GimbalState,
  at: Point,
  beat: number,
  time: number,
  thrown: number,
): void {
  if (!gimbalAligned(s, beat)) return;
  const reach = gimbalRingR(l, OUTER) + l.tile * 0.7;
  const breathe = 0.8 + 0.2 * Math.sin(time * 9);
  const width = l.tile * (0.5 + 0.35 * thrown);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const across of [false, true]) {
    const g = across
      ? ctx.createLinearGradient(at.x, at.y - width, at.x, at.y + width)
      : ctx.createLinearGradient(at.x - width, at.y, at.x + width, at.y);
    g.addColorStop(0, rgba(PALETTE.hullRim, 0));
    g.addColorStop(0.5, rgba(PALETTE.hullRim, 0.55 * breathe));
    g.addColorStop(1, rgba(PALETTE.hullRim, 0));
    ctx.fillStyle = g;
    if (across) ctx.fillRect(at.x - reach, at.y - width, reach * 2, width * 2);
    else ctx.fillRect(at.x - width, at.y - reach, width * 2, reach * 2);
  }
  ctx.restore();
  halo(ctx, at.x, at.y, gimbalDrumR(l) * (1.6 + 0.6 * thrown), PALETTE.wispRim, 0.7 * breathe);
  if (thrown > 0) {
    const shock = new Path2D();
    const r = gimbalDrumR(l) + (reach + l.tile - gimbalDrumR(l)) * (1 - thrown);
    shock.arc(at.x, at.y, r, 0, Math.PI * 2);
    strokeGlow(ctx, shock, PALETTE.hullRim, STROKE.outline, 2, thrown);
  }
}
