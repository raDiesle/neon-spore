import {
  blobRadiusMul,
  type CreatureSilhouette,
  openSmoothPath,
  type Point,
} from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * One plate of THE SHELL's armour, as geometry. No world, no creature and no
 * layout — the pass that finds the bodies and puts this at the right place on
 * the field is `shell-draw.ts` next door, the same seam `shell.ts` and
 * `shell-round.ts` are split along in the simulation.
 *
 * Everything here is in the *worn body's* own local units — the `rx`/`ry` of
 * the slick or the bulb inside the plating — so a plate traces the creature's
 * own lobes rather than being a circle pasted over them, and a Shell-Slick and
 * a Shell-Bulb get armour cut to their own two different shapes from one file.
 */

/**
 * How far outside the body's own contour the plating stands, as a multiple of
 * the radius at that angle. Small on purpose: at the couple of dozen pixels a
 * body draws at on a phone this is three or four pixels of margin, which is
 * enough to read as *worn* and not enough to change which silhouette the pair
 * name. Anything larger and a Shell-Bulb stops looking like a bulb.
 */
const ARMOUR_MUL = 1.17;

/** Dead, non-living material. Opaque, because the plate has to hide the half
 * of the body behind it — a translucent one would show the whole creature and
 * say nothing.
 *
 * Darker than `PALETTE.rockDark`, which a rock is filled with, and the
 * difference is the splits: light coming out of a crack only reads as light
 * if what surrounds it is darker than it is, and at `rockDark` the cyan came
 * out looking like a scratch on the plate rather than something behind it. */
export const PLATE = "#23222C";
/** The plate's lit outer edge. Hard and bright where the body's own outline
 * is soft and coloured; that contrast is most of what says "armour". */
export const PLATE_RIM = PALETTE.rock;

/** Points sampled along one plate's arc. Coarse on purpose — the body draws
 * at a couple of dozen pixels on a phone, and a hard edge reads from far
 * fewer points than a soft one needs. */
const ARC_POINTS = 14;
/** Points along the split down the middle, and along each crack. */
const SPLIT_POINTS = 7;

/**
 * The angular span (`cos(a)`'s sign) each piece owns — a vertical line through
 * the body's own centre, which is where the two columns actually divide it
 * (`shell.ts`: "every column of the body has exactly one piece in front of
 * it"). Exact for `SHELL_COLS === 2` only; a third piece would need an x-based
 * split rather than an angle-based one, and nothing here claims to generalise
 * past two columns.
 *
 * Both spans start and end on the vertical diameter, so the two plates share
 * their whole straight edge and tile exactly.
 */
function pieceAngleSpan(piece: number): { from: number; to: number } {
  return piece === 0
    ? { from: Math.PI / 2, to: (Math.PI * 3) / 2 }
    : { from: -Math.PI / 2, to: Math.PI / 2 };
}

/** The contour at one angle — the same `blobRadiusMul` call `blobPath` makes
 * for the body underneath, scaled by `mul`. At `ARMOUR_MUL` it is the
 * plating's outer edge; at 1 it is the body's own outline, which is what a
 * bared half has to be rimmed along. */
function contourAt(s: CreatureSilhouette, a: number, t: number, mul: number): Point {
  const m = blobRadiusMul(a, s.lobes, s.depth, s.wobble, t, s.seed) * mul;
  return { x: Math.cos(a) * s.rx * m, y: Math.sin(a) * s.ry * m };
}

/** The plating's outer edge at one angle. */
function armourAt(s: CreatureSilhouette, a: number, t: number): Point {
  return contourAt(s, a, t, ARMOUR_MUL);
}

/** One piece's span of a contour, as points, ready for `openSmoothPath`. */
function arcPoints(s: CreatureSilhouette, piece: number, t: number, mul: number): Point[] {
  const { from, to } = pieceAngleSpan(piece);
  const pts: Point[] = [];
  for (let i = 0; i <= ARC_POINTS; i++) {
    pts.push(contourAt(s, from + ((to - from) * i) / ARC_POINTS, t, mul));
  }
  return pts;
}

/**
 * The split down the body's middle, from the top of the plating to the
 * bottom, wandering a little off the straight line so it reads as something
 * that cracked rather than something that was cut.
 *
 * Both halves close along these exact points, in opposite directions, so the
 * intact shell has no seam gap and no overlap — and once one piece is gone the
 * survivor's straight edge is the same line the split was, which is why the
 * break needs no separate raw edge of its own.
 */
function splitPoints(s: CreatureSilhouette, t: number): Point[] {
  const top = armourAt(s, -Math.PI / 2, t);
  const bottom = armourAt(s, Math.PI / 2, t);
  const pts: Point[] = [];
  for (let i = 0; i <= SPLIT_POINTS; i++) {
    const f = i / SPLIT_POINTS;
    // Zero at both ends, so the wander never pulls the split off the two
    // points the arcs actually meet it at.
    const jag = Math.sin(f * Math.PI) * Math.sin(f * 9.1) * s.rx * 0.05;
    pts.push({ x: jag, y: top.y + (bottom.y - top.y) * f });
  }
  return pts;
}

/**
 * One crack across one half: a line from near the body's centre out to the
 * plate's rim, so the light behind the plate has somewhere to come from. One
 * per half, plus the split down the middle, is three on an intact shell — the
 * fewest that read as *cracked* at phone size, and few enough that a fourth
 * would just be texture.
 *
 * A function of the angle and a per-body seed only — no wall clock beyond the
 * one the whole contour already breathes on — so a crack keeps its shape as
 * the body sways instead of reshuffling every frame.
 */
function crackPoints(s: CreatureSilhouette, piece: number, seed: number, t: number): Point[] {
  const { from, to } = pieceAngleSpan(piece);
  // Somewhere in the middle of the half, never against the split and never
  // against the other end of the arc.
  const base = from + (to - from) * (0.3 + 0.4 * seed);
  const pts: Point[] = [];
  for (let i = 0; i <= SPLIT_POINTS; i++) {
    const f = i / SPLIT_POINTS;
    const a = base + Math.sin(f * 5.1 + seed * 6.3) * 0.2 * f;
    const edge = armourAt(s, a, t);
    const reach = 0.18 + 0.82 * f;
    pts.push({ x: edge.x * reach, y: edge.y * reach });
  }
  return pts;
}

/** A per-body number in [0,1), deterministic on both devices because `id` is.
 * Two shells side by side must not crack identically. */
export function crackSeed(id: number, piece: number): number {
  return ((id * 7 + piece * 3) % 9) / 9;
}

/** What one plate is drawn in: its own dead material, and the light of the
 * body behind it. All three already hazed by the caller, which owns the row. */
export interface PlateInk {
  plate: string;
  rim: string;
  light: string;
  lineWidth: number;
}

/**
 * One plate: the half-body between its arc and the split, filled opaque,
 * rimmed hard, and then lit by the body's colour along the split and along
 * its own crack.
 */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  seed: number,
  t: number,
  ink: PlateInk,
): void {
  const arc = arcPoints(s, piece, t, ARMOUR_MUL);
  // The arc ends where the split begins, so closing the path back along the
  // split is the plate. Piece 0's arc finishes at the top and piece 1's at the
  // bottom, which is why one of them walks the split backwards.
  const split = splitPoints(s, t);
  const edge = piece === 0 ? split : [...split].reverse();
  // The split's two ends *are* the arc's two ends — same angle, same point —
  // so the loop takes the wander between them and nothing else. Repeating a
  // point would put a zero-length curve segment in the fill for no reason.
  const body = new Path2D(`${openSmoothPath([...arc, ...edge.slice(1, -1)])} Z`);

  ctx.fillStyle = ink.plate;
  ctx.fill(body);
  ctx.strokeStyle = ink.rim;
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(new Path2D(openSmoothPath(arc)));

  // The light behind the plate, coming out of everything that is broken: the
  // split it will come apart along, and the crack across it. Drawn last so it
  // sits over the plate's own fill, and glowing rather than merely coloured,
  // because a hairline in the body's colour at 26 px is a hairline nobody sees.
  strokeGlow(ctx, new Path2D(openSmoothPath(edge)), ink.light, ink.lineWidth * 0.9, 1);
  const crack = new Path2D(openSmoothPath(crackPoints(s, piece, seed, t)));
  strokeGlow(ctx, crack, ink.light, ink.lineWidth * 0.7, 0.8);
}

/**
 * The half that has already been chipped: no plate, but the same hard grey
 * edge the surviving plate is rimmed with, traced along the *body's* own
 * contour rather than the plating's — the body underneath stands at its true
 * size, and this is a border on it, not a ghost of the armour that left.
 *
 * The reason it is drawn at all is the pair's problem, not a decorative one:
 * with one plate on and one off, the two halves of a shell are a hard rim and
 * a soft coloured outline standing side by side, and the rim on the bare half
 * says *this body is still a shell* while the missing plate says *this is the
 * side that is already open*. Once the last plate goes, `drawShellArmour`
 * stops before reaching here and the body is drawn with its own outline
 * alone — which is exactly what "no armour left" has to look like.
 *
 * Only the arc, never the split down the middle: the plate next door rims
 * only its arc too, and the split is where the body's light comes out.
 */
export function drawBareRim(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  t: number,
  ink: PlateInk,
): void {
  ctx.strokeStyle = ink.rim;
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(new Path2D(openSmoothPath(arcPoints(s, piece, t, 1))));
}
