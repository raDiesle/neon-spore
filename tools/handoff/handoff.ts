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
  /** Titles in `docs/parked.md`: work identified and postponed, in its words. */
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
 * The follow-ups, in the words they were written in.
 *
 * A count would be the wrong thing here. "1 parked idea" tells the reader that
 * a file exists, which they knew; the title tells them whether it is worth a
 * session, which is the only question they are asking at this point in a turn.
 *
 * What is deliberately *not* here is the outstanding `Check:` list. Something
 * always wants an eye — that is what a sandbox leaves behind every time it
 * runs — so a row saying so carries no information from one turn to the next,
 * and a row that is always there is read as furniture. `bun run checks` is the
 * place for it, at the machine that can do the looking.
 */
export function followUps(h: Handoff): string[] {
  return h.parked.slice(0, SHOWN);
}

const SHOWN = 6;

export function render(h: Handoff): string {
  const held = blocking(h);
  const head =
    held.length === 0
      ? "✅ NOTHING WAITING — main has this, and no answer is owed"
      : `⚑ YOUR MOVE — ${held.join(", ")}`;

  const lines = [RULE, ` ${head}`, RULE];
  const row = (label: string, text: string) => lines.push(`  ${label.padEnd(8)} ${text}`);

  for (const ask of h.asks) row("ask", ask);

  // Always against `origin/main` by name, never "on main". A landing is only
  // worth anything if it is the one the next clone will see, and a local
  // trunk five commits ahead of origin reads as done and is not.
  if (h.landed) {
    const how = `every commit of ${h.branch} is on origin/main`;
    row("landed", h.offline ? `${how} — as of the last fetch, origin unreachable` : how);
  } else {
    row("landed", `NO — ${h.branch} is ${h.ahead} commit(s) ahead of origin/main`);
  }

  if (h.dirty.length > 0) row("dirty", h.dirty.slice(0, 4).join(", ") + tail(h.dirty, 4));
  if (h.green !== null) row("check", h.green ? "bun run check green" : "bun run check RED");

  if (!h.pushed && h.branch !== "main") row("origin", `${h.branch} is not pushed`);

  const follow = followUps(h);
  for (const idea of follow) row("parked", idea);
  if (h.parked.length > follow.length) {
    row("parked", `and ${h.parked.length - follow.length} more — docs/parked.md`);
  }
  if (follow.length === 0) row("parked", "nothing postponed");

  return lines.join("\n");
}

function tail(list: readonly string[], shown: number): string {
  return list.length > shown ? ` and ${list.length - shown} more` : "";
}
