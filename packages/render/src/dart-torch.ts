import { type Creature, dartHeading } from "@neon-spore/sim";
import { dartHex, dartThrust } from "./dart.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * WHAT A DART'S THRUST IS DRAWN AS, in a file of its own beside `dart-look.ts`.
 *
 * The record is next door and this is what it points at. It arrived as
 * `creature:dart` / `torch` on VERSUS and the owner took it into the game on
 * 8 September 2026; the plume it replaced is on the SHAPES tab's TAIL axis as
 * PLUME (`tools/director/src/tails/plume.ts`), which is where a mark a body
 * leaves behind it belongs now that there is somewhere to put one.
 *
 * A file of its own rather than more of `dart.ts`, for that file's own reason:
 * it holds the lean, the flip, the heat and the navigator's arrow, and none of
 * those is a layer of the exhaust.
 */

/** Half-width where the flame leaves the body, as a share of the body radius.
 * Narrow: a nozzle is the one part of an exhaust that is not wide. */
const ROOT = 0.16;
/** Half-width at the belly, a third of the way back — where a plume that is
 * expanding into vacuum actually is widest. */
const BELLY = 0.46;
/** Half-width at the far end. Wider than the belly is a cone that never
 * closes; this is the fray, and it is where the gradient has run out anyway. */
const FRAY = 0.54;
/** How far behind the tail the belly sits, as a share of the plume's reach. */
const BELLY_AT = 0.34;
/** The soft envelope around the flame, and the hot core inside it, both as
 * multiples of the flame's own width. Three passes and not one: a flame is a
 * bright narrow thing inside a dim wide one, and drawing only the middle of
 * that leaves a cloud with a direction nobody can read. */
const HAZE = 1.7;
const CORE = 0.42;
/** Flicker, in radians per beat and as a share of the reach. A flame that held
 * exactly still for the length of a beat is a cone with a light in it. */
const FLICKER_RATE = 37;
const FLICKER = 0.07;

/**
 * The thrust, as a flame rather than as a spike.
 *
 * The shipped plume is a filled triangle with its base against the body and
 * its apex a tile away, which is the profile of a *beam*: hard-edged, widest
 * where it starts and coming to a point in the dark. This one is turned round.
 * It leaves the tail narrow, opens into a belly a third of the way back and
 * frays out at the end, and its far half is not a shape at all but a gradient
 * running to nothing — so what ends the flame is the flame running out rather
 * than an outline closing.
 *
 * The reach, the direction and the heat are the shipped ones and deliberately
 * so. `dartThrust` is the creature's own clock (`dart.ts`), the diagonal is
 * the unit vector the sim's own `DART_COLS`/`DART_ROWS` describe, and a
 * candidate that changed either would be arguing about the rule under the
 * cover of arguing about the picture.
 */
export function torchJet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  beatPhase: number,
): void {
  const heat = dartThrust(c, beatPhase);
  if (heat <= 0.01) return;
  const dir = dartHeading(c);
  const r = l.tile * 0.4;
  const hex = dartHex(c);
  // Back up the diagonal the body is running down. The travel spends one
  // column per row, so the exhaust is the unit diagonal — a direction, not a
  // distance, which is why it is written out rather than read off the two
  // constants that say how far a run goes.
  const bx = -dir * Math.SQRT1_2;
  const by = -Math.SQRT1_2;
  const px = -by;
  const py = bx;
  // Its own length, on the shipped curve, breathing a few per cent on a clock
  // of the body's own so two darts on one field never flicker together.
  const flick = 1 + FLICKER * Math.sin(beatPhase * FLICKER_RATE + c.id);
  const reach = r * (0.9 + 2.1 * heat) * flick;

  const at = (along: number, across: number): [number, number] => [
    x + bx * along + px * across,
    y + by * along + py * across,
  ];

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The envelope first and the core over it: a flame is a bright thing inside
  // a dim one, and the order is what makes the edge soft instead of drawn.
  plume(ctx, at, reach, r * HAZE, hex, heat * 0.28, true);
  plume(ctx, at, reach, r, hex, heat * 0.8, false);
  plume(ctx, at, reach, r * CORE, hex, heat * 0.9, false);
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // The root, right at the tail and near-white — the hottest part of a flame
  // is where it leaves the thing it is pushing. Tight rather than spread, so
  // it reads as a nozzle and not as the head of a comet.
  const [rx, ry] = at(r * 0.22, 0);
  halo(ctx, rx, ry, r * 0.3 * heat, PALETTE.sparkDim, heat * 0.95);
}

/**
 * One pass of the flame: an outline down one side, round the fray and back up
 * the other, filled with a gradient along its own axis.
 *
 * `wide` is the width scale, so the envelope is this same shape blown up and
 * dimmed rather than a second drawing that could drift away from it.
 */
function plume(
  ctx: CanvasRenderingContext2D,
  at: (along: number, across: number) => [number, number],
  reach: number,
  wide: number,
  hex: string,
  alpha: number,
  soft: boolean,
): void {
  const root = wide * ROOT;
  const belly = wide * BELLY;
  const fray = wide * FRAY;
  const grad = ctx.createLinearGradient(...at(0, 0), ...at(reach, 0));
  // White at the nozzle, the body's own colour through the belly, nothing at
  // the end. The near-white is the one place a second colour is allowed on a
  // creature: it is the same light `sparkDim` puts at the root of every other
  // glow in the field, and it is gone within a fifth of the plume.
  grad.addColorStop(0, rgba(soft ? hex : PALETTE.sparkDim, alpha * 0.95));
  grad.addColorStop(0.18, rgba(hex, alpha * 0.85));
  grad.addColorStop(0.55, rgba(hex, alpha * 0.4));
  grad.addColorStop(1, rgba(hex, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(...at(0, root));
  ctx.bezierCurveTo(...at(reach * BELLY_AT, belly), ...at(reach * 0.72, fray), ...at(reach, fray));
  ctx.quadraticCurveTo(...at(reach * 1.14, 0), ...at(reach, -fray));
  ctx.bezierCurveTo(...at(reach * 0.72, -fray), ...at(reach * BELLY_AT, -belly), ...at(0, -root));
  ctx.quadraticCurveTo(...at(-reach * 0.1, 0), ...at(0, root));
  ctx.closePath();
  ctx.fill();
}
