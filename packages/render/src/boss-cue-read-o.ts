import {
  type LedgerBead,
  type LedgerState,
  ledgerNext,
  ledgerPhase,
  ledgerPullable,
  ledgerSeamCol,
  priming,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { DIAL_RADII, handleRadius } from "./handle-draw.js";
import { type Layout, tileCX } from "./layout.js";
import {
  ledgerBeadU,
  ledgerBodyY,
  ledgerCordAt,
  ledgerRootCircle,
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
 * It said `SHIELD` on the return coming down and `MOVE` on the walked socket,
 * which is the half of this fight that happens **after** a shot. What neither
 * word said is where the shot goes, and this is the fourth boss in a row whose
 * field never named the column a bolt is spent in (`boss-cue-read-n.ts`,
 * `boss-cue-read.ts`, `boss-cue-read-b.ts`).
 *
 * **The seam is one column of eleven, and the plating refuses the rest.** A
 * bolt leaves the cannon's own column (`bullets.ts`), only `ledgerSeamCol` hurts
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
 *   bead goes on the cord, `SHIELD` and both `MOVE`s included: a word about the
 *   socket while the plate is meant to be leaving it is worse than none.
 * - **The seam, from `ledgerWhipSeam` hits on.** From there the cord bills
 *   *everything the cannon does* (`ledgerBills`) and a warded return is thrown
 *   back up into the seam for free (`ledger-step.ts`'s `ward`), so whether to
 *   spend a shot on the body at all is the question the design put in step 8
 *   and the pair's own to answer. `FIRE` goes quiet there and the two words
 *   left are the ones about the return they have already earned. In `paying` it
 *   stands, because a shot at the seam is free of any bill and is the only
 *   thing that moves the fight.
 * - **While a colour is held.** `gripBrakes`' rule: a word over something already being answered
 *   teaches the pair to stop reading the words.
 *
 * **Two more words, for two of the four hands** (`sim/ledger-hand.ts`).
 * `ROOT` stands in `rooting`, which used to be the one movement with nothing
 * in it: the body cannot be hurt and no return is owed, and the foot of the
 * cord can be walked along the plating before it seats, which decides where
 * the whole walk starts. `PULL` stands on the bead in `whipping` when the
 * plate is already in the socket — from there a warded return widens the seam
 * for nothing, so a pair that is ahead of the cord is better off hauling the
 * next bill down than waiting for it. It gives the bead back to `SHIELD` on the
 * beat it lands, because one word stands on one thing. **Both of them drop
 * their frame where his ring is under the bead** — `ROOT`'s arrangement, said
 * about a bead instead of a root (`ledger-pull.ts`, THE STARE's `SHUT`).
 *
 * **The other two hands get no word, and that is the same rule twice.** The
 * plug is a choice about which of two columns the plate is owed in, which is
 * step 8's question said about the hull instead of the cannon, and a field
 * that picked for her would be answering it. The haul is worse: the whole of
 * the last movement is the pair working out that this return is not theirs,
 * and a word naming the handle is that answer handed over in four letters.
 *
 * And nothing in `out`, where the halves are parting and the wave is held
 * `ledgerOutBeats` so it cannot end on the same beat.
 *
 * **Every mark is on the half of the picture its own seat holds.** `SHIELD`
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
  if (phase === "out") return [];
  // The cord paying out is the one movement with nothing coming and nothing
  // owed, and it is hers: the foot is walked along the plating before it
  // seats, and where it seats is where the whole walk starts
  // (`sim/ledger-hand.ts`).
  if (phase === "rooting") {
    // **No frame of its own**: her ring stands on the root now
    // (`ledger-grip.ts`), and a ring is a mark already — a box round it would
    // be the two-pictures-for-one-idea the target lock exists to have ended
    // (`boss-cue-draw.ts`, THE STARE's `SHUT`). So the word stands *on* the
    // handle it is about, which is the arrangement, and not half a tile under
    // it where it was when there was nothing there.
    const at = ledgerRootCircle(l, cfg, t);
    // Out to the dial rather than to the ring: the second line of a cue sits
    // just clear of `halfH`, and at the ring's own radius it lands on the arc
    // the foot's beats are draining down (`handle-draw.ts`).
    const half = at.r * DIAL_RADII;
    return [
      {
        seat: 2,
        kind: "CARRY",
        word: "ROOT",
        x: at.x,
        y: at.y,
        halfW: half,
        halfH: half,
        seed: 54,
        framed: false,
      },
    ];
  }
  const next = ledgerNext(t);
  if (next?.last === true) return [];
  if (next !== null) {
    const out: BossCue[] = [];
    const left = next.beat - world.beat;
    if (world.shieldCol !== t.socket) {
      const at = ledgerSocketPoint(l, t);
      out.push(markAt(2, "CARRY", "MOVE", at.x, at.y, l, 52));
    }
    const at = cordAt(l, cfg, t, next, world.beat, beatPhase);
    // Waiting with the plate already in the socket is the pair ahead of the
    // cord, and from `ledgerWhipSeam` hits a warded return is the weapon: the
    // bead is worth hauling down rather than waiting for. One word on the
    // bead, never two — `SHIELD` is the beat it lands on and this is every beat
    // before it.
    const pull = phase === "whipping" && world.shieldCol === t.socket && left > 1 && !next.pulled;
    // **No frame where his ring is under it**, `ROOT`'s arrangement said
    // about a bead instead of a root: from the day the pull was drawn, the
    // soonest haulable return wears a ring that rides it down the cord
    // (`ledger-pull.ts`), and a ring is a mark already. The word stands out at
    // the dial, which is the one radius clear of both.
    const ringed = ledgerPullable(t, cfg, world.beat) !== null;
    const half = handleRadius(l, cfg) * DIAL_RADII;
    const word = pull ? "PULL" : "SHIELD";
    out.push(
      ringed
        ? {
            seat: 1,
            kind: "PRESS",
            word,
            x: at.x,
            y: at.y,
            halfW: half,
            halfH: half,
            seed: 53,
            framed: false,
          }
        : markAt(1, "PRESS", word, at.x, at.y, l, 53),
    );
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

/** Where a return has got to down the cord: the one point three marks stand on. */
function cordAt(
  l: Layout,
  cfg: World["cfg"],
  t: LedgerState,
  bead: LedgerBead,
  beat: number,
  beatPhase: number,
): { x: number; y: number } {
  const from = ledgerRootPoint(l, cfg, t);
  const to = ledgerSocketPoint(l, t);
  return ledgerCordAt(l, from, to, ledgerTaut(cfg, t), 0, ledgerBeadU(bead, beat, beatPhase));
}
