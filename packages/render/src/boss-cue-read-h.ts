import {
  type PinballState,
  type ScoutState,
  scoutHome,
  scoutMawOpen,
  scoutNavigator,
  scoutSuckWanted,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cueFrame } from "./boss-cue-frame.js";
import type { Layout } from "./layout.js";
import { scoutAt } from "./scout-draw.js";

/**
 * **What the rounds that kept the ship are asking for** — page eight of the
 * readings: PINBALL, THE SCOUT.
 *
 * It is a page of its own because these two are the rounds with a hull, a band
 * and the ship's own water still in the frame. Their geometry is neither the
 * field's tiles (pages one to six) nor a chart's squares (page seven) but a
 * picture of their own pinned to the hull: PINBALL's table hangs off `pinTable`
 * and stands on `l.hullY`, and THE SCOUT's arena is the field's own columns
 * with the mother ship's mouth on the bottom row (`scoutAt`, `scoutHome`).
 *
 * **PINBALL already talks, and that is what decides its reading.** It draws
 * a line of its own at the top, on both screens, every tick, saying *what is
 * wanted now* (`waiting`), and a cue that said the same thing again three
 * tiles lower would be the four-pictures-for-one-idea mistake `target-lock.ts`
 * records the owner ending — and since 1 October 2026 not even the one word
 * its sentence could not say survives: the cannon says it. THE SCOUT said
 * *what this seat is for* at the top until 29 September 2026, when the owner
 * had every word over its arena taken away; its one word is still only the
 * moment the round cannot show on its own.
 */

/**
 * PINBALL. Nothing, to either seat.
 *
 * **She cannot be told anything the round does not already say.** Her whole
 * seat is one press on the bar, in one phase, and a mark over the bar would
 * add a box and no fact: it could not say *when*, because when is the answer
 * and the bar filling and emptying is the question.
 *
 * **And he is no longer told MOVE.** Until 1 October 2026 a `CARRY` / `MOVE`
 * stood on the cannon through every flight in which the ball was not over it.
 * The owner that day: *the "move" helper is stupid* — and he asked instead for
 * the cannon itself to change while the ball is up, into a funnel that can take
 * it back, with a green light drawing in and an arrow down its middle
 * (`pinball-mouth.ts`). The mouth now says *this is where it comes home* on its
 * own, every tick of the flight, and a word on top of it would be the
 * four-pictures-for-one-idea mistake `target-lock.ts` records the owner ending.
 *
 * Kept as a page entry that answers nothing, rather than a missing case, so
 * the reason is written where the next reading would be added.
 */
export function pinballCues(_l: Layout, _world: World, _b: PinballState): readonly BossCue[] {
  return [];
}

/**
 * **How far above the mouth the navigator's mark stands**, in tiles.
 *
 * `scoutHome` is on the bottom row and the bottom row is the hull's skin, so
 * the mark has to be held off the plating, and with one thing added: what it
 * must also not cover is **the mouth itself** — the home ring is
 * `scoutHomeRadiusMilli` across, the largest radius in the round, and it is the
 * one thing she is watching. The verb hangs under the frame and never over it
 * (`boss-cue-text.ts`), so the whole mark rides above the ring rather than
 * round it: frame, gap, word, and then the mouth directly under the word. It
 * reads as a column pointing at the mouth, which is the price of the word
 * being readable at all. Measured on the frame at 1.9, where the ring's rim
 * cut through the letters.
 */
const HOME_LIFT = 2.7;

/**
 * THE SCOUT. One word, the navigator's, and the pilot is told nothing at all.
 *
 * **He cannot be told anything true.** His screen is the little ship, its nose
 * and what is riding its rim, and not one mote or hazard (`showsScoutNose`).
 * His three controls are two turns and a burn, all of them held, and every
 * word the field could put on them is a *direction* — which is the answer, and
 * hers to say, an o'clock at a time. It is THE GAUGE's finding with the seats
 * swapped: the seat that cannot see is the seat the field must keep quiet to,
 * because the only thing there is to say to it is the thing the other one is
 * here to say.
 *
 * **She is told her own one verb, at the moment it will land.** `TAP` /
 * `TO OPEN THE MOUTH` on the mother ship's mouth while the little ship is
 * carrying a mote inside the mouth's two-tile reach and the mouth is shut — the owner's *also
 * helping player that player needs to suck*, 29 September 2026. Both the
 * ship's place and home are drawn on her screen (`scout-round.ts` draws home
 * on all three), so the mark stands on
 * nothing she is not shown, and the word says what her thumb does rather than
 * where the ship should go next.
 *
 * - The moment is `scoutSuckWanted`, the rule the suck itself starts on
 *   (`sim/scout-suck.ts`), so the word cannot promise a press the simulation
 *   is about to refuse.
 * - It goes while the mouth stands open, because the press has already landed
 *   and the mouth shuts on its own (`scoutMawOpen`): a word over a button that
 *   has done its work is an invitation to spend the next window early.
 * - It asks only for a ship with a mote aboard: the ship is let go inside
 *   the reach, so a cue on an empty one would stand on the mouth from the
 *   first tick of every trip.
 *
 * Nothing outside `play`: the lead is for reading two screens and the verdict
 * for looking at one.
 */
export function scoutCues(l: Layout, world: World, s: ScoutState): readonly BossCue[] {
  if (s.phase !== "play") return [];
  if (!scoutSuckWanted(world.cfg, s)) return [];
  if (scoutMawOpen(s, world.tick, world.cfg.scoutMawTicks)) return [];
  const home = scoutAt(l, scoutHome(world.cfg.cols, world.cfg.rows));
  return [
    {
      seat: scoutNavigator(s),
      kind: "PRESS",
      word: "TAP",
      why: "TO OPEN THE MOUTH",
      x: home.x,
      y: home.y - l.tile * HOME_LIFT,
      ...cueFrame(l),
      seed: 78,
    },
  ];
}
