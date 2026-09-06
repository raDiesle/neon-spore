import type { SimConfig } from "./config.js";
import { nextInt, type Rng } from "./rng.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE VEER: the first rock that does not hold its lane.
 *
 * Every other rock in the game is a column said once. Player 1 reads one off
 * the strip, says a number, and player 2 has the whole fall to put the shield
 * there — the number never goes stale, which is why a pair who have learned
 * the ward can park the shield and stop looking. This one expires every three
 * rows, from the top of the field to the row the shield answers at.
 *
 * **One to four tiles to one side, every `veerRowsApart` rows, the whole way
 * down.** It falls a row a beat like the plain tier and steps sideways as it
 * lands on every row that is a multiple of the spacing — so the *when* is a
 * thing both players can learn and count, and only the *which way* is hidden.
 * That split is deliberate: a body whose timing and side were both secrets
 * would be a body the pair can only answer by luck, and the pair are supposed
 * to be talking rather than guessing.
 *
 * **It never settles.** There were three changes and then a tail of straight
 * fall, so the pair could watch the rock arrive in the lane it would land in;
 * the owner cut the tail on 6 September 2026 and the reason is the whole
 * creature. A rock that stops moving is answered by the habit every other rock
 * rewards — say the column once, park the shield, stop looking — and a
 * creature written to break that habit must not hand it back on the last five
 * rows. The last change lands one row above the shield's, so there is no
 * height at which the pair may stop listening.
 *
 * **How far is rolled fresh with every change, up to `veerMaxDist`, and it is
 * not a secret.** A rock that always moved one tile would be answerable by a
 * shield that just shadows it without anyone saying anything; the width has
 * to vary for the side to be worth calling out. But the width is not the
 * thing that decides which lane the shield stands in without the side too, so
 * it costs the pair nothing to see it — it is drawn above the arrow, on both
 * screens, while the arrow itself stays where it always was.
 *
 * **And the seat that can see the side is the seat that cannot move the
 * shield.** A rock is player 1's on the radar and player 2's on the field
 * (docs/spec/roles.md), so the arrow over the rider is drawn on the pilot's
 * screen and the navigator — who holds the thing that answers it — is shown
 * the rock, the width and nothing else (`render/veer-marks.ts`). THE DART's
 * arrangement has the seats the other way round, which is the same reason it
 * is the other way round there: whoever is told is never whoever acts.
 *
 * **It keeps no count.** There is nothing left to count now that the changes
 * run to the ship: whether this row is one of them is `row` against
 * `veerRowsApart` and nothing else (`veerRowIsChange`), so there are only two
 * numbers on the creature and they are the side and the width of the next
 * change. A stored countdown would be a second copy of something the row
 * already says, and the two could disagree the first time a hand on the rock
 * held it still for a beat.
 */

/** Which way a veer's next change of lane goes: left or right. */
export type VeerDir = -1 | 1;

/** A side and a width together — one change of lane, not yet taken. */
export interface VeerChange {
  dir: VeerDir;
  dist: number;
}

/**
 * The side the next change takes. A rule rather than `c.veerDir ?? 1` at each
 * site: the arrow on player 1's screen, the way the rider leans and the column
 * the rock actually steps into are three pictures of one number, and a rider
 * leaning one way under an arrow pointing the other is the one defect this
 * creature cannot survive.
 */
export function veerHeading(c: Creature): VeerDir {
  return c.veerDir === -1 ? -1 : 1;
}

/**
 * How wide the next change is, in columns. One rather than zero when the
 * field is somehow missing it, for the same reason `veerHeading` never
 * answers zero: a change with no width would be a change with no picture to
 * draw over the rider, and the field always carries one on a live veer.
 */
export function veerDist(c: Creature): number {
  return c.veerDist && c.veerDist > 0 ? c.veerDist : 1;
}

/**
 * Whether a body standing on this row has just landed on one of the rows a
 * veer changes lane at: every positive multiple of `veerRowsApart`, all the
 * way to the ship. The row above the top is not one of them, so a rock that
 * has only just entered is not asked to step before it has fallen.
 */
export function veerRowIsChange(cfg: SimConfig, row: number): boolean {
  return row > 0 && row % cfg.veerRowsApart === 0;
}

/**
 * Rows between a body on this row and its next change of lane. One means it
 * changes at the end of this very beat, which is what the rider's crouch is
 * drawn off — a tell that says *now* on both screens without saying *which
 * way*, exactly as the dart's jet does.
 *
 * It never answers "none": a veer has a change ahead of it at every height,
 * which is why render draws the arrow over one for the whole of its fall
 * rather than gating on a count (`veer-marks.ts`).
 */
export function veerRowsToChange(cfg: SimConfig, row: number): number {
  return cfg.veerRowsApart - (row % cfg.veerRowsApart);
}

/** Whether a rock in this column could take a whole change of `dist` tiles to
 * that side without stepping off the field. */
export function veerFits(col: number, cols: number, dir: VeerDir, dist: number): boolean {
  const to = col + dist * dir;
  return to >= 0 && to <= cols - 1;
}

/** Where a change of `dist` tiles to `dir` lands it, clamped onto the field. */
export function veerStepCol(col: number, cols: number, dir: VeerDir, dist: number): number {
  return Math.max(0, Math.min(cols - 1, col + dist * dir));
}

/**
 * The next change: a side and a width, rolled together. Width first, one to
 * `veerMaxDist` tiles; side second, between the two, except where the field
 * will not take the roll on one or even both of them — `dartPickDir`'s rule,
 * and the same reason for it: a rock pinned flat against a wall for the rest
 * of its fall would stop being a rock that moves, which is the whole
 * creature.
 *
 * When neither side has room for the width it rolled, the change keeps the
 * side with the more room to give and shrinks to whatever that side can take,
 * rather than discarding the roll and drawing again — a second draw here
 * would be a rock whose distance depended on how close to a wall it happened
 * to land, which is exactly the kind of fact this creature must not carry.
 *
 * The rng is drawn from exactly twice per change, wall or no wall, so two
 * devices consume the same stream whatever the column. Never fold either
 * fitting test into a draw.
 */
export function veerPickChange(rng: Rng, col: number, cols: number, maxDist: number): VeerChange {
  const dist = nextInt(rng, maxDist) + 1;
  const roll: VeerDir = nextInt(rng, 2) === 0 ? -1 : 1;
  if (veerFits(col, cols, roll, dist)) return { dir: roll, dist };
  const other: VeerDir = roll === -1 ? 1 : -1;
  if (veerFits(col, cols, other, dist)) return { dir: other, dist };
  const roomRight = cols - 1 - col;
  const roomLeft = col;
  const dir: VeerDir = roomRight >= roomLeft ? 1 : -1;
  return { dir, dist: Math.max(1, Math.min(dist, dir === 1 ? roomRight : roomLeft)) };
}

/**
 * One beat of a veer's sideways life, called from `onBeat` **after** the fall
 * rather than instead of it. Every other body that travels sideways — the
 * dart, the carom, the crossing ghost — replaces the fall, because a body that
 * both stepped and fell would be covering twice the ground it is drawn
 * covering. This one is the exception on purpose: falling *and* stepping is
 * exactly what the pair has to watch, and the diagonal it draws is one row by
 * up to `veerMaxDist` columns, which is the fall it already had plus the
 * width the pair was just shown.
 *
 * The first line is the whole of what makes the row-derived count safe. A hand
 * on the rock can hold it still for a beat (`grippedFallTiles`), and a body
 * that had not moved this beat would otherwise be asked the same row twice and
 * change lane twice at one height.
 */
export function stepVeer(world: World, c: Creature): void {
  if (c.row === c.fromRow) return;
  if (!veerRowIsChange(world.cfg, c.row)) return;
  c.col = veerStepCol(c.col, world.cfg.cols, veerHeading(c), veerDist(c));
  // Rolled from the column this change has just landed it in, so the edge test
  // above is asked about the right column and player 1 is never shown a side
  // the rock cannot take. `dartOnSpawn` states the same invariant.
  const next = veerPickChange(world.rng, c.col, world.cfg.cols, world.cfg.veerMaxDist);
  c.veerDir = next.dir;
  c.veerDist = next.dist;
}

/**
 * The change a veer arrives already aiming at. One roll, on the beat it
 * enters, from the column it enters in — so the arrow and its width are over
 * the rider for the whole of the first three rows and player 1 has a sentence
 * to say before anything has happened.
 */
export function veerOnSpawn(world: World, col: number): { veerDir: VeerDir; veerDist: number } {
  const change = veerPickChange(world.rng, col, world.cfg.cols, world.cfg.veerMaxDist);
  return { veerDir: change.dir, veerDist: change.dist };
}
