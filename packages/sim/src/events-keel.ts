/**
 * What THE KEEL says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: a joint is heard from the half of the field whose thumb it wants,
 * which is the one thing about this boss worth hearing from a side.
 */

interface KeelColEvent {
  /** The column it happened over. */
  col: number;
}

export type KeelEvent =
  /** The spine arches into frame, every segment loose. */
  | ({ type: "keelEnter" } & KeelColEvent)
  /** A joint lights at segment `seg`; `seat` is the thumb it accepts, 0 for
   * either. */
  | ({ type: "keelLight"; seg: number; seat: 0 | 1 | 2 } & KeelColEvent)
  /** A joint answered in its window: the segment locks; `loose` is how many
   * are left. */
  | ({ type: "keelLock"; seg: number; loose: number } & KeelColEvent)
  /** A joint's window ran out: it dims, and re-lights. */
  | ({ type: "keelMiss"; seg: number } & KeelColEvent)
  /** A tempo-run joint missed: its segment works loose again. */
  | ({ type: "keelSlip"; seg: number } & KeelColEvent)
  /** The midpoint splits, baring the socket. */
  | ({ type: "keelSplit" } & KeelColEvent)
  /** The socket flashes the colour that fires it. */
  | ({ type: "keelSocket" } & KeelColEvent)
  /** The right colour hit the socket: it shuts and its segment locks free. */
  | ({ type: "keelShut" } & KeelColEvent)
  /** The socket's window ran out: it stays open and the hull is hit. */
  | ({ type: "keelSocketHit" } & KeelColEvent)
  /** Every joint dims at once, before the tempo run. */
  | ({ type: "keelDim" } & KeelColEvent)
  /** The spine, first rigid, bows the wrong way: the chord on its ends is wanted. */
  | ({ type: "keelFlip" } & KeelColEvent)
  /** Both end joints held long enough: the flip is arrested. */
  | ({ type: "keelArrest" } & KeelColEvent)
  /** The flip ran out: the spine snaps back against the hull, and bows again. */
  | ({ type: "keelSnap" } & KeelColEvent)
  /** A marrow seam lights down the spine's middle, for both colours. */
  | ({ type: "keelMarrow" } & KeelColEvent)
  /** Both colours hit the marrow line: it seals. */
  | ({ type: "keelSeal" } & KeelColEvent)
  /** The marrow burned through unsealed: segment `seg` works loose. */
  | ({ type: "keelBurn"; seg: number } & KeelColEvent)
  /** The rock is gone: the locked segments begin to bank, hands off. */
  | ({ type: "keelCool" } & KeelColEvent)
  /** A tap on the cooling spine: it flares, and banks a beat later. */
  | ({ type: "keelFlare" } & KeelColEvent)
  /** Every segment locked: the spine holds rigid. */
  | ({ type: "keelRigid" } & KeelColEvent)
  /** The tail whips and throws one rock down its column. */
  | ({ type: "keelThrow" } & KeelColEvent)
  /** The rock was shot out, in either colour. */
  | ({ type: "keelRockOut" } & KeelColEvent)
  /** Nobody shot it: the rock reached the hull. */
  | ({ type: "keelRockHit" } & KeelColEvent)
  /** The spine snaps straight: the fight is over. */
  | ({ type: "keelStraight" } & KeelColEvent)
  /** The straight spine has hung `keelOpenBeats`; the wave may end. */
  | ({ type: "keelOut" } & KeelColEvent);
