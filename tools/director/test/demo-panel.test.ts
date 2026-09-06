import { describe, expect, it } from "bun:test";
import { demonstrationWave, MECHANIC_IDS, WAVES } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { bindDemoPanel } from "../src/demo-panel.js";
import type { Store } from "../src/state.js";
import { FakeEl, installDom, makeBar } from "./fake-dom.js";

/**
 * DEMOS is a tab of DOCUMENTATION now, not a sheet of its own, to save a
 * topbar button — so its Escape/backdrop/CLOSE wiring went with the sheet and
 * what is left to hold is the tab itself: a list built lazily on the tab's
 * first click, and a row whose OPEN lands the demo's wave on the stage and
 * then dismisses the sheet that now owns it.
 *
 * This used to be three regexes over `demo-panel.ts`, because the runner
 * carries no DOM. `fake-dom.ts` is the DOM it carries now, and the difference
 * is the difference between checking that a line is still written and checking
 * that clicking the thing does what it says.
 */

function setup(): { body: FakeEl; tab: FakeEl; store: Store; opened: string[]; undo: () => void } {
  const body = new FakeEl();
  const bar = makeBar(["states", "demos"]);
  const tab = bar[1] as FakeEl;
  const dom = installDom({ bars: { "#statesTabs": bar }, ids: { demosBody: body } });
  const store: Store = { waves: WAVES.map((w) => ({ ...w })), index: 0, dirty: false };
  const opened: string[] = [];
  bindDemoPanel(
    store,
    { ...DEFAULT_CONFIG },
    () => opened.push("stage"),
    () => opened.push("closed"),
  );
  return { body, tab, store, opened, undo: dom.restore };
}

describe("the DEMOS tab", () => {
  it("builds nothing until the tab is clicked, then a row per mechanic", () => {
    const { body, tab, undo } = setup();
    try {
      expect(body.children).toHaveLength(0);
      tab.click();
      expect(body.children).toHaveLength(MECHANIC_IDS.length);
      const names = body.descendants().map((el) => el.textContent);
      for (const id of MECHANIC_IDS) expect(names).toContain(id);
    } finally {
      undo();
    }
  });

  it("lands the demo's wave on the stage, then closes DOCUMENTATION", () => {
    const { body, tab, store, opened, undo } = setup();
    try {
      tab.click();
      const first = MECHANIC_IDS[0] as (typeof MECHANIC_IDS)[number];
      const open = body
        .descendants()
        .find((el) => el.tagName === "BUTTON" && el.textContent.includes("OPEN"));
      open?.click();

      // The stage is asked to replay before the sheet is dismissed — the other
      // order leaves the reader looking at the wave they were already on.
      expect(opened).toEqual(["stage", "closed"]);
      expect(store.waves[store.index]?.name).toBe(demonstrationWave(first).name);
    } finally {
      undo();
    }
  });

  it("replaces the list on a second click rather than appending a second copy", () => {
    const { body, tab, undo } = setup();
    try {
      tab.click();
      tab.click();
      // `replaceChildren`, not `append` — the tab is clicked every time a
      // reader comes back to it, and a list that doubled would say the game
      // has twice as many mechanics as it has.
      expect(body.children).toHaveLength(MECHANIC_IDS.length);
    } finally {
      undo();
    }
  });
});
