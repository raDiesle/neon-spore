import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkpointText, claimedItem, ownerWords } from "../before-compact";

/**
 * The hook that writes the owner's words down before a compaction. What is
 * tested is which lines of a transcript count as the owner's, because the whole
 * point is that they come back verbatim and nothing else comes back with them.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const user = (content: unknown, extra: Record<string, unknown> = {}): string =>
  JSON.stringify({ type: "user", message: { role: "user", content }, ...extra });

describe("before-compact", () => {
  it("keeps what the owner typed and drops the harness's reminders, tool results and tags", () => {
    const transcript = [
      user([
        { type: "text", text: "<system-reminder>\nYou are in a worktree.\n</system-reminder>" },
        { type: "text", text: "make THE SEAM's rock say FIRE" },
      ]),
      JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "ok" }] } }),
      user([{ type: "tool_result", tool_use_id: "t1", content: "3246 pass" }], {
        toolUseResult: { stdout: "3246 pass" },
      }),
      user("<command-name>/compact</command-name>"),
      user("the reminder text", { isMeta: true }),
      "not json",
      user("and SHIELD under the grit"),
    ].join("\n");
    expect(ownerWords(transcript)).toEqual([
      "make THE SEAM's rock say FIRE",
      "and SHIELD under the grit",
    ]);
  });

  it("keeps the first message, where a task list lives, and the latest three", () => {
    const transcript = ["one", "two", "three", "four", "five", "six"]
      .map((t) => user(t))
      .join("\n");
    expect(ownerWords(transcript)).toEqual(["one", "four", "five", "six"]);
  });

  it("cuts a long message rather than carrying it whole", () => {
    const [kept] = ownerWords(user("x".repeat(5000)));
    expect(kept?.length).toBeLessThan(1600);
    expect(kept?.endsWith("[…]")).toBe(true);
  });

  it("finds the entry this branch claimed, and names the taken ones when none is", () => {
    const queue = [
      "# Queue",
      "",
      "## Fix the grate",
      "",
      "- **Found:** 2026-09-29, claude/a",
      "- **Taken:** 2026-09-29, claude/queue-fix-the-grate",
      "- **Files:** `a.ts`",
      "",
      "What to do.",
      "",
      "## Nobody's yet",
      "",
      "- **Found:** 2026-09-29, claude/b",
      "- **Files:** `b.ts`",
      "",
      "Words.",
      "",
    ].join("\n");
    const mine = claimedItem(queue, "claude/queue-fix-the-grate");
    expect(mine).toContain("## Fix the grate");
    expect(mine).toContain("What to do.");
    const other = claimedItem(queue, "claude/some-lane");
    expect(other).toContain("- Fix the grate");
    expect(other).not.toContain("Nobody's yet");
    expect(claimedItem("# Queue\n", "claude/x")).toBe("(no queue entry is taken)");
  });

  it("opens with the session it belongs to and quotes the words", () => {
    const text = checkpointText({
      session: "abc-123",
      words: ["line one\nline two"],
      item: "(no queue entry is taken)",
      diff: " a.ts | 2 +-\n",
      status: "",
    });
    expect(text.split("\n", 1)[0]).toBe("session: abc-123");
    expect(text).toContain("> line one\n> line two");
    expect(text).toContain("(clean)");
  });

  it("is wired as the PreCompact hook, for both triggers", async () => {
    const settings = JSON.parse(await Bun.file(join(ROOT, ".claude", "settings.json")).text()) as {
      hooks?: { PreCompact?: { matcher?: string; hooks?: { command?: string }[] }[] };
    };
    const entries = settings.hooks?.PreCompact ?? [];
    const mine = entries.filter((e) =>
      e.hooks?.some((h) => h.command === "bun tools/hooks/before-compact.ts"),
    );
    expect(mine.length).toBe(1);
    expect(mine[0]?.matcher ?? "").toBe("");
  });
});
