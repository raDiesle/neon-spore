import {
  type TrapezeState,
  trapezeCaller,
  trapezeLitStep,
  trapezeLocked,
  trapezeOpenZone,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { type Layout, tileCX } from "./layout.js";
import { trapezeAlienCircle, trapezeZoneCircle } from "./trapeze-grip.js";

/**
 * **What THE TRAPEZE is asking for**: page forty of the readings. Both screens
 * draw the swing, the zones and the gong (`trapeze-draw.ts`), so nothing a
 * word could stand on is a secret, and `cueSeen` keeps each word to the thumb
 * that can act on it. The words stand on the places the grips are pressed
 * (`trapeze-grip.ts`).
 *
 * **`SWIPE` in the open zone, to the seat that pushes there**, while the
 * swing comes back over it. The zone's own chevrons say which way; the word
 * says what. It is gone the moment the swing turns away, which is what
 * *when* is in this fight — the owner, 7 October 2026: *I don't understand
 * when I have to do what*.
 *
 * **`TAP` on the alien, to the pilot, in a lock level** until the cannon is
 * locked; then **`FIRE` at the hull, to both**, as every boss's shot is said
 * — the pilot's cannon and the navigator's trigger. In a shot level from
 * below, **`FIRE`** all level long: when to fire is the swing coming back,
 * the pair's to call. The crosshair rides the alien.
 * Nothing is said between levels.
 */
export function trapezeCues(l: Layout, world: World, s: TrapezeState): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = trapezeLitStep(s);
  if (step === null) return [];
  const cfg = world.cfg;
  const alien = trapezeAlienCircle(l, cfg, s);
  if (step.ask === "push" || step.ask === "call") {
    const zone = trapezeOpenZone(cfg, s);
    if (zone === 0) return [];
    const at = trapezeZoneCircle(l, cfg, s, zone);
    if (at === null) return [];
    const seat = trapezeCaller(s, zone) === 0 ? 1 : 2;
    return [{ seat, kind: "CARRY", word: "SWIPE", x: at.x, y: at.y, ...frame, seed: 165 }];
  }
  if (step.ask === "lock" && !trapezeLocked(s))
    return [{ seat: 1, kind: "PRESS", word: "TAP", x: alien.x, y: alien.y, ...frame, seed: 166 }];
  const x = tileCX(l, world.cannonCol);
  return [
    { seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim: alien, seed: 164 },
  ];
}
