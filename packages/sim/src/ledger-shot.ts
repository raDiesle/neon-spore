import { metColor, missedColor } from "./balance.js";
import type { CoreVerdict } from "./core-verdict.js";
import { ledgerBoss, ledgerCovers, ledgerPhase, ledgerSeamCol, ledgerWhips } from "./ledger.js";
import { startBead, widenSeam } from "./ledger-bead.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **What a shot costs against THE LEDGER**, which is the boss: the seam takes
 * the hit, and the pair takes the bill.
 *
 * Its own file beside `ledger-step.ts` for `taster-shot.ts`' reason, said about
 * a cord rather than a fan: next door is the fight's **clock** — the returns
 * coming down, the root walking, the tear — and both halves of this file happen
 * on the **tick**, one where a bolt leaves the top of the field and one where
 * it leaves the muzzle.
 *
 * **Two hooks, and the difference between them is the third movement.** Until
 * `ledgerWhipSeam` hits the cord bills only what reaches the body, so a pair
 * answering the wave pays nothing for it. From there it bills *everything the
 * cannon does* — the design's own step 8, and the beat the fight stops being
 * about the boss: every arrival they choose to answer is a return on the cord
 * as well, and the hull cannot be in four columns at once.
 */

/** A bolt the plating or the wrong colour turned away, at the column it hit. */
function refuse(world: World, col: number): void {
  world.events.push({ type: "ledgerRefused", col });
}

/**
 * **A shot that nothing on the field stopped, leaving through the top** of a
 * column the body stands in. Called by `bullets.ts` and `lance-burn.ts` beside
 * `tasterStruck`, and a no-op unless THE LEDGER is the boss.
 *
 * Only the seam's own column is a target, and only in the colour the seam is
 * showing. The plating either side of it refuses a bolt with no colour cost at
 * all — it is a column miss and not a colour one, which is `taster-shot.ts`'
 * ruling about the soft crest arrived at from the other end — and the wrong
 * colour up the right column is the colour miss it plainly is.
 */
export function ledgerStruck(world: World, bullet: Bullet): boolean {
  const t = ledgerBoss(world);
  const verdict = ledgerVerdict(world, bullet.col, bullet.color);
  if (t === null || verdict === null) return false;
  if (verdict === "wrong") missedColor(world);
  if (verdict !== "target") {
    refuse(world, bullet.col);
    return true;
  }
  metColor(world);
  const cfg = world.cfg;
  // The bill is the muzzle's once the cord whips, so a hit that reaches
  // the body does not put a second return on the cord for the same bolt
  // (`ledgerBills`).
  widenSeam(world, t, !ledgerWhips(t, cfg, world.beat));
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the body, in `CoreVerdict`'s
 * words: the seam in the colour it wants (`"target"`) or the other
 * (`"wrong"`), the plating anywhere else under the body (`"armour"`), or
 * nothing past it. `ledgerStruck` acts on it, and the picture asks it too.
 */
export function ledgerVerdict(world: World, col: number, color: Color): CoreVerdict {
  const t = ledgerBoss(world);
  if (t === null || t.outBeat >= 0) return null;
  const cfg = world.cfg;
  // Under the body, the bolt met it: the plating's refusal is armour
  // (`shot-out.ts`).
  if (!ledgerCovers(t, cfg, col)) return null;
  // A cord still paying out has nothing rooted to bill down, so the body
  // cannot be hurt yet: the design's step 1, which is a picture and not a
  // window (`ledgerPhase`).
  if (ledgerPhase(t, cfg, world.beat) === "rooting") return "armour";
  if (col !== ledgerSeamCol(t, cfg)) return "armour";
  return color === t.want ? "target" : "wrong";
}

/**
 * **The cord bills for everything the cannon does**, once the seam is
 * `ledgerWhipSeam` wide: every bolt and every beam starts a return, whatever
 * it was fired at.
 *
 * Called from the one place a shot is counted as spent (`bullets.ts`,
 * `lance-burn.ts`, beside `spendShot`) rather than from where a shot lands,
 * because that is what the rule says: the pair is billed for *firing*, and a
 * bolt that hits nothing at all is still a bolt the cord saw leave. It is the
 * one mechanic in the game that makes **not shooting** a move, which is the
 * question the design put in step 8 — *choose what to shoot at all*.
 *
 * The last return is never doubled: once the seam is full the cord is carrying
 * the bead the pair has to let through, and billing them for the shots they
 * take while it comes down would be asking them to answer two returns with one
 * plate on the beat the fight is decided (`ledger-step.ts`).
 */
export function ledgerBills(world: World): void {
  const t = ledgerBoss(world);
  if (t === null || t.outBeat >= 0) return;
  if (!ledgerWhips(t, world.cfg, world.beat)) return;
  if (t.seam >= world.cfg.ledgerSeamHits) return;
  startBead(world, t, false);
}
