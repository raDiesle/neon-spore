import { clearGripPush } from "./grip-push.js";
import { handMeans } from "./hand.js";
import { type Creature, fallTilesPerBeat } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE GRIP: the one thing either player may do to the field itself.
 *
 * A finger held on **a rock** drags at it, and it falls slower for as long as
 * the finger stays. Nothing travels, nothing is destroyed and no column
 * changes — the rule is only a fall rate.
 *
 * **A rock, and nothing else.** The brake used to apply to every body that
 * fell, and the owner narrowed it on 6 September 2026: what a hand is worth
 * against a living body is that the cannon finds it (`lock.ts`), and a gesture
 * that both slowed a slick and aimed at it was two assists charged as one. A
 * rock is where the brake was always pointed anyway — it cannot be shot, so the
 * only thing a second pair of hands could ever do about one is buy the shield
 * another beat to reach its column. Which of the two a hand is on a given body
 * is `hand.ts`, and it is asked rather than repeated here.
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
 * **A press that would do nothing is refused**, and that is the whole of what
 * is asked here: `handMeans` says whether this seat's hand on this kind is a
 * brake, an aim or neither, and a hand that is neither is not taken. So the
 * queen refuses one because she does not fall, a ghost because its column is
 * the secret, and a slick refuses the *navigator's* because the aim it would
 * be belongs to the seat holding the cannon. Every one of those used to be a
 * clause in this file; all of them are one call now (`hand.ts`).
 */
export function setGrip(world: World, player: 1 | 2, id: number): void {
  const holds = (c: Creature) => c.id === id && handMeans(c.kind, player) !== null;
  const target = world.creatures.some(holds) ? id : NO_GRIP;
  const was = player === 1 ? world.gripP1 : world.gripP2;
  if (player === 1) world.gripP1 = target;
  else world.gripP2 = target;
  // A hand that has moved to another body, or come off the glass, is carrying
  // nothing: the columns it had spent were spent on the body it was on, and a
  // carry kept across the change would earn one on the new body that the
  // finger never travelled for (`grip-push.ts`).
  if (target !== was) clearGripPush(world, player);
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

/**
 * The body this seat's hand is on, or `NO_GRIP` for a hand on nothing.
 *
 * The reading `gripsCreature` cannot give: a caller that already knows the id
 * asks that, and a caller that wants to *name* the body — a film carrying it a
 * column, which has no id to guess (`scene-aim.ts`) — asks this. Both ask
 * rather than reading `world.gripP1`, because which of the two fields a seat
 * owns is this file's business and nowhere else's.
 */
export function gripOf(world: World, player: 1 | 2): number {
  return player === 1 ? world.gripP1 : world.gripP2;
}

/** How many hands are on it: 0, 1 or 2. Whether either of them is doing
 * anything to the fall is `gripBrakes` below — this counts fingers. */
export function gripCount(world: World, id: number): number {
  return (gripsCreature(world, 1, id) ? 1 : 0) + (gripsCreature(world, 2, id) ? 1 : 0);
}

/**
 * How many of those hands are **braking**: 0, 1 or 2.
 *
 * The two counts came apart when the brake was narrowed to rocks. A hand on a
 * living body is an aim and drags at nothing, so a fall rate or a picture that
 * went on reading `gripCount` would be slowing a slick that is not slowing —
 * the one class of mistake this mechanic cannot afford, because the whole of
 * it is the *other* player planning around a beat they were given.
 *
 * It asks `handMeans` per seat rather than testing the kind once: a brake is a
 * fact about a hand, and the day a body brakes for one seat and aims for the
 * other this is already right.
 */
export function gripBrakes(world: World, c: Creature): number {
  let hands = 0;
  for (const player of [1, 2] as const) {
    if (gripsCreature(world, player, c.id) && handMeans(c.kind, player) === "brake") hands++;
  }
  return hands;
}

/** Both hands off. A wave that starts over starts with nothing held. */
export function clearGrips(world: World): void {
  world.gripP1 = NO_GRIP;
  world.gripP2 = NO_GRIP;
  clearGripPush(world, 1);
  clearGripPush(world, 2);
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
 * A braked creature keeps `gripSlowPermille` of its speed per hand, and the
 * fraction of a tile that leaves over is carried in `dragMilli` rather than
 * rounded away — the slowest rock falls one tile a beat, so without the
 * remainder the only speeds it could have would be one tile and none at all.
 *
 * `gripBrakes` and not `gripCount`: a pilot's hand on a slick is an aim, and
 * that body falls at its own speed with a finger on it (`hand.ts`).
 */
export function grippedFallTiles(world: World, c: Creature): number {
  // A body THE CLAW's arm let go of comes down at the torch's speed whatever
  // it is, and no hand slows it: it is not falling any more, it has been
  // *dropped* (`creature-state-held.ts`, `dropped`). Asked before the grip
  // because a hand on a dropped body would otherwise take the hurry back out
  // of it, which is the one thing the arm's mistake must not be undoable by.
  if (c.dropped === true) return fallTilesPerBeat("torch");
  const base = fallTilesPerBeat(c.kind);
  const hands = gripBrakes(world, c);
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
 * The creature closest to the hull that **this seat's hand would do something
 * to**, or `NO_GRIP` — which since the brake was narrowed to rocks is a
 * question about the seat and not only about the kind: a rig's grip key is one
 * player's hand, and player 2 has no aim (`hand.ts`).
 *
 * Asked rather than answered by a caller — a key that took hold of a slick for
 * the navigator would send a command `setGrip` above refuses and leave the rig
 * showing a hand that is not there. It lives here rather than in the app
 * because there are two rigs and they must not disagree: `apps/game`'s desk
 * keys and the director's stage keyboard both ask this, and the copy the
 * director kept differed from the game's in exactly the branch it never had.
 */
export function nearestHull(creatures: readonly Creature[], player: 1 | 2): number {
  let best = NO_GRIP;
  let bestRow = -1;
  for (const c of creatures) {
    if (handMeans(c.kind, player) === null || c.row <= bestRow) continue;
    best = c.id;
    bestRow = c.row;
  }
  return best;
}
