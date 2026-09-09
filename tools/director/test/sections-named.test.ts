import { describe, expect, test } from "bun:test";
import { sectionNamed } from "../src/sections.js";

/**
 * Where a spec section ends.
 *
 * `sectionNamed` used to break out on any line opening with two hashes, which
 * is every `###` sub-heading as well as the next `##`. Every caller it had
 * read a section of prose, tables and lists, so nothing was wrong until
 * `## 10.5 In plain words` arrived, whose entries are all `###`: it came back
 * as the two or three lines before the first one, silently. `plain-words.ts`
 * worked around it with a private copy of this function, and a second copy of
 * where a section ends is a rule that drifts.
 */

const DOC = `# A spec

## 3 The first thing — built

Some prose about it.

| a | b |
| - | - |
| 1 | 2 |

## 4 In plain words

### The Bulb Queen

- **What it does:** it opens.

### The Warden

- **What it does:** it does not.

## 5 The last thing — not built

Nothing here belongs to the section above.
`;

describe("sectionNamed", () => {
  test("carries every sub-heading inside a section", () => {
    const lines = sectionNamed(DOC, "In plain words");
    expect(lines).toContain("### The Bulb Queen");
    expect(lines).toContain("### The Warden");
    expect(lines).toContain("- **What it does:** it does not.");
  });

  test("still stops at the next `##`", () => {
    const lines = sectionNamed(DOC, "In plain words").join("\n");
    expect(lines).not.toContain("The last thing");
    expect(lines).not.toContain("Nothing here belongs");
  });

  test("a section of plain prose is unchanged by the wider boundary", () => {
    const lines = sectionNamed(DOC, "The first thing");
    expect(lines.join("\n")).toContain("Some prose about it.");
    expect(lines.join("\n")).toContain("| 1 | 2 |");
    expect(lines.join("\n")).not.toContain("In plain words");
  });

  test("a needle that names nothing is an empty section, not the whole file", () => {
    expect(sectionNamed(DOC, "no such heading")).toEqual([]);
  });
});
