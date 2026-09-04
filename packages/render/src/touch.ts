import { type ControlSet, type Point, setHas } from "@neon-spore/content";
import type { Command } from "@neon-spore/sim";
import { NO_GRIP } from "@neon-spore/sim";
import { creatureAt } from "./creature-place.js";
import { handleUnder } from "./handles.js";
import { bandLobes, colFromX, hitCircle, type Layout, showsCannon, showsShield } from "./layout.js";

// What a hit test is handed, and what it hands back: both lifted out when this
// file went over its limit, and re-exported so nothing reaching for a `Field`,
// a `Hold` or a `Touch` had to move (`touch-field.ts`, `touch-hold.ts`).
export type { Field } from "./touch-field.js";
export type { Hold, Touch } from "./touch-hold.js";

import type { Field } from "./touch-field.js";
import type { Hold, Touch } from "./touch-hold.js";
import { lobeMeans } from "./touch-lobe.js";
import { shipUnder, swipeColor } from "./touch-ship.js";

/**
 * The control scheme as a pure function: a point on the layout, and what the
 * ship should be told about it.
 *
 * It lives beside `layout.ts` for the reason that file already gives — a
 * control is never drawn in one place and answered in another — and it is here
 * rather than in `apps/game` because it has two callers: the game, and the
 * director's stage, which is the same picture and has to answer a finger the
 * same way. A tool cannot import an application, so the alternative was a
 * second hand-typed copy of the decision table, and a control scheme that
 * disagrees with itself on the screen it is being judged on is worse than no
 * editor at all.
 *
 * No DOM, no pointer, no state: the plumbing of pointers, capture and which
 * finger is which belongs to whoever owns the canvas.
 */

/** A press. Null where nothing is. */
export function touchDown(l: Layout, x: number, y: number, field: Field): Touch | null {
  // Above the band is the field, and the field answers both players: a finger
  // held on something falling drags at it (`grip` in sim/grip.ts).
  if (y < l.bandTop) {
    // Asked first, because a handle hangs over the field the creatures fall
    // through and a hand on it is not a hand on whatever is behind it
    // (`handles.ts`).
    const handle = handleUnder(l, x, y, field);
    if (handle) return handle;
    // Then the ship itself, for the same reason one step down: the hull is
    // painted over every body on the field, so a hand on the cannon or the
    // shield is not a hand on whatever is falling behind it (`touch-ship.ts`).
    const ship = shipUnder(l, x, y, field);
    if (ship) return ship;
    const held = creatureAt(l, field.creatures, x, y, field.beatPhase);
    if (!held) return null;
    return { player: field.seat, command: { kind: "grip", id: held.id }, hold: { kind: "grip" } };
  }

  if (showsCannon(l.role)) {
    // The strip is answered only when the wave's panel actually has one, and
    // that is the repair the lobes already had: `bandLobes` walks the set, so
    // a button the set left out has no circle to be answered at — while these
    // two strips were still answered by position whatever the set said. THE
    // FLEET is the first panel with no strip on it at all, and without this
    // its arrows would sit under a cannon nobody can see and nothing can move.
    if (
      setHas(field.controls, "cannon") &&
      Math.abs(y - l.cannonStrip.y) <= l.cannonStrip.height * 0.75
    ) {
      return {
        player: 1,
        command: { kind: "cannonCol", col: colFromX(l, x) },
        hold: { kind: "cannon" },
      };
    }
    const lobe = lobeUnder(l, field.controls, 1, x, y);
    if (lobe) return lobe;
  }
  if (showsShield(l.role)) {
    if (
      setHas(field.controls, "shield") &&
      Math.abs(y - l.shieldStrip.y) <= l.shieldStrip.height * 0.75
    ) {
      return {
        player: 2,
        command: { kind: "shieldCol", col: colFromX(l, x) },
        hold: { kind: "shield" },
      };
    }
    const lobe = lobeUnder(l, field.controls, 2, x, y);
    if (lobe) return lobe;
  }
  return null;
}

/**
 * A finger against one seat's lobes, and there is no list of them in here.
 *
 * `bandLobes` is asked for the circles with the wave's own set, which is the
 * same call `band.ts` makes to draw them — so a button is answered exactly
 * where it was drawn, and a control the set left out has no circle to be
 * answered at. That is the whole reason this is a call and not five `if`s
 * against named fields of the layout: five `if`s were a second, older list of
 * what is on a panel, and it went on including the lance after the panel
 * stopped.
 */
function lobeUnder(l: Layout, set: ControlSet, player: 1 | 2, x: number, y: number): Touch | null {
  for (const lobe of bandLobes(l, set, player)) {
    if (!hitCircle(lobe.circle, x, y)) continue;
    const said = lobeMeans(lobe.control.id);
    if (said) return { player: lobe.control.player, ...said };
  }
  return null;
}

/**
 * The same finger, moved, and the two kinds of answer it can have.
 *
 * The strips are **absolute**: the finger's x is a column and where the press
 * began does not matter. A drag is a **displacement**, and this is the last
 * place a pixel is legal, so it becomes thousandths of a tile before it goes
 * anywhere — the tile being the only length two phones share.
 *
 * A grip still answers nothing, deliberately: a hand on something falling only
 * slows it, and that is all a grip has ever been (`sim/grip.ts`). Nothing that
 * cared only that a hand was there has to learn that some hands now report
 * where they went.
 *
 * **There is a `y` now.** A pull was one number across for as long as the only
 * handle in the game hung under a rim and was swung *aside*; the owner asked
 * for the whole circle, so a drag reports both axes and the strips — which are
 * still a column and nothing else — go on ignoring the second.
 */
export function touchMove(l: Layout, hold: Hold, x: number, y: number): Touch | null {
  if (hold.kind === "cannon") {
    return { player: 1, command: { kind: "cannonCol", col: colFromX(l, x) }, hold };
  }
  if (hold.kind === "shield") {
    return { player: 2, command: { kind: "shieldCol", col: colFromX(l, x) }, hold };
  }
  if (hold.kind === "drag") {
    // Both axes now: the owner asked for a handle to be carriable any way at
    // all, so what a move reports is a displacement rather than a distance
    // across. Where it is allowed to end up is the simulation's
    // (`sim/handle-pull.ts`) — this only says where the finger went.
    return {
      player: hold.player,
      command: dragging(
        hold,
        Math.round(((x - hold.originX) * 1000) / l.tile),
        Math.round(((y - hold.originY) * 1000) / l.tile),
        true,
      ),
      hold,
    };
  }
  return null;
}

/**
 * One `drag` message for a hold that is already under way.
 *
 * The `id` rides along only for a handle that hangs off a creature, and it is
 * carried from the press because that is the one moment anything knew which
 * body it was. Written once and called twice: a move and a lift say the same
 * thing about *which* handle, and two spellings of that is how a lift comes to
 * let go of a different cord than the one the hand was on.
 */
function dragging(
  hold: Extract<Hold, { kind: "drag" }>,
  fromMilli: number,
  fromYMilli: number,
  on: boolean,
): Command {
  const { target, id } = hold;
  return {
    kind: "drag",
    target,
    on,
    fromMilli,
    fromYMilli,
    ...(id === undefined ? {} : { id }),
  };
}

/**
 * The finger lifted, and **where it lifted from** — the layout and the point,
 * in the same order `touchDown` takes them.
 *
 * Only the holds that are *held* have anything to say, and each lasts exactly
 * as long as the finger does with nothing in the simulation decaying it, so
 * the lift has to be sent.
 *
 * `at` is the one thing a lift did not used to need: player 2's muzzle swipe
 * is decided by where the hand ended, so a lift with no point at all fires
 * nothing. That is the honest answer for the two ways a pointer is lost with
 * no position to report — a window losing focus and a mouse dragged off the
 * document (`bindControls`'s `releaseAll`) — where a shot the player never
 * finished would be worse than no shot.
 */
export function touchUp(l: Layout, hold: Hold, field: Field, at?: Point): Touch | null {
  if (hold.kind === "shot") {
    const color = at === undefined ? null : swipeColor(l, hold.originX, at.x);
    return color === null ? null : { player: 2, command: { kind: "fire", color }, hold: null };
  }
  if (hold.kind === "lance") {
    return { player: 1, command: { kind: "prime", on: false }, hold: null };
  }
  if (hold.kind === "drag") {
    return { player: hold.player, command: dragging(hold, 0, 0, false), hold: null };
  }
  if (hold.kind !== "grip") return null;
  return { player: field.seat, command: { kind: "grip", id: NO_GRIP }, hold: null };
}
