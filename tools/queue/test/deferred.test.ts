import { describe, expect, it } from "bun:test";
import { deferred } from "../deferred.js";
import { problemsIn } from "../problems.js";
import { type Item, parseItems } from "../queue.js";

/**
 * **An entry the owner put on hold is passed over by `next`** (`deferred.ts`).
 * `next` handed out THE VISE's sprite atlas experiment to a session told to
 * continue with the queue, and its own body said the owner had narrowed scope.
 */

const DEFERRED = `## DEFERRED — §28 THE VISE — sprite atlas experiment: the kernel crack

- **Found:** 2026-09-26, this session
- **Files:** \`packages/render/src/sprite-burst.ts\`
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope.

The kernel breaking open is a candidate for a painted burst.
`;

const PLAIN = `## Split the wave editor's cell panel

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs. Nothing here is deferred.
`;

const one = (md: string): Item => parseItems(md, "queue")[0]!;

describe("a deferred entry", () => {
  it("is read off its Deferred line", () => {
    expect(deferred(one(DEFERRED))).toBe(true);
  });

  it("is not read off a word in the body", () => {
    expect(deferred(one(PLAIN))).toBe(false);
  });

  it("is an ordinary entry otherwise — the hold is not a fault to fix", () => {
    expect(problemsIn([one(DEFERRED)])).toEqual([]);
  });
});
