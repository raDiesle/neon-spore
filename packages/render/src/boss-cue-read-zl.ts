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
import { capstanRubStanding, capstanScreenAt } from "./capstan-grip.js";
import { capstanHornAt } from "./capstan-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE CAPSTAN is asking for** — page thirty-eight of the readings,
 * THE HALTER's (`boss-cue-read-zk.ts`) with a pull in front of the hands.
 * Both screens draw the whole drum, so the word is what keeps the two jobs
 * apart: one seat pulls the drum round, the other rubs.
 *
 * **`PULL` at the horn the band asks toward, to the seat that steers**: the
 * pilot on a left band, the navigator on a right. It goes once that band's
 * face is bared — a word over a pull held could only say *keep going* — and
 * a pull let go is owed it again. **`RUB` on the bared face, to the other
 * seat**, from the moment it is round: the seat the pull is not asked of is
 * the only one whose reversals wear (`capstan-hand.ts`).
 *
 * **A hold** may be steered by either seat, and which one is the pair's to
 * settle out loud, so until somebody pulls past the mark `PULL` stands on the
 * drum's middle for both; after, `RUB` on whichever face that pull bared, to
 * the seat that is not pulling.
 *
 * **`FIRE` at the hull under the middle column** on a shot with the core
 * bared, to either seat. The step's colour is never named — the core is lit
 * in it, on both screens. Nothing is said between steps.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function capstanCues(
  l: Layout,
  world: World,
  s: CapstanState,
  beatPhase: number,
): readonly BossCue[] {
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const step = capstanLitStep(s);
  if (step === null) return [];
  if (step.ask === "fire") {
    if (!s.bared) return [];
    const x = fieldX(l, midCol(world.cfg));
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 159 }];
  }
  const cfg = world.cfg;
  const face = capstanFace(world, s);
  const band = capstanBand(s);
  if (face === null || (band !== null && face !== band)) {
    const horn = band === null ? { x: 0, y: 0 } : capstanHornAt(l, band);
    const at = capstanScreenAt(l, cfg, s, horn, world.beat, beatPhase);
    const seat = band === null ? null : capstanSteerer(world, s);
    return [{ seat, kind: "CARRY", word: "PULL", x: at.x, y: at.y, ...frame, seed: 160 }];
  }
  const at = capstanRubStanding(l, cfg, s, world.beat, beatPhase);
  const seat = capstanWearer(world, s);
  return [{ seat, kind: "CARRY", word: "RUB", x: at.x, y: at.y, ...frame, seed: 161 }];
}
