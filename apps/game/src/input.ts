import { deskDownAll, type Hold, shipUnder, touchMove, touchUp } from "@neon-spore/render";
import { samplesOf } from "./coalesced.js";
import { type Bindings, fieldFrom } from "./input-bindings.js";
import { showKeyHint } from "./key-hint.js";
import { bindKeys } from "./keys.js";
import { ShipHandWatch } from "./ship-hand.js";

export type { Bindings } from "./input-bindings.js";
// Lifted out at the length limit and re-exported: the queue every listener writes into.
export { InputBuffer } from "./input-buffer.js";

/**
 * What the rig hands back: the keyboard's per-tick call, and the ring round
 * whichever swelling this device's own finger has hold of. The second is
 * written here on every pointer event and read by whoever paints the frame —
 * a pointer is the host's and a picture is the renderer's (`ship-hand.ts`).
 */
export interface Controls {
  tick: () => void;
  hand: ShipHandWatch;
  /**
   * Where a mouse is resting on the stage, or undefined — a phone never sets
   * it. Read once a frame by whoever paints, so a button under the cursor can
   * light up (`render/hover.ts`, `render/nav-button.ts`).
   */
  pointer: () => { x: number; y: number } | undefined;
}

/**
 * Both players on one device — the test setup, not the finished game. The two
 * strips answer to separate pointers, so two thumbs on one phone already play
 * the real split: player 1 has the cannon and the trigger, player 2 has the
 * shield and the colours.
 */
export function bindControls(bindings: Bindings): Controls {
  const { canvas, buffer, layout, inStage, isOver, player, handed, opening, seats, both } =
    bindings;
  /** Which finger is doing what. What each one *means* is `touch.ts`'s. More
   * than one hold on a finger is the desk's mouse being both seats' hand
   * (`render/desk-grab.ts` `deskDownAll`); a phone's finger always has one. */
  const holding = new Map<number, Hold[]>();
  /** **Who a press is from: this device, always.** `touch.ts` signs a press
   * with the half of the band it landed on, and THE HANDOVER trades which half
   * this screen draws — so while the panels are away that signature is the
   * other player's, and a lockstep refuses a press attributed to the peer
   * (`Bindings.handed`). A hand on the *field* is already this seat's. */
  const from = (t: { player: 1 | 2 }): 1 | 2 => (handed() ? player() : t.player);
  const hand = new ShipHandWatch();
  /** A desk has a hover and a phone does not. Undefined until a mouse moves. */
  let pointer: { x: number; y: number } | undefined;
  /** The field as a given seat sees it — asked once per seat while a press is
   * deciding whose hand it is, and unasked everywhere else. */
  const field = (seat?: 1 | 2) => fieldFrom(bindings, seat);

  const down = (id: number, x: number, y: number): void => {
    if (isOver()) {
      buffer.push(1, { kind: "restart" });
      return;
    }
    // Which seat the press speaks for is `deskDown`'s on the screen that shows
    // both: the seat the control under the thumb names, else the first of them
    // that finds anything there — and both seats on a ring that wants both, or
    // with `3` held (`render/desk-grab.ts`). One seat everywhere else, which is
    // every phone.
    const touches = deskDownAll(layout(), x, y, seats(), field, both());
    const holds = touches.flatMap((t) => (t.hold ? [t.hold] : []));
    const [first] = holds;
    if (first) {
      holding.set(id, holds);
      if (!opening()) hand.down(layout(), first, x, y);
    }
    // Null for the one press that takes hold and says nothing yet: player
    // 2's thumb landing on the muzzle, decided on the lift (`render/touch-ship.ts`).
    for (const t of touches) if (t.command) buffer.push(from(t), t.command);
  };

  /**
   * Every hold this device is carrying, let go at once. A finger that leaves
   * the glass always fires `pointerup`; a mouse dragged off the *window* is
   * not the same — over another application, this page stops receiving
   * pointer events altogether, capture or not, and a held cannon or a held
   * lance would stay held forever. This is the phone's `up`, called for every
   * id still down, from whichever of the two ways a PC loses a pointer this
   * way (`window.blur` and the pointer leaving the document) fires first.
   */
  const releaseAll = (): void => {
    for (const [id, holds] of holding) {
      holding.delete(id);
      // No point to report, so a half-finished swipe fires nothing — see
      // `touchUp`. Losing the window is not a shot the player took.
      for (const hold of holds) {
        const t = touchUp(layout(), hold);
        if (t?.command) buffer.push(from(t), t.command);
      }
    }
    hand.clear();
    pointer = undefined;
  };

  /**
   * A mouse with nothing held lights the swelling it is over, so a desk player
   * is told what a press would take hold of before they press it. A finger
   * reports no such moves at all, which is why the press lights the same ring
   * on a phone.
   */
  const hover = (e: PointerEvent, p: { x: number; y: number } | null): void => {
    if (e.pointerType !== "mouse") return;
    // Kept whatever else is up: while a wave's opening holds the screen, the
    // ship is not what a cursor is over, but the guide's own buttons are.
    pointer = p ?? undefined;
    if (holding.size > 0) return;
    if (opening()) {
      hand.clear();
      return;
    }
    hand.over(
      layout(),
      p ? (shipUnder(layout(), p.x, p.y, field())?.hold ?? null) : null,
      p?.x ?? 0,
      p?.y ?? 0,
    );
  };

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const p = inStage(e);
    if (!p) return;
    canvas.setPointerCapture(e.pointerId);
    down(e.pointerId, p.x, p.y);
  });
  canvas.addEventListener("pointermove", (e) => {
    e.preventDefault();
    const p = inStage(e);
    const holds = p && holding.get(e.pointerId);
    const hold = holds?.[0];
    if (!holds || !hold) return hover(e, p);
    // Every position the move carries, not only the last: a browser coalesces
    // moves to one event a frame, and a gesture read as a bearing is read
    // backwards when a hand covers half a turn between two samples
    // (`coalesced.ts`, `sim/bearing.ts`).
    for (const sample of samplesOf(e)) {
      const at = inStage(sample);
      if (!at) continue;
      hand.down(layout(), hold, at.x, at.y);
      for (const h of holds) {
        const t = touchMove(layout(), h, at.x, at.y);
        if (t?.command) buffer.push(from(t), t.command);
      }
    }
  });
  const up = (e: PointerEvent, at: { x: number; y: number } | undefined): void => {
    const holds = holding.get(e.pointerId);
    if (!holds) return;
    holding.delete(e.pointerId);
    hand.clear();
    for (const hold of holds) {
      const t = touchUp(layout(), hold, at);
      if (t?.command) buffer.push(from(t), t.command);
    }
  };
  canvas.addEventListener("pointerup", (e) => up(e, inStage(e) ?? undefined));
  // A cancel is the browser taking the gesture away — a system edge swipe, a
  // palm, an incoming call, the compositor deciding a drag was a scroll after
  // all — never a decision the player made, so it carries no point to
  // `touchUp`: the same "no point to report" `releaseAll` gives a lift with
  // nothing to say, for the identical reason. A half-finished swipe or a
  // cannon tap the browser cut short fires nothing; a hold that only lets go
  // still lets go, because that half is not in question.
  canvas.addEventListener("pointercancel", (e) => up(e, undefined));
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  // A mouse that left the picture is not over anything, and the ring it lit
  // has to go out with it — `pointermove` stops arriving the moment it does.
  canvas.addEventListener("pointerleave", () => {
    pointer = undefined;
    if (holding.size === 0) hand.clear();
  });
  // The window losing focus (alt-tab, a click on another application) and the
  // pointer crossing the outer edge of the document (dragged past the browser
  // chrome) are the two ways a held mouse button actually goes silent on a PC.
  // Neither can happen with a finger, which is why nothing above already
  // covers this.
  window.addEventListener("blur", releaseAll);
  document.documentElement.addEventListener("pointerleave", releaseAll);

  showKeyHint(canvas);

  /**
   * Keyboard, for playing both roles alone at a desk. A/D slide the cannon
   * *and* the shield together, W fires red and opens the guard window in one
   * press, Q fires red alone, E fires cyan — both **held**, so holding one
   * fills the cannon lobe and fires a lance (`sim/lance.ts`) — and S opens the
   * maw, so one hand drives a whole test run.
   * J/L still move the shield alone and I still guards on its own, for the
   * moments a test needs the two apart. The keys stay live in every view — the
   * view switch decides what is *shown*, not what a single tester can reach.
   * The arrows step between waves.
   *
   * `guard` is still player 1's command whichever key sends it: the trigger and
   * the shield being in different hands is the rule the whole defence rests on.
   */
  return {
    tick: bindKeys({
      buffer,
      layout,
      cfg: bindings.cfg,
      isOver,
      creatures: bindings.creatures,
      guideHolds: bindings.guideHolds,
      onPauseToggle: bindings.onPauseToggle,
      onWaveStep: bindings.onWaveStep,
      onGuideReplay: bindings.onGuideReplay,
      // The wave's own panel, which is what the desk keyboard is now gated by
      // (`keys.ts`). The same accessor the band and the hit test already take.
      controls: bindings.controls,
    }),
    hand,
    pointer: () => pointer,
  };
}
