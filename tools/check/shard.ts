#!/usr/bin/env bun

/**
 * `bun test`, in several processes at once — the test half of
 * `bun run check`, and what `test:profile` and `check:fast` run through.
 *
 * Two lanes took the suite from 292 s to 153 by cutting plays, and what was
 * left was honest: a real Chrome, every rehearsal drawn once, a long tail of
 * a second or three a file. Under two minutes with the same coverage is not
 * reachable that way, and it is reachable this way: 384 files run one after
 * another in one process on a machine with sixteen cores. Files are
 * independent by construction — each installs its own canvas globals, every
 * writer takes a `mkdtemp` of its own — so they are dealt into N `bun test`
 * processes and run together.
 *
 * **Ports.** Two files start a server: `opening.test.ts` builds and serves
 * the game, `room.test.ts` raises workerd. Neither takes the port a tree
 * derives (`tools/ports.ts`): the preview is started with `PREVIEW_PORT=0`
 * and Miniflare asks the OS as well — two `room.test.ts` side by side both
 * passed, on 10 September 2026, which is how that was settled. A test that
 * ever takes a *derived* port cannot share a tree with a second copy of
 * itself, and would need a shard of its own here; none does today.
 *
 * Each shard's output is held and printed whole when that shard finishes —
 * eight processes writing to one terminal interleave their lines, and a
 * failure split across two other shards' summaries is a failure nobody can
 * read. A shard is marked before its output, so a red line can be found. The
 * exit code is the worst of them.
 *
 *   bun run tools/check/shard.ts [filters...] [--shards N] [--junit file]
 *
 * Filters narrow the files the way they narrow `bun test`. `--junit` writes
 * the shards' JUnit reports merged into one, which is how `profile.ts` still
 * reads one run.
 */

import { readdirSync, statSync } from "node:fs";
import { cpus, tmpdir } from "node:os";
import { join, relative } from "node:path";
import { mergeJunit, partition, selected, tallyOf, type Weighed, weigh } from "./shards.js";

const ROOT = join(import.meta.dirname, "..", "..");

/** `.claude` because a worktree is a full copy of the repository inside it
 * (`tools/test/tree-walk.test.ts`); the rest because bun skips them too. */
const SKIP = new Set([".claude", ".git", "node_modules", "dist", "legacy"]);

/** Every test file bun would find, weighed, forward slashes. */
function testFiles(dir = ROOT, out: Weighed[] = []): Weighed[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) testFiles(full, out);
    else if (entry.name.endsWith(".test.ts")) {
      const file = relative(ROOT, full).replaceAll("\\", "/");
      out.push(weigh(file, statSync(full).size));
    }
  }
  return out;
}

/**
 * How many processes: the cores less two, so the terminal and whatever else
 * the owner has open keep breathing, and no more than eight — past that the
 * shards are waiting on each other's disk and the heaviest file, and the
 * machine is running Chrome and workerd beside them.
 */
export function defaultShards(cores = cpus().length): number {
  return Math.max(1, Math.min(8, cores - 2));
}

function flag(argv: string[], name: string): string | undefined {
  const at = argv.indexOf(name);
  if (at < 0) return undefined;
  const [value] = argv.splice(at, 2).slice(1);
  return value;
}

const argv = process.argv.slice(2);
const junit = flag(argv, "--junit");
const shards = Number(flag(argv, "--shards")) || defaultShards();
const filters = argv;

const files = testFiles().filter((f) => selected(f.file, filters));
const bins = partition(files, shards);
const stamp = `${process.pid}-${Date.now()}`;
const reportOf = (i: number): string => join(tmpdir(), `neon-spore-shard-${stamp}-${i}.xml`);

console.log(
  `bun test — ${files.length} files in ${bins.length} shard${bins.length === 1 ? "" : "s"}` +
    (filters.length > 0 ? ` (${filters.join(" ")})` : ""),
);

const started = performance.now();
const runs = bins.map(async (bin, i) => {
  const proc = Bun.spawn(
    ["bun", "test", ...bin, "--reporter=junit", `--reporter-outfile=${reportOf(i)}`],
    { cwd: ROOT, stdout: "pipe", stderr: "pipe", env: { ...process.env, FORCE_COLOR: "0" } },
  );
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  const xml = await Bun.file(reportOf(i))
    .text()
    .catch(() => "");
  const tally = tallyOf(xml);
  const mark = code === 0 ? "✓" : "✗";
  console.log(
    `\n${mark} shard ${i + 1}/${bins.length} — ${bin.length} files, ${tally.tests} tests, ${tally.failures} failed, ${seconds}s`,
  );
  const text = `${out}${err}`.trim();
  if (text) console.log(text);
  return { code, xml };
});
const results = await Promise.all(runs);

const wall = ((performance.now() - started) / 1000).toFixed(1);
const merged = mergeJunit(results.map((r) => r.xml));
const total = tallyOf(merged);
const failed = results.filter((r) => r.code !== 0).length;
console.log(
  `\n${total.tests - total.failures - total.skipped} pass, ${total.failures} fail, ${total.skipped} skipped — ` +
    `${files.length} files across ${bins.length} shards in ${wall}s wall, ${total.seconds.toFixed(1)}s of test` +
    (failed > 0 ? `; ${failed} shard${failed === 1 ? "" : "s"} red` : ""),
);
if (junit) await Bun.write(junit, merged);
for (let i = 0; i < bins.length; i++)
  await Bun.file(reportOf(i))
    .delete()
    .catch(() => {});

process.exit(results.some((r) => r.code !== 0) ? 1 : 0);
