#!/usr/bin/env bun

/**
 * `bun run compaction` — is the compaction trial of 29 September 2026 working?
 *
 *   bun run compaction                  ten days before the cutover against everything since
 *   bun run compaction --days 3         the same, the last three days only on the after side
 *
 * Reads this checkout's Claude Code transcripts, and its worktrees', and no
 * other project's (`isOurProject`); the decisions `defer-compact.ts` logged in
 * the common git dir; and the stamps `land` measured from a queue claim in
 * `docs/time-log.md`. Prints one table, before against after, with what each
 * row is expected to do.
 */

import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { LOG } from "../hooks/defer-compact";
import { parseLedger } from "../ledger/parse.js";
import { CUTOVER, type Decision, format, period } from "./report";
import { isOurProject, readSession, type Session } from "./transcript";

const ROOT = join(import.meta.dirname, "..", "..");
const DAY = 86_400_000;

function flag(name: string): string | undefined {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : undefined;
}

function git(args: string[]): string {
  return Bun.spawnSync(["git", ...args], { cwd: ROOT, stdout: "pipe" })
    .stdout.toString()
    .trim();
}

async function text(path: string): Promise<string> {
  try {
    return await Bun.file(path).text();
  } catch {
    return "";
  }
}

const common = git(["rev-parse", "--path-format=absolute", "--git-common-dir"]);
const checkout = dirname(common);
const projects = join(homedir(), ".claude", "projects");

const sessions: Session[] = [];
let dirs = 0;
for (const dir of readdirSync(projects)) {
  if (!isOurProject(dir, checkout)) continue;
  dirs++;
  for (const file of readdirSync(join(projects, dir))) {
    if (file.endsWith(".jsonl")) sessions.push(readSession(await text(join(projects, dir, file))));
  }
}

const decisions: (Decision & { session: string })[] = [];
for (const line of (await text(join(common, LOG))).split("\n")) {
  try {
    const d = JSON.parse(line) as {
      at: string;
      contextTokens: number;
      deferred: boolean;
      session: string;
    };
    decisions.push({ ...d, at: Date.parse(d.at) });
  } catch {
    // A torn last line, or an empty log before the first decision.
  }
}

const stamps = parseLedger(await text(join(ROOT, "docs", "time-log.md")))
  .filter((e) => e.stamp?.from === "claim")
  .map((e) => ({ at: Date.parse(`${e.date}T00:00:00Z`), minutes: e.stamp?.minutes ?? 0 }));

const now = Date.now();
const days = Number(flag("--days") ?? "0");
const afterFrom = days > 0 ? Math.max(CUTOVER, now - days * DAY) : CUTOVER;
const before = period(sessions, decisions, stamps, CUTOVER - 10 * DAY, CUTOVER);
const after = period(sessions, decisions, stamps, afterFrom, now + DAY);

console.log(
  `Compaction trial — ${sessions.length} transcripts in ${dirs} project dirs of ${checkout}, ` +
    `${decisions.length} logged decisions.`,
);
console.log(
  `before: the ten days to ${new Date(CUTOVER).toISOString().slice(0, 16)}Z; ` +
    `after: from ${new Date(afterFrom).toISOString().slice(0, 16)}Z.\n`,
);
console.log(format(before, after));
