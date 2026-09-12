import { lureBlastCols } from "./creature-rules.js";
import { removeCreature } from "./field.js";
import { breachHull } from "./hull.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * What a shot does when it meets THE LURE. Its own file beside
 * `bullet-hit-boss.ts` and cut on the same terms — `bullet-hit.ts` sat at 250
 * lines exactly and every creature added brings a branch to it, so the next
 * lane would have been the one choosing where the cut went (`docs/queue.md`,
 * 6 September 2026). This is the longest single answer in that file and the
 * only one whose whole argument is about *not* shooting.
 */

/**
 * THE LURE: a full-size slick or bulb in every pixel player 1 owns, and
 * nothing about the shot matters except that it landed. Landing it is the
 * mistake. It turns the reflex that pays off against every other aim target
 * (match the colour, pull the trigger) into a decision the pair has to make on
 * purpose — and only one of them can see which body to make it about, so the
 * decision has to be spoken.
 *
 * The colour is deliberately not consulted. A lure wears one and a shot in it
 * would otherwise be a kill; testing it here would make a *wrong* colour the
 * cheaper mistake, and there is no such thing as a right shot at this body.
 *
 * **Reaching the hull is special-cased, and that is the reversal.** It used to
 * be the opposite here, for the Runt: the hull was left to the generic branch
 * because the only thing that kind changed was what a shot did to it. A lure
 * changes the other half too. It goes on its own, `lureVanishRows` up
 * (`lureIsSpent`, creature-rules.ts), so the hull branch never sees one — and
 * that is the whole vindication. Player 1 was told to leave a column and did
 * not want to; what they get back is the body disappearing by itself, which
 * nothing else in this game does.
 *
 * So the only way this creature can cost the pair anything is a shot, and the
 * hull is what it costs. Not the score: two currencies for one mistake reads
 * as bookkeeping, and the hull is the one the pair actually feels.
 *
 * **And it costs it in several places at once.** The bolt sets the body off
 * where it stands, two rows up, and the ship takes the blast in
 * `lureBlastPlaces` columns rather than one (`lureBlastCols`,
 * creature-rules.ts). The price is unchanged and is still one number — the
 * share below divides `damageLure` between the holes rather than charging it
 * per hole — but a mistake that used to leave nothing on the ship to look at
 * now leaves the hull broken in three places, which is the reading the pair
 * gets before they get as far as the bar.
 *
 * Each place goes through `breachHull`, so the scars, the `breach` events and
 * the picture at the hull are the same ones an arrival makes. Nothing about a
 * hole in the ship should depend on what tore it.
 */
export function resolveLure(world: World, _b: Bullet, hit: Creature): void {
  // Not null, and read once for both halves: `resolveLure` is the only branch
  // a lure can take with a shot in it, so it always carries the disguise's own
  // colour — and the blast and the holes it tears have to be the same colour,
  // or the pair is shown two different bodies coming apart.
  const color = hit.color ?? "cyan";
  // Before the breaches, because this is what happened and they are what it
  // cost: the ear and the eye both open on the body going up.
  world.events.push({ type: "lureHit", col: hit.col, row: hit.row, color });
  const cols = lureBlastCols(world.cfg, hit.col);
  for (const col of cols) breachHull(world, col, hit.kind, hit.row, "light", color);
  removeCreature(world, hit.id);
}
