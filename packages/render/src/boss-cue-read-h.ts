import {
  type PinballState,
  pinCannonMilli,
  pinCaught,
  type ScoutState,
  scoutAtHome,
  scoutHome,
  scoutMawOpen,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";
import { pinTable } from "./pinball-table.js";
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
 * **Both of them already talk, and that is what decides the page.** Each draws
 * a line of its own at the top, on both screens, every tick, and a cue that
 * said the same thing again three tiles lower would be the
 * four-pictures-for-one-idea mistake `target-lock.ts` records the owner
 * ending. They differ in what the line is, and so the readings differ: PINBALL
 * says *what is wanted now* (`waiting`), so only the one word its sentence
 * cannot say survives; THE SCOUT says *what this seat is for* (`job`), which
 * is a standing fact and leaves every moment in the round unspoken.
 */

/** THE CHOIR's frame, in tiles: the size of this mark, as on every page. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/**
 * **How far above the plating the mark on the cannon stops**, in tiles —
 * frame, gap and word together, which is why it is more than `HALF_H`.
 *
 * The cannon *is* the floor of the table, so a mark left on it would hang its
 * verb over the hull and the band (`boss-cue-text.ts` puts the word under the
 * frame and never over it).
 *
 * **The two lifts on the field are gone and this one is not**, which is worth
 * a line. THE WARDEN's handle and THE UNDERTOW's lobes each carried one of
 * these until 21 September 2026, and both came down: `cueWordY` flips a verb
 * that would land in the membrane above its mark instead, so nothing has to be
 * lifted to keep a word readable (`BossCue.hullTop`). That rule is the *hull's*
 * — a cue passing through `bossCue` is stamped with `skinY` under it — and
 * PINBALL's table is not the hull. Its floor is the band under `pinTable`, a
 * place `hullTop` says nothing about, so the arithmetic here is still the only
 * thing holding the word off it.
 */
const HULL_LIFT = 1.7;

/**
 * PINBALL. One word, the pilot's, and the navigator is told nothing at all.
 *
 * **She cannot be told anything the round does not already say.** Her whole
 * seat is one press on the bar, in one phase, and the header names it in a
 * sentence addressed to her for every tick of that phase. A mark over the bar
 * would add a box and no fact: it could not say *when*, because when is the
 * answer and the bar filling and emptying is the question, and the round has
 * no sub-state inside `power` to come out in. So nothing. It is the third
 * navigator in a row who is told nothing (THE FLEET, SNAKE) and the first for
 * this reason: not a half of the picture she is not shown, but a half the
 * round has already said out loud.
 *
 * **He is told the one thing the sentence cannot say: that he is wrong now.**
 * *Get the cannon under it* stands from the first tick of a flight to the
 * last, whether the cannon is under the ball or not. `CARRY` / `MOVE` comes
 * out only while it is **not**, and goes the moment it is — which is the one
 * fact in the round that changes tick by tick and that nothing marks.
 *
 * - It is asked of `pinCaught`, the rule the floor itself is judged by
 *   (`sim/pinball-board.ts`), so the word cannot disagree with the catch by
 *   half a tile.
 * - It is asked **of the ball where it is**, never of where it is going. A
 *   mark that led the ball would be the round's entire difficulty handed over
 *   — reading a bounce is what the pair is here to do — and #34's second rule
 *   said again: the verb, never the answer. It says nothing about which way to
 *   go either; both of them can see the ball, because this round has no
 *   picture split at all (`showsPinPieces`).
 * - It stands on the cannon and not on the ball, because the cannon is the
 *   thing his thumb moves, lifted clear of the plating so the verb is readable
 *   at all.
 *
 * Nothing outside `play`, and nothing while the ball is on the muzzle: in
 * `aim` and `power` the cannon is where the shot is being aimed from, and a
 * word telling him to move it then would be the field arguing with the
 * conversation it takes the sweep's six and a half seconds to make room for.
 */
export function pinballCues(l: Layout, world: World, b: PinballState): readonly BossCue[] {
  if (b.phase !== "play" || b.shot !== "flight") return [];
  if (pinCaught(world.cfg, b.ball.xMilli, world.cannonCol)) return [];
  const t = pinTable(l, world.cfg);
  const x = t.x + (pinCannonMilli(world.cfg, world.cannonCol) * t.tile) / 1000;
  return [
    {
      seat: 1,
      kind: "CARRY",
      word: "MOVE",
      x,
      y: l.hullY - l.tile * HULL_LIFT,
      halfW: l.tile * HALF_W,
      halfH: l.tile * HALF_H,
      seed: 77,
    },
  ];
}

/**
 * **How far above the mouth the navigator's mark stands**, in tiles.
 *
 * `scoutHome` is on the bottom row and the bottom row is the hull's skin, so
 * PINBALL's `HULL_LIFT` argument applies here with one thing added: what the
 * mark must also not cover is **the mouth itself** — the home ring is
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
 * **She is told her own one verb, at the moment it will land.** `PRESS` /
 * `OPEN` on the mother ship's mouth while the little ship is standing on it
 * and the mouth is shut. Both the ship's place and home are drawn on her
 * screen (`scout-round.ts` draws home on all three), so the mark stands on
 * nothing she is not shown, and the word says what her thumb does rather than
 * where the ship should go next.
 *
 * - The moment is `scoutAtHome`, the rule the bank itself is judged by
 *   (`sim/scout-arena.ts`), so the word cannot promise a press the simulation
 *   is about to refuse.
 * - It goes while the mouth stands open, because the press has already landed
 *   and the mouth shuts on its own (`scoutMawOpen`): a word over a button that
 *   has done its work is an invitation to spend the next window early.
 * - It says nothing about what is aboard. A ship that arrives empty is asked
 *   for the press anyway, and the cost of that press is nothing — which is
 *   better than a cue whose appearing is a report on the pilot's half of the
 *   picture.
 *
 * Nothing outside `play`: the lead is for reading two screens and the verdict
 * for looking at one.
 */
export function scoutCues(l: Layout, world: World, s: ScoutState): readonly BossCue[] {
  if (s.phase !== "play") return [];
  if (!scoutAtHome(world.cfg, s)) return [];
  if (scoutMawOpen(s, world.tick, world.cfg.scoutMawTicks)) return [];
  const home = scoutAt(l, scoutHome(world.cfg.cols, world.cfg.rows));
  return [
    {
      seat: 2,
      kind: "PRESS",
      word: "OPEN",
      x: home.x,
      y: home.y - l.tile * HOME_LIFT,
      halfW: l.tile * HALF_W,
      halfH: l.tile * HALF_H,
      seed: 78,
    },
  ];
}
