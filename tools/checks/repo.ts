/**
 * The half of `tools/checks` that touches the repository: git, and the
 * ledger file. Everything that decides anything lives in `checks.ts`, which
 * is pure and tested; this file only fetches and writes.
 */

import { join } from "node:path";
import {
  type Branch,
  branchReady,
  type CheckState,
  joinChecks,
  outstanding,
  undecidedOn,
} from "./checks.js";
import { appendDecision, type Decision, parseLedger } from "./ledger.js";
import { argvOf, LOG_FORMAT, parseLog } from "./trailers.js";

export const LEDGER = "docs/verified.md";

const LEDGER_HEADER = `# Verified

What has been looked at by hand, and when. Appended to, never rewritten.

The list of what *needs* looking at is not here — it is derived from the
\`Check:\` trailers in the git history, so it cannot go stale. This file only
records the answers. See \`docs/verification.md\`.

`;

async function git(root: string, args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim() || out.trim()}`);
  return out;
}

async function ok(root: string, args: string[]): Promise<boolean> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "ignore", stderr: "ignore" });
  return (await proc.exited) === 0;
}

export interface Trunk {
  /** `main` if it is here, `origin/main` in a clone that only fetched it. */
  ref: string;
  /** Commits on origin's `main` that this one has not got. */
  behind: number;
}

/**
 * Which trunk the list is read off, and whether it is the current one.
 *
 * A `main` that has not been pulled answers with last week's list, and the one
 * thing this arrangement must never do is say "nothing to check" about work it
 * simply cannot see. So the staleness is measured and said, rather than being
 * something you find out by noticing.
 */
export async function trunk(root: string): Promise<Trunk> {
  if (!(await ok(root, ["rev-parse", "--verify", "--quiet", "main"]))) {
    return { ref: "origin/main", behind: 0 };
  }
  if (!(await ok(root, ["rev-parse", "--verify", "--quiet", "origin/main"]))) {
    return { ref: "main", behind: 0 };
  }
  const count = await git(root, ["rev-list", "--count", "main..origin/main"]);
  return { ref: "main", behind: Number(count.trim()) || 0 };
}

export async function readLedger(root: string): Promise<Decision[]> {
  const file = Bun.file(join(root, LEDGER));
  if (!(await file.exists())) return [];
  return parseLedger(await file.text());
}

export async function writeDecision(root: string, decision: Decision): Promise<void> {
  const path = join(root, LEDGER);
  const file = Bun.file(path);
  const before = (await file.exists()) ? await file.text() : LEDGER_HEADER;
  await Bun.write(path, appendDecision(before, decision));
}

export async function readChecks(root: string): Promise<CheckState[]> {
  const { ref } = await trunk(root);
  const log = await git(root, ["log", `--format=${LOG_FORMAT}`, "--date=short", ref]);
  return joinChecks(parseLog(log), await readLedger(root));
}

interface Ref {
  name: string;
  remote: boolean;
  tip: string;
}

async function refs(root: string): Promise<Ref[]> {
  const out = await git(root, [
    "for-each-ref",
    "--format=%(refname:short)%1f%(objectname)",
    "refs/heads",
    "refs/remotes/origin",
  ]);
  const found: Ref[] = [];
  for (const line of out.split("\n")) {
    const [full, tip] = line.split("\x1f");
    if (!full || !tip) continue;
    const remote = full.startsWith("origin/");
    const name = remote ? full.slice("origin/".length) : full;
    if (name === "main" || name === "HEAD") continue;
    found.push({ name, remote, tip });
  }
  return found;
}

async function worktrees(root: string): Promise<Map<string, string>> {
  const out = await git(root, ["worktree", "list", "--porcelain"]);
  const held = new Map<string, string>();
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line.startsWith("branch refs/heads/"))
      held.set(line.slice("branch refs/heads/".length), path);
  }
  return held;
}

/**
 * One row per branch name, whether it sits here, on origin or both — because
 * deleting one and leaving the other is not what "cleaned up" means.
 */
export async function readBranches(root: string, states: readonly CheckState[]): Promise<Branch[]> {
  const { ref } = await trunk(root);
  const head = (await git(root, ["rev-parse", "--abbrev-ref", "HEAD"])).trim();
  const held = await worktrees(root);
  const left = outstanding(states);

  const rows = new Map<string, Branch>();
  for (const found of await refs(root)) {
    const row = rows.get(found.name) ?? {
      name: found.name,
      local: false,
      remote: false,
      merged: true,
      worktree: held.get(found.name) ?? "",
      current: found.name === head,
      undecided: 0,
    };
    if (found.remote) row.remote = true;
    else row.local = true;

    if (!(await ok(root, ["merge-base", "--is-ancestor", found.tip, ref]))) row.merged = false;

    const reachable = new Set<string>();
    for (const check of left) {
      if (await ok(root, ["merge-base", "--is-ancestor", check.full, found.tip])) {
        reachable.add(check.full);
      }
    }
    row.undecided = Math.max(row.undecided, undecidedOn(reachable, states));
    rows.set(found.name, row);
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Run one check's command. Green means it decided itself. */
export async function runCommand(
  root: string,
  command: string,
): Promise<{ ok: boolean; output: string }> {
  const argv = argvOf(command);
  if (!argv) return { ok: false, output: `${command} is not one of this repository's commands` };
  const proc = Bun.spawn(argv, { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { ok: code === 0, output: `${out}${err}`.trim() };
}

/**
 * The worktree first, then the branch, then origin's copy. `git worktree
 * remove` and `git branch -d` both refuse work that would lose something, and
 * neither is talked out of it here — a `--force` in this file would make the
 * button a different button.
 */
export async function deleteBranch(root: string, branch: Branch): Promise<string[]> {
  if (!branchReady(branch)) throw new Error(`${branch.name} is not ready to go`);
  const done: string[] = [];
  if (branch.worktree) {
    await git(root, ["worktree", "remove", branch.worktree]);
    done.push(`worktree ${branch.worktree}`);
  }
  if (branch.local) {
    await git(root, ["branch", "-d", branch.name]);
    done.push(branch.name);
  }
  if (branch.remote) {
    await git(root, ["push", "origin", "--delete", branch.name]);
    done.push(`origin/${branch.name}`);
  }
  return done;
}
