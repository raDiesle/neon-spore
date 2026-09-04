import {
  type Layout,
  navHit,
  onNavBar,
  onReadyCircle,
  type Stage,
  type ViewRole,
} from "@neon-spore/render";
import { guideHolds, guidePages, onReadyPage, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The thumb on a wave's guide. Everything else about the opening — which state
 * is up, whether it is still holding the wave, what putting it away costs — is
 * world state and belongs to `sim/briefing.ts`; this is only the press.
 */
export interface BriefingBinding {
  /**
   * Put both seats through to the end of the guide and hold there, so both
   * circles fill and the wave starts a moment later. Nothing happens when no
   * guide is up. It is what a caller with no thumbs has — a headless check,
   * `window.neonSpore` — and it is deliberately the *hold*, not a skip: the
   * gate is what it is because the fill takes real ticks, and a caller that
   * jumped it would be testing something the pair never sees.
   */
  dismiss(): void;
  /** Whether a guide is holding the wave. */
  holds(): boolean;
}

export interface BriefingOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  /** Read fresh on every event — the layout changes when the screen does. */
  layout: () => Layout;
  /** The phone-shaped rectangle the game is drawn into. Touches are relative to it. */
  stage: () => Stage;
  /** Which seat this device holds, for the cursor a press belongs to. */
  role: () => ViewRole;
}

/**
 * A guide's presses: BACK, NEXT, and the hold that says READY.
 *
 * **The whole stage used to be the button.** It could be, when a guide was one
 * card with one thing to do to it. Every guide has pages now — the owner asked
 * for a NEXT the pair presses when they are ready to move on, and a BACK beside
 * it — and a press anywhere that meant NEXT would put BACK out of reach on half
 * the screen. So the targets are the drawn ones, and they come from
 * `navButtons` and `readyButtonBox`, which is the same geometry the drawing
 * uses: a button cannot be answered where it is not drawn.
 *
 * **READY is a hold, not a tap, and the target is the circle itself.** The
 * circle fills for as long as the thumb is down and empties if it lifts before
 * READY (`sim/ready-gate.ts` says why), so this listens for the lift as well as
 * the press — on the window, because a thumb dragged off the canvas has still
 * let go. The owner's *still any touch of screen will let the circle animate*
 * is why it is the circle and not the page: the gate has three things on it now
 * and only one of them is the answer.
 *
 * **Only while the guide is up.** The introduction passes on a timer and is not
 * a thing to dismiss (the owner's own answer), so a tap during it is dropped
 * here rather than skipping past the wave's name — which is the one thing a
 * player who has just picked the phone up is most likely to do.
 *
 * Both seats' presses go into the buffer whichever seat this device holds. In a
 * room the lockstep scheduler drops the half this device is not sitting in,
 * which is the contract the keyboard already plays by (`keys.ts`), and solo
 * there is nobody else to wait for.
 */
export function bindBriefing({
  canvas,
  buffer,
  world,
  layout,
  stage,
  role,
}: BriefingOptions): BriefingBinding {
  const seat = (): 1 | 2 => (role() === "p2" ? 2 : 1);
  const hold = (on: boolean): void => {
    if (!guideHolds(world)) return;
    buffer.push(1, { kind: "brief", on });
    buffer.push(2, { kind: "brief", on });
  };
  const turn = (back: boolean): void => {
    buffer.push(1, { kind: "guideStep", back });
    buffer.push(2, { kind: "guideStep", back });
  };

  const at = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  let down = false;
  canvas.addEventListener("pointerdown", (e) => {
    if (!guideHolds(world)) return;
    const p = at(e);
    if (!p) return;
    const l = layout();
    const nav = navHit(l, p.x, p.y);
    if (nav) {
      turn(nav === "back");
      return;
    }
    // Everything else on a page of film does nothing. The gate is the one page
    // with something to hold, and its button is the only place holding it.
    if (!onReadyPage(world, seat())) return;
    if (onNavBar(l, p.y) || !onReadyCircle(l, p.x, p.y, role())) return;
    down = true;
    hold(true);
  });
  const lift = (): void => {
    if (!down) return;
    down = false;
    hold(false);
  };
  window.addEventListener("pointerup", lift);
  window.addEventListener("pointercancel", lift);
  return {
    dismiss: () => {
      if (!guideHolds(world)) return;
      // Through the pages first: a caller with no thumbs is done with the whole
      // guide rather than with the page it happens to be showing. Enough turns
      // to reach the gate from anywhere, because the commands all land on the
      // same tick and cannot see each other land — a turn past the last page is
      // clamped rather than an error (`sim/guide-steps.ts`).
      for (let i = 0; i < guidePages(world); i++) turn(false);
      hold(true);
    },
    holds: () => guideHolds(world),
  };
}
