/**
 * `bun run queue` with no command: every entry, who holds it, and what the
 * owner is asked.
 *
 * Out of `run.ts` on 23 September 2026, when `show` took that file past its
 * 250-line ceiling. The listing is the one command that is all printing and
 * no decision — it claims nothing, writes nothing and refuses nothing — so it
 * was the seam with the fewest threads through it.
 */

import { answerTo, asksTag } from "./asking.js";
import { claimOn, unclaimed } from "./claim.js";
import { lapsed, lapsedLine } from "./lapsed.js";
import { needsTag } from "./needs.js";
import { problemsIn } from "./problems.js";
import type { Item } from "./queue.js";
import { trunkRef, trunkView } from "./repo.js";
import { skipLines } from "./skipped.js";
import { staleLine, staleness } from "./stale.js";
import { fits, type Kind, reservedTag } from "./where.js";

export function printList(
  items: readonly Item[],
  known: readonly string[],
  kind: Kind,
  today: string,
): void {
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
      const tag = `${asksTag(item)}${reservedTag(item)}${needsTag(item, items)}${parked}`;
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
      // And under that, when every branch behind it is gone and the mark is
      // old: the entry is still taken, and this is the sentence that gives it
      // back (`lapsed.ts`). Nothing is released for it — a cloud session's
      // live claim looks exactly like this from a local checkout.
      const gone = held ? lapsed(item, known, today, trunkRef()) : undefined;
      if (gone) console.log(`    ${lapsedLine(item, gone)}`);
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
    // The three reasons `next` steps past a free entry, counted (`skipped.ts`).
    for (const line of skipLines(free, items)) console.log(line);
    console.log("`bun run queue next` hands the first free one to a session of its own,");
    console.log("`bun run queue take <n>` marks one ongoing without opening a lane,");
    console.log('and `bun run queue done "<title>"` takes it out — by name, never by number.');
  }
  const problems = problemsIn(items);
  if (problems.length > 0) {
    console.log("\nEntries a cold session could not act on:");
    for (const p of problems) console.log(`  - ${p}`);
  }
}
