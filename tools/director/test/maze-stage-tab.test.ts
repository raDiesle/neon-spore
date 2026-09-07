import { describe, expect, it } from "bun:test";
import { renderMazeEditor } from "../src/maze-editor.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * WHICH STAGE THE MAZE PANEL MARKS IS THE FIELD'S ANSWER, NOT THE PANEL'S.
 *
 * The tab used to be a module-scope `OPEN` in `maze-editor.ts`, set by the
 * click that also stood the field on that round. Two copies of one fact, and
 * they came apart on every rebuild the click did not make: a tuning slider put
 * the fight back on round 0 under a bar still reading STAGE 4.
 *
 * So the panel reads `StagePanel.round` now, and this is that read — render it
 * with the field held on the fourth sheet and the fourth button is the one
 * wearing `.on`. The click is the other direction and is checked here too: it
 * writes the round down before it asks for a redraw, so neither order is
 * load-bearing any more.
 */

/** The panel as it renders while the field is held on `round`. */
function render(round: number): FakeEl {
  const panel = new FakeEl();
  renderMazeEditor(
    panel as unknown as HTMLElement,
    () => {},
    () => {},
    () => round,
  );
  return panel;
}

/** The STAGE buttons, in the order the bar puts them. */
function tabs(panel: FakeEl): FakeEl[] {
  return panel.descendants().filter((e) => e.textContent.startsWith("STAGE "));
}

describe("THE MAZE's stage bar", () => {
  it("marks the stage the field is being held on", () => {
    const dom = installDom();
    try {
      for (const round of [0, 2, 4]) {
        const marked = tabs(render(round)).findIndex((t) => t.classList.contains("on"));
        expect(marked, `held on ${round}`).toBe(round);
      }
    } finally {
      dom.restore();
    }
  });

  it("draws one button per authored sheet", () => {
    const dom = installDom();
    try {
      expect(tabs(render(0)).length).toBeGreaterThan(1);
    } finally {
      dom.restore();
    }
  });

  it("writes the round down before it asks for a redraw", () => {
    const dom = installDom();
    try {
      // The order the old arrangement needed, reversed: the round is what both
      // halves are read off, so it goes first and the redraw follows it.
      const seen: string[] = [];
      const panel = new FakeEl();
      renderMazeEditor(
        panel as unknown as HTMLElement,
        () => seen.push("edit"),
        (r) => seen.push(`stage ${r}`),
        () => 0,
      );
      tabs(panel)[3]?.click();
      expect(seen).toEqual(["stage 3", "edit"]);
    } finally {
      dom.restore();
    }
  });
});
