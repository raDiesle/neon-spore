import { candleBoss, candleEating } from "./candle.js";
import { diastoleBridgeCol, diastoleChamberCol } from "./diastole.js";
import { diastoleBoss } from "./diastole-step.js";
import { ledgerBoss } from "./ledger.js";
import { type TasterState, tasterBoss, tasterOrder, tasterPhase } from "./taster.js";
import { undertowBoss } from "./undertow.js";
import type { World } from "./world.js";

/**
 * **The column the boss is answered from, this beat** — or none, when the
 * boss standing is not one whose answer moves.
 *
 * A rehearsal's strip is authored in seven columns and `mapCol` reaches seven
 * of the game's eleven with them: 0, 2, 3, 5, 7, 8 and 10 and nothing else
 * (`content/src/queue.ts`). A body in a column outside that list is what
 * `atBody` was written for (`scene-aim.ts`), and two bosses are the same hole
 * with no body to find. THE DIASTOLE's left chamber hangs over column 4 — one
 * off the middle, and no authored column rounds to it. THE UNDERTOW's first
 * lobe comes up wherever the seeded rng says, in any of the eleven, and the
 * film cannot know which until the world does. THE CANDLE's glow drifts a
 * column at a time off the same rng. THE TASTER's fan opens from the middle
 * outward and its second blade stands over column 6, which no authored
 * column reaches either. THE LEDGER's socket walks a column along the hull
 * per return, into every column there is. So a strip may say `atBoss`
 * instead of a column, and this is the one reading of what that means.
 *
 * **It is the boss's own answer, not the picture's.** Each line here asks the
 * boss's file the question the pair is meant to be asking — where does the
 * cannon have to stand *now* — so that a phase changing the answer changes
 * the film with it, and a film authored against last week's column cannot go
 * quietly wrong the way a shot that stopped landing would (`scenes.test.ts`).
 * A boss with no line is `null`, and the press is left as it was written:
 * every other boss stands where an author can name (THE BATON's arm is the
 * middle lane), and a switch that answered for all of them would be a second
 * copy of each boss's geometry.
 */
export function bossAnswerCol(world: World): number | null {
  const d = diastoleBoss(world);
  if (d !== null) {
    // The left chamber while it beats alone; the bridge from the moment the
    // right wakes, which is the rule in `diastoleStruck` read as a column.
    if (d.phase === "burst") return null;
    return d.phase === "one" ? diastoleChamberCol(world.cfg, -1) : diastoleBridgeCol(world.cfg);
  }
  const u = undertowBoss(world);
  if (u !== null) {
    // The breach the maw answers: the first one up. Two come up four apart in
    // phase `two` and the maw reaches one of them; the film takes the left,
    // which is the pair's own choice made once. The `seat` push is under the
    // cannon itself and the answer is to leave, so it has no column here.
    if (u.phase === "seat") return null;
    return u.breaches[0]?.col ?? null;
  }
  const c = candleBoss(world);
  if (c !== null) {
    // The column the glow hangs over, which is the one a shot dims it from
    // (`candleStruck`) — unless it is eating from that very column, when the
    // answer is to leave it (`candleEats`) and no column is the answer.
    if (c.phase === "dark" || c.phase === "out") return null;
    return candleEating(c) && c.faceCol === c.col ? null : c.col;
  }
  const t = tasterBoss(world);
  if (t !== null) return tasterAnswerCol(world, t);
  const g = ledgerBoss(world);
  if (g !== null) {
    // THE LEDGER is answered with the plate, not the cannon: the seam is the
    // middle column, which an author can write, and the column that moves is
    // the socket the returns land in — a column further along the hull for
    // every return, and the walk reaches all eleven (`ledgerWalk`). Nothing
    // once the cord has torn out, and nothing while the last return is on it,
    // which is the one the plate must *not* stand under (`ledgerLetThrough`).
    if (g.outBeat >= 0 || g.beads.some((b) => b.last)) return null;
    return g.socket;
  }
  return null;
}

/**
 * The blade to answer: the first in the fan's own order (`tasterOrder`) that
 * is standing with its edge set — the one that has been there longest, and
 * the one the pilot's guide says to hold the column of. Nothing while no
 * blade has decided, because a shot at a growing blade is only spent; and
 * nothing once the fan is closed or out, when every column under the crest
 * is the interlock and the beam is the answer, not a column.
 */
function tasterAnswerCol(world: World, t: TasterState): number | null {
  const phase = tasterPhase(t, world.cfg);
  if (phase === "closed" || phase === "out") return null;
  for (const i of tasterOrder(t.blades.length)) {
    const k = t.blades[i];
    if (k !== undefined && !k.shorn && k.setBeat >= 0) return t.col + i;
  }
  return null;
}
