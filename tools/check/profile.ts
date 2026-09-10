#!/usr/bin/env bun

/**
 * `bun run test:profile [paths...] [--top N]` — which test files carry the
 * minutes.
 *
 * `bun test` prints one total for the whole run, and for a long time that was
 * the only figure anybody had: the suite took four and a half minutes and the
 * guess was the render frame tests, because there are dozens. The first
 * profile said otherwise — one file, `briefing.test.ts`, was ninety seconds
 * of it on its own, and `copies.test.ts` spent twenty on seventy thousand
 * cases that each re-read a file the case before had already read. A guess
 * about a suite is worth what a guess about a frame is worth, which is why
 * `bun run perf` exists; this is the same tool for the tests.
 *
 * It runs the suite once, through bun's JUnit reporter, and prints the
 * slowest files, the slowest cases and a sum per package. Paths narrow it the
 * way they narrow `bun test`. The XML is left in the temp directory and named,
 * for a session that wants to read a figure the report did not print.
 *
 * The run is `shard.ts`'s — several processes, the same ones `bun run check`
 * runs — with the shards' reports merged into one file, so the figures here
 * are the figures the check pays. A file's seconds are what it cost inside
 * its process; the total is the sum of those, the suite's *cost*, and the
 * wall clock the shards took is on `shard.ts`'s own last line above the
 * report. Running alongside seven other processes a file reads a fifth or so
 * slower than it would alone, which is the same for every file and changes
 * no share.
 *
 * `docs/performance.md` keeps the last full reading, so a file added later is
 * read against a number rather than against the feeling that the check got
 * slower.
 */

import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseJunit, report } from "./profile-report.js";

const ROOT = join(import.meta.dirname, "..", "..");

const argv = process.argv.slice(2);
const topAt = argv.indexOf("--top");
const top = topAt >= 0 ? Number(argv[topAt + 1]) || 20 : 20;
const filters = argv.filter((a, i) => a !== "--top" && !(topAt >= 0 && i === topAt + 1));

const outfile = join(tmpdir(), `neon-spore-test-profile-${process.pid}.xml`);
console.log(`test:profile — bun test ${filters.join(" ")}`.trimEnd());
console.log(`  report   ${outfile}`);

const proc = Bun.spawn(["bun", "run", "tools/check/shard.ts", ...filters, "--junit", outfile], {
  cwd: ROOT,
  stdout: "inherit",
  stderr: "inherit",
});
const code = await proc.exited;

const xml = await Bun.file(outfile)
  .text()
  .catch(() => "");
console.log("");
for (const line of report(parseJunit(xml), top)) console.log(line);
if (code !== 0) console.log(`\nbun test exited ${code}; the figures above are for a red run`);
process.exit(code);
