import { controlPress, type Point } from "@neon-spore/content";
import { NO_GRIP } from "@neon-spore/sim";
import { beatboxUnder } from "./beatbox-tap.js";
import { creatureAt } from "./creature-under.js";
import { gimbalRingTurn } from "./gimbal-grip.js";
import { handleUnder } from "./handles.js";
import { colFromX, type Layout } from "./layout.js";
import { mineUnder } from "./mine-tap.js";
import { orreryRingTurn } from "./orrery-grab.js";

// What a hit test is handed, and what it hands back: both lifted out when this
// file went over its limit, and re-exported so nothing reaching for a `Field`,
// a `Hold` or a `Touch` had to move (`touch-field.ts`, `touch-hold.ts`).
export type { Field } from "./touch-field.js";
export type { Hold, Touch } from "./touch-hold.js";

import { bandUnder } from "./touch-band.js";
import { crankTurn, dragging, rimFrom, turnAbout } from "./touch-drag.js";
import type { Field } from "./touch-field.js";
import { sucksOnLift, swipeColor } from "./touch-hand.js";
import type { Hold, Touch } from "./touch-hold.js";
import { shipUnder } from "./touch-ship.js";
import { wellCol, wellColsFrom, wellSucksOnLift, wellUnder } from "./touch-well.js";

/**
 * The control scheme as a pure function: a point on the layout, and what the
 * ship should be told about it.
 *
 * It lives beside `layout.ts` for the reason that file already gives — a
 * control is never drawn in one place and answered in another — and it is
 * here rather than in `apps/game` because it has two callers: the game and
 * the director's stage, which have to answer a finger the same way or one
 * screen judges a control scheme the other disagrees with.
 *
 * No DOM, no pointer, no state: the plumbing of pointers, capture and which
 * finger is which belongs to whoever owns the canvas.
 */

/** A press. Null where nothing is. */
export function touchDown(l: Layout, x: number, y: number, field: Field): Touch | null {
  // Above the band is the field, and the field answers both players: a finger
  // held on something falling drags at it (`grip` in sim/grip.ts).
  if (y < l.bandTop) {
    // **THE WELL's screen is asked its own two questions.** Every hit test
    // below is a circle cut out of the flat field — the hull's two lobes along
    // the bottom, a body in its column — and on that screen the hull is a ring
    // at the middle and the bodies are round it, so each one would be answered
    // somewhere it is not drawn. `touch-well.ts` asks the ring and the lanes
    // instead; the handles and the soundboxes are not in any well wave.
    if (field.well) return wellUnder(l, x, y, field);
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
    // Then a soundbox: a press on a box is a **tap**, not a hand, and a box
    // refuses a hand outright (`beatbox-tap.ts`) so `creatureAt` skips it.
    const tap = beatboxUnder(l, field, x, y);
    if (tap) return tap;
    // The seat, because what a hand is worth depends on it: a rock is a brake
    // for either player and a living body is an aim only the pilot has, so a
    // navigator's thumb finds nothing over a slick (`sim/hand.ts`).
    const held = creatureAt(l, field, x, y);
    // And last of all, a bare square: the one press in this game that is not
    // on anything drawn, from the seat a mine is hidden from (`mine-tap.ts`).
    // It answers the whole field, so it is asked only where nothing else
    // wanted the point.
    if (!held) return mineUnder(l, field, x, y);
    return {
      player: field.seat,
      command: { kind: "grip", id: held.id },
      // Where the finger landed and what it landed on, kept for the move: a
      // hand carried sideways from here steps the body a column, and by the
      // time it has moved there is nothing left to ask (`touchMove`).
      hold: { kind: "grip", id: held.id, player: field.seat, originX: x },
    };
  }

  // And the panel below it: the buttons, then the strips (`touch-band.ts`).
  return bandUnder(l, x, y, field);
}

/**
 * The same finger, moved, and the two kinds of answer it can have.
 *
 * The strips are **absolute**: the finger's x is a column and where the press
 * began does not matter. A drag is a **displacement**, and this is the last
 * place a pixel is legal, so it becomes thousandths of a tile before it goes
 * anywhere — the tile being the only length two phones share. A crank is the
 * exception that proves both halves: it is absolute like a strip and it is
 * measured in thousandths of a *turn* (`touch-drag.ts`).
 *
 * **A grip answers now**, and it answers as a displacement like any other
 * drag. A hand on something falling used to only slow it; carried sideways it
 * also steps the body a column, which is one hold and two gestures — the
 * arrangement the cannon already has (`sim/grip-push.ts`). What it sends is a
 * `drag` at `gripBody`, so nothing on the wire and nothing in the simulation
 * had to learn a new shape of message.
 *
 * **There is a `y` now.** A pull was one number across for as long as the only
 * handle in the game hung under a rim and was swung *aside*; the owner asked
 * for the whole circle, so a drag reports both axes and the strips — which are
 * still a column and nothing else — go on ignoring the second.
 */
export function touchMove(l: Layout, hold: Hold, x: number, y: number): Touch | null {
  // A hand taken on THE WELL's ring reads the hour under the finger, and in
  // the seam it reads nothing: the cannon stays where it is, because the seam
  // is the wall between the two ends of the rail (`touch-well.ts`).
  if (hold.kind === "cannon") {
    const col = hold.well ? wellCol(l, x, y) : colFromX(l, x);
    return col === null ? null : { player: 1, command: { kind: "cannonCol", col }, hold };
  }
  if (hold.kind === "shield") {
    const col = hold.well ? wellCol(l, x, y) : colFromX(l, x);
    return col === null ? null : { player: 2, command: { kind: "shieldCol", col }, hold };
  }
  if (hold.kind === "grip") {
    // Across only. How fast the body comes down is the grip's other half and a
    // *hold* rather than a distance (`sim/grip.ts`), so the y of this gesture
    // would be a number nothing reads — and an absent one is exactly nought.
    // On the well "across" is round the ring: a column per sector, from the
    // hour the hand took hold at.
    const fromMilli = hold.well
      ? wellColsFrom(l, hold.well.angle, x, y)
      : Math.round(((x - hold.originX) * 1000) / l.tile);
    const drag = { kind: "drag", target: "gripBody", on: true, fromMilli, id: hold.id } as const;
    return { player: hold.player, command: drag, hold };
  }
  if (hold.kind === "drag") {
    // **The crank is not carried anywhere, it is turned**, and what a turn
    // reports is an angle rather than a distance (`touch-drag.ts`).
    if (hold.target === "crank") return crankTurn(hold, x, y);
    // **And THE ORRERY's ring, which is turned about the core.** Its own
    // function rather than the crank's: the ring is an ellipse, so the angle
    // is read off unsquashed offsets, and it is the one gesture in the game
    // that is mirrored for a turned seat — the finger is following a body
    // round rather than pointing at a column (`orrery-grab.ts`).
    if (hold.target === "orreryRing") return orreryRingTurn(l, hold, x, y);
    // **And THE GIMBAL's two rims**, turned about the drum. Its own function
    // again rather than the crank's: the circle is centred on the boss and the
    // fold is undone before the bearing goes out, for the orrery's reason —
    // a finger chasing a mark round a circle is following a body
    // (`gimbal-grip.ts`).
    if (hold.target === "gimbalOuter" || hold.target === "gimbalInner") {
      return gimbalRingTurn(l, hold, x, y);
    }
    // **And THE INSTAR's `turn` mark**, a crank drawn on the body: the press
    // flagged the hold, so the reading is the crank's about the mark's centre.
    if (hold.turns) return turnAbout(hold, x, y);
    // **And THE WELL's seam and THE MAZE's lever**, carried round a circle: the
    // press wrote down the angle it grabbed at, and a move reports how far
    // round the thumb has come — in sectors of the clock face on the well
    // (`touch-well.ts`), in tiles along the drum's rim on the maze
    // (`rimFrom`). A displacement across the screen is not a distance on one.
    const round = hold.well
      ? wellColsFrom(l, hold.well.angle, x, y)
      : hold.rim && rimFrom(hold.rim, l.tile, x, y);
    if (round !== undefined) {
      return { player: hold.player, command: dragging(hold, round, 0, true), hold };
    }
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
 * The finger lifted, and **where it lifted from** — the layout and the point,
 * in the same order `touchDown` takes them.
 *
 * Only the holds that are *held* have anything to say, and each lasts exactly
 * as long as the finger does with nothing in the simulation decaying it, so
 * the lift has to be sent.
 *
 * `at` is the one thing a lift did not used to need, and there are two of
 * them now: player 2's muzzle swipe is decided by where the hand ended, and so
 * is player 1's tap on the cannon, which is a tap only by comparison with
 * where it began. A lift with no point at all does neither. That is the honest
 * answer for the two ways a pointer is lost with no position to report — a
 * window losing focus and a mouse dragged off the document (`bindControls`'s
 * `releaseAll`) — where a shot or a maw the player never finished would be
 * worse than none.
 *
 * **No field.** A lift is the hold's own — every seat on it was written down
 * when the finger went down, and the one branch that used to read the field's
 * seat instead now reads the hold's, for the reason it gives.
 */
export function touchUp(l: Layout, hold: Hold, at?: Point): Touch | null {
  // Player 1's tap on the cannon: it slid nowhere, so what it meant was the
  // maw. `suck` is only on the hold at all when the wave's panel has one, and
  // a lift with no point to report — a window losing focus, a mouse dragged
  // off the document — swallows nothing, for the muzzle's reason one line
  // below (`touch-ship.ts`).
  if (hold.kind === "cannon") {
    const tapped =
      hold.suck !== undefined &&
      (hold.well ? wellSucksOnLift(l, hold.suck, at) : sucksOnLift(l, hold.suck, at));
    return tapped ? { player: 1, command: { kind: "intake" }, hold: null } : null;
  }
  if (hold.kind === "shot") {
    const color = at === undefined ? null : swipeColor(l, hold.originX, at.x, hold.only);
    return color === null ? null : { player: 2, command: { kind: "fire", color }, hold: null };
  }
  // A thumb lifting off a lobe it was resting on — the two colours, which is
  // every held lobe there is. What that says is the control's own release,
  // asked for rather than spelled out here: a second copy of "what letting go
  // of red means" is exactly the drift `control-command.ts` was written to
  // end.
  if (hold.kind === "held") {
    const up = controlPress(hold.control).up;
    return up ? { player: hold.player, command: up, hold: null } : null;
  }
  if (hold.kind === "drag") {
    // THE MIRROR's lobes are the one drag whose *lift* is the gesture — a
    // carry past the threshold or a tap short of it, the muzzle's and the
    // maw's rule on the boss's own ship (`sim/mirror-hand.ts`) — so the lift
    // says where the hand ended; THE WARDEN's hatch is the second, a swipe
    // (`sim/warden-hand.ts`). Every other drag's lift only lets go.
    const swiped = hold.target === "mirrorLobe" || hold.target === "wardenHatch";
    const carried = swiped && at !== undefined;
    const dx = carried ? Math.round(((at.x - hold.originX) * 1000) / l.tile) : 0;
    const dy = carried ? Math.round(((at.y - hold.originY) * 1000) / l.tile) : 0;
    return { player: hold.player, command: dragging(hold, dx, dy, false), hold: null };
  }
  if (hold.kind !== "grip") return null;
  // **The seat that took hold**, rather than the one this field is signed
  // with. They are the same on a phone and on a seated screen, and on the
  // desk's both-seats screen they are not: a press there is signed with
  // whichever seat could answer it (`desk-grab.ts`), so a lift read off the
  // field would let go of the *other* player's hand and leave this one
  // gripping for good.
  return { player: hold.player, command: { kind: "grip", id: NO_GRIP }, hold: null };
}
