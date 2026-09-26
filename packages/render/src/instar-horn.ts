import {
  type Ring,
  type SeenRing,
  SIDE,
  seeTube,
  tubeFrames,
  type View,
  view,
} from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Point } from "./instar-place.js";
import { faded } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawContact, hazeSkin } from "./solid-haze.js";
import { drawTube, rimTube } from "./solid-tube-draw.js";

/**
 * **A horn of THE INSTAR, as a tube of the rig**: a cone of bone grown along
 * a curve from its root in the skull to its point, tapering all the way. It
 * is a tube like the tail (`instar-tail.ts`), so the light runs across its
 * width and the rim catches its lit edge at any angle it is drawn at — what
 * the flat horn's cross-axis gradient only pretended to.
 *
 * **A horn leans in depth.** `lean` is how far toward the player its point
 * stands, in pixels — negative for one swept back into the dark. The lens
 * shrinks what is swept back and swells what comes forward, and a horn going
 * away is hazed toward the field by how far it goes, so the face-on horns
 * read as swept *back* off the brow rather than painted up the screen.
 *
 * **It turns with the skull.** `turn` is the skull's own idle turn, in
 * radians: the horn rotates in depth about its root by it, so as the skull's
 * light slides the horns go with it, and nothing on the head is a still life.
 *
 * Each centre is placed where the curve puts it on the screen — the lens is
 * divided back out — so the horn covers what the flat one covered.
 */

/** Rings along one horn, and where along it the ridges it grew in sit. */
const N = 14;
const RIDGES = [0.22, 0.4, 0.56, 0.7, 0.82] as const;
/** How far off the eye is, in head radii. */
const LENS = 7;
/** What is left of the root's girth at the point. */
const POINT = 0.06;

const BONE = {
  base: PALETTE.rockDark,
  lift: PALETTE.rock,
  sheen: mixHex(PALETTE.rock, "#FFFFFF", 0.5),
};
const W_OF = new Map<number, View>();

export interface Horn {
  readonly base: Point;
  /** The quadratic's control point, the way the horn sweeps. */
  readonly bend: Point;
  readonly tip: Point;
  /** Half the root's girth, in pixels. */
  readonly width: number;
  /** How far toward the player the point stands, in pixels; negative is swept back. */
  readonly lean: number;
}

export function drawHorn(
  ctx: CanvasRenderingContext2D,
  h: Horn,
  r: number,
  fade: number,
  turn = 0,
): void {
  if (fade <= 0) return;
  const lens = r * LENS;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const rings: Ring[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const v = 1 - u;
    const dx = 2 * v * u * (h.bend.x - h.base.x) + u * u * (h.tip.x - h.base.x);
    const dy = 2 * v * u * (h.bend.y - h.base.y) + u * u * (h.tip.y - h.base.y);
    const lean = h.lean * u ** 1.3;
    // Turned about the root with the skull: across the screen and into depth.
    const x = dx * cos - lean * sin;
    const z = dx * sin + lean * cos;
    const s = lens / Math.max(lens * 0.2, lens - z);
    rings.push({ c: { x: x / s, y: dy / s, z }, r: h.width * (1 - (1 - POINT) * u ** 0.9) });
  }
  const seen = seeTube(rings, tubeFrames(rings), lensView(lens));
  // Swept back, the horn goes toward the field; the haze is stepped, so it bakes nothing new.
  const back = Math.max(0, Math.min(1, -h.lean / (r * 1.6)));
  const skin = hazeSkin(BONE, back, PALETTE.background, 0.5);
  ctx.save();
  ctx.translate(h.base.x, h.base.y);
  const hide = drawTube(ctx, seen, skin, fade);
  drawRidges(ctx, hide, seen, r, fade);
  // Where it roots in the skull, so it reads as planted rather than pasted on.
  drawContact(ctx, hide, 0, 0, h.width * 1.6, 0.8 * fade);
  rimTube(ctx, hide, PALETTE.rock, Math.max(1, r * 0.025), fade * (1 - back * 0.6));
  strokeGlow(ctx, hide, faded(PALETTE.rock, fade, 1 - back * 0.5), STROKE.inner, 0.3 * fade);
  ctx.restore();
}

/** The ridges it grew in: a dark groove round it, bowed toward the player, lit just above. */
function drawRidges(
  ctx: CanvasRenderingContext2D,
  hide: Path2D,
  seen: readonly SeenRing[],
  r: number,
  fade: number,
): void {
  ctx.save();
  ctx.clip(hide);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.8, r * 0.018);
  for (const u of RIDGES) {
    const i = Math.round(u * N);
    const c = (seen[i] as SeenRing).c;
    const q = (seen[Math.min(N, i + 1)] as SeenRing).c;
    const o = (seen[Math.max(0, i - 1)] as SeenRing).c;
    const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
    const w = (seen[i] as SeenRing).r;
    const nx = ((q.y - o.y) / len) * w;
    const ny = (-(q.x - o.x) / len) * w;
    // Bowed toward the root, as a ring round a cone is seen from its side.
    const bx = ((o.x - q.x) / len) * w * 0.35;
    const by = ((o.y - q.y) / len) * w * 0.35;
    for (const [hex, a, lift] of [
      [PALETTE.background, 0.55, 0],
      [PALETTE.rock, 0.25, -r * 0.018],
    ] as const) {
      ctx.strokeStyle = faded(hex, fade, a);
      ctx.beginPath();
      ctx.moveTo(c.x + nx, c.y + ny + lift);
      ctx.quadraticCurveTo(c.x + bx, c.y + by + lift, c.x - nx, c.y - ny + lift);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** The side view at the horn's lens, one per head radius the field has been drawn at. */
function lensView(lens: number): View {
  const key = Math.round(lens);
  let w = W_OF.get(key);
  if (!w) {
    if (W_OF.size > 8) W_OF.clear();
    w = view(SIDE, 0, key);
    W_OF.set(key, w);
  }
  return w;
}
