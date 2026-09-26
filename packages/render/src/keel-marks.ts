import { type KeelState, keelWindowBeats, type World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { into, keelMiddle } from "./keel-pose.js";
import {
  keelFacePath,
  keelRingCentre,
  keelRingRadius,
  keelSegEnd,
  type Point,
  type Seg,
} from "./keel-shape.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE KEEL's marks**: the two things on the spine that say a gesture — the
 * lit joint's ring, which is *tap here, now*, and the socket, which is *fire
 * this colour*. Cut from `keel-draw.ts` the day it was written, along the line
 * its second half will grow on: the grip that answers the ring and the flash
 * that answers the socket both come here.
 */

/**
 * The midpoint hinged apart: each of the middle two shows the face of its cut
 * end, and between them the socket flashes the wave's colour on the beat. The
 * face is the one place the spine is seen from another side.
 */
export function drawKeelSocket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: KeelState,
  segs: Seg[],
  open: number,
  beatPhase: number,
): void {
  const ends: Point[] = [];
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
    ends.push(keelSegEnd(l, g.centre, g.slope, g.pose, end));
  });
  const [a, b] = ends;
  if (a === undefined || b === undefined) return;
  const colour = PALETTE[s.socket];
  const flash = s.phase === "socket" ? 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2) : 0;
  const socket = new Path2D();
  socket.arc((a.x + b.x) / 2, (a.y + b.y) / 2, l.tile * 0.24 * open, 0, Math.PI * 2);
  ctx.fillStyle = rgba(colour, 0.35 + 0.5 * open);
  ctx.fill(socket);
  strokeGlow(ctx, socket, colour, STROKE.inner, 0.6 + 1.2 * flash);
}

/**
 * The ring round the joint at `at`: where it is drawn and the circle a thumb
 * is answered in (`keel-grip.ts`). Moved in off the field's edge by as much as
 * its widest breath and its stroke need, so an end joint's ring is whole.
 */
export function keelRingCircle(l: Layout, at: Point): Circle {
  const r = keelRingRadius(l);
  return { ...keelRingCentre(l, at, r * 1.05 + STROKE.outline), r };
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
  const left = Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, keelWindowBeats(cfg, s)));
  const ring = new Path2D();
  ring.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.35);
  ctx.stroke(ring);
  const arc = new Path2D();
  arc.arc(c.x, c.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, arc, PALETTE.hullRim, STROKE.outline, 1.2);
}
