/**
 * Which kind of session is running the queue, and which items it may take.
 *
 * An item may carry `- **Where:** cloud` or `- **Where:** local`. Without the
 * line it is anybody's. With it, the listing says so on the title line, `next`
 * without an argument passes over it when it is the other kind's, and a
 * `next <n>` or `take <n>` naming it is refused with the reason — the item was
 * kept for the other kind of machine on purpose, and a session that takes it
 * anyway either cannot finish it (a wave to be watched at tempo, in a sandbox
 * with no screen) or was not the session the owner meant to spend on it.
 *
 * A cloud session is known by `CLAUDE_CODE_REMOTE`, the same signal
 * `tools/hooks/session-start.ts` reads to decide whether to pin a bun; nothing
 * else in the tree tells the two apart, and a second signal would be a second
 * thing to keep in step.
 */

import type { Item, Where } from "./queue.js";

/** The two kinds of session an item can be reserved for. */
export type Kind = Exclude<Where, "anywhere">;

/** The kind of session this process is: `cloud` on the web image, `local` on a checkout. */
export function sessionKind(env: NodeJS.ProcessEnv = process.env): Kind {
  return env.CLAUDE_CODE_REMOTE === "true" ? "cloud" : "local";
}

/** Whether a session of this kind may take the item. */
export function fits(item: Item, kind: Kind): boolean {
  return item.where === "anywhere" || item.where === kind;
}

/** The listing's mark for a reserved item, or "" for one anybody may take. */
export function reservedTag(item: Item): string {
  return item.where === "anywhere" ? "" : ` — ${item.where.toUpperCase()} ONLY`;
}

/**
 * Throws when the item is reserved for the other kind of session, saying which
 * kind this is so the message reads as a fact about the machine rather than a
 * fault in the command.
 */
export function refuseUnlessFits(item: Item, kind: Kind): void {
  if (fits(item, kind)) return;
  throw new Error(
    `${JSON.stringify(item.title)} is reserved for a ${item.where} session, and this is a ` +
      `${kind} one — its Where: line says so. Take another, or move the line if it is wrong.`,
  );
}
