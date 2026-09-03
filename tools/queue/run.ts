#!/usr/bin/env bun

/**
 * `bun run queue` — what is waiting, and what somebody is already on.
 * `bun run queue status` — DONE, IDLE or BUSY in one word.
 * `bun run queue next` — hand the first free item to a session of its own.
 * `bun run queue take <n|title>` — mark an item ongoing without opening a lane.
 * `bun run queue release <n|title>` — give a handed-out item back.
 * `bun run queue done <n|title>` — take an entry out once it has landed.
 *
 * The queue is a file rather than a chat message because the next session
 * clones `origin` and sees nothing else. Claiming an item does two things, and
 * `claim.ts` says why it takes both: it creates the item's branch, which is the
 * gate — the second `git branch` fails, so two sessions cannot be given the
 * same item — and it writes a `Taken:` line into the entry on `main` and pushes
 * it, which is the half a local ref cannot do for a session in its own clone.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { branchFor, claimOn, promptFor, statusLines, statusOf, unclaimed } from "./claim.js";
import { clearTaken, type Item, order, parseItems, pick, problemsIn, removeItem } from "./queue.js";
import { claim, drop, hasBranch, onTrunk, PATHS, refs } from "./repo.js";

function load(): Item[] {
  const queue = parseItems(readFileSync(PATHS.queue, "utf8"), "queue");
  const parked = parseItems(readFileSync(PATHS.parked, "utf8"), "parked");
  return order(queue, parked);
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
    console.log(`\n${items.length} in the queue, ${free} free, ${items.length - free} taken.`);
    console.log("`bun run queue next` hands the first free one to a session of its own,");
    console.log("`bun run queue take <n>` marks one ongoing without opening a lane.");
  }
  const problems = problemsIn(items);
  if (problems.length > 0) {
    console.log("\nEntries a cold session could not act on:");
    for (const p of problems) console.log(`  - ${p}`);
  }
} else if (command === "status") {
  for (const line of statusLines(statusOf(items, known))) console.log(line);
} else if (command === "next") {
  const free = unclaimed(items, known);
  const item = arg ? pick(items, arg) : free[0];
  if (!item) {
    console.log(
      items.length === 0
        ? "The queue is empty. Nothing is waiting."
        : "Every item is taken. `bun run queue` says who is on each.",
    );
  } else {
    const held = claimOn(item, known);
    if (held) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
    const branch = claim(item);
    console.log(`\n${promptFor(item, branch)}`);
  }
} else if (command === "take") {
  if (!arg) throw new Error("usage: bun run queue take <n|title>");
  const item = pick(items, arg);
  const held = claimOn(item, known);
  if (held) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
  console.log(`Ongoing: ${item.title} (${claim(item)})`);
  console.log("`bun run queue done` when it is out of the file; that drops the claim.");
} else if (command === "release") {
  if (!arg) throw new Error("usage: bun run queue release <n|title>");
  const item = pick(items, arg);
  const branch = branchFor(item);
  // Nothing to give back is not a failure, and it is the common case now that a
  // claim can be swept out from under a session by another lane's landing: the
  // answer wanted is "nobody is on this", not git's answer to a different
  // question about a ref that is not there.
  if (!claimOn(item, known)) {
    console.log(`Not held: ${item.title} (no ${branch}, no Taken: line — nobody is on it)`);
  } else {
    if (item.taken) {
      onTrunk(item, (md) => clearTaken(md, item.title), `Give ${JSON.stringify(item.title)} back`);
    }
    // The line can outlive the branch — a landing sweeps the branch, and a clone
    // never had one — so "no branch" is a shape of release rather than a failure.
    const { ok, note } = hasBranch(branch)
      ? drop(branch)
      : { ok: true, note: `no ${branch} — the Taken: line was the whole claim` };
    console.log(`${ok ? "Released" : "Still held"}: ${item.title} (${note})`);
  }
} else if (command === "done") {
  if (!arg) throw new Error("usage: bun run queue done <n|title>");
  const item = pick(items, arg);
  const path = PATHS[item.source];
  writeFileSync(path, removeItem(readFileSync(path, "utf8"), item.title));
  console.log(`Removed from docs/${item.source}.md: ${item.title}`);
  // An entry that is out of the file is not ongoing, whichever branch did it.
  // The `Taken:` line needs nothing done to it: it lived inside the entry, and
  // the entry has just gone.
  if (hasBranch(branchFor(item))) console.log(`         ${drop(branchFor(item)).note}`);
} else {
  throw new Error(
    `unknown command ${JSON.stringify(command)} — list | status | next | take | release | done`,
  );
}
