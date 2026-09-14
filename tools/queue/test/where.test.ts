import { describe, expect, it } from "bun:test";
import { problemsIn } from "../problems.js";
import { parseItems } from "../queue.js";
import { fits, refuseUnlessFits, reservedTag, sessionKind } from "../where.js";

const ANYONES = `## Split the wave editor's cell panel

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const CLOUDS = `## Rename the two-devices menu

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`apps/game/src/menu.ts\`
- **Where:** cloud

The owner wants this done from his phone while his own machine is on something else.
`;

const LOCALS = CLOUDS.replace("- **Where:** cloud", "- **Where:** local");

describe("an entry reserved for one kind of session", () => {
  it("reads the Where: line, and is anywhere without one", () => {
    expect(parseItems(CLOUDS, "queue")[0]?.where).toBe("cloud");
    expect(parseItems(LOCALS, "queue")[0]?.where).toBe("local");
    expect(parseItems(ANYONES, "queue")[0]?.where).toBe("anywhere");
  });

  it("is otherwise an ordinary entry a cold session could act on", () => {
    expect(problemsIn(parseItems(CLOUDS, "queue"))).toEqual([]);
  });

  it("reports a Where: that names neither kind rather than offering the item to anybody", () => {
    const md = CLOUDS.replace("- **Where:** cloud", "- **Where:** phone");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain('"cloud" or "local"');
  });

  it("fits the kind it names and the kind-less entry fits both", () => {
    const cloud = parseItems(CLOUDS, "queue")[0]!;
    const local = parseItems(LOCALS, "queue")[0]!;
    const any = parseItems(ANYONES, "queue")[0]!;
    expect(fits(cloud, "cloud")).toBe(true);
    expect(fits(cloud, "local")).toBe(false);
    expect(fits(local, "local")).toBe(true);
    expect(fits(local, "cloud")).toBe(false);
    expect(fits(any, "cloud")).toBe(true);
    expect(fits(any, "local")).toBe(true);
  });

  it("is marked on the title line of the listing", () => {
    expect(reservedTag(parseItems(CLOUDS, "queue")[0]!)).toBe(" — CLOUD ONLY");
    expect(reservedTag(parseItems(ANYONES, "queue")[0]!)).toBe("");
  });

  it("is refused to the other kind, naming both kinds", () => {
    const cloud = parseItems(CLOUDS, "queue")[0]!;
    expect(() => refuseUnlessFits(cloud, "local")).toThrow(
      /reserved for a cloud session.*local one/,
    );
    expect(() => refuseUnlessFits(cloud, "cloud")).not.toThrow();
  });
});

describe("which kind of session this is", () => {
  it("is cloud on the web image and local everywhere else", () => {
    // The same signal `tools/hooks/session-start.ts` reads; a second one would
    // be a second thing to keep in step.
    expect(sessionKind({ CLAUDE_CODE_REMOTE: "true" })).toBe("cloud");
    expect(sessionKind({ CLAUDE_CODE_REMOTE: "false" })).toBe("local");
    expect(sessionKind({})).toBe("local");
  });
});
