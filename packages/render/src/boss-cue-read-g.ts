import {
  type FleetState,
  fleetShipAt,
  fleetStruck,
  type SnakeState,
  snakeCrashed,
  snakeGrip,
  snakeResting,
  snakeShotStop,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { chartOf, chartX, chartY } from "./fleet-chart.js";
import type { Layout } from "./layout.js";
import { type Arena, arenaX, arenaY, snakeArena } from "./snake-draw.js";
import { snakeHint } from "./snake-hint.js";

/**
 * **What the rounds drawn as a chart are asking for** — page seven of the
 * readings: THE FLEET, SNAKE.
 *
 * A chart round has no field and no body: the picture is a grid of squares and
 * a cursor standing in one of them, and what the pair is arguing about is
 * *which square*. So the one thing a cue may never become here is a coordinate,
 * and the rule that decides every line below is #34's second — **it says the
 * verb and never the answer** — read against a fight whose whole content is
 * the answer.
 *
 * It is a page of its own rather than more of page five because page five is
 * at its limit and these have their own geometry: everything here hangs off
 * `chartOf` and a square's centre, never off the hull row or a tile of the
 * field (`fleet-chart.ts`).
 */

/** THE FLEET's sights, in chart squares: the brackets the verb hangs off, read
 * from `drawFleetSights` rather than guessed at. */
const SIGHTS_HALF = 0.46;

/** SNAKE's mark, in arena tiles: a shade inside the tile it stands on, so the
 * frame reads as being *on* that square and not between two of them. */
const TILE_HALF = 0.44;

/**
 * THE FLEET. One word, the pilot's, and the navigator gets none — the same
 * finding THE GAUGE's reading came to, arrived at from the opposite side of
 * the split.
 *
 * **She cannot be told anything true.** Her screen is water and the sights,
 * and the only word the field could put on her arrows is `MOVE`: said always,
 * it is not a cue but a fixture; said at the moment the sights are *not* on a
 * hull, it is the map — the one thing this fight exists to make the pilot get
 * out of his mouth, one square at a time. There is no third moment. So the
 * field says nothing at all to her for the whole round, and her page in the
 * film is the only thing that tells her anything.
 *
 * **He is told his own verb, at the moment it will land.** `PRESS` / `FIRE` on
 * the sights while they stand in a square that carries a hull and has not been
 * fired at. Both of those are on his screen already (`showsFleetHulls`, and
 * the marks are drawn on both), so the mark stands on nothing he is not shown
 * and the word says what his thumb does rather than which square it is. It is
 * not the round's difficulty either: seeing that the sights have arrived is
 * the easy half of his job, and the hard half — walking her there a coordinate
 * at a time before the clock runs out — happens in the beats when there is no
 * cue at all.
 *
 * **It draws no frame of its own.** The sights are four corner brackets
 * already (`fleet-marks.ts`), which is the cue's own picture, and a second box
 * round one square is the four-pictures-for-one-idea mistake `target-lock.ts`
 * records the owner ending. The half-extents are the sights' own, so the verb
 * hangs off the brackets rather than off a box nobody drew.
 *
 * **And it goes out while the salvo is resting.** The rest is the shell's own
 * flight (`config-fleet.ts`), so a word over a trigger that is refusing would
 * be an invitation to press nothing — THE MAZE's argument about a handle the
 * ship has taken away, on a button instead.
 */
export function fleetCues(l: Layout, world: World, f: FleetState): readonly BossCue[] {
  if (f.phase !== "hunt") return fleetHoleCues(l, world, f);
  if (world.beat - f.firedBeat < world.cfg.fleetSalvoRestBeats) return [];
  if (fleetStruck(world, f, f.aimCol, f.aimRow)) return [];
  if (fleetShipAt(f.ships, f.aimCol, f.aimRow) === -1) return [];
  const c = chartOf(l, world);
  if (c.tile <= 0) return [];
  const half = c.tile * SIGHTS_HALF;
  return [
    {
      seat: 1,
      kind: "PRESS",
      word: "FIRE",
      x: chartX(c, f.aimCol),
      y: chartY(c, f.aimRow),
      halfW: half,
      halfH: half,
      seed: 72,
      framed: false,
    },
  ];
}

/**
 * **The flood and the wreck, both seats told their own verb on the hole**
 * (`sim/fleet-state.ts`). Under the flood the navigator holds the plume and
 * the pilot rakes the hull from it, so she is told `HOLD` and he `RAKE`,
 * both on the holed square: the rake's direction is the hull's own, which
 * his screen shows and hers does not, and a word on the next square would
 * be the answer said out loud (#34). Under the wreck his thumb stays and
 * hers pulls, so the two words swap seats. The word to the navigator here
 * is not the hunt's silence broken: the plume is on both screens, and what
 * she is told is what her thumb does, never where the ship lies.
 */
function fleetHoleCues(l: Layout, world: World, f: FleetState): readonly BossCue[] {
  const c = chartOf(l, world);
  if (c.tile <= 0 || f.holed < 0) return [];
  const half = c.tile * SIGHTS_HALF;
  const at = { x: chartX(c, f.holeCol), y: chartY(c, f.holeRow), halfW: half, halfH: half };
  if (f.phase === "flood") {
    return [
      { seat: 2, kind: "HOLD", word: "HOLD", ...at, seed: 73, framed: true },
      { seat: 1, kind: "CARRY", word: "RAKE", ...at, seed: 74, framed: true },
    ];
  }
  return [
    { seat: 1, kind: "HOLD", word: "HOLD", ...at, seed: 75, framed: true },
    { seat: 2, kind: "CARRY", word: "PULL", ...at, seed: 76, framed: true },
  ];
}

/** The middle of an arena tile, which is where every mark in SNAKE stands. */
function tileMid(a: Arena, col: number, row: number): { x: number; y: number } {
  return { x: arenaX(a, col) + a.tile / 2, y: arenaY(a, row) + a.tile / 2 };
}

/**
 * SNAKE. One mark, on both screens: **EAT** on a point, **SHOOT** on an enemy.
 *
 * The owner, 25 September 2026: *the controls button is not clear if its
 * eating or shooting. and have a hint if to eat or to shoot, if the snake
 * looks on it or if its the most near item next to snake head* — and *all is
 * seen by both*. So the verbs are the words on player 1's two buttons, the
 * mark stands on the one item `snakeHint` picks, and the seat is `null`: the
 * driver steers to it, the shooter presses on it, and both are reading the
 * same arena.
 *
 * **The kind line says when.** Most of the time the mark is `soon`: the verb
 * alone, saying which press the item will want. `PRESS` goes over it only on
 * the step a press would land:
 *
 * - on a point in the tile the head is about to step onto. The mouth is a
 *   window rather than a hold and the rest is at least as long as the window
 *   (`snake-controls.ts`), so `PRESS` three tiles out would spend it before
 *   the body arrives. Past `snakeGorgeTiles` the press is a dead button and
 *   the mouth is pulled open on the head instead, so the kind is `CARRY`,
 *   which draws no line (`saysKind`);
 * - on the enemy a shot taken this instant would reach — `snakeShotStop`'s
 *   answer, the round's own walk, so the word cannot promise a hit a meteor
 *   would take — while the trigger is not resting.
 *
 * Nothing at all outside `play` — the fold is a picture, the verdict is over,
 * and a crashed body has no head to spit out of — and nothing on the way
 * home, which has its own mark.
 */
export function snakeCues(l: Layout, world: World, s: SnakeState): readonly BossCue[] {
  if (s.phase !== "play" || snakeCrashed(s)) return [];
  const head = s.body[0];
  if (head === undefined) return [];
  const a = snakeArena(l, world.cfg);
  if (a.tile <= 0) return [];
  const hint = snakeHint(world.cfg.snakeCols, world.cfg.snakeRows, s);
  if (hint === null) return [];
  const half = a.tile * TILE_HALF;
  const at = { ...tileMid(a, hint.col, hint.row), halfW: half, halfH: half };
  if (hint.eat) {
    const next = hint.col === head.col + s.dirCol && hint.row === head.row + s.dirRow;
    const kind = snakeGrip(world.cfg, s) === "crawl" ? "PRESS" : "CARRY";
    return [{ seat: null, kind, word: "EAT", ...at, seed: 75, soon: !next }];
  }
  const stop = snakeShotStop(world, s);
  const lands =
    stop !== null && stop.col === hint.col && stop.row === hint.row && stop.enemy !== -1;
  const now = lands && !snakeResting(world, s);
  return [{ seat: null, kind: "PRESS", word: "SHOOT", ...at, seed: 76, soon: !now }];
}
