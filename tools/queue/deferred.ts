import type { Item } from "./queue.js";

/**
 * **Whether the owner has put an entry on hold**, by a `- **Deferred:**` line
 * under it.
 *
 * The owner narrowed scope on 26 September 2026 — new graphics stay on THE
 * INSTAR — and ten entries were kept rather than deleted, each titled
 * `DEFERRED — …` with the line saying why. `bun run queue next` read neither
 * and handed one out to a session told to *continue with the queue*; the
 * entry's own body said not to work it. So the automatic pick passes over a
 * deferred entry the way it passes over an unanswered ask (`asking.ts`), and
 * `take <title>` still hands one over to a session that means it.
 *
 * The line and not the title, because the line is the record: it carries the
 * date and the reason, and an entry taken up again loses it in the same edit
 * that says so.
 */

const DEFERRED = /^-\s+\*\*Deferred:\*\*/;

export function deferred(item: Item): boolean {
  return item.body.split("\n").some((line) => DEFERRED.test(line.trim()));
}
