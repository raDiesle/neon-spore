/**
 * **How far a lever carried round a rim turns what it is bolted to**, in
 * thousandths of a degree, for `movedMilli` of hand travel along a ring of
 * `radiusMilli`: one turn a lap, so the knob stays on the place it was put.
 * `2π` in thousandths is the one rounding step, and it is the same on every
 * device.
 *
 * THE MAZE's drum was the first lever (`mazeDragTurn`), and THE OCULUS's two
 * on its lens the second (`oculus-hand.ts`) — one gearing, called by both.
 */
export function rimTurnMilli(movedMilli: number, radiusMilli: number): number {
  return Math.round((movedMilli * 360_000 * 1000) / (6283 * radiusMilli));
}

/** The length of a ring of `radiusMilli` all the way round, in the same thousandths. */
export function rimLapMilli(radiusMilli: number): number {
  return Math.round((6283 * radiusMilli) / 1000);
}
