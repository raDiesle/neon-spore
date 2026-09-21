import type { Item } from "./queue.js";

/**
 * Whether an entry is waiting on **another entry**, and what the listing says
 * about it.
 *
 * The third of three reasons `bun run queue next` passes an item over, and the
 * two beside it say what this one is not. `where.ts` refuses: the machine
 * asking cannot do that work at all, and no amount of waiting will change it.
 * `asking.ts` passes over: the work is decided and the owner has not said the
 * sentence it turns on. Neither can say **this one is fine, but not yet** —
 * the work is decided, this machine can do it, and something that has to
 * exist first does not.
 *
 * It was `next` handing out *THE GIMBAL's picture has never been drawn* on 21
 * September 2026 that made the field. That entry opens with the words *lane
 * two of §18, once lane one lands*, and the entry above it closes with *do not
 * start it here* — two sentences addressed to a reader, which `next` is not.
 * It was handed to a local session with no `gimbal` anywhere in `packages`,
 * nothing to draw a pose against, and no wave to put it in; and lane one is
 * reserved `CLOUD ONLY`, so the kind of session `next` keeps offering the
 * picture to is exactly the kind that can never unblock it.
 *
 * **The dependency dissolves itself.** The line names a title rather than a
 * position or an id, and `queue done` takes the prerequisite out of the file
 * when it lands — so nothing matches the line any more, the blocked entry is
 * ordinary again, and no second session has to remember to come back and
 * delete something. Which is also why a misspelt title **fails open** and is
 * not reported by `problems.ts`: a name matching nothing is indistinguishable
 * from a prerequisite that has just landed, and the two have to read the same.
 */

const NEEDS = /^-\s+\*\*Needs:\*\*\s+(\S.*)$/;

/** The `Needs:` line's text, or "" when the entry waits on nothing. */
export function needOf(item: Item): string {
  for (const line of item.body.split("\n")) {
    const m = NEEDS.exec(line.trim());
    if (m?.[1] !== undefined) return m[1].replace(/`/g, "").trim();
  }
  return "";
}

/**
 * The entry this one is waiting on, or undefined when it waits on nothing that
 * is still in the file.
 *
 * Matched the way `pick` matches a title — case-insensitively, on a substring —
 * so a `Needs:` line can quote the prerequisite's own words without being held
 * to its punctuation. An entry naming itself is nobody's blocker: it would wait
 * forever, and the shape it comes in is a copied heading.
 */
export function blockedBy(item: Item, items: readonly Item[]): Item | undefined {
  const need = needOf(item).toLowerCase();
  if (!need) return undefined;
  return items.find((i) => i !== item && i.title.toLowerCase().includes(need));
}

/** Whether the automatic pick should pass this one over. */
export function blocked(item: Item, items: readonly Item[]): boolean {
  return blockedBy(item, items) !== undefined;
}

/**
 * The listing's mark, naming what is in the way. The title of the blocker
 * rather than the word `BLOCKED` alone: the owner reads this list to decide
 * what to hand out, and *waits on THE GIMBAL is written and nobody has built
 * its simulation* tells him which of the two to give a cloud session.
 */
export function needsTag(item: Item, items: readonly Item[]): string {
  const on = blockedBy(item, items);
  return on ? ` — WAITS ON ${JSON.stringify(on.title)}` : "";
}
