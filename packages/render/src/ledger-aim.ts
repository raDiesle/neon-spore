import {
  type LedgerState,
  ledgerNext,
  ledgerPhase,
  ledgerSeamCol,
  priming,
  type World,
} from "@neon-spore/sim";
import { paintPath } from "./goo-parts.js";
import { GOO } from "./goo-style.js";
import type { Layout } from "./layout.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";
import { CANNON_R, cannonGrab } from "./touch-ship.js";
import { showsLedgerBead } from "./view-role-clocks.js";

/**
 * **Where the cannon has to stand to hurt THE LEDGER**, on the pilot's hull:
 * the pull's own path, run from the cannon to a placeholder under the seam.
 *
 * The owner, 14 October 2026: *introduce a "helper" so that players understand
 * to move cannon to shoot and hit boss … maybe we can introduce a cannon
 * placeholder animation — similar we use in tutorial or before pulling
 * action*. So it is the PULL LAB's waiting path exactly (`goo-parts.ts`): the
 * dots along the hull lit one after another, the see-through ghost running
 * from the cannon to the seam's column, and the dashed turning placeholder
 * there flashing as it lands. What it says is a place and not a word, which
 * keeps the owner's earlier ruling — *we do not need to show helper to "move"
 * for cannon to shoot*, 5 October 2026 (`boss-cue-read-o.ts`).
 *
 * **It stands exactly when `FIRE` would, but for the cannon**: `paying`, the
 * cord empty, nothing priming. Once the cannon is under the seam the path is
 * gone and `FIRE` stands on the body instead, so the two never stand at once.
 * From `ledgerWhipSeam` hits it is as quiet as `FIRE` is, because whether to
 * spend a shot on the body at all is the pair's own question there.
 *
 * **The pilot's**, because the cannon is (`CONTROLS`' `cannon`, player 1), and
 * behind the bead's gate so the rig shows it too. Drawn on the finished ship
 * (`ledger-root.ts`), since the ship pass paints over the field's.
 */
export function drawLedgerAim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  time: number,
): void {
  if (!showsLedgerBead(l.role)) return;
  const seam = ledgerSeamCol(t, world.cfg);
  if (!ledgerAims(world, t, seam)) return;
  const from = cannonGrab(l, world.cannonCol);
  const to = cannonGrab(l, seam);
  const r = l.tile * CANNON_R;
  const track: PullTrack = { pts: [from, to], w: r * PULL_TRACK_W };
  paintPath(ctx, track, r, GOO, { origin: 0, at: 0, held: false, time, enter: SHOWN });
}

/** Whether the cannon is being shown the seam: `FIRE`'s gate, with the cannon elsewhere. */
export function ledgerAims(world: World, t: LedgerState, seam: number): boolean {
  if (world.cannonCol === seam || priming(world)) return false;
  if (ledgerPhase(t, world.cfg, world.beat) !== "paying") return false;
  return ledgerNext(t) === null;
}

/** Seconds since the path came in: long enough that it is whole and the ghost runs. */
const SHOWN = 9;
