import type { Layout } from "./layout.js";

/**
 * How a real pod hangs — the record VERSUS can offer a second answer through.
 *
 * The shipped answer is `pods.ts`'s `drawMoored`: the lobed amber blob, its
 * slow bob and its beating core. Until 16 October 2026 that was the only way
 * a moored pod could be drawn, so a candidate for the pod itself had nothing
 * to take hold of; `husk-look.ts` had been the hollow pod's seam since
 * September and the real one had none. The game patches nothing here.
 *
 * `moored` gets the clock as beats — `beatsLeft`, `Infinity` for a pod that
 * owes nothing (`NO_DUE`) — because a pod is now owed in time, and a look that
 * could not see the deadline could not answer to it. Player 1's husk is drawn
 * through here too (`drawMoored`), so whatever a real pod looks like is what a
 * husk looks like on the screen that must not be able to tell.
 *
 * Its own file for the reason `husk-look.ts` is: a candidate patches it
 * without importing the draw. It imports types only.
 */
export interface PodLook {
  /** The moored pod at its place, on its own offset clock, or nothing — with
   * nothing here `drawMoored` draws the shipped body. */
  moored?: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    x: number,
    y: number,
    t: number,
    beatsLeft: number,
  ) => void;
}

export const POD_LOOK: PodLook = { moored: undefined };
