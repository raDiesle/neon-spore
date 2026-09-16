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
 * **It says it on every edit, not once per file per session.** The other
 * reminder in this directory (`after-depth-edit.ts`) keeps a marker and speaks
 * once, because what it has to say is a paragraph about a rule. This has to
 * say a number that changed since the last time it was said, and a hook nobody
 * sees twice is a hook nobody reads once.
 */

import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { counted, lineCount, notice } from "./file-size.ts";
import { editedPath, readPayload } from "./payload.ts";

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

async function main(): Promise<void> {
  const path = editedPath(await readPayload());
  const rel = repoPath(ROOT, path);
  if (rel === null || !counted(rel)) process.exit(0);

  const text = await Bun.file(join(ROOT, rel))
    .text()
    .catch(() => null);
  if (text === null) process.exit(0);

  const said = notice(rel, lineCount(text));
  if (said === null) process.exit(0);

  // Exit code 2 is the one that feeds the message back to Claude rather than
  // to a log nobody reads. The edit has already happened either way.
  process.stderr.write(`${said}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
