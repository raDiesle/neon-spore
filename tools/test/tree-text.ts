import { isAbsolute, join } from "node:path";

/**
 * **The text of the tree's files, read once per process and many at a time.**
 *
 * Four guards read the whole tree: `tree-walk.test.ts`, `copies.test.ts`,
 * `doc-drift-names.test.ts` twice over (its sources, and every file a name
 * could be declared in). Until 30 September 2026 only the first read in
 * parallel; the others opened one file at a time, `readFileSync` or an
 * `await` inside a `for`. `tools/index/test/drift.test.ts`, which reads the
 * file under every row of `docs/INDEX.md`, came here later the same day, and
 * `doc-drift.test.ts`'s source-comment case after it. On a
 * quiet Mac that day, forty-seven hundred files took 580 ms one at a time
 * and 100 ms sixty-four at a time — an open is cheap
 * and waiting for each before asking for the next is not — and under a loaded
 * `check:fast` the serial walk drifted to eight and fourteen seconds against
 * figures of 450 and 850 ms (`docs/queue.md`). So they all read here.
 *
 * **Cached for the process**, keyed by absolute path: `bun test` runs every
 * file in one process, and the three guards read mostly the same files. Every
 * caller only reads the tree; a test that writes a file and reads it back must
 * not come here.
 *
 * **Sixty-four at a time rather than all of them**, because a `Promise.all`
 * over the whole list opens every descriptor at once, and the point is to stop
 * being the thing that falls over under load. Raising a cap was the other way
 * and is the second choice for the reason `FRAME_TIMEOUT_MS` in
 * `packages/render/test/frame-harness.ts` already gives: a cap raised to cover
 * contention hides whatever gets slow next.
 */

const ROOT = join(import.meta.dirname, "..", "..");

/** How many files are open at once. */
export const AT_ONCE = 64;

const TEXT = new Map<string, string>();

const absolute = (path: string): string => (isAbsolute(path) ? path : join(ROOT, path));

/** Every file's text, in the order asked for; a path is absolute or from the root. */
export async function treeText(paths: readonly string[]): Promise<string[]> {
  const keys = paths.map(absolute);
  const missing = [...new Set(keys.filter((key) => !TEXT.has(key)))];
  for (let i = 0; i < missing.length; i += AT_ONCE) {
    const chunk = missing.slice(i, i + AT_ONCE);
    const texts = await Promise.all(chunk.map((f) => Bun.file(f).text()));
    for (const [j, f] of chunk.entries()) TEXT.set(f, texts[j] as string);
  }
  return keys.map((key) => TEXT.get(key) as string);
}
