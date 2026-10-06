import {
  type GovernorState,
  governorFiring,
  midCol,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import { governorNeedleCircle, governorTapCircle } from "./governor-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GOVERNOR is asking for**, page forty-three of the readings.
 * Both screens draw the one governor, every mark and the hub included
 * (`governor-draw.ts`), so nothing a word could stand on is a secret, and
 * `cueSeen` keeps each word to the seat it is for.
 *
 * **`TAP` on each seat's open mark, to that seat**, for the whole step and
 * not only while the needle is on it: a word that came and went each lap
 * would be the tap made for them. The mark stays where it is while the
 * needle sweeps, so the word holds still. On an ordered step only the next
 * mark is open, so only its seat is told, and the word moves on as each is
 * landed. Each mark gets its own seed. **It wears the thumbprint, not the
 * scan box** (`BossCue.print`) — the owner, 6 October 2026: *instead of tap
 * scanner square box use the thumb control visual.*
 *
 * **`FIRE` at the hull under the middle column while the hub is lit**, to
 * either seat. The step's colour is never named. Nothing is said between
 * steps. **Its crosshair rides the needle's tip** (`governorNeedleCircle`),
 * drawn `lead` ticks ahead as the needle is: the shot is aimed by the needle,
 * and fired as the crosshair crosses the cannon's column.
 */

export function governorCues(
  l: Layout,
  world: World,
  s: GovernorState,
  beatPhase: number,
  lead = 0,
): readonly BossCue[] {
  const cfg: SimConfig = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  if (governorFiring(s)) {
    const x = fieldX(l, midCol(cfg));
    const aim = governorNeedleCircle(l, world, s, beatPhase, lead);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 189 }];
  }
  const out: BossCue[] = [];
  for (const seat of [1, 2] as const) {
    const mark = governorTapCircle(l, cfg, s, world.beat, beatPhase, seat);
    if (mark === null) continue;
    const seed = 190 + s.cursor * 2 + seat;
    const at = { x: mark.x, y: mark.y };
    out.push({ seat, kind: "PRESS", word: "TAP", ...at, ...frame, print: true, seed });
  }
  return out;
}
