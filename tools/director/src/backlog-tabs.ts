import { drawCards, mountCardTab } from "./guide-page.js";
import { drawRaster, mountRasterTab } from "./raster-page.js";
import { renderShapes } from "./shapes-panel.js";
import { bindTabs } from "./tabs.js";
import { drawVersus, mountVersusTab } from "./versus-page.js";

/**
 * The tabs of the NOT BUILT YET sheet that are drawn on first sight rather
 * than on first open, and the wiring that makes that happen.
 *
 * Four of them now — SHAPES, GUIDES, VERSUS, RASTER — and each is expensive in
 * its own way: thirty-odd animated contours to fit, thirty-two posed worlds to
 * draw, two live renderers against one stepped world, a baked atlas to fetch
 * and decode. None of it is work a session that opened the sheet to read the
 * bestiary should pay for.
 *
 * They lived in `backlog-page.ts` until the fourth one pushed that file over
 * the 250-line ceiling. This is the seam CLAUDE.md's *split rather than grow*
 * asks for: everything here is about **which tabs cost something and when they
 * pay it**, which is a different subject from what the sheet contains.
 */
export function mountLazyTabs(): void {
  // Each has to be mounted before `bindTabs` runs, so a click on it is wired
  // exactly the way a click on BESTIARY or SPEC is.
  mountCardTab();
  mountVersusTab();
  mountRasterTab();
  bindTabs("#backlogTabs", "sheetpage", "sheet-");

  // The shape catalogue is the one built here rather than in its own module:
  // fitting its cards means scanning every contour over a minute of its own
  // wobble — a third of a second of arithmetic, which is nothing to wait for
  // when you asked for shapes and a visible stall when you asked for anything
  // else. The other three carry their own `drawn` flag.
  let shapesDrawn = false;
  const drawShapes = (): void => {
    if (shapesDrawn) return;
    shapesDrawn = true;
    renderShapes();
  };

  const lazy: Record<string, () => void> = {
    shapes: drawShapes,
    cards: drawCards,
    versus: drawVersus,
    raster: drawRaster,
  };
  for (const tab of document.querySelectorAll<HTMLElement>("#backlogTabs button")) {
    const draw = lazy[tab.dataset.tab ?? ""];
    if (draw) tab.addEventListener("click", draw);
  }
}
