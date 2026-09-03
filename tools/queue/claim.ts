/**
 * Who is already working on a queue item.
 *
 * The claim is a branch, not a mark in the file. A mark would have to be
 * committed to be seen by anybody, and the session that took the item has not
 * committed anything yet — so the moment the mark is useful is the moment it
 * does not exist. Worktrees of one repository share their refs, so a branch
 * created by one lane is visible to the next `bun run queue` immediately, with
 * no commit and no push. And `bun run land` deletes the branch, which releases
 * the claim exactly when the work reaches `main` rather than a step early or a
 * step late.
 *
 * The limit, said out loud: a cloud session works in its own clone, so its
 * claim is not visible here until it pushes. Two at once is the ceiling
 * anyway, and locally the ceiling is what this enforces.
 */

import type { Item } from "./queue.js";

const PREFIX = "claude/queue-";

/** A title, as a branch-safe name. Stable, so the same item always claims the same branch. */
export function slugFor(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
  return slug || "item";
}

/** The branch that means "somebody is on this". */
export function branchFor(item: Item): string {
  return `${PREFIX}${slugFor(item.title)}`;
}

/**
 * Whether a branch name is a claim on some queue item, whichever item that is.
 *
 * `bun run land` needs this and cannot get it from `branchFor`, which wants the
 * item: the sweep is looking at a list of branch names with no queue in hand.
 * It asks here rather than spelling the prefix out again, because a claim that
 * the sweep does not recognise is a claim the sweep deletes — which is what it
 * did on 3 September 2026, to two sessions at once.
 */
export function isClaimBranch(name: string): boolean {
  return name.startsWith(PREFIX);
}

/** `origin/claude/queue-x` and `claude/queue-x` are the same claim. */
function bare(ref: string): string {
  return ref.startsWith("origin/") ? ref.slice("origin/".length) : ref;
}

/** The branch holding this item, if one does. */
export function claimOn(item: Item, refs: readonly string[]): string | undefined {
  const branch = branchFor(item);
  return refs.some((r) => bare(r.trim()) === branch) ? branch : undefined;
}

/** The items nobody has taken, in queue order. */
export function unclaimed(items: readonly Item[], refs: readonly string[]): Item[] {
  return items.filter((i) => claimOn(i, refs) === undefined);
}

/** An item somebody is on, and the branch saying so. */
export interface Ongoing {
  readonly item: Item;
  readonly branch: string;
}

/**
 * Whether anything is being worked on right now, in the three states worth
 * telling apart. `busy` is the one that matters: it is the answer to "is the
 * queue still moving", which is a question asked of a machine that is about to
 * be turned off, and it has to be answerable without reading a list.
 */
export interface Status {
  readonly state: "done" | "idle" | "busy";
  readonly ongoing: readonly Ongoing[];
  /** Items nobody has taken. */
  readonly waiting: number;
}

export function statusOf(items: readonly Item[], refs: readonly string[]): Status {
  const ongoing: Ongoing[] = [];
  for (const item of items) {
    const branch = claimOn(item, refs);
    if (branch) ongoing.push({ item, branch });
  }
  const waiting = items.length - ongoing.length;
  const state = items.length === 0 ? "done" : ongoing.length > 0 ? "busy" : "idle";
  return { state, ongoing, waiting };
}

/**
 * The status as lines, the word that answers first. A session told "shut the
 * machine down once the queue is finished" reads one word and counts nothing:
 * DONE is nothing left at all, IDLE is nothing in flight, BUSY is somebody
 * still on something.
 */
export function statusLines(status: Status): string[] {
  if (status.state === "done") {
    return ["DONE — the queue is empty and nothing is being worked on."];
  }
  const rest = `${status.waiting} waiting.`;
  if (status.state === "idle") {
    return ["IDLE — nothing is being worked on.", `       ${rest}`];
  }
  const n = status.ongoing.length;
  return [
    `BUSY — ${n} ${n === 1 ? "item is" : "items are"} being worked on:`,
    ...status.ongoing.map((o) => `       ${o.item.title} — ${o.branch}`),
    `       ${rest}`,
  ];
}

/**
 * The prompt a fresh session is opened with. Copy-pasteable and cold-readable:
 * it names the branch that was already created for it, so the session checks
 * that branch out rather than inventing a name the queue cannot recognise.
 */
export function promptFor(item: Item, branch: string): string {
  const from = item.source === "parked" ? "docs/parked.md" : "docs/queue.md";
  const tree = branch.replace(/^claude\//, "");
  return [
    `Work this item on Neon Spore. It is a technical improvement, not a look —`,
    `it lands on main like any refactor. Read CLAUDE.md first.`,
    "",
    `The branch is already made and is your claim on the item — check it out in`,
    `its own worktree, do not make another:`,
    "",
    `    git worktree add .claude/worktrees/${tree} ${branch}`,
    "",
    `then \`bun install\` from inside that tree (.claude/skills/lane says why).`,
    "",
    `## ${item.title}`,
    "",
    item.body,
    "",
    `When it is green: bun run check, commit, land. Remove the entry from`,
    `${from} in the same commit — \`bun run queue done "${item.title}"\`.`,
    `Landing deletes the branch, which is what releases the item.`,
    `If it turns out to be bigger than one session, leave what you finished`,
    `committed and rewrite the entry to say what is left.`,
  ].join("\n");
}
