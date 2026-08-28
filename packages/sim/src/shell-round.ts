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
 * **The instant the last piece goes, the colour comes back and it is new.**
 * The body under the shell has no colour at all until it is uncovered — not
 * hidden from one screen, not hidden from render, *absent from the world* —
 * and it is drawn from the seeded rng at the moment of exposure. So a body
 * that was answered by anything is suddenly answered by exactly one of two
 * things, at a row much lower than the one it arrived at, and neither player
 * had any way to prepare for it. That reversal is the creature; everything
 * else here serves it.
 *
 * **And a shot into a column whose piece is already off does nothing.** It
 * sparks against the hard core, which is what `docs/spec/systems.md` 5.6 says
 * a cratered meteor does, and it is the reason two pieces are worth having:
 * once one is gone the pair has to name *which* column still carries armour,
 * and that is a sentence they did not have to say a beat earlier.
 */

/** The two the core can turn out to be. Neither is knowable before the break. */
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
 * The last piece is off. The colour exists from this line onwards and did not
 * exist before it — which is the only honest way to say that nobody knew it,
 * since a colour stored on the body at spawn is a colour something could have
 * drawn a beat early.
 *
 * `world.rng` rather than a stream of its own: two devices in lockstep break
 * the same piece on the same tick, so they draw the same colour, and
 * `rng.state` is in `hashWorld` — a device that somehow did not would be
 * caught on the very next tick instead of at the end of the wave. It is the
 * same argument the pod's drift direction makes (docs/spec/structure.md): what
 * neither player may know in advance is exactly what the seeded rng is for.
 *
 * The event carries the body's own column rather than the struck one — it is
 * about the whole body changing hands, not about the tile the shot landed in.
 */
function bareTheCore(world: World, hit: Creature): void {
  const color = CORE_COLORS[nextInt(world.rng, CORE_COLORS.length)] ?? "red";
  hit.color = color;
  world.events.push({ type: "shellBare", col: hit.col, row: hit.row, color });
}
