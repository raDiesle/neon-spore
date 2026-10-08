import { ledgerHand } from "@neon-spore/hands";
import type { World } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE LEDGER the tick a return leaves the body: the bead at the top of the
 * cord and four beats of it to come down into the socket, with the pair's
 * hand on it — the plate carried under the socket and the trigger on the
 * beat it lands (`hands/boss-hands-clocks.ts`). The pose `ledger:nerves` is
 * judged on, because the ship's nerves are a look of the whole descent and
 * the landing, and every other LEDGER pose has the bead somewhere in the
 * middle of it or none at all. Replayed on the event rhythm, so each replay
 * is one whole bill.
 */
export const LEDGER_BILLED_POSE: Pose = {
  name: "THE LEDGER · BILLED",
  note: "THE LEDGER a tick after the pair's shot widened its seam: a violet bead of light starts down the cord, and four beats later it reaches the socket in the hull, where the plate is waiting and the trigger goes on the beat it lands.",
  lookAt: "the hull under the socket, as the bead comes down the cord and lands in it",
  crop: "full",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  hand: (w) => ledgerHand(w).map((c) => ({ ...c, tick: w.tick })),
  build: () => {
    const w = bossWorld("ledger");
    const billed = (world: World) =>
      world.boss?.kind === "ledger" &&
      world.boss.beads.some((b) => b.beat - world.beat >= b.span - 1);
    runHand(w, "THE LEDGER billing a return", ledgerHand, billed, 60 * TPB);
    return w;
  },
};
