import { type KeelState, keelWindowBeats, type World } from "@neon-spore/sim";
import { arcFromTop } from "./arc-from-top.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { keelMiddle } from "./keel-pose.js";
import { keelFacePath, keelRingRadius, keelSegEnd, type Point, type Seg } from "./keel-shape.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";

/**
 * **THE KEEL's marks**: the two things on the spine that say a gesture — the
 * lit joint's ring, which is *tap here, now*, and the socket, which is *fire
 * this colour*. Cut from `keel-draw.ts` the day it was written, along the line
 * its second half will grow on: the grip that answers the ring and the flash
 * that answers the socket both come here.
 */

/**
 * The midpoint hinged apart: each of the middle two shows the face of its cut
 * end, the one place the spine is seen from another side. The body, not a
 * mark — it opens over the split, before the socket asks for anything — so it
 * returns where the socket is to be drawn, and `drawKeelSocket` draws it once
 * the window is open.
 */
export function drawKeelFaces(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  segs: Seg[],
  open: number,
): Point | null {
  segs.forEach((g, k) => {
    const side = keelMiddle(s, k);
    if (side === 0) return;
    const end = side === -1 ? 1 : -1;
    const face = keelFacePath(l, g.centre, g.slope, g.pose, end, open);
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.9);
    ctx.fill(face);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.8);
    ctx.stroke(face);
  });
  return keelSocketAt(l, s, segs);
}

/**
 * Where the socket stands: halfway between the middle two's cut ends. Drawn
 * there (`drawKeelSocket`) and aimed at there (`boss-cue-read-zd.ts`).
 */
export function keelSocketAt(l: Layout, s: KeelState, segs: readonly Seg[]): Point | null {
  const ends: Point[] = [];
  segs.forEach((g, k) => {
    const side = keelMiddle(s, k);
    if (side !== 0) ends.push(keelSegEnd(l, g.centre, g.slope, g.pose, side === -1 ? 1 : -1));
  });
  const [a, b] = ends;
  if (a === undefined || b === undefined) return null;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * The socket between the cut faces, flashing the wave's colour on the beat —
 * drawn only while the socket's window is open, never faded in over the
 * split (the owner, 27 September 2026: a mark is up only while it can be
 * answered).
 */
export function drawKeelSocket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  at: Point,
  beatPhase: number,
): void {
  const colour = PALETTE[s.socket];
  const flash = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const socket = new Path2D();
  socket.arc(at.x, at.y, l.tile * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = rgba(colour, 0.85);
  ctx.fill(socket);
  strokeGlow(ctx, socket, colour, STROKE.inner, 0.6 + 1.2 * flash);
}

/**
 * The ring round the joint at `at`: where it is drawn and the circle a thumb
 * is answered in (`keel-grip.ts`). It is centred on its plate, and an end
 * plate is kept in off the field's edge far enough that its ring is whole
 * (`keelPlateReach`).
 */
export function keelRingCircle(l: Layout, at: Point): Circle {
  return { x: at.x, y: at.y, r: keelRingRadius(l) };
}

/**
 * The lit joint: a white ring round its plate that breathes on the beat, and
 * the arc of it that is left of the window shrinking to nothing — so the tap
 * it asks for is seen, and so is how long is left to give it.
 */
export function drawKeelRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  cfg: World["cfg"],
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const c = keelRingCircle(l, at);
  const r = c.r * (1 + 0.05 * Math.cos(beatPhase * Math.PI * 2));
  const left = Math.max(
    0,
    1 - phaseInto(s, beat, beatPhase) / Math.max(1, keelWindowBeats(cfg, s)),
  );
  const ring = new Path2D();
  ring.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.35);
  ctx.stroke(ring);
  const arc = new Path2D();
  arcFromTop(arc, c.x, c.y, r, left);
  strokeGlow(ctx, arc, PALETTE.hullRim, STROKE.outline, 1.2);
}
