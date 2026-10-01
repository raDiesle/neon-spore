#!/usr/bin/env bun

/**
 * What a session is told the moment its conversation has been compacted.
 *
 * The owner works one session at a time, tasks in sequence, and the
 * conversation is summarised automatically at about 200k tokens
 * (`autoCompactWindow` in `.claude/settings.json`). A compaction cannot be
 * timed to a task boundary, so it lands wherever it lands — and the summary it
 * leaves is a paraphrase of what the session *thought* it was doing, not the
 * state of the tree. This is the `SessionStart` hook with the `compact`
 * matcher: its stdout goes into the fresh context, and it says what the
 * repository itself knows — the branch and what is uncommitted, whether the
 * queue is busy and on what, what is parked — so the session re-orients from
 * files rather than from the summary. `docs/token-budget.md` has the argument.
 *
 * Short on purpose. Every line here is paid on every turn until the next
 * compaction, so it is a handful of lines and pointers, never a file's contents.
 * The pure half is `brief`, held by `test/after-compact.test.ts`.
 */

import { join } from "node:path";
import { parseItems } from "../queue/queue";
import { CHECKPOINT } from "./before-compact";
import { readPayload, sessionId } from "./payload";

/**
 * The titles of what is parked, through the queue's own parser — its preamble
 * carries a `## ` heading inside a fenced example, which a line scan reads as
 * an entry and the parser does not.
 */
export function parkedTitles(text: string): string[] {
  return parseItems(text, "parked").map((item) => item.title);
}

/**
 * The lines the session reads, from the three answers the tree gives, and the
 * checkpoint `before-compact.ts` wrote when there is one of this session's.
 */
export function brief(
  git: string,
  queue: string,
  parked: string[],
  checkpoint: string | null = null,
): string {
  const lines = [
    "The conversation was just compacted. The tree, not the summary, is the state:",
    `- git: ${git.trim() || "(no answer)"}`,
    `- queue: ${(queue.trim().split("\n")[0] ?? "(no answer)").replace(/:$/, "")}`,
  ];
  if (parked.length > 0) {
    lines.push(`- parked (${parked.length}): ${parked.map((t) => `"${t}"`).join(", ")}`);
  }
  if (checkpoint !== null) {
    lines.push(
      `- checkpoint: read ${checkpoint} before anything else — the owner's words, verbatim, from before the cut`,
    );
  }
  lines.push(
    "Rules are in CLAUDE.md. A task list given in a prompt is worked in order, each landed before the next;",
    "re-read docs/INDEX.md before opening files, and re-read the files you were editing before editing them again.",
  );
  return `${lines.join("\n")}\n`;
}

function run(cmd: string[]): string {
  try {
    const out = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
    return out.stdout.toString();
  } catch {
    return "";
  }
}

/**
 * Whether a checkpoint was written by this session. One written by another
 * session in the same worktree is another conversation's words, and pointing
 * at it would be worse than saying nothing.
 */
export function checkpointBelongs(text: string, session: string): boolean {
  return text.split("\n", 1)[0] === `session: ${session}`;
}

async function checkpointFor(session: string): Promise<string | null> {
  const gitDir = run(["git", "rev-parse", "--absolute-git-dir"]).trim();
  if (gitDir === "") return null;
  const path = join(gitDir, CHECKPOINT);
  try {
    return checkpointBelongs(await Bun.file(path).text(), session) ? path : null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const payload = await readPayload();
  // The matcher in settings.json already selects `compact`; this is for a
  // harness that hands the hook every start anyway.
  if (payload?.source !== undefined && payload.source !== "compact") return;

  const status = run(["git", "status", "-sb"]).split("\n");
  const branch = status[0] ?? "";
  const dirty = status.slice(1).filter((l) => l.trim() !== "").length;
  const git = dirty === 0 ? `${branch}, clean` : `${branch}, ${dirty} file(s) uncommitted`;

  const queue = run(["bun", "run", "--silent", "tools/queue/run.ts", "status"]);

  let parked: string[] = [];
  try {
    parked = parkedTitles(await Bun.file("docs/parked.md").text());
  } catch {
    parked = [];
  }

  process.stdout.write(brief(git, queue, parked, await checkpointFor(sessionId(payload))));
}

await main();
