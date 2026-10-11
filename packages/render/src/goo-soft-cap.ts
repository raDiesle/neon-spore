import { KEY } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { bodyPath, centre, type GooBody } from "./goo-body.js";
import { mix } from "./goo-noise.js";
import { SHADE } from "./goo-press.js";
import type { SoftScene } from "./goo-soft.js";
import { rgba } from "./hex.js";

/**
 * **A button standing up to be pressed** — the owner, 11 October 2026: *in
 * default non touched state can we make the button looking that its towards
 * player and has height to press (starting on the inner of borders) so it
 * looks 3d taller when not used yet.* So inside the neon edge a cap stands up
 * off the drop: its face is the drop's own rim drawn smaller — turning and
 * lumped with it — lifted up the screen, with the wall it stands on showing
 * below it, dark at its foot, and the shadow it throws on the drop away from
 * the light. A thumb pushes it down (`Press.depth`) until it is level with the
 * drop and the hollow takes its place; the arrow rides on its face (`liftOf`).
 */

/** How far the face stands up, untouched, in radii; how much of the drop it is; and how
 * many slices its wall is drawn in. */
export const CAP_HEIGHT = 0.22;
const FACE = 0.76;
const SLICES = 8;

/** How far up the cap's face stands in `b`, in pixels, `depth` of a thumb in it: all of
 * it untouched, none once the thumb is half way in. */
export function liftOf(b: GooBody, depth: number): number {
  return b.r * CAP_HEIGHT * (1 - smoothstep(depth * 2));
}

/** The cap's outline `up` pixels off the drop. */
function capPath(s: SoftScene, up: number, grow = 1): Path2D {
  const { b } = s;
  const c = centre(b);
  const r = b.r * FACE * grow;
  const face: GooBody = { ...b, r, at: { x: c.x, y: c.y - up - r * (1 - 1 / (b.squash ?? 1)) } };
  return bodyPath(face, s.style, s.time);
}

/** The cap, clipped to the drop by the caller, as tall as the press leaves it. */
export function paintCap(s: SoftScene): void {
  const { ctx, b, style, t } = s;
  const h = liftOf(b, s.press.depth);
  if (h < 0.3) return;
  const k = (h / (b.r * CAP_HEIGHT)) * t.alpha;
  ctx.save();
  // The shadow it throws on the drop, away from the light.
  ctx.save();
  ctx.translate(-KEY.x * h * 0.7, -KEY.y * h * 0.7);
  ctx.fillStyle = rgba(SHADE, 0.55 * k);
  ctx.fill(capPath(s, 0, 1.06));
  ctx.restore();
  // The wall, from its dark foot up to just under the face, one slice over the next.
  for (let i = 0; i < SLICES; i++) {
    const u = i / SLICES;
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = t.tone(mix(mix(style.deep, style.body, 0.3), style.body, 0.9 * u));
    ctx.fill(capPath(s, h * u));
  }
  // The foot of the wall takes the neon, so the cap is stood on the drop, not floating.
  ctx.globalAlpha = 0.35 * k;
  ctx.strokeStyle = t.neon;
  ctx.lineWidth = b.r * 0.025;
  ctx.stroke(capPath(s, 0));
  // The face: lit from the top left, a crisp catchlight on its edge towards the light and
  // a shade on the edge away from it.
  const top = capPath(s, h);
  const c = centre(b);
  const g = ctx.createRadialGradient(
    c.x + KEY.x * b.r * 0.4,
    c.y - h + KEY.y * b.r * 0.4,
    b.r * 0.05,
    c.x,
    c.y - h,
    b.r * FACE * 1.1,
  );
  g.addColorStop(0, t.tone(mix(style.body, style.core, 0.75)));
  g.addColorStop(1, t.tone(mix(style.body, style.core, 0.3)));
  ctx.globalAlpha = t.alpha;
  ctx.fillStyle = g;
  ctx.fill(top);
  const edge = ctx.createLinearGradient(
    c.x + KEY.x * b.r * FACE,
    c.y - h + KEY.y * b.r * FACE,
    c.x - KEY.x * b.r * FACE,
    c.y - h - KEY.y * b.r * FACE,
  );
  edge.addColorStop(0, rgba(mix(style.core, "#FFFFFF", 0.6), 0.9 * k));
  edge.addColorStop(0.45, rgba(style.core, 0));
  edge.addColorStop(0.6, rgba(SHADE, 0));
  edge.addColorStop(1, rgba(SHADE, 0.6 * k));
  ctx.strokeStyle = edge;
  ctx.lineWidth = b.r * 0.05;
  ctx.stroke(top);
  ctx.restore();
}
