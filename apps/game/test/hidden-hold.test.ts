import { describe, expect, test } from "bun:test";
import { bindHiddenHold } from "../src/hidden-hold.js";
import { createRunState } from "../src/run-state.js";

/**
 * The tab going away holds the world, and coming back lets go — bound on its
 * own, not as a side effect of the tuning panel (`hidden-hold.ts`). The page
 * is a stand-in with the two things the binding reads.
 */

class FakePage extends EventTarget {
  hidden: boolean;
  constructor(hidden: boolean) {
    super();
    this.hidden = hidden;
  }
  flip(hidden: boolean): void {
    this.hidden = hidden;
    this.dispatchEvent(new Event("visibilitychange"));
  }
}

const bound = (hidden: boolean) => {
  const run = createRunState();
  const page = new FakePage(hidden);
  bindHiddenHold(run, page as unknown as Document);
  return { run, page };
};

describe("the hidden hold", () => {
  test("a page that opens hidden is held from the start", () => {
    const { run } = bound(true);
    expect(run.held("hidden")).toBe(true);
    expect(run.running()).toBe(false);
  });

  test("a page that opens shown runs", () => {
    expect(bound(false).run.running()).toBe(true);
  });

  test("going away holds, coming back lets go", () => {
    const { run, page } = bound(false);
    page.flip(true);
    expect(run.running()).toBe(false);
    page.flip(false);
    expect(run.running()).toBe(true);
  });
});
