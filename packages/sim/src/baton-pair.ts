import { type BatonState, batonDark, batonFlip } from "./baton.js";
import { batonDrawn } from "./baton-hand.js";
import { bead } from "./baton-step.js";
import type { World } from "./world.js";

/**
 * THE BATON's second bead: its lighting, and the drawing together that ends
 * it — the design's steps 9 and 12 (`docs/spec/bosses-choreographed.md` §10).
 * Both are asked on the beat from `stepBaton`, after every landing of that
 * beat, so a bead that lands in the last socket and one that lands above it on
 * the same beat reach the last stage together.
 *
 * **The two do not become one by arriving.** Two beads at rest in the last two
 * sockets put the arm into `merging`, and from there it is the pair's, a thumb
 * each on the bead that is theirs, for `batonMergeBeats` of both at once
 * (`baton-hand.ts`). It is the one beat of this fight that asks for them
 * together, and it is put exactly where the design has the arm hanging by a
 * thread: everything before it was *not you, not this beat*, and what it takes
 * to end that is both of them on the same count.
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
 * Two beads at rest in the last two sockets: the arm stops passing and hangs
 * them, and the pair is asked for a thumb each. The design's step 12
 * (`docs/spec/bosses-choreographed.md` §10).
 */
export function batonMerge(world: World, b: BatonState): void {
  const cfg = world.cfg;
  if (b.stage !== "passing" || b.beads.length !== 2 || b.beads.some((bead) => bead.flying)) return;
  const last = b.beads.find((bead) => bead.socket === cfg.batonSockets - 1);
  const above = b.beads.find((bead) => bead.socket === cfg.batonSockets - 2);
  if (last === undefined || above === undefined) return;
  b.stage = "merging";
  b.stageBeat = world.beat;
  b.mergeThumbs = 0;
  b.mergeHeld = 0;
}

/**
 * One beat of the drawing together. The count runs only while both thumbs are
 * down and goes back to nought the moment either lifts — *together means
 * together*, THE INSTAR's rule (`sim/instar.ts`) — and the window closing
 * short of `batonMergeBeats` shakes the bead that waited back to the top
 * socket, which is the price a bead that sat too long pays anywhere else here.
 */
export function stepBatonMerge(world: World, b: BatonState): void {
  const cfg = world.cfg;
  if (batonDrawn(b)) {
    b.mergeHeld += 1;
    if (b.mergeHeld >= cfg.batonMergeBeats) merged(world, b);
    return;
  }
  b.mergeHeld = 0;
  if (world.beat - b.stageBeat >= cfg.batonMergeWindowBeats) parted(world, b);
}

/** Back to passing, the two now one: the one that waited took the other in,
 * and its next flight — the only one left out of that socket — is the
 * crossing (`baton-cross.ts`). */
function merged(world: World, b: BatonState): void {
  const last = b.beads.find((bead) => bead.socket === world.cfg.batonSockets - 1);
  if (last === undefined) return;
  b.beads = [last];
  b.merged = true;
  last.satBeat = world.beat;
  leave(world, b);
  world.events.push({ type: "batonMerged", col: last.col, socket: last.socket });
}

/** Back to passing with both beads still on the arm, the waiting one home. */
function parted(world: World, b: BatonState): void {
  const last = b.beads.find((bead) => bead.socket === world.cfg.batonSockets - 1);
  if (last !== undefined) {
    last.socket = 0;
    last.satBeat = world.beat;
    b.settles += 1;
  }
  leave(world, b);
  world.events.push({ type: "batonParted", col: b.col, socket: 0 });
}

/** What both endings share: the arm passing again, still, and no thumbs on it. */
function leave(world: World, b: BatonState): void {
  b.stage = "passing";
  b.stageBeat = world.beat;
  b.stillBeat = world.beat;
  b.mergeThumbs = 0;
  b.mergeHeld = 0;
}
