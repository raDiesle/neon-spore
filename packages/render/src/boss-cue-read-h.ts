import { type PinballState, pinCannonMilli, pinCaught, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";
import { pinTable } from "./pinball-table.js";

/**
 * **What the round that kept the ship is asking for** — page eight of the
 * readings, opened for PINBALL.
 *
 * It is a page of its own because PINBALL is the one round with a hull, a band
 * and a cannon still in the frame: its geometry is neither the field's tiles
 * (page one to six) nor a chart's squares (page seven) but the table's own
 * thousandths, hung off `pinTable` and pinned to `l.hullY`.
 *
 * **And because this round already talks.** Its header writes a whole
 * sentence, addressed, on both screens, every tick — *you fire on the bar*,
 * *they stop the needle*, *get the cannon under it* (`pinball-round.ts`'s
 * `waiting`). Nothing else in the game does that, and it is what decides the
 * shape of this page: a cue that said the same verb again, in a box, three
 * tiles lower, would be the four-pictures-for-one-idea mistake
 * `target-lock.ts` records the owner ending. So the one word here is the one
 * the sentence cannot say.
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
 * frame and never over it). THE WARDEN's `HULL_LIFT` answers the same question
 * on the field and the figure is the same one, measured on the frame rather
 * than reasoned about (`boss-cue-read-f.ts`).
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
