import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { seamColour } from "./seam-marks.js";
import { trivetFaceR, trivetSocketAt, trivetSocketR } from "./trivet-shape.js";

/**
 * **THE TRIVET's marks**: the two things that say what a step asks — the lit
 * sockets on a foot, which are *hold these*, and the lit hub, which is *shoot
 * here, in this colour*. Cut from `trivet-draw.ts` the day it was written,
 * along the line its second half will grow on — the cue words and the ring
 * come here.
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
