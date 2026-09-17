import { type BatonState, batonDark, batonFlip } from "./baton.js";
import { bead } from "./baton-step.js";
import type { World } from "./world.js";

/**
 * THE BATON's second bead: its lighting and the merge that ends it — the
 * design's steps 9 and 12 (`docs/spec/bosses-choreographed.md` §10). Both
 * are asked on the beat from `stepBaton`, after every landing of that beat,
 * so a bead that lands in the last socket and one that lands above it on the
 * same beat merge on that beat.
 */

/**
 * The second bead lights in the top socket once `batonTwinAfter` sockets are
 * dark, wearing the colour the first is not — so from this beat the trigger
 * has two to send and every shot has to be the right one of two colours. It
 * lights once: after the merge the arm is down to one bead for good.
 */
export function batonTwin(world: World, b: BatonState): void {
  const cfg = world.cfg;
  if (b.beads.length !== 1 || b.merged || batonDark(b) < cfg.batonTwinAfter) return;
  const first = b.beads[0];
  if (first === undefined) return;
  b.beads.push(bead(world, 0, batonFlip(first.color)));
  world.events.push({ type: "batonTwin", col: b.col, socket: 0 });
}

/**
 * Two beads at rest in the last two sockets become one, in the last: the
 * one that waited there takes the other in, and its next flight — the only
 * one left out of that socket — is the crossing (`baton-cross.ts`). The
 * design's step 12 (`docs/spec/bosses-choreographed.md` §10).
 */
export function batonMerge(world: World, b: BatonState): void {
  const cfg = world.cfg;
  if (b.beads.length !== 2 || b.beads.some((bead) => bead.flying)) return;
  const last = b.beads.find((bead) => bead.socket === cfg.batonSockets - 1);
  const above = b.beads.find((bead) => bead.socket === cfg.batonSockets - 2);
  if (last === undefined || above === undefined) return;
  b.beads = [last];
  b.merged = true;
  last.satBeat = world.beat;
  world.events.push({ type: "batonMerged", col: last.col, socket: last.socket });
}
