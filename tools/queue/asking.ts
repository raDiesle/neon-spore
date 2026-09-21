import type { Item } from "./queue.js";

/**
 * Whether an entry is still waiting on the owner, and what the listing says
 * about it.
 *
 * `- **Asks:** <question?>` has always been two different things wearing one
 * line. In most entries the question is a side question over decided work in
 * named files, and a session can start the moment it picks the entry up. In a
 * few the ask **is** what is left: *THE THROAT's three hand sounds have never
 * been heard by an ear* says in its own body that everything a machine can
 * settle is settled and what remains is three presses by an ear. `bun run
 * queue next` handed that one out, it was released, and `next` handed out the
 * same entry again — release puts it back where it was and `next` reads from
 * the top — so a session following *continue to work on the queue* could not
 * get past it without knowing `queue take` exists. Three sessions in a row
 * picked it up.
 *
 * The owner chose the cheaper of the two fixes on 21 September 2026: **`next`
 * skips an ask with no answer under it**, and hands out every other entry. No
 * new field marking an ask as blocking — the file already records answers, on
 * an `- **Answered:**` line three entries were carrying before anything read
 * them — and no entry lost, because an ask that has been answered is decided
 * work like any other and goes back into the rotation by itself.
 *
 * **Only the automatic pick skips.** `queue take <title>`, and `next <n>`
 * naming one, hand a waiting entry over as before: a session *can* act on an
 * unanswered ask — putting the question to the owner is the entry's own first
 * step — and this is not `where.ts`, where the refusal is that the machine
 * cannot do the work at all.
 */

const ANSWERED = /^-\s+\*\*Answered:\*\*\s+(\S.*)$/;

/**
 * The answer standing over the entry, or "" while there is none.
 *
 * **The last line wins.** A re-ask appends rather than overwrites: THE SCOUT's
 * entry carries an answer given against an option the geometry did not allow
 * and, under it, the one that replaced it. Both are kept — what was decided
 * first and why it did not hold is half of what the next session needs — so
 * reading the first would hand that session the answer its own entry says not
 * to build.
 */
export function answerTo(item: Item): string {
  let last = "";
  for (const line of item.body.split("\n")) {
    const m = ANSWERED.exec(line.trim());
    if (m?.[1] !== undefined) last = m[1];
  }
  return last;
}

/** Whether the entry's question is still the owner's to answer. */
export function waiting(item: Item): boolean {
  return item.asks !== "" && answerTo(item) === "";
}

/**
 * The listing's mark. It goes on the title line rather than under it, so a
 * question three lines down is a question found by whoever was already
 * reading — and it says `ASKS THE OWNER` only while that is true, because a
 * mark on every entry that ever asked anything is a mark the owner learns to
 * scroll past.
 */
export function asksTag(item: Item): string {
  if (!item.asks) return "";
  return waiting(item) ? " — ASKS THE OWNER" : " — ANSWERED";
}
