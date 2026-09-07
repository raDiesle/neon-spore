import { markMoment } from "./balance.js";
import { breachUnscarred } from "./hull-damage.js";
import { livingKindForColor } from "./kinds.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CHOIR: two bodies in one membrane, and the first body in this game that
 * **no button can reach**.
 *
 * Everything else on the field is answered by a thing on a panel. A slick is
 * shot, a rock is warded, THE CLASP is triggered open and THE LID is held
 * apart by a cord — four couplings, all four of them made out of strips, lobes
 * and handles. This one is answered by *shaking the device*, and where a
 * device cannot report a shake, by carrying two arrows off the two edges of
 * the field one after the other. That is the whole creature: the pair still
 * cannot do it alone — player 1 has the gesture and player 2 has the only
 * cannon — but the half player 1 holds has stopped being a thumb on a circle.
 *
 * **The gesture itself is `choir-gesture.ts` next door**, and the seam is the
 * one the file names: this is what the *body* is and what happens to it, and
 * that is what the *hand* does. The body half is finished — a kind, a colour,
 * a width and two things that can happen to it — and the hand half is the part
 * that grows every time a device learns a new way to be shaken.
 *
 * **What it becomes is not authored**, `claspBecomes`' rule one creature on:
 * `packages/content/src/creatures.ts` fixes one colour to one silhouette, so a
 * red choir can only ever draw together into a slick and a cyan one into a
 * bulb. `livingKindForColor` is the one copy of that pairing.
 */

/** Whether this body is still two bodies. The kind *is* the state — there is
 * no `merged` flag, for the reason `claspIsShielded` gives next door. */
export function choirIsDots(c: Creature): boolean {
  return c.kind === "choir";
}

/**
 * Whether any membrane is still on the field. What the arrows and the shake
 * are drawn and answered against: a gesture with nothing to merge is one that
 * costs nothing and does nothing.
 *
 * It takes the **list** rather than the world, because render asks it too and
 * what render is handed is a `Field` (`touch-field.ts`) — a hit test that
 * spelled the `some` out by hand would be a second copy of what a membrane is,
 * and the arrows would go on being answered somewhere the picture had already
 * stopped drawing them.
 */
export function choirOnField(creatures: readonly Creature[]): boolean {
  return creatures.some(choirIsDots);
}

/**
 * The kind a choir draws together into. Read off its colour through the one
 * function that owns the colour-to-silhouette pairing, never written out here.
 *
 * A choir built without a colour becomes a slick, the fallback `claspBecomes`
 * and `wornKind` both reach for and for their reason: a body has to be *some*
 * body. Nothing in the game builds one — `authorsColor` is set on this kind,
 * so a wave writes the colour down.
 */
export function choirBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * A shot met a membrane that has not been drawn together yet.
 *
 * Deliberately **not** a colour miss, `claspStruck`'s argument one creature
 * on: the ammunition may have been exactly right and the gesture simply not
 * made, which is a failure of the pair's order of operations rather than of
 * player 2's choice. Charging it to the colour balance would read the failure
 * to the wrong player.
 */
export function choirStruck(world: World, hit: Creature): void {
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
}

/**
 * The thing sings, and the hull pays for it.
 *
 * **A miss costs the hull**, and that is the owner's decision rather than a
 * balance figure: a lapsed window and an arrow carried the wrong way both make
 * it sing, because a mechanic where every option quietly works out is one
 * nobody is playing.
 *
 * `breachUnscarred` rather than `damageSpan`: nothing struck the ship. A scar
 * is a crack drawn where a body landed, and drawing one for a sound would put
 * damage on the hull in a place nothing ever hit — which is exactly the defect
 * the owner named when he asked for damage to be drawn where it landed.
 *
 * Once for the whole field however many membranes are up, because it is one
 * chord. The column and the row are the first one's, so the burst comes out of
 * a body the pair can see rather than out of the middle of the screen.
 */
export function singChoirs(world: World): void {
  const first = world.creatures.find(choirIsDots);
  if (first === undefined) return;
  markMoment(world, false);
  const col = first.col;
  world.events.push({ type: "choirSing", col, row: first.row });
  breachUnscarred(world, col, "choir", first.fromRow, world.cfg.damageChoirSong, first.color);
}

/**
 * Every membrane on the field draws together into the body it was hiding.
 *
 * It reaches every one of them, the way `breakClaspsInColumn` reaches every
 * clasp in a column — with the difference that neither a shake nor a pair of
 * arrows has a column to be in.
 *
 * **The lane never moves**, and that is the whole of what changed when this
 * creature stopped hanging across three columns. It is one tile wide the
 * entire time: the two bodies orbit each other *inside* their own lane and the
 * one they become stands in the same lane, so the column player 2 was given is
 * the column that still answers. A body that arrived three wide and left one
 * wide made the pair re-read a number they had already said out loud.
 */
export function mergeChoirs(world: World): void {
  for (const c of world.creatures) {
    if (!choirIsDots(c)) continue;
    const color = c.color;
    c.kind = choirBecomes(c);
    markMoment(world, true);
    world.score += world.cfg.scoreChoirMerge;
    world.events.push({
      type: "choirMerge",
      id: c.id,
      col: c.col,
      row: c.row,
      kind: c.kind,
      ...(color === null ? {} : { color }),
    });
  }
}
