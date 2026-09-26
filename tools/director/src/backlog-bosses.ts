/**
 * The BOSSES page of the NOT BUILT YET sheet: what is left to do on a boss,
 * read off `bosses.md` and `bosses-choreographed.md`.
 *
 * **A tab of this name came off the sheet on 16 September 2026** — *its not
 * relevant for me any longer* — and it is worth saying what that one held,
 * because this is not it. That one drew THE ACT ORDER, which is the list of
 * bosses the game *has*, and a group of boss ideas, which had already gone
 * with THE SPLICE the day before. Both pages have since been reordered by
 * state (17 September 2026), and what they carry now is the opposite of an act
 * order: a boss whose simulation landed and whose look nobody has written, and
 * the *What is not built* paragraph at the foot of every finished boss. That
 * is the largest pool of decided, sized, unstarted work in the repository and
 * nothing was drawing it.
 *
 * **A fourth group joined it on 26 September 2026**: a concept written up on
 * `bosses-choreographed.md` with no row in that page's own "Who is building
 * what" ledger — a full spec, nobody's lane. DavidDe asked for a page reading
 * development state per boss; this is that page's fourth answer, and it is
 * "not started" rather than "not built", because a concept here has never had
 * a line of simulation written at all.
 *
 * **Nothing here classifies a boss.** Which group one is in is the `##`
 * heading it stands under in `bosses.md` (or, for the fourth group, whether
 * its name has a ledger row in `bosses-choreographed.md`), so a look that
 * lands, or a lane that gets claimed, moves a boss by being moved in the spec
 * — the rule `backlog.ts` already follows for `ideas.md`'s `###` groups, and
 * the reason `parseNumberedSections` carries a `group`.
 */

import type { BacklogEntry, BacklogGroup } from "./backlog.js";
import { firstParagraph, normalizeName, parseNumberedSections, sectionBody } from "./sections.js";

/** The `##` heading in `bosses.md` a boss stands under while it is unfinished. */
const IN_HAND = "Still in hand";
/** And the one it moves to when its look lands. */
const BUILT = "Built";

/**
 * What a finished boss still owes, and nothing above it.
 *
 * Every `## 11.n` write-up ends with a paragraph naming what of the design did
 * not ship — a beat with no picture, a call window the game cannot judge, a
 * fight never watched at tempo. `backlog.ts`'s `unbuiltRemainder` reads the
 * same shape out of `systems.md`, where the sentence opens **Not built:**;
 * here it opens **What is not built**, so this is the same cut with the other
 * spelling rather than a second idea about where a section's tail begins.
 *
 * Empty when the section says no such thing — a boss with nothing left.
 */
export function bossRemainder(detail: string): string {
  const at = detail.search(/(?:\*\*)?What is not built/i);
  if (at === -1) return "";
  const end = detail.indexOf("\n\n", at);
  return (end === -1 ? detail.slice(at) : detail.slice(at, end)).replace(/\s*\n\s*/g, " ").trim();
}

/**
 * The same sentence where the lane that built a boss actually wrote it: the
 * ledger at the top of `bosses-choreographed.md`, one row per concept, whose
 * last clause is what of the design did not ship.
 *
 * Read because **`bosses.md` is the thinner of the two here** and the shape of
 * the two files says why. A §11 write-up is the design as it now stands, so a
 * lane that shipped everything it meant to leaves no paragraph behind; the
 * ledger row is the *landing*, and every one of them ends with the eye the
 * owner has not yet run over it. Four sections of `bosses.md` say what is not
 * built; fourteen ledger rows do.
 *
 * Keyed by the boss's name so `fromBosses` can prefer the §11 paragraph where
 * there is one — the section is the page the owner reads, and a row repeating
 * it under the same heading would be the same work listed twice.
 */
function ledgerRemainders(choreo: string): Map<string, string> {
  const left = new Map<string, string>();
  for (const line of choreo.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length !== 3) continue;
    const name = cells[0]!.match(/\[(?:§\d+|[^\]]*§[\d.]+)?\s*([^\]]+?)\]/)?.[1];
    if (!name) continue;
    const lane = cells[2]!;
    const at = lane.search(/(?:\*\*)?(?:What is not built|Not built)(?:\*\*)?\s*[:.]/i);
    if (at === -1) continue;
    left.set(normalizeName(name), lane.slice(at).replace(/\*\*/g, "").trim());
  }
  return left;
}

/**
 * The primitives a choreographed scene still needs, off the library table at
 * the foot of `bosses-choreographed.md`.
 *
 * The **Ancestor** column is the built question asked in prose: every row says
 * where the shipped thing it would be built out of lives, and a row with
 * `nothing` there is one with no shipped ancestor at all. That is the only
 * cell read — a row's own wording is what moves when somebody builds it, and
 * a list of names kept here would not.
 */
function scenePrimitives(choreo: string): BacklogEntry[] {
  const entries: BacklogEntry[] = [];
  for (const line of choreo.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length !== 4) continue;
    const [name, must, ancestor, wanted] = cells as [string, string, string, string];
    if (!/^nothing\b/i.test(ancestor)) continue;
    entries.push({
      name: name.replace(/\*\*/g, "").replace(/`/g, "").split(" — ")[0]!.trim(),
      kind: `wanted by ${wanted}`,
      note: must,
      detail: "",
      ref: "bosses-choreographed.md",
    });
  }
  return entries;
}

/**
 * Every concept name that already has a row in "Who is building what" — the
 * ledger table at the top of `bosses-choreographed.md`. A name absent from it
 * has no lane claimed at all, whatever a hand-written status word next to it
 * on the Contents list says — the ledger is the one place a claim is real
 * (`docs/spec/bosses-choreographed.md`, *Who is building what*).
 */
function ledgerNames(choreo: string): Set<string> {
  const names = new Set<string>();
  for (const line of choreo.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    const linkText = cells[0]!.match(/\[([^\]]+)\]/)?.[1];
    if (!linkText) continue;
    names.add(normalizeName(linkText.replace(/^§?\d+\s+/, "")));
  }
  return names;
}

/**
 * A concept written up on `bosses-choreographed.md` with no lane claimed for
 * it yet — a full spec, ten-plus steps, nobody's simulation branch open. This
 * is DavidDe's "not done yet" ask of 26 September 2026 answered the way the
 * rest of this page already is: read live off the spec rather than hand-kept,
 * so a claimed lane drops out of this group the moment its ledger row lands.
 */
function unstartedConcepts(choreo: string): BacklogEntry[] {
  const claimed = ledgerNames(choreo);
  const entries: BacklogEntry[] = [];
  const heading = /^### §(\d+) ([A-Z][A-Z '.]+) — (.+)$/gm;
  for (const m of choreo.matchAll(heading)) {
    const [, num, name, question] = m as unknown as [string, string, string, string];
    if (claimed.has(normalizeName(name))) continue;
    entries.push({
      name: name.trim(),
      kind: `§${num}`,
      note: question.trim(),
      detail: "",
      ref: "bosses-choreographed.md",
    });
  }
  return entries;
}

function toEntry(s: ReturnType<typeof parseNumberedSections>[number], note: string): BacklogEntry {
  return {
    name: s.title,
    kind: s.number,
    note,
    detail: sectionBody(s.lines),
    ref: `bosses.md ${s.number}`,
  };
}

export function fromBosses(bosses: string, choreo: string): BacklogGroup[] {
  const sections = parseNumberedSections(bosses);

  const ledger = ledgerRemainders(choreo);
  const inHand = sections.filter((s) => s.group === IN_HAND);
  const left = sections
    .filter((s) => s.group === BUILT)
    .map((s) => ({
      s,
      note: bossRemainder(sectionBody(s.lines)) || (ledger.get(normalizeName(s.title)) ?? ""),
    }))
    .filter(({ note }) => note !== "");

  return [
    {
      title: "STILL IN HAND",
      note: "the simulation landed and the look is not written — bosses.md",
      builtHidden: 0,
      builtWhere: "the game",
      reading: true,
      // The heading's own tail, not its first paragraph: a reading group
      // prints the whole section under the note, so a lead lifted off the top
      // of the body is that paragraph twice. The tail is the one line of the
      // section that is *not* in the body.
      entries: inHand.map((s) => toEntry(s, s.tail || firstParagraph(s.lines))),
    },
    {
      title: "LEFT ON A BUILT BOSS",
      note: "what each finished boss still owes, in its own words — bosses.md, then the landing ledger",
      builtHidden: 0,
      builtWhere: "the game",
      reading: true,
      entries: left.map(({ s, note }) => toEntry(s, note)),
    },
    {
      title: "PRIMITIVES A SCENE STILL NEEDS",
      note: "the library rows with no shipped ancestor — bosses-choreographed.md",
      builtHidden: 0,
      entries: scenePrimitives(choreo),
    },
    {
      title: "PROPOSED, NOT STARTED",
      note: "written up on bosses-choreographed.md, no lane claimed yet — the development state DavidDe asked for",
      builtHidden: 0,
      entries: unstartedConcepts(choreo),
    },
  ];
}
