/**
 * The map follows the beat that is playing.
 *
 * A wave is thirty beats long and the map column shows about a dozen, so the
 * author used to scroll by hand to see where the transport had got to — and
 * scroll again to reach the row they wanted to edit, because the beat playing
 * was at the bottom edge with nothing after it. Following it is not enough on
 * its own: what has to stay on screen is the marked row **and the next few
 * rows after it**, which are the ones being written.
 *
 * Two rules make it bearable rather than seasick:
 *
 * - **It moves in steps, not by the beat.** While the band — the marked row
 *   plus `aheadPx` of map after it — is on screen, nothing scrolls at all.
 *   When it falls off, the marked row is put one row down from the top and
 *   the rest of the column is the map after it, which is both what an author
 *   writing ahead wants to see and what buys the most beats of stillness
 *   before the next move.
 * - **A hand always wins.** Scrolling by hand detaches the follow, and it
 *   stays detached for as long as the marked row is still somewhere on screen
 *   — an author reading beat 20 while beat 8 plays is not interrupted. Once
 *   the transport leaves the screen entirely the follow takes over again.
 */

export interface FollowBox {
  scrollTop: number;
  /** What the scroll box shows. */
  viewH: number;
  /** What it has to show, all told. */
  contentH: number;
}

export interface FollowRow {
  /** The row's top, in the scrolled content's own coordinates. */
  top: number;
  height: number;
}

/**
 * Pure: where the scroll box should go, or null for "it is already fine".
 *
 * `aheadPx` is how much map after the row must stay visible. When the row and
 * that much map cannot both fit, the row wins and sits as high as it can —
 * the beat playing is never the thing pushed off.
 */
export function followTop(box: FollowBox, row: FollowRow, aheadPx: number): number | null {
  const viewBottom = box.scrollTop + box.viewH;
  const bandBottom = row.top + row.height + aheadPx;
  if (row.top >= box.scrollTop && bandBottom <= viewBottom) return null;
  // One row of context above, and everything else given to what comes after.
  const lead = Math.max(0, Math.min(row.height, box.viewH - row.height - aheadPx));
  const most = Math.max(0, box.contentH - box.viewH);
  const top = Math.min(Math.max(row.top - lead, 0), most);
  return Math.abs(top - box.scrollTop) < 1 ? null : Math.round(top);
}

export interface Following {
  /** Keep this row, and the map after it, on screen. */
  to(row: HTMLElement | null): void;
}

/** How long a scroll of our own goes on arriving in `scroll` events. */
const OURS_MS = 400;

export function bindFollow(grid: HTMLElement, aheadPx: () => number): Following {
  // Whether the author has taken the column somewhere of their own.
  let away = false;
  let ours = 0;
  const watched = new WeakSet<HTMLElement>();

  const watch = (box: HTMLElement): void => {
    if (watched.has(box)) return;
    watched.add(box);
    box.addEventListener("scroll", () => {
      const now = Date.now();
      // A smooth scroll of ours arrives as a stream of events; each one
      // extends the window rather than being read as a hand on the wheel.
      if (now - ours < OURS_MS) {
        ours = now;
        return;
      }
      away = true;
    });
  };

  return {
    to(row) {
      if (!row) return;
      const box = scrollBoxOf(grid);
      if (!box) return;
      watch(box);
      const boxRect = box.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const onScreen = rowRect.bottom > boxRect.top && rowRect.top < boxRect.bottom;
      if (away && onScreen) return;
      away = false;
      const next = followTop(
        { scrollTop: box.scrollTop, viewH: box.clientHeight, contentH: box.scrollHeight },
        { top: rowRect.top - boxRect.top + box.scrollTop, height: rowRect.height },
        aheadPx(),
      );
      if (next === null) return;
      ours = Date.now();
      box.scrollTo({ top: next, behavior: "smooth" });
    },
  };
}

/**
 * The nearest ancestor that actually scrolls down.
 *
 * Read on every move rather than once: the map column's own `overflow-x:
 * auto` computes `overflow-y` to `auto` as well, so the test has to be
 * whether there is anything to scroll — which is a fact about the wave's
 * length, and changes while the page is open.
 */
function scrollBoxOf(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const how = getComputedStyle(node).overflowY;
    if (/auto|scroll|overlay/.test(how) && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return null;
}
