#!/usr/bin/env bun

/**
 * Formatting is not a conversation. Biome rewrites the file that was just
 * edited; Claude never spends a turn on whitespace.
 *
 * Moved off bash for the reason `guard.ts` was: `settings.json` invoked it as
 * `bash .claude/hooks/format-edited.sh`, and a session whose shell has no
 * `bash` on PATH — which is every PowerShell one — silently got no formatting
 * at all. The failure is that nothing happens, which is the hardest kind to
 * notice.
 */

import { editedPath, readPayload } from "./payload.ts";

/**
 * What Biome is asked to format. Every extension here is now in `biome.json`'s
 * own `files.includes` as well, so nothing on the list is skipped quietly.
 * `--no-errors-on-unmatched` stays because a path can still fall outside the
 * config — anything under `node_modules`, `dist` or `legacy` — and a hook that
 * fails on an edit it was never meant to touch is worse than one that shrugs.
 */
export const FORMATTED = [".ts", ".tsx", ".js", ".jsx", ".json", ".css"] as const;

/** Whether an edit to this path is one Biome has anything to say about. */
export function formats(path: string | null): boolean {
  if (path === null) return false;
  const lower = path.toLowerCase();
  return FORMATTED.some((ext) => lower.endsWith(ext));
}

async function main(): Promise<void> {
  const path = editedPath(await readPayload());
  if (!formats(path)) process.exit(0);
  // Through `bun x` rather than a bare `bunx`, so the hook does not depend on
  // what is on the shell's PATH — the whole reason this file is not bash.
  //
  // Never blocking: the worst case is that the file stays as it was written.
  const proc = Bun.spawn(
    [
      process.execPath,
      "x",
      "biome",
      "check",
      "--write",
      "--no-errors-on-unmatched",
      path as string,
    ],
    {
      stdout: "ignore",
      stderr: "ignore",
    },
  );
  await proc.exited;
  process.exit(0);
}

if (import.meta.main) await main();
