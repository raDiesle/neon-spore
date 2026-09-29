import { describe, expect, it } from "bun:test";
import { logLine } from "../../hooks/defer-compact";
import { CEILING_HIT, format, period } from "../report";
import { isOurProject, readSession } from "../transcript";

/**
 * The compaction trial's reading of a transcript. What is tested is the two
 * judgements the verdict rests on — whether a cut fell inside an item, and
 * whose sessions are counted at all — on a transcript written here.
 */

const T0 = Date.parse("2026-10-01T10:00:00Z");
const at = (minutes: number): string => new Date(T0 + minutes * 60_000).toISOString();

const call = (m: number, id: string, context: number, content: unknown[] = []): string =>
  JSON.stringify({
    type: "assistant",
    timestamp: at(m),
    message: { id, content, usage: { input_tokens: 0, cache_read_input_tokens: context } },
  });
const tool = (id: string, name: string, input: Record<string, unknown>) => ({
  type: "tool_use",
  id,
  name,
  input,
});
const result = (m: number, id: string, isError = false): string =>
  JSON.stringify({
    type: "user",
    timestamp: at(m),
    message: { content: [{ type: "tool_result", tool_use_id: id, is_error: isError }] },
  });
const cut = (m: number, pre: number): string =>
  JSON.stringify({
    type: "system",
    subtype: "compact_boundary",
    timestamp: at(m),
    compactMetadata: { trigger: "auto", preTokens: pre },
  });

const transcript = [
  call(0, "a", 60_000, [tool("e1", "Edit", { file_path: "a.ts" })]),
  cut(5, 170_000),
  call(10, "b", 90_000, [tool("l1", "Bash", { command: "bun run land --keep" })]),
  result(11, "l1"),
  cut(12, 125_000),
  call(13, "c", 70_000, [tool("r1", "Read", { file_path: "/g/claude-checkpoint.md" })]),
  call(14, "c", 70_000),
  call(20, "d", 330_000, [tool("l2", "Bash", { command: "cd /x && bun run land" })]),
  result(21, "l2", true),
  call(22, "e", 0, [{ type: "text", text: "Prompt is too long" }]),
].join("\n");

describe("the compaction trial", () => {
  const session = readSession(transcript);

  it("counts a landing only when the command succeeded", () => {
    expect(session.landings).toEqual([T0 + 11 * 60_000]);
  });

  it("calls a cut mid-item when an edit came after the last landing, and not after one", () => {
    expect(session.compactions.map((c) => c.midItem)).toEqual([true, false]);
  });

  it("counts each call once, skips the harness's zero-usage messages, and sees the failures", () => {
    expect(session.calls.map((c) => c.context)).toEqual([60_000, 90_000, 70_000, 330_000]);
    expect(session.tooLong.length).toBe(1);
    expect(session.checkpointReads.length).toBe(1);
  });

  it("reads this checkout's projects and its worktrees', never one that only mentions it", () => {
    const checkout = "/Users/a/Personal/neon-spore";
    expect(isOurProject("-Users-a-Personal-neon-spore", checkout)).toBe(true);
    expect(isOurProject("-Users-a-Personal-neon-spore--claude-worktrees-x-1a2b", checkout)).toBe(
      true,
    );
    expect(isOurProject("-private-tmp-scratch-neon-spore-probe", checkout)).toBe(false);
    expect(isOurProject("-Users-a-Personal-neon-spore2", checkout)).toBe(false);
  });

  it("adds a period up: items, cuts, reads, failures and the log's held-back turns", () => {
    const decisions = [
      { at: T0 + 60_000, contextTokens: 130_000, deferred: true, session: "s" },
      { at: T0 + 120_000, contextTokens: 125_000, deferred: false, session: "s" },
    ];
    const p = period([session], decisions, [{ at: T0, minutes: 9 }], T0, T0 + 3_600_000);
    expect(p.items).toBe(1);
    expect(p.compactions).toBe(2);
    expect(p.midItem).toBe(1);
    expect(p.checkpointReads).toBe(1);
    expect(p.tooLong).toBe(1);
    expect(p.deferredTurns).toBe(1);
    expect(p.measuredMinutes).toBe(9);
    expect(p.ceilingHits).toBe(0);
    expect(CEILING_HIT).toBeGreaterThan(200_000);
    const empty = period([], [], [], T0, T0 + 1);
    expect(format(p, empty)).toContain("| cut mid-item | 1 of 2 (50%) | 0 of 0 (—) |");
  });

  it("logs a decision as one line of JSON the report can read back", () => {
    const line = logLine({
      session: "s",
      contextTokens: 150_000,
      dirty: true,
      ahead: false,
      deferred: true,
    });
    expect(line.endsWith("\n")).toBe(true);
    const back = JSON.parse(line) as { at: string; deferred: boolean };
    expect(back.deferred).toBe(true);
    expect(Number.isFinite(Date.parse(back.at))).toBe(true);
  });
});
