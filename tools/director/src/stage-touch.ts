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
import { briefingHolds, type Command, guideHolds, introHolds, type World } from "@neon-spore/sim";
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

/**
 * What `test` mode should actually be drawn as while a wave's guide is up:
 * player one's half, then player two's, before ever falling back to the dual
 * view `role` alone would ask for (`packages/render/src/briefing.ts` draws
 * that whenever it is handed `"test"`). `cardStep` is the only thing that ever
 * moves — see the pointerdown handler below — this only reads it.
 *
 * Stepping and the ready gate answer different questions and neither reaches
 * for the other: the two circles `drawReadyGate` draws are part of every one
 * of these views, unredacted or not, so a hold fills them from whichever half
 * is on screen — a person can step to player two's words and still be the one
 * holding for both. Stepping only decides which text is showing.
 *
 * The introduction before the guide is not stepped: it is the same three lines
 * on both screens, so there are no halves to walk through.
 */
export function cardRenderRole(role: ViewRole, world: World, cardStep: 0 | 1 | 2): ViewRole {
  if (role === "test" && guideHolds(world)) {
    if (cardStep === 1) return "p1";
    if (cardStep === 2) return "p2";
  }
  return role;
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
  /** Which seat's screen the role bar is holding, the same value `field()`
   * already answers `pointerSeat` with — a card up under `test` has to be
   * stepped in words, one under `p1`/`p2` is already just the one screen the
   * phone would show, so a press dismisses it the way the phone's own
   * `bindBriefing` does. */
  role: () => ViewRole;
  /**
   * Which half of the card `test` mode is showing right now: 0 before either
   * step, 1 once player one's half is up, 2 once player two's is. It advances
   * on a release that did not fill a circle — a quick tap, the way it always
   * did — never on a hold, so a person filling the gate straight from the
   * first press is never forced through the steps to get there. Director
   * state, not world state — the sim only knows a card is up and how full
   * each circle is (`Briefings.fillP1`/`fillP2` in
   * `packages/sim/src/briefing.ts`), never that one screen is reading it in
   * turns. Kept beside `role` in `stage.ts`, which is also director state
   * about the same stage.
   */
  cardStep: () => 0 | 1 | 2;
  setCardStep: (step: 0 | 1 | 2) => void;
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
  cardStep,
  setCardStep,
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
    // opening is gone is the first one that can move anything.
    //
    // The phone would not take a press on the introduction at all: it stands
    // for five and a half seconds and passes on its own. Here it does, because
    // this is the tool somebody restarts a wave on twenty times in an
    // afternoon, and making them wait out the timer each time is the thing
    // that would get the whole opening switched off.
    if (briefingHolds(world())) {
      e.preventDefault();
      if (introHolds(world())) {
        push(1, { kind: "brief" });
        push(2, { kind: "brief" });
        return;
      }
      // The guide: a hold, the same gesture `apps/game/src/briefing.ts` binds
      // on a phone, on the seat or seats this screen speaks for. `test` is
      // both — one hand filling both circles, the owner's own answer for a
      // desk with one mouse and two seats to read (`ready-circles.ts`) — `p1`
      // and `p2` are the one seat that screen would be on a real device.
      const seats: readonly (1 | 2)[] = role() === "test" ? [1, 2] : [pointerSeat(role())];
      for (const seat of seats) push(seat, { kind: "brief", on: true });
      briefHolding.set(e.pointerId, seats);
      return;
    }
    const p = at(e);
    const t = touchDown(layout(), p.x, p.y, field());
    if (!t) return;
    e.preventDefault();
    if (t.hold) {
      holding.set(e.pointerId, t.hold);
      setHand(shipHand(layout(), t.hold, p.x, true));
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
      setHand(over?.hold ? shipHand(layout(), over.hold, p.x, false) : null);
      return;
    }
    setHand(shipHand(layout(), hold, p.x, true));
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
      // A release that did not reach READY is a tap, not a hold, and a tap is
      // what steps `test` through the two halves — the reason stepping ever
      // existed still holds, it just no longer gates the fill.
      if (role() === "test" && guideHolds(world()) && cardStep() < 2) {
        setCardStep((cardStep() + 1) as 1 | 2);
      }
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
