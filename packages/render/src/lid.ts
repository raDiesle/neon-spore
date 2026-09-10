import { LID, lidPath } from "@neon-spore/content";
import { type Color, type Creature, lidOpenMilli, type SimConfig } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { drawEyeFluid, drawEyeFringe, drawEyeLens, type EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { LID_LOOK } from "./lid-look.js";
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
 * **The eye inside it is THE WARDEN's**, and that is the whole of what this
 * file is not: the film, the lens that opens from a slit, the breathing pupil,
 * the lashes and the cilia are all `eye.ts`, shared with the boss, because the
 * owner asked for the two to be one picture. What is left here is the socket
 * they sit in and the armour that slides across it.
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
function lensPalette(color: Color | null): { hex: string; rim: string } {
  if (color === "red") return { hex: PALETTE.red, rim: PALETTE.redRim };
  return { hex: PALETTE.cyan, rim: PALETTE.cyanRim };
}

/**
 * The body. `ctx` is expected to be inside the perspective transform
 * `drawCreatures` puts every body in, so nothing here scales for distance —
 * only the colour is hazed, which is where distance is spent everywhere else.
 *
 * `beats` drives the pupil and `time` everything else that moves, and the split
 * is the one `own-motion.ts` argues: a breath both players have to read at the
 * same instant is on the shared clock, and a wobble nobody reads a number off
 * is on the wall clock.
 */
export function drawLid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beats: number,
  near: number,
): void {
  const open = lidOpenMilli(cfg, c) / 1000;
  const r = l.tile * 0.4;
  const scale = r / Math.max(LID.rx, LID.ry);
  const t = contourClock(c.id, time);
  const flat = lensPalette(c.color);
  const ink: EyeInk = { hex: hazed(cfg, flat.hex, near), rim: hazed(cfg, flat.rim, near) };
  const socket = new Path2D(lidPath(0, 0, LID.rx, LID.ry, LID.droop, LID.wobble, t, LID.seed));
  const line = STROKE.outline / scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // The film first, because it stands *outside* the socket and everything else
  // stands inside it. Unclipped for that reason — a wet edge cut off at the
  // rim would be a rim with a colour on it, which the body already has.
  drawEyeFluid(ctx, 0, 0, LID.rx, LID.ry, open, t);
  ctx.save();
  ctx.clip(socket);
  drawEyeLens(ctx, 0, 0, LID.rx, LID.ry, ink, open, beats);
  // Through the record and not the paint, so a candidate can stand in for the
  // armour for the length of one frame (`docs/versus.md`). `gap` is worked out
  // here and handed over: it is the readout, and `PART_MUL` is the one place
  // that says how far a fully open lid parts.
  LID_LOOK.plates({
    ctx,
    open,
    gap: open * LID.rx * PART_MUL,
    rx: LID.rx,
    ry: LID.ry,
    plate: hazed(cfg, PLATE, near),
    edge: PLATE_RIM,
    light: ink.rim,
    line,
    time,
  });
  ctx.restore();
  // And the fringe outside both, so a lash is never cut off by the socket it
  // grows from.
  drawEyeFringe(ctx, 0, 0, LID.rx, LID.ry, ink, open, t);
  // The socket's own rim, over everything: the one line that is there whether
  // the eye is shut or open, so the silhouette the pair name never changes
  // shape while the picture inside it does.
  strokeGlow(ctx, socket, open > 0 ? ink.rim : hazed(cfg, PLATE_RIM, near), line, 0.5 + open * 0.9);
  ctx.restore();
}
