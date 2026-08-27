#!/usr/bin/env bun

/**
 * `bun run burn` — the board an autonomous run reads.
 *
 * It answers two questions and nothing else. *Where did the run get to* comes
 * from `docs/queue.md` joined to git, so it is the same answer whether it is
 * asked twenty minutes or two days later, by this session or by one that
 * starts knowing only the clone. *What could go in the queue* comes from the
 * spec, through the same parsers the director's NOT BUILT YET sheet uses —
 * one backlog, not a second copy of it.
 *
 *   bun run burn                 the queue, and what git says about each lane
 *   bun run burn --next          the next unopened lane, brief and all
 *   bun run burn --candidates    what the spec has agreed to and the game lacks
 */

import { join } from "node:path";
import { type BacklogGroup, buildBacklog } from "../director/src/backlog.js";
import { type Lane, type LaneFact, nextLane, parseQueue, render } from "./queue.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);
const TRUNK = "main";

async function git(args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "ignore" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() : "";
}

async function ok(args: string[]): Promise<boolean> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "ignore", stderr: "ignore" });
  return (await proc.exited) === 0;
}

async function read(path: string): Promise<string> {
  const file = Bun.file(join(root, path));
  return (await file.exists()) ? await file.text() : "";
}

async function worktrees(): Promise<Map<string, string>> {
  const out = await git(["worktree", "list", "--porcelain"]);
  const held = new Map<string, string>();
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line.startsWith("branch refs/heads/"))
      held.set(line.slice("branch refs/heads/".length), path);
  }
  return held;
}

async function factsFor(lanes: readonly Lane[]): Promise<Map<string, LaneFact>> {
  const held = await worktrees();
  const tip = await git(["rev-parse", TRUNK]);
  const facts = new Map<string, LaneFact>();
  for (const lane of lanes) {
    const exists = await ok(["rev-parse", "--verify", "--quiet", lane.branch]);
    facts.set(lane.branch, {
      exists,
      atTip: exists && (await git(["rev-parse", lane.branch])) === tip,
      ahead: exists
        ? Number(await git(["rev-list", "--count", `${TRUNK}..${lane.branch}`])) || 0
        : 0,
      worktree: held.get(lane.branch) ?? "",
    });
  }
  return facts;
}

if (argv.includes("--candidates")) {
  const backlog = buildBacklog(
    await read("docs/spec/bestiary.md"),
    await read("docs/spec/bosses.md"),
    await read("docs/spec/couplings.md"),
    await read("docs/spec/assists.md"),
    await read("docs/spec/systems.md"),
    await read("docs/spec/ideas.md"),
  );
  const tabs = Object.entries(backlog) as [string, BacklogGroup[]][];
  for (const [tab, groups] of tabs) {
    const rows = groups.flatMap((g) => g.entries.filter((e) => e.name));
    if (rows.length === 0) continue;
    console.log(`\n${tab.toUpperCase()} — ${rows.length} unbuilt`);
    for (const entry of rows) {
      const note = entry.note.replace(/\s+/g, " ").slice(0, 84);
      console.log(`  ${entry.name.padEnd(22)} ${note}`);
    }
  }
  process.exit(0);
}

const lanes = parseQueue(await read("docs/queue.md"));
const facts = await factsFor(lanes);

if (argv.includes("--next")) {
  const lane = nextLane(lanes, facts);
  if (!lane) {
    console.log("nothing waiting — every lane in the queue has a branch");
    process.exit(0);
  }
  console.log(
    `${lane.title}\nbranch  ${lane.branch}\nowns    ${lane.owns.join(" ")}\n\n${lane.brief}`,
  );
  process.exit(0);
}

console.log(render(lanes, facts));
