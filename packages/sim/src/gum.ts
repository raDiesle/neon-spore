import { crossAwayFromWall } from "./cross.js";
import { clampSpanCol } from "./span.js";
import { type Command, type Creature, occupiesCol, spanOf } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GUM**: a sticky mass that falls straight down one lane, cannot be
 * shot, is not stopped by the shield, and does not break the hull — it
 * **sticks to it**, and from that beat the cannon cannot fire from any column
 * it covers. It stays until it is swiped off.
 *
 * **What answers it is the pair, by the seats reversed.** Player 1 has the
 * cannon and cannot swipe; player 2 can swipe and does not have the cannon.
 * A swipe counts only while the cannon is standing under the gum
 * (`occupiesCol`), so the one who cannot move the cannon has to say where to
 * park it, and the one who cannot swipe has to leave it there. The swipe is a
 * `drag` on the body itself (`DragTarget` `"gum"`), player 2's only, read the
 * way THE BALLOON's handles are read (`balloon-pull.ts`): cumulative from the
 * grab, resolved on the device whose finger it is.
 *
 * **Toward the nearer wall, and only that way.** A swipe of `gumSwipeMilli`
 * toward the side wall it is closer to flings it off the ship; the same swipe
 * away from that wall *spreads* it a lane wider toward the side it was pushed
 * — the wrong guess costs a lane of cannon, and the hand has to lift before it
 * may try again (`gumSpent`). Which wall is nearer is `crossAwayFromWall`
 * read backwards, the same rule that starts a carom off: deterministic from
 * the column, on both screens, and something player 1 can see and say.
 *
 * It has no step of its own: it falls by the ordinary fall, lands by the
 * ordinary clamp (`beat.ts`), and `resolveHull` hands it to `gumLands`
 * instead of to the breach. A body nothing can be done to in the air is
 * ungrippable for the reason the carom is (`grippable.ts`).
 */

/** Whether this body is a gum standing on the ship. Absent is not stuck: a
 * gum in the air is a body like any other, and a hand on it is nothing. */
export function gumIsStuck(c: Creature): boolean {
  return c.kind === "gum" && c.gumStuck === true;
}

/** Which way a swipe has to go to fling this one: **toward the nearer wall**.
 * A gum standing dead centre goes right, which is the side `crossAwayFromWall`
 * does not pick, so the two rules can never agree on a tie. */
export function gumFlingDir(cols: number, c: Creature): -1 | 1 {
  return crossAwayFromWall(cols, c.col, spanOf(c)) === 1 ? -1 : 1;
}

/** How far player 2's hand has carried this gum, in thousandths of a tile,
 * signed the way the field is; nought for a hand that is not on it. Cut to
 * `gumSwipeMilli` where it is written, so the picture never stretches past the
 * moment it gives. */
export function gumPull(c: Creature): number {
  return c.gumPull ?? 0;
}

/** Whether a hand is on this gum at all — a grab reports zero, so nought and
 * nothing are two states (`balloonHeld`'s arrangement). */
export function gumIsHeld(c: Creature): boolean {
  return c.gumPull !== undefined;
}

/** The stuck gum standing over the cannon, if there is one: the body that
 * refuses the shot (`firePress`). */
export function gumOverCannon(world: World): Creature | undefined {
  return world.creatures.find((c) => gumIsStuck(c) && occupiesCol(c, world.cannonCol));
}

/**
 * A gum on the ship's row, every beat it is there. It sticks on the first
 * beat it is drawn standing on the hull — `fromRow` on the ship's row, the
 * beat every other body breaks the hull on — and says so once.
 */
export function gumLands(world: World, c: Creature, shipRow: number): void {
  if (c.gumStuck === true || c.fromRow < shipRow) return;
  c.gumStuck = true;
  world.events.push({ type: "gumStick", col: c.col, row: c.row, span: spanOf(c) });
}

/**
 * Player 2's hand on a stuck gum, off the wire.
 *
 * The seat is checked here rather than at the hit test, for `balloonHeard`'s
 * reason: a device that decided for itself whose gesture a message was would
 * be a device the other one cannot check. A grab on a second gum lets the
 * first go, and a lift lets every one go.
 *
 * **Nothing gives without the cannon under it.** The pull is written as
 * nought then, so both screens draw a gum that does not budge — which is the
 * whole readout player 2 has of where the cannon is standing.
 */
export function gumHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gum" || player !== 2) return;
  if (!command.on) {
    releaseGums(world);
    return;
  }
  const held = world.creatures.find((c) => c.id === command.id && gumIsStuck(c));
  for (const c of world.creatures) if (c !== held) releaseGum(c);
  if (held === undefined) return;
  if (!occupiesCol(held, world.cannonCol)) {
    held.gumPull = 0;
    return;
  }
  const swipe = world.cfg.gumSwipeMilli;
  const pull = Math.max(-swipe, Math.min(swipe, Math.round(command.fromMilli)));
  held.gumPull = pull;
  // The raw distance against the raw threshold, never a rounded readout
  // (`balloonSideTaut`'s rule); and once per grab, whichever way it went.
  if (held.gumSpent === true || Math.abs(pull) < swipe) return;
  const dir: -1 | 1 = pull < 0 ? -1 : 1;
  const span = spanOf(held);
  if (dir === gumFlingDir(world.cfg.cols, held)) {
    world.creatures = world.creatures.filter((c) => c !== held);
    world.events.push({ type: "gumFlung", col: held.col, row: held.row, span, dir });
    return;
  }
  spread(world, held, dir, span);
}

/** The wrong way: a lane wider toward the side it was pushed, clamped to the
 * field, and this grab spent. `fromCol` moves with it so the picture does not
 * glide a body that was shoved. */
function spread(world: World, c: Creature, dir: -1 | 1, span: number): void {
  const wider = Math.min(world.cfg.cols, span + world.cfg.gumSpreadCols);
  c.col = clampSpanCol(dir < 0 ? c.col - (wider - span) : c.col, world.cfg.cols, wider);
  c.fromCol = c.col;
  c.span = wider;
  c.gumSpent = true;
  c.gumPull = 0;
  world.events.push({ type: "gumSpread", col: c.col, row: c.row, span: wider });
}

/** Every gum this hand was on, let go of — however it happened. */
export function releaseGums(world: World): void {
  for (const c of world.creatures) releaseGum(c);
}

function releaseGum(c: Creature): void {
  if (c.kind !== "gum") return;
  c.gumPull = undefined;
  c.gumSpent = undefined;
}
