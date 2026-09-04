/**
 * The spent-delegate-spec half of the sweep: the files under `.claude/tmp`
 * that outlived the lane that wrote them.
 *
 * Split out of `sweep.ts` when that file went past the line limit. It is the
 * one part of a sweep that touches neither a branch nor a worktree, so it was
 * also the part that could leave without anything else moving with it.
 */

import { readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { KEEP_DAYS } from "./idle.js";

/** One file's identity for the purposes of the spent-specs sweep. */
export interface FileStat {
  path: string;
  mtimeMs: number;
}

/**
 * Which of these files are old enough to sweep — idle, the same rule and the
 * same `KEEP_DAYS` window as a merged worktree, because a spent delegate spec
 * under `.claude/tmp` is the same shape of litter: worth nothing once it is
 * old, and never touched by anything that would reset its mtime.
 *
 * Pure so it can be tested against a handful of `{path, mtimeMs}` entries
 * rather than a real directory.
 */
export function dueForSweep(entries: readonly FileStat[], now: number, keepDays: number): string[] {
  const cutoffMs = now - keepDays * 86_400_000;
  return entries.filter((entry) => entry.mtimeMs < cutoffMs).map((entry) => entry.path);
}

/**
 * Regular files directly under `.claude/tmp` older than `KEEP_DAYS` — spent
 * delegate specs, the same idle-not-old rule as a merged worktree, since
 * nothing ever touches one again once the delegation that wrote it is done.
 * Prints one line, and only when it actually removed something.
 */
export async function sweepSpecs(root: string): Promise<void> {
  const dir = join(root, ".claude", "tmp");
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return;
  }

  const entries: FileStat[] = [];
  for (const name of names) {
    const full = join(dir, name);
    const info = await stat(full).catch(() => null);
    if (info?.isFile()) entries.push({ path: full, mtimeMs: info.mtimeMs });
  }

  const due = dueForSweep(entries, Date.now(), KEEP_DAYS);
  let swept = 0;
  for (const path of due) {
    try {
      await rm(path, { force: true });
      swept++;
    } catch {
      // Left in place; the next landing gets another try.
    }
  }
  if (swept > 0) console.log(`  swept    ${swept} spent specs from .claude/tmp`);
}
