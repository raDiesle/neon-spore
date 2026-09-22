/**
 * Which kind of session is running the queue, which items it may take, and
 * which ones `next` hands out unasked.
 *
 * An item may carry `- **Where:** local`. Without the line it is anybody's.
 * With it, the listing says `LOCAL ONLY` on the title line, `next` without an
 * argument passes over it on a cloud session, and a `next <n>` or `take <n>`
 * naming it there is refused with the reason — a sandbox with no screen cannot
 * finish a wave that has to be watched at tempo or a shape that has to be seen
 * to move, and a green check on it would be a claim about something nobody
 * looked at.
 *
 * **`phone` is the same fact one notch narrower, and it is not about the kind
 * of session at all.** An entry needing hardware — a real phone browser's own
 * chrome, a thumb on glass, a device that can be held up to the light — cannot
 * be finished by *any* agent, local or cloud, and `next` picked one five times
 * in a single sitting on 22 September 2026 because nothing in the file said
 * so. Five claims, five give-backs, five commits on the trunk that say
 * nothing. So `phone` is skipped by the automatic pick on every machine, and
 * that is the whole of the difference: **a caller who names the entry still
 * gets it**, by title or by number, exactly as `asking.ts` lets a named ask
 * through the skip it makes for the same reason. The owner has the hardware
 * and asks for these by name; nobody else ever should.
 *
 * A `phone` entry is still a local one for the purpose of the other half —
 * the hardware is beside a checkout and never beside a sandbox — so a cloud
 * session naming it is refused the way a `local` one is, with its own reason.
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

/**
 * Whether a session of this kind may take the item **when it names it**.
 *
 * `phone` answers here the way `local` does, because the hardware is beside a
 * checkout: a sandbox naming one is refused. What `phone` does *not* do here
 * is keep itself from the machine that could do it — that is `offered`.
 */
export function fits(item: Item, kind: Kind): boolean {
  return item.where === "anywhere" || kind === "local";
}

/**
 * Whether `next` with no argument may hand this item out unasked.
 *
 * The automatic pick is the only thing that steps over a `phone` entry, and
 * `next <n>` and `take` do not consult this at all. An entry nobody can finish
 * is not an entry nobody may have: it is the owner's, and he asks for it in
 * words.
 */
export function offered(item: Item): boolean {
  return item.where !== "phone";
}

/** The listing's mark for a reserved item, or "" for one anybody may take. */
export function reservedTag(item: Item): string {
  if (item.where === "phone") return " — PHONE ONLY";
  return item.where === "local" ? " — LOCAL ONLY" : "";
}

/**
 * Throws when the item is reserved for the other kind of session, saying which
 * kind this is so the message reads as a fact about the machine rather than a
 * fault in the command.
 */
export function refuseUnlessFits(item: Item, kind: Kind): void {
  if (fits(item, kind)) return;
  const need =
    item.where === "phone"
      ? "needs a phone in somebody's hand, which no sandbox is near"
      : "is reserved for a local session";
  throw new Error(
    `${JSON.stringify(item.title)} ${need}, and this is a ${kind} one — its Where: ` +
      `line says so. Take another, or move the line if it is wrong.`,
  );
}
