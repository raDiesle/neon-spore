#!/usr/bin/env bun

/**
 * `bun run queue` — what is waiting, and what somebody is already on.
 * `bun run queue next` — hand the first free item to a session of its own.
 * `bun run queue release <n|title>` — give a handed-out item back.
 * `bun run queue done <n|title>` — take an entry out once it has landed.
 *
 * The queue is a file rather than a chat message because the next session
 * clones `origin` and sees nothing else. Handing an item out creates its
 * branch, and that branch is the claim: `next` cannot give the same item to
 * two sessions, because the second `git branch` fails.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { branchFor, claimOn, promptFor, unclaimed } from "./claim.js";
import { type Item, order, parseItems, pick, problemsIn, removeItem } from "./queue.js";

const ROOT = join(import.meta.dirname, "..", "..");
const PATHS = { queue: join(ROOT, "docs", "queue.md"), parked: join(ROOT, "docs", "parked.md") };

function git(...args: string[]): { ok: boolean; out: string; err: string } {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

/** Every branch this checkout can see — its own and, if it has one, origin's. */
function refs(): string[] {
  const r = git("for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin");
  return r.out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function load(): Item[] {
  const queue = parseItems(readFileSync(PATHS.queue, "utf8"), "queue");
  const parked = parseItems(readFileSync(PATHS.parked, "utf8"), "parked");
  return order(queue, parked);
}

/** Creates the claim. Fails, rather than overwrites, if somebody got there first. */
function claim(item: Item): string {
  const branch = branchFor(item);
  const made = git("branch", branch, "main");
  if (!made.ok) throw new Error(`could not claim ${JSON.stringify(item.title)}: ${made.err}`);
  return branch;
}

const [command, arg] = process.argv.slice(2);
const items = load();
const known = refs();

if (!command || command === "list") {
  if (items.length === 0) {
    console.log("The queue is empty. Nothing is waiting.");
  } else {
    for (const [i, item] of items.entries()) {
      const held = claimOn(item, known);
      const tag = item.source === "parked" ? " (parked, half-done)" : "";
      console.log(`${String(i + 1).padStart(2)}. ${item.title}${tag}`);
      console.log(`    ${item.found}`);
      console.log(`    ${item.files.join(", ")}`);
      if (held) console.log(`    taken — ${held}`);
    }
    const free = unclaimed(items, known).length;
    console.log(`\n${items.length} waiting, ${items.length - free} taken.`);
    console.log("`bun run queue next` hands the first free one to a session of its own.");
  }
  const problems = problemsIn(items);
  if (problems.length > 0) {
    console.log("\nEntries a cold session could not act on:");
    for (const p of problems) console.log(`  - ${p}`);
  }
} else if (command === "next") {
  const free = unclaimed(items, known);
  const item = arg ? pick(items, arg) : free[0];
  if (!item) {
    console.log(
      items.length === 0
        ? "The queue is empty. Nothing is waiting."
        : "Every item is taken. `bun run queue` says by which branch.",
    );
  } else {
    const held = claimOn(item, known);
    if (held) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
    console.log(promptFor(item, claim(item)));
  }
} else if (command === "release") {
  if (!arg) throw new Error("usage: bun run queue release <n|title>");
  const item = pick(items, arg);
  const branch = branchFor(item);
  // Nothing to give back is not a failure, and it is the common case now that a
  // claim can be swept out from under a session by another lane's landing: the
  // answer wanted is "nobody is on this", not git's answer to a different
  // question about a ref that is not there.
  if (!claimOn(item, known)) {
    console.log(`Not held: ${item.title} (no ${branch} — nobody is on it)`);
  } else {
    const gone = git("branch", "-d", branch);
    if (!gone.ok) throw new Error(`could not release ${JSON.stringify(item.title)}: ${gone.err}`);
    console.log(`Released: ${item.title} (${branch} deleted)`);
  }
} else if (command === "done") {
  if (!arg) throw new Error("usage: bun run queue done <n|title>");
  const item = pick(items, arg);
  const path = PATHS[item.source];
  writeFileSync(path, removeItem(readFileSync(path, "utf8"), item.title));
  console.log(`Removed from docs/${item.source}.md: ${item.title}`);
} else {
  throw new Error(`unknown command ${JSON.stringify(command)} — list | next | release | done`);
}
