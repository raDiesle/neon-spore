import {
  FRONT,
  facet,
  type Pin,
  pin,
  type Seen,
  SIDE,
  see,
  type Vec3,
  view,
} from "@neon-spore/content";
import { drawFireball, fireRadius } from "./instar-fire.js";
import { frontLipsAt } from "./instar-head.js";
import { drawEye } from "./instar-head-parts.js";
import { faded, type Look } from "./instar-plate.js";
import { eyePin, type HeadPose, headParts, onSkull, upperAnchor } from "./instar-rig-head.js";
import { SIDE_EYE } from "./instar-side-head.js";
import { drawWeak } from "./instar-weak.js";
import { PALETTE } from "./palette.js";
import { drawRig, type Part, type RigLook } from "./solid-rig.js";

/**
 * **THE INSTAR's rig head, drawn** (`instar-rig-head.ts` is the model): the
 * parts through `drawRig`, and the three things the rig does not shade as
 * marks in its painter's order — the eyes, the nostrils and the fire.
 *
 * **An eye is the shipped eye** (`drawEye`), drawn about its own origin and
 * foreshortened by its pin's `facet`, `yaw - FRONT` round: face-on it is the
 * shipped face-on eye to the pixel, and at the side the near one has swung
 * forward and narrowed while the far one has gone round the back. The view is
 * orthographic with no pitch, so the facet and `see` agree exactly.
 *
 * **The throat is a mark too**: the dark mouth and the fire in it, on a plane
 * across the head behind the lips, so it narrows by the sine of the turn and
 * is gone side-on, where the cheek covers the gape instead.
 */

/** What the rig head reads off a frame: `Look` satisfies it. */
export type RigHeadLook = Pick<Look, "head" | "r" | "time" | "fade" | "fire" | "weak"> & {
  f: Pick<Look["f"], "jawUp" | "jawDown" | "eye" | "wince" | "winceLeft">;
};

const LOOK: RigLook = { deep: PALETTE.background, rim: PALETTE.hullRim, haze: 0.35 };

/** The nostrils on the muzzle's tip, as a pin on its end: across and down, in head radii. */
const NOSTRIL = { x: -0.91, y: -0.1, z: 0.14 } as const;

/** What a rig head is made of: its parts with the jaw's hinge dropped by
 * `drop`, and where its nostrils sit, in head radii. */
export interface RigHeadShape {
  readonly parts: (f: HeadPose, r: number, drop: number) => Part[];
  readonly nostril: Vec3;
}

export const RIG_HEAD: RigHeadShape = { parts: headParts, nostril: NOSTRIL };

/** A mark foreshortened by its pin, `yaw - FRONT` round, drawn about its origin. */
function onPin(
  p: Pin,
  yaw: number,
  paint: (ctx: CanvasRenderingContext2D, alpha: number) => void,
): (ctx: CanvasRenderingContext2D, seen: Seen, alpha: number) => void {
  return (ctx, seen, alpha) => {
    const fc = facet(p, yaw - FRONT);
    if (!fc.near || fc.sx < 0.08) return;
    ctx.save();
    ctx.translate(seen.x, seen.y);
    ctx.scale(fc.sx, fc.sy);
    paint(ctx, alpha);
    ctx.restore();
  };
}

/** The eyes, nostrils and throat, as marks of the rig. */
function marks(look: RigHeadLook, yaw: number, nostrilAt: Vec3): Part[] {
  const { f, r, time, fade } = look;
  const upper = upperAnchor(f, r);
  const out: Part[] = [];
  for (const s of [-1, 1] as const) {
    const e = eyePin(s);
    const at = onSkull(e.lon, e.lat);
    const open = f.eye * (1 - 0.8 * (s === 1 ? f.wince : f.winceLeft));
    const draw = onPin(e.pin, yaw, (ctx) => {
      const eye = drawEye(ctx, { x: 0, y: 0 }, r, s, open, time, fade);
      if (eye) drawWeak(ctx, eye, (look.weak?.eye ?? 0) * fade, "eye");
    });
    out.push({ kind: "mark", c: { x: at.x * r, y: at.y * r, z: at.z * r }, draw, anchor: upper });
    const lon = Math.atan2(s * nostrilAt.z, 0.16);
    const nostril = onPin(pin(lon, 0, 1), yaw, (ctx) => {
      ctx.fillStyle = faded(PALETTE.background, fade);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.05, r * 0.025, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = faded(PALETTE.ember, fade, 0.3 + 0.6 * look.fire);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.025, r * 0.012, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    const n = { x: nostrilAt.x * r, y: nostrilAt.y * r, z: s * nostrilAt.z * r };
    out.push({ kind: "mark", c: n, draw: nostril, anchor: upper });
  }
  const lips = frontLipsAt(f, { x: 0, y: 0 }, r);
  const gap = (lips.down.y - lips.up.y) / r;
  const fire = look.fire * Math.min(1, Math.max(0, (gap - 0.25) / 0.6));
  const throat = onPin(pin(0, 0, 1), yaw, (ctx) => {
    const half = (lips.down.y - lips.up.y) / 2;
    ctx.fillStyle = faded(PALETTE.background, fade, 0.97);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.62, Math.max(1, half), 0, 0, Math.PI * 2);
    ctx.fill();
    if (fire <= 0) return;
    ctx.fillStyle = faded(PALETTE.ember, fade, 0.22 * fire);
    ctx.fill();
    drawFireball(ctx, 0, 0, fireRadius(fire, r, half), time, fade);
  });
  const middle = (lips.up.y + lips.down.y) / 2;
  out.push({ kind: "mark", c: { x: 0.15 * r, y: middle, z: 0 }, draw: throat });
  return out;
}

/**
 * THE INSTAR's rig head at `yaw`, about `look.head`: `FRONT` face-on, `SIDE`
 * in profile. The jaw's hinge drops by the sine of the yaw (`jawAnchor`).
 */
export function drawRigHead(
  ctx: CanvasRenderingContext2D,
  look: RigHeadLook,
  yaw: number,
  shape = RIG_HEAD,
): void {
  const drop = Math.max(0, Math.sin(yaw));
  const parts = [...shape.parts(look.f, look.r, drop), ...marks(look, yaw, shape.nostril)];
  drawRig(ctx, parts, view(yaw), look.head.x, look.head.y, LOOK, look.fade);
}

/**
 * The rig head in profile, where the profile's own head would be: `look.head`
 * is that head's middle rather than the mouth's, so the rig is moved to put
 * its eye on the profile's (`SIDE_EYE`). Side-on the view is `(x, y)`; at any
 * other `yaw` the near eye stays on
 * that point and the head turns about it.
 */
export function drawRigSideHead(
  ctx: CanvasRenderingContext2D,
  look: RigHeadLook,
  yaw = SIDE,
  shape = RIG_HEAD,
): void {
  const { f, r, head } = look;
  const eye = onSkull(eyePin(1).lon, eyePin(1).lat);
  const y = upperAnchor(f, r).at.y + eye.y * r;
  const seen = see({ x: eye.x * r, y, z: eye.z * r }, view(yaw));
  const at = { x: head.x + SIDE_EYE.x * r - seen.x, y: head.y + SIDE_EYE.y * r - seen.y };
  drawRigHead(ctx, { ...look, head: at }, yaw, shape);
}
