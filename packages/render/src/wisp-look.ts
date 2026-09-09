import type { WispJump } from "./wisp.js";
import { drawTentacles } from "./wisp-tentacles.js";

/**
 * THE ONE RECORD A CANDIDATE WISP FRINGE PATCHES.
 *
 * The sixth of `magnet-look.ts`'s kind and here for its reason word for word:
 * the record needs the paint and `wisp-body.ts` needs the record, so a record
 * sitting beside the paint would make the two import each other.
 *
 * **It is the fringe and not the bell**, and that is a decision rather than a
 * convenience. A wisp is a dome full of holes with streamers under it, and the
 * two halves are argued about separately: the bell's interference is
 * `wisp-static.ts`'s whole subject and is about a signal being received, while
 * the streamers are about a body that hangs. A slot that patched both would be
 * a vote on two questions at once, which `variants.test.ts` refuses on purpose.
 */

/**
 * The streamers, as everything a fringe could want, all of it in **silhouette
 * units** — the space `blobPath` returns, inside the one `ctx.scale`
 * `drawWispBody` has already applied. A streamer measured in pixels would be a
 * body whose tentacles grew a different amount than its bell as it came down
 * the field.
 */
export interface WispFringe {
  readonly ctx: CanvasRenderingContext2D;
  /** The bell's own radii, in silhouette units. */
  readonly rx: number;
  readonly ry: number;
  /** The contour's clock — what the sway is read off. */
  readonly t: number;
  /** The whole of the jump: the crouch, the flight, the arc and the landing. */
  readonly j: WispJump;
  /** How hard it is moving vertically: 1 at the launch and the touchdown, 0 at the apex. */
  readonly dive: number;
  /** How high it is, as a share of the apex. */
  readonly air: number;
  /** Which way it is going, or 0 while it stands. */
  readonly heading: number;
  /** How badly the signal is holding, 0..1. */
  readonly noise: number;
  /** Distance, already worked out. A fringe that hazed again would spend it twice. */
  readonly haze: (hex: string) => string;
}

export interface WispLook {
  /** Everything that hangs, drawn behind the bell. */
  fringe(f: WispFringe): void;
}

/** The shipped fringe: five strands hung in a row across the hem, two thick and
 * three fine, each carrying its own share of the signal. `wisp-tentacles.ts`
 * holds the arithmetic. */
export const WISP_LOOK: WispLook = { fringe: drawTentacles };
