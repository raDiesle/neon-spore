import { describe, expect, it } from "bun:test";
import { problemsIn } from "../problems.js";
import { parseItems } from "../queue.js";
import { fits, refuseUnlessFits, reservedTag, sessionKind } from "../where.js";

const ANYONES = `## Split the wave editor's cell panel

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const LOCALS = `## Watch THE GRATE at tempo and say whether the sweep reads

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`packages/content/src/waves/act-4.ts\`
- **Where:** local

Nothing a sandbox runs answers this; it needs an eye on a frame at speed.
`;

describe("an entry kept for a session with a screen", () => {
  it("reads the Where: line, and is anywhere without one", () => {
    expect(parseItems(LOCALS, "queue")[0]?.where).toBe("local");
    expect(parseItems(ANYONES, "queue")[0]?.where).toBe("anywhere");
  });

  it("is otherwise an ordinary entry a cold session could act on", () => {
    expect(problemsIn(parseItems(LOCALS, "queue"))).toEqual([]);
  });

  it("reports a Where: that names no kind rather than offering the item to anybody", () => {
    const md = LOCALS.replace("- **Where:** local", "- **Where:** phone");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain('the only value is "local"');
  });

  it("reports `cloud` too, which was a reservation until 21 September 2026", () => {
    // The owner took that half of the field out — *all cloud only also local
    // can and should take* — so a line copied out of an older entry has to
    // come back as a problem rather than as a reservation nobody meant.
    const md = LOCALS.replace("- **Where:** local", "- **Where:** cloud");
    const items = parseItems(md, "queue");
    expect(items[0]?.where).toBe("anywhere");
    expect(problemsIn(items)[0] ?? "").toContain('the only value is "local"');
  });

  it("fits a local session, and the kind-less entry fits both", () => {
    const local = parseItems(LOCALS, "queue")[0]!;
    const any = parseItems(ANYONES, "queue")[0]!;
    expect(fits(local, "local")).toBe(true);
    expect(fits(local, "cloud")).toBe(false);
    expect(fits(any, "cloud")).toBe(true);
    expect(fits(any, "local")).toBe(true);
  });

  it("is marked on the title line of the listing", () => {
    expect(reservedTag(parseItems(LOCALS, "queue")[0]!)).toBe(" — LOCAL ONLY");
    expect(reservedTag(parseItems(ANYONES, "queue")[0]!)).toBe("");
  });

  it("is refused to a cloud session, naming both kinds", () => {
    const local = parseItems(LOCALS, "queue")[0]!;
    expect(() => refuseUnlessFits(local, "cloud")).toThrow(
      /reserved for a local session.*cloud one/,
    );
    expect(() => refuseUnlessFits(local, "local")).not.toThrow();
  });

  it("keeps nothing back from a local session, which is the whole of the change", () => {
    // Every entry in the file is now either `local` or anybody's, so a session
    // on the owner's own machine fits all of them.
    for (const md of [ANYONES, LOCALS]) {
      expect(fits(parseItems(md, "queue")[0]!, "local")).toBe(true);
    }
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
