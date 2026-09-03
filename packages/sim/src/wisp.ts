import { hullRow, type SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
import { nextInt } from "./rng.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE WISP: the first body that is on the field for one player and not for
 * the other at all, and the first that is never in the same place twice.
 *
 * THE VEIL hides *what* a body is from player 2; THE LURE hides *what* it is
 * from player 1. This one hides **where** it is, and it hides it from the
 * seat holding the cannon. Player 2 can see it and cannot aim; player 1 aims
 * and is looking at an empty field. Neither half is worth anything alone,
 * which is the rule every split in this game is built on
 * (docs/spec/systems.md 5.2).
 *
 * **It does not fall, and where it goes next is not a path.** Every other body
 * comes down a column, so a column said out loud is true for as long as it
 * takes to say — a dart makes that expire after a beat by *moving*, and this
 * one makes it expire by standing somewhere with no relation to where it
 * stood. Every `wispDwellBeats` it is somewhere else on the field, drawn from
 * the world's own stream, and nothing about where it was says anything about
 * where it will be. So there is no lane to hold: what player 2 has is a tile,
 * and a tile needs two words rather than one.
 *
 * **It arrives on the beat it leaves.** `stepWisp` writes the new tile at the
 * top of the hop beat and the beat loop has already put the old one in
 * `fromCol`/`fromRow`, so for the whole of that beat the simulation says the
 * body is on the tile it is heading for while render draws it crossing the
 * air between the two (`render/wisp.ts`). That is not a discrepancy to be
 * tidied away — it is the mechanic: `occupiesCol` answers a shot at the
 * landing tile from the moment the thing leaves the ground, so a tile called
 * while it is in the air is a tile the cannon can already be on when it comes
 * down. The jump is what buys the pair the room to say it.
 *
 * **Which is why it turns the grid on.** The lattice in `render/field.ts` has
 * been written and switched off since it was first drawn, with a comment
 * saying to flip it back on when a mechanic needs a player to call out a
 * square. This is that mechanic. While a wisp is on the field both screens
 * carry the tile grid and its axes — letters across, numbers down — so
 * "E nine" is a thing one of them can say and the other can act on.
 *
 * **The hop is on the shared beat, not on a clock of its own.** `throbIsOpen`
 * and `veilMorphs` both make this argument and it holds hardest here: player
 * 1 cannot see the body, so the only thing telling them a call has gone stale
 * is the count they already have in the ear and on the HUD. Two wisps on one
 * field therefore hop together, which is a feature — the pair reads one clock.
 *
 * **It carries no colour.** Either shot kills it, the way either shot lands
 * on an open throb: the whole of this creature is *where*, and a colour would
 * be a second sentence competing with the only one that matters. It also
 * never reaches the hull, because it never falls — so what it costs the pair
 * is the wave staying open and every beat they spend on it.
 */

/**
 * Whether every wisp on the field moves on this beat. Read straight off
 * `world.beat`, so the two devices never store a phase and player 1 can count
 * the hop without ever seeing one.
 */
export function wispHops(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.wispDwellBeats === 0;
}

/**
 * Rows a wisp may stand on: everything above the hull.
 *
 * The hull row is left out rather than clamped away, and that is the rule
 * rather than a nicety — `resolveHull` removes anything standing on it and
 * charges the ship for it, so a wisp that landed there would breach a hull
 * player 1 never saw it approach. This body's whole cost is the wave staying
 * open; it is never damage nobody could have answered.
 */
export function wispRows(cfg: SimConfig): number {
  return hullRow(cfg);
}

/** How many tiles a wisp can be standing on. */
export function wispTiles(cfg: SimConfig): number {
  return Math.max(1, cfg.cols * wispRows(cfg));
}

/**
 * Where it goes next: one tile drawn from every tile on the field except the
 * one it is on.
 *
 * **One draw, over `tiles - 1`, and the current tile skipped by index.** The
 * obvious spelling — roll a column, roll a row, roll again if it is the same
 * tile — takes an unbounded number of draws off the stream, and two devices
 * that consume different amounts of it disagree about every random thing that
 * happens afterwards. Rolling once into the field-minus-one and stepping past
 * the hole cannot do that, and it also cannot return the tile it started on,
 * which is the thing that would read as a hop that did not happen.
 *
 * A tile rather than a `Creature`, because `wispOnSpawn` rolls the first one
 * before there is a body to roll it for.
 */
export function wispHopTo(
  world: World,
  c: { col: number; row: number },
): { col: number; row: number } {
  const cols = world.cfg.cols;
  const tiles = wispTiles(world.cfg);
  const here = c.row * cols + c.col;
  if (tiles < 2) return { col: c.col, row: c.row };
  const roll = nextInt(world.rng, tiles - 1);
  const to = roll >= here ? roll + 1 : roll;
  return { col: to % cols, row: Math.floor(to / cols) };
}

/**
 * The first `wispNext`, rolled as the body is built.
 *
 * `dartOnSpawn`'s arrangement, one line below it in `spawn.ts`, and here for
 * the same reason spelled for a different creature: a wisp that arrived with
 * no next tile would give the navigator a whole first dwell — three and three
 * quarter seconds, the longest stretch of this creature's life — with nothing
 * on the screen to say. The square is on the field from the frame the body is.
 *
 * Row zero, because that is where an arrival stands: a wisp does not fall
 * (`fallTilesPerBeat` is zero for it), so the tile it is on when this is read
 * is the tile it will be on until the first hop.
 */
export function wispOnSpawn(world: World, col: number): { wispNext: number } {
  return { wispNext: tileIndex(world.cfg, wispHopTo(world, { col, row: 0 })) };
}

/**
 * The tile a wisp is going to next, as a tile index, or `undefined` on a body
 * that has not rolled one yet.
 *
 * A packed index and not a column and a row, for the reason every other pair
 * of numbers in `Creature` is not packed: this one is *rolled* rather than
 * moved to. `wispHopTo` already works in index space — one draw over the field
 * minus the tile it stands on — so storing what came off the stream, rather
 * than a decomposition of it, means the fingerprint hashes the roll itself and
 * `wispTileAt` is the one place it is ever taken apart.
 */
export function wispNextIndex(c: Creature): number | undefined {
  return c.wispNext;
}

/** A tile index back into a column and a row. The one place `wispNext` is
 * decomposed, so a site that wanted the tile cannot invent a second division. */
export function wispTileAt(cfg: SimConfig, index: number): { col: number; row: number } {
  return { col: index % cfg.cols, row: Math.floor(index / cfg.cols) };
}

/**
 * One beat of a wisp, in place of the fall every other kind takes.
 *
 * Called from `onBeat` instead of `grippedFallTiles`, which is why a wisp is
 * not grippable (`isGrippable`): a hand on it would drag at a number this
 * function never reads, and would show every sign of working.
 *
 * **The tile after this one is rolled here, the moment it lands.** That is
 * `dartNext`'s arrangement and it is here for a stronger version of the same
 * reason. A dart rolls its next side a beat early so a path can be previewed
 * while the body is still in the air; a wisp rolls its next *tile* on landing
 * so the square it is going to can be marked for the whole of the dwell. The
 * pair's problem was never seeing the body — player 2 can see it fine — it
 * was that a square only became sayable at the instant it stopped being true.
 * Rolled ahead, the square is on the screen from the moment the last jump
 * ends, and the whole dwell is time to say it, hear it, and put a cannon on
 * it. What the creature costs the pair is unchanged: it is still a tile that
 * has to cross the room in words.
 *
 * The roll is the same single draw it always was, off `wispHopTo`, from the
 * tile the body now stands on — so it can never name the tile it is already
 * on. One draw per hop and one at the arrival (`wispOnSpawn`), which is the
 * dart's arithmetic exactly.
 */
export function stepWisp(world: World, c: Creature): void {
  if (!wispHops(world.cfg, world.beat)) return;
  // `wispOnSpawn` puts the first one on the body, so the fallback is not a
  // case the game reaches — it is what keeps this total for a wisp built by
  // hand in a test, and it rolls exactly the draw the stored tile cost.
  const next = c.wispNext;
  const to = next === undefined ? wispHopTo(world, c) : wispTileAt(world.cfg, next);
  c.col = to.col;
  c.row = to.row;
  c.wispNext = tileIndex(world.cfg, wispHopTo(world, c));
}

function tileIndex(cfg: SimConfig, t: { col: number; row: number }): number {
  return t.row * cfg.cols + t.col;
}

/**
 * A shot met a wisp. Either colour lands it, for the throb's reason: the
 * ammunition was never the question this creature asks, so there is no such
 * thing as the wrong one and no colour miss to charge to anybody.
 *
 * It lives here rather than in `bullet-hit.ts` for `veilStruck`'s reason: it
 * is a rule about one creature, and that file is at its length limit.
 */
export function wispStruck(world: World, b: Bullet, hit: Creature): void {
  world.score += world.cfg.scoreWispKill;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  removeCreature(world, hit.id);
}

/**
 * Whether anything on the field is a wisp. Exported because it is the switch
 * on the coordinate grid, and render/ must ask it rather than filter for the
 * kind by hand at three draw sites.
 */
export function wispOnField(world: World): boolean {
  return world.creatures.some((c) => c.kind === "wisp");
}
