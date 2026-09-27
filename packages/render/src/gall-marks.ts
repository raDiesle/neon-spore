import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE GALL's marks**: what says what a step asks — two chevrons closing on
 * the nodule from either side, which is *pinch here*; and the bared root lit,
 * which is *shoot here, in this colour*. The chevrons are the white of the
 * hull's rim, the one light on a growth that is otherwise the hull's own
 * violet gone dull; the root is the only part in a cannon's colour,
 * `stepColour`'s, called rather than copied.
 *
 * **The seam's four points are scars**, drawn whether or not the gall sits on
 * them: a place the pair can count to — *second from the left* — is a place
 * the navigator can send the pilot's eyes to, and finding it is the whole
 * fight (§38). The scar under the gall is hidden by the gall.
 */

/** How strong the pinch mark is on the screen of the seat it is not for. */
const OTHER = 0.35;

/** A scar where point `at` sits on the seam: a short dark crease across it. */
export function drawGallScar(ctx: CanvasRenderingContext2D, l: Layout, x: number, y: number): void {
  const w = 0.16 * l.tile;
  const crease = new Path2D();
  crease.moveTo(x - w, y - w * 0.25);
  crease.quadraticCurveTo(x, y + w * 0.35, x + w, y - w * 0.25);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.gallSeamDark, 0.85);
  ctx.stroke(crease);
}

/**
 * The pinch's mark round the nodule, `rx` pixels to either side of its
 * middle: two chevrons pointing in at it that close the way the fingers do
 * — `pinch` of the way from open to shut. On the screen of the seat whose
 * pinch it is (`full`) they glow and breathe on the beat, with a ring round
 * them closing as the window runs out, `left` of it still to go; on the
 * other screen they are a faint plain line and no ring — *not yours* —
 * which still says where the gall is for the seat that has to say it.
 */
export function drawGallPinch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  rx: number,
  pinch: number,
  left: number,
  full: boolean,
  beatPhase: number,
): void {
  const pulse = 0.7 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  const r = 0.16 * l.tile;
  const reach = rx + (0.55 - 0.4 * pinch) * l.tile;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const side of [-1, 1] as const) {
    const x = side * reach;
    const chevron = new Path2D();
    chevron.moveTo(x + side * r * 0.4, -r);
    chevron.lineTo(x - side * r * 0.6, 0);
    chevron.lineTo(x + side * r * 0.4, r);
    if (full) {
      strokeGlow(ctx, chevron, PALETTE.hullRim, STROKE.outline, pulse, 1);
    } else {
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
      ctx.stroke(chevron);
    }
  }
  if (!full) return;
  const ring = new Path2D();
  ring.arc(0, 0, reach + r * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.inner, 0.6, 1);
}

/**
 * The root in the peeled seam, round its own middle: `size` of `r`, soft
 * and dull while no shot is owed, and lit in the step's colour while one is,
 * `bright` a core's hurt per hit, with a ring closing as the step runs out.
 * Three tendrils go down from it into the hull, so it reads as the growth's
 * root and not as another thing lying on the seam.
 */
export function drawGallRoot(
  ctx: CanvasRenderingContext2D,
  r: number,
  size: number,
  bright: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  if (size <= 0.02) return;
  const R = r * size;
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.9);
  for (const a of [-0.55, 0, 0.55]) {
    const tendril = new Path2D();
    tendril.moveTo(0, 0);
    tendril.quadraticCurveTo(Math.sin(a) * R * 1.6, R * 1.5, Math.sin(a) * R * 1.3, R * 2.8);
    ctx.stroke(tendril);
  }
  const face = new Path2D();
  face.arc(0, 0, R, 0, Math.PI * 2);
  if (lit === null) {
    ctx.fillStyle = PALETTE.gallRoot;
    ctx.fill(face);
    ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.9);
    ctx.stroke(face);
    return;
  }
  const { body, rim } = stepColour(lit.color);
  ctx.fillStyle = rgba(body, bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(face);
  strokeGlow(ctx, face, rim, STROKE.inner, 0.8 + bright);
  const ring = new Path2D();
  ring.arc(0, 0, r * 1.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
