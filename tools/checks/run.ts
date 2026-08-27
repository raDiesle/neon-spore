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

import { branchReady, branchReason, outstanding, runnable } from "./checks.js";
import { deleteBranch, readBranches, readChecks, runCommand, writeDecision } from "./repo.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const flags = new Set(process.argv.slice(2));
const today = new Date().toISOString().slice(0, 10);

const states = await readChecks(root);
const left = outstanding(states);
const branches = await readBranches(root, states);
const spent = branches.filter(branchReady);

if (flags.has("--brief") && left.length === 0 && spent.length === 0) process.exit(0);

if (flags.has("--run")) await runAll();
if (flags.has("--clean")) await cleanAll();
if (!flags.has("--run") && !flags.has("--clean")) report();

function report(): void {
  console.log(left.length === 0 ? "nothing to check on main." : `${left.length} to check on main:`);

  let commit = "";
  for (const check of left) {
    if (check.full !== commit) {
      commit = check.full;
      console.log(`\n  ${check.sha}  ${check.date}  ${check.subject}`);
    }
    console.log(`    ▢ ${check.text}`);
  }

  const failed = states.filter((s) => s.verdict === "FAIL");
  if (failed.length > 0) {
    console.log(`\n  ${failed.length} looked at and found wrong — they need a commit, not a look:`);
    for (const check of failed) console.log(`    ✗ ${check.sha} ${check.text}`);
  }

  if (branches.length > 0) console.log("\n  branches:");
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
async function runAll(): Promise<void> {
  const jobs = runnable(states);
  if (jobs.length === 0) {
    console.log("no outstanding check names a command.");
    return;
  }
  for (const check of jobs) {
    console.log(`\n$ ${check.command}   (${check.sha} — ${check.text})`);
    const result = await runCommand(root, check.command ?? "");
    if (result.ok) {
      await writeDecision(root, {
        sha: check.sha,
        date: today,
        verdict: "PASS",
        text: check.text,
        note: "",
      });
      console.log("  PASS — recorded in docs/verified.md");
    } else {
      console.log(result.output.split("\n").slice(-25).join("\n"));
      console.log("  FAILED — left outstanding, because a fix is what it wants");
    }
  }
}

async function cleanAll(): Promise<void> {
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
