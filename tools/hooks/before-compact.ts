#!/usr/bin/env bun

/**
 * What a session writes down the moment before its conversation is compacted.
 *
 * `after-compact.ts` restates what the tree knows — the branch, the queue, the
 * parked list — but the tree does not know what was only said in the chat, and
 * a compaction falls inside about half of all landed items (measured over 62
 * sessions on 29 September 2026). The summary paraphrases the owner's words for
 * the item, and a paraphrase is the thing a session then builds the wrong
 * version of. So this is the `PreCompact` hook: it copies the owner's own
 * messages out of the transcript **verbatim**, with the claimed queue entry and
 * the diff against `main`, into a file in the worktree's own git dir — never
 * committed, gone with the worktree — and `after-compact.ts` points at it.
 *
 * Deterministic on purpose: nothing here asks the model to remember to write
 * notes, which is the step that is skipped exactly when the context is fullest.
 * Kept to a couple of thousand tokens, because it is read back in full.
 * `docs/token-budget.md` has the argument.
 */

import { join } from "node:path";
import { parseItems } from "../queue/queue";
import { readPayload, sessionId, transcriptPath } from "./payload";

/** The file's name inside the git dir; `after-compact.ts` reads the same one. */
export const CHECKPOINT = "claude-checkpoint.md";

/** How much of each message is kept, and how many of the latest ones. */
const PER_MESSAGE = 1500;
const LATEST = 3;

/** What the owner typed, with the harness's own reminders taken out. */
function ownerText(content: unknown): string {
  const raw =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .filter((b) => typeof b === "object" && b !== null && b.type === "text")
            .map((b) => String(b.text ?? ""))
            .join("\n")
        : "";
  const text = raw.replaceAll(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
  // A slash command's echo, a task notification, a hook's output: all tags,
  // none of them the owner's words.
  return text.startsWith("<") ? "" : text;
}

function trimmed(text: string): string {
  return text.length <= PER_MESSAGE ? text : `${text.slice(0, PER_MESSAGE)} […]`;
}

/**
 * The owner's messages worth keeping, oldest first: the session's first one —
 * where a task list lives — and the latest few, without repeating one.
 */
export function ownerWords(transcript: string): string[] {
  const all: string[] = [];
  for (const line of transcript.split("\n")) {
    if (line.trim() === "") continue;
    let entry: Record<string, unknown>;
    try {
      entry = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (entry.type !== "user" || entry.isMeta === true || entry.isSidechain === true) continue;
    if (entry.toolUseResult !== undefined) continue;
    const message = entry.message as { content?: unknown } | undefined;
    const text = ownerText(message?.content);
    if (text !== "") all.push(trimmed(text));
  }
  if (all.length <= LATEST + 1) return all;
  return [all[0] ?? "", ...all.slice(-LATEST)];
}

/** The claimed entry's body when the branch holds one, else the taken titles. */
export function claimedItem(queue: string, branch: string): string {
  const items = parseItems(queue, "queue").filter((item) => item.taken !== "");
  const mine = items.find((item) => item.taken.endsWith(branch));
  if (mine) return `## ${mine.title}\n\n${trimmed(mine.body)}`;
  if (items.length === 0) return "(no queue entry is taken)";
  // `queue take` from a lane already open claims under another branch name,
  // so a session draining the queue shows up here rather than above.
  return ["Taken, one of them perhaps by this session:", ...items.map((i) => `- ${i.title}`)].join(
    "\n",
  );
}

/** The whole checkpoint, first line the session it belongs to. */
export function checkpointText(parts: {
  session: string;
  words: string[];
  item: string;
  diff: string;
  status: string;
}): string {
  const quote = (text: string): string =>
    text
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
  return [
    `session: ${parts.session}`,
    "",
    "# Written just before the compaction. The owner's words are verbatim; the summary is not.",
    "",
    "## The owner's words, oldest first",
    "",
    parts.words.length > 0 ? parts.words.map(quote).join("\n\n") : "(none found)",
    "",
    "## The queue item",
    "",
    parts.item,
    "",
    "## What this lane changed against main",
    "",
    "```",
    parts.diff.trim() || "(nothing)",
    "```",
    "",
    "## Uncommitted",
    "",
    "```",
    parts.status.trim() || "(clean)",
    "```",
    "",
  ].join("\n");
}

function run(cmd: string[]): string {
  try {
    return Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" }).stdout.toString();
  } catch {
    return "";
  }
}

async function text(path: string | null): Promise<string> {
  if (path === null) return "";
  try {
    return await Bun.file(path).text();
  } catch {
    return "";
  }
}

async function main(): Promise<void> {
  const payload = await readPayload();
  const gitDir = run(["git", "rev-parse", "--absolute-git-dir"]).trim();
  if (gitDir === "") return;
  const branch = run(["git", "branch", "--show-current"]).trim();
  const lines = (out: string, n: number): string => out.trimEnd().split("\n").slice(-n).join("\n");
  await Bun.write(
    join(gitDir, CHECKPOINT),
    checkpointText({
      session: sessionId(payload),
      words: ownerWords(await text(transcriptPath(payload))),
      item: claimedItem(await text("docs/queue.md"), branch),
      diff: lines(run(["git", "diff", "--stat", "main"]), 16),
      status: lines(run(["git", "status", "--short"]), 20),
    }),
  );
}

if (import.meta.main) await main();
