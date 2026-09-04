import {
  type Field,
  type Hold,
  type Layout,
  type ShipHand,
  shipHand,
  shipUnder,
  touchDown,
  touchMove,
  touchUp,
  type ViewRole,
} from "@neon-spore/render";
import { briefingHolds, type Command, type World } from "@neon-spore/sim";
import { openingPress } from "./stage-opening.js";
import type { StagePoint } from "./stage-point.js";

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
 * Whose hand a grab on the field speaks for. `p1` and `p2` are unambiguous —
 * the role bar has already picked a seat, and the mouse is that seat's only
 * hand. `test` shows both seats on the one screen, so a grab there needs its
 * own answer, and player 1 is it.
 *
 * It used to ask THE WARDEN whose turn it was, because that boss clamped one of
 * the two controls and only the *other* seat could pull its line. Nothing
 * alternates any more: the rope is player 1's every cycle and player 2 fires,
 * which is the whole coupling (`packages/sim/src/warden.ts`). Every other grip
 * has no exclusivity at all (`packages/sim/src/grip.ts`, either hand may hold
 * anything), so player 1 is simply the default and `G` — bound to player 2 in
 * `keys.ts` — stays the deliberate way to act as the other seat.
 *
 * So it is the role and nothing else now. It kept a `world` and a `cfg` for as
 * long as a boss had something to say about it; both are gone rather than left
 * unread, because a parameter nobody looks at is the next reader's wrong guess
 * about what decides this.
 */
export function pointerSeat(role: ViewRole): 1 | 2 {
  return role === "p2" ? 2 : 1;
}

export interface StageTouch {
  canvas: HTMLCanvasElement;
  /**
   * A pointer event, in the coordinates the renderer drew in. Handed down
   * rather than worked out here — see `stage-point.ts` for the four copies
   * this replaced and the miss they caused.
   */
  at: StagePoint["at"];
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** The field a grab is tested against, and whose hand it is. */
  field: () => Field;
  push: (player: 1 | 2, command: Command) => void;
  /** The world a card is read off — whether one is up at all right now. */
  world: () => World;
  /** Play a guide's page of film again — the middle button on its bar. It is
   * the renderer's own clock and not the world's, so it is a call rather than a
   * command (`render/guide-play.ts`). */
  replay: () => void;
  /** Which seat's screen the role bar is holding, the same value `field()`
   * already answers `pointerSeat` with — a card up under `test` has to be
   * stepped in words, one under `p1`/`p2` is already just the one screen the
   * phone would show, so a press dismisses it the way the phone's own
   * `bindBriefing` does. */
  role: () => ViewRole;
}

/**
 * What the binding hands back: the cup over whichever swelling this stage's
 * one mouse is on or holding, for the next paint to draw
 * (`packages/render/src/ship-hand.ts`). The same shape `bindControls` returns
 * to the game (`apps/game/src/input.ts`), and for the same reason — a pointer
 * is the host's and a picture is the renderer's.
 *
 * The stage answered every one of those gestures already and said nothing
 * about which swelling answered, so the one screen the control is judged on
 * was the one screen missing its feedback.
 *
 * A getter rather than the game's `ShipHandWatch`: that class holds a single
 * field and calls `shipHand` for every value it takes, and `keys.ts` says why
 * this package does not import `apps/game` to get it. The rule is still
 * called and not re-derived — every value here comes out of `shipHand`, which
 * answers null for the two strips and for a hold that is not the ship's, so
 * the stage cannot light a swelling the phone would leave dark.
 */
export interface StageHand {
  hand: () => ShipHand | undefined;
}

export function bindStageTouch({
  canvas,
  at,
  layout,
  field,
  push,
  world,
  role,
  replay,
}: StageTouch): StageHand {
  const holding = new Map<number, Hold>();
  let hand: ShipHand | undefined;
  const setHand = (h: ShipHand | null): void => {
    hand = h ?? undefined;
  };
  // Which seat or seats a brief-hold in progress speaks for, keyed the same
  // way `holding` is — a second map rather than teaching `Hold` a briefing
  // shape it has nothing else in common with.
  const briefHolding = new Map<number, readonly (1 | 2)[]>();

  canvas.addEventListener("pointerdown", (e) => {
    // The wave has not started: the press belongs to its opening, not to the
    // cannon. This has to run before `touchDown` below ever sees the press —
    // the same order the phone plays by, where nothing but the ack reaches the
    // ship while the wave is held (`step.ts`) — so the first press after the
    // opening is gone is the first one that can move anything. What it answers
    // there is `stage-opening.ts`, which is the same three targets the phone
    // answers, from the same geometry.
    if (briefingHolds(world())) {
      e.preventDefault();
      const speaksFor: readonly (1 | 2)[] = role() === "test" ? [1, 2] : [pointerSeat(role())];
      const seats = openingPress({
        world: world(),
        layout: layout(),
        seats: speaksFor,
        point: at(e),
        push,
        replay,
      });
      if (seats) briefHolding.set(e.pointerId, seats);
      return;
    }
    const p = at(e);
    const t = touchDown(layout(), p.x, p.y, field());
    if (!t) return;
    e.preventDefault();
    if (t.hold) {
      holding.set(e.pointerId, t.hold);
      setHand(shipHand(layout(), t.hold, p.x, p.y, true));
    }
    // Null for the one press that takes hold of something and says nothing
    // yet: player 2's thumb on the muzzle, decided on the lift
    // (`render/touch-ship.ts`).
    if (t.command) push(t.player, t.command);
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = at(e);
    const hold = holding.get(e.pointerId);
    if (!hold) {
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
    const t = touchMove(layout(), hold, p.x, p.y);
    if (t?.command) push(t.player, t.command);
  });
  // On the window, not the canvas: a thumb that leaves the picture still has
  // to let go of what it was holding.
  const lift = (e: PointerEvent): void => {
    const seats = briefHolding.get(e.pointerId);
    if (seats) {
      briefHolding.delete(e.pointerId);
      for (const seat of seats) push(seat, { kind: "brief", on: false });
    }
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    holding.delete(e.pointerId);
    setHand(null);
    const t = touchUp(layout(), hold, field(), at(e));
    if (t?.command) push(t.player, t.command);
  };
  window.addEventListener("pointerup", lift);
  window.addEventListener("pointercancel", lift);

  return { hand: () => hand };
}
