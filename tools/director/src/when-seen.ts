/**
 * **A picture drawn when it is about to be seen, and not before.**
 *
 * Every card on a documentation page is a real frame of the shipping
 * renderer: a world posed by walking a hand to a state, then drawn. CONTROLS
 * › ON THE FIELD has about a hundred of them, and drawing all of them before
 * the room showed anything took 27 seconds on a phone-speed CPU (the owner,
 * 11 October 2026: CONTROLS *takes huge time*, and asked for what is drawn to
 * follow what is scrolled to). `whenSeen` holds a box's filling until the box
 * comes within `AHEAD` of the screen, so a room opens on its first screenful
 * and the rest is paid for while scrolling — and a box nobody scrolls to costs
 * nothing at all.
 *
 * One observer for every box, sorted by `entry.target`: a page has hundreds
 * of them, and one each would be hundreds of observers for one question. A box
 * in a room that is `display: none` never intersects, so a hidden room draws
 * nothing until it is opened.
 *
 * Without an `IntersectionObserver` (a test's fake DOM may lack one) a box is
 * filled at once — the page as it was before.
 */

/** How far below (and above) the screen a box is filled: a screenful ahead,
 * so a picture is usually there before the thumb brings it in. */
const AHEAD = "100% 0px";

/**
 * The margin twice over: `rootMargin` widens the window, and `scrollMargin`
 * widens each scrolling box between — a sheet's body is one, and without it
 * the sheet's own edge clips the box until it is actually on screen. A browser
 * that does not know `scrollMargin` draws each picture as it comes in instead.
 */
const OPTIONS: IntersectionObserverInit & { scrollMargin?: string } = {
  rootMargin: AHEAD,
  scrollMargin: AHEAD,
};

let watcher: IntersectionObserver | null = null;
/**
 * The class `watcher` was built from. A page has one for its lifetime, but
 * test files share this module within a shard, and each installs and tears
 * down a fake DOM of its own: a watcher kept from an earlier file's fake
 * reports to an observer nobody is asking any more, and *a STATES room's own
 * section* failed under `bun run land` that way and passed alone
 * (`test/when-seen.test.ts`).
 */
let builtFrom: typeof IntersectionObserver | null = null;
const fillers = new WeakMap<Element, () => void>();

/** Runs `fill` once, the first time `el` comes within a screen of being seen. */
export function whenSeen(el: Element, fill: () => void): void {
  if (typeof IntersectionObserver !== "function") {
    fill();
    return;
  }
  fillers.set(el, fill);
  if (builtFrom !== IntersectionObserver) {
    builtFrom = IntersectionObserver;
    watcher = null;
  }
  watcher ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const seen = fillers.get(entry.target);
      if (!seen) continue;
      fillers.delete(entry.target);
      watcher?.unobserve(entry.target);
      seen();
    }
  }, OPTIONS);
  watcher.observe(el);
}
