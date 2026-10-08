import {
  type BastionState,
  bastionFrontGun,
  bastionGunAngle,
  bastionLitStep,
  bastionNext,
  bastionPieceCol,
  bastionPieceCount,
  bastionPlateOf,
  bastionTarget,
  midCol,
  type World,
} from "@neon-spore/sim";
import {
  bastionKnobAt,
  bastionMarkPlayer,
  bastionMarkTakes,
  bastionRimKnob,
} from "./bastion-grip.js";
import { bastionCentre, bastionGunAt, bastionPortAt } from "./bastion-shape.js";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE BASTION is asking for**, page forty-eight of the readings, a
 * word for each shell's job. Both screens draw the one moon and every knob
 * (`bastion-draw.ts`), the ports alone shown to the navigator.
 *
 * - **The armour: `PULL`** on each side's slab knob, to that side's seat,
 *   until a thumb is on it — a word over a knob being carried would be the
 *   pull made for them.
 * - **The gun ring: `TURN`** on the rim, to the pilot, while no gun stands at
 *   the front and his thumb is off it; **`FIRE`** at the hull under the
 *   middle column once one does, to either seat, aimed at the gun. Its
 *   colour is never named: the gun wears it, and which cannon is that colour
 *   is the conversation.
 * - **The cage: `SHIELD`** at the hull under the node charging, to either
 *   seat — the node lit on both screens is the whole of the tell.
 * - **The hull: `FIRE`** under the open port, aimed at it, **to the
 *   navigator alone**: the pilot is not shown the port, and its column is
 *   what she has to say.
 *
 * Nothing while the moon comes in, sheds or grows a shell back. A word on
 * a new piece is a new word, by its seed: the next slab, node or port is
 * not the last one moved.
 */
export function bastionCues(l: Layout, world: World, s: BastionState): readonly BossCue[] {
  const step = bastionLitStep(s);
  if (step === null) return [];
  const cfg = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const out: BossCue[] = [];
  if (step.layer === "plates") {
    for (const side of [0, 1] as const) {
      if (!bastionMarkTakes(s, side) || s.down[side]) continue;
      const at = bastionKnobAt(l, cfg, s, side);
      const seat = bastionMarkPlayer(side);
      const seed = 2500 + bastionPlateOf(s, side);
      out.push({ seat, kind: "CARRY", word: "PULL", x: at.x, y: at.y, ...frame, seed });
    }
    return out;
  }
  const c = bastionCentre(l, cfg);
  if (step.layer === "ring") {
    const front = bastionFrontGun(world, s);
    if (front < 0) {
      if (s.spinning) return out;
      const at = bastionRimKnob(l, cfg, s);
      out.push({ seat: 1, kind: "TURN", word: "TURN", x: at.x, y: at.y, ...frame, seed: 252 });
      return out;
    }
    const aim = bastionGunAt(l, c, bastionGunAngle(s, front, bastionPieceCount(step)));
    const x = fieldX(l, midCol(cfg));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 253 });
    return out;
  }
  const next = bastionNext(s);
  if (next < 0) return out;
  const col = bastionPieceCol(world, s, next);
  if (step.layer === "lattice") {
    if (s.dischargeBeat < 0) return out;
    const x = fieldX(l, col);
    const seed = 2540 + next;
    out.push({ seat: null, kind: "PRESS", word: "SHIELD", x, y: l.hullY, ...frame, seed });
    return out;
  }
  if (bastionTarget(world) === null) return out;
  const aim = bastionPortAt(l, cfg, c, col - midCol(cfg));
  const x = fieldX(l, col);
  const seed = 2550 + next;
  out.push({ seat: 2, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed });
  return out;
}
