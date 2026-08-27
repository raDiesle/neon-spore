#!/usr/bin/env bun

/**
 * `bun run land` — put this lane on the trunk, linearly, or say why not.
 *
 * Run it from inside the lane's own worktree. It replays the lane onto the
 * trunk, runs `bun run check` on the result, and only then fast-forwards —
 * so a red tree stops at the rebase rather than after the trunk has moved.
 *
 *   bun run land                 rebase, check, fast-forward main
 *   bun run land --dry-run       say what it would do and stop
 *   bun run land --push          push the trunk to origin afterwards
 *
 * The one thing it will not do is merge. If the fast-forward is not available
 * the landing is refused, because the alternative is a fork in a history that
 * is linear on purpose.
 */

import { LOG_FORMAT, parseLog } from "../checks/trailers.js";
import { describe, type LandState, plan } from "./land.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const wantsPush = argv.includes("--push");
const TRUNK = "main";

async function git(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() : "";
}

async function gitOrDie(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`${err.trim() || out.trim()}`);
  return out.trim();
}

function dirtyOf(porcelain: string): string[] {
  return porcelain
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().replace(/^\S+\s+/, ""));
}

/** Which worktree has the trunk checked out, if any. */
async function trunkTree(): Promise<string> {
  const out = await git(["worktree", "list", "--porcelain"]);
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line === `branch refs/heads/${TRUNK}`) return path;
  }
  return "";
}

const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"])) || "HEAD";
const tree = await trunkTree();
const state: LandState = {
  branch,
  trunk: TRUNK,
  dirty: dirtyOf(await git(["status", "--porcelain"])),
  ahead: Number(await git(["rev-list", "--count", `${TRUNK}..HEAD`])) || 0,
  behind: Number(await git(["rev-list", "--count", `HEAD..${TRUNK}`])) || 0,
  trunkTree: tree,
  trunkDirty: tree ? dirtyOf(await git(["status", "--porcelain"], tree)) : [],
};

const decided = plan(state);
if (!decided.go) {
  console.log(`✗ ${decided.why}`);
  process.exit(1);
}
for (const line of describe(state, decided)) console.log(line);
if (dryRun) process.exit(0);

if (decided.rebase) {
  const proc = Bun.spawn(["git", "rebase", TRUNK], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
  if (code !== 0) {
    const conflicted = await git(["diff", "--name-only", "--diff-filter=U"]);
    await git(["rebase", "--abort"]);
    console.log(`✗ ${branch} does not replay onto ${TRUNK}; nothing was moved`);
    if (conflicted) console.log(`  conflicts in ${conflicted.split("\n").join(", ")}`);
    else console.log(`  ${err.trim().split("\n")[0] ?? ""}`);
    process.exit(1);
  }
  console.log(`  rebased  onto ${await git(["rev-parse", "--short", TRUNK])}`);
}

const check = Bun.spawn(["bun", "run", "check"], { cwd: root, stdout: "pipe", stderr: "pipe" });
const [checkOut, checkErr, checkCode] = await Promise.all([
  new Response(check.stdout).text(),
  new Response(check.stderr).text(),
  check.exited,
]);
if (checkCode !== 0) {
  console.log(`✗ bun run check is red on the replayed lane; ${TRUNK} was not moved`);
  console.log(`${checkOut}${checkErr}`.trim().split("\n").slice(-25).join("\n"));
  process.exit(1);
}
console.log("  checked  green");

const head = await git(["rev-parse", "HEAD"]);
const landing = await git(["log", `--format=${LOG_FORMAT}`, `${TRUNK}..HEAD`]);
const subjects = await git(["log", "--reverse", "--format=%h %s", `${TRUNK}..HEAD`]);
try {
  if (decided.moveRef) await gitOrDie(["branch", "--force", TRUNK, head]);
  else await gitOrDie(["merge", "--ff-only", branch], state.trunkTree);
} catch (error) {
  console.log(`✗ ${TRUNK} would not fast-forward: ${(error as Error).message.split("\n")[0]}`);
  process.exit(1);
}

console.log(`✓ ${TRUNK} is at ${await git(["rev-parse", "--short", TRUNK])}`);
for (const line of subjects.split("\n").filter(Boolean)) console.log(`  ${line}`);

const carried = parseLog(landing).flatMap((c) => c.checks);
if (carried.length > 0) {
  console.log(`  ${carried.length} check(s) landed with it — bun run checks`);
}

if (wantsPush) {
  const pushed = await git(["push", "origin", `${TRUNK}:${TRUNK}`]);
  console.log(pushed ? `  pushed   origin/${TRUNK}` : `  ⚠ push to origin/${TRUNK} failed`);
}
