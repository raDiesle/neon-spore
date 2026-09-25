import { breachHull } from "./hull-damage.js";
import {
  type SpliceState,
  spliceCurrent,
  spliceEntranceRow,
  spliceStraws,
  spliceWanted,
} from "./splice.js";
import { spliceLay } from "./splice-tangle.js";
import type { World } from "./world.js";

/**
 * THE SPLICE's clock, its one verb and what a feed costs.
 *
 * Split from `splice.ts` for the seam `mirror.ts` and `mirror-round.ts`
 * already cut: next door is the vocabulary — what a round is and what the
 * fight remembers — and this is what happens to it. The board they are both
 * about is `splice-tangle.ts`.
 *
 * **The field is still the field.** Unlike SNAKE or PINBALL this boss does not
 * replace the picture: the hull, the cannon, the shield and the maw are all
 * the ship's own, and the only thing above them is a row of mouths and the
 * tangle over it. So the fight is stepped from `stepBoss` on the beat, like
 * THE MIRROR's, and its one verb arrives through `applyCommand` as the SUCK
 * the pair already has.
 */

/**
 * Beats the cleared round stands before the next one is laid.
 *
 * The straws of a round that was just beaten are the picture of having beaten
 * it, and a tangle that was replaced on the beat the last number went in would
 * take the pair's only look at what they had untangled.
 */
export const SPLICE_SETTLE_BEATS = 4;

/** The fight, if it is the one installed. Narrowing in one place rather than six. */
export function spliceRound(world: World): SpliceState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "splice" ? boss : null;
}

/** A fresh splice, on the first round, with its first tangle already laid. */
export function installSplice(world: World, rounds: readonly { beats: number }[]): SpliceState {
  const s: SpliceState = {
    kind: "splice",
    rounds: rounds.map((r) => ({ ...r })),
    round: 0,
    roundBeat: world.beat,
    entranceCols: [],
    topCols: [],
    midCols: [],
    topOf: [],
    fed: 0,
    flights: [],
    eatBeat: -1,
    eatCol: -1,
    passBeat: -1,
    verdict: 0,
    verdictBeat: -1,
    verdictStraw: -1,
  };
  spliceLay(world, s, spliceStraws(0));
  return s;
}

/**
 * One beat of the fight: the eater landing, the number in flight arriving,
 * the cleared round giving way to the next, and the round's own clock running
 * out.
 *
 * In that order, and the order is the whole of the timing. A feed that lands
 * on the beat a round's last one was due is a round cleared rather than a
 * round lost, because the pair did the thing in time and the clock is what
 * they did it against. The eater is first because a round it has taken is
 * over: nothing else in it is still happening.
 */
export function stepSplice(world: World, s: SpliceState): void {
  if (world.over) return;
  if (s.eatBeat !== -1) {
    if (world.beat - s.eatBeat >= world.cfg.spliceEatBeats) land(world, s);
    return;
  }
  // Every number whose travel is done, first sucked first. Two may land on the
  // one beat — two sucks inside a beat — and a wrong one or the round's last
  // one ends what the others were for.
  let landed = false;
  while (s.eatBeat === -1 && s.passBeat === -1) {
    const f = s.flights[0];
    if (f === undefined || world.beat - f.beat < world.cfg.spliceFeedBeats) break;
    s.flights.shift();
    arrive(world, s, f.straw);
    landed = true;
  }
  if (landed) return;
  if (s.passBeat !== -1) {
    if (world.beat - s.passBeat >= SPLICE_SETTLE_BEATS) advance(world, s);
    return;
  }
  // A number still coming down is the pair's answer already given: the clock
  // cannot take a round off them while one is in the air.
  if (s.flights.length > 0) return;
  if (world.beat - s.roundBeat >= spliceCurrent(s).beats) bite(world, s);
}

/**
 * The SUCK, as this fight heard it. Called from `applyCommand` for every
 * intake, whether or not the maw had anything else to do with it.
 *
 * A suck with no entrance under the cannon is a suck at the plating, and a
 * suck at a straw whose number is already coming down has nothing at its top
 * end to take — both are nothing at all rather than a mistake, because neither
 * is a **feed** and only a feed can be the wrong one. A suck at any *other*
 * straw while one is in the air is a feed like any other, and joins the queue
 * behind it. A pair fishing for the right column would
 * otherwise lose the wave to a press they had not finished thinking about.
 * A suck after the eater has bitten is nothing too: the round is already lost.
 */
export function spliceHeard(world: World): void {
  const s = spliceRound(world);
  if (s === null || world.over || s.passBeat !== -1) return;
  if (s.eatBeat !== -1) return;
  const entrance = s.entranceCols.indexOf(world.cannonCol);
  if (entrance === -1 || s.flights.some((f) => f.straw === entrance)) return;
  s.flights.push({ straw: entrance, beat: world.beat });
  world.events.push({
    type: "spliceFeed",
    col: world.cannonCol,
    row: spliceEntranceRow(world.cfg),
    straw: entrance,
    number: (s.topOf[entrance] ?? -1) + 1,
  });
}

/** The number reaches the maw, and is either the next one or is not. */
function arrive(world: World, s: SpliceState, entrance: number): void {
  const wanted = spliceWanted(s);
  s.verdictBeat = world.beat;
  s.verdictStraw = entrance;
  if (entrance !== wanted) {
    cost(world, s, entrance);
    return;
  }
  s.fed += 1;
  s.verdict = 1;
  world.events.push({
    type: "spliceFed",
    col: s.entranceCols[entrance] ?? world.cannonCol,
    row: spliceEntranceRow(world.cfg),
    number: s.fed,
    of: s.topOf.length,
  });
  if (s.fed < s.topOf.length) return;
  // Cleared. Anything still in the air is a straw sucked a second time after
  // its number was in, and a round already won has no use for it.
  s.passBeat = world.beat;
  s.flights = [];
}

/**
 * **What breaks the hull in this fight is slime, never a rock.** Every number
 * is a living ball — a power-up the ship is there to collect — so a wrong one
 * bursting in the maw and the eater coming down with the right one in its gut
 * both land as a body does: a burst at the plating and a crack, with no rock
 * falling in front of it (`render/effects-breach.ts`). Both were
 * `meteorFastest` until 25 September 2026, and the owner asked for the damage
 * to be about the thing that did it.
 */
const SPLICE_BREACH_KIND = "slick";

/**
 * A wrong feed: the hull, in the column the mistake was made in — and with it
 * the wave (`wave-fail.ts`).
 *
 * **The round does not get a second try, and could not.** The owner's rule of
 * 12 September 2026 is that every hull damage fails the wave, so the field
 * holds from this tick and the whole wave is played again from the top. The
 * design this was built from says the fed numbers return to their top ends and
 * the order begins at 1, and that is exactly the path SNAKE and THE MIRROR
 * both wrote and then found unreachable (`mirror-round.ts`'s `settle`). It is
 * kept here for the one caller that can still reach it — a held hull
 * (`hullInvulnerable`), which is how the director and the frame tests watch a
 * round go wrong without ending the wave — and for nothing else.
 */
function cost(world: World, s: SpliceState, entrance: number): void {
  const col = s.entranceCols[entrance] ?? world.cannonCol;
  s.verdict = -1;
  s.verdictBeat = world.beat;
  s.verdictStraw = entrance;
  const row = spliceEntranceRow(world.cfg);
  world.events.push({ type: "spliceWrong", col, row, straw: entrance, clock: false });
  breachHull(world, col, SPLICE_BREACH_KIND, row, "heavy");
  restart(world, s);
}

/**
 * The clock is spent: the eater swallows the number wanted next, and the
 * round is lost **now** — the verdict is said on this beat, the maw is shut
 * from it — while the hull waits for the eater to arrive (`land`).
 *
 * It comes down on the column the cannon stood in when it bit, kept here
 * rather than read again when it lands: the ship is what it goes for, and a
 * cannon slid away in the beats between would otherwise be a way to dodge it
 * — and nothing on this field dodges.
 */
function bite(world: World, s: SpliceState): void {
  s.eatBeat = world.beat;
  s.eatCol = world.cannonCol;
  s.verdict = -1;
  s.verdictBeat = world.beat;
  s.verdictStraw = -1;
  const row = spliceEntranceRow(world.cfg);
  world.events.push({ type: "spliceWrong", col: s.eatCol, row, straw: -1, clock: true });
}

/** The eater reaches the ship. The breach is from the top row, where it came from. */
function land(world: World, s: SpliceState): void {
  breachHull(world, s.eatCol, SPLICE_BREACH_KIND, world.cfg.spliceTopRow, "heavy");
  restart(world, s);
}

/** What a held hull sees after either: the order from 1 again, the clock restarted. */
function restart(world: World, s: SpliceState): void {
  s.fed = 0;
  s.flights = [];
  s.eatBeat = -1;
  s.roundBeat = world.beat;
}

/**
 * The cleared round gives way. The last one takes the boss off the world and
 * the empty field ends the wave, which is `settle`'s shape in `mirror-round.ts`
 * and for its reason: a fight that is over should not be a fight that is
 * standing there answering presses.
 */
function advance(world: World, s: SpliceState): void {
  if (s.round + 1 >= s.rounds.length) {
    world.events.push({
      type: "spliceDown",
      col: world.cannonCol,
      row: spliceEntranceRow(world.cfg),
    });
    world.boss = null;
    return;
  }
  s.round += 1;
  s.verdict = 0;
  spliceLay(world, s, spliceStraws(s.round));
}
