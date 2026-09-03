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
 *
 * **And they come and go the way the bell does.** A fringe drawn solid under a
 * body full of holes would be the one part of this creature claiming to be
 * entirely present, and an eye goes to the part that is certain — which is
 * exactly the wrong part here. Each strand carries its own hold, on the same
 * two-frequency reading `wisp-static.ts` gives a band, so the whole picture is
 * one signal being received rather than a solid fringe under an unreliable
 * dome.
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
  noise: number,
  haze: (hex: string) => string,
): void {
  // Short when gathered, short when splashed, longest at the two ends of the
  // arc — a streamer is longest exactly when the body is moving hardest.
  const len = ry * (1.5 - j.crouch * 0.85 - j.land * 0.88 + dive * 0.6);
  // Outward when it lands and only then: the splash is the one moment these
  // are not hanging.
  const splay = 1 + j.land * 2.2 + air * 0.25;
  // Swept back against the heading while it is in the air.
  const drag = -heading * rx * 0.55 * (dive * 0.7 + air * 0.35);

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < TENTACLES; i++) {
    const k = i - (TENTACLES - 1) / 2;
    const bx = k * rx * 0.32;
    const by = ry * 0.34;
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
    // This strand's share of the signal. Never quite zero: a streamer that
    // vanished outright would take the fringe's *count* with it, and five is
    // part of what makes the body one word.
    const hold = 0.25 + 0.75 * Math.max(0, Math.min(1, 0.62 + wave(t, i) * 0.5 - noise * 0.5));
    ctx.strokeStyle = haze(middle ? PALETTE.wispRim : PALETTE.wisp);
    ctx.lineWidth = middle ? ry * 0.09 : ry * 0.06;
    ctx.globalAlpha = (middle ? 0.9 : 0.7) * hold;
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

/** One strand's own two-frequency wobble, in −1 to 1. The same shape of answer
 * `wispBands` uses and deliberately not the same numbers: a fringe that faded
 * in step with the band above it would read as one shutter over the whole
 * body, which is a screen effect rather than a body. */
function wave(t: number, i: number): number {
  const k = i * 1.73 + 0.6;
  return Math.sin(t * 2.3 + k) * 0.55 + Math.sin(t * 4.1 + k * 1.9) * 0.45;
}
