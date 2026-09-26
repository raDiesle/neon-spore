import { markMoment } from "./balance.js";
import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import { guardArmed } from "./hull-guard.js";
import {
  type LedgerBead,
  type LedgerState,
  ledgerCadence,
  ledgerPlugs,
  ledgerWalk,
  ledgerWhips,
} from "./ledger.js";
import { tearCord, widenSeam } from "./ledger-bead.js";
import { ledgerHandsFresh } from "./ledger-hand.js";
import { nextInt } from "./rng.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE LEDGER's clock — the returns coming down the cord, the root walking
 * along the hull, and the tear.
 *
 * Everything here runs on the **beat**, from `stepBoss`. What a shot does to it
 * is `ledger-shot.ts`, on the tick.
 *
 * **A return is resolved on the beat it lands, and warded exactly the way a
 * rock is**: the plate in the socket's column (`world.shieldCol`) and the
 * trigger inside its own window (`guardArmed`). Neither of those is re-derived
 * here — they are the same two questions `hull.ts` asks of a falling body, and
 * the whole point of this boss is that the pair's own shot arrives as one.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installLedger(world: World): LedgerState {
  const cfg = world.cfg;
  const width = Math.min(cfg.ledgerCols, cfg.cols);
  const col = Math.max(0, Math.min(cfg.cols - width, midCol(cfg) - Math.floor(width / 2)));
  const socket = midCol(cfg);
  world.events.push({ type: "ledgerRoot", col: socket, cols: width });
  return {
    kind: "ledger",
    col,
    socket,
    // Toward the far wall from wherever the cord went in, so the first walk is
    // never off the field and the pair is never asked for a column twice.
    walk: socket <= midCol(cfg) ? 1 : -1,
    want: nextInt(world.rng, 2) === 0 ? "red" : "cyan",
    seam: 0,
    beads: [],
    warded: 0,
    rootBeat: world.beat,
    outBeat: -1,
    ...ledgerHandsFresh(cfg.ledgerPlugBeats),
  };
}

/**
 * The root, one column further along the hull, turning at the wall.
 *
 * Every return that reaches the socket moves it, warded or not: the design's
 * *the column to be warded is different every time*, and the reason the pair is
 * re-learning one sentence with a new number in it rather than holding a
 * position. It turns rather than wrapping, because a cord that jumped the width
 * of the ship would be a column nobody could carry the plate to in two beats.
 */
function slide(world: World, t: LedgerState): void {
  // Where it goes is `ledgerWalk`'s, not this function's: the navigator is
  // shown a chevron pointing at the same column a cadence early, and the two
  // answers have to be one answer (`ledger.ts`, `test/copies-table.ts`).
  const next = ledgerWalk(t, world.cfg);
  t.socket = next.col;
  t.walk = next.walk;
  world.events.push({ type: "ledgerSocket", col: t.socket });
}

/** Whether the pair answered this return: the plate in the column, in time. */
function answered(world: World, t: LedgerState): boolean {
  return world.shieldCol === t.socket && guardArmed(world);
}

/**
 * A return warded, which is the pair's half of this whole fight done.
 *
 * The three lines of bookkeeping are `wardTurns`' own, written out rather than
 * called, because that function takes the `Creature` it is turning away and
 * there is no body here — a return is damage on a cord. The sheet is the same
 * sheet: the pair put the plate in a column and the trigger on a beat, and a
 * ward that counted for nothing because the thing it turned had no silhouette
 * would be the arithmetic telling them their half did not work.
 */
function ward(world: World, t: LedgerState): void {
  t.warded += 1;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "ledgerWard", col: t.socket });
  // And from `ledgerWhipSeam` hits the whip is the weapon: the cord throws the return
  // back up into the seam and widens it, with nothing billed for it
  // (`ledger.ts`). A pair that has understood this boss stops shooting it.
  if (ledgerWhips(t, world.cfg, world.beat)) {
    world.events.push({ type: "ledgerWhip", col: t.socket, seam: t.seam + 1 });
    widenSeam(world, t, false);
  }
}

/**
 * A return nobody answered, landing in the socket: **the hull takes it, and
 * the wave is lost** — the owner's rule, 12 September 2026 (`wave-fail.ts`).
 *
 * This is the one place the design had to be argued with rather than followed.
 * It asks for a scar and for the fight to carry on, tightening as they
 * accumulate; but a hit fails the wave in this game, so a scar that let the
 * fight continue would be this boss alone among fourteen in what a hit costs.
 * The pressure the design wanted from the scars is taken from the seam instead:
 * the cadence shortens one beat per hit, so it is the pair's own progress that
 * speeds the bills up (`ledgerCadence`).
 */
function bill(world: World, t: LedgerState): void {
  world.guard.tries += 1;
  world.guard.mistimed += 1;
  markMoment(world, false);
  world.events.push({ type: "ledgerBill", col: t.socket });
  // `meteorFastest` and row 0, the idiom for a hit that came from off the
  // field rather than out of a body (`fleet.ts`, `mirror-round.ts`).
  breachHull(world, t.socket, "meteorFastest", 0, "heavy");
}

/**
 * **The last return, which is the one the pair is asked to let through.**
 *
 * Ward it and it is refused: thrown back up the cord and put back on it a
 * cadence later, with the seam already full, so nothing is lost and nothing is
 * gained. The fight simply holds open until both of them take their hands off
 * it — the navigator carries the plate out of the socket's column and the pilot
 * does not press. A pair that has spent the whole fight learning that a return
 * must be answered is told, once, that this one is not theirs.
 */
function last(world: World, t: LedgerState, b: LedgerBead): LedgerBead | null {
  if (!answered(world, t)) {
    tearCord(world, t);
    return null;
  }
  world.events.push({ type: "ledgerHeld", col: t.socket });
  slide(world, t);
  return { ...b, beat: world.beat + ledgerCadence(t, world.cfg) };
}

/**
 * **A return rolled over on a plugged socket** — the navigator's thumb in the
 * hole, and the bill put back on the cord a cadence later.
 *
 * Nothing is warded and nothing is whipped: the pair has not answered this
 * return, they have refused to take it today, and the sheet says so — `rolled`
 * is its own count beside `warded` rather than a second kind of ward, because
 * a fight that scored a plug as a deflection would be telling them their half
 * worked when what they did was move the problem (`ward`).
 *
 * It comes back on the **current** cadence, which is shorter than the one it
 * was born on if the seam has widened since: a bill rolled over is a bill owed
 * with less time in it, and that is the whole of what it costs beyond the
 * grace itself (`ledgerCadence`, `ledgerPlugBeats`).
 */
function roll(world: World, t: LedgerState, b: LedgerBead): LedgerBead {
  const beats = ledgerCadence(t, world.cfg);
  t.rolled += 1;
  world.events.push({ type: "ledgerRoll", col: t.socket, beats });
  return { ...b, beat: world.beat + beats, span: beats, pulled: false };
}

/**
 * **What the plug costs, counted on the beat.**
 *
 * The thumb is in or out on the tick (`ledger-hand.ts`) and paid for here, one
 * beat at a time, out of a budget for the whole fight. Spending it on the beat
 * rather than the tick is the same ruling THE THROAT's cinch has: a hand that
 * landed and lifted between two beats has rolled nothing over, and charging it
 * would be charging her for a thumb that never stopped a bill.
 *
 * At nought the socket spits the thumb out and will not take it again. So does
 * a movement that must not be plugged — the grace runs out, or the fifth
 * return goes on the cord, and either way the hole is open when it matters
 * (`ledgerPlugs`).
 */
function stepLedgerHands(world: World, t: LedgerState): void {
  if (!t.plug) return;
  if (!ledgerPlugs(t, world.cfg, world.beat)) {
    t.plug = false;
    return;
  }
  t.plugBeats -= 1;
  if (t.plugBeats <= 0) t.plug = false;
}

/** Every return that has reached the socket this beat, in the order it started. */
function landing(world: World, t: LedgerState): void {
  const kept: LedgerBead[] = [];
  for (const b of t.beads) {
    if (b.beat > world.beat) {
      kept.push(b);
      continue;
    }
    if (b.last) {
      const held = last(world, t, b);
      if (held === null) return;
      kept.push(held);
      continue;
    }
    if (t.plug) kept.push(roll(world, t, b));
    else if (answered(world, t)) ward(world, t);
    else bill(world, t);
    slide(world, t);
  }
  t.beads = kept;
}

/**
 * One beat of the cord.
 *
 * Returns land first, so a bead that arrives on the same beat as a new hit is
 * resolved against the socket it was coming down to rather than the one the
 * hit slid it to. Then THE SLOW, on the last beat of the soonest return: the
 * design's own choice of where to spend it, and deliberately not a DRAG —
 * the beats down the cord are the clock this entire fight is timed against,
 * and buying the pair a fifth would be giving back the debt the boss exists
 * to collect (`docs/decisions.md` #33).
 */
export function stepLedger(world: World, t: LedgerState): void {
  const cfg = world.cfg;
  if (t.outBeat >= 0) {
    // Nulled here rather than at the tear, so the frame has its beats of the
    // halves parting before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - t.outBeat >= cfg.ledgerOutBeats) world.boss = null;
    return;
  }
  landing(world, t);
  if (t.outBeat >= 0) return;
  stepLedgerHands(world, t);
  for (const b of t.beads) {
    if (b.beat - world.beat === 1) {
      openSlow(world, cfg.ledgerSlowBeats, "show");
      break;
    }
  }
}
