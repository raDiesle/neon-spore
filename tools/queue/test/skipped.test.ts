import { describe, expect, it } from "bun:test";
import { parseItems } from "../queue.js";
import { handedOut, skipLines } from "../skipped.js";

const FREE = `## Split the wave editor's cell panel

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const ASKING = `## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** \`packages/content/src/controls.ts\`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
`;

const DEFERRED = `## DEFERRED — §28 THE VISE — sprite atlas experiment: the kernel crack

- **Found:** 2026-09-26, claude/some-lane
- **Files:** \`packages/render/src/sprite-burst.ts\`
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope.

The kernel breaking open is a candidate for a painted burst.
`;

const all = () => parseItems([FREE, ASKING].join("\n"), "queue");

describe("why `next` stepped past a free entry", () => {
  it("says nothing when every free entry is one a session could be handed", () => {
    const items = parseItems(FREE, "queue");
    expect(skipLines(items, items)).toEqual([]);
  });

  it("counts the reasons separately, because each is a different person's move", () => {
    const items = all();
    const lines = skipLines(items, items);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("1 of the free ones wait on your answer");
  });

  it("counts an answered ask as ordinary work again", () => {
    const md = ASKING.replace(
      "Why the short label",
      "- **Answered:** 2026-09-07 — widen the lobe.\n\nWhy the short label",
    );
    const items = parseItems(md, "queue");
    expect(skipLines(items, items)).toEqual([]);
  });
});

describe("what `next` with no argument hands out", () => {
  // The pick and the foot are one list: every entry the foot counts as passed
  // over is one the pick passes over, and the other way round.
  const items = parseItems([ASKING, DEFERRED, FREE].join("\n"), "queue");

  it("passes over an ask and a deferred entry, and takes the next", () => {
    expect(items.find((i) => handedOut(i, items))?.title).toBe(
      "Split the wave editor's cell panel",
    );
  });

  it("counts the deferred one in the foot, so the reader sees where it went", () => {
    expect(skipLines(items, items)).toContainEqual(
      expect.stringContaining("1 of the free ones the owner put on hold"),
    );
  });

  it("passes over nothing the foot does not count", () => {
    expect(items.filter((i) => !handedOut(i, items))).toHaveLength(skipLines(items, items).length);
  });
});
