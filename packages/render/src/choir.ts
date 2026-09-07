import { CHOIR, livingPoints, type Point } from "@neon-spore/content";
import { CHOIR_COLS } from "@neon-spore/sim";
import type { Body } from "./creature-body.js";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE CHOIR as it stands before the pilot's gesture: **three rounded bodies
 * side by side, touching**, and no colour anywhere on them.
 *
 * **It is the cluster the drafts page already had, and that is the correction
 * this file is on its second draft for.** The first version invented a picture
 * — three small dots suspended inside a separate grey membrane — and the owner
 * said plainly what he had expected: *like the Heralds (but 3), rounded shapes
 * next to each other, and when it merges, one shape like a bulb or a slick*.
 * HERALD is `cluster("HERALD", …, { bodies: 2 })` in
 * `tools/shape-sheet/src/drafts/creatures.ts`, and a chorus is that with three.
 * So the voices *are* the bodies here, drawn with the game's own contour walk,
 * rather than markings held inside something else.
 *
 * **The grey is the creature, not a placeholder.** Every other body on this
 * field says which trigger answers it the moment it is drawn — that is what
 * `livingKindForColor` and the two ammunition colours are for. This one says
 * nothing, because until the voices have drawn together there is no trigger
 * that answers it at all, and a body tinted red would be the field promising
 * player 2 a shot that will bounce. `PALETTE.rock` is the game's own word for
 * *nothing you carry reaches this*.
 *
 * **The contour is neither of the two shapes the pair has a word for**, for the
 * same reason the colour is missing: a bulb silhouette would name cyan without
 * a colour being drawn at all. `CHOIR` in `content/silhouettes.ts` is four
 * shallow lobes on a nearly round body — plainly rounded, plainly not a slick
 * and not a bulb.
 *
 * **They breathe out of step**, which is the cluster's own note and the thing
 * that keeps three touching bodies from reading as one lump with dents in it.
 *
 * **Nothing here is drawn after the merge.** The kind changes on the instant
 * (`sim/choir.ts`), so the thing standing there a frame later is an ordinary
 * slick or bulb with an ordinary colour and its own motion, drawn by
 * `drawLiving` like anything else — which is exactly the *one shape like a bulb
 * or a slick* the owner asked the three to become.
 *
 * It takes a `Body` rather than loose arguments because it is a row in
 * `creature-body.ts`'s table and a wrapper for one row is a wrapper that has to
 * be kept in step with the record. The type comes back from that file, which is
 * a type-only cycle and the arrangement `handles.ts` and `touch.ts` stand in.
 */

/**
 * How far apart the three stand, in tiles.
 *
 * **Under one tile on purpose**, and this is the number that makes the arrival
 * one body. The three lanes it hangs across are a tile apart, so voices placed
 * on the lane centres would stand tangent at best and apart at worst — and the
 * owner has already corrected that once, about a different creature: the parts
 * of one body must **overlap into one mass**, and a connector between separated
 * parts is not enough. At 0.8 against a voice radius of 0.46 each one reaches an
 * eighth of a tile into its neighbour, so what an eye gets is one contour with
 * three swellings in it. The body still
 * *occupies* three columns (`CHOIR_COLS`, sim) — what is drawn tighter is the
 * picture, never the lane a shot has to be in.
 */
const APART = 0.8;
/**
 * A voice's radius, as a share of a tile.
 *
 * **Comfortably more than half of `APART`**, which is the whole arithmetic of
 * the thing being one body: at `2 * VOICE <= APART` neighbouring voices are
 * tangent at best and apart at worst, and a first draft of this file shipped
 * exactly that — three separate blobs with gaps between them. At 0.46 against
 * 0.8 the voices overlap by an eighth of a tile — joined at the waist and each
 * still plainly a round of its own, which is what HERALD's cluster looks like
 * at its own `floor`. Deeper than that and the three fuse into one lozenge,
 * which a draft of this file shipped and the owner is not asking for.
 */
const VOICE = 0.46;
/** Seconds one breath takes, and how much of its own radius a voice swells by.
 * Slow and shallow: this body is waiting, not working. */
const BREATH = 2.9;
const SWELL = 0.07;

/**
 * Where one voice of a membrane stands, and how big it is this instant.
 *
 * Exported because two things ask — this file draws them and `choir-prompt.ts`
 * hangs the scan frame over the middle one — and two spellings of a breath is a
 * frame that follows a body that is not there.
 */
export function choirVoiceAt(
  l: Layout,
  x: number,
  y: number,
  i: number,
  time: number,
): { x: number; y: number; r: number } {
  // Spread about the body's own centre: `creatureCenter` already places a wide
  // body at the middle of its span, so the three sit at -1, 0 and +1 steps.
  const step = (i - (CHOIR_COLS - 1) / 2) * l.tile * APART;
  // Out of step with each other by a third of a cycle, which is the cluster's
  // own note: three bodies breathing together is one lump with dents in it.
  const phase = (time / BREATH + i / CHOIR_COLS) * Math.PI * 2;
  return {
    x: x + step,
    y: y + Math.sin(phase * 0.83) * l.tile * 0.03,
    r: l.tile * VOICE * (1 + Math.sin(phase) * SWELL),
  };
}

/**
 * The three voices as one path, at a radius scaled by `grow`.
 *
 * Their **union**, because a path of subpaths fills by the nonzero rule — which
 * is what a *stroke* of the same path would not have given: it would outline
 * each voice in full, including the arcs inside the mass, and an eye would read
 * three bodies with a haze behind them instead of one skin with three
 * swellings in it.
 */
function voicesPath(l: Layout, b: Body, grow: number): Path2D {
  const path = new Path2D();
  for (let i = 0; i < CHOIR_COLS; i++) {
    const v = choirVoiceAt(l, b.x, b.y, i, b.time);
    // The contour wobble is on the wall clock and keyed by the creature's id,
    // the way every living body's is — deterministic on both devices, so two
    // screens shake the same membrane the same way (`contourClock`).
    const t = contourClock(b.c.id + i, b.time);
    const k = (v.r * grow) / Math.max(CHOIR.rx, CHOIR.ry);
    const pts: Point[] = livingPoints(CHOIR, t, 24).map((p) => ({
      x: v.x + p.x * k,
      y: v.y + p.y * k,
    }));
    path.addPath(splinePath(pts, true));
  }
  return path;
}

export function drawChoir(b: Body): void {
  const { ctx, l, world, near } = b;
  const haze = (h: string): string => hazed(world.cfg, h, near);
  const w = Math.max(1.2, l.tile * 0.05);
  // **Lit flesh rather than stone.** `rockDark` alone is what a meteor is
  // filled with, and a first pass at this body used it: three grey lumps that
  // read as a shadow on the field rather than as something alive standing in
  // it. The palette's own word for *unreachable* is still `rock` and stays —
  // it is the rim, the halo and the seams — but the fill is carried a third of
  // the way toward it, so the mass is plainly a body and plainly not a colour.
  const skin = mixHex(PALETTE.rockDark, PALETTE.rock, 0.32);

  // The light the three throw together, under everything: a body that is there
  // and cannot be reached still has to be seen coming.
  for (let i = 0; i < CHOIR_COLS; i++) {
    const v = choirVoiceAt(l, b.x, b.y, i, b.time);
    halo(ctx, v.x, v.y, v.r * 1.7, haze(PALETTE.rock), 0.2);
  }

  // **The outline is a fill under a fill and never a stroke** — see
  // `voicesPath`. The larger union is the rim colour and the smaller one covers
  // it, so the only edge left anywhere is the outside of the whole mass.
  ctx.save();
  ctx.fillStyle = haze(PALETTE.rock);
  ctx.fill(voicesPath(l, b, 1 + w / (l.tile * VOICE)));
  ctx.fillStyle = haze(skin);
  ctx.fill(voicesPath(l, b, 1));

  // And one seam per join, so the mass reads as three voices rather than as a
  // lumpy body. It is the *inside* of each voice's own contour, drawn faintly —
  // the line the union swallowed — which is the least a picture can do to say
  // "three" without cutting the body back into pieces.
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.lineWidth = w * 0.7;
  ctx.stroke(voicesPath(l, b, 1));
  ctx.restore();
}
