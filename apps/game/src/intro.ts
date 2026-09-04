import { INTRO_PAGE_COUNT } from "@neon-spore/content";
import { drawIntroPage, introHit, type Layout } from "@neon-spore/render";

/**
 * THE SIX PAGES A PAIR SEES BEFORE THEY HAVE CHOSEN ANYTHING.
 *
 * Once, on the first visit, and again whenever somebody asks for it — from the
 * menu, or from the room screen, where the person who has just been sent a
 * link is standing. The owner asked for it by name: *a cinematic like tutorial
 * when entering the game first, explaining the core concept of the game.*
 *
 * It is drawn on the game's own canvas (`render/intro-page.ts`) and the
 * presses are taken by a transparent sheet over it. That is the one thing this
 * file exists to arrange, and it is not a detail: the field's own listener,
 * the guide's and three rounds' all sit on the same canvas, and a press meant
 * for NEXT that also slid the cannon would be a bug nobody could see. A sheet
 * on top means none of them ever hears it, whatever order they were bound in.
 *
 * The world goes on running behind the pages, which is why the veil they are
 * drawn over is translucent: what somebody reads *about* is moving underneath
 * while they read it.
 */

/** Where the browser keeps whether this device has seen it. */
export const INTRO_KEY = "neon-spore.intro";
/** What is written there. A version rather than a flag: the day the pages are
 * rewritten enough to be worth showing again, this is how they say so. */
export const INTRO_VERSION = "1";

/**
 * Whether the intro opens on its own, given what storage remembers.
 *
 * Pure, and separate from the reading, so the rule can be tested in a runner
 * with no DOM — the same shape `progress.ts` and `menu.ts` both take.
 *
 * It opens only where the menu would have: `?play=1` is the tester's door and
 * the tool that photographs the game, and a title screen in front of either is
 * exactly the tap the menu itself was careful not to add.
 */
export function opensIntro(stored: string | null, opensOnMenu: boolean): boolean {
  return opensOnMenu && stored !== INTRO_VERSION;
}

/** What this device remembers, or null where it remembers nothing — a private
 * window, a browser that refuses, a device that has never been here. */
export function readIntroSeen(): string | null {
  try {
    return localStorage.getItem(INTRO_KEY);
  } catch {
    return null;
  }
}

export interface IntroBinding {
  /** The sheet that takes the presses. Absent in a build without it: the intro
   * then never opens rather than opening something nothing can close. */
  sheet: HTMLElement | null;
  layout: () => Layout;
  /** A pointer event in the coordinates the renderer drew in (`viewport.ts`). */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  /** Down while the intro is up: the same hold the menu takes, so a reader is
   * not being played against. */
  hold: (on: boolean) => void;
}

export interface Intro {
  isOpen: () => boolean;
  /**
   * Show it from the top. `after` is what the screen goes back to when it
   * closes — the menu, the room screen, or nothing at all — and it is handed
   * in per opening rather than fixed here, because the intro is reached from
   * three places and each of them is somewhere different to be put back.
   */
  open: (after?: () => void) => void;
  close: () => void;
  /** Drawn over the frame that has just been painted, every frame it is up. */
  over: (ctx: CanvasRenderingContext2D, dt: number) => void;
}

export function bindIntro(b: IntroBinding): Intro {
  let open = false;
  let page = 0;
  /** Seconds the page that is up has been up. The type lands on this. */
  let age = 0;
  /** Where a mouse is resting, so a button under it lights. A phone sets none. */
  let pointer: { x: number; y: number } | undefined;
  /** Where the screen goes back to. Set by whoever opened it. */
  let after: (() => void) | undefined;

  const show = (on: boolean): void => {
    open = on;
    b.sheet?.classList.toggle("on", on);
    // The chrome steps aside with it: the chips are under the sheet and
    // unreachable already, and this is so they are not read either
    // (`game.css`).
    document.body.dataset.intro = on ? "on" : "off";
    b.hold(on);
  };

  const turn = (to: number): void => {
    if (to >= INTRO_PAGE_COUNT) {
      // Past the last page is the way out: NEXT on the sixth is PLAY.
      close();
      return;
    }
    page = Math.max(0, to);
    // The clock restarts, so paging back replays the drop rather than arriving
    // with the words already settled — a wave's opening does the same.
    age = 0;
  };

  function close(): void {
    if (!open) return;
    show(false);
    try {
      localStorage.setItem(INTRO_KEY, INTRO_VERSION);
    } catch {
      // A browser that refuses to remember shows it again next time, which is
      // a worse first minute than it should be and not a reason to fail here.
    }
    const back = after;
    after = undefined;
    back?.();
  }

  b.sheet?.addEventListener("pointerdown", (e) => {
    if (!open) return;
    e.preventDefault();
    const p = b.inStage(e);
    if (!p) return;
    const hit = introHit(b.layout(), p.x, p.y);
    if (hit === "skip") close();
    else if (hit === "back") turn(page - 1);
    else if (hit === "next" || hit === "page") turn(page + 1);
  });
  b.sheet?.addEventListener("pointermove", (e) => {
    if (!open || e.pointerType !== "mouse") return;
    pointer = b.inStage(e) ?? undefined;
  });
  b.sheet?.addEventListener("pointerleave", () => {
    pointer = undefined;
  });

  return {
    isOpen: () => open,
    open: (goBackTo) => {
      if (!b.sheet) return;
      page = 0;
      age = 0;
      pointer = undefined;
      after = goBackTo;
      show(true);
    },
    close,
    over: (ctx, dt) => {
      if (!open) return;
      age += dt;
      drawIntroPage(ctx, b.layout(), page, age, pointer);
    },
  };
}
