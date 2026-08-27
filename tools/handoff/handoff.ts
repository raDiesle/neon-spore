/**
 * The last thing a session prints: whether the human still owes it anything.
 *
 * A report is prose, and prose is where "I landed it" and "I meant to land it"
 * look identical on a phone. So the closing block is not written, it is
 * derived — from git, from the `Check:` trailers and from `docs/parked.md` —
 * and the only part a session gets to author is the question it is asking.
 *
 * Pure on purpose, the same reason `tools/checks/checks.ts` is: the shape of
 * the block is the thing worth testing, and it should not need a repository.
 */

export interface Handoff {
  /** The branch the work was done on. `main` when it was done on the trunk. */
  branch: string;
  /** Every commit of this session's is on `origin/main`. */
  landed: boolean;
  /** How far ahead of `origin/main` the branch still is, when it is not. */
  ahead: number;
  /** The branch itself is on origin, so somebody else's clone can see it. */
  pushed: boolean;
  /** Paths `git status --porcelain` still names. */
  dirty: string[];
  /** `bun run check` was run and passed. `null` when it was not run. */
  green: boolean | null;
  /** Questions this session needs answered before it can go further. */
  asks: string[];
  /** Outstanding `Check:` trailers on main — things wanting an eye here. */
  waiting: number;
  /** Titles in `docs/parked.md`: optional, nobody's obligation. */
  parked: string[];
  /** origin could not be reached, so `landed` is about the last fetch. */
  offline: boolean;
}

const RULE = "─".repeat(58);

/** What is genuinely holding the human up, in the order it should be read. */
export function blocking(h: Handoff): string[] {
  const held: string[] = [];
  if (h.asks.length === 1) held.push("1 question");
  if (h.asks.length > 1) held.push(`${h.asks.length} questions`);
  if (h.dirty.length > 0) held.push(`${h.dirty.length} file(s) never committed`);
  if (!h.landed) held.push(h.ahead > 0 ? `${h.ahead} commit(s) not on main` : "nothing landed");
  if (h.green === false) held.push("the tree is red");
  return held;
}

/**
 * A check waiting for an eye is not a block and must never be drawn as one.
 * It is work the sandbox was never able to do, offered to a machine that can —
 * and a session that ends every turn shouting would be read as ending none of
 * them cleanly.
 */
export function optional(h: Handoff): string[] {
  const spare: string[] = [];
  if (h.waiting > 0) spare.push(`${h.waiting} thing(s) on main want an eye — bun run checks`);
  if (h.parked.length > 0) {
    spare.push(`${h.parked.length} parked idea(s) — docs/parked.md`);
  }
  if (!h.pushed && h.branch !== "main") spare.push(`${h.branch} is not on origin`);
  return spare;
}

export function render(h: Handoff): string {
  const held = blocking(h);
  const head =
    held.length === 0
      ? "✅ NOTHING WAITING — main has this, and no answer is owed"
      : `⚑ YOUR MOVE — ${held.join(", ")}`;

  const lines = [RULE, ` ${head}`, RULE];
  const row = (label: string, text: string) => lines.push(`  ${label.padEnd(8)} ${text}`);

  for (const ask of h.asks) row("ask", ask);

  if (h.landed) {
    const how = h.branch === "main" ? "on main" : `${h.branch} → origin/main, fast-forward`;
    row("landed", h.offline ? `${how} (as of the last fetch — origin unreachable)` : how);
  } else {
    row("landed", `no — ${h.branch} is ${h.ahead} commit(s) ahead of origin/main`);
  }

  if (h.dirty.length > 0) row("dirty", h.dirty.slice(0, 4).join(", ") + tail(h.dirty, 4));
  if (h.green !== null) row("check", h.green ? "bun run check green" : "bun run check RED");

  for (const line of optional(h)) row("optional", line);
  if (held.length === 0 && optional(h).length === 0) row("optional", "nothing — the desk is clear");

  return lines.join("\n");
}

function tail(list: readonly string[], shown: number): string {
  return list.length > shown ? ` and ${list.length - shown} more` : "";
}
