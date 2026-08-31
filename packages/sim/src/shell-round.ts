import { nextInt } from "./rng.js";
import {
  shellHasPiece,
  shellIsBare,
  shellPieceAt,
  shellPiecesLeft,
  shellWithout,
} from "./shell.js";
import type { Bullet, Color, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * The round the pair plays against THE SHELL, which is two rounds and the turn
 * between them.
 *
 * **While the shell is on, the arrival is colour-blind.** Either colour chips
 * a piece off, so nobody has to be told which to load and player 2 has nothing
 * to get wrong: the only thing that decides a hit is the column, which is
 * player 1's half. The pair's sentence is one word long — *four, keep going*.
 *
 * **The instant the last piece goes, the colour is the question again — and
 * it is a colour both of them have been looking at the whole way down.** The
 * body under the plating is an ordinary slick or bulb, authored in an
 * ordinary colour, and the armour never hid it: it shines out of the splits,
 * and it stands bare on whichever half has already been chipped. So a body
 * that was answered by anything is suddenly answered by exactly one thing,
 * at a row much lower than the one it arrived at.
 *
 * The colour used to be drawn from the rng at the moment of exposure, so that
 * nobody could know it in advance. That is gone on purpose. What it bought
 * was one beat of surprise; what it cost was the picture — a body with no
 * colour cannot have light coming out of its cracks, and the cracks are what
 * say *shielded, but not permanently* before either player has been told
 * anything. What the armour buys instead is **order**: player 2 can be loaded
 * correctly from the moment it enters and still cannot spend the shot until
 * player 1 has named and cleared both columns. That is the same trade THE
 * CLASP makes one wave later, and it is a trade about the pair talking rather
 * than about one of them being ambushed.
 *
 * **And a shot into a column whose piece is already off does nothing.** It
 * sparks against the hard core, which is what `docs/spec/systems.md` 5.6 says
 * a cratered meteor does, and it is the reason two pieces are worth having:
 * once one is gone the pair has to name *which* column still carries armour,
 * and that is a sentence they did not have to say a beat earlier.
 */

/** The two a body can be, for the fallback in `bareTheCore` only. Nothing
 * else in this file decides a colour — an arrival brings its own. */
const CORE_COLORS: readonly Color[] = ["red", "cyan"];

/**
 * A shot met a shelled body. Never called once the core is bare — a bare shell
 * is an ordinary coloured body and `bullet-hit.ts` kills it down the same path
 * as a slick, deliberately, so "then it needs the matching shot like any other
 * body" is one code path and not two.
 *
 * The shot is always spent, lance or not. A lance goes through bodies of its
 * own colour, and armour has no colour to be of.
 */
export function shellStruck(world: World, b: Bullet, hit: Creature): void {
  const piece = shellPieceAt(hit, b.col);
  if (piece < 0) return;

  if (!shellHasPiece(hit, b.col)) {
    // Bared column, core still armoured elsewhere. Deliberately not a colour
    // miss: the ammunition was never the question here, and charging it to the
    // colour balance would read the failure to the wrong player.
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }

  hit.shell = shellWithout(hit.shell, piece);
  world.score += world.cfg.scoreShellPiece;
  world.events.push({
    type: "shellBreak",
    col: b.col,
    row: hit.row,
    left: shellPiecesLeft(hit),
  });
  if (shellIsBare(hit)) bareTheCore(world, hit);
}

/**
 * The last piece is off. The colour was authored on the arrival and has been
 * visible through the splits since it entered, so there is nothing to decide
 * here — this is the announcement, not the draw.
 *
 * The rng branch is not a mechanic, it is the guard on an authoring slip: a
 * shell entered with no colour would come out of its armour answerable by
 * nothing at all, which is a body that cannot be killed rather than one that
 * is hard. `world.rng` rather than a stream of its own, so two devices in
 * lockstep pick the same one on the same tick and `rng.state` carries it into
 * `hashWorld`.
 *
 * The event carries the body's own column rather than the struck one — it is
 * about the whole body changing hands, not about the tile the shot landed in.
 */
function bareTheCore(world: World, hit: Creature): void {
  const color = hit.color ?? CORE_COLORS[nextInt(world.rng, CORE_COLORS.length)] ?? "red";
  hit.color = color;
  world.events.push({ type: "shellBare", col: hit.col, row: hit.row, color });
}
