import {
  type LampreyState,
  lampreyAsks,
  lampreyFiring,
  lampreyHeadPull,
  lampreyHolder,
  lampreyTailHeld,
  lampreyTailPull,
  lampreyWorker,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import {
  lampreyGulletCircle,
  lampreyHeadCircle,
  lampreyTailCircle,
  lampreyToothCircle,
} from "./lamprey-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE LAMPREY is asking for**, page forty-five of the readings. Both
 * screens draw the one eel, its tail, its head and the lit tooth included
 * (`lamprey-draw.ts`), so nothing a word could stand on is a secret, and
 * `cueSeen` keeps each word to the seat it is for.
 *
 * **`HOLD` on the tail, to the holder**, while the thumb is not on it — THE
 * GOVERNOR's word for a hold (`boss-cue-read-zq.ts`). Over a tail already
 * held it could only say *keep going*.
 *
 * **`PULL UP` on the head, to the other seat**, in a `pull` or an `apart`,
 * until the head has started to come — a word that stood over a head
 * already moving would be the pull made for them. **`PULL` on the tail, to
 * the holder**, in an `apart`, the same way: the channel says which way.
 *
 * **`TAP` on the lit tooth, to the other seat**, in a `teeth`, for the whole
 * of the stay: each tooth gets its own seed, because the light jumps two
 * places round the ring after a crack.
 *
 * **`FIRE` at the hull under the eel's column while the gullet is lit**, to
 * either seat. The gullet's colour is never named. Nothing is said while the
 * eel swims in, leaps, recoils or is spent. **It rings the gullet** where it
 * rears (`lampreyGulletCircle`).
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
    const x = fieldX(l, s.col);
    const aim = lampreyGulletCircle(l, cfg, s, world.beat, beatPhase);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 220 }];
  }
  const out: BossCue[] = [];
  const ask = lampreyAsks(s);
  const holder = lampreyHolder(s);
  const worker = lampreyWorker(s);
  const tail = lampreyTailCircle(l, cfg, s);
  if (holder !== null && tail !== null) {
    if (ask === "apart" && lampreyTailPull(s) === 0) {
      out.push({
        seat: holder,
        kind: "CARRY",
        word: "PULL",
        x: tail.x,
        y: tail.y,
        ...frame,
        seed: 229,
      });
    } else if (ask !== "apart" && !lampreyTailHeld(s)) {
      out.push({
        seat: holder,
        kind: "HOLD",
        word: "HOLD",
        x: tail.x,
        y: tail.y,
        ...frame,
        seed: 221,
      });
    }
  }
  const head = lampreyHeadCircle(l, cfg, s);
  if (worker !== null && head !== null && lampreyHeadPull(s) === 0) {
    const at = { x: head.x, y: head.y };
    out.push({ seat: worker, kind: "CARRY", word: "PULL UP", ...at, ...frame, seed: 231 });
  }
  const tooth = lampreyToothCircle(l, cfg, s, world.beat, beatPhase);
  if (worker !== null && tooth !== null) {
    const seed = 222 + s.litTooth;
    out.push({ seat: worker, kind: "PRESS", word: "TAP", x: tooth.x, y: tooth.y, ...frame, seed });
  }
  return out;
}
