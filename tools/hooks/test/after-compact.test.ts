import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { brief, parkedTitles } from "../after-compact";

/**
 * The hook that re-orients a session after a compaction. What is tested is the
 * text it writes, because that text is paid on every turn until the next
 * compaction: it has to carry the tree's state and nothing that the tree
 * already holds.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("after-compact", () => {
  it("reads the parked titles through the queue's parser, so the preamble's fenced example is not one", () => {
    const text = [
      "# Parked",
      "",
      "```",
      "## One line saying what is half-done",
      "```",
      "",
      "## One thing",
      "",
      "- **Found:** 2026-09-10, claude/x",
      "- **Files:** `a.ts`",
      "",
      "words",
      "",
    ].join("\n");
    expect(parkedTitles(text)).toEqual(["One thing"]);
    expect(parkedTitles("# Parked\n\nnothing here\n")).toEqual([]);
  });

  it("says the branch, the queue's one word and the parked titles, in a handful of lines", () => {
    const out = brief("## claude/x...origin/main, clean", "BUSY — 1 item\n   detail\n", [
      "Half a thing",
    ]);
    expect(out).toContain("claude/x");
    expect(out).toContain("BUSY — 1 item");
    expect(out).not.toContain("detail");
    expect(out).toContain('parked (1): "Half a thing"');
    expect(out.trim().split("\n").length).toBeLessThanOrEqual(6);
  });

  it("leaves the parked line out when nothing is parked", () => {
    expect(brief("main, clean", "DONE", [])).not.toContain("parked");
  });

  it("is wired as the compact-matched SessionStart hook", async () => {
    const settings = JSON.parse(await Bun.file(join(ROOT, ".claude", "settings.json")).text()) as {
      autoCompactWindow?: string;
      hooks?: { SessionStart?: { matcher?: string; hooks?: { command?: string }[] }[] };
    };
    const compact = (settings.hooks?.SessionStart ?? []).filter((e) => e.matcher === "compact");
    expect(compact.length).toBe(1);
    expect(compact[0]?.hooks?.[0]?.command).toBe("bun tools/hooks/after-compact.ts");
    // The window is what makes the hook matter: compaction at 200k, not at the
    // model's own ~967k. `docs/token-budget.md` says why.
    expect(settings.autoCompactWindow).toBe("200k");
  });
});
