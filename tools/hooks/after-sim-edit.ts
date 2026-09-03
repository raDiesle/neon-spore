#!/usr/bin/env bun

/**
 * Determinism is the one thing a reviewer cannot see by looking. So it is not
 * only prose in CLAUDE.md — it is a hook. Every edit inside `packages/sim` or
 * `packages/content` re-runs the sim suite, `purity.test.ts` included.
 *
 * Moved off bash with the rest: as `bash .claude/hooks/after-sim-edit.sh` it
 * did not run at all in a shell without `bash`, which meant the one check that
 * exists because nobody can eyeball it was the one quietly not happening.
 */

import { editedPath, readPayload } from "./payload.ts";

/** The two packages whose rules `packages/sim`'s suite is the proof of. */
export const GUARDED = ["packages/sim/", "packages/content/"] as const;

/** Whether an edit to this path has to re-prove determinism before the turn ends. */
export function guardsDeterminism(path: string | null): boolean {
  if (path === null) return false;
  return GUARDED.some((dir) => path.includes(dir));
}

async function main(): Promise<void> {
  const path = editedPath(await readPayload());
  if (!guardsDeterminism(path)) process.exit(0);

  const proc = Bun.spawn([process.execPath, "test", "packages/sim"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code === 0) process.exit(0);

  // Exit code 2 is the one that feeds the message back to Claude rather than
  // to a log nobody reads.
  const tail = `${out}${err}`.split("\n").slice(-30).join("\n");
  process.stderr.write(`Determinism check failed after editing ${path}:\n${tail}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
