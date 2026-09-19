import {
  type LedgerState,
  ledgerNext,
  ledgerPhase,
  ledgerSeamCol,
  priming,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import {
  ledgerBeadU,
  ledgerBodyY,
  ledgerCordAt,
  ledgerRootPoint,
  ledgerSeamX,
  ledgerSocketPoint,
  ledgerTaut,
} from "./ledger-shape.js";

/**
 * **What THE LEDGER is asking for** — page fifteen of the readings, and its own
 * page for the reason THE THROAT and THE ORRERY have theirs: page three was at
 * 198 lines of its 250 with four fights on it, and this one's reading grew a
 * movement.
 *
 * It said `GUARD` on the return coming down and `MOVE` on the walked socket,
 * which is the half of this fight that happens **after** a shot. What neither
 * word said is where the shot goes, and this is the fourth boss in a row whose
 * field never named the column a bolt is spent in (`boss-cue-read-n.ts`,
 * `boss-cue-read.ts`, `boss-cue-read-b.ts`).
 *
 * **The seam is one column of eleven, and the plating refuses the rest.** A
 * bolt leaves the cannon's own column (`fire.ts`), only `ledgerSeamCol` hurts
 * the body, and the two columns either side of it are the body's own plating —
 * `ledgerCovers` turns a bolt away there with no colour cost and no bill, so a
 * pair aiming at the silhouette rather than at its middle gets a refusal that
 * looks exactly like a colour mistake (`ledgerRefused`). The guide's first
 * line for the pilot was *stand the cannon on the middle column* and nothing on
 * the field said it.
 *
 * **The colour is never said**, and it does not need to be: the seam wears it
 * on the body, on both screens, which is the one fact of this fight neither
 * seat is denied. `FIRE` is the press alone.
 *
 * **Three silences, and the first two are this fight's whole design.**
 *
 * - **The last return.** `ledgerLetThrough` is the one bill the pair must
 *   *not* answer, and a field that said so would take the payoff of the whole
 *   encounter and hand it over in a word. Nothing is drawn from the beat that
 *   bead goes on the cord, `GUARD` and both `MOVE`s included: a word about the
 *   socket while the plate is meant to be leaving it is worse than none.
 * - **The seam, from `ledgerWhipSeam` hits on.** From there the cord bills
 *   *everything the cannon does* (`ledgerBills`) and a warded return is thrown
 *   back up into the seam for free (`ledger-step.ts`'s `ward`), so whether to
 *   spend a shot on the body at all is the question the design put in step 8
 *   and the pair's own to answer. `FIRE` goes quiet there and the two words
 *   left are the ones about the return they have already earned. In `paying` it
 *   stands, because a shot at the seam is free of any bill and is the only
 *   thing that moves the fight.
 * - **While a colour is held.** `gripBrakes`' rule, and THE CANDLE's
 *   (`boss-cue-read-m.ts`): a word over something already being answered
 *   teaches the pair to stop reading the words.
 *
 * And nothing in `rooting`, where the cord is still going in and the body
 * cannot be hurt, nor in `out`, where the halves are parting and the wave is
 * held `ledgerOutBeats` so it cannot end on the same beat.
 *
 * **Every mark is on the half of the picture its own seat holds.** `GUARD`
 * rides the bead, which is the pilot's (`showsLedgerBead`); the socket's `MOVE`
 * stands in the hole, which is the navigator's (`showsLedgerSocket`); the
 * cannon's `MOVE` stands on the cannon, which is his alone (`showsCannon`);
 * and `FIRE` stands on the seam, which is the body and is drawn to both. *His
 * clock, her column* is the design's sentence for this fight, and the two new
 * words do not cross it (`view-role-clocks.ts`).
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
 * THE LEDGER. **A return on the cord is answered; an empty cord is owed a
 * shot**, and the two never stand at once.
 *
 * The forced order is the fight — *act, consequence, answer the consequence,
 * act again* — so the cord's own state is the whole of what decides which pair
 * of words is said. While a bead is coming down, the pair's hands are spoken
 * for: hers on the plate in the socket's column, his on the trigger on the
 * beat it lands. While the cord is empty nothing is coming, and what the fight
 * wants is the next hit — so the column comes first and the press follows it,
 * THE CANDLE's and THE THROAT's pairing, one gesture across two seats.
 */
export function ledgerCues(
  l: Layout,
  world: World,
  t: LedgerState,
  beatPhase: number,
): readonly BossCue[] {
  const cfg = world.cfg;
  const phase = ledgerPhase(t, cfg, world.beat);
  if (phase === "out" || phase === "rooting") return [];
  const next = ledgerNext(t);
  if (next?.last === true) return [];
  if (next !== null) {
    const out: BossCue[] = [];
    if (world.shieldCol !== t.socket) {
      const at = ledgerSocketPoint(l, t);
      out.push(markAt(2, "CARRY", "MOVE", at.x, at.y, l, 52));
    }
    const from = ledgerRootPoint(l, cfg, t);
    const to = ledgerSocketPoint(l, t);
    const u = ledgerBeadU(next, world.beat, beatPhase);
    const bead = ledgerCordAt(l, from, to, ledgerTaut(cfg, t), 0, u);
    out.push(markAt(1, "PRESS", "GUARD", bead.x, bead.y, l, 53));
    return out;
  }
  if (phase !== "paying") return [];
  const seam = ledgerSeamCol(t, cfg);
  if (world.cannonCol !== seam) {
    return [markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 91)];
  }
  if (priming(world)) return [];
  return [markAt(2, "PRESS", "FIRE", ledgerSeamX(l, cfg, t), ledgerBodyY(l).mid, l, 92)];
}
