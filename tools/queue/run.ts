#!/usr/bin/env bun

/**
 * `bun run queue` — what is waiting, and what somebody is already on.
 * `bun run queue status` — DONE, IDLE or BUSY in one word.
 * `bun run queue next` — hand the first free item to a session of its own,
 *   passing over one still waiting on the owner (`asking.ts`).
 * `bun run queue take <n|title>` — mark an item ongoing without opening a lane.
 * `bun run queue release <n|title>` — give a handed-out item back.
 * `bun run queue done "<title>"` — take an entry out once it has landed. By
 *   name, and never by number: a removal is the one thing a stale position
 *   cannot be allowed to do (`refuseNumbered`).
 *
 * An entry may be reserved for one kind of session — `- **Where:** cloud` or
 * `local` — and `where.ts` says how `next` and `take` honour that.
 *
 * The queue is a file rather than a chat message because the next session
 * clones `origin` and sees nothing else. Claiming an item does two things, and
 * `claim.ts` says why it takes both: it creates the item's branch, which is the
 * gate — the second `git branch` fails, so two sessions cannot be given the
 * same item — and it writes a `Taken:` line into the entry on `main` and pushes
 * it, which is the half a local ref cannot do for a session in its own clone.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { answerTo, asksTag, waiting } from "./asking.js";
import {
  branchFor,
  claimOn,
  heldElsewhere,
  refuseNumbered,
  statusLines,
  statusOf,
  unclaimed,
} from "./claim.js";
import { clearTaken, removeItem } from "./edit.js";
import { problemsIn, refuseUnlessWhole } from "./problems.js";
import { promptFor } from "./prompt.js";
import { type Item, match, order, parseItems, pick } from "./queue.js";
import {
  alsoHere,
  claim,
  drop,
  hasBranch,
  headBranch,
  onTrunk,
  PATHS,
  refs,
  trunkRef,
  trunkTaken,
  trunkView,
} from "./repo.js";
import { staleLine, staleness } from "./stale.js";
import { fits, refuseUnlessFits, reservedTag, sessionKind } from "./where.js";

function load(): Item[] {
  const queue = parseItems(readFileSync(PATHS.queue, "utf8"), "queue");
  const parked = parseItems(readFileSync(PATHS.parked, "utf8"), "parked");
  return order(queue, parked);
}

const [command, arg] = process.argv.slice(2);
const items = load();
const known = refs();
const kind = sessionKind();

if (!command || command === "list") {
  if (items.length === 0) {
    console.log("The queue is empty. Nothing is waiting.");
  } else {
    // Read once for the whole listing: the tree is two thousand paths.
    const trunk = trunkView();
    for (const [i, item] of items.entries()) {
      const held = claimOn(item, known);
      const parked = item.source === "parked" ? " (parked, half-done)" : "";
      // The owner reads this list to find what is waiting on *them*, so the
      // mark goes on the title line rather than under it (`asking.ts`).
      const tag = `${asksTag(item)}${reservedTag(item)}${parked}`;
      console.log(`${String(i + 1).padStart(2)}. ${item.title}${tag}`);
      console.log(`    ${item.found}`);
      console.log(`    ${item.files.join(", ")}`);
      if (item.asks) console.log(`    ${item.asks}`);
      // The answer under the question, so a session sees what was decided
      // without opening the file — it is the thing that makes the entry
      // claimable again, and it is worth the line.
      const answer = answerTo(item);
      if (answer) console.log(`    ${answer}`);
      if (held) console.log(`    taken — ${held}`);
      // Said under the entry rather than in the count: the mark is for the
      // session about to claim it, so it re-reads before it works (`stale.ts`).
      const stale = staleLine(staleness(item, trunk), trunkRef());
      if (stale) console.log(`    ${stale}`);
    }
    const free = unclaimed(items, known);
    // Said as two numbers when they differ, so a session reading "3 free" in a
    // sandbox does not go looking for the two it cannot have.
    const here = free.filter((i) => fits(i, kind)).length;
    const elsewhere = here === free.length ? "" : ` (${here} of them for a ${kind} session)`;
    const taken = items.length - free.length;
    console.log(`\n${items.length} in the queue, ${free.length} free${elsewhere}, ${taken} taken.`);
    // Counted for the owner, who is the one person this line is addressed to:
    // `next` passes over these, so they sit at the top of his listing doing
    // nothing until he says a sentence.
    const asking = free.filter(waiting).length;
    if (asking > 0) {
      console.log(`${asking} of the free ones wait on your answer; \`next\` passes over them.`);
    }
    console.log("`bun run queue next` hands the first free one to a session of its own,");
    console.log("`bun run queue take <n>` marks one ongoing without opening a lane,");
    console.log('and `bun run queue done "<title>"` takes it out — by name, never by number.');
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
  // An unanswered ask is passed over rather than refused: `next <n>` naming one
  // still hands it out, and so does `take` (`asking.ts`).
  const mine = free.filter((i) => fits(i, kind));
  const item = arg ? pick(items, arg) : mine.find((i) => !waiting(i));
  if (!item) {
    console.log(
      items.length === 0
        ? "The queue is empty. Nothing is waiting."
        : free.length === 0
          ? "Every item is taken. `bun run queue` says who is on each."
          : mine.length === 0
            ? `Every free item is reserved for the other kind of session (this is a ${kind} one).`
            : "Every free item is waiting on the owner's answer. `bun run queue` says what each asks.",
    );
  } else {
    const held = claimOn(item, known);
    if (held) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
    refuseUnlessFits(item, kind);
    refuseUnlessWhole(item);
    const branch = claim(item);
    console.log(
      `\n${promptFor(item, branch, staleLine(staleness(item, trunkView()), trunkRef()))}`,
    );
  }
} else if (command === "take") {
  if (!arg) throw new Error("usage: bun run queue take <n|title>");
  const item = pick(items, arg);
  const held = claimOn(item, known);
  if (held) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
  refuseUnlessFits(item, kind);
  refuseUnlessWhole(item);
  console.log(`Ongoing: ${item.title} (${claim(item)})`);
  console.log("`bun run queue done` when it is out of the file; that drops the claim.");
} else if (command === "release") {
  if (!arg) throw new Error("usage: bun run queue release <n|title>");
  const m = match(items, arg);
  refuseNumbered(m, "release", heldElsewhere(m.item, known, headBranch()), false);
  const item = m.item;
  const branch = branchFor(item);
  // **The trunk's copy is asked, not this one's.** `item` was parsed out of the
  // working tree, and a claim made where no worktree holds `main` is written
  // onto the ref with the working tree left alone — so a cloud session reading
  // its own file finds no mark, leaves the trunk's line standing, and the item
  // goes on reading as taken by a branch that has just been deleted. That is
  // what happened on 15 September 2026.
  const marked = item.taken || trunkTaken(item);
  // Nothing to give back is not a failure, and it is the common case now that a
  // claim can be swept out from under a session by another lane's landing: the
  // answer wanted is "nobody is on this", not git's answer to a different
  // question about a ref that is not there.
  if (!claimOn(item, known) && !marked) {
    console.log(`Not held: ${item.title} (no ${branch}, no Taken: line — nobody is on it)`);
  } else {
    if (marked) {
      const cut = (md: string): string => clearTaken(md, item.title);
      onTrunk(item, cut, `Give ${JSON.stringify(item.title)} back`);
      // And in this checkout's own copy, which is the half a trunk edit cannot
      // reach: a lane holding its own `docs/queue.md` puts the line straight
      // back the moment `bun run land` rebases it over the give-back.
      alsoHere(item, cut);
    }
    // The line can outlive the branch — a landing sweeps the branch, and a clone
    // never had one — so "no branch" is a shape of release rather than a failure.
    const { ok, note } = hasBranch(branch)
      ? drop(branch)
      : { ok: true, note: `no ${branch} — the Taken: line was the whole claim` };
    console.log(`${ok ? "Released" : "Still held"}: ${item.title} (${note})`);
  }
} else if (command === "done") {
  if (!arg) throw new Error('usage: bun run queue done "<title>"');
  const m = match(items, arg);
  // A removal is never taken off a position, free entry or not, so there is
  // nobody to ask about: `removes` settles it before the holder is read
  // (`claim.ts`).
  refuseNumbered(m, "done", undefined, true);
  const item = m.item;
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
