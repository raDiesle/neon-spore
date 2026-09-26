import { type Layout, navHit, navStepHit, onNavBar, type ViewRole } from "@neon-spore/render";
import { guideHolds, guidePage, guidePages, onReadyPage, type World } from "@neon-spore/sim";
import { swipeTurn } from "./guide-swipe.js";
import type { InputBuffer } from "./input.js";
import { askForLean } from "./lean.js";

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
  /** A pointer event on the stage, or null beside it — one conversion for
   * every listener in the app (`viewport.ts`, `render/stage-point.ts`). */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  /** Which seat this device holds, for the cursor a press belongs to. */
  role: () => ViewRole;
  /**
   * Play the page of film again. Not a command: the film's clock is render
   * state and no part of the world, so REPLAY is asked of the renderer rather
   * than sent to both seats (`render/guide-play.ts`).
   */
  replay: () => void;
  /** A press on the picture of a film page, which the bar answers with a flash
   * rather than the page with anything (`render/guide-nav.ts`). */
  nudge: () => void;
}

/**
 * A guide's presses: BACK, REPLAY, NEXT, SKIP, and the hold that says READY.
 *
 * **REPLAY on the gate reads the guide again.** There is no film on the ready
 * page for it to play, so it goes back to the first page instead — the owner,
 * 25 September 2026: *when repeat button is pressed on "ready" screen it
 * should start the tutorial from the beginning.* A seat that has said READY
 * cannot turn at all (`sim/guide-steps.ts`), and the bar draws it dead then.
 *
 * **The whole stage used to be the button.** It could be, when a guide was one
 * card with one thing to do to it. Every guide has pages now — the owner asked
 * for a NEXT the pair presses when they are ready to move on, and a BACK beside
 * it — and a press anywhere that meant NEXT would put BACK out of reach on half
 * the screen. So the targets are the drawn ones, and they come from
 * `navHit` and `onNavBar` (`render/guide-look.ts`), which hit-test against the
 * same `GUIDE_LOOK.buttons` the bar draws from: a button cannot be answered
 * where it is not drawn.
 *
 * **READY is a hold, not a tap, and the target is the whole page.** The circle
 * fills for as long as the thumb is down and empties if it lifts before READY
 * (`sim/ready-gate.ts` says why), so this listens for the lift as well as the
 * press — on the window, because a thumb dragged off the canvas has still let
 * go. It was narrowed to the circle for a while and the owner asked for it
 * back: *I want on fullscreen that press will make the circle ready.* Everything
 * but the bar, then — that is the one strip of this page where a press already
 * means something else.
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
  inStage,
  role,
  replay,
  nudge,
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
  /**
   * Straight to a page, as the marks in the bar are pressed.
   *
   * **As turns, because a turn is all the wire carries** — `guideStep` is one
   * page either way and the room has no command for a cursor
   * (`sim/guide-steps.ts`). They all land on the same tick and cannot see each
   * other land, which is exactly what `dismiss` below relies on, and a turn
   * past either end is clamped rather than an error.
   */
  const turnTo = (page: number): void => {
    const at = guidePage(world, seat());
    for (let i = 0; i < Math.abs(page - at); i++) turn(page < at);
  };

  /**
   * Straight to the gate and READY there — SKIP, the narrow »» beside NEXT.
   *
   * **The hold, not a latch,** for the reason `dismiss` gives: the gate fills
   * over `readyHoldMs` and this is the same hold a thumb makes, only nobody has
   * to keep it down — nothing lets go of it, because `down` never went true.
   * It is 150 ms, so it reads as at once. Enough turns to reach the gate from
   * anywhere, landing on the same tick as the hold and before it.
   */
  const skip = (): void => {
    for (let i = 0; i < guidePages(world); i++) turn(false);
    hold(true);
  };

  let down = false;
  /** Where the thumb went down, while it is still down: a swipe is measured
   * from it, and it is forgotten on the lift. */
  let from: { x: number; y: number } | null = null;
  /** Whether this press has already turned a page, so one drag turns one. */
  let swiped = false;
  canvas.addEventListener("pointerdown", (e) => {
    if (!guideHolds(world)) return;
    const p = inStage(e);
    if (!p) return;
    const l = layout();
    const nav = navHit(l, p.x, p.y);
    if (nav === "skip") skip();
    else if (nav === "replay" && onReadyPage(world, seat())) turnTo(0);
    else if (nav === "replay") replay();
    else if (nav) turn(nav === "back");
    if (nav) return;
    // The row of marks over NEXT, which says which step this is and is now
    // also how a step is reached (`render/guide-look.ts`). Asked after the
    // four buttons and before the bar swallows the press.
    const mark = navStepHit(l, guidePages(world), p.x, p.y);
    if (mark !== null) {
      turnTo(mark);
      return;
    }
    if (onNavBar(l, p.y)) return;
    // From here the press may still become a swipe, so where it began is kept
    // whichever page it began on — the picture of a film is not live, and a
    // thumb dragged across it turns the page all the same.
    from = p;
    swiped = false;
    // Everything else on a page of film does nothing to the page — the picture
    // is not live, and the bar flashes to say so. The gate is the one page
    // with something to hold, and there the whole page holds it.
    if (!onReadyPage(world, seat())) {
      nudge();
      return;
    }
    down = true;
    hold(true);
  });
  // A drag, which is a page turn and never also a hold: the thumb that crosses
  // `SWIPE_MIN` lets go of the gate on the way past, so a swipe that started on
  // the ready page cannot fill a circle behind it (`guide-swipe.ts`).
  canvas.addEventListener("pointermove", (e) => {
    if (from === null || swiped || !guideHolds(world)) return;
    const p = inStage(e);
    if (!p) return;
    const way = swipeTurn(p.x - from.x, p.y - from.y);
    if (way === null) return;
    swiped = true;
    if (down) {
      down = false;
      hold(false);
    }
    turn(way === "back");
  });
  const lift = (): void => {
    from = null;
    if (!down) return;
    down = false;
    hold(false);
    // THE PLUMB is played by the phone's lean, and iOS reads none until it is
    // asked from a press; this lift is the navigator's first (`lean.ts`).
    if (world.boss?.kind === "plumb") askForLean();
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
      skip();
    },
    holds: () => guideHolds(world),
  };
}
