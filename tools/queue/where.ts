/**
 * Which kind of session is running the queue, and which items it may take.
 *
 * An item may carry `- **Where:** local`. Without the line it is anybody's.
 * With it, the listing says `LOCAL ONLY` on the title line, `next` without an
 * argument passes over it on a cloud session, and a `next <n>` or `take <n>`
 * naming it there is refused with the reason — a sandbox with no screen cannot
 * finish a wave that has to be watched at tempo or a shape that has to be seen
 * to move, and a green check on it would be a claim about something nobody
 * looked at.
 *
 * **There was a `phone` value, and there is not now.** From 22 September
 * 2026 it marked an entry needing a device in a hand, which the automatic
 * pick stepped over on every machine after `next` had handed one out five
 * times in one sitting. On 27 September such a check stopped being a queue
 * entry: it is the owner's regression pass, `bun run land --unverified`
 * leaves it out (`splitUnverified`), and a `Where: phone` line is reported by
 * `problems.ts` so a hand-written one is caught rather than read.
 *
 * **There is no reservation the other way round.** There was until 21
 * September 2026, when the owner took it out: *"please remove cloud only. all
 * cloud only also local can and should take"*. The asymmetry is the point —
 * `local` is a fact about the work, and `cloud` was a preference about which
 * machine he wanted spent that day. Spent as a refusal it left the session on
 * his own machine standing in front of forty entries it was perfectly able to
 * do, which is the opposite of what the field was added for.
 *
 * A cloud session is still known by `CLAUDE_CODE_REMOTE`, the same signal
 * `tools/hooks/session-start.ts` reads to decide whether to pin a bun; nothing
 * else in the tree tells the two apart, and a second signal would be a second
 * thing to keep in step.
 */

import type { Item } from "./queue.js";

/**
 * The two kinds of session. Not `Exclude<Where, "anywhere">` any more: an item
 * can only be reserved one way now, and a session is still one of two things.
 */
export type Kind = "cloud" | "local";

/** The kind of session this process is: `cloud` on the web image, `local` on a checkout. */
export function sessionKind(env: NodeJS.ProcessEnv = process.env): Kind {
  return env.CLAUDE_CODE_REMOTE === "true" ? "cloud" : "local";
}

/** Whether a session of this kind may take the item. */
export function fits(item: Item, kind: Kind): boolean {
  return item.where === "anywhere" || kind === "local";
}

/** The listing's mark for a reserved item, or "" for one anybody may take. */
export function reservedTag(item: Item): string {
  return item.where === "local" ? " — LOCAL ONLY" : "";
}

/**
 * Throws when the item is reserved for the other kind of session, saying which
 * kind this is so the message reads as a fact about the machine rather than a
 * fault in the command.
 */
export function refuseUnlessFits(item: Item, kind: Kind): void {
  if (fits(item, kind)) return;
  throw new Error(
    `${JSON.stringify(item.title)} is reserved for a local session, and this is a ${kind} one — its Where: ` +
      `line says so. Take another, or move the line if it is wrong.`,
  );
}
