/**
 * `docs/queue.md`, drawn as one more group on the NOT BUILT YET sheet.
 *
 * It is a third state and neither of the other two: a spec entry is
 * unbuilt and undecided, a parked idea is unbuilt and unclaimed, and a queue
 * entry is unbuilt and *somebody has already committed to it* — a branch
 * name, and the paths it owns. That claim is worth showing, because it is
 * how a reader tells a lane being worked right now from one still waiting,
 * and `bun run burn` already knows how to ask git for it. This calls the
 * same parser (`../../burn/queue.js`) rather than a second one, and repeats
 * only the git plumbing `tools/burn/run.ts` and `tools/checks/repo.ts` both
 * already have their own copy of — three small, unexported functions, not
 * worth a shared module for.
 *
 * Git makes this async, which is why it cannot live in `backlog.ts`: every
 * other group there is a pure function of markdown already in hand.
 */

import { type Lane, type LaneFact, parseQueue, statusOf } from "../../burn/queue.js";
import type { BacklogEntry, BacklogGroup } from "./backlog.js";

const TRUNK = "main";

async function git(root: string, args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "ignore" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() : "";
}

async function exists(root: string, ref: string): Promise<boolean> {
  const proc = Bun.spawn(["git", "rev-parse", "--verify", "--quiet", ref], {
    cwd: root,
    stdout: "ignore",
    stderr: "ignore",
  });
  return (await proc.exited) === 0;
}

async function worktreesOf(root: string): Promise<Map<string, string>> {
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

async function factsFor(root: string, lanes: readonly Lane[]): Promise<Map<string, LaneFact>> {
  const held = await worktreesOf(root);
  const tip = await git(root, ["rev-parse", TRUNK]);
  const facts = new Map<string, LaneFact>();
  for (const lane of lanes) {
    const has = await exists(root, lane.branch);
    facts.set(lane.branch, {
      exists: has,
      atTip: has && (await git(root, ["rev-parse", lane.branch])) === tip,
      ahead: has
        ? Number(await git(root, ["rev-list", "--count", `${TRUNK}..${lane.branch}`])) || 0
        : 0,
      worktree: held.get(lane.branch) ?? "",
    });
  }
  return facts;
}

/** What is being worked right now against what is only waiting, in one line. */
function noteFor(lane: Lane, fact: LaneFact | undefined): string {
  const status = statusOf(fact);
  const owns = lane.owns.length > 0 ? lane.owns.join(" ") : "no path named";
  const doing =
    status === "flying"
      ? `${fact?.ahead} commit${fact?.ahead === 1 ? "" : "s"} ahead${fact?.worktree ? ` in ${fact.worktree}` : ""}`
      : status === "opened"
        ? "branch open, nothing on it yet"
        : status === "landed"
          ? "on main — due to leave this file"
          : "not started";
  return `${lane.branch} · ${owns} — ${doing}`;
}

/**
 * One group, one entry per lane, in the file's own order — first in the
 * file is next to be done, the same rule `docs/queue.md`'s own header
 * states. `kind` carries the status word (`waiting`, `opened`, `flying`,
 * `landed`) so the existing stamp rendering in `backlog-page.ts` shows it
 * with no changes needed there.
 */
export async function buildQueue(root: string, md: string): Promise<BacklogGroup[]> {
  const lanes = parseQueue(md);
  if (lanes.length === 0) return [];
  const facts = await factsFor(root, lanes);
  const entries: BacklogEntry[] = lanes.map((lane) => ({
    name: lane.title,
    kind: statusOf(facts.get(lane.branch)),
    note: noteFor(lane, facts.get(lane.branch)),
    detail: lane.brief,
    ref: lane.branch,
  }));
  return [
    {
      title: "THE QUEUE",
      note: "decided, not yet done — docs/queue.md; first in the file is next",
      entries,
      builtHidden: 0,
    },
  ];
}
