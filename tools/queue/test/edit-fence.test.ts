import { describe, expect, it } from "bun:test";
import { hasEntry, markTaken, removeItem } from "../edit.js";

/**
 * On 21 September 2026 five entries had been written inside the preamble's
 * fenced example, and nothing noticed for weeks. The reader learned to skip a
 * fence then; these hold the editor to the same reading, so an entry whose
 * body quotes a heading in a fence is one section and not two.
 */
const QUOTING = `# Queue

## An entry that quotes the format

- **Found:** 2026-09-21, claude/x
- **Files:** \`tools/queue/queue.ts\`

Written like this:

\`\`\`
## Example heading
\`\`\`

and the rest of the body.

## The next entry

- **Found:** 2026-09-22, claude/y
- **Files:** \`tools/queue/edit.ts\`
`;

describe("a heading inside a fence, when an entry is edited", () => {
  it("does not end the entry that quotes it", () => {
    const out = removeItem(QUOTING, "An entry that quotes the format");
    expect(out).not.toContain("the rest of the body");
    expect(out).not.toContain("Example heading");
    expect(out).toContain("## The next entry");
  });

  it("is not an entry of its own", () => {
    expect(hasEntry(QUOTING, "Example heading")).toBe(false);
    expect(() => removeItem(QUOTING, "Example heading")).toThrow(/no entry/);
  });

  it("does not stop a claim finding the entry after it", () => {
    expect(markTaken(QUOTING, "The next entry", "claude/z")).toContain(
      "- **Found:** 2026-09-22, claude/y\n- **Taken:** claude/z",
    );
  });
});
