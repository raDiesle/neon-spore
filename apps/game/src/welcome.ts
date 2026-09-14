import { drawGuideWelcome, type Layout, type ViewRole } from "@neon-spore/render";
import { guideHolds, guidePage, type World } from "@neon-spore/sim";

/**
 * THE PAGE BEFORE A DEVICE'S FIRST TUTORIAL.
 *
 * *Welcome — let's start with the tutorial; this is how the stepper works.*
 * The owner asked for it on 14 September 2026, with the plate and the bar's
 * flash, as the third thing a tutorial needs before it plainly is one: a pair
 * meeting BACK, REPLAY and NEXT for the first time have not been told that
 * the picture waits for them, so they press the picture.
 *
 * It is `intro.ts` in every arrangement — drawn on the canvas over the frame
 * (`render/guide-welcome.ts`), presses taken by a transparent sheet so none
 * of the canvas's own listeners hears them, remembered under a versioned key
 * — and it differs in when: not on the menu, but on the first page of the
 * first guide this device meets, whichever wave that is. While it is up the
 * film under it is held on its first frame, which is the host's doing: the
 * frame hands the renderer no time (`frame.ts`).
 */

/** Where the browser keeps whether this device has seen it. */
export const WELCOME_KEY = "neon-spore.welcome";
/** What is written there — a version, so the day it is worth showing again
 * is one character here (`intro.ts` says why). */
export const WELCOME_VERSION = "1";

/**
 * Whether the welcome opens on its first guide, given what storage remembers.
 *
 * Pure, so the rule is tested without a DOM. It opens only where the menu
 * would have, for the intro's reason: `?play=1` is the tester's door and the
 * camera's, and a page in front of either is a tap neither asked for. Except
 * when asked for by name — `?welcome=1` — which is how it is photographed.
 */
export function opensWelcome(
  stored: string | null,
  opensOnMenu: boolean,
  forced: boolean,
): boolean {
  return forced || (opensOnMenu && stored !== WELCOME_VERSION);
}

/** Whether the URL asks for the page whatever the device remembers. */
export function welcomeForced(url: string): boolean {
  return new URL(url).searchParams.get("welcome") === "1";
}

/** What this device remembers, or null where it remembers nothing. */
export function readWelcomeSeen(): string | null {
  try {
    return localStorage.getItem(WELCOME_KEY);
  } catch {
    return null;
  }
}

export interface WelcomeBinding {
  /** The sheet that takes the press. Absent in a build without it: the page
   * then never opens rather than opening something nothing can close. */
  sheet: HTMLElement | null;
  /** Paints where the frame underneath was painted (`intro.ts` says why). */
  onStage: (
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D, layout: Layout) => void,
  ) => void;
  world: World;
  role: () => ViewRole;
  /** Whether something is covering the game — the menu, the intro — so the
   * guide under it is not being looked at yet (`run-state.ts`). */
  covered: () => boolean;
  /** Whether it may open at all on this visit — `opensWelcome`, decided once. */
  opens: boolean;
}

export interface Welcome {
  isOpen: () => boolean;
  /** Drawn over the frame every frame it is up. Opens itself on the first
   * page of the first guide, and closes itself if that guide goes. */
  over: (ctx: CanvasRenderingContext2D, dt: number) => void;
}

export function bindWelcome(b: WelcomeBinding): Welcome {
  let open = false;
  /** Whether it has been up on this visit: once, and not again on the next
   * guide even where storage refused to remember. */
  let shown = !b.opens;
  let age = 0;

  const show = (on: boolean): void => {
    open = on;
    b.sheet?.classList.toggle("on", on);
  };

  function close(): void {
    if (!open) return;
    show(false);
    try {
      localStorage.setItem(WELCOME_KEY, WELCOME_VERSION);
    } catch {
      // A browser that refuses to remember shows it again next visit, which
      // is one page too many and not a reason to fail here.
    }
  }

  b.sheet?.addEventListener("pointerdown", (e) => {
    if (!open) return;
    e.preventDefault();
    // Anywhere: the page says the bar is the way on, and a press on the bar
    // that closed the page and also turned it would teach the opposite.
    close();
  });

  return {
    isOpen: () => open,
    over: (ctx, dt) => {
      if (!open) {
        if (shown || !b.sheet || b.covered() || !guideHolds(b.world)) return;
        if (guidePage(b.world, b.role() === "p2" ? 2 : 1) !== 0) return;
        shown = true;
        age = 0;
        show(true);
      } else if (!guideHolds(b.world)) {
        // The guide went out from under it — a wave jumped to, a room
        // starting — and a page about a stepper with no stepper under it is
        // closed without being read.
        close();
        return;
      }
      age += dt;
      b.onStage(ctx, (c, l) => {
        drawGuideWelcome(c, l, age);
      });
    },
  };
}
