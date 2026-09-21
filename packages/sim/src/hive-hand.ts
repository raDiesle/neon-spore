import { midCol } from "./config.js";
import { type HiveState, hiveBoss } from "./hive.js";
import { hiveClenched, hiveHauled, hiveSwellingAt, NO_PINCH } from "./hive-lobe.js";
import { enterHivePhase } from "./hive-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **Two thumbs on THE HIVE's underside**, off the wire, on the tick — the
 * two gestures the §6.2 ask wanted reached on the picture rather than on
 * the panel (`.claude/skills/new-boss-more`).
 *
 * One handle, `hiveLobe`, read two ways by the state the mass is in, as
 * THE WELL reads its seam: there is no new thing to find on the screen,
 * only a new moment to put the same thumb down in.
 *
 * - **Clenched**, the whole underside is the handle and the **pilot** drags
 *   it back down. `hiveHaulMilli` thousandths of a tile and it relaxes
 *   early, with none of the backlog a clench that runs out owes
 *   (`hive-step.ts`). He is the seat that is shown the mass itself.
 * - **Swelling**, one lobe is the handle and the **navigator** holds it.
 *   `hivePinchBeats` later it opens wrung — colourless, and either colour
 *   seals it. She is the only seat shown a swell at all (`showsHiveSwell`),
 *   so this is hers the way the colour is his: a hand of his on a lobe he
 *   cannot see is dropped without a sound, as `wellHeard` drops hers.
 *
 * Neither seat can do the other's, and neither can be told which moment it
 * is by the game: *it is clenched* and *the next one is at seven* are both
 * sentences somebody has to say out loud.
 *
 * On the tick, and both for the same reason: a haul is where the thumb is
 * now, and a hold has to be counted from the tick it landed on rather than
 * from the beat after it — two beats on a lobe is short enough that a beat
 * of rounding is a quarter of the gesture.
 */
export function hiveHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "hiveLobe") return;
  const s = hiveBoss(world);
  if (s === null) return;
  if (player === 1) {
    haul(world, s, command);
    return;
  }
  pinch(world, s, command);
}

/** The pilot's carry on a clenched underside, cumulative from the grab and downward only. */
function haul(world: World, s: HiveState, command: Command & { kind: "drag" }): void {
  if (!hiveClenched(s)) return;
  if (!command.on) return;
  // The deepest the carry has reached in this clench, not where the thumb
  // rests: a hand that wobbles back up has still hauled what it hauled, and
  // the mass is heavy enough that it does not follow a thumb home.
  const down = Math.max(0, command.fromYMilli ?? 0);
  s.haulMilli = Math.max(s.haulMilli, down);
  if (!hiveHauled(s, world.cfg)) return;
  enterHivePhase(s, "spill", world.beat);
  world.events.push({ type: "hiveHaul", col: midCol(world.cfg) });
}

/**
 * The navigator's thumb on a swelling lobe. What it is worth is counted at
 * the opening (`hive-step.ts`), which is the only moment a colour can be
 * kept out of a breach; all that is held here is which lobe, and since when.
 *
 * A thumb put on a lobe that is not swelling — or on any lobe at all while
 * the mass is clenched, which is the state's whole cost — is not a refusal
 * with a sound, it is a hand on a part of the picture that is not doing
 * anything. It simply lets go of whatever it was holding.
 */
function pinch(world: World, s: HiveState, command: Command & { kind: "drag" }): void {
  const i = command.id ?? NO_PINCH;
  if (!command.on || !hiveSwellingAt(s, world.cfg, world.beat, i)) {
    s.pinch = NO_PINCH;
    return;
  }
  // A move inside a hold must not re-anchor the clock, or the hold would
  // restart on every tick the thumb drifted a pixel (`well-hand.ts`).
  if (s.pinch === i) return;
  s.pinch = i;
  s.pinchBeat = world.beat;
}
