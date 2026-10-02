import { FRONT, view } from "@neon-spore/content";
import { type GimbalRing, type GimbalState, gimbalTeeth, INNER, OUTER } from "@neon-spore/sim";
import { gimbalSpinMilli } from "./gimbal-drum.js";
import { gimbalPins, gimbalShell, gimbalYokeRods, HOOP, ROD, SEAM, STEEL } from "./gimbal-rig.js";
import {
  gimbalDrumR,
  gimbalRingFace,
  gimbalRingR,
  gimbalTeethPath,
  type Point,
} from "./gimbal-shape.js";
import { type GimbalTilt, tiltPlane } from "./gimbal-tilt.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawRig, type RigLook } from "./solid-rig.js";
import { showsGimbalInner, showsGimbalOuter } from "./view-role-clocks-c.js";

/**
 * The solid half of THE GIMBAL's drifting candidate (`gimbal-tilt.ts`), in
 * the rig's steel (`gimbal-rig.ts`).
 *
 * **Everything on this cradle but the drum and the pins lies in one plane** —
 * the yoke, both hoops and their teeth — and an orthographic view of a plane
 * is an affine, so those are painted flat through `tiltPlane` and land exactly
 * where the rig would put them. Only the shell and the pins, which are round,
 * go through `drawRig`, and the seam is the ellipse its circle projects to.
 * Drawn as tubes, a hoop alone cost three hundred canvas calls — the whole
 * frame's again.
 *
 * Every seat looks at its own ring from the front, as the shipped picture
 * does: the bearing it is drawn at is already that seat's face
 * (`gimbalRingFace`), so the cradle is never turned round for the navigator.
 *
 * Once the drum has split it is drawn flat again (`gimbal-draw.ts`), because
 * the shell has no leaves to swing; the drift has died to nothing by then
 * (`HUSH.beaten`).
 */

/**
 * No haze: `drawRig` hazes by depth between its nearest and furthest part, so
 * of two pins tipped a degree one is always the far one, and they would swap
 * every time the pitch crossed level.
 */
const LOOK: RigLook = { deep: PALETTE.background, rim: PALETTE.hullRim, haze: 0 };
/** Where the key light stands, as a canvas angle: up and to the left, the house's. */
const KEY = -0.75 * Math.PI;

/** The yoke, the drum while it is shut, and this seat's rings, at `at` with the roll already on `ctx`. */
export function drawTiltedCradle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: GimbalState,
  at: Point,
  open: number,
  time: number,
  t: GimbalTilt,
): void {
  const rings = ([OUTER, INNER] as GimbalRing[]).filter((ring) =>
    ring === OUTER ? showsGimbalOuter(l.role) : showsGimbalInner(l.role),
  );
  if (open === 0) drawShell(ctx, l, at, t);
  ctx.save();
  tiltPlane(ctx, at, t);
  const reach = gimbalRingR(l, OUTER);
  const kx = Math.cos(KEY) * reach;
  const ky = Math.sin(KEY) * reach;
  const lit = ctx.createLinearGradient(at.x + kx, at.y + ky, at.x - kx, at.y - ky);
  lit.addColorStop(0, rgba(STEEL.lift, 0.85));
  lit.addColorStop(0.55, rgba(STEEL.lift, 0.2));
  lit.addColorStop(1, rgba(STEEL.lift, 0.05));
  const yoke = new Path2D();
  for (const [a, b] of gimbalYokeRods()) {
    yoke.moveTo(at.x + a.z * l.tile, at.y + a.y * l.tile);
    yoke.lineTo(at.x + b.z * l.tile, at.y + b.y * l.tile);
  }
  steel(ctx, yoke, 2 * ROD * l.tile, lit);
  for (const ring of rings) {
    const r = gimbalRingR(l, ring);
    const hoop = new Path2D();
    hoop.arc(at.x, at.y, r, 0, Math.PI * 2);
    steel(ctx, hoop, 2 * HOOP * l.tile, lit);
    const face = gimbalRingFace(l, s, ring) + gimbalSpinMilli(open, time);
    const teeth = gimbalTeethPath(l, at, r, face, gimbalTeeth(s), s.marks.length, false);
    ctx.fillStyle = STEEL.base;
    ctx.fill(teeth);
    ctx.fillStyle = lit;
    ctx.fill(teeth);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(LOOK.rim, 0.3);
    ctx.stroke(teeth);
  }
  ctx.restore();
  const pins = rings.flatMap((ring) => gimbalPins(ring, l.tile));
  drawRig(ctx, pins, view(FRONT + t.yaw, t.pitch), at.x, at.y, LOOK);
}

/**
 * The sealed drum: the rig's shell, nodding on its own (`t.drum`), and the
 * near half of its level seam across it. A level circle seen from `FRONT`
 * plus any yaw projects to an ellipse that stays level, as wide as the drum
 * and as tall as the sine of its tip — so face-on it is a line.
 */
function drawShell(ctx: CanvasRenderingContext2D, l: Layout, at: Point, t: GimbalTilt): void {
  const pitch = t.pitch + t.drum;
  drawRig(ctx, [gimbalShell(l.tile)], view(FRONT + t.yaw, pitch), at.x, at.y, LOOK);
  const r = gimbalDrumR(l) * 1.01;
  const sp = Math.sin(pitch);
  const from = sp >= 0 ? 0 : Math.PI;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, r, r * Math.abs(sp), 0, from, from + Math.PI);
  ctx.lineWidth = 0.1 * l.tile;
  ctx.strokeStyle = rgba(SEAM.lift, 0.75);
  ctx.stroke();
}

/** A flat stroke of the rig's steel: the dark metal, then lifted toward the key down its middle. */
function steel(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  width: number,
  lit: CanvasGradient,
): void {
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = STEEL.base;
  ctx.stroke(path);
  ctx.lineWidth = width * 0.55;
  ctx.strokeStyle = lit;
  ctx.stroke(path);
}
