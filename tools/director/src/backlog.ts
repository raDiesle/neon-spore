/**
 * The backlog: everything the design has agreed to and the game does not have,
 * arranged by what it would become rather than by which file it was written in.
 *
 * The panels this replaces were shaped like the spec's directory — one tab per
 * file, built and unbuilt mixed in each. That is the wrong axis for the one
 * question the page exists to answer: *what is there left to build, and what
 * could it be made of.* So a creature idea sits with the creatures whether it
 * was written in `bestiary.md` or in `ideas.md`, and anything the simulation
 * already has is not here at all — see the brush palette and the SHIP tab.
 *
 * Nothing is classified twice. Which section an idea belongs to is a `###`
 * heading in `docs/spec/ideas.md`, so moving one is an edit to the spec.
 */

import { parseParked } from "../../handoff/parked.js";
import { dropBuilt, fromIdeas } from "./backlog-ideas.js";
import { type Concept, type Idea, parseConcepts } from "./concepts.js";
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
  rounds: BacklogGroup[];
  parked: BacklogGroup[];
  // Decided, not yet done — `docs/queue.md`, joined to what git knows about
  // each lane. Built in `queue-panel.ts`, which needs git and so cannot live
  // here. Passed in already built; empty where nobody supplied it.
  queue: BacklogGroup[];
  // Worked-out design documents — `docs/versus.md` and friends — each
  // carrying numbers a queued lane is meant to build. Built in
  // `design-docs.ts`, a different thing from an idea nobody has argued with.
  designs: BacklogGroup[];
}

// The `Kind · Stage` line under each entry's date and branch in
// `docs/parked.md` — see that file's header for the vocabularies.
const PARKED_LABEL =
  /^(?:Mechanic|Creature|Graphics|Sound|Tool|Performance|Correctness|Documentation) · (?:Idea|Designed|Implemented)$/;

function parkedLabels(md: string): string[] {
  return md
    .split(/\n(?=## )/)
    .slice(1)
    .map((section) => section.split("\n").find((l) => PARKED_LABEL.test(l.trim())) ?? "");
}

/**
 * "Deliberately deferred" in `ideas.md` argues most entries down ("Refused,
 * and…"). One, THE CONDUCTOR, says the opposite — "Deferred rather than
 * rejected" — the only signal the prose gives, and what splits the group.
 */
function deferredGroups(deferred: Idea[]): BacklogGroup[] {
  const isDeferred = (i: Idea) => /deferred rather than reject/i.test(i.note);
  const toEntry = (i: Idea): BacklogEntry => ({
    name: i.name,
    kind: "",
    note: i.note,
    detail: "",
    ref: i.ref,
  });
  return [
    {
      title: "IDEAS TURNED DOWN",
      note: "looked at and refused, with the objection written out — ideas.md",
      builtHidden: 0,
      entries: deferred.filter((i) => !isDeferred(i)).map(toEntry),
    },
    {
      title: "DEFERRED, NOT REFUSED",
      note: "set aside for a stated reason, not turned down — ideas.md",
      builtHidden: 0,
      entries: deferred.filter(isDeferred).map(toEntry),
    },
  ];
}

// A built entry is not backlog. It is in the brush palette, or on the field.
function fromRoster(title: string, note: string, rows: Planned[]): BacklogGroup {
  return {
    title,
    note,
    entries: rows.filter((r) => !r.built).map(({ built: _built, ...rest }) => rest),
    builtHidden: rows.filter((r) => r.built).length,
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

// A whole spec section as one entry — for prose that never became a list.
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
    // No name of its own: the group heading already carries it.
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
  queue: BacklogGroup[] = [],
  designs: BacklogGroup[] = [],
  parkedMd = "",
): Backlog {
  const roster = parseRoster(bestiary, bosses);
  const sheet = parseConcepts(couplings, assists, systems, ideas);
  const parkedKinds = parkedLabels(parkedMd);

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
    rounds: [
      dropBuilt(
        fromIdeas(
          "ROUND IDEAS",
          "rounds that are not the field, each with its own controls and picture — ideas.md",
          sheet,
          "Rounds",
        ),
      ),
    ],
    parked: [
      // The file the tab is named after. Below it are the spec's own
      // deferrals and rejections — a different thing with the same word
      // on it, which is why this went unnoticed for so long.
      {
        title: "PARKED BY A SESSION",
        note: "noticed and not done, with where to start — docs/parked.md",
        builtHidden: 0,
        entries: parseParked(parkedMd).map((e, i) => ({
          name: e.title,
          kind: parkedKinds[i] ?? "",
          note: e.origin,
          detail: "",
          ref: "parked.md",
        })),
      },
      ...deferredGroups(sheet.deferred),
      fromSection(
        "EXAMINED AND REJECTED",
        "names that were considered and turned down, with the reason",
        bestiary,
        "Examined and rejected",
        "bestiary.md 10.3",
      ),
    ],
    queue,
    designs,
  };
}
