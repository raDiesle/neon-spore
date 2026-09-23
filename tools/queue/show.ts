/**
 * `bun run queue show <n|title>` — the prompt `next` prints, and nothing else.
 *
 * `next` prints a prompt longer than a tool call's output, and the obvious way
 * to read the rest was to run it again and page it — which claims the *next*
 * free item, writes its `Taken:` line on `main` and pushes it, before a word
 * of either has been read. A lane did exactly that on 23 September 2026 and
 * had to `release` the second one: two commits on `origin/main` for nothing.
 *
 * So the prompt has a reader that claims nothing. It is built by the same
 * `briefFor` `next` uses, so the two cannot drift, and it asks nothing of the
 * repository but its refs and the trunk's log — no branch, no mark, no push.
 * A position is fine here, unlike for `done`: a stale number shows the wrong
 * entry's words, and the title at the top of them says so.
 */

import { branchFor, claimOn } from "./claim.js";
import { workedBranch } from "./mark.js";
import { blockedBy } from "./needs.js";
import { promptFor } from "./prompt.js";
import type { Item } from "./queue.js";
import { mainCheckout, trunkRef, trunkView } from "./repo.js";
import { staleLine, staleness } from "./stale.js";

/** The whole brief for one item on one branch, as `next` hands it out. */
export function briefFor(item: Item, branch: string, items: readonly Item[]): string {
  return promptFor(item, branch, {
    stale: staleLine(staleness(item, trunkView()), trunkRef()),
    needs: blockedBy(item, items)?.title,
    home: mainCheckout(),
  });
}

/**
 * The brief for an item whether or not anybody holds it. A held item names the
 * branch its mark says is being worked; a free one names the branch a claim
 * would make, under a line saying it has not been made.
 */
export function showItem(item: Item, items: readonly Item[], known: readonly string[]): string {
  const held = claimOn(item, known);
  const branch = (held && workedBranch(item.taken || "")) || branchFor(item);
  const note = held
    ? `(Held — ${held}. \`show\` claimed nothing.)`
    : "(Free. `show` claimed nothing and made no branch: `bun run queue take` does both.)";
  return `${note}\n\n${briefFor(item, branch, items)}`;
}
