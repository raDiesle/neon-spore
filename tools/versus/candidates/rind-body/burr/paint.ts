import { walkedSilhouette } from "../../../../../packages/content/src/body-form.js";
import type { CreatureSilhouette } from "../../../../../packages/content/src/silhouettes.js";
import { studded } from "../../../../shape-sheet/src/forms/studded.js";

/**
 * BURR — a rind wearing knobs, and it loses knobs with its layers.
 *
 * The `studded` form off the shapes page (`forms/studded.ts`): a plain body
 * whose whole rim is broken by one feature repeated, which is what nearly
 * every falling enemy in other games wears and what tells one kind from
 * another at the size a phone draws them. A rind is a body with something
 * *on* it, and a knob is the plainest picture there is of something on a
 * body. The form is taken as it is — the candidate imports it rather than
 * copying its arithmetic, which is the clubbed rim's move — and asked for a
 * different rim per layer: seven fat knobs standing well off the body with
 * both layers on, four shorter ones with one, and the ordinary blob when bare.
 * Few and fat rather than many and sharp, so it is not TOOTHED's rim again:
 * a knob is a swelling, a tooth is a break.
 * The body under the knobs is a shallow three-lobed blob, near enough round
 * that the knobs are what an eye counts.
 *
 * The colour, the size and the interior are the creature's own; only the
 * outline, and the husk the shed throws, are this.
 */

/** Knobs at one layer, and how many each further layer adds. */
const KNOBS_BASE = 1;
const KNOBS_PER_LAYER = 3;
/** How far a knob stands off the body per layer, as a share of the radius. */
const REACH_PER_LAYER = 0.16;
const RX = 56;
const RY = 50;

const base = { lobes: 3, depth: 0.05, wobble: 0.025, seed: 5.1 };

const built = new Map<number, CreatureSilhouette>();

export function burr(left: number): CreatureSilhouette {
  const have = built.get(left);
  if (have) return have;
  const studs = KNOBS_BASE + KNOBS_PER_LAYER * left;
  const form = studded("BURR", "a rind wearing knobs", {
    rx: RX,
    ry: RY,
    studs,
    reach: REACH_PER_LAYER * left,
    // Wide and blunt: a knob, not a spine — a spine is THE BRISTLE's word.
    width: 0.78,
    blunt: 1,
    lobes: base.lobes,
    depth: base.depth,
    seed: base.seed,
  });
  const made = walkedSilhouette({ ...base, lobes: studs }, (t) => form.pointsAt(t));
  built.set(left, made);
  return made;
}
