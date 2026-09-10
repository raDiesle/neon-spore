import { KEY } from "../../../../../packages/content/src/light.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { LidPlates } from "../../../../../packages/render/src/lid-look.js";

/**
 * ROLL — the plates do not slide out of the way, they roll up. Each one is a
 * sheet whose inner edge is wound into a cylinder, and the cylinder grows as
 * the eye opens because that is where the retracted armour has gone.
 *
 * The shipped plates slide, and a slide is the one motion that says nothing
 * about material: a rectangle moved sideways is the same rectangle. A sheet
 * that rolls says three things at once. Its inner edge is a **cylinder**,
 * which is round and takes the key light like every round thing on the field
 * — bright on the side toward `KEY`, dark on the side away, a highlight a
 * third of the way in. The cylinder **grows with the gap**, so the amount of
 * armour that has come off the lens is visible as a thickness rather than as
 * an absence: shut, two thin beads meet at the middle; open, two fat rolls
 * stand at the corners. And the sheet behind it stays flat and grey with the
 * shipped grooves travelling on it, so what is rolled and what is not are
 * two materials the eye tells apart. The lit seam in the lens's colour is on
 * the roll's inner face, where the light from inside would catch it.
 *
 * The roll's radius is read off `gap` and nothing else, so the readout is
 * still the rule's number twice over — where the roll stands, and how thick
 * it has got.
 */

/** The roll shut, and how much it fattens per unit of gap. Shut, the two
 * beads are a raised seam down the middle of the eye; fully open, each is
 * about a fifth of the socket's half-width. */
const ROLL_MIN = 0.06;
const ROLL_GROW = 0.13;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function roll(d: LidPlates): void {
  const { ctx, open, gap, rx, ry, plate, edge, light, line } = d;
  const rr = rx * (ROLL_MIN + ROLL_GROW * open);
  const w = rx * 2.2;
  const lit = mixHex(plate, edge, 0.5);
  const dark = mixHex(plate, SHADOW, 0.55);

  for (const side of [-1, 1] as const) {
    // The flat sheet, from the far side of the roll out to the limb. The key
    // light falls across it: the left plate is the lit one.
    const flatFrom = side * (gap + rr * 2);
    const key = 0.5 + 0.5 * -side * KEY.x;
    const g = ctx.createLinearGradient(flatFrom, 0, flatFrom + side * rx * 1.2, 0);
    g.addColorStop(0, mixHex(plate, lit, 0.2 * key));
    g.addColorStop(1, mixHex(plate, dark, 0.3 - 0.15 * key));
    ctx.fillStyle = g;
    ctx.fillRect(side < 0 ? flatFrom - w : flatFrom, -ry * 1.2, w, ry * 2.4);

    // The sheet's grooves, travelling with the sheet as the shipped ones do.
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = edge;
    ctx.lineWidth = line * 0.7;
    ctx.beginPath();
    for (const f of [0.35, 0.7] as const) {
      const gx = flatFrom + side * rx * f;
      ctx.moveTo(gx, -ry);
      ctx.lineTo(gx, ry);
    }
    ctx.stroke();
    ctx.restore();

    // The roll: a vertical cylinder standing at the sheet's inner edge. Its
    // light is one gradient across its width, from the side toward the key to
    // the side away — the same for both rolls, because one light.
    const cx = side * (gap + rr);
    const c = ctx.createLinearGradient(cx - rr, 0, cx + rr, 0);
    const bright = mixHex(lit, edge, 0.45);
    // `KEY.x` is negative: the left face of each roll is the lit one.
    c.addColorStop(0, mixHex(plate, bright, 0.55));
    c.addColorStop(0.3, bright);
    c.addColorStop(0.62, plate);
    c.addColorStop(1, dark);
    ctx.fillStyle = c;
    ctx.fillRect(cx - rr, -ry * 1.2, rr * 2, ry * 2.4);
    // Where the sheet turns into the roll: a crease of shadow on the sheet
    // side, which is what says the sheet goes *under* rather than stops.
    ctx.fillStyle = rgba(SHADOW, 0.45);
    ctx.fillRect(side > 0 ? cx + rr : cx - rr - line * 0.8, -ry * 1.2, line * 0.8, ry * 2.4);
    // The wound edge: a hairline down the roll a little off its highlight,
    // the one turn of the sheet the eye can see.
    ctx.strokeStyle = rgba(edge, 0.35);
    ctx.lineWidth = line * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - rr * 0.15, -ry);
    ctx.lineTo(cx - rr * 0.15, ry);
    ctx.stroke();
  }

  // The seam in the lens's colour, on each roll's inner face — lit whatever
  // the tension, so a shut lid still says which trigger to load.
  const edges = new Path2D();
  for (const side of [-1, 1] as const) {
    edges.moveTo(side * gap, -ry);
    edges.lineTo(side * gap, ry);
  }
  strokeGlow(ctx, edges, light, line * 0.9, 0.8 + open * 0.8);
}
