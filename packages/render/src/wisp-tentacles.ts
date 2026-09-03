import { PALETTE } from "./palette.js";
import type { WispJump } from "./wisp.js";

/**
 * THE WISP's streamers — the half of the jellyfish that hangs.
 *
 * Its own file rather than another block in `wisp-body.ts` for the reason the
 * limit exists at all, and the split lands where the picture already divides:
 * the bell is a contour with a fill and a rim, and these are six strokes that
 * read the jump and nothing else. Everything here is in *silhouette units*,
 * inside the one `ctx.scale` `drawWispBody` has already applied — a streamer
 * measured in pixels would be a body whose tentacles grew a different amount
 * than its bell as it came down the field.
 */

/** How many streamers hang off the hem. Five: enough to read as a fringe from
 * the top of the field, few enough that each one still moves separately at the
 * bottom of it, where the perspective scale has made them large. */
const TENTACLES = 5;

/**
 * The streamers, in silhouette units and behind the bell.
 *
 * Each is one cubic from the hem to a tip, and the three things the jump does
 * to it are all done to the tip:
 *
 * - **gathered** while it crouches, pulled up under the bell like something
 *   coiling to go;
 * - **trailing** while it flies, swept back against the heading and long,
 *   most at the two ends of the arc where it is moving fastest;
 * - **splashed** on the landing, short and thrown outward across the tile.
 *
 * The sway is on the contour's own clock, so a streamer breathes with the
 * bell it hangs off rather than on a second clock of its own.
 */
export function drawTentacles(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  t: number,
  j: WispJump,
  dive: number,
  air: number,
  heading: number,
  haze: (hex: string) => string,
): void {
  // Short when gathered, short when splashed, longest at the two ends of the
  // arc — a streamer is longest exactly when the body is moving hardest.
  const len = ry * (1.25 - j.crouch * 0.7 - j.land * 0.72 + dive * 0.5);
  // Outward when it lands and only then: the splash is the one moment these
  // are not hanging.
  const splay = 1 + j.land * 2.2 + air * 0.25;
  // Swept back against the heading while it is in the air.
  const drag = -heading * rx * 0.55 * (dive * 0.7 + air * 0.35);

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < TENTACLES; i++) {
    const k = i - (TENTACLES - 1) / 2;
    const bx = k * rx * 0.34;
    const by = ry * 0.4;
    const sway = Math.sin(t * 1.7 + i * 1.15) * rx * 0.2 * (1 - j.land);
    const tipX = bx * splay + drag + sway;
    // The splash throws the tips up as well as out — a streamer flat on the
    // tile is a streamer the landing ring under it has to compete with.
    const tipY = by + len * (1 - j.land * 0.55);
    // The two middle streamers are the thick ones, in the ammunition's own red;
    // the outer pair are fine violet filaments. Two weights rather than five
    // identical strands: an even fringe reads as a hem, and a hem does not
    // move separately from the body it is on.
    const middle = Math.abs(k) < 1.5;
    ctx.strokeStyle = haze(middle ? PALETTE.wispRim : PALETTE.wisp);
    ctx.lineWidth = middle ? ry * 0.075 : ry * 0.05;
    ctx.globalAlpha = middle ? 0.9 : 0.7;
    ctx.beginPath();
    ctx.moveTo(bx, by * 0.4);
    ctx.bezierCurveTo(
      bx + sway * 0.8,
      by + len * 0.34,
      tipX - sway * 0.6,
      by + len * 0.7,
      tipX,
      tipY,
    );
    ctx.stroke();
  }
  ctx.restore();
}
