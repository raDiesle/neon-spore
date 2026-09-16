import { describe, expect, it } from "bun:test";
import type { Page } from "playwright-core";
import { reachState } from "../shot-state.js";

/**
 * Reaching the state `bun run shot` is about to photograph, against a page
 * that records what was pressed instead of a browser.
 *
 * What is worth holding here is the *order and the count* of the presses, and
 * nothing else in this file needs a real page to say it. The count is where it
 * went wrong: `--tab` opens NOT BUILT YET for itself, so a caller who also
 * passed `--open "◇ NOT BUILT YET"` pressed that header button a second time
 * with the sheet already over it, and Playwright retried for thirty seconds
 * before failing with the name of a `<span>` in the header. A press that
 * cannot land is not visible in a picture — the run simply never takes one —
 * which is why it is worth a test rather than a comment.
 */

/** A page that presses nothing and remembers every name it was asked for. */
function recorder(): { page: Page; pressed: string[] } {
  const pressed: string[] = [];
  const page = {
    getByRole: (_role: string, options: { name: string }) => ({
      click: async (): Promise<void> => {
        pressed.push(options.name);
      },
    }),
    waitForTimeout: async (): Promise<void> => {},
    evaluate: async (): Promise<boolean> => true,
  };
  return { page: page as unknown as Page, pressed };
}

describe("reaching a tab of NOT BUILT YET", () => {
  it("opens the sheet itself when nothing else did", async () => {
    const { page, pressed } = recorder();
    await reachState(page, { tab: "MECHANICS" });
    expect(pressed).toEqual(["NOT BUILT YET", "MECHANICS"]);
  });

  it("does not press the header again when --open already named that sheet", async () => {
    const { page, pressed } = recorder();
    await reachState(page, { open: "◇ NOT BUILT YET", tab: "MECHANICS" });
    expect(pressed).toEqual(["◇ NOT BUILT YET", "MECHANICS"]);
  });

  it("still opens the sheet when --open named a different one", async () => {
    const { page, pressed } = recorder();
    await reachState(page, { open: "≡ RELEASE NOTES", tab: "GRAPHICS" });
    expect(pressed).toEqual(["≡ RELEASE NOTES", "NOT BUILT YET", "GRAPHICS"]);
  });

  it("presses the tab under its current name when the old one was asked for", async () => {
    const { page, pressed } = recorder();
    await reachState(page, { tab: "SHAPES" });
    expect(pressed).toEqual(["NOT BUILT YET", "GRAPHICS"]);
  });
});
