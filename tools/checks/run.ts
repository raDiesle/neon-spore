#!/usr/bin/env bun

/**
 * `bun run checks` — what landed on main that nobody has looked at yet.
 *
 * The director's TO CHECK sheet is the same thing with buttons on it. This
 * exists because the first question on getting back to the machine that *can*
 * look is "what is waiting", and opening an editor to find out is a worse
 * answer than a line of terminal.
 *
 *   bun run checks           list it
 *   bun run checks --run     run every outstanding check that names a command
 *   bun run checks --clean   delete the branches that are spent
 *   bun run checks --brief   say nothing when there is nothing (for the hook)
 */

import { branchReady, branchReason, outstanding, runnable, staleStops } from "./checks.js";
import type { Decision } from "./ledger.js";
import {
  deleteBranch,
  readBranches,
  readChecks,
  readRestated,
  runCommand,
  trunk,
  writeDecision,
} from "./repo.js";
import { orphanedRestated } from "./restated.js";
import type { Check } from "./trailers.js";

/** How long a settled check is allowed to run before it counts as "not run". */
export const SETTLE_TIMEOUT_MS = 120_000;

/** What a single settled check decided. */
export interface Settled {
  status: "PASS" | "FAIL" | "not run";
  /** Command output, or the reason it never started / timed out. */
  detail: string;
}

/**
 * Run one command-naming check and record a `PASS` in the ledger when it goes
 * green. Shared by `bun run checks --run` (every outstanding runnable check)
 * and `bun run land` (only the ones a landing just added) — see
 * `docs/queue.md`, "A check a command can settle should never reach the
 * list".
 *
 * A red exit is `FAIL` and is left outstanding, same as before: what it asks
 * for is a fix, and writing it off here would take away the chance for the
 * same check to go green once the fix lands.
 *
 * Two things are folded into `"not run"` rather than `FAIL`, because neither
 * one is the code answering "no" — the command never got to answer at all.
 * The spawn itself can throw (the binary the check names is not on this
 * machine), and a command can hang (`bun run relay:check` wants a wrangler on
 * a port that may not exist here) — landing must survive that rather than
 * inherit it, so it races the command against `timeoutMs` and gives up loudly
 * instead of hanging.
 */
export async function settle(
  root: string,
  check: Pick<Check, "sha" | "text" | "command">,
  today: string,
  opts: {
    timeoutMs?: number;
    run?: (root: string, command: string) => Promise<{ ok: boolean; output: string }>;
    record?: (root: string, decision: Decision) => Promise<void>;
  } = {},
): Promise<Settled> {
  const command = check.command;
  if (!command) return { status: "not run", detail: "does not name a repository command" };
  const timeoutMs = opts.timeoutMs ?? SETTLE_TIMEOUT_MS;
  const run = opts.run ?? runCommand;
  const record = opts.record ?? writeDecision;

  let result: { ok: boolean; output: string };
  try {
    const timedOut = Symbol("timed out");
    // Cleared as soon as one side wins — an uncleared timer is otherwise a
    // pending event a fast, green command would sit behind for the rest of
    // `timeoutMs`, which for `bun run check` at the default is two minutes
    // the process has already finished waiting for.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const raced = await Promise.race([
      run(root, command),
      new Promise<typeof timedOut>((resolve) => {
        timer = setTimeout(() => resolve(timedOut), timeoutMs);
      }),
    ]);
    clearTimeout(timer);
    if (raced === timedOut) return { status: "not run", detail: `timed out after ${timeoutMs}ms` };
    result = raced;
  } catch (error) {
    return { status: "not run", detail: String(error instanceof Error ? error.message : error) };
  }

  if (!result.ok) return { status: "FAIL", detail: result.output };
  await record(root, { sha: check.sha, date: today, verdict: "PASS", text: check.text, note: "" });
  return { status: "PASS", detail: result.output };
}

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));

// Guarded so a test can import `settle` above without running the CLI —
// `run.ts` is a script, not a library, everywhere except this one export.
if (import.meta.main) await main();

async function main(): Promise<void> {
  const flags = new Set(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);

  const here = await trunk(root);
  const states = await readChecks(root);
  const left = outstanding(states);
  const branches = await readBranches(root, states);
  const spent = branches.filter(branchReady);
  // Whichever entries in `docs/checks/restated.md` matched nothing on `main`
  // right now — a stale sha, or a quote a trailer no longer says word for word.
  // `states` (not `left`) so a restatement written for an already-decided check
  // still counts as attached.
  const orphaned = orphanedRestated(await readRestated(root), states);

  if (flags.has("--brief") && left.length === 0 && spent.length === 0 && here.behind === 0) {
    process.exit(0);
  }

  const acting = flags.has("--run") || flags.has("--clean");
  stale(here, acting);
  if (staleStops(here.behind, acting)) process.exit(1);
  if (flags.has("--run")) await runAll(states, today);
  if (flags.has("--clean")) await cleanAll(spent);
  if (!acting) report(left, states, branches, spent, orphaned, here);
}

function report(
  left: ReturnType<typeof outstanding>,
  states: Awaited<ReturnType<typeof readChecks>>,
  branches: Awaited<ReturnType<typeof readBranches>>,
  spent: Awaited<ReturnType<typeof readBranches>>,
  orphaned: ReturnType<typeof orphanedRestated>,
  here: Awaited<ReturnType<typeof trunk>>,
): void {
  // Concepts never reach `left` at all — see `outstanding` in `checks.ts` —
  // so the count is already implementations only. Said plainly rather than
  // left to look like the list simply shrank on its own.
  console.log(
    left.length === 0
      ? "nothing to check on main."
      : `${left.length} implementation${left.length === 1 ? "" : "s"} to check on main:`,
  );

  let commit = "";
  for (const check of left) {
    if (check.full !== commit) {
      commit = check.full;
      console.log(`\n  ${check.sha}  ${check.date}  ${check.subject}`);
    }
    console.log(`    ▢ #${check.n}  ${check.text}`);
    // Read off the commit's own changed paths, not written here — silent
    // when the trailer already names a command, so it adds nothing to the
    // sixteen that already say where to stand.
    if (check.hint) console.log(`        → ${check.hint}`);
    // The hand-written half, beside the trailer — never replacing it, and
    // silent for the great majority of checks that have none.
    if (check.restated) {
      const r = check.restated;
      // The badge goes first and on its own, ahead of the subject it labels —
      // the owner asked for it by name, and a missing one prints as `?`
      // rather than defaulting to either word, so an entry written before
      // this field existed reads as a thing to notice, not a guess.
      console.log(`        [${r.badge ?? "?"}] restated — ${r.subject}`);
      console.log(`          changed  ${r.changed}`);
      console.log(`          decide   ${r.decide}`);
      // Only when a lane actually wrote them — most restatements have none,
      // and a blank pair here would be two lines of nothing on every check.
      if (r.before) console.log(`          before   ${r.before}`);
      if (r.after) console.log(`          after    ${r.after}`);
      console.log(`          where    ${r.where}`);
    }
  }

  const failed = states.filter((s) => s.verdict === "FAIL");
  if (failed.length > 0) {
    console.log(`\n  ${failed.length} looked at and found wrong — they need a commit, not a look:`);
    for (const check of failed) console.log(`    ✗ ${check.sha} ${check.text}`);
  }

  if (orphaned.length > 0) {
    console.log(
      `\n  ${orphaned.length} entr${orphaned.length === 1 ? "y" : "ies"} in docs/checks/restated.md ` +
        "match nothing on main — a stale sha, or a quote a trailer no longer says word for word:",
    );
    for (const entry of orphaned) console.log(`    ? ${entry.sha} ${entry.text}`);
  }

  if (branches.length > 0) {
    console.log(here.behind > 0 ? "\n  branches (read off a stale main):" : "\n  branches:");
  }
  for (const branch of branches) {
    const where = [branch.local ? "local" : "", branch.remote ? "origin" : ""].filter(Boolean);
    const mark = branchReady(branch) ? "✓" : "·";
    console.log(`    ${mark} ${branch.name}  —  ${branchReason(branch)}  (${where.join(", ")})`);
  }

  const commands = runnable(states).length;
  if (commands > 0) console.log(`\n  bun run checks --run    ${commands} of them name a command`);
  if (spent.length > 0) console.log(`  bun run checks --clean  ${spent.length} branch(es) can go`);
}

/**
 * A green command decides itself. A red one decides nothing: what it asks for
 * is a fix, and once the fix lands the same check can still go green — which
 * writing FAIL here would have taken away.
 */
/**
 * The one thing this must never do is say "nothing to check" about work it
 * cannot see. A `main` that has not been pulled does exactly that, and it
 * misreads the branches the same way — every landed branch as "still ahead
 * of main". So the warning is the whole story only while nothing acts on it.
 */
function stale(here: Awaited<ReturnType<typeof trunk>>, acting: boolean): void {
  if (here.behind === 0) return;
  const n = here.behind;
  console.log(`main is ${n} commit${n === 1 ? "" : "s"} behind origin — git pull first.`);
  if (acting)
    console.log("nothing was run or deleted: this would have decided it off a stale main.");
  console.log("");
}

async function runAll(
  states: Awaited<ReturnType<typeof readChecks>>,
  today: string,
): Promise<void> {
  const jobs = runnable(states);
  if (jobs.length === 0) {
    console.log("no outstanding check names a command.");
    return;
  }
  for (const check of jobs) {
    console.log(`\n$ ${check.command}   (${check.sha} — ${check.text})`);
    const outcome = await settle(root, check, today);
    if (outcome.status === "PASS") {
      console.log("  PASS — recorded in docs/verified.md");
    } else if (outcome.status === "FAIL") {
      console.log(outcome.detail.split("\n").slice(-25).join("\n"));
      console.log("  FAILED — left outstanding, because a fix is what it wants");
    } else {
      console.log(`  not run — ${outcome.detail}`);
    }
  }
}

async function cleanAll(spent: Awaited<ReturnType<typeof readBranches>>): Promise<void> {
  if (spent.length === 0) {
    console.log("no branch is spent yet.");
    return;
  }
  for (const branch of spent) {
    try {
      const gone = await deleteBranch(root, branch);
      console.log(`deleted ${gone.join(", ")}`);
    } catch (err) {
      console.log(`${branch.name}: ${String(err instanceof Error ? err.message : err)}`);
    }
  }
}
