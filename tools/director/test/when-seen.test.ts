import { describe, expect, test } from "bun:test";
import { whenSeen } from "../src/when-seen.js";
import { type FakeEl, installDom } from "./fake-dom.js";

/**
 * `whenSeen`'s one observer, across fake DOMs.
 *
 * The observer is a module-level singleton, and test files share modules
 * within a shard. On 17 October 2026 *a STATES room's own section*
 * (`states-page.test.ts`) failed under `bun run land` and passed alone: a
 * file earlier in its shard had installed and torn down its own fake DOM, the
 * watcher was still the observer built against that one, and the STATES
 * file's `intersect` told an observer nobody was watching with.
 */
/** A box, from whichever fake document is installed now. */
function div(): FakeEl {
  return (globalThis.document as unknown as { createElement(t: string): FakeEl }).createElement(
    "div",
  );
}

describe("a box watched to be seen", () => {
  test("is seen by the observer of the DOM it was watched in, not an earlier one", () => {
    const first = installDom();
    whenSeen(div() as unknown as Element, () => {});
    first.restore();

    const second = installDom();
    try {
      const el = div();
      let filled = 0;
      whenSeen(el as unknown as Element, () => filled++);
      expect(filled).toBe(0);
      second.intersect(el);
      expect(filled).toBe(1);
    } finally {
      second.restore();
    }
  });
});
