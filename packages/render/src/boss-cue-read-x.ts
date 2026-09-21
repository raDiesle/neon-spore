import { type VaneState, vaneOpen, vaneSplitCol, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import {
  vaneArmCircle,
  vaneArmGrippable,
  vaneBearingY,
  vaneHousingCircle,
  vaneHousingGrippable,
} from "./vane-grip.js";

/**
 * **What THE VANE is asking for** — page twenty-four, and its own, because
 * this boss says four words now and page two was written to be read in one
 * sitting. It was the third reading on that page from 18 September 2026 until
 * its arm and its housing were given something to take hold of.
 *
 * Every rule is `boss-cue.ts`'s, and the one doing the most work here is *a
 * cue is drawn on the seat that can act*: this fight alternates between the
 * two seats beat by beat, so a cue on the wrong phone is the fight telling the
 * pilot to do the navigator's job on the one beat she is waiting to be told to
 * do it.
 */

/** THE CHOIR's frame, in tiles: the size of this mark wherever it stands. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

/**
 * THE VANE. Two words in the window at each end of the sweep, one per seat,
 * and **nothing whatever about the fold**.
 *
 * The fold is the fight: an arrival crossing the arm comes out as far the
 * other side of it as it went in, so the column the radar announces is not the
 * column it lands in, and the pair has to say one named against the arm rather
 * than against the grid. A cue that marked a folded body, or the column it
 * came out in, would do that arithmetic for them — it is the answer in the
 * purest form this game has, and #34's second rule is the whole of why there
 * is no third word here. The throw's own streak already draws where a body
 * went (`vane-draw.ts`), which is the picture, not the sentence.
 *
 * **What is left is the shot at the bearing**, which is an ordinary two-seat
 * gesture with a narrow window:
 *
 * - `CARRY` / `MOVE` on the cannon where it stands, the pilot's, while the
 *   housing is split and he is not under it. On the cannon and never on the
 *   mouth: the mark is on the thing that moves, and the mouth is drawn on both
 *   screens in the colour it will take anyway. It goes out when he arrives.
 * - `PRESS` / `FIRE` on the mouth of the split, the navigator's, for as long
 *   as the opening stands unspent. Not *once the cannon is under it*: the
 *   cannon is not drawn on her screen (`showsCannon`), so a word that waited
 *   for it would hand her the one thing he has to say out loud.
 *
 * Nothing says the colour — the housing has worn it since the arm stopped, on
 * both screens — and nothing says the column is blocked. A shot stops at the
 * first body in its way, which is the boss defending itself with what it
 * threw, and it is the film's remaining page about her half that says so.
 *
 * **Every rule here is called rather than written out a second time**: whether
 * the housing is open is `vaneOpen`'s answer and which column it is on is
 * `vaneSplitCol`'s, and both of those read a phase — the cycle's own ends under
 * SWING, the pilot's pinned arm from VEER (`sim/test/purity.test.ts`). It took
 * no `VaneState` at all until 18 September 2026, when the second of those
 * started needing one.
 */
export function vaneCues(l: Layout, world: World): readonly BossCue[] {
  const b = world.boss;
  if (b === null || b.kind !== "vane") return [];
  // **The hands first, and outside the `vaneOpen` gate.** From VEER the housing
  // stops splitting on the cycle's clock and splits where the arm was stopped,
  // so a wave with no pin in it has no opening at all — and a reading that had
  // asked `vaneOpen` before saying so would go silent on exactly the beat the
  // pair most needs telling what to do.
  const out: BossCue[] = handCues(l, world, b);
  if (!vaneOpen(world)) return out;
  // `vaneSplitCol` and not `vaneWeakCol`: from VEER the housing splits under
  // the pilot's thumb rather than at the ends of the sweep, and the cycle's own
  // answer is -1 there — which would take the two words off the field for two
  // thirds of the fight (`sim/vane-open.ts`, `docs/spec/bosses.md` §11.5).
  const weak = vaneSplitCol(world, b);
  if (weak === -1) return out;
  if (world.cannonCol !== weak) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 73));
  }
  out.push(markAt(2, "PRESS", "FIRE", tileCX(l, weak), vaneBearingY(l), l, 74));
  return out;
}

/**
 * THE VANE's two hands: `HOLD` / `PIN` on the arm, the pilot's, and `CARRY` /
 * `HAUL` on the housing, the navigator's.
 *
 * **Each stands on its own ring** (`vane-grip.ts`), and the gate is that file's
 * own — a word offered where the handle is not drawn, or on a beat the rule
 * would refuse, is the defect the whole lane exists to stop. The arm's mark
 * travels with it, read at the beat and not between two, because a cue is a
 * reading of `World` and a mark that slid under a thumb would be the arm's
 * movement said twice.
 *
 * `PIN` is his because only seat 1 is heard on the arm, and `HAUL` hers for
 * the same reason (`sim/vane-hand.ts`). Neither says a column: where the arm
 * stops is the fold line the pair has to name out loud, and a field that
 * marked a good column would be the answer itself (`decisions.md` #34).
 */
function handCues(l: Layout, world: World, b: VaneState): BossCue[] {
  const { cfg, beat, waveBeat } = world;
  const out: BossCue[] = [];
  if (vaneArmGrippable(cfg, b, beat)) {
    const arm = vaneArmCircle(l, cfg, b, beat, waveBeat, 0);
    out.push(markAt(1, "HOLD", "PIN", arm.x, arm.y, l, 75));
  }
  if (vaneHousingGrippable(cfg, b, beat)) {
    const h = vaneHousingCircle(l, cfg);
    out.push(markAt(2, "CARRY", "HAUL", h.x, h.y, l, 76));
  }
  return out;
}
