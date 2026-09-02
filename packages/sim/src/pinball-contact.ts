/**
 * What the ball can touch, and how deep it is into one.
 *
 * Split from `pinball-physics.ts` along the seam the two halves already had:
 * this is the **question** — what stands on the table, where the ball is, and
 * whether the two are overlapping — and everything next door is the **answer**,
 * which is one tick of motion made out of it. The dependency runs one way, so
 * a reader after the geometry never has to open the integrator.
 *
 * **`Math.sqrt` is not available here**, and that is the whole reason `isqrt`
 * exists rather than being an optimisation: IEEE-754 does not require it to be
 * correctly rounded, `packages/sim` rounds what it computes into stored
 * integers, and a last-bit difference between two phones lands on either side
 * of a `.5` — after which they are playing different tables from the third
 * bounce onwards (`test/purity.test.ts`).
 */

/**
 * The thinnest half-thickness any authored piece may have, in thousandths of a
 * tile. `pinballFault` refuses a board under it and the physics test checks it
 * against the speed cap: two files, one invariant.
 */
export const PIN_THIN_MILLI = 100;

/**
 * What stands on the table. A peg is round, a block is an axis-aligned box.
 * A list rather than a bare union, so the fingerprint's coverage walk can find
 * a second value to try — the shape `SNAKE_TURNS` and `BOSS_KINDS` have.
 */
export const PIN_PIECE_KINDS = ["peg", "block"] as const;
export type PinPieceKind = (typeof PIN_PIECE_KINDS)[number];

/**
 * One piece, as the wave authored it. Centre and half-extents, both in
 * thousandths of a tile from the table's top-left corner.
 *
 * A peg carries its radius in `wMilli` and repeats it in `hMilli` rather than
 * taking a shape-specific field, so every reader that only wants a bounding
 * box — the editor's hit test, the fault check, the renderer's culling — asks
 * one question of both kinds. `hitPiece` is the only place the two differ.
 */
export interface PinPiece {
  kind: PinPieceKind;
  xMilli: number;
  yMilli: number;
  wMilli: number;
  hMilli: number;
  /**
   * Whether clearing it is required to pass. Peggle's orange rule: a handful
   * of pieces are lit and the rest are scenery that still bounces and still
   * goes. Without it a round is over when the last peg in a corner happens to
   * be struck, which is a length nobody authored.
   */
  target: boolean;
}

/** Where the ball is and where it is going, all in thousandths. */
export interface PinBall {
  xMilli: number;
  yMilli: number;
  vxMilli: number;
  vyMilli: number;
}

/**
 * Integer square root of a non-negative integer, by Newton's method.
 *
 * Exact — the largest `r` with `r * r <= n` — and therefore the same on every
 * engine, which is the entire reason it exists. `Math.floor` rather than `>>1`
 * throughout: the shift is right for every value this game reaches and wrong
 * the first time somebody squares a distance past a 32-bit integer.
 */
export function isqrt(n: number): number {
  if (n <= 0) return 0;
  if (n < 4) return 1;
  let x = n;
  let next = Math.floor((x + 1) / 2);
  while (next < x) {
    x = next;
    next = Math.floor((x + Math.floor(n / x)) / 2);
  }
  return x;
}

/** Truncating division, spelled once so no call site reaches for `Math.round`. */
function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

/**
 * How deep the ball is into this piece, and which way is out.
 *
 * Returns the overlap in thousandths — zero or less for no contact — with the
 * outward unit normal in thousandths beside it. A block is answered from the
 * closest point on its box, so a face hit gives an axis-aligned normal with no
 * square root taken at all and only a corner pays for one; a peg is the same
 * arithmetic with the box collapsed to a point.
 */
export function hitPiece(
  ball: PinBall,
  piece: PinPiece,
  ballMilli: number,
): { depth: number; nxMilli: number; nyMilli: number } {
  const halfX = piece.kind === "peg" ? 0 : piece.wMilli;
  const halfY = piece.kind === "peg" ? 0 : piece.hMilli;
  const round = piece.kind === "peg" ? piece.wMilli : 0;
  // The closest point on the piece's box to the ball's centre.
  const nearX = Math.max(piece.xMilli - halfX, Math.min(ball.xMilli, piece.xMilli + halfX));
  const nearY = Math.max(piece.yMilli - halfY, Math.min(ball.yMilli, piece.yMilli + halfY));
  const dx = ball.xMilli - nearX;
  const dy = ball.yMilli - nearY;
  const reach = ballMilli + round;
  const dist2 = dx * dx + dy * dy;
  if (dist2 >= reach * reach) {
    // Outside, or exactly touching. A dead-centre hit on a block lands here
    // with `dist2` of zero and is caught by the branch below instead.
    if (dist2 !== 0) return { depth: 0, nxMilli: 0, nyMilli: 0 };
  }
  if (dist2 === 0) {
    // The centre is inside the box: there is no direction to push along, so
    // the shallowest face wins. Unreachable while the cap invariant holds,
    // and answered anyway — a board edited into an illegal state should nudge
    // the ball out, not divide by zero.
    const outX = halfX + ballMilli - Math.abs(ball.xMilli - piece.xMilli);
    const outY = halfY + ballMilli - Math.abs(ball.yMilli - piece.yMilli);
    if (outX < outY) {
      return { depth: outX, nxMilli: ball.xMilli < piece.xMilli ? -1000 : 1000, nyMilli: 0 };
    }
    return { depth: outY, nxMilli: 0, nyMilli: ball.yMilli < piece.yMilli ? -1000 : 1000 };
  }
  const dist = isqrt(dist2);
  return {
    depth: reach - dist,
    nxMilli: div(dx * 1000, dist),
    nyMilli: div(dy * 1000, dist),
  };
}
