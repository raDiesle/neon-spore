import { waiting } from "./asking.js";
import { blocked } from "./needs.js";
import type { Item } from "./queue.js";
import { offered } from "./where.js";

/**
 * **Why `next` stepped past a free entry**, counted for the listing's foot.
 *
 * Three reasons, and they are three files: an unanswered ask is the owner's
 * (`asking.ts`), an entry waiting on another one comes back by itself when
 * that one lands (`needs.ts`), and an entry needing hardware is nobody's until
 * somebody picks up a phone (`where.ts`). Each is counted separately because
 * each is a different person's move, and the only one addressed to the owner
 * is the first — the others are there so a session reading "96 free" and being
 * handed nothing can see where the ninety-six went.
 *
 * Here rather than in `run.ts` because that file reached 251 lines the day the
 * third reason was added, and a fourth would be a fourth block of the same
 * four lines. The counting is the same shape every time; the sentence is not.
 */
export function skipLines(free: readonly Item[], items: readonly Item[]): string[] {
  const lines: string[] = [];
  const asking = free.filter(waiting).length;
  if (asking > 0) {
    lines.push(`${asking} of the free ones wait on your answer; \`next\` passes over them.`);
  }
  const onHold = free.filter((i) => blocked(i, items)).length;
  if (onHold > 0) {
    lines.push(`${onHold} of the free ones wait on another entry; they come back when it lands.`);
  }
  const hardware = free.filter((i) => !offered(i)).length;
  if (hardware > 0) {
    lines.push(
      `${hardware} of the free ones need a phone in your hand; \`next\` passes over them, ` +
        `\`take "<title>"\` does not.`,
    );
  }
  return lines;
}
