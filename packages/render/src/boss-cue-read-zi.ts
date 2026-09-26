import {
  type CystState,
  cystClosed,
  cystFreezer,
  cystLitStep,
  cystPincher,
  cystSide,
  cystStepCol,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cystStanding } from "./cyst-grip.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE CYST is asking for** — page thirty-five of the readings, THE
 * VISE's page (`boss-cue-read-zf.ts`) with a tap put in front of the pinch.
 * Both seats are shown the whole sac (`cyst-draw.ts`), so `cueSeen` only
 * keeps each word to the thumb that can act on it.
 *
 * **A flank step is two words, one after the other.** While it is lit,
 * `TAP` on its freeze mark, to the seat that taps it still — the partner of
 * the one who pinches it (`cyst-grip.ts`); once it is stilled, `SHUT` on the
 * flank, to the pincher, gone while the flank is held under the shut line and
 * owed again the moment it is let go. So each seat is shown only its own half
 * of the step, and the other half is what it has to hear.
 *
 * **A swell is `SHUT` on both flanks**, to both seats, each gone while its
 * own is held.
 *
 * **`FIRE` at the hull under the middle column while the core is bared and
 * lit**, to either seat; the core is lit in the colour it wants and the word
 * never names one. **A spore is `SHIELD` under its column; a bud is `FIRE`
 * under its**, as THE VISE's spit and THE RIME's icicle are.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function cystCues(
  l: Layout,
  world: World,
  s: CystState,
  beatPhase: number,
): readonly BossCue[] {
  const step = cystLitStep(s);
  if (step === null) return [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const mid = midCol(world.cfg);
  const hull = (word: "FIRE" | "SHIELD", col: number, seed: number): BossCue => ({
    seat: null,
    kind: "PRESS",
    word,
    x: fieldX(l, col),
    y: l.hullY,
    ...frame,
    seed,
  });
  if (step.ask === "fire") return s.bared ? [hull("FIRE", mid, 145)] : [];
  if (step.ask === "spit") return [hull("SHIELD", cystStepCol(mid, step), 146)];
  if (step.ask === "bud") return [hull("FIRE", cystStepCol(mid, step), 147)];
  const shut = world.cfg.cystShutMilli;
  if (step.ask === "swell") {
    const out: BossCue[] = [];
    for (const side of [0, 1] as const) {
      if (s.gapMilli[side] <= shut) continue;
      const at = cystStanding(l, world, s, "flank", side, beatPhase);
      const seat = cystPincher(side);
      out.push({ seat, kind: "HOLD", word: "SHUT", x: at.x, y: at.y, ...frame, seed: 148 + side });
    }
    return out;
  }
  const side = cystSide(s);
  if (side === null) return [];
  if (s.phase === "lit") {
    const at = cystStanding(l, world, s, "mark", side, beatPhase);
    const seat = cystFreezer(side);
    return [{ seat, kind: "PRESS", word: "TAP", x: at.x, y: at.y, ...frame, seed: 150 }];
  }
  if (cystClosed(world, s)) return [];
  const at = cystStanding(l, world, s, "flank", side, beatPhase);
  const seat = cystPincher(side);
  return [{ seat, kind: "HOLD", word: "SHUT", x: at.x, y: at.y, ...frame, seed: 151 }];
}
