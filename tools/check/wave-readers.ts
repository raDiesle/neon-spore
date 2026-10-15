import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * **The tests a wave list reaches outside `packages/content`**, for
 * `fast-scope.ts`.
 *
 * A change to `packages/content` runs that package's own tests and nothing
 * else under `check:fast`, and for most of it that is right. The wave list is
 * the exception: on 14 October 2026 the director's save that moved THE INSTAR
 * to wave 5 and THE BASTION to 16 touched only `waves/act-*.ts`, `check:fast`
 * went green, and `bun run land` went red three times — the perf baseline's
 * numbers, the standing words naming THE WARD's act page, and the band
 * override in `frame.test.ts` that picks SALVAGE by index. Each of them reads
 * the list or an act page from a package of its own.
 *
 * So a wave file reaches every test that names `WAVES` or an act page, found
 * by reading the tests when the check runs rather than kept in a list: a
 * list is one more thing for a new test to be left out of. Ninety-seven of
 * them on the day, and half a minute through `shard.ts`.
 */

/** A path that is the wave list or one of its act pages. */
export function isWaveFile(path: string): boolean {
  return path === "packages/content/src/waves.ts" || path.startsWith("packages/content/src/waves/");
}

/** What a test that reads the wave list says: the list, or an act page by its file. */
const READS = /\bWAVES\b|waves\/act-/;

/** The scan, once a root: it reads every test file in the tree, and one
 * process asks for it as often as its paths name a wave. */
const scanned = new Map<string, string[]>();

/** Every test outside `packages/content` that reads the wave list, from the repository's root. */
export function waveReaders(root: string): string[] {
  const known = scanned.get(root);
  if (known) return known;
  const found: string[] = [];
  for (const top of ["apps", "packages", "tools"]) {
    for (const path of new Bun.Glob(`${top}/*/test/**/*.test.ts`).scanSync({ cwd: root })) {
      const file = path.replaceAll("\\", "/");
      if (file.startsWith("packages/content/")) continue;
      if (READS.test(readFileSync(join(root, file), "utf8"))) found.push(file);
    }
  }
  found.sort();
  scanned.set(root, found);
  return found;
}
