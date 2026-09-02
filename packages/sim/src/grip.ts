import { ghostCrosses } from "./ghost.js";
import { type Creature, fallTilesPerBeat, isGrippable } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE GRIP: the one thing either player may do to the field itself.
 *
 * A finger held on something falling drags at it, and it falls slower for as
 * long as the finger stays. Nothing travels, nothing is destroyed and no
 * column changes — the rule is only a fall rate, which is why it can apply to
 * every creature in every wave, rocks included. A rock is the point, in fact:
 * it cannot be shot, so the only thing a second pair of hands could ever do
 * about one is buy the shield another beat to reach its column.
 *
 * The cost is the hand. A thumb on the field is a thumb off the strip below
 * it, so a player holding a rock for their partner is a player who is not
 * moving their own control — which is what makes this an assist rather than a
 * brake on the whole game.
 *
 * One hand per player, so at most two on the same creature, and two compound.
 */

/** No creature. A grip command carrying this id is a hand let go. */
export const NO_GRIP = 0;

/**
 * Take hold, or let go with `NO_GRIP`. A target that is not on the field is
 * dropped rather than remembered: the command was delayed by a few ticks
 * (`inputDelayTicks`) and whatever it named may have been shot in the meantime.
 *
 * The queen cannot be gripped. She does not fall — she holds her row until she
 * is made to descend — so a hand on her would drag at nothing while showing
 * every sign of working. A crossing ghost is refused for exactly that reason
 * arrived at from the other side: it walks its row and then dives, and neither
 * of those is a fall rate for a brake to scale (`stepGhostAcross`).
 */
export function setGrip(world: World, player: 1 | 2, id: number): void {
  const target = world.creatures.some((c) => c.id === id && canBeHeld(c)) ? id : NO_GRIP;
  if (player === 1) world.gripP1 = target;
  else world.gripP2 = target;
}

/**
 * Whether this player's hand is on this creature. Call this rather than
 * comparing `world.gripP1` by hand: which of the two fields a player owns is
 * this file's business, and render/, the HUD and the app all ask the same
 * question from three different places.
 */
export function gripsCreature(world: World, player: 1 | 2, id: number): boolean {
  if (id === NO_GRIP) return false;
  return player === 1 ? world.gripP1 === id : world.gripP2 === id;
}

/** How many hands are on it: 0, 1 or 2. */
export function gripCount(world: World, id: number): number {
  return (gripsCreature(world, 1, id) ? 1 : 0) + (gripsCreature(world, 2, id) ? 1 : 0);
}

/** Both hands off. A wave that starts over starts with nothing held. */
export function clearGrips(world: World): void {
  world.gripP1 = NO_GRIP;
  world.gripP2 = NO_GRIP;
}

/**
 * Let go of anything that is no longer on the field — shot, deflected or
 * through the hull. Ids are only unique within a run, and `resetClock` puts
 * `nextId` back to 1, so a grip kept past its creature would eventually name
 * somebody else's.
 */
export function dropLostGrips(world: World): void {
  if (world.gripP1 !== NO_GRIP) setGrip(world, 1, world.gripP1);
  if (world.gripP2 !== NO_GRIP) setGrip(world, 2, world.gripP2);
}

/**
 * How many tiles this creature falls on this beat. The whole of the grip's
 * effect, and the only place `fallTilesPerBeat` is scaled.
 *
 * A held creature keeps `gripSlowPermille` of its speed per hand, and the
 * fraction of a tile that leaves over is carried in `dragMilli` rather than
 * rounded away — a slick falls one tile a beat, so without the remainder the
 * only speeds it could have would be one tile and none at all.
 */
export function grippedFallTiles(world: World, c: Creature): number {
  const base = fallTilesPerBeat(c.kind);
  const hands = gripCount(world, c.id);
  if (hands === 0) {
    c.dragMilli = 0;
    return base;
  }
  let milli = base * MILLI;
  for (let i = 0; i < hands; i++) {
    milli = Math.floor((milli * world.cfg.gripSlowPermille) / MILLI);
  }
  milli += c.dragMilli;
  const tiles = Math.floor(milli / MILLI);
  c.dragMilli = milli - tiles * MILLI;
  return tiles;
}

/**
 * Whether a hand may be put on this body at all. Every refusal is one
 * sentence — *it is not falling, so there is nothing to drag at* — said about
 * a boss that holds her row, about a ghost that walks its own, and about the
 * five kinds `isGrippable` already names.
 *
 * It calls that rather than repeating it, and the two together are not one
 * list said twice: `isGrippable` answers about a *kind*, which is what render/
 * asks before it offers a body to a thumb, and a crossing ghost is a `ghost`
 * that happens to be walking — a fact about one body that no kind can carry.
 */
function canBeHeld(c: Creature): boolean {
  return isGrippable(c.kind) && c.kind !== "queen" && !ghostCrosses(c);
}
