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

import { join } from "node:path";
import { parseQueue } from "../burn/queue.js";
import { LOG_FORMAT, parseLog } from "../checks/trailers.js";
import { describe, type LandState, plan } from "./land.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
/** Written out rather than escaped, because this file is edited by tools that mangle escapes. */
const EOL = String.fromCharCode(10);
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

// A replay can bring a workspace package the lane never had — `tools/orphans`
// arrived that way — and `node_modules` is then stale between the rebase and
// the check. What the check reports is `Cannot find module '@neon-spore/…'` in
// a file the lane never opened, which reads as a rebase disaster and is
// thirteen milliseconds of work. Cheap, idempotent, and it runs after the
// replay rather than before it, which is the whole point.
await Bun.spawn(["bun", "install"], { cwd: root, stdout: "ignore", stderr: "ignore" }).exited;

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

/**
 * What the lane says nobody has looked at — and, when that is nothing, the
 * fact that it is nothing.
 *
 * The silent version of this line cost a real obligation. A lane reported two
 * `Check:` trailers, amended its commit during a rebase, and the trailers went
 * with the amendment; the landing printed no check line, which is exactly what
 * a fully-verified lane also prints. Nobody noticed for an hour. A sandbox
 * lane that genuinely leaves nothing for an eye is rare enough that it is
 * worth saying out loud rather than inferring from a missing line.
 */
const carried = parseLog(landing).flatMap((c) => c.checks);
if (carried.length > 0) {
  console.log(`  ${carried.length} check(s) landed with it — bun run checks`);
} else {
  console.log("  0 checks — nothing here needs an eye, or a rebase ate the trailers");
}

/**
 * Retiring the entry is part of landing, not tidying afterwards.
 *
 * `docs/queue.md` says an entry leaves by being deleted, and for a while the
 * deleting was left to whoever ran the landing. That failed twice in one day,
 * the same way both times: the lane landed, the entry stayed, and the board
 * went on showing work that was already on the trunk. It is not even a visible
 * failure — a landed branch stops sitting on the trunk's tip as soon as
 * anything else lands, so it falls back to reading exactly like a branch
 * nobody has started, which is the one ambiguity the status rules cannot
 * resolve from git alone.
 *
 * So the tick happens where the fact is known: here, one line after the
 * fast-forward, while the branch name is still in hand.
 */
async function retire(branch: string): Promise<void> {
  if (!state.trunkTree) {
    console.log(
      `  ⚑ retire ${branch} from docs/queue.md by hand — nothing has ${TRUNK} checked out`,
    );
    return;
  }
  const path = join(state.trunkTree, "docs/queue.md");
  const file = Bun.file(path);
  if (!(await file.exists())) return;
  const text = await file.text();
  const lane = parseQueue(text).find((l) => l.branch === branch);
  if (!lane) return;

  const start = text.indexOf(`## ${lane.title}`);
  if (start < 0) return;
  const next = text.indexOf(`${EOL}## `, start + 1);
  const cut = `${text.slice(0, start)}${next < 0 ? "" : text.slice(next + 1)}`.trimEnd();
  await Bun.write(path, `${cut}${EOL}`);

  await gitOrDie(["add", "docs/queue.md"], state.trunkTree);
  await gitOrDie(
    ["commit", "-q", "-m", `${lane.title} is on ${TRUNK}, so it leaves the queue`],
    state.trunkTree,
  );
  console.log(`  retired  ${lane.title}`);
}

await retire(branch);

if (wantsPush) {
  const pushed = await git(["push", "origin", `${TRUNK}:${TRUNK}`]);
  console.log(pushed ? `  pushed   origin/${TRUNK}` : `  ⚠ push to origin/${TRUNK} failed`);
}
