/**
 * Opening a section link (`section-link.ts`): scroll to the section its hash
 * names, once the page under it has drawn.
 *
 * **No id is written on the page.** The slug is matched against the same
 * headings the contents menu lists and the cards' own `data-concept`, read
 * at the moment of the jump — so a heading called "states" never collides
 * with the `#states` sheet, and a page that redraws cannot leave a stale id.
 */

import { labelOf } from "./contents-here.js";
import { listedHeadings } from "./contents-list.js";
import { releaseHash } from "./section-hash.js";
import { findSection } from "./section-link.js";

/**
 * Everything a link can point at that is on screen, in page order: contents
 * headings first, then cards. On screen, because two sheets may share a
 * heading's words and only the one the query string opened is meant.
 */
function targets(): { text: string; el: HTMLElement }[] {
  const found: { text: string; el: HTMLElement }[] = [];
  for (const nav of document.querySelectorAll<HTMLElement>("nav[data-contents]")) {
    const container = document.getElementById(nav.dataset.contents ?? "");
    if (!container) continue;
    for (const h of listedHeadings(container)) {
      found.push({ text: labelOf(h), el: h });
      // A link copied before links were named by the label alone.
      if (h.dataset.label) found.push({ text: h.textContent ?? "", el: h });
    }
  }
  for (const card of document.querySelectorAll<HTMLElement>(".plan[data-concept]")) {
    found.push({ text: card.dataset.concept ?? "", el: card });
  }
  return found.filter((t) => t.el.offsetParent !== null);
}

/** How long a link waits for its page to draw before giving up quietly. */
const PATIENCE_MS = 15_000;

/**
 * How long the section is held in place after the jump while the page above
 * it is still drawing. ON THE FIELD draws its pictures late, each a box that
 * grows, and a jump made before them lands 900 px short of where it was
 * aimed (14 October 2026).
 */
const HOLD_MS = 5_000;
const HOLD_TICK_MS = 100;

/** What says the reader has taken the scroll over, and the hold must let go. */
const READER_MOVES = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Keeps `el` where the jump put it while the page under it settles: each tick
 * it has drifted, it is scrolled back. Stops at `HOLD_MS` or the reader's
 * first move, whichever is sooner, and then `done`.
 */
function holdInPlace(el: HTMLElement, done: () => void): void {
  const landed = el.getBoundingClientRect().top;
  let over = false;
  const end = (): void => {
    if (over) return;
    over = true;
    clearInterval(tick);
    for (const type of READER_MOVES) document.removeEventListener(type, end, true);
    done();
  };
  const tick = setInterval(() => {
    if (Math.abs(el.getBoundingClientRect().top - landed) > 2) {
      el.scrollIntoView({ block: "start" });
    }
  }, HOLD_TICK_MS);
  for (const type of READER_MOVES) document.addEventListener(type, end, true);
  setTimeout(end, HOLD_MS);
}

/**
 * Read once at startup, after every sheet has restored itself: scroll to the
 * section the hash names. The pages draw late — NOT BUILT YET after a fetch,
 * STYLE on first sight of its tab — so this watches the document until the
 * section exists, then scrolls to it and holds it there while the page
 * settles (`holdInPlace`). A hash nothing matches is a link older than the
 * heading it named, and does nothing.
 *
 * The hash is let go (`section-hash.ts`) once the hold is over, so the bar's
 * readings while the page settled never overwrite it — a card's slug among
 * them, which the bar would name by its section.
 */
export function followHash(): void {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  if (!slug) {
    releaseHash();
    return;
  }

  let observer: MutationObserver | null = null;
  let stopped = false;
  const stop = (): boolean => {
    if (stopped) return false;
    stopped = true;
    observer?.disconnect();
    return true;
  };
  const tryJump = (): boolean => {
    if (stopped) return true;
    // Nothing yet on screen by that name — a page still loading, a tab not
    // yet drawn.
    const hit = findSection(targets(), slug);
    if (!hit) return false;
    hit.el.scrollIntoView({ block: "start" });
    hit.el.classList.add("is-linked");
    setTimeout(() => hit.el.classList.remove("is-linked"), 2400);
    if (stop()) holdInPlace(hit.el, releaseHash);
    return true;
  };

  if (tryJump()) return;
  let due = false;
  observer = new MutationObserver(() => {
    if (due) return;
    due = true;
    // A timer, not a frame: a link opened in a background tab gets no frames
    // until it is looked at, and the page under it should be ready by then.
    setTimeout(() => {
      due = false;
      tryJump();
    }, 50);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    if (stop()) releaseHash();
  }, PATIENCE_MS);
}
