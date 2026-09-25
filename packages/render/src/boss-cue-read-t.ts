import {
  type ScuttleState,
  scuttlePartCol,
  scuttleShootable,
  scuttleSwingable,
  scuttleWinding,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import { scuttleLockBox } from "./scuttle-draw.js";
import { scuttleRowY } from "./scuttle-shape.js";

/**
 * **What THE SCUTTLE is asking for** — the readings' page `t`, split off
 * `boss-cue-read-c.ts` on 19 September 2026 alongside one more boss, which
 * went to page `u`; THE LEAD stayed on page three, alone. The finding that
 * reserved page three (`docs/queue.md`) had already said what was left of it
 * to split: one page a boss, the way THE THROAT and THE LEDGER had already
 * gone to pages eleven and fifteen. The letter rather
 * than a number is page `s`'s own reason — a sibling lane is writing another
 * page the same day, and a number here would be a number about whichever of
 * the three lands first.
 *
 * THE SCUTTLE was one of the three left because it too is about **a count
 * nobody may be given** — not which socket, which the navigator's own
 * picture already shows her, but the beat the wind-up ends and the throw
 * goes: `scuttleCues`' own doc comment below has the rest of it.
 */

/** THE CHOIR's frame, in tiles, and the lift a mark takes over a hull line. */
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
 * **The one word of this boss that is his to spend**, and the reason it does
 * not fall foul of the objection the reading below spends a paragraph making.
 *
 * He may carry one hanging part a column along the frame, once a cycle
 * (`scuttleSwingable`), and it is then thrown — and struck — down the column
 * he put it in. So a part standing one column off the cannon is a bolt he can
 * buy without sliding the cannon at all, which is the trade this gesture
 * exists to offer: his thumb, or her window.
 *
 * **It marks every hanging part that is one column off, never the live one.**
 * Both facts the mark is read from are already drawn on his own screen — his
 * cannon, and every hanging part in grey (`showsScuttleCount`) — so a seat
 * that counts the marks learns what it was already shown and nothing about
 * which part her bolt can strike. That is the whole difference from the
 * `MOVE` on his hull the reading below refuses in a cycle: that one would have
 * been drawn from her lock.
 *
 * **And it goes away the moment a part is over the cannon**, because then
 * there is nothing to buy — the column is already his — and a word that stood
 * there every cycle would be the field asking for a gesture rather than
 * offering one.
 */
function carryCues(l: Layout, world: World, s: ScuttleState): BossCue[] {
  if (!scuttleSwingable(s)) return [];
  const cfg = world.cfg;
  const cols = s.loose.map((i) => scuttlePartCol(s, cfg, i));
  if (cols.includes(world.cannonCol)) return [];
  const out: BossCue[] = [];
  for (const i of s.loose) {
    if (Math.abs(scuttlePartCol(s, cfg, i) - world.cannonCol) !== 1) continue;
    const x = tileCX(l, scuttlePartCol(s, cfg, i));
    out.push(markAt(1, "CARRY", "MOVE", x, scuttleRowY(l, cfg, i), l, 97 + i));
  }
  return out;
}

/**
 * THE SCUTTLE. A boss racing the pair to its own death, so its words are about
 * **the window**, never about which socket: the live part is the navigator's
 * own picture (`showsScuttleLive`) and it is the only thing a bolt can strike,
 * so a mark on it says *now* and nothing she was not already shown.
 *
 * `BURN` replaces `FIRE` for the last part, which is not thrown at all — the
 * frame winds up, and only the beam standing in that column before the throw
 * ends the fight. The verb changing is the whole of what the cue is for.
 *
 * **And the movement under both of them, which this reading shipped without.**
 * Every bolt and every beam leaves the column the cannon is standing in, and
 * the cannon is his (`content/src/controls.ts`); `scuttleStruck` is a no-op in
 * any other column, said for the wrong colour and *unsaid* for the wrong
 * column. So the fight is two presses of hers over one slide of his, and the
 * field had never named the slide.
 *
 * - **In a cycle it still may not name it.** The live socket is hers alone, and
 *   the part hanging beside it is one the design says cannot be taken
 *   (`bosses-choreographed.md` §15, step 6), so a `MOVE` on his hull would be
 *   her lock read out on his screen — THE LEAD's objection, and its silence
 *   would be the same leak by subtraction. What changes instead is **hers**:
 *   `FIRE` waits until the cannon is under the live part, because the lock and
 *   the cannon are both already on her screen and a bolt spent up another
 *   column is the press this whole family exists to stop offering
 *   (`boss-cue.ts`'s first rule). The lock stays drawn throughout, so the
 *   window she is racing is never taken away — only the verb she cannot spend.
 * - **On the wind-up it must.** One part is left, and on his screen the slab is
 *   the count: every socket plated or open, the one hanging part on its thread
 *   (`scuttle-draw.ts`, `showsScuttleCount`). There is nothing to subtract — the
 *   last column is the only column, already drawn to him — and the window is
 *   `lancePrimeBeats` and a beat of slack, all of which her fill is spending.
 *   So `CARRY` / `MOVE` on the cannon, and it is the only word on this boss
 *   that decides the fight rather than a cycle of it.
 *
 * `s.live` rather than the first part still in a socket: they are the same
 * index while it winds up, because the wind-up is what one part left *is*
 * (`scuttle-step.ts`), and `scuttleStruck` judges the beam against `s.live`.
 * A reading that agrees with the rule by arithmetic is a reading that stops
 * agreeing when the rule moves.
 *
 * **Nothing for a thrown part.** A rock wants her plate and his guard, a pod
 * his maw, and all three are the wave's ordinary answers to an ordinary
 * arrival: a word on one would be the field narrating the wave rather than the
 * boss, which is the objection THE SURGE's gums carry.
 */
export function scuttleCues(l: Layout, world: World, s: ScuttleState): readonly BossCue[] {
  if (s.downBeat >= 0) return [];
  const cfg = world.cfg;
  if (scuttleWinding(s)) {
    if (s.live < 0) return [];
    const col = scuttlePartCol(s, cfg, s.live);
    const out: BossCue[] = [
      markAt(2, "HOLD", "BURN", tileCX(l, col), scuttleRowY(l, cfg, s.live), l, 55),
    ];
    if (world.cannonCol !== col) {
      out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 96));
    }
    return out;
  }
  const carry = carryCues(l, world, s);
  if (!scuttleShootable(s)) return carry;
  if (world.cannonCol !== scuttlePartCol(s, cfg, s.live)) return carry;
  // **No frame of its own.** Her screen already locks the column the next
  // throw lands in (`scuttle-draw.ts`), which is the live part's own column,
  // so the cue borrows that box and adds the one thing it does not say.
  const box = scuttleLockBox(l, cfg, s);
  if (box === null) return carry;
  return [{ seat: 2, kind: "PRESS", word: "FIRE", ...box, seed: 56, framed: false }, ...carry];
}
