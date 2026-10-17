/**
 * **A pod's and a husk's ends**, as `SimEvent` arms: let loose, taken, lost,
 * and a husk swallowed or refused.
 *
 * Cut out of `events.ts` on 17 October 2026 with `events-hands.ts` and
 * `events-body.ts`, for the reason that file gives. Only the union crosses.
 */
export type PodEvent =
  | { type: "podLoose"; col: number; row: number }
  | { type: "podTaken"; col: number }
  /**
   * A real pod not taken: broken on the skin, gone off the side, or still on
   * the field when its clock ran out. `row` only on the last, which is the one
   * that happens wherever the pod was rather than at the hull or the wall.
   */
  | { type: "podLost"; col: number; row?: number }
  /**
   * A husk went in, and the wave with it (`pod-intake.ts`).
   *
   * It carries where it was, which `podLost` does not always:
   * a husk's whole last second is a picture of the thing the pair refused, so
   * what is drawn has to be the body that was hanging there rather than a
   * generic one (`render/src/husk-deflate.ts`).
   */
  | { type: "huskSwallowed"; col: number; row: number }
  /** A husk reached the ship, or the far wall, and was refused: it lets its air
   * go and flies off. `row` for the wall — a husk that crossed the field and
   * left was never anywhere near the hull. */
  | { type: "huskRefused"; col: number; row: number };
