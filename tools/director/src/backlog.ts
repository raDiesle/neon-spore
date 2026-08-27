/**
 * The backlog: everything the design has agreed to and the game does not have,
 * arranged by what it would become rather than by which file it was written in.
 *
 * The panels this replaces were shaped like the spec's directory — one tab per
 * file, built and unbuilt mixed in each. That is the wrong axis for the one
 * question the page exists to answer: *what is there left to build, and what
 * could it be made of.* So a creature idea sits with the creatures whether it
 * was written in `bestiary.md` or in `ideas.md`, a rule the field plays by sits
 * with the mechanics, and anything the simulation already has is not here at
 * all — that is what the brush palette and the SHIP tab are for.
 *
 * Nothing is classified twice. Which section an idea belongs to is a `###`
 * heading in `docs/spec/ideas.md`, so moving one is an edit to the spec.
 */

import { type Concept, type ConceptSheet, parseConcepts } from "./concepts.js";
import { type Planned, parseRoster } from "./roster.js";
import { sectionBody, sectionNamed } from "./sections.js";

export interface BacklogEntry {
  name: string;
  /** "Form" for a creature, "Pillar", an act number, or a section's own tail. */
  kind: string;
  note: string;
  detail: string;
  ref: string;
}

export interface BacklogGroup {
  title: string;
  /** Where the group comes from and what it means, one line. */
  note: string;
  entries: BacklogEntry[];
  /** How many entries were left out because the simulation already has them. */
  builtHidden: number;
}

export interface Backlog {
  bestiary: BacklogGroup[];
  mechanics: BacklogGroup[];
  controls: BacklogGroup[];
  bosses: BacklogGroup[];
  parked: BacklogGroup[];
}

/** A built entry is not backlog. It is in the brush palette, or on the field. */
function unbuilt(rows: Planned[]): BacklogEntry[] {
  return rows.filter((r) => !r.built).map(({ built: _built, ...rest }) => rest);
}

function fromRoster(title: string, note: string, rows: Planned[]): BacklogGroup {
  return {
    title,
    note,
    entries: unbuilt(rows),
    builtHidden: rows.filter((r) => r.built).length,
  };
}

/**
 * Whether a section's heading tail claims the thing exists.
 *
 * Not a string equality test, because the spec does not write the tail the
 * same way twice: "built", but also "the pod, built" and "keep watch, built".
 * Those two got listed as backlog while sitting in the game. "not built" and
 * "partly built" contain the word and are the opposite claim, so they are
 * ruled out first.
 */
function claimsBuilt(tail: string): boolean {
  const t = tail.toLowerCase();
  if (t.includes("not built") || t.includes("partly built")) return false;
  return /\bbuilt\b/.test(t);
}

/**
 * A section counts as backlog unless its heading claims it exists. Which keeps
 * "partly built", and deliberately: a system half in the game is a thing with
 * work left, and the tail says which half on every row.
 */
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

function fromIdeas(title: string, note: string, sheet: ConceptSheet, group: string): BacklogGroup {
  return {
    title,
    note,
    builtHidden: 0,
    entries: sheet.ideas
      .filter((i) => i.group === group)
      .map((i) => ({ name: i.name, kind: "idea", note: i.note, detail: "", ref: i.ref })),
  };
}

/** A whole spec section as one entry — for prose that never became a list. */
function fromSection(
  title: string,
  note: string,
  text: string,
  needle: string,
  ref: string,
): BacklogGroup {
  const body = sectionBody(sectionNamed(text, needle));
  return {
    title,
    note,
    builtHidden: 0,
    // No name of its own: the group heading already carries it, and a row
    // that repeats its own heading reads as an entry called after the list.
    entries: body ? [{ name: "", kind: "", note: "", detail: body, ref }] : [],
  };
}

export function buildBacklog(
  bestiary: string,
  bosses: string,
  couplings: string,
  assists: string,
  systems: string,
  ideas: string,
): Backlog {
  const roster = parseRoster(bestiary, bosses);
  const sheet = parseConcepts(couplings, assists, systems, ideas);

  return {
    bestiary: [
      fromRoster(
        "THE FIRST THIRTEEN",
        "the bestiary the design started from — bestiary.md 10.1",
        roster.creatures,
      ),
      fromRoster(
        "ACCEPTED SINCE",
        "argued into the spec after that first thirteen — bestiary.md 10.2",
        roster.accepted,
      ),
      fromIdeas(
        "CREATURE IDEAS",
        "accepted in principle, not worked out — ideas.md",
        sheet,
        "Creatures",
      ),
    ],
    mechanics: [
      fromConcepts("COUPLINGS", "the patterns everything else follows from", sheet.couplings),
      fromConcepts("ASSIST FORMS", "how the pair cushions a difference in ability", sheet.assists),
      fromConcepts("SYSTEMS", "the rules the field plays by", sheet.systems),
      fromIdeas("MECHANIC IDEAS", "accepted in principle, not worked out", sheet, "Mechanics"),
    ],
    controls: [
      fromIdeas(
        "CONTROL IDEAS",
        "what a player's own hands would do differently — ideas.md",
        sheet,
        "Controls",
      ),
    ],
    bosses: [
      fromRoster("THE ACT ORDER", "one boss every ten waves — bosses.md", roster.bosses),
      fromIdeas(
        "BOSS IDEAS",
        "encounters worked out and set aside, each naming the slot it would fit — ideas.md",
        sheet,
        "Bosses",
      ),
    ],
    parked: [
      {
        title: "DELIBERATELY DEFERRED",
        note: "not rejected, not queued — ideas.md",
        builtHidden: 0,
        entries: sheet.deferred.map((i) => ({
          name: i.name,
          kind: "",
          note: i.note,
          detail: "",
          ref: i.ref,
        })),
      },
      fromSection(
        "EXAMINED AND REJECTED",
        "names that were considered and turned down, with the reason",
        bestiary,
        "Examined and rejected",
        "bestiary.md 10.3",
      ),
    ],
  };
}
