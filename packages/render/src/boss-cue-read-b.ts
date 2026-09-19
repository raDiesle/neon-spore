import {
  type TasterState,
  tasterBladeAt,
  tasterPhase,
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
 * THE TASTER. **The cannon's column is the question, and the answer is which
 * of three things a shot there does.**
 *
 * It shipped with `BURN` on a closed fan and `SHEAR` while one stood, and both
 * are right about the verb and silent about the lane. Every shot into this boss
 * is read off the column it leaves in (`tasterBladeAt`, `tasterStruck`), and
 * the three columns the crest has are three different fights:
 *
 * - **A standing blade**, which the colour it did *not* grow toward strikes
 *   off: `PRESS` / `SHEAR`.
 * - **The soft crest where one used to be**, which takes either colour and
 *   counts nothing on the balance sheet — and `tasterCrestCuts` of them cut it
 *   through for good, after which the fan can no longer re-edge (`tasterLift`).
 *   That is the answer to the third movement and the field said nothing about
 *   it at all: `PRESS` / `CUT`, which is the simulation's own word for it.
 * - **A blade still growing**, where the shot is simply spent — and spent is
 *   the trap, because the ledger counted the colour before the shot got here.
 *
 * **`MOVE` is his, and it is careful about the growing blade.** It stands while
 * the cannon is in a column nothing can be answered in *and* some other column
 * can — off the crest, or on a blade that has not decided. It does **not**
 * stand merely because his own blade is growing: that blade will stand in that
 * column, and a word that walked him off it would be THE CANDLE's defect a
 * fourth time (`boss-cue-read-m.ts`). At the top of the fight, with one blade
 * growing and nothing shorn, nothing can be answered anywhere and nothing is
 * said.
 *
 * **The mark is on the fan and never on a blade.** Which blade is not the
 * question — any standing one falls to the colour it did not grow toward — and
 * a frame around one of them would be the field answering *which*, which is the
 * pair's own sentence (`decisions.md` #34). `CUT` is the one exception and it is
 * not one: it stands on his **own column**, where the crest is already open and
 * his cannon is already parked, so it names nothing he is not looking at.
 *
 * **The colour is never said here at all**: `taster-read.ts` gives each seat its
 * half of that — his the blade coming next, hers the two counts — and the
 * colour the beam has to be is shown to neither (`tasterWeak`). The word is the
 * verb alone.
 *
 * Nothing in `out`, where the fan is unlocking outward and the wave is held
 * `tasterOutBeats` so it cannot end on the same beat.
 */
export function tasterCues(l: Layout, world: World, t: TasterState): readonly BossCue[] {
  const phase = tasterPhase(t, world.cfg);
  if (phase === "out") return [];
  const x = tileCX(l, t.col + (t.blades.length - 1) / 2);
  const y = tasterCrestY(l);
  const move = () => markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 43);
  const here = tasterBladeAt(t, world.cannonCol);
  if (phase === "closed") {
    // The interlock is over the whole body and the beam reaches it from any
    // column the crest spans, so the one wrong column is one off the crest.
    return here < 0 ? [move()] : [markAt(2, "HOLD", "BURN", x, y, l, 41, 2)];
  }
  const k = here < 0 ? undefined : t.blades[here];
  if (k?.shorn === true) return [markAt(2, "PRESS", "CUT", tileCX(l, world.cannonCol), y, l, 44)];
  if (k !== undefined && k.setBeat >= 0) return [markAt(2, "PRESS", "SHEAR", x, y, l, 42, 2)];
  const somewhere = t.blades.some((b) => b.shorn || b.setBeat >= 0);
  return somewhere ? [move()] : [];
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
