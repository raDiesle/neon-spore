import type { Pod } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * How a husk is told from a pod — the one record VERSUS can offer a second
 * answer through.
 *
 * The shipped answer is *nothing on the body and a frame round it*: `pods.ts`
 * draws a husk as the pod it claims to be, on both screens, and `husk-mark.ts`
 * puts a white frame and DO NOT TAKE round it on player 2's screen alone. That
 * is one look, and until this file it was hardcoded in two places with no
 * seam a candidate could take hold of — the pod's draw was an `if (loose)`
 * with no third way, and the mark was drawn whenever the seat was not `p1`.
 *
 * A candidate that argues the body itself should carry the tell — the
 * shape-sheet's HUSK drafts, a pod whose mass has gone to the bottom with the
 * light gone out of its core — patches `body` and turns `marked` off. The
 * game itself patches nothing: the two fields here are the shipped look,
 * and `docs/versus.md` is the mechanism this record exists for.
 *
 * Its own file rather than a field on `pods.ts` because `husk-mark.ts`
 * imports `pods.ts` for `podCenter`, and a record both read has to live
 * beside them rather than in either. It imports types only, so it sits below
 * both.
 */
export interface HuskLook {
  /**
   * The body a husk is drawn as, at its place and on its clock, or nothing —
   * with nothing here a husk is drawn by `drawPods` exactly as a moored pod.
   * `t` is the pod's own offset clock, the one the moored bob runs on.
   */
  body?: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    x: number,
    y: number,
    t: number,
    pod: Pod,
  ) => void;
  /** Whether player 2's frame and words go round it (`husk-mark.ts`). */
  marked: boolean;
}

export const HUSK_LOOK: HuskLook = { body: undefined, marked: true };
