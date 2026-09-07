import { CHOIR_COLS } from "@neon-spore/sim";
import type { Body } from "./creature-body.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CHOIR as it stands before the pilot's gesture: three dots hung across
 * three lanes in one soap-film membrane, and no colour anywhere on it.
 *
 * **The grey is the creature, not a placeholder.** Every other body on this
 * field says which trigger answers it the moment it is drawn — that is what
 * `livingKindForColor` and the two ammunition colours are for. This one says
 * nothing, because until the dots have drawn together there is no trigger that
 * answers it at all, and a membrane tinted red would be the field promising
 * player 2 a shot that will bounce. `PALETTE.rock` is the game's own word for
 * *nothing you carry reaches this*, and it is already what an indestructible
 * body is drawn in.
 *
 * **The dots drift and the film follows.** Each one wanders a little way
 * inside its own lane on the wall clock, and the membrane is a single closed
 * contour drawn through all three — so the picture at rest is already "three
 * things that are one thing", which is the whole of what the merge then
 * finishes. The drift is deliberately small: a dot that left its column would
 * be a body whose lane the pair cannot read, and the lane is the one thing
 * about this creature that is never in doubt.
 *
 * **Nothing here is drawn after the merge.** The kind changes on the instant
 * (`sim/choir.ts`), so the thing standing there a frame later is an ordinary
 * slick or bulb with an ordinary colour and its own motion, drawn by
 * `drawLiving` like anything else. That is the same arrangement THE CLASP has,
 * and it is why the transformation costs no pixels: what stops being drawn is
 * this file, and what is left was never here.
 *
 * It takes a `Body` rather than loose arguments because it is a row in
 * `creature-body.ts`'s table and a wrapper for one row is a wrapper that has
 * to be kept in step with the record. `MAGNET_LOOK.body` reads its own record
 * the same way. The type comes back from that file, which is a type-only cycle
 * and the arrangement `handles.ts` and `touch.ts` already stand in.
 */

/** How far a dot wanders from its lane's centre, as a share of a tile. Small
 * on purpose — see above: the lane is the one thing never in doubt. */
const DRIFT = 0.16;
/** Seconds one full wander takes. Slow enough to read as breathing rather
 * than as jitter, and prime against the beat so it never locks to it. */
const DRIFT_PERIOD = 3.1;
/** A dot's radius, as a share of a tile. Plainly smaller than any body the
 * pair has a word for: three of these are not three slicks. */
const DOT = 0.19;
/**
 * How far past a dot the film reaches, as a multiple of that radius.
 *
 * **The number that makes this one body rather than three.** The dots stand a
 * tile apart, so the film has to reach more than half a tile from each of them
 * or neighbouring swellings never touch — and the owner has already corrected
 * exactly this once, about a different creature: the parts of one body must
 * overlap into one *mass*, and a connector drawn between separated parts is
 * not enough. At `DOT` above, 3.4 puts each swelling 0.646 of a tile across,
 * which is an overlap of nearly a third of a tile at every join.
 */
const FILM = 3.4;

/** Where one dot of a membrane stands. Exported because two things ask —
 * this file draws them and `choir-prompt.ts` hangs the scan frame over the
 * middle one — and two spellings of a wander is a frame that follows a dot
 * that is not there. */
export function choirDotAt(
  l: Layout,
  x: number,
  y: number,
  i: number,
  time: number,
): { x: number; y: number } {
  // Spread about the body's own centre: `creatureCenter` already places a wide
  // body at the middle of its span, so the three sit at -1, 0 and +1 tiles.
  const lane = x + (i - (CHOIR_COLS - 1) / 2) * l.tile;
  const t = (time / DRIFT_PERIOD + sinHash(i, 7)) * Math.PI * 2;
  return {
    x: lane + Math.sin(t) * l.tile * DRIFT,
    y: y + Math.cos(t * 1.37) * l.tile * DRIFT,
  };
}

/**
 * The whole body: the film, then the three dots inside it.
 *
 * The film is one contour rather than three circles with joins drawn between
 * them. The owner has asked for exactly this once already, about a different
 * creature — the parts of one body must **overlap into one mass**, and a
 * connector drawn between separated parts is not enough — so the reach past
 * each dot (`FILM`) is set wide enough that neighbouring circles genuinely
 * intersect at the default spacing. What the eye gets is a single skin with
 * three swellings in it, and it is the same picture whichever way the dots
 * happen to have wandered.
 */
export function drawChoir({ ctx, l, world, x, y, time, near }: Body): void {
  const haze = (h: string): string => hazed(world.cfg, h, near);
  const dots = [];
  for (let i = 0; i < CHOIR_COLS; i++) dots.push(choirDotAt(l, x, y, i, time));

  // **The film, drawn as a fill under a fill and never as a stroke.** Three
  // overlapping circles in one path fill as their union, which is the mass
  // wanted — but `stroke()` on that same path outlines each circle in full,
  // including the arcs *inside* the union, and what an eye then reads is three
  // rings with a haze behind them rather than one skin with three swellings in
  // it. So the outline is a second union, one line-width larger, filled in the
  // rim colour and covered by the body colour: the only edge left anywhere is
  // the outside of the whole thing.
  const w = Math.max(1.2, l.tile * 0.05);
  ctx.save();
  fillUnion(ctx, dots, l.tile * DOT * FILM + w, haze(PALETTE.rock), 0.5);
  fillUnion(ctx, dots, l.tile * DOT * FILM, haze(PALETTE.rockDark), 0.62);
  ctx.restore();

  // The three voices inside it, each with the light off it that says a thing
  // is there and is not reachable — rock grey, the colour every indestructible
  // body in this game is drawn in. They are drawn *after* the film and as
  // separate circles on purpose: the mass is one body and the dots in it are
  // three, which is the whole picture.
  for (const d of dots) {
    halo(ctx, d.x, d.y, l.tile * DOT * 1.8, haze(PALETTE.rock), 0.24);
    ctx.beginPath();
    ctx.arc(d.x, d.y, l.tile * DOT, 0, Math.PI * 2);
    ctx.fillStyle = haze(PALETTE.rockDark);
    ctx.fill();
    ctx.strokeStyle = haze(PALETTE.rock);
    ctx.lineWidth = w;
    ctx.stroke();
  }
}

/** Circles filled as one shape. Their union, because a path of subpaths fills
 * by the nonzero rule and every one of these winds the same way — which is
 * what a stroke of the same path would not have given. */
function fillUnion(
  ctx: CanvasRenderingContext2D,
  dots: readonly { x: number; y: number }[],
  r: number,
  hex: string,
  alpha: number,
): void {
  ctx.beginPath();
  for (const d of dots) {
    ctx.moveTo(d.x + r, d.y);
    ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.globalAlpha = 1;
}
