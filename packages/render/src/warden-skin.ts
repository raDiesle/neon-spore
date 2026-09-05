import type { WardenOpening } from "@neon-spore/content";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE WARDEN's skin: the eyelets in its material, and the two helpers the rest
 * of the surface is drawn with.
 *
 * **CILIATE, from the shapes page.** The owner pointed at the combinations
 * already drawn there rather than at a new invention, and that sheet has this
 * one built and named: *cilia most of the way round + veins under the skin*
 * (`tools/shape-sheet/src/grown-bodies.ts`), with the note *the outline is a
 * haze, and what is legible is inside it* — which is the exact bargain this
 * boss wants, because the one thing that has to stay legible on it is the hole
 * in its middle. So the parts are that combination's, in this game's own
 * vocabulary (`tools/shape-sheet/src/parts/`): CILIA off the rim and VEIN under
 * the skin, with the eyelets and the film as what makes it a *thing looking at
 * you* rather than a specimen.
 *
 * Its own file, beside the body (`warden.ts`) and the door (`warden-eye.ts`),
 * because the three answer three different questions. The body is a *shape* —
 * two contours cut against each other, and where the hole is. The door is a
 * *hand* — one number, the rope's tension, drawn with nothing eased. This is
 * neither: it is the surface, it answers only the wall clock, and nothing a
 * player has to read is carried on it. The owner asked for a boss that looks
 * living, slimy and alien, with a lot of tiny eyes opening and closing.
 *
 * **Nothing here is the cycle's colour, and that is the rule this file is built
 * around.** The lip of the hole says which trigger the one shot needs, a whole
 * cycle before there is anything to shoot at, and it is the *only* part of the
 * body that says it. Everything below is neon green — `PALETTE.eyeFluid`, the
 * same colour and the same argument as the film round the main eye (`eye.ts`):
 * this surface is spent on saying *alive*, not on saying which trigger to load
 * a second time. Brightness lifts as the gate opens, because nobody reads a
 * number off brightness; nothing here changes *shape* with the pull, for the
 * reason the film does not either.
 *
 * **What it costs.** Forty hairs are one `Path2D` and one `strokeGlow`; every
 * eyelet that is open is in a second path with its pupils in a third, so the
 * whole scatter is two fills and one glow whatever it is doing; the sheen is
 * one clip and two ellipses. Flat, per frame, whatever the openness — the
 * bargain `eye.ts` already makes, kept here so a boss that is one body on an
 * empty field stays one body's worth of work.
 */

/**
 * Whether an angle from the body's centre falls inside the way in underneath.
 *
 * The same span `warden.ts`'s `clear` steps its plates over, asked one angle at
 * a time: nothing grows across the shot lane, because the player reads the
 * silhouette and a comb of hair over the slot closes it as surely as a bar
 * would.
 */
export function inOpening(a: number, cut: WardenOpening | null): boolean {
  if (cut === null) return false;
  for (const wrap of [-Math.PI * 2, 0, Math.PI * 2]) {
    if (a >= cut.from + wrap && a <= cut.to + wrap) return true;
  }
  return false;
}

/** Where a point stands, seen from the body's centre, in 0..2π. */
export function turn(x: number, y: number, cx: number, cy: number): number {
  const a = Math.atan2(y - cy, x - cx);
  return a < 0 ? a + Math.PI * 2 : a;
}

/**
 * How many eyelets are scattered over the material, and how wide one is as a
 * fraction of the body's radius.
 *
 * **More and smaller than the first draft**, which put sixteen at 0.078 and
 * produced green leaves rather than eyes: at that size the lid is a shape you
 * read as a shape, and what the owner asked for was *a lot of tiny eyes*. The
 * count carries the crawling and the size carries the tiny, and both matter —
 * six large ones is a pattern, twenty-four small ones is a surface.
 */
const EYELETS = 24;
const EYELET_W = 0.055;
/** The golden angle: no two eyelets share a spoke, so the ring of them never
 * reads as a dial with marks on it. */
const SPIRAL = 2.39996;

/**
 * The tiny eyes in the body's material, opening and closing out of step.
 *
 * **The one thing on this boss that is not doing a job.** Every other mark on
 * it is a readout — the lip is the colour, the hatch is the tension, the gaps
 * in the plates are how far in the pair is. These say only that the thing is
 * awake, and that it has been watching for longer than the pair has been here.
 *
 * Each blinks on its own period, and the periods are chosen not to share one: a
 * scatter of lids that came open together would be a second beat beside the one
 * the pair is already counting. Where they sit follows from the index alone, so
 * an eyelet is in the same place on both phones and after a restart without a
 * single draw from the rng — and none of them stands over the hole or over the
 * way in.
 */
export function drawWardenEyelets(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  pupilX: number,
  pupilR: number,
  time: number,
  openness: number,
  cut: WardenOpening | null,
): void {
  const lids = new Path2D();
  const pupils = new Path2D();
  const w = r * EYELET_W;
  for (let k = 0; k < EYELETS; k++) {
    const a = k * SPIRAL;
    // Spread through the annulus by the same index, so the scatter fills the
    // material rather than standing in one ring inside it. Nothing reaches
    // past 0.90 of the radius, which is where the plates run, and nothing
    // starts inside 0.62, which is as wide as the hole ever opens.
    const rad = r * (0.63 + 0.27 * ((k * 0.618034) % 1));
    const ex = cx + Math.cos(a) * rad;
    const ey = cy + Math.sin(a) * rad;
    if (inOpening(turn(ex, ey, cx, cy), cut)) continue;
    // Five periods that do not divide each other, staggered by the index, so
    // the set is always part open and never the whole of it at once.
    let open = Math.max(0, Math.sin(time * (0.47 + (k % 5) * 0.13) + k * 1.71)) ** 0.7;
    // **An eyelet the hole is coming for shuts rather than vanishing.** It has
    // to go — an eye drawn on material that is not there is a hole that has
    // stopped reading as one — and a hard cull made a dozen of them blink out
    // together every time the gate opened, which is a rendering artefact and
    // not a creature. Faded over its own width instead, the picture says
    // something true and better: the pupil widens, and the little eyes it
    // reaches close in front of it.
    const clear = (Math.hypot(ex - pupilX, ey - cy) - pupilR) / (w * 3);
    open *= Math.max(0, Math.min(1, clear));
    if (open < 0.05) continue;
    const h = w * 0.92 * open;
    // Lying along the ring: an eyelet turned to face out of the body reads as
    // a scratch, and one turned with the rim reads as a lid.
    const ux = Math.cos(a + Math.PI / 2);
    const uy = Math.sin(a + Math.PI / 2);
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    lids.moveTo(ex - ux * w, ey - uy * w);
    lids.quadraticCurveTo(ex - nx * h * 2, ey - ny * h * 2, ex + ux * w, ey + uy * w);
    lids.quadraticCurveTo(ex + nx * h * 2, ey + ny * h * 2, ex - ux * w, ey - uy * w);
    // The pupil is what makes a lid an *eye*, so it comes in early and takes
    // most of the gap: a green almond with nothing in it is a leaf.
    if (open < 0.3) continue;
    const pr = h * 0.55;
    pupils.moveTo(ex + pr, ey);
    pupils.arc(ex, ey, pr, 0, Math.PI * 2);
  }
  ctx.save();
  // Dim in the middle and bright at the edge: a lid filled solid is a bead of
  // paint, and what says *eye* is the rim round a dark centre.
  ctx.fillStyle = PALETTE.eyeFluid;
  ctx.globalAlpha = 0.2 + openness * 0.18;
  ctx.fill(lids);
  ctx.fillStyle = PALETTE.background;
  ctx.globalAlpha = 0.9;
  ctx.fill(pupils);
  // A plain stroke and not a `strokeGlow`, which is the one place on this body
  // the bloom is left off on purpose as well as to save three passes: a lid
  // seven pixels across wearing a five-pixel spread is not a lid with a light
  // in it, it is a green smudge, and sixteen of them are sixteen.
  ctx.strokeStyle = PALETTE.eyeFluidRim;
  ctx.lineWidth = STROKE.inner * 0.7;
  ctx.globalAlpha = 0.7 + openness * 0.3;
  ctx.stroke(lids);
  ctx.restore();
}
