#!/usr/bin/env bun

/**
 * The test half of `bun run check:fast`: say what this lane changed, decide
 * which tests that can have reached (`fast-scope.ts`), and run those.
 *
 * The typecheck, the lint and the install preflight run before this, from
 * `package.json`, the same as in the full check — they are seconds each and
 * they are not what the four and a half minutes were.
 *
 * The decision is printed before the run, so a red result can be read against
 * what was and was not asked: a test in a directory this did not name is a
 * test the landing will run, not one that was skipped by mistake.
 */

import { join } from "node:path";
import { changedSince, fastScopeFor } from "./fast-scope.js";
import { reapOnSignal, track } from "./reap.js";

const ROOT = join(import.meta.dirname, "..", "..");
const TRUNK = "main";

// `--since <rev>` widens the diff to everything after that commit: a landing
// that replayed onto a trunk which moved during its check asks for the lane's
// diff and the trunk's new commits together (`tools/land/race-retry.ts`).
const at = process.argv.indexOf("--since");
const since = at >= 0 ? process.argv[at + 1] : undefined;
const changed = changedSince(since ?? TRUNK, ROOT);
const filters = fastScopeFor(changed);
console.log(
  changed.length === 0
    ? `check:fast — nothing differs from ${TRUNK}; the sweeps only`
    : `check:fast — ${changed.length} path${changed.length === 1 ? "" : "s"} differ from ${since?.slice(0, 7) ?? TRUNK}`,
);
console.log(`  testing  ${filters.join(" ")}`);
console.log(`  the full suite is \`bun run land\`'s to run, and its result is the one that counts`);

// Through `shard.ts`, the way the full check runs: the scope is a few dozen
// files on a wide diff, and they are as independent in a lane as on `main`.
// Killed, it takes the shard runner with it (`reap.ts`).
reapOnSignal();
const proc = track(
  Bun.spawn(["bun", "run", "tools/check/shard.ts", ...filters], {
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
  }),
);
process.exit(await proc.exited);
