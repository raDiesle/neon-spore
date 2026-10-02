import {
  type LampreyState,
  lampreyFiring,
  lampreyHeld,
  lampreyPinner,
  lampreyTapper,
  midCol,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import { lampreyGulletCircle, lampreyJawCircle, lampreyToothCircle } from "./lamprey-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE LAMPREY is asking for**, page forty-five of the readings. Both
 * screens draw the one eel, the jaw's band and the lit tooth included
 * (`lamprey-draw.ts`), so nothing a word could stand on is a secret, and
 * `cueSeen` keeps each word to the seat it is for.
 *
 * **`HOLD` on the jaw's band, to the pinner**, while the thumb is not on it
 * — THE GOVERNOR's word for a hold (`boss-cue-read-zq.ts`). Over a jaw
 * already held it could only say *keep going*, and the scar not deepening
 * already says that; a thumb that lags past the grip brings the word back,
 * standing where the jaw has crawled to.
 *
 * **`TAP` on the lit tooth, to the tapper**, for the whole of its window: a
 * word that waited for the thumb to come near would be the tap made for
 * them. Each tooth gets its own seed, because the light jumps two places
 * round the ring after a crack.
 *
 * **`FIRE` at the hull under the middle column while the gullet is lit**, to
 * either seat. The gullet's colour is never named. Nothing is said while the
 * eel swims in, pulls loose, recoils or is spent. **It rings the gullet**
 * where it rears (`lampreyGulletCircle`).
 */
export function lampreyCues(
  l: Layout,
  world: World,
  s: LampreyState,
  beatPhase: number,
): readonly BossCue[] {
  const cfg = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  if (lampreyFiring(s)) {
    const x = fieldX(l, midCol(cfg));
    const aim = lampreyGulletCircle(l, cfg, s, world.beat, beatPhase);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 220 }];
  }
  const out: BossCue[] = [];
  const pinner = lampreyPinner(s);
  const jaw = lampreyJawCircle(l, cfg, s, world.beat, beatPhase);
  if (pinner !== null && jaw !== null && !lampreyHeld(world, s)) {
    out.push({ seat: pinner, kind: "HOLD", word: "HOLD", x: jaw.x, y: jaw.y, ...frame, seed: 221 });
  }
  const tapper = lampreyTapper(s);
  const tooth = lampreyToothCircle(l, cfg, s, world.beat, beatPhase);
  if (tapper !== null && tooth !== null) {
    const seed = 222 + s.litTooth;
    out.push({ seat: tapper, kind: "PRESS", word: "TAP", x: tooth.x, y: tooth.y, ...frame, seed });
  }
  return out;
}
