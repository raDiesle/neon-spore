import { blobPoints } from "@neon-spore/content";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { paintMass } from "./sinew-flesh.js";
import type { Point } from "./sinew-shape.js";
import { splinePath } from "./spline.js";
import { TOP_CHROME_PX } from "./top-chrome.js";

/**
 * **The crown**: the body THE SINEW's tendon hangs from, over the top of the
 * field and mostly above it — the owner, 2 October 2026: *on the top of the
 * strings there should be some body visible which is attached to them, but it
 * can be cut by the top of the screen.*
 *
 * The same flesh as the mass (`paintMass`), seven-lobed where the mass is
 * five, and three times its size, centred well above the root so only its
 * underside hangs into view. **It is cut along the line the game's own chrome
 * stops at** (`top-chrome.ts`) rather than at the glass's edge: no boss is
 * drawn under the seat switcher (`boss-top.test.ts`, 29 September 2026), so
 * the cut is where the top of the screen begins for a body. The fibres go
 * in at its underside, at the root (`sinew-fibres.ts`), so the tendon is a
 * thing hung between two bodies rather than a rope tied to the sky.
 *
 * It strains with the tendon, the way the mass does: the wall it is lit
 * through warms as the sum climbs, and nothing else about it moves but its
 * wobble and the slide in at the start (`sinew-arrive.ts`).
 */

/** Its half-sizes, in tiles, and how far above the root its centre is. */
const CROWN_RX = 2.6;
const CROWN_RY = 2.5;
const CROWN_UP = 1.9;

export function drawSinewCrown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  root: Point,
  strain: number,
  time: number,
): void {
  const rx = CROWN_RX * l.tile;
  const ry = CROWN_RY * l.tile;
  const c = { x: root.x, y: root.y - CROWN_UP * l.tile };
  const body = splinePath(blobPoints(c.x, c.y, rx, ry, 7, 0.1, 0.04, time * 0.25 + 1.7, 34), true);
  const hex = mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.25);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, TOP_CHROME_PX, l.width, l.height);
  ctx.clip();
  paintMass(
    ctx,
    body,
    { x: c.x, y: c.y, rx, ry, tile: l.tile },
    hex,
    PALETTE.hullRim,
    strain,
    time,
  );
  // The cut edge, lit: a body sliced by the top of the screen, not a lid.
  const top = c.y - ry;
  if (top < TOP_CHROME_PX) {
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.globalAlpha *= 0.35;
    ctx.lineWidth = Math.max(1, l.tile * 0.03);
    ctx.clip(body);
    ctx.beginPath();
    ctx.moveTo(0, TOP_CHROME_PX + 0.5);
    ctx.lineTo(l.width, TOP_CHROME_PX + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}
