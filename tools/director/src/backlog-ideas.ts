import type { BacklogEntry, BacklogGroup } from "./backlog.js";
import type { ConceptSheet, Idea } from "./concepts.js";
import { isBuilt } from "./roster.js";

/**
 * The "accepted in principle, not worked out" half of the backlog — split out
 * of `backlog.ts` on line count, the way `boss-cycles.ts` sits beside `boss.ts`.
 */

function toIdeaEntry(i: Idea): BacklogEntry {
  return { name: i.name, kind: "idea", note: i.note, detail: "", ref: i.ref };
}

export function fromIdeas(
  title: string,
  note: string,
  sheet: ConceptSheet,
  group: string,
): BacklogGroup {
  const rows = sheet.ideas.filter((i) => i.group === group);
  return { title, note, builtHidden: 0, entries: rows.map(toIdeaEntry) };
}

/**
 * A group, minus whatever `isBuilt` already covers by name. Only the rounds
 * ask for this: THE GAUGE ends in `gauge`, in `BOSS_KINDS`. The other idea
 * groups stay as `fromIdeas` leaves them; a boss idea's bullet is cut by hand
 * once the boss exists (THE VANE's was, 12 September 2026), and the shape
 * drawn for it is joined to the act order's row instead (`concept-art.test.ts`).
 */
export function dropBuilt(group: BacklogGroup): BacklogGroup {
  const open = group.entries.filter((e) => !isBuilt(e.name));
  return { ...group, builtHidden: group.entries.length - open.length, entries: open };
}
