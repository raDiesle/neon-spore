import {
  type GovernorState,
  governorChordWhole,
  governorFiring,
  governorGovernor,
  governorTapper,
  midCol,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import { governorHubCircle, governorTapCircle, governorYokeCircle } from "./governor-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GOVERNOR is asking for**, page forty-three of the readings.
 * Both screens draw the one governor, the lit mark, the yoke and the hub
 * included (`governor-draw.ts`), so nothing a word could stand on is a
 * secret, and `cueSeen` keeps each word to the seat it is for.
 *
 * **`HOLD` on the brake drum, to the braking seat**, while its chord is not
 * whole. THE TRIVET's word (`boss-cue-read-zh.ts`), and it goes for THE
 * TRIVET's reason: over a chord already held it could only say *keep going*,
 * and the flyweights sinking already say that. A pad lifted mid-step brings
 * the word back.
 *
 * **`TAP` on the lit mark, to the tapper**, for the whole step and not only
 * while the needle is on it: a word that came and went each lap would be
 * the tap made for them. The mark stays where it is while the needle sweeps,
 * so the word holds still. Each step gets its own seed, because the next
 * step's mark is somewhere else on the track.
 *
 * **`FIRE` at the hull under the middle column while the hub is lit**, to
 * either seat. The step's colour is never named. Nothing is said between
 * steps. **It rings the hub** at the dial's middle (`governorHubCircle`).
 */

export function governorCues(
  l: Layout,
  world: World,
  s: GovernorState,
  beatPhase: number,
): readonly BossCue[] {
  const cfg: SimConfig = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  if (governorFiring(s)) {
    const x = fieldX(l, midCol(cfg));
    const aim = governorHubCircle(l, cfg, s, world.beat, beatPhase);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 189 }];
  }
  const out: BossCue[] = [];
  const governor = governorGovernor(s);
  if (governor !== null && !governorChordWhole(s, governor === 1 ? 0 : 1)) {
    const at = governorYokeCircle(l, cfg, s, world.beat, beatPhase);
    out.push({
      seat: governor,
      kind: "HOLD",
      word: "HOLD",
      x: at.x,
      y: at.y,
      ...frame,
      seed: 188,
      chord: true,
    });
  }
  const tapper = governorTapper(s);
  const mark = governorTapCircle(l, cfg, s, world.beat, beatPhase);
  if (tapper !== null && mark !== null) {
    const seed = 190 + s.cursor;
    out.push({ seat: tapper, kind: "PRESS", word: "TAP", x: mark.x, y: mark.y, ...frame, seed });
  }
  return out;
}
