import {
  type Field,
  type Hold,
  shipUnder,
  touchDown,
  touchMove,
  touchUp,
} from "@neon-spore/render";
import type { Bindings } from "./input-bindings.js";
import { showKeyHint } from "./key-hint.js";
import { bindKeys } from "./keys.js";
import { ShipHandWatch } from "./ship-hand.js";

export type { Bindings } from "./input-bindings.js";
// Two things lifted out when this file reached its length limit, re-exported
// so nothing that reached for either through here had to move: the queue every
// listener in the app writes into, and the shape this one is handed.
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
}

/**
 * Both players on one device — the test setup, not the finished game. The two
 * strips answer to separate pointers, so two thumbs on one phone already play
 * the real split: player 1 has the cannon and the trigger, player 2 has the
 * shield and the colours.
 */
export function bindControls({
  canvas,
  buffer,
  layout,
  stage,
  isOver,
  player,
  cfg,
  maze,
  controls,
  warden,
  creatures,
  cannonCol,
  shieldCol,
  opening,
  beatPhase,
  guideHolds,
  snakeHolds,
  onPauseToggle,
  onWaveStep,
}: Bindings): Controls {
  /** Which finger is doing what. What each one *means* is `touch.ts`'s. */
  const holding = new Map<number, Hold>();
  const hand = new ShipHandWatch();
  const field = (): Field => ({
    creatures: creatures(),
    cannonCol: cannonCol(),
    shieldCol: shieldCol(),
    beatPhase: beatPhase(),
    seat: player(),
    cfg,
    maze: maze(),
    warden: warden(),
    controls: controls(),
  });

  const down = (id: number, x: number, y: number): void => {
    if (isOver()) {
      buffer.push(1, { kind: "restart" });
      return;
    }
    const t = touchDown(layout(), x, y, field());
    if (!t) return;
    if (t.hold) {
      holding.set(id, t.hold);
      if (!opening()) hand.down(layout(), t.hold, x);
    }
    // Null for the one press that takes hold of something and says nothing
    // yet: player 2's thumb landing on the muzzle, which is decided on the
    // lift (`render/touch-ship.ts`).
    if (t.command) buffer.push(t.player, t.command);
  };

  /**
   * Every hold this device is carrying, let go at once. A finger that leaves
   * the glass always fires `pointerup` — the OS delivers it to the page that
   * owns the touch. A mouse dragged off the *window* is not the same: once the
   * cursor is over another application (or another monitor with no browser
   * under it), this page stops receiving pointer events altogether, capture or
   * not, and a held cannon or a held lance would stay held forever. This is
   * the phone's `up`, called for every id still down, from whichever of the
   * two ways a PC actually loses a pointer this way (`window.blur` and the
   * pointer crossing the edge of the document) fires first.
   */
  const releaseAll = (): void => {
    for (const [id, hold] of holding) {
      holding.delete(id);
      // No point to report, so a half-finished swipe fires nothing — see
      // `touchUp`. Losing the window is not a shot the player took.
      const t = touchUp(layout(), hold, field());
      if (t?.command) buffer.push(t.player, t.command);
    }
    hand.clear();
  };

  /**
   * Screen to stage. The game is drawn into a phone-shaped rectangle, so on a
   * wide window a touch is offset by the same amount the picture is — and a
   * touch beside the rectangle belongs to nothing.
   */
  const inStage = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  /**
   * A mouse with nothing held lights the swelling it is over, so a desk player
   * is told what a press would take hold of before they press it. A finger
   * reports no such moves at all, which is why the press lights the same ring
   * on a phone.
   */
  const hover = (e: PointerEvent, p: { x: number; y: number } | null): void => {
    if (e.pointerType !== "mouse" || holding.size > 0) return;
    if (opening()) {
      hand.clear();
      return;
    }
    hand.over(
      layout(),
      p ? (shipUnder(layout(), p.x, p.y, field())?.hold ?? null) : null,
      p?.x ?? 0,
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
    const hold = p && holding.get(e.pointerId);
    if (!hold) return hover(e, p);
    hand.down(layout(), hold, p.x);
    const t = touchMove(layout(), hold, p.x, p.y);
    if (t?.command) buffer.push(t.player, t.command);
  });
  const up = (e: PointerEvent): void => {
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    holding.delete(e.pointerId);
    hand.clear();
    const t = touchUp(layout(), hold, field(), inStage(e) ?? undefined);
    if (t?.command) buffer.push(t.player, t.command);
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  // A mouse that left the picture is not over anything, and the ring it lit
  // has to go out with it — `pointermove` stops arriving the moment it does.
  canvas.addEventListener("pointerleave", () => {
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
   * press, Q fires red alone, E fires cyan, S opens the maw, F holds the
   * lance, so one hand drives a whole test run.
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
      cfg,
      isOver,
      creatures,
      guideHolds,
      snakeHolds,
      onPauseToggle,
      onWaveStep,
    }),
    hand,
  };
}
