/**
 * The backlog: everything the design has agreed to and the game does not have,
 * arranged by what it would become rather than by which file it was written in.
 *
 * The panels this replaces were shaped like the spec's directory — one tab per
 * file, built and unbuilt mixed in each. That is the wrong axis for the one
 * question the page exists to answer: *what is there left to build, and what
 * could it be made of.* So a creature idea sits with the creatures whether it
 * was written in `bestiary.md` or in `ideas.md`, and anything the simulation
 * already has is not here at all — see the brush palette and TUNING's ship cards.
 *
 * Nothing is classified twice. Which section an idea belongs to is a `###`
 * heading in `docs/spec/ideas.md`, so moving one is an edit to the spec.
 */

import { fromIdeas } from "./backlog-ideas.js";
import { type Concept, type Idea, parseConcepts } from "./concepts.js";
import type { PlainRow } from "./plain-words.js";

export interface BacklogEntry {
  name: string;
  /** "Form" for a creature, "Pillar", an act number, or a section's own tail. */
  kind: string;
  note: string;
  detail: string;
  ref: string;
  /**
   * What it does, what each seat does about it and what is left to decide —
   * the spec's own "In plain words" rows (`plain-words.ts`). Absent on an
   * entry nobody has written one for, and on every idea group, whose entries
   * are a worked-out paragraph already.
   */
  plain?: PlainRow[];
}

export interface BacklogGroup {
  title: string;
  /** Where the group comes from and what it means, one line. */
  note: string;
  entries: BacklogEntry[];
  /** How many entries were left out because the simulation already has them. */
  builtHidden: number;
  /** Where a built one went, for the sentence that says so: a creature is in
   * the brush palette, a boss is a wave. Omitted, it is the palette. */
  builtWhere?: string;
  /**
   * Read rather than scanned: one column at prose width, and every entry's
   * argument open on the page instead of behind an expander. For the groups
   * whose entries *are* paragraphs — an argued-out design is several sentences,
   * and a grid of collapsed headings is the one shape it cannot be read in.
   */
  reading?: boolean;
}

export interface Backlog {
  /** Rules the field plays by, what would fall, and what a player's hands
   * would do — one page. */
  mechanics: BacklogGroup[];
  // BOSSES was a page until 16 September 2026, when the owner took the tab
  // off: *its not relevant for me any longer*. It held THE ACT ORDER — the
  // built bosses read straight off `bosses.md` — and the boss and round
  // ideas, and the boss ideas had gone the day before with THE SPLICE. The
  // roster is still parsed, by the two tests that hold a drawn shape to the
  // name it was drawn at (`concept-art.test.ts`, `scenes.test.ts`); nothing
  // draws it. The `### Rounds` ideas stay in `ideas.md` as text.
  // DESIGNS was a third page until 12 September 2026: `docs/versus.md`,
  // `teaching.md` and `alive.md` read section by section as backlog. The
  // owner took it off — VERSUS is built and its file is a manual now, THE
  // CALL is one design and not a list, and `alive.md`'s numbers had been
  // overtaken — so what of those three is still unbuilt is an entry under
  // MECHANIC IDEAS in `ideas.md`, pointing at the file.
}

/**
 * "Deliberately deferred" in `ideas.md` — set aside with the objection or the
 * reason written out, so the same idea is not proposed twice.
 *
 * This used to be split in two, refused from merely deferred, because a PARKED
 * tab stood them side by side and a reader had to tell them apart. That tab is
 * gone and the section is down to entries that are genuinely deferred, so one
 * group is the honest shape — and it stays reachable, because a draft shape can
 * be drawn at one of these and an unreachable name orphans the drawing.
 */
function deferredGroup(deferred: Idea[]): BacklogGroup {
  return {
    title: "SET ASIDE IN THE SPEC",
    note: "deferred with the reason written out — ideas.md",
    builtHidden: 0,
    entries: deferred.map((i) => ({
      name: i.name,
      kind: "",
      note: i.note,
      detail: "",
      ref: i.ref,
    })),
  };
}

// Whether a section's heading tail claims the thing exists. Not a string
// equality test — "built", but also "the pod, built" — and "not built" /
// "partly built" are ruled out first, since they contain the word but mean
// its opposite.
function claimsBuilt(tail: string): boolean {
  const t = tail.toLowerCase();
  if (t.includes("not built") || t.includes("partly built")) return false;
  return /\bbuilt\b/.test(t);
}

// A section counts as backlog unless its heading claims it exists — which
// keeps "partly built", a system half in the game with work left.
function fromConcepts(title: string, note: string, concepts: Concept[]): BacklogGroup {
  const open = concepts.filter((c) => !claimsBuilt(c.status));
  return {
    title,
    note,
    builtHidden: concepts.length - open.length,
    entries: open.map((c) => ({
      name: c.name,
      kind: c.status,
      note: c.note,
      detail: c.detail,
      ref: c.ref,
    })),
  };
}

export function buildBacklog(
  couplings: string,
  assists: string,
  systems: string,
  ideas: string,
): Backlog {
  const sheet = parseConcepts(couplings, assists, systems, ideas);

  return {
    // The controls used to be a tab of their own, holding two idea groups. A
    // control is a rule the field plays by that happens to live in a hand, and
    // two groups is not a page — so they read on down this one. The creature
    // ideas arrived the same way on 11 September 2026, when the owner took the
    // BESTIARY tab off: every row of `bestiary.md` 10.1 and 10.2 is built, and
    // one group of ideas is not a page either. A creature here is a rule that
    // falls — what it makes the pair say is the whole of it — and the contour
    // drawn for each stands on GRAPHICS, joined by the draft's `suggests`.
    mechanics: [
      fromConcepts("COUPLINGS", "the patterns everything else follows from", sheet.couplings),
      fromConcepts("ASSIST FORMS", "how the pair cushions a difference in ability", sheet.assists),
      fromConcepts("SYSTEMS", "the rules the field plays by", sheet.systems),
      fromIdeas(
        "CREATURE IDEAS",
        "what would fall, accepted in principle and not worked out — ideas.md; the shape drawn for each is on GRAPHICS",
        sheet,
        "Creatures",
      ),
      fromIdeas("MECHANIC IDEAS", "accepted in principle, not worked out", sheet, "Mechanics"),
      fromIdeas(
        "CONTROL IDEAS",
        "what a player's own hands would do differently — ideas.md",
        sheet,
        "Controls",
      ),
      fromIdeas(
        "WEAPON IDEAS",
        "what the cannon fires, never how it is aimed — ideas.md",
        sheet,
        "Weapons",
      ),
      deferredGroup(sheet.deferred),
    ],
  };
}
