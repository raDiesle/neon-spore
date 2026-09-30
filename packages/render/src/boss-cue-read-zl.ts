import {
  type CapstanState,
  capstanBand,
  capstanFace,
  capstanLitStep,
  capstanSteerer,
  capstanWearer,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import { capstanCoreStanding, capstanRubStanding, capstanSteerStanding } from "./capstan-grip.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE CAPSTAN is asking for** — page thirty-eight of the readings,
 * THE HALTER's (`boss-cue-read-zk.ts`) with a pull in front of the hands.
 * Both screens draw the whole drum, so the word is what keeps the two jobs
 * apart: one seat pulls the drum round, the other rubs.
 *
 * **`PULL` on the drum's middle, to the seat that steers**: the pilot on a
 * left band, the navigator on a right. The middle because that is where a
 * press takes the pull (`capstanSteerUnder`); the horn the band asks toward
 * is inside an end's rub zone, and a thumb put down on a word there was
 * handed a rub. Which way to carry is the arrow's, on that horn
 * (`capstan-marks.ts`). It goes once that band's face is bared — a word over
 * a pull held could only say *keep going* — and a pull let go is owed it
 * again. **`RUB` on the bared face, to the other
 * seat**, from the moment it is round: the seat the pull is not asked of is
 * the only one whose reversals wear (`capstan-hand.ts`).
 *
 * **A hold** may be steered by either seat, and which one is the pair's to
 * settle out loud, so until somebody pulls past the mark `PULL` goes to both; after, `RUB` on whichever face that pull bared, to
 * the seat that is not pulling.
 *
 * **`FIRE` at the hull under the middle column** on a shot with the core
 * bared, to either seat. The step's colour is never named — the core is lit
 * in it, on both screens. Nothing is said between steps. **It rings the
 * core** at the drum's middle (`capstanCoreStanding`).
 */

export function capstanCues(
  l: Layout,
  world: World,
  s: CapstanState,
  beatPhase: number,
): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = capstanLitStep(s);
  if (step === null) return [];
  if (step.ask === "fire") {
    if (!s.bared) return [];
    const x = fieldX(l, midCol(world.cfg));
    const aim = capstanCoreStanding(l, world.cfg, s, world.beat, beatPhase);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 159 }];
  }
  const cfg = world.cfg;
  const face = capstanFace(world, s);
  const band = capstanBand(s);
  if (face === null || (band !== null && face !== band)) {
    const at = capstanSteerStanding(l, cfg, s, world.beat, beatPhase);
    const seat = band === null ? null : capstanSteerer(world, s);
    return [{ seat, kind: "CARRY", word: "PULL", x: at.x, y: at.y, ...frame, seed: 160 }];
  }
  const at = capstanRubStanding(l, cfg, s, world.beat, beatPhase);
  const seat = capstanWearer(world, s);
  return [{ seat, kind: "CARRY", word: "RUB", x: at.x, y: at.y, ...frame, seed: 161 }];
}
