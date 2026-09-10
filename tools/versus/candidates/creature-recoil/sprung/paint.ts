import { KEY } from "../../../../../packages/content/src/light.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";
import type { CageDraw } from "../../../../../packages/render/src/recoil-look.js";
import { drawHoopArc } from "../../../../../packages/render/src/recoil-ribs.js";

/**
 * SPRUNG — every rib is a coil spring, wound round its own axis, and the
 * coil is drawn with a near side and a far side.
 *
 * The shipped rib is a zigzag: a spring as a diagram of one. This winds it
 * instead — turns of wire round the line from the body to the hoop, each
 * turn drawn as the two halves of a loop seen at a slant: the half nearer
 * the viewer bright and thick over the half behind, thin and dark. That
 * alternation is what makes a drawn coil read as a cylinder of wire rather
 * than a wavy line, and it is the whole of the candidate: the hoop, the
 * gaps and the bolts are the shipped ones (`drawHoopArc`), so the count is
 * read exactly as before. The coil compresses as the hoop breathes in and
 * stretches as it breathes out, because a spring does, and its turns are
 * lit by where they face the key. A spent rib is a coil pulled straight and
 * snapped: fewer turns, stretched, scorched, hanging off its own line.
 */

/** Turns in a whole rib. Four reads as a coil at 26 px; three reads as a
 * zigzag with round corners and five as a hatch. */
const TURNS = 4;
/** The coil's radius across the rib, as a share of the rib's length. */
const COIL = 0.2;
/** How much of a loop's width its slant shows along the axis — the minor
 * axis of the ellipse each turn is drawn as, as a share of the major. */
const SLANT = 0.38;
/** What the far half keeps of the wire's light and width. */
const FAR_FLOOR = 0.35;
const FAR_WIDTH = 0.55;
const SHADOW = "#0B1024";
const SHEEN = "#F4F1EA";

/**
 * One rib as a coil, in the rib's own frame: the axis along `+x` from the
 * body to the hoop, the loops across `y`.
 */
function coil(
  ctx: CanvasRenderingContext2D,
  length: number,
  radius: number,
  turns: number,
  spent: boolean,
  hex: string,
  dark: string,
  glow: number,
  bearing: number,
): void {
  const width = Math.max(0.8, radius * (spent ? 0.3 : 0.42));
  const pitch = length / turns;
  const minor = radius * SLANT;
  // The key seen from the rib's own frame, so a loop's near half is lit by
  // where it faces and not by which way the rib happens to point.
  const kx = KEY.x * Math.cos(-bearing) - KEY.y * Math.sin(-bearing);
  const ky = KEY.x * Math.sin(-bearing) + KEY.y * Math.cos(-bearing);
  for (const near of [false, true]) {
    for (let k = 0; k < turns; k++) {
      const cx = pitch * (k + 0.5);
      // The half of the loop nearer the viewer is the one on the side the
      // axis tilts toward: drawn as the lower half of a slanted ellipse,
      // the far half as the upper, so the loops overlap like a real coil.
      const p = new Path2D();
      if (near) p.ellipse(cx, 0, minor, radius, 0, -Math.PI / 2, Math.PI / 2);
      else p.ellipse(cx, 0, minor, radius, 0, Math.PI / 2, (Math.PI * 3) / 2);
      // Lit by the loop's own crest against the key: the near half faces
      // the viewer and takes the key's own share; the far half faces away.
      const lit = near ? Math.max(0, 0.55 - 0.45 * ky) : FAR_FLOOR;
      const colour = mixHex(mixHex(SHADOW, dark, 0.6), hex, near ? 0.5 + 0.5 * lit : FAR_FLOOR);
      if (near) {
        strokeGlow(ctx, p, colour, width, glow * (0.6 + 0.4 * lit));
        // A thread of light on the crest, shifted toward the key.
        ctx.save();
        ctx.translate(kx * width * 0.2, ky * width * 0.2);
        ctx.strokeStyle = mixHex(colour, SHEEN, 0.35 * lit);
        ctx.lineWidth = Math.max(0.5, width * 0.3);
        ctx.stroke(p);
        ctx.restore();
      } else {
        ctx.strokeStyle = colour;
        ctx.lineWidth = width * FAR_WIDTH;
        ctx.stroke(p);
      }
    }
  }
}

/** The springs, wound; the hoop and its bolts as they ship. */
export function sprung(d: CageDraw): void {
  const { ctx, x, y, inner, hoop, struts, left, metal, burnt, dark, glow } = d;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < struts; i++) {
    const spent = i >= left;
    const a = (i / struts) * Math.PI * 2 - Math.PI / 2;
    const hex = spent ? burnt : metal;
    const lit = spent ? glow * 0.25 : glow;
    // A spent coil is pulled to little more than half its reach and leans
    // off its line, the shipped wreck's own numbers (`ribPath`), so a blown
    // rib hangs where it always hung.
    const reach = spent ? inner + (hoop - inner) * 0.55 : hoop;
    const lean = spent ? 0.25 : 0;
    const length = reach - inner;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + lean);
    ctx.translate(inner, 0);
    ctx.globalAlpha = spent ? 0.7 : 1;
    coil(ctx, length, length * COIL, spent ? 2 : TURNS, spent, hex, dark, lit, a + lean);
    ctx.restore();
    drawHoopArc(ctx, x, y, a, struts, hoop, spent, hex, dark, lit);
  }
  ctx.restore();
}
