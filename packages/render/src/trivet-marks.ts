import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { seamColour } from "./seam-marks.js";
import { trivetFaceR, trivetHubR, trivetSocketAt, trivetSocketR } from "./trivet-shape.js";

/**
 * **THE TRIVET's marks**: the two things that say what a step asks — the lit
 * sockets on a foot, which are *hold these*, and the lit hub, which is *shoot
 * here, in this colour*. Cut from `trivet-draw.ts` the day it was written,
 * along the line its second half grew on: the flashes `trivet-fx.ts` times
 * are drawn here too, and row 11's ring will be.
 *
 * A step's colour is THE SEAM's (`seamColour`), called rather than copied:
 * its cannon's, or white for a step either answers. The sockets are the one
 * other light on the stand, a cold blue-white that is neither cannon's (§30,
 * *Colour*).
 */

/** The sockets on an outer foot's plate: dull gunmetal, the first `lit` of them lit, a pad held down drawn pressed. */
export function drawTrivetSockets(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  pads: number,
  lit: number,
  down: number,
  beatPhase: number,
): void {
  const r = trivetSocketR(l);
  const pulse = 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2);
  for (let k = 0; k < pads; k++) {
    const at = trivetSocketAt(l, side, k);
    const pressed = (down & (1 << k)) !== 0;
    const socket = new Path2D();
    socket.arc(at.x, at.y, pressed ? r * 0.78 : r, 0, Math.PI * 2);
    if (k >= lit) {
      ctx.fillStyle = rgba(PALETTE.trivetMetalDark, 0.95);
      ctx.fill(socket);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.trivetMetal, 0.9);
      ctx.stroke(socket);
      continue;
    }
    // A lit socket glows on its beat; one held down sits solid and still, the hold seen taking.
    ctx.fillStyle = rgba(PALETTE.trivetSocket, pressed ? 1 : 0.55 * pulse);
    ctx.fill(socket);
    strokeGlow(ctx, socket, PALETTE.trivetSocket, STROKE.inner, pressed ? 1 : pulse, 0.8);
  }
}

/**
 * The hub's face: dark while it is not lit, bare metal catching the light
 * once both feet hold it, and lit in the step's colour while a shot is owed —
 * `size` of its fullest and `bright`, THE VISE's figure per hit, with a ring
 * round it closing as the step's beats run out.
 */
export function drawTrivetFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  hubLit: boolean,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const r = trivetFaceR(l);
  const face = new Path2D();
  face.arc(0, 0, r * size, 0, Math.PI * 2);
  if (lit === null) {
    ctx.fillStyle = rgba(hubLit ? PALETTE.rock : PALETTE.trivetMetalDark, hubLit ? 0.5 : 0.95);
    ctx.fill(face);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(hubLit ? PALETTE.rock : PALETTE.trivetMetal, hubLit ? 0.85 : 0.6);
    ctx.stroke(face);
    return;
  }
  const { body, rim } = seamColour(lit.color);
  ctx.fillStyle = rgba(body, bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(face);
  strokeGlow(ctx, face, rim, STROKE.inner, 0.8 + bright);
  const ring = new Path2D();
  ring.arc(0, 0, r * 1.4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}

/**
 * A hub hit's flash — white over the face, a thin flare the first time and
 * past the face's rim by the third, THE VISE's figure — and the collapse's,
 * pale over the whole hub. Laid in the hub's own frame, over its face.
 */
export function drawTrivetFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: { now: number; hits: number },
  collapse: number,
): void {
  if (flash.now > 0 && flash.hits > 0) {
    const hits = Math.min(3, flash.hits);
    const r = trivetFaceR(l) * (0.4 + 0.45 * hits) * (1.4 - 0.4 * flash.now);
    const p = new Path2D();
    p.arc(0, 0, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
    ctx.fill(p);
    strokeGlow(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
  }
  if (collapse > 0) {
    const p = new Path2D();
    p.arc(0, 0, trivetHubR(l) * (1.3 - 0.3 * collapse), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.trivetSocket, 0.45 * collapse);
    ctx.fill(p);
  }
}
