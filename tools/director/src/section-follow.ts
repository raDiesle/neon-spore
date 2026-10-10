/**
 * Opening a section link (`section-link.ts`): scroll to the section its hash
 * names, once the page under it has drawn.
 *
 * **No id is written on the page.** The slug is matched against the same
 * headings the contents menu lists and the cards' own `data-concept`, read
 * at the moment of the jump — so a heading called "states" never collides
 * with the `#states` sheet, and a page that redraws cannot leave a stale id.
 */

import { findSection } from "./section-link.js";
import { listedHeadings } from "./tabs.js";

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
    for (const h of listedHeadings(container)) found.push({ text: h.textContent ?? "", el: h });
  }
  for (const card of document.querySelectorAll<HTMLElement>(".plan[data-concept]")) {
    found.push({ text: card.dataset.concept ?? "", el: card });
  }
  return found.filter((t) => t.el.offsetParent !== null);
}

/** How long a link waits for its page to draw before giving up quietly. */
const PATIENCE_MS = 15_000;

/**
 * Read once at startup, after every sheet has restored itself: scroll to the
 * section the hash names. The pages draw late — NOT BUILT YET after a fetch,
 * STYLE on first sight of its tab — so this watches the document until the
 * section exists, then scrolls once and stops watching. A hash nothing
 * matches is a link older than the heading it named, and does nothing.
 */
export function followHash(): void {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  if (!slug) return;

  let observer: MutationObserver | null = null;
  const stop = (): void => observer?.disconnect();
  const tryJump = (): boolean => {
    // Nothing yet on screen by that name — a page still loading, a tab not
    // yet drawn.
    const hit = findSection(targets(), slug);
    if (!hit) return false;
    hit.el.scrollIntoView({ block: "start" });
    hit.el.classList.add("is-linked");
    setTimeout(() => hit.el.classList.remove("is-linked"), 2400);
    stop();
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
  setTimeout(stop, PATIENCE_MS);
}
