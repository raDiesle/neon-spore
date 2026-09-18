import {
  type TasterState,
  tasterPhase,
  tasterStanding,
  vaneOpen,
  vaneSplitCol,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import { tasterCrestY } from "./taster-draw.js";
import { vaneBearingY } from "./vane-draw.js";

/**
 * **What THE TASTER and THE VANE are asking for** — page two of the readings,
 * on the seam `boss-draw-clocks-b.ts` draws for the same reason: this is the
 * half of the list that grows, and the file next door was written to be read
 * in one sitting.
 *
 * Every rule is `boss-cue.ts`'s. The one that does the most work in this
 * file is *a cue is drawn on the seat that can act*: both of these fights
 * alternate between the two seats beat by beat, so a cue on the wrong phone
 * is not merely noise — it is the fight telling the pilot to do the
 * navigator's job on the one beat she is waiting to be told to do it.
 *
 * **THE VANE is the third and came later** (18 September 2026), on this page
 * because it is where the room was and because its window alternates the same
 * way: the bearing is shut for the whole of a sweep and open for the whole of
 * a hold, and both seats act inside the hold or neither does.
 *
 * **THE BATON was the fourth and has gone** to page nine
 * (`boss-cue-read-i.ts`): it says a word in three of its four stages now, and
 * the reading of it outgrew a share of a page. **THE UNDERTOW was the second
 * and has gone the same way**, to page ten (`boss-cue-read-j.ts`), on the day
 * it learnt to say a word in each of its five phases.
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
  wide = 1,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W * wide, halfH: l.tile * HALF_H, seed };
}

/**
 * THE TASTER. One word while the fan stands and another once it has closed,
 * and both are the navigator's: she chooses the colour, fires it and holds it
 * to fill the lance, which are the only three things this boss answers.
 *
 * **The mark is on the fan and never on a blade.** Which blade is not the
 * question — any standing one falls to the colour it did not grow toward —
 * and a frame around one of them would be the field answering *which*, which
 * is the pair's own sentence (`decisions.md` #34). The colour is never said
 * here at all: `taster-read.ts` gives each seat its half of that, and the
 * word is the verb alone.
 */
export function tasterCues(l: Layout, world: World, t: TasterState): readonly BossCue[] {
  const phase = tasterPhase(t, world.cfg);
  if (phase === "out") return [];
  const x = tileCX(l, t.col + (t.blades.length - 1) / 2);
  const y = tasterCrestY(l);
  if (phase === "closed") return [markAt(2, "HOLD", "BURN", x, y, l, 41, 2)];
  if (tasterStanding(t) === 0) return [];
  return [markAt(2, "PRESS", "SHEAR", x, y, l, 42, 2)];
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
  if (b === null || b.kind !== "vane" || !vaneOpen(world)) return [];
  // `vaneSplitCol` and not `vaneWeakCol`: from VEER the housing splits under
  // the pilot's thumb rather than at the ends of the sweep, and the cycle's own
  // answer is -1 there — which would take the two words off the field for two
  // thirds of the fight (`sim/vane-open.ts`, `docs/spec/bosses.md` §11.5).
  const weak = vaneSplitCol(world, b);
  if (weak === -1) return [];
  const out: BossCue[] = [];
  if (world.cannonCol !== weak) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 73));
  }
  out.push(markAt(2, "PRESS", "FIRE", tileCX(l, weak), vaneBearingY(l), l, 74));
  return out;
}
