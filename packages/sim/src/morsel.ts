import { hullRow } from "./config.js";
import { cargoLost, inMawReach, mawOpen, steerAtMaw, takeCargo } from "./pod-intake.js";
import type { Color, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MORSEL: shoot it once, then swallow it.
 *
 * The owner's SUCK page of 16 October 2026 (`docs/spec/suck-ideas.md`), built
 * at his word "build all". A soft body in one colour that a matching shot does
 * not kill: it goes limp, turns amber and keeps falling, and it counts as
 * finished only when the maw takes it. It is the two things the pair already
 * knows — a shot and a swallow — joined in the order they happen, which makes
 * it the gentlest way to teach the maw outside a pod wave.
 *
 * **The second half is the pod's, word for word.** Limp, it steers a column a
 * beat at the cannon on the last `podHomeTiles` (`steerAtMaw`, the moult's own
 * steer), and at the hull it is taken in within `podCatchCols` with the mouth
 * open or it is a lost wave (`takeCargo`, `cargoLost`). Nothing here writes the
 * maw's two conditions a second time.
 *
 * **Unshot, it is a slick.** It falls a tile a beat, a wrong colour is a
 * colour miss and leaves the window `colour-armour.ts` keeps, and reaching the
 * hull whole is an ordinary breach — the branch in `hull.ts` only catches it
 * limp.
 */

/** Whether a morsel has been shot and is falling limp. */
export function morselIsLimp(c: Creature): boolean {
  return c.morselLimp === true;
}

/**
 * A limp morsel met a shot. The bolt is spent, and deliberately not a colour
 * miss: the ammunition was never the question a body already down asks.
 * Asked from `struckWithoutKilling`, beside the moult's cargo.
 */
export function limpMorselStruck(world: World, hit: Creature): void {
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
}

/**
 * The matching colour met a whole one, and it goes limp rather than off the
 * field. Asked from `resolve` after the colour has been judged and paid for
 * there, so the miss, the armour window and `metColor` are the slick's own
 * branch and not a copy of it. The bolt stops, a lance's too: a beam only goes
 * on through a body it destroyed.
 */
export function morselGoesLimp(world: World, hit: Creature, color: Color): void {
  hit.morselLimp = true;
  world.events.push({ type: "morselLimp", col: hit.col, row: hit.row, color });
}

/** The sideways half of a limp morsel's beat, beside its fall: the moult's. */
export function stepMorsel(world: World, c: Creature): void {
  if (morselIsLimp(c)) steerAtMaw(world, c);
}

/**
 * A limp morsel at the ship's end of the field. Returns whether it **stays on
 * the field**, `moultArrives`' contract: nothing is through on the beat it
 * reaches the ship's row, so the mouth still reaches it for the beat the pair
 * watches it land, and then it is swallowed or the wave is lost.
 */
export function morselArrives(world: World, c: Creature): boolean {
  const shipRow = hullRow(world.cfg);
  if (c.row < shipRow || c.fromRow < shipRow) return true;
  if (inMawReach(world, c.col) && mawOpen(world)) {
    takeCargo(world, c.col);
    return false;
  }
  cargoLost(world, c.col);
  return false;
}
