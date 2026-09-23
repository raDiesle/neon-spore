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
 * writer takes a `mkdtemp` of its own — so they are dealt into bins and run
 * together.
 *
 * **Three numbers, not one.** How many bins there are is a memory figure and is
 * the cap's (`MAX_FILES_PER_SHARD`); how many of them this run starts at once
 * is the machine's throughput (`defaultShards`, or `--shards`); and how many
 * shards exist on the machine at once, over every worktree together, is
 * `tools/check/slots.ts`.
 *
 * The first two were one number until 15 September 2026, and that arrangement
 * gave a machine with *fewer* cores *more* files per process — so the four-core
 * web image dealt two shards of seventy-five, and the heavier of them was
 * killed by the memory cgroup every time. A bin is bounded now and the pool is
 * as wide as the cores, whatever the suite's size.
 *
 * The third was missing until 18 September 2026, and it is the one the owner's
 * machine found: both of the others are about *a* run, and eight lanes ran
 * eight checks, each correctly eight wide. Nothing was over its budget and the
 * machine was 26 GB into swap. A run's width is this file's; the machine's
 * width is not something a run can know, so it is kept where the runs can all
 * see it — a directory of claims under `tmpdir()`.
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
import { closingReport } from "./closing.js";
import { mergeJunit, tallyOf } from "./junit.js";
import {
  binCount,
  MAX_FILES_PER_SHARD,
  partition,
  pool,
  selected,
  type Weighed,
  weigh,
} from "./shards.js";
import { withSlot } from "./slots.js";

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
 * How many processes run **at once**: the cores less two, so the terminal and
 * whatever else the owner has open keep breathing, and no more than eight —
 * past that the shards are waiting on each other's disk and the heaviest file,
 * and the machine is running Chrome and workerd beside them.
 *
 * It no longer says how many bins there are, and that is the whole of the fix
 * of 15 September 2026: this figure is about a machine's throughput, and how
 * much one process may be given is about its memory. `binCount` holds the
 * second question.
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
// `shards` is this run's width: how many of its bins it starts at once. How
// big a bin may be is a memory figure and belongs to the cap in `shards.ts`,
// because a process that is given too many files is killed rather than slowed.
const bins = partition(files, binCount(files.length, shards), MAX_FILES_PER_SHARD);
const width = Math.min(shards, bins.length);
// The third number, and the only one that is not this run's: how many shards
// the *machine* may have out at once, over every worktree at once. `--shards`
// is still this run's ceiling; this is the ceiling they share. It stays
// `defaultShards()` whatever `--shards` says, because a lane asking for fewer
// is asking about itself and a lane asking for more is exactly the case the
// budget exists for.
const budget = defaultShards();
const stamp = `${process.pid}-${Date.now()}`;
const reportOf = (i: number): string => join(tmpdir(), `neon-spore-shard-${stamp}-${i}.xml`);

console.log(
  `bun test — ${files.length} files in ${bins.length} shard${bins.length === 1 ? "" : "s"}` +
    (width < bins.length ? `, ${width} at a time` : "") +
    // Said out loud, because a shard that is waiting on another worktree's
    // check looks exactly like a shard that is slow.
    `, ${budget} machine-wide` +
    (filters.length > 0 ? ` (${filters.join(" ")})` : ""),
);

const started = performance.now();
const results = await pool(bins.length, width, async (i) => {
  const bin = bins[i] ?? [];
  // **And the machine's own width, outside this run.** `pool` bounds the
  // shards of one check; `withSlot` bounds the shards of every check running
  // on this machine, which is the figure that was missing while eight lanes
  // each kept to a width of eight. A shard waits here for a slot before it
  // spawns anything, so what waits is cheap — a promise — and what is bounded
  // is the expensive thing.
  const { out, err, code, signalCode } = await withSlot(budget, async () => {
    const proc = Bun.spawn(
      ["bun", "test", ...bin, "--reporter=junit", `--reporter-outfile=${reportOf(i)}`],
      // `SHARD_WIDTH`: how many run beside it, which `tools/test/figure.ts`
      // cannot read off a load average that lags the burst.
      {
        cwd: ROOT,
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, FORCE_COLOR: "0", SHARD_WIDTH: String(width) },
      },
    );
    const [out, err, code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    return { out, err, code, signalCode: proc.signalCode };
  });
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  const xml = await Bun.file(reportOf(i))
    .text()
    .catch(() => "");
  const tally = tallyOf(xml);
  const mark = code === 0 ? "✓" : "✗";
  // **A shard that was killed says so.** It writes no report and no output, so
  // without this line a `SIGKILL` reads as `0 tests, 0 failed` in red — which
  // is what a whole afternoon was spent on before the cap above existed, and
  // `KILL` is the one word that would have named it in a second.
  const died = signalCode ? `, ${signalCode} at ${bin.length} files` : "";
  console.log(
    `\n${mark} shard ${i + 1}/${bins.length} — ${bin.length} files, ${tally.tests} tests, ${tally.failures} failed, ${seconds}s${died}`,
  );
  const text = `${out}${err}`.trim();
  if (text) console.log(text);
  return { code, xml, text };
});

const wall = ((performance.now() - started) / 1000).toFixed(1);
const merged = mergeJunit(results.map((r) => r.xml));
for (const line of closingReport(merged, results, files.length, wall)) console.log(line);
if (junit) await Bun.write(junit, merged);
for (let i = 0; i < bins.length; i++)
  await Bun.file(reportOf(i))
    .delete()
    .catch(() => {});

process.exit(results.some((r) => r.code !== 0) ? 1 : 0);
