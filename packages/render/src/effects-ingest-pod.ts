import type { SimEvent } from "@neon-spore/sim";
import type { IngestOneCtx } from "./effects-ingest.js";
import { castHuskFlight } from "./husk-deflate.js";
import { bodyX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What the mouth leaves on screen**, for the two cargoes that leave anything.
 *
 * The seam is the simulation's own. `sim/pod-intake.ts` is split off `pods.ts`
 * along the line between *a thing that hangs and sinks* and *the ship, which
 * does not care what shape the thing arriving at it was*, and these are the
 * events on the ship's side of it: something reached the maw and the maw
 * answered. A pod hanging, coming loose and falling is drawn from world state
 * every frame and leaves nothing here.
 *
 * Out of `effects-ingest.ts` because that file stood two lines under its limit
 * when the husk's flight was wired, and a switch arm that is four lines long is
 * the wrong thing to shorten a comment about some other creature for.
 *
 * The third of the three is not here: a husk *swallowed* draws nothing of its
 * own, and its row is in `effects-ingest-silent.ts` with the reason.
 */
export function ingestMouth(
  e: Extract<SimEvent, { type: "podTaken" | "huskRefused" }>,
  ctx: IngestOneCtx,
): void {
  if (e.type === "podTaken") {
    // Sparks flying *inwards*: the one moment in the game where the ship
    // takes something instead of losing it.
    const mouth = ctx.put(bodyX(ctx.l, e.col, ctx.l.rows - 1), ctx.l.hullY);
    ctx.sparks.implode(mouth.x, mouth.y, 22, PALETTE.pod, ctx.l.tile * 1.9);
    ctx.ship.swallowPod(e.kind);
    return;
  }
  // And the one that was refused, going off like a balloon let go. Nothing
  // happens to the ship — that is the whole of what the picture says — so the
  // ship is not told (`husk-deflate.ts`).
  castHuskFlight(ctx.huskDeflates, e, ctx.l, ctx.put);
}
