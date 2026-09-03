import { LID, lidPath } from "@neon-spore/content";
import { type Color, type Creature, lidOpenMilli, type SimConfig } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { PLATE, PLATE_RIM } from "./shell-plate.js";

/**
 * THE LID, drawn — an armoured eye with two plates across it, parting from the
 * middle outwards by exactly as much as somebody is pulling on its cord.
 *
 * **It is not a blob and it is not drawn by `drawLiving`.** `lidOutline` in
 * content is two arcs meeting at a corner either side, which no radial contour
 * can describe (`lid-shape.ts` says why), so this file is routed to from
 * `drawCreatures` the way `ghost.ts` and `meteor.ts` are — a body with its own
 * draw path and `null` in `living-look.ts`.
 *
 * **Both screens draw all of it**, and that is the creature rather than an
 * omission: nothing about a lid is withheld from either seat, so there is no
 * `showsLidBody` gate here the way there is for a ghost or a veil. What the
 * pair cannot see is each other's thumbs, and the gap between the plates is the
 * whole of what says where the other one's is — which is why it comes off the
 * world every frame with no easing anywhere between the rule and the picture
 * (`lidOpenMilli`).
 *
 * **The armour is the same dead material a shell wears.** `PLATE` and
 * `PLATE_RIM` are imported from `shell-plate.ts` rather than picked again here:
 * a pair who have learned that hard grey over a body means *not yet* should not
 * have to learn it twice in two greys.
 *
 * Nothing here is cached across a frame. `Creature.lidPullMilli` already
 * answers "how far open, right now" every tick on both devices.
 */

/**
 * How wide the plates part at full tension, as a share of the body's own
 * half-width. Past one on purpose: at exactly one the plate edges sit on the
 * corners and the lens is a slot, and "fully open" has to look like the armour
 * is clear of it rather than like the light is getting out.
 */
const PART_MUL = 1.1;

/**
 * The lens's own colours. A lid with no colour cannot be authored
 * (`authorsColor`), and is drawn cyan for `ghostPalette`'s reason: the picture
 * must not depend on a case nothing can produce.
 */
function lensPalette(color: Color | null): { hex: string; rim: string; dark: string } {
  if (color === "red") return { hex: PALETTE.red, rim: PALETTE.redRim, dark: PALETTE.redDark };
  return { hex: PALETTE.cyan, rim: PALETTE.cyanRim, dark: PALETTE.cyanDark };
}

/**
 * The body. `ctx` is expected to be inside the perspective transform
 * `drawCreatures` puts every body in, so nothing here scales for distance —
 * only the colour is hazed, which is where distance is spent everywhere else.
 */
export function drawLid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
): void {
  const open = lidOpenMilli(cfg, c) / 1000;
  const r = l.tile * 0.4;
  const scale = r / Math.max(LID.rx, LID.ry);
  const t = contourClock(c.id, time);
  const { hex, rim, dark } = lensPalette(c.color);
  const haze = (h: string): string => hazed(cfg, h, near);
  const body = new Path2D(lidPath(0, 0, LID.rx, LID.ry, LID.droop, LID.wobble, t, LID.seed));
  const line = STROKE.outline / scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  drawLens(ctx, body, haze(hex), haze(dark), open);
  drawPlates(ctx, body, open, haze(PLATE), haze(rim), line);
  drawLashes(ctx, t, open, haze(open > 0 ? rim : PLATE_RIM), line);
  // The socket's own rim, over everything: the one line that is there whether
  // the eye is shut or open, so the silhouette the pair name never changes
  // shape while the picture inside it does.
  strokeGlow(ctx, body, haze(open > 0 ? rim : PLATE_RIM), line, 0.5 + open * 0.9);
  ctx.restore();

  // The light an open lens throws into the space around it — the part that
  // grows with the pull, and the only thing about this body legible from the
  // corner of an eye three columns away.
  if (open > 0) halo(ctx, x, y, r * (1.2 + open), haze(hex), 0.06 + open * 0.18);
}

/**
 * The lens behind the plates: dark at the rim with the colour welling out of
 * the middle, an iris ring around it and a slit down its centre.
 *
 * Drawn whole and always, with the plates laid over the top afterwards, so
 * there is exactly one copy of what the eye looks like and the plates only ever
 * decide how much of it is showing. It brightens as the eye opens — an iris
 * meeting the light — which is a second reading of the pull beside the gap.
 */
function drawLens(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  hex: string,
  dark: string,
  open: number,
): void {
  ctx.save();
  ctx.clip(body);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, LID.rx);
  glow.addColorStop(0, hex);
  glow.addColorStop(0.4, dark);
  glow.addColorStop(1, PALETTE.background);
  ctx.fillStyle = glow;
  ctx.fill(body);

  const iris = LID.ry * (0.62 + open * 0.14);
  ctx.globalAlpha = 0.35 + open * 0.5;
  ctx.strokeStyle = hex;
  ctx.lineWidth = LID.ry * 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, iris, 0, Math.PI * 2);
  ctx.stroke();

  // The pupil: a slit rather than a disc, because a round one at this size is
  // a dot and a slit is a direction — it is what makes the body read as
  // *looking* at the ship rather than as a lamp behind a shutter.
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.ellipse(0, 0, iris * 0.22, iris * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The two plates, and the gap between them.
 *
 * Rectangles clipped to the eye's own outline rather than shapes cut to it:
 * the plates *slide*, so their inner edges have to be straight and their outer
 * ones have to be the socket's, and a clip gives both from one path. A plate
 * cut to the contour would have to be re-cut on every frame the body breathes
 * on, and would still be a second copy of where the socket is.
 *
 * The inner edges are lit in the lens's colour whatever the tension, so a shut
 * lid still tells the pair which trigger to load — that seam is the whole of
 * why the armour here buys timing rather than surprise (`lid.ts` in sim).
 */
function drawPlates(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  open: number,
  plate: string,
  light: string,
  line: number,
): void {
  const gap = open * LID.rx * PART_MUL;
  const w = LID.rx * 2.2;
  ctx.save();
  ctx.clip(body);
  for (const side of [-1, 1] as const) {
    const inner = side * gap;
    ctx.fillStyle = plate;
    ctx.fillRect(side < 0 ? inner - w : inner, -LID.ry * 1.2, w, LID.ry * 2.4);
    // Two grooves per plate, at fixed fractions of its own width, so they
    // travel with the plate and say it is a thing that moved rather than a
    // shape that shrank.
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = PLATE_RIM;
    ctx.lineWidth = line * 0.7;
    for (const f of [0.35, 0.7] as const) {
      const gx = inner + side * LID.rx * f;
      ctx.beginPath();
      ctx.moveTo(gx, -LID.ry);
      ctx.lineTo(gx, LID.ry);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // The two inner edges, lit. Inside the same clip, so the light stops at the
  // socket rather than running off the ends of a rectangle.
  for (const side of [-1, 1] as const) {
    const edge = new Path2D();
    edge.moveTo(side * gap, -LID.ry);
    edge.lineTo(side * gap, LID.ry);
    strokeGlow(ctx, edge, light, line * 0.9, 0.8 + open * 0.8);
  }
  ctx.restore();
}

/**
 * The fringe standing off the rim. Not part of the contour — `lid-shape.ts`
 * says why — and drawn inside the body's own transform so it grows with it
 * down the field.
 *
 * It is the one part of the picture that moves on the wall clock rather than
 * on the pull: something alive under the armour, so a shut lid is a body and
 * not a plate with a shape. The filaments brighten and reach further as the
 * eye opens, which is a third reading of the same number.
 */
function drawLashes(
  ctx: CanvasRenderingContext2D,
  t: number,
  open: number,
  hex: string,
  line: number,
): void {
  const path = new Path2D();
  for (let i = 0; i < LID.lashes; i++) {
    const s = (i + 0.5) / LID.lashes;
    const up = i % 2 === 0;
    const x = -LID.rx * 0.86 + LID.rx * 1.72 * s;
    const y = (up ? -LID.ry : LID.ry * LID.droop) * Math.sin(Math.PI * s);
    const flick = Math.sin(t * 1.7 + i * 1.9) * 0.18;
    const reach = LID.ry * (0.3 + open * 0.25);
    path.moveTo(x, y);
    path.lineTo(x + reach * flick, y + (up ? -reach : reach));
  }
  strokeGlow(ctx, path, hex, line * 0.8, 0.4 + open * 0.6);
}
