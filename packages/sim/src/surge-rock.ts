import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import {
  type SurgeState,
  surgeBulbLeft,
  surgeBulbRow,
  surgeBulbSpan,
  surgeHands,
} from "./surge.js";
import type { World } from "./world.js";

/**
 * **The rock THE SURGE spits while the pair is charging it** — the fight's
 * third gesture, and the one that asks its question at the moment stopping
 * costs something (`docs/spec/bosses-choreographed.md` §9 step 7).
 *
 * From `surgeRockNotches` open, every `surgeRockBeats` beats in which
 * **both** thumbs are on the bulb, one rock falls down the bulb's own
 * columns at the ship. Nothing on the bulb answers it: the shield does, and
 * the shield is the pilot's thumb, which is on the bulb. So the pair lets go
 * on purpose — the charge lost, nobody hurt — wards, and takes hold again.
 * Held through it, the hull takes a scar and the bulb is still charging.
 *
 * **Both thumbs, not one**, because one thumb on the bulb is the pilot's
 * free to ward with: a rock that came then would cost nothing to answer and
 * would not be a question. And it is the beats **with both hands on** that
 * are counted rather than beats on the clock, so letting go stops the spits
 * as well as the charge — one gesture, one consequence.
 *
 * Its own file rather than `surge-seam.ts`'s, which is the three ends of a
 * charge; this is the one thing the bulb does that a charge does not end.
 */

/**
 * Whether the bulb owes a rock this beat. Read before the spit and nowhere
 * else, so the gate and the throw cannot drift apart.
 */
export function surgeSpits(world: World, s: SurgeState): boolean {
  const cfg = world.cfg;
  if (s.notches < cfg.surgeRockNotches) return false;
  if (surgeHands(s) < 2) return false;
  return s.rockBeat < 0 || world.beat - s.rockBeat >= cfg.surgeRockBeats;
}

/**
 * One rock out of the bulb's underside, down a column it covers.
 *
 * The row under the bulb rather than its own, for `surge-seam.ts`'s reason:
 * a body on the bulb's row is a body the bulb absorbs the next beat
 * (`surge-step.ts`). An ordinary meteor from the moment it leaves — the
 * shield turns it, the hull is scarred by it — with only its id kept back,
 * so the bulb can be asked whether its own is still falling.
 */
export function surgeSpit(world: World, s: SurgeState): void {
  const cfg = world.cfg;
  const col = surgeBulbLeft(cfg) + nextInt(world.rng, surgeBulbSpan(cfg));
  const row = surgeBulbRow(s, cfg) + 1;
  const id = world.nextId++;
  world.creatures.push({
    id,
    kind: "meteor",
    span: 1,
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  s.rockBeat = world.beat;
  s.rockId = id;
  world.events.push({ type: "surgeRock", col, row });
}
