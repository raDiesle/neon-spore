#!/usr/bin/env bun

/**
 * What a session is told the moment its conversation has been compacted.
 *
 * The owner works one session at a time, tasks in sequence, and the
 * conversation is summarised automatically at about 300k tokens
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

import { parseItems } from "../queue/queue";
import { readPayload } from "./payload";

/**
 * The titles of what is parked, through the queue's own parser — its preamble
 * carries a `## ` heading inside a fenced example, which a line scan reads as
 * an entry and the parser does not.
 */
export function parkedTitles(text: string): string[] {
  return parseItems(text, "parked").map((item) => item.title);
}

/** The lines the session reads, from the three answers the tree gives. */
export function brief(git: string, queue: string, parked: string[]): string {
  const lines = [
    "The conversation was just compacted. The tree, not the summary, is the state:",
    `- git: ${git.trim() || "(no answer)"}`,
    `- queue: ${(queue.trim().split("\n")[0] ?? "(no answer)").replace(/:$/, "")}`,
  ];
  if (parked.length > 0) {
    lines.push(`- parked (${parked.length}): ${parked.map((t) => `"${t}"`).join(", ")}`);
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

  process.stdout.write(brief(git, queue, parked));
}

await main();
