import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CEILING, lastContextTokens, shouldDefer } from "../defer-compact";

/**
 * The hook that holds an automatic compaction back until the item lands. What
 * is tested is the decision, because a refusal with no way out is a session
 * that dies at the model's limit — which the scratch run on 29 September 2026
 * showed is exactly what the harness does when a hook refuses forever.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const turn = (input: number, read: number, written: number): string =>
  JSON.stringify({
    type: "assistant",
    message: {
      usage: {
        input_tokens: input,
        cache_read_input_tokens: read,
        cache_creation_input_tokens: written,
      },
    },
  });

const midItem = { trigger: "auto", contextTokens: 210_000, dirty: true, ahead: false };

describe("defer-compact", () => {
  it("reads the context off the latest assistant turn, past a cut first line and user lines", () => {
    const tail = [
      'ge": {"input_tokens": 9',
      turn(10, 100_000, 5_000),
      turn(3, 190_000, 20_000),
      JSON.stringify({ type: "user", message: { content: "next" } }),
      turn(0, 0, 0),
    ].join("\n");
    expect(lastContextTokens(tail)).toBe(210_003);
    expect(lastContextTokens("")).toBe(0);
  });

  it("holds an automatic compaction back while the lane is mid-item", () => {
    expect(shouldDefer(midItem)).toBe(true);
    expect(shouldDefer({ ...midItem, dirty: false, ahead: true })).toBe(true);
  });

  it("lets it through between items, on a manual /compact, and at the ceiling", () => {
    expect(shouldDefer({ ...midItem, dirty: false, ahead: false })).toBe(false);
    expect(shouldDefer({ ...midItem, trigger: "manual" })).toBe(false);
    expect(shouldDefer({ ...midItem, contextTokens: CEILING })).toBe(false);
  });

  it("lets it through when the transcript could not be read, rather than refusing blind", () => {
    expect(shouldDefer({ ...midItem, contextTokens: 0 })).toBe(false);
  });

  it("keeps the ceiling well under the model's own window and over the compaction window", async () => {
    const settings = JSON.parse(await Bun.file(join(ROOT, ".claude", "settings.json")).text()) as {
      autoCompactWindow?: number;
      hooks?: { PreCompact?: { matcher?: string; hooks?: { command?: string }[] }[] };
    };
    expect(CEILING).toBeGreaterThan(settings.autoCompactWindow ?? 0);
    expect(CEILING).toBeLessThan(500_000);
    const mine = (settings.hooks?.PreCompact ?? []).filter((e) =>
      e.hooks?.some((h) => h.command === "bun tools/hooks/defer-compact.ts"),
    );
    expect(mine.length).toBe(1);
    expect(mine[0]?.matcher).toBe("auto");
  });
});
