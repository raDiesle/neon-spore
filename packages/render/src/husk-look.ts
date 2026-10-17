import type { Pod } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * How a husk is told from a pod — the one record VERSUS can offer a second
 * answer through.
 *
 * The shipped answer is *the fake twin on the seat that can tell*: `pods.ts`
 * draws a husk as the pod it claims to be on the fooled seat, and as that
 * form's fake — a red blink and its tell on the count (`pod-pickup.ts`) — on
 * the other. A white frame with DO NOT TAKE beside it went round it too until
 * the owner took it out, 17 October 2026, for the siren (`comms-husk.ts`).
 *
 * A candidate that argues the body itself should carry the tell differently —
 * the shape-sheet's HUSK drafts, a pod whose mass has gone to the bottom with
 * the light gone out of its core — patches `body`. The game itself patches
 * nothing, and `docs/versus.md` is the mechanism this record exists for.
 *
 * Its own file rather than a field on `pods.ts` so a candidate can patch it
 * without importing the draw. It imports types only, so it sits below it.
 */
export interface HuskLook {
  /**
   * The body a husk is drawn as, at its place and on its clock, or nothing —
   * with nothing here a husk is drawn by `drawPods` exactly as a moored pod.
   * `t` is the pod's own offset clock, the one the moored bob runs on, and
   * `beatsLeft` its deadline as `POD_LOOK.moored` gets it — a husk wears the
   * real pod's clock, and player 1's copy has to be drawn with it.
   */
  body?: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    x: number,
    y: number,
    t: number,
    pod: Pod,
    beatsLeft: number,
  ) => void;
}

export const HUSK_LOOK: HuskLook = { body: undefined };

/**
 * Whether this screen sees this husk for what it is — its fake twin
 * (`pods.ts`). One seat is fooled — that
 * is the whole creature: player 1, unless the husk was authored `truthP1`
 * (`PodEntry.truthP1`, the director's husk rows), when it is player 2. `test`
 * always does, because it is both halves at once on one screen and a rig
 * that hid half the picture would be no rig.
 */
export function showsHuskMark(l: Layout, pod: Pick<Pod, "truthP1">): boolean {
  return l.role !== (pod.truthP1 ? "p2" : "p1");
}
