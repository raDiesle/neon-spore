import {
  type GimbalState,
  gimbalLeaking,
  gimbalRingTrue,
  gimbalTurning,
  INNER,
  OUTER,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import { gimbalRingCircle } from "./gimbal-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GIMBAL is asking for** — page twenty-five of the readings, and
 * its own page because every page before it is a boss and this is one too.
 *
 * Three moments, and this is the one boss where **both seats are owed a word
 * on the same beat**: each has a ring, each ring has a mark, and the two
 * marks are never in the same place. So the reading returns a cue per seat
 * and `cueSeen` hands each screen its own. Two words at once across the pair,
 * never two on one screen — the drawer takes the first cue a screen may see
 * and stops (`boss-cue.ts`), so the director's test screen, which is shown
 * both rings, still carries one.
 *
 * **The word is `TURN` and then `HOLD`, and neither says which way.** That is
 * #34's second rule on the boss it was written for: which way round the ring
 * goes is the whole fight, it is different on the two screens, and a field
 * that said `LEFT` would have answered the only question this boss asks. The
 * mark's own wedge already points at where the ring has to come to
 * (`gimbal-ring.ts`); the word says what the thumb does to get it there.
 *
 * **`HOLD` once a ring sits true**, because the thing a seat gets wrong from
 * there is letting go to tell the other seat about it — and a ring with no
 * hand on it falls back toward rest on the beat (`gimbal-step.ts`). The word
 * is drawn on the ring that is *already right*, which is the one place on the
 * screen a player is not looking.
 *
 * **And `FIRE` over the leak, ahead of both**, because it is the only thing
 * on this boss that ends the wave. Either seat's: the seam takes a bolt in
 * either colour (`gimbal-shot.ts`), so the cue carries no seat and both
 * screens get it — the one moment the pair is being asked for the same thing.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

function markAt(
  seat: 1 | 2 | null,
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  kind: BossCue["kind"] = "TURN",
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

export function gimbalCues(l: Layout, world: World, s: GimbalState): readonly BossCue[] {
  const out: BossCue[] = [];
  // The seam first: it is the only hazard this boss has and it reaches the
  // hull in four beats. The mark stands on the column it is running down,
  // at the hull, which is where the cannon has to be — never on the drum,
  // which would point at the leak rather than at the answer.
  if (gimbalLeaking(s)) {
    out.push(markAt(null, "FIRE", fieldX(l, s.seamCol), l.hullY, l, 91, "PRESS"));
  }
  if (!gimbalTurning(s)) return out;
  for (const [seat, ring] of [
    [1, OUTER],
    [2, INNER],
  ] as const) {
    const on = gimbalRingCircle(l, world.cfg, s, ring);
    if (on === null) continue;
    const t = gimbalRingTrue(s, world.cfg, world.beat, ring);
    out.push(markAt(seat, t ? "HOLD" : "TURN", on.x, on.y, l, 92 + seat, t ? "HOLD" : "TURN"));
  }
  return out;
}
