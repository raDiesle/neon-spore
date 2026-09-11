import { KEY } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { LidPlates } from "./lid-look.js";

/**
 * BEVEL — a kept look for THE LID's armour, drawn only on the GRAPHICS page's
 * LIBRARY.
 *
 * It stood in `creature:lid` on VERSUS, decided 11 September 2026: IRIS went
 * into the game (`lid-iris.ts`) and the owner said of this one "keep the
 * CREATURE:LID · BEVEL with the graphic of opening like a iron curtain to see
 * something behind for upcoming creatures". It sits in this package, beside
 * the record it once patched, because it is written against this package's
 * internals; nothing on the field imports it, and the game's bundle drops it.
 *
 * BEVEL — the same two sliding plates, given a thickness and a curve.
 *
 * The shipped armour is two flat rectangles of one grey with two lines on
 * each. Nothing about it says the plate is a thing lying on a ball: its face
 * is the same grey at the limb as at the middle, and its inner edge is a line
 * of light with no wall behind it. This keeps the slide — the gap is the
 * readout and it stays exactly where the rule puts it — and spends its whole
 * argument on two things a flat plate cannot have.
 *
 * **A face that curves.** Each plate is shaded across its width, brightest
 * where it stands nearest the viewer over the top of the eye and darker as it
 * wraps toward the limb, and the whole thing takes the key light on top of
 * that — the left plate is the lit one and the right plate the shadowed one,
 * because `KEY` is up and to the left and the two plates face opposite ways.
 *
 * **An edge with a wall.** The inner edge of each plate is a strip the
 * thickness of the armour, and the two strips are lit *oppositely*: the right
 * plate's wall faces the light and is bright, the left plate's wall faces
 * away and is dark. Two edges that differ under one light is the cheapest
 * solid-looking thing there is (`docs/style-guide.md`, Depth). The grooves
 * are kept and cut in — a dark line and a light line side by side — so they
 * read as engraved rather than drawn on. The lit seam in the lens's colour
 * stays, because a shut lid still has to say which trigger to load.
 */

/** The armour's thickness, as a share of the socket's half-width. */
const WALL = 0.085;
/** How much darker the plate is at the limb than over the top of the eye. */
const WRAP = 0.45;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function bevel(d: LidPlates): void {
  const { ctx, open, gap, rx, ry, plate, edge, light, line } = d;
  const w = rx * 2.2;
  const wall = rx * WALL;
  const lit = mixHex(plate, edge, 0.42);
  const dark = mixHex(plate, SHADOW, 0.5);

  for (const side of [-1, 1] as const) {
    const inner = side * gap;
    const x0 = side < 0 ? inner - w : inner;
    // The face: the plate's own grey, lit toward the key and shaded as it
    // wraps toward the limb. Two gradients would be two fills, so the wrap is
    // written along the plate and the key is folded into its two ends —
    // `KEY.x` is negative, so the left plate takes the light.
    const key = 0.5 + 0.5 * -side * KEY.x;
    const near = mixHex(plate, lit, 0.35 * key + 0.15);
    const far = mixHex(plate, dark, WRAP * (1 - 0.4 * key) + 0.1);
    const g = ctx.createLinearGradient(inner, 0, inner + side * rx * 1.25, 0);
    g.addColorStop(0, near);
    g.addColorStop(0.35, mixHex(near, far, 0.35));
    g.addColorStop(1, far);
    ctx.fillStyle = g;
    ctx.fillRect(x0, -ry * 1.2, w, ry * 2.4);

    // A top-to-bottom darkening: the plate curves down to the socket's
    // corners top and bottom as well, and the eye's top takes more light.
    const v = ctx.createLinearGradient(0, -ry, 0, ry);
    v.addColorStop(0, rgba(edge, 0.14));
    v.addColorStop(0.4, rgba(edge, 0));
    v.addColorStop(1, rgba(SHADOW, 0.3));
    ctx.fillStyle = v;
    ctx.fillRect(x0, -ry * 1.2, w, ry * 2.4);

    // The wall at the inner edge: the armour's thickness, lit if it faces
    // the light and dark if it faces away. The right plate's inner wall faces
    // left, toward `KEY`; the left plate's faces right, away from it.
    const faces = side > 0;
    ctx.fillStyle = faces ? mixHex(lit, edge, 0.35) : dark;
    ctx.fillRect(faces ? inner : inner - wall, -ry * 1.2, wall, ry * 2.4);
    // The top of the wall, where the face turns down into it: a hairline of
    // the brighter tone on the face side, the crease that says *edge*.
    ctx.fillStyle = rgba(faces ? edge : SHADOW, 0.55);
    ctx.fillRect(faces ? inner + wall : inner - wall - line * 0.6, -ry * 1.2, line * 0.6, ry * 2.4);

    // The grooves, engraved: a dark cut with a lit lip on its key side.
    for (const f of [0.35, 0.7] as const) {
      const gx = inner + side * rx * f;
      ctx.fillStyle = rgba(SHADOW, 0.55);
      ctx.fillRect(gx - line * 0.4, -ry, line * 0.8, ry * 2);
      ctx.fillStyle = rgba(edge, 0.35 * key + 0.1);
      ctx.fillRect(gx - line * 1.0, -ry, line * 0.5, ry * 2);
    }
  }

  // The two inner edges, lit in the lens's colour whatever the tension — the
  // one thing the shipped plates and this one agree about. Stroked along the
  // wall's inner face, which is where the light from inside would catch.
  const edges = new Path2D();
  for (const side of [-1, 1] as const) {
    edges.moveTo(side * gap, -ry);
    edges.lineTo(side * gap, ry);
  }
  strokeGlow(ctx, edges, light, line * 0.9, 0.8 + open * 0.8);
}
