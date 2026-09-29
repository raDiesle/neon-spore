#!/usr/bin/env bun

/**
 * An automatic compaction waits for the item to land, up to a ceiling.
 *
 * `autoCompactWindow` (200k) cannot see a task boundary, so the cut falls
 * wherever the count crosses it — inside about half of all landed items. The
 * advice everywhere is to compact between tasks, never in one. This is a
 * `PreCompact` hook: an automatic compaction is blocked while the lane is
 * mid-item — the tree is dirty, or the branch holds commits `main` does not —
 * and the last turn's context is under `CEILING`. The harness asks again
 * before every turn, so the first turn after `bun run land` compacts, on the
 * boundary. A manual `/compact` is never refused.
 *
 * Proven on Claude Code 2.1.278, 29 September 2026, in a scratch session with a
 * 100k window and a hook that always blocked: the turn went on quietly, the hook
 * was asked again before each call, and the session died with "Prompt is too
 * long" at the model's own limit. The ceiling is what keeps the last from
 * happening here; `docs/token-budget.md` has the price.
 */

import { readPayload, transcriptPath } from "./payload";

/**
 * Past this, the compaction goes ahead mid-item after all. The model's own
 * window is ~967k, so this is far from the hard limit, and every turn above
 * 200k re-reads up to 60% more than it would have.
 */
export const CEILING = 320_000;

/** How much of the transcript's tail is read to find the last turn's usage. */
const TAIL_BYTES = 400_000;

/**
 * The context the latest assistant turn used, from its `usage`: what was sent
 * fresh, read from cache and written to cache. Zero when no turn says.
 */
export function lastContextTokens(tail: string): number {
  const lines = tail.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i] ?? "";
    if (!line.includes('"usage"')) continue;
    try {
      const entry = JSON.parse(line) as {
        type?: string;
        message?: { usage?: Record<string, unknown> };
      };
      const usage = entry.type === "assistant" ? entry.message?.usage : undefined;
      if (usage === undefined) continue;
      const n = (k: string): number => (typeof usage[k] === "number" ? (usage[k] as number) : 0);
      const total =
        n("input_tokens") + n("cache_read_input_tokens") + n("cache_creation_input_tokens");
      // The harness's own messages — "Prompt is too long", an API error —
      // carry a usage of zeros and say nothing about the context.
      if (total > 0) return total;
    } catch {
      // The first line of a tail is usually cut in half.
    }
  }
  return 0;
}

/** Whether to refuse this compaction, from what the payload and the tree say. */
export function shouldDefer(facts: {
  trigger: unknown;
  contextTokens: number;
  dirty: boolean;
  ahead: boolean;
}): boolean {
  if (facts.trigger !== "auto") return false;
  if (!facts.dirty && !facts.ahead) return false;
  // Zero is a transcript this could not read; better the ordinary compaction
  // than one refused on a number it never had.
  return facts.contextTokens > 0 && facts.contextTokens < CEILING;
}

function run(cmd: string[]): string {
  try {
    return Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" }).stdout.toString();
  } catch {
    return "";
  }
}

async function tail(path: string | null): Promise<string> {
  if (path === null) return "";
  try {
    const file = Bun.file(path);
    return await file.slice(Math.max(0, file.size - TAIL_BYTES)).text();
  } catch {
    return "";
  }
}

async function main(): Promise<void> {
  const payload = await readPayload();
  const contextTokens = lastContextTokens(await tail(transcriptPath(payload)));
  const dirty = run(["git", "status", "--porcelain"]).trim() !== "";
  const ahead = Number(run(["git", "rev-list", "--count", "main..HEAD"]).trim() || "0") > 0;
  if (!shouldDefer({ trigger: payload?.trigger, contextTokens, dirty, ahead })) return;
  const k = Math.round(contextTokens / 1000);
  process.stderr.write(
    `Compaction deferred until this item lands (${k}k of ${CEILING / 1000}k): tools/hooks/defer-compact.ts\n`,
  );
  process.exit(2);
}

if (import.meta.main) await main();
