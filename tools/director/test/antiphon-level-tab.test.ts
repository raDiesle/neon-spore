import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { antiphonLevelSeats, renderAntiphonEditor } from "../src/antiphon-editor.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * **THE ANTIPHON's level stepper** (`antiphon-editor.ts`): a tab a level and
 * one for the ship, the one marked read off the field (`StagePanel.round`),
 * a click that stands the field on its level before it asks for a redraw,
 * and the seats swapping a level on — THE MAZE's bar's three questions
 * (`maze-stage-tab.test.ts`) and the one only this boss has.
 */

function render(round: number, seen: string[] = []): FakeEl {
  const panel = new FakeEl();
  renderAntiphonEditor(
    panel as unknown as HTMLElement,
    () => seen.push("edit"),
    (r) => seen.push(`stage ${r}`),
    () => round,
  );
  return panel;
}

function tabs(panel: FakeEl): FakeEl[] {
  return panel.descendants().filter((e) => /^(LEVEL \d+|SHIP)$/.test(e.textContent));
}

describe("THE ANTIPHON's level stepper", () => {
  it("draws a tab for every level and one for the ship", () => {
    const dom = installDom();
    try {
      const words = tabs(render(0)).map((t) => t.textContent);
      expect(words.length).toBe(DEFAULT_CONFIG.antiphonPits + 1);
      expect(words[0]).toBe("LEVEL 1");
      expect(words.at(-1)).toBe("SHIP");
    } finally {
      dom.restore();
    }
  });

  it("marks the level the field is being held on", () => {
    const dom = installDom();
    try {
      for (const round of [0, 3, DEFAULT_CONFIG.antiphonPits]) {
        const marked = tabs(render(round)).findIndex((t) => t.classList.contains("on"));
        expect(marked, `held on ${round}`).toBe(round);
      }
    } finally {
      dom.restore();
    }
  });

  it("stands the field on the level before it asks for a redraw", () => {
    const dom = installDom();
    try {
      const seen: string[] = [];
      tabs(render(0, seen))[4]?.click();
      expect(seen).toEqual(["stage 4", "edit"]);
    } finally {
      dom.restore();
    }
  });

  it("says who explains and who chooses, swapping a level on", () => {
    expect(antiphonLevelSeats(0)).toBe("P1 explains · P2 chooses");
    expect(antiphonLevelSeats(1)).toBe("P2 explains · P1 chooses");
    expect(antiphonLevelSeats(2)).toBe("P1 explains · P2 chooses");
  });
});
