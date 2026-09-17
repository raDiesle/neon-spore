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
 * One `###` group of `ideas.md`, whole: MECHANIC, CONTROL and WEAPON IDEAS
 * are all of them, because none of them is built at all.
 *
 * It took a shortlist once — the names the owner kept for CREATURE IDEAS on
 * 16 September 2026 — and that group left the page with its last name, the
 * Husk, on 17 September 2026 (`backlog.ts`). The `### Creatures` bullets stay
 * in `ideas.md` as text, and the shape drawn for each is on GRAPHICS.
 */
export function fromIdeas(
  title: string,
  note: string,
  sheet: ConceptSheet,
  group: string,
): BacklogGroup {
  const rows = sheet.ideas.filter((i) => i.group === group);
  return { title, note, builtHidden: 0, entries: rows.map(toIdeaEntry) };
}

// `dropBuilt` stood here until 16 September 2026: a group minus whatever
// `isBuilt` covers by name, asked for by ROUND IDEAS alone because THE GAUGE
// ends in `gauge`, in `BOSS_KINDS`. The owner took the BOSSES tab off and that
// was its only caller, so the belt goes with the page it was buckled to. The
// brace it stood beside is still the rule: a bullet describing something
// shipped is cut from `ideas.md` by hand, and nothing renders the rounds now.
