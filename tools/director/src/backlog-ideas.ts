import type { BacklogEntry, BacklogGroup } from "./backlog.js";
import type { ConceptSheet, Idea } from "./concepts.js";

/**
 * The "accepted in principle, not worked out" half of the backlog — split out
 * of `backlog.ts` on line count, the way `boss-cycles.ts` sits beside `boss.ts`.
 */

function toIdeaEntry(i: Idea): BacklogEntry {
  return { name: i.name, kind: "idea", note: i.note, detail: "", ref: i.ref };
}

/**
 * One `###` group of `ideas.md`, whole — or cut to `kept`, the shortlist the
 * owner named for CREATURE IDEAS on 16 September 2026 (`backlog.ts`).
 *
 * Optional rather than required, because it is the exception: MECHANIC,
 * CONTROL and WEAPON IDEAS are all of them, and a group that has to be handed
 * its own contents would make the ordinary case look like the odd one.
 */
export function fromIdeas(
  title: string,
  note: string,
  sheet: ConceptSheet,
  group: string,
  kept?: string[],
): BacklogGroup {
  const rows = sheet.ideas.filter(
    (i) => i.group === group && (kept === undefined || kept.includes(i.name)),
  );
  return { title, note, builtHidden: 0, entries: rows.map(toIdeaEntry) };
}

// `dropBuilt` stood here until 16 September 2026: a group minus whatever
// `isBuilt` covers by name, asked for by ROUND IDEAS alone because THE GAUGE
// ends in `gauge`, in `BOSS_KINDS`. The owner took the BOSSES tab off and that
// was its only caller, so the belt goes with the page it was buckled to. The
// brace it stood beside is still the rule: a bullet describing something
// shipped is cut from `ideas.md` by hand, and nothing renders the rounds now.
