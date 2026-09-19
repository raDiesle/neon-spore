#!/usr/bin/env bun

/**
 * A file's line ceiling used to be met by a red check, never before the edit.
 *
 * `packages/sim/test/limits.test.ts` fails a source file over 250 lines, which
 * is the right rule and the wrong moment: by the time the check runs, the
 * change is spread through the file and the seam has to be chosen from under a
 * diff that is about something else. 27 of the 296 lanes in `docs/time-log.md`
 * paid 375 minutes for that, the largest single named cause of friction in the
 * ledger — one lane lost 55 minutes to five files going over in turn, another
 * 35 to three. Deciding a seam is never the expensive part. Deciding it late
 * is.
 *
 * So the notice arrives with the edit. It **never blocks**: the test stays the
 * rule, and this only says the file is filling up while there is still a
 * choice about where to cut. It is one line, and it says the file, the count
 * and the ceiling — `file-size.ts` holds the numbers, so the mark moves when
 * the ceiling does and neither is written down twice.
 *
 * **It hears a Bash edit too, and that took a second wiring.** It was
 * registered under `Edit|Write|MultiEdit` and read `tool_input.file_path`, so
 * a lane told to write its files through a heredoc, a `sed -i` or a short
 * `python3` script — which is what an auto-mode lane is instructed to do —
 * never heard it at all, and met the ceiling at `check:fast` exactly as lanes
 * did before this existed. A `Bash` entry points at the same script and
 * `written-paths.ts` recovers the paths from the command line. A command it
 * cannot read is silence, not a guess.
 *
 * **It says it on every edit, not once per file per session.** The other
 * reminder in this directory (`after-depth-edit.ts`) keeps a marker and speaks
 * once, because what it has to say is a paragraph about a rule. This has to
 * say a number that changed since the last time it was said, and a hook nobody
 * sees twice is a hook nobody reads once.
 */

import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { counted, lineCount, notice } from "./file-size.ts";
import { dialectFor } from "./guard.ts";
import { editedPath, readPayload, shellCommand, toolName } from "./payload.ts";
import { writtenPaths } from "./written-paths.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * The edited path as the ceiling names it: relative to the root, forward
 * slashes, or null when it is not in this tree at all.
 *
 * Relative rather than matched in place, because `counted` asks whether a path
 * *starts* with `packages`, `apps` or `tools` — and an absolute path under a
 * checkout that happens to sit in a directory called `apps` would answer yes
 * to a substring test for no reason anybody could see.
 */
export function repoPath(root: string, path: string | null): string | null {
  if (path === null) return null;
  const rel = relative(root, path).replaceAll("\\", "/");
  return rel === "" || rel.startsWith("../") ? null : rel;
}

/**
 * Every path this payload touched, as the ceiling names them: the one an edit
 * tool declares, or the several a bash line can write in a single command.
 */
export function touched(root: string, payload: Parameters<typeof editedPath>[0]): string[] {
  const command = shellCommand(payload);
  const raw =
    command === null ? [editedPath(payload)] : writtenPaths(command, dialectFor(toolName(payload)));
  const rels = raw.map((path) => repoPath(root, path));
  return [...new Set(rels.filter((rel): rel is string => rel !== null && counted(rel)))];
}

/** The line this file earns, or null when it is short enough or is not there. */
async function said(root: string, rel: string): Promise<string | null> {
  const text = await Bun.file(join(root, rel))
    .text()
    .catch(() => null);
  return text === null ? null : notice(rel, lineCount(text));
}

async function main(): Promise<void> {
  const payload = await readPayload();
  const lines: string[] = [];
  for (const rel of touched(ROOT, payload)) {
    const line = await said(ROOT, rel);
    if (line !== null) lines.push(line);
  }
  if (lines.length === 0) process.exit(0);

  // Exit code 2 is the one that feeds the message back to Claude rather than
  // to a log nobody reads. The edit has already happened either way.
  process.stderr.write(`${lines.join("\n")}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
