/**
 * **A live overlay hides the director under it** — THE PULL LAB
 * (`pull-lab.ts`) and TRY IT (`field-try.ts`), each a loop drawing sixty
 * frames a second over the whole window.
 *
 * Covering a page with a black box stops nothing under it: the GAME column's
 * stage kept stepping its world and painting its HUD under the lab, and on a
 * phone the lab opened from CONTROLS › ON THE FIELD sat over a hundred drawn
 * cards the browser still had to keep composited (the owner, 11 October 2026:
 * the lab *is very slow* on a phone). So everything else in `<body>` is
 * `display: none` while the overlay is up: a stage loop's observer sees its
 * canvas leave the screen and stops (`stage-loop.ts`), and nothing under the
 * overlay is painted at all.
 *
 * `display: none` forgets where a scrolled box was, so every scrolled element
 * — the window and any sheet's own body — is read before and put back after.
 */

/** Hides every child of `<body>` but `overlay`; the returned function shows them again. */
export function coverPage(overlay: HTMLElement): () => void {
  const scrolled = [...document.querySelectorAll<HTMLElement>("body *")]
    .filter((el) => el.scrollTop > 0 || el.scrollLeft > 0)
    .map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft }));
  const page = { x: window.scrollX, y: window.scrollY };
  // Inline, so no sheet's own `display` rule can outrank it; whatever inline
  // value was there is put back.
  const hidden = [...document.body.children]
    .filter((el): el is HTMLElement => el instanceof HTMLElement && el !== overlay)
    .map((el) => ({ el, was: el.style.display }));
  for (const { el } of hidden) el.style.display = "none";
  return () => {
    for (const { el, was } of hidden) el.style.display = was;
    for (const { el, top, left } of scrolled) {
      el.scrollTop = top;
      el.scrollLeft = left;
    }
    window.scrollTo(page.x, page.y);
  };
}
