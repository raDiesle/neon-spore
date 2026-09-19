import { onPhone, showPhoneView } from "./phone-view.js";

/**
 * THE THREE WAYS OUT OF A ROW IN THE WAVE LIST.
 *
 * The owner, 17 September 2026: *"when on mobile, I want to be able from the
 * list of waves for each wave to directly open the wave details or map
 * editor."* Getting from a wave to its map was three presses and two of them
 * were the menu — the thing the menu exists to keep out of the way.
 *
 * **And the field, 18 September 2026**: *"on mobile, navigate from list of
 * waves directly to game, should open the game screen. Right now it's
 * impossible to see it."* It is the same sentence one view further on, and
 * the view it names is the one the tool exists for — so GAME is a way out of
 * a row on the same terms as the other two rather than the one destination
 * that still costs the menu.
 *
 * **The row's own press still only selects.** That is deliberate and it is the
 * safer of the two arrangements the queue entry weighed: the list is also how
 * a desk user reads down the campaign, and a row that navigated would make
 * scanning it a series of departures. So the row grows three small targets
 * instead, each of them *select and go* in one press.
 *
 * **They are words, not glyphs**, and that is the one thing worth defending
 * here. The left of a row is already three or four marks — ♛ ⎈ ✎ and the fault
 * (`rail-marks.ts`) — and every one of them means *this wave has that*. Two
 * more glyphs on the right would be read as two more of those before they were
 * read as buttons; the first pair tried, ▤ and ▦, also came out as two almost
 * identical small blocks at phone size. WAVE, GAME and MAP are the header's own
 * names for the three views (`index.html`), so the button says exactly where it
 * goes.
 *
 * On a desktop all four columns are on screen at once, so the three buttons are
 * hidden by the stylesheet and this file's `scrollIntoView` is what a press
 * would have been worth there anyway — for GAME that is `#stageWrap`, the
 * field itself rather than the section it stands in.
 */

/**
 * Where a row can send you, and the word that says so. In the header's own
 * order (`PHONE_VIEWS`), so the three words on a row and the three in the
 * menu are the same three in the same order.
 */
const WAYS = [
  { view: "wave", word: "WAVE", says: "Open this wave's fields", to: "waveEditor" },
  { view: "game", word: "GAME", says: "Open this wave on the field", to: "stageWrap" },
  { view: "map", word: "MAP", says: "Open this wave's map", to: "mapCol" },
] as const;

/**
 * The three buttons for the row at `i`. `select` is the list's own selection —
 * taken first, because a view opened on the wave that was already showing is
 * the press doing nothing.
 */
export function openButtons(i: number, select: (i: number) => void): HTMLButtonElement[] {
  return WAYS.map((way) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "row-open";
    button.dataset.open = way.view;
    button.title = way.says;
    button.setAttribute("aria-label", way.says);
    button.textContent = way.word;
    button.addEventListener("click", (e) => {
      // The row under these is a button of its own and would otherwise select
      // the wave a second time on the way past.
      e.stopPropagation?.();
      select(i);
      if (onPhone()) showPhoneView(way.view);
      else document.getElementById(way.to)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  });
}
