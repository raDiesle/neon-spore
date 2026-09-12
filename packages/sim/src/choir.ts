import { markMoment } from "./balance.js";
import { ticksPerBeat } from "./config.js";
import { breachUnscarred } from "./hull-damage.js";
import { livingKindForColor } from "./kinds.js";
import type { Creature, CreatureKind } from "./types.js";
import { MILLI, type World } from "./world.js";

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

/** Whether this body is still a membrane — two bodies, or two drawing
 * together. The kind *is* the state, for the reason `claspIsShielded` gives
 * next door: nothing a shot carries reaches either of these. */
export function choirIsDots(c: Creature): boolean {
  return c.kind === "choir";
}

/**
 * Whether the gesture has landed and the two are drawing together.
 *
 * The half-way state this creature did not have until the owner asked to watch
 * the merge: a membrane nobody has opened is *waiting*, one inside its fuse is
 * *closing*, and only after that is there a body to shoot. All three are the
 * kind plus one tick, so there is no flag to fall out of step with anything.
 */
export function choirIsFusing(c: Creature): boolean {
  return c.kind === "choir" && c.choirFuseTick !== undefined;
}

/**
 * How far through the closing this body is, in thousandths — 0 as the gesture
 * lands and 1000 as the colour arrives, and 0 for a membrane nobody has
 * opened.
 *
 * Thousandths because the simulation stores integers, and it is *stored*
 * nowhere: this is read off the tick counter every time it is asked, which is
 * what keeps the picture render draws and the shot the simulation refuses one
 * number rather than two that agree today.
 */
export function choirFuseMilli(world: World, c: Creature): number {
  if (c.choirFuseTick === undefined) return 0;
  const span = fuseTicks(world);
  if (span <= 0) return MILLI;
  const gone = world.tick - c.choirFuseTick;
  return Math.max(0, Math.min(MILLI, Math.round((gone * MILLI) / span)));
}

function fuseTicks(world: World): number {
  return world.cfg.choirFuseBeats * ticksPerBeat(world.cfg);
}

/**
 * The same closing as a fraction, 0 to 1, which is what render draws it with.
 *
 * `veilArmourPhase`'s arrangement exactly: the *rule* is the integer next door
 * — thousandths, compared against a stored tick, so two devices cannot round
 * apart — and this is a reading of it for a picture, where a fraction is what
 * a radius wants multiplying by. Nothing in the simulation branches on it.
 */
export function choirFusePhase(world: World, c: Creature): number {
  return choirFuseMilli(world, c) / MILLI;
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
  return creatures.some((c) => choirIsDots(c) && c.choirFuseTick === undefined);
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
  breachUnscarred(world, col, "choir", first.fromRow, "light", first.color);
}

/**
 * The gesture landed: every membrane still waiting **starts to close**.
 *
 * It reaches every one of them, the way `breakClaspsInColumn` reaches every
 * clasp in a column — with the difference that neither a shake nor a pair of
 * arrows has a column to be in.
 *
 * **What it does not do is finish.** The kind stays `choir` and a tick goes on
 * the body; `stepChoirFuse` below is what turns it into a slick or a bulb, a
 * beat later. That is the owner's own sequence — watch two become one, *then*
 * the colour arrives, *then* it can be shot — and the reason it is a rule and
 * not a render trick is that a kind flipped on the instant would leave the
 * body shootable while it still looked like something no shot can reach.
 *
 * **The lane never moves**, which is the other half of the same argument: the
 * body is one tile wide the whole time, so the column player 2 was given is
 * the column that still answers when the colour finally arrives.
 */
export function mergeChoirs(world: World): void {
  for (const c of world.creatures) {
    if (!choirIsDots(c) || c.choirFuseTick !== undefined) continue;
    c.choirFuseTick = world.tick;
    world.events.push({ type: "choirMerge", id: c.id, col: c.col, row: c.row, kind: c.kind });
  }
}

/**
 * A membrane whose closing has run its length becomes the body it was hiding —
 * read on the tick, from `step`.
 *
 * This is where the colour arrives, and it is the only place it can: nothing
 * about a choir carries one until the kind is a slick or a bulb, which is
 * `choirBecomes` reading the arrival's authored colour through the one
 * function that owns the colour-to-silhouette pairing.
 *
 * The score is paid here rather than at the gesture, because this is the beat
 * the pair actually got something: a membrane still closing is a membrane, and
 * a run that ended halfway through one has not opened anything.
 */
export function stepChoirFuse(world: World): void {
  for (const c of world.creatures) {
    if (!choirIsFusing(c)) continue;
    if (choirFuseMilli(world, c) < MILLI) continue;
    const color = c.color;
    c.kind = choirBecomes(c);
    c.choirFuseTick = undefined;
    markMoment(world, true);
    world.score += world.cfg.scoreChoirMerge;
    world.events.push({
      type: "choirOpen",
      id: c.id,
      col: c.col,
      row: c.row,
      kind: c.kind,
      ...(color === null ? {} : { color }),
    });
  }
}
