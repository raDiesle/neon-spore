import type { SpoolPhase, SpoolState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { Layout } from "./layout.js";
import { spoolBrakeAsks, spoolKnobCircle } from "./spool-grip.js";

/**
 * **What THE SPOOL is asking for** — page twenty-seven of the readings, and
 * the shortest: one handle, one seat, one word.
 *
 * **`HOLD` on the pilot's knob while the line runs and nobody is holding
 * it.** The gesture is the knob carried down its rail and kept there, so the
 * kind is `CARRY`, and the verb is the part a pilot gets wrong: letting go is
 * not neutral, and a brake with no hand on it pays the line out fastest of
 * all (`sim/spool-hand.ts`). THE HASP's word on THE HASP's gesture.
 *
 * **Gone the moment he has hold of it**, because what is left is *how deep*,
 * and that is the whole conversation — the zone is on her screen and never
 * on his, and a word on a held knob could only say *deeper* or *shallower*,
 * which is the answer she is there to give (§21). And silent outside a
 * movement: while the spool is taut, easing a rib or slipped, nothing runs
 * and the brake is asked for nothing.
 *
 * **The story between the ribs says its own words on the same knob**, to the
 * same seat, since all three are his thumb (`sim/spool-story.ts`): `RELEASE`
 * while the snag counts beats off the brake, then `HOLD` the moment the count
 * is made and a grip would free it; `HOLD DEEP` for the whip, whose depth is
 * the rail's own end and needs nobody to call it; and `HOLD` alone for the
 * fray, because how light is hers to say (§21, S3).
 */

type Ask = { readonly kind: BossCue["kind"]; readonly word: string; readonly seed: number };

/** The whip's and the fray's word, on the knob to the pilot. */
const STORY: Partial<Record<SpoolPhase, Ask>> = {
  whip: { kind: "CARRY", word: "HOLD DEEP", seed: 119 },
  fray: { kind: "CARRY", word: "HOLD", seed: 120 },
};
/** The snag's two: off the brake until the count is made, then back on it. */
const SNAG_OFF: Ask = { kind: "STILL", word: "RELEASE", seed: 116 };
const SNAG_ON: Ask = { kind: "CARRY", word: "HOLD", seed: 117 };
/** The movement's one word, while the line runs with no hand on it. */
const RUNNING: Ask = { kind: "CARRY", word: "HOLD", seed: 111 };

function askOf(world: World, s: SpoolState): Ask | null {
  if (s.phase === "snag") return s.runBeats >= world.cfg.spoolSnagBeats ? SNAG_ON : SNAG_OFF;
  return STORY[s.phase] ?? (spoolBrakeAsks(s) ? RUNNING : null);
}

export function spoolCues(
  l: Layout,
  world: World,
  s: SpoolState,
  beatPhase: number,
): readonly BossCue[] {
  const ask = askOf(world, s);
  if (ask === null) return [];
  const knob = spoolKnobCircle(l, world.cfg, s, world.beat, beatPhase);
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  return [{ seat: 1, ...ask, x: knob.x, y: knob.y, ...frame }];
}
