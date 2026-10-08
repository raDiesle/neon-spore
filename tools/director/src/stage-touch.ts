import {
  deskDownAll,
  Fingers,
  type Hold,
  pointerSeat,
  type Rubbed,
  type ShipHand,
  shipHand,
  shipUnder,
  touchMove,
  touchUp,
} from "@neon-spore/render";
import { briefingHolds, type Command, lostAsks } from "@neon-spore/sim";
import { balloonBothHands } from "./stage-balloon-both.js";
import { openingPress } from "./stage-opening.js";
import { stripBothHands } from "./stage-strip-both.js";
import type { StageHand, StageTouch } from "./stage-touch-ends.js";

/**
 * The stage answers a finger the way the phone does — the same `touch.ts` the
 * game calls, so the control scheme cannot disagree with itself on the screen
 * it is being judged on.
 *
 * It used to place a creature instead, which cost the editor the one thing
 * only it can answer: whether a control can actually be reached in time.
 * Placing belongs to the beat grid beside it, where a column and a beat are
 * both already visible — and where it always worked anyway.
 */

/**
 * Whose hand a grab on the field speaks for is `pointerSeat`, in
 * `render/desk-seat.ts` now: the role's own seat, and under `test` the seat
 * key held at the desk, player 1 with none. It lived here while THE WARDEN
 * had an opinion about it and while the test screen's answer was fixed; the
 * game's field asks the same question and the two hosts share nothing else,
 * so the rule went where both may call it.
 *
 * And with **no** key held under `test` the press is `deskDown`'s, which is
 * the same rule where it has two seats to choose between: the seat the
 * control under the thumb names, else whichever of them finds anything there
 * (`render/desk-grab.ts`). That is why the field below is asked for a seat
 * rather than read — the hit test is run once per seat until one answers.
 */

export type { StageHand, StageTouch } from "./stage-touch-ends.js";

export function bindStageTouch({
  canvas,
  at,
  layout,
  field,
  seats,
  push,
  world,
  role,
  replay,
}: StageTouch): StageHand {
  /** More than one hold on a pointer is the mouse on a ring that wants both
   * seats (`render/desk-grab.ts` `deskDownAll`). */
  const holding = new Map<number, Hold[]>();
  /**
   * Every command this stage sends, and the second seat's copy of it where
   * there is one. Two things have one, both under TEST, where the desk's
   * single mouse speaks for both hands: THE BALLOON's pair of handles
   * (`stage-balloon-both.ts`), and the cannon and shield strips, which slide
   * together (`stage-strip-both.ts`) — everything else goes through unchanged, so a
   * control that behaves differently here than on a phone is impossible except
   * where this file says so out loud.
   */
  const send = (player: 1 | 2, command: Command): void => {
    push(player, command);
    const both =
      balloonBothHands(role(), player, command) ??
      stripBothHands(role(), player, command, field().controls);
    if (both) push(both.player, both.command);
  };
  /**
   * A rub's turns — what one sample cannot answer — counted by the same
   * `Fingers` the game's field keeps (`apps/game/src/input.ts`), so THE
   * RIME's halves play from the director as they do on a phone.
   */
  const fingers = new Fingers();
  const say = (said: readonly Rubbed[]): void => {
    for (const s of said) send(s.player, s.command);
  };
  let hand: ShipHand | undefined;
  let pointer: { x: number; y: number } | undefined;
  const setHand = (h: ShipHand | null): void => {
    hand = h ?? undefined;
  };
  // Which seat or seats a brief-hold in progress speaks for, keyed the same
  // way `holding` is — a second map rather than teaching `Hold` a briefing
  // shape it has nothing else in common with.
  const briefHolding = new Map<number, readonly (1 | 2)[]>();

  canvas.addEventListener("pointerdown", (e) => {
    // The wave has not started: the press belongs to its opening, not to the
    // cannon. This has to run before the hit test below sees the press —
    // the same order the phone plays by, where nothing but the ack reaches the
    // ship while the wave is held (`step.ts`) — so the first press after the
    // opening is gone is the first one that can move anything. What it answers
    // there is `stage-opening.ts`, which is the same three targets the phone
    // answers, from the same geometry — and the lost screen's two buttons.
    if (briefingHolds(world()) || lostAsks(world())) {
      e.preventDefault();
      const speaksFor: readonly (1 | 2)[] =
        role() === "test" ? [1, 2] : [pointerSeat(role(), undefined)];
      const pressed = openingPress({
        world: world(),
        layout: layout(),
        seats: speaksFor,
        point: at(e),
        push,
        replay,
      });
      if (pressed) briefHolding.set(e.pointerId, pressed);
      return;
    }
    const p = at(e);
    // Both seats on THE INSTAR's HOLD BOTH ring, which one mouse could
    // otherwise never start.
    const touches = deskDownAll(layout(), p.x, p.y, seats(), field);
    if (touches.length === 0) return;
    e.preventDefault();
    const holds = touches.flatMap((t) => (t.hold ? [t.hold] : []));
    const [first] = holds;
    if (first) {
      holding.set(e.pointerId, holds);
      setHand(shipHand(layout(), first, p.x, p.y, true));
    }
    // Null for the one press that takes hold of something and says nothing
    // yet: player 2's thumb on the muzzle, decided on the lift
    // (`render/touch-ship.ts`).
    for (const t of touches) if (t.command) send(t.player, t.command);
    say(fingers.down(layout(), e.pointerId, holds, p.x, p.y));
  });
  canvas.addEventListener("pointerleave", () => {
    pointer = undefined;
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = at(e);
    pointer = p;
    const holds = holding.get(e.pointerId);
    const hold = holds?.[0];
    if (!holds || !hold) {
      // Nothing held: the cup follows the cursor instead, dim. The stage is a
      // desk tool and a desk has a hover, which is the half of "knows which
      // element is active before swiping" a phone answers with the press.
      // Never while a card is up — the press belongs to the opening then, and
      // the ship is not what a hand on the glass is reaching for.
      const over = briefingHolds(world()) ? null : shipUnder(layout(), p.x, p.y, field());
      setHand(over?.hold ? shipHand(layout(), over.hold, p.x, p.y, false) : null);
      return;
    }
    setHand(shipHand(layout(), hold, p.x, p.y, true));
    for (const h of holds) {
      const t = touchMove(layout(), h, p.x, p.y);
      if (t?.command) send(t.player, t.command);
    }
    say(fingers.move(layout(), e.pointerId, p.x, p.y));
  });
  // On the window, not the canvas: a thumb that leaves the picture still has
  // to let go of what it was holding.
  const lift = (e: PointerEvent): void => {
    const seats = briefHolding.get(e.pointerId);
    if (seats) {
      briefHolding.delete(e.pointerId);
      for (const seat of seats) push(seat, { kind: "brief", on: false });
    }
    const holds = holding.get(e.pointerId);
    if (!holds) return;
    holding.delete(e.pointerId);
    setHand(null);
    for (const hold of holds) {
      const t = touchUp(layout(), hold, at(e));
      if (t?.command) send(t.player, t.command);
    }
    say(fingers.up(e.pointerId));
  };
  window.addEventListener("pointerup", lift);
  window.addEventListener("pointercancel", lift);

  return { hand: () => hand, pointer: () => pointer };
}
