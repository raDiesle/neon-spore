import {
  blobRadiusMul,
  type CreatureSilhouette,
  openSmoothPath,
  type Point,
} from "@neon-spore/content";

/**
 * WHERE A PLATE SITS ON A BODY — THE SHELL's armour as geometry and nothing
 * else.
 *
 * Cut out of `shell-plate.ts` when the plate got a seam a candidate look can
 * patch and that file went past its 250-line ceiling. The seam is the one the
 * whole arrangement rests on: **where** the armour goes is a rule about the
 * creature, settled and shared, and **what it looks like** is the question
 * VERSUS is for. A look that re-derived an arc would be arguing about the
 * light while quietly moving the plate, and the pair could not tell the two
 * apart.
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

/**
 * Every path one plate is made of, cut once.
 *
 * Exported so a candidate look draws the *same* plate rather than a second
 * plate cut from a second copy of this geometry — the arc, the split and the
 * crack are three rules about where armour sits on a body, and a look arguing
 * about the light has no business restating any of them. `body` is the closed
 * region, `arc` the outer edge alone, `edge` the split the two halves share,
 * and `crack` the fissure across this half.
 */
export interface PlatePaths {
  body: Path2D;
  arc: Path2D;
  edge: Path2D;
  crack: Path2D;
}

export function platePaths(
  s: CreatureSilhouette,
  piece: number,
  seed: number,
  t: number,
): PlatePaths {
  const arc = arcPoints(s, piece, t, ARMOUR_MUL);
  // The arc ends where the split begins, so closing the path back along the
  // split is the plate. Piece 0's arc finishes at the top and piece 1's at the
  // bottom, which is why one of them walks the split backwards.
  const split = splitPoints(s, t);
  const edge = piece === 0 ? split : [...split].reverse();
  return {
    // The split's two ends *are* the arc's two ends — same angle, same point —
    // so the loop takes the wander between them and nothing else. Repeating a
    // point would put a zero-length curve segment in the fill for no reason.
    body: new Path2D(`${openSmoothPath([...arc, ...edge.slice(1, -1)])} Z`),
    arc: new Path2D(openSmoothPath(arc)),
    edge: new Path2D(openSmoothPath(edge)),
    crack: new Path2D(openSmoothPath(crackPoints(s, piece, seed, t))),
  };
}

/**
 * The outline of a bared half — the body's own contour along this piece's
 * span, which is what the grey rim is traced along. Exported for
 * `platePaths`'s reason: a candidate arguing about the material has to rim the
 * same half.
 */
export function bareArc(s: CreatureSilhouette, piece: number, t: number): Path2D {
  return new Path2D(openSmoothPath(arcPoints(s, piece, t, 1)));
}

/**
 * The outward bearing a whole plate faces, in the body's own frame.
 *
 * A plate is half a body, so the direction it presents to the world is the
 * middle of its own span: π for the piece over the left column, 0 for the one
 * over the right. It is here rather than in a look because it is a fact about
 * `pieceAngleSpan`, and a look that wrote it out again would be a second
 * answer to which half is which.
 */
export function plateBearing(piece: number): number {
  const { from, to } = pieceAngleSpan(piece);
  return (from + to) / 2;
}
