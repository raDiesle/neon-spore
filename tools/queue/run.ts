#!/usr/bin/env bun

/**
 * `bun run queue` — what is waiting, and what somebody is already on.
 * `bun run queue status` — DONE, IDLE or BUSY in one word.
 * `bun run queue next` — hand the first free item to a session of its own,
 *   passing over one still waiting on the owner (`asking.ts`) and one waiting
 *   on another entry (`needs.ts`).
 * `bun run queue show <n|title>` — print the prompt `next` would, claiming
 *   nothing (`show.ts`).
 * `bun run queue take <n|title>` — mark an item ongoing without opening a lane.
 * `bun run queue release <n|title>` — give a handed-out item back.
 * `bun run queue done "<title>"` — take an entry out once it has landed. By
 *   name, and never by number: a removal is the one thing a stale position
 *   cannot be allowed to do (`refuseNumbered`).
 *
 * An entry may be kept for a session with a screen — `- **Where:** local` —
 * and `where.ts` says how `next` and `take` honour that. It may also
 * name an entry that has to land before it can start, on a `- **Needs:**` line
 * that `needs.ts` reads.
 *
 * The queue is a file rather than a chat message because the next session
 * clones `origin` and sees nothing else. Claiming an item does two things, and
 * `claim.ts` says why it takes both: it creates the item's branch, which is the
 * gate — the second `git branch` fails, so two sessions cannot be given the
 * same item — and it writes a `Taken:` line into the entry on `main` and pushes
 * it, which is the half a local ref cannot do for a session in its own clone.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { waiting } from "./asking.js";
import { branchFor, claimOn, heldElsewhere, refuseNumbered, unclaimed } from "./claim.js";
import { clearTaken, removeItem } from "./edit.js";
import { printList } from "./list.js";
import { blocked } from "./needs.js";
import { refuseUnlessWhole } from "./problems.js";
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
  unmark,
} from "./repo.js";
import { briefFor, showItem } from "./show.js";
import { spentHere } from "./spent.js";
import { statusLines, statusOf } from "./status.js";
import { fits, offered, refuseUnlessFits, sessionKind } from "./where.js";

function load(): Item[] {
  const queue = parseItems(readFileSync(PATHS.queue, "utf8"), "queue");
  const parked = parseItems(readFileSync(PATHS.parked, "utf8"), "parked");
  return order(queue, parked);
}

const [command, arg] = process.argv.slice(2);
const items = load();
const known = refs();
const kind = sessionKind();
/** The day, for the one question that is about elapsed time (`lapsed.ts`). */
const today = new Date().toISOString().slice(0, 10);

if (!command || command === "list") {
  printList(items, known, kind, today);
} else if (command === "status") {
  for (const line of statusLines(statusOf(items, known, today, trunkRef()))) console.log(line);
} else if (command === "next") {
  const free = unclaimed(items, known);
  // An unanswered ask is passed over rather than refused: `next <n>` naming one
  // still hands it out, and so does `take` (`asking.ts`). An entry waiting on
  // another entry is passed over on the same terms, for the same reason — a
  // session may want to start the blocked half early (`needs.ts`). And an
  // entry needing hardware is passed over on every machine (`offered`).
  const mine = free.filter((i) => fits(i, kind));
  const item = arg
    ? pick(items, arg)
    : mine.find((i) => offered(i) && !waiting(i) && !blocked(i, items));
  if (!item) {
    console.log(
      items.length === 0
        ? "The queue is empty. Nothing is waiting."
        : free.length === 0
          ? "Every item is taken. `bun run queue` says who is on each."
          : mine.length === 0
            ? `Every free item is reserved for the other kind of session (this is a ${kind} one).`
            : "Every free item needs a phone in your hand, or waits on the owner's answer " +
              'or on another entry. `bun run queue` says which, and `take "<title>"` takes one anyway.',
    );
  } else {
    const held = claimOn(item, known);
    if (held) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
    refuseUnlessFits(item, kind);
    refuseUnlessWhole(item);
    const branch = claim(item);
    console.log(`\n${briefFor(item, branch, items)}`);
    // Said last, where a truncated read of this output ends: running `next`
    // again to see the rest claims a second item (`show.ts`).
    const again = `bun run queue show ${JSON.stringify(item.title)}`;
    console.log(`\nLost the top of this? \`${again}\` reprints it and claims nothing.`);
  }
} else if (command === "show") {
  if (!arg) throw new Error("usage: bun run queue show <n|title>");
  console.log(showItem(pick(items, arg), items, known));
} else if (command === "take") {
  if (!arg) throw new Error("usage: bun run queue take <n|title>");
  const item = pick(items, arg);
  // **`heldElsewhere`, not `claimOn`.** `claimOn` says who holds the item and
  // cannot say whether that is the caller — and the caller is very often the
  // holder here, because a lane that finished half an entry and rewrote its
  // title is re-marking the entry it is standing in. `branchFor` derives a
  // different branch from the new words, so the only line naming this lane is
  // the mark's own `(claim: ...)`, and `heldElsewhere` is the one that reads
  // it (`claim.ts`).
  const held = heldElsewhere(item, known, headBranch());
  // A lane on this machine that landed its piece and walked away leaves its
  // line and its claim branch behind, and that is not a holder (`spent.ts`).
  const spent = held ? spentHere(item, item.taken || trunkTaken(item)) : null;
  if (held && !spent) throw new Error(`${JSON.stringify(item.title)} is already taken — ${held}`);
  refuseUnlessFits(item, kind);
  refuseUnlessWhole(item);
  // This lane's own stale line comes off before the fresh one goes on, because
  // `markTaken` refuses to overwrite a holder and here the holder is this lane
  // under a name the entry no longer has. Asked unconditionally: the line the
  // caller has to get out of the way may be in the trunk's copy and not in the
  // one it was handed, which is the state every clone is in (`unmark`).
  unmark(item);
  for (const b of spent ?? []) console.log(`Spent: ${b} — ${drop(b).note}`);
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
    `unknown command ${JSON.stringify(command)} — list | status | next | show | take | release | done`,
  );
}
