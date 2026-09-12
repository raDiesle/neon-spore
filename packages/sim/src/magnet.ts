import { metColor, missedColor } from "./balance.js";
import { wornKind } from "./creature-rules.js";
import { removeCreature } from "./field.js";
import { otherColor } from "./kinds.js";
import type { Bullet, Color, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MAGNET: the first body in this game that cannot be answered from the
 * column it is standing in.
 *
 * A horseshoe hanging on its two poles, one red and one cyan, with a flat
 * armoured plate slung under it on a staff. Everything since THE ROCK has
 * taught the pair one motion — put the muzzle under it and fire — and the
 * plate is that motion refused: a bolt climbing the magnet's own column
 * arrives square underneath, meets the plate and does nothing at all.
 *
 * **So the answer is THE LOCK, used as an aim rather than as a convenience.**
 * A shot only reaches a pole if it arrives **sideways**, and the only thing in
 * the game that sends a bolt sideways is player 1's hand held on a body: a
 * locked shot climbs its own column, turns level with the body and runs
 * straight across into it (`lock.ts`). So the pilot has to stand the cannon
 * away from the column — which is the one thing they have never had to do —
 * and hold the magnet.
 *
 * **And the side it comes in on is which trigger kills it.** The poles are the
 * two ammunition colours, left and right, so a shot arriving from the left
 * meets the left pole and a shot from the right meets the right one. Player 1
 * chooses the side, by choosing where to stand; player 2 holds both lobes and
 * has to know the side before the colour means anything. Neither half is worth
 * a shot alone, and the sentence between them is short enough to survive a
 * voice delay: *coming from your left*.
 *
 * **Both poles are drawn on both screens, and nothing is hidden.** This
 * creature is not a split, it is a *sequence* — the pilot commits to a side
 * and the navigator answers it — which is why `TALKER` names player 1 and the
 * word under the siren is the pole rather than a colour the other seat cannot
 * see (`render/comms.ts`).
 *
 * It carries no state of its own. Where it is *is* `col`, what it takes is the
 * bearing of the shot that reached it, and both pole colours are `color` and
 * its opposite.
 */

/**
 * The colour of the pole a shot on this bearing meets: the authored one on the
 * left, the other on the right.
 *
 * Left is `color` rather than a second field, and that is the whole of how one
 * body carries two colours without a wave having to author both. A magnet
 * authored red is red on the left and cyan on the right, always, so the shape
 * and the two colours on it mean the same thing every time the pair sees one —
 * which is what `creatures-table.ts` asks of every kind.
 *
 * The one place this is decided. Render draws the poles off it and the shot
 * resolves against it, so the colour the pair is looking at and the colour the
 * bolt has to match cannot become two facts.
 */
export function magnetPoleColor(c: Creature, fromLeft: boolean): Color | null {
  if (c.color === null) return null;
  return fromLeft ? c.color : otherColor(c.color);
}

/**
 * Whether this shot arrived from the side rather than from underneath.
 *
 * **One question and no number.** A locked bolt climbs its own column, turns
 * level with the body and runs *straight across* into it (`lock.ts`), so what
 * reached a magnet is either travelling sideways or it is not — and `aimMilli`
 * is exactly that, thousandths of a column crossed on the tick it landed. A
 * shot fired up the magnet's own column has nowhere to turn to and arrives
 * carrying a zero; so does every unlocked shot, and so does one locked on some
 * other body that happens to be climbing through this column. All three met
 * the plate, and all three met it for the one reason the picture shows.
 *
 * It was a slant against `magnetSlantMilli` while the lock steered a diagonal,
 * and the threshold went with the diagonal: an approach that is horizontal or
 * vertical and never anything in between has nothing left to compare.
 */
export function magnetLetsThrough(_world: World, b: Bullet): boolean {
  return b.aimMilli !== 0;
}

/**
 * A shot met a magnet. Three answers, and the pair can tell all three apart by
 * looking at the body rather than at the score.
 *
 * The plate turning a bolt away is deliberately **not** booked as a colour
 * miss: the ammunition was never the question, the bearing was. Booking it
 * would read one pilot's mistake to the navigator's balance, which is the
 * argument `colour-armour.ts` already makes about a shot into a closed window.
 *
 * And it deliberately opens no wrong-colour window. THE THROB's reason exactly:
 * this body already carries a fact the pair is reading off the picture — which
 * pole is which — and a second clock laid over it would leave them with no way
 * to know which of the two refused the shot.
 */
export function magnetStruck(world: World, b: Bullet, hit: Creature): void {
  if (!magnetLetsThrough(world, b)) {
    world.events.push({ type: "magnetPlate", col: hit.col, row: hit.row, color: b.color });
    return;
  }
  // Positive is a bolt crossing towards higher columns, so it came from the
  // left of the body and meets the pole on that side.
  const fromLeft = b.aimMilli > 0;
  if (magnetPoleColor(hit, fromLeft) !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return;
  }
  metColor(world);
  world.events.push({
    type: "destroy",
    col: hit.col,
    row: hit.row,
    color: b.color,
    kind: wornKind(hit),
  });
  // Beside the kill rather than instead of it, on `veilTorn`'s terms: the kill
  // is a kill and gets the kill's burst, its sound and its score, and this is
  // the arch coming apart on top of it — which needs the side, because the two
  // halves are thrown the way the bolt was going (`render/magnet-break.ts`).
  world.events.push({
    type: "magnetBreak",
    col: hit.col,
    row: hit.row,
    color: b.color,
    fromLeft,
  });
  removeCreature(world, hit.id);
}
