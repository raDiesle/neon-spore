import type { BacklogEntry, BacklogGroup } from "./backlog.js";

/**
 * LOOKS WAITING FOR A YES — the first section of the BOSSES page, and the only
 * one that is a *menu* rather than a report.
 *
 * The owner, 20 September 2026: *"before automatically improving graphics
 * across waves of bosses of multiple bosses, I would like to opt-in or be
 * asked… not every boss I like to keep."* Twenty-four items in `docs/queue.md`
 * said a boss's picture had never been looked at, and a queue item is a thing
 * any lane may claim — so the list amounted to a standing instruction to spend
 * twenty-four sittings making bosses beautiful, some of which are going to be
 * cut. They moved to `docs/spec/boss-looks.md`, which no lane reads for work,
 * and this draws that file at the top of the page where he decides what the
 * next wave is for.
 *
 * **One entry per description, not per boss.** Twenty-three of them carried
 * word-for-word the same paragraph, and twenty-three copies of one sentence is
 * a page nobody reads to the bottom. The `**Bosses:**` line under each heading
 * is the list the description covers.
 *
 * Nothing here classifies anything, the way nothing in `backlog-bosses.ts`
 * does: the groups are the file's own `##` headings, so saying yes to a boss
 * is editing one line of the spec.
 */

/** Where a reader goes to see the whole of it, and where a lane edits it. */
const REF = "docs/spec/boss-looks.md";

/** The line under a heading that names which bosses the description covers. */
const BOSSES_RE = /^\*\*Bosses:\*\*\s*([\s\S]*?)(?:\n\n|$)/;

export function fromBossLooks(text: string): BacklogGroup {
  const entries: BacklogEntry[] = [];
  // Split on the file's own `##` headings and drop the preamble above the
  // first one — that is the page's own argument, and it is said in the group's
  // note rather than repeated as an entry.
  for (const section of text.split(/^## /m).slice(1)) {
    const cut = section.indexOf("\n");
    if (cut === -1) continue;
    const name = section.slice(0, cut).trim();
    const body = section.slice(cut + 1).trim();
    const found = BOSSES_RE.exec(body);
    const named = (found?.[1] ?? "").replace(/\s*\n\s*/g, " ").trim();
    const detail = found ? body.slice(found[0].length).trim() : body;
    entries.push({
      name,
      // The count, stamped where a boss entry's act number goes — it is the
      // one number somebody choosing between these actually weighs.
      kind: countOf(named),
      note: named,
      detail,
      ref: REF,
    });
  }
  return {
    title: "LOOKS WAITING FOR A YES",
    note: "nothing below is started until you name a boss — say one and a lane moves it into the queue.",
    entries,
    builtHidden: 0,
    builtWhere: "the game",
    // Read end to end to decide what is worth doing, which is the one thing an
    // expander per entry makes impossible.
    reading: true,
  };
}

/** "23 bosses", or "1 boss" — and nothing at all when the line is missing, so
 * a heading somebody forgot to list under does not claim a count of zero. */
function countOf(named: string): string {
  if (named === "") return "";
  const n = named.split(",").filter((part) => part.trim() !== "").length;
  return n === 1 ? "1 boss" : `${n} bosses`;
}
