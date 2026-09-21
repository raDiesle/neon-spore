/**
 * A slot and its answers, read off the directory names and nothing else.
 *
 * This is the half of the candidates tree that opens no file. `registry.ts`
 * next door reads every `index.ts`, because a registry has to name the symbol
 * inside it; closing a slot must not, and `candidatesIn` below says why in its
 * own words. The two were one file until the message `discover` throws grew
 * the paragraph it needed (21 September 2026) — the seam was already written
 * down in the prose, so it was the one to cut along.
 *
 * `dirsIn` is here rather than there because every walk of this tree is a walk
 * of directory names, and there is exactly one rule about which of them count.
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * A dot-directory is never a candidate, and `.claude` in particular holds a
 * lane's own checkout of the whole repository — a walk that descended into one
 * would find every candidate twice. `tools/test/tree-walk.test.ts` holds every
 * walk in the repository to skipping it, and it is right to be blunt about it:
 * the scope this one is called with makes the case impossible today, and the
 * next caller is what the rule is for.
 */
const SKIP = new Set([".claude", "node_modules", "dist"]);

/** Every directory name in `path` that could be part of a candidate's address. */
export function dirsIn(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

/** `creature:torch` -> `creature-torch`, the directory a slot's answers share. */
export function slotDir(slot: string): string {
  return slot.replace(":", "-");
}

/**
 * `creature-torch` -> `creature:torch`, the way back. A slot name carries one
 * colon and its directory carries a dash in that one place, so the *first* dash
 * is the one that was a colon and the rest belong to the name:
 * `panel-ship-join` is `panel:ship-join`.
 */
export function slotOfDir(dir: string): string {
  return dir.replace("-", ":");
}

/** One candidate, as its directory names it — all a slot being closed needs. */
export interface OnDisk {
  /** This answer, one word, which is its directory's name. */
  readonly name: string;
  /** Repo-relative, the way `Variant.dir` spells it. */
  readonly dir: string;
}

/**
 * One slot's candidates, read off the directory names and nothing else.
 *
 * `discover` opens every `index.ts`, because a registry has to name the symbol
 * inside it. This opens nothing, and that is the whole of its job. `drop`
 * closes a slot after the by-hand sequence `adopt` prints when it refuses a
 * function — move the paint into the package, rewrite the record, delete what
 * nothing reads — and that sequence leaves the slot's modules unimportable:
 * the moved file is gone from the candidate that had it, and the shipped
 * module it came from has lost exports the *other* candidates were composing.
 * A `drop` that had to import them could not run at the one moment it is
 * prescribed for (`lost:screen` / `shut`, 17 September 2026).
 *
 * A slot with no directory and a directory with nothing in it are the same
 * answer — no candidates — and the caller says so in its own words.
 */
export function candidatesIn(candidatesDir: string, slot: string): OnDisk[] {
  const dir = slotDir(slot);
  let names: string[];
  try {
    names = dirsIn(join(candidatesDir, dir));
  } catch {
    return [];
  }
  return names.map((name) => ({ name, dir: `tools/versus/candidates/${dir}/${name}` }));
}

/** Every slot with a directory under `candidates/`, named the way it is asked for. */
export function slotsOnDisk(candidatesDir: string): string[] {
  return dirsIn(candidatesDir).map(slotOfDir);
}
