import { answerTo } from "./asking.js";
import { needOf } from "./needs.js";
import { fieldOf, type Item, WHERE } from "./queue.js";

/**
 * What makes an entry one a cold session could act on, and the refusal when
 * it is not. Beside `queue.ts` rather than in it: the parser says what the
 * lines *are*, this file says which of them a session cannot do without, and
 * it grew its own function the day `next` and `take` started asking before
 * the branch is made.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** A `Needs:` line saying where its prerequisite is and that it has to land,
 * rather than naming it. */
const SENTENCE_NEED = /(,\s*above\b|\blanded first\s*$)/i;

/** What `queue list` hangs off an entry's fields, and so what a title may not
 * repeat: `ASKS THE OWNER` from `Asks:`, `LOCAL ONLY` from `Where:`, and
 * `WAITS ON` from `Needs:`. */
const MARKERS = ["ASKS THE OWNER", "LOCAL ONLY", "WAITS ON"];

/**
 * What is wrong with an entry, in the words a session would need to fix it.
 * Empty means the entry can be handed to somebody who has read nothing else.
 */
export function problemsIn(items: readonly Item[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.title)) {
      problems.push(`${item.source}: "${item.title}" — a second entry has this title`);
    }
    seen.add(item.title);
    problems.push(...problemsWith(item));
  }
  return problems;
}

/**
 * The one entry's problems, each starting with where it is. Its own function
 * because `next` and `take` ask it before making a branch: on 14 September
 * 2026 an entry with an 87-character title was claimed without a word, the
 * next `check:fast` failed on this file's own parse of `docs/queue.md`, and
 * the entry could not be retitled — `done` and the `Taken:` line match by
 * title. The one problem this cannot see is a duplicate title, which is
 * between two entries; `problemsIn` adds it.
 */
export function problemsWith(item: Item): string[] {
  const problems: string[] = [];
  const where = `${item.source}: "${item.title}"`;
  if (item.title.length > 80) problems.push(`${where} — title over 80 characters`);
  if (!ISO_DATE.test(item.found)) {
    problems.push(`${where} — no "- **Found:** YYYY-MM-DD, <branch>" line`);
  }
  if (item.files.length === 0) {
    problems.push(`${where} — no "- **Files:** <paths>" line`);
  }
  const prose = item.body
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("- **"))
    .join("");
  if (!prose.trim()) problems.push(`${where} — nothing but fields; say what to change and why`);
  // An `Asks:` line is a question somebody has to be able to answer in a
  // sentence, which means the body has to have laid the choice out. Prose is
  // already required above; what this adds is that the question is a
  // question — an `Asks:` reading like a task is an entry whose owner will
  // read it, agree, and still not know what was wanted from them.
  if (item.asks && !item.asks.includes("?")) {
    problems.push(`${where} — the Asks: line is not a question`);
  }
  // And the mirror of it. An `Answered:` under an entry that never asked
  // anything is a decision recorded on the wrong entry: nothing reads it, and
  // the entry it belonged to is still sitting in the listing marked ASKS THE
  // OWNER while `next` passes over it (`asking.ts`).
  if (!item.asks && answerTo(item)) {
    problems.push(`${where} — an Answered: line with no Asks: over it`);
  }
  // A marker the listing writes for itself, written into the title as well.
  // `bun run queue list` builds each line as `<title> — ASKS THE OWNER —
  // LOCAL ONLY` off the `Asks:` and `Where:` fields (`run.ts`), so a title
  // that says one of them out loud gets it twice — and the title is what
  // `take`, `release` and `done` match on, so the doubled one is what a
  // session has to type. Both of these were written on 16 September 2026 by
  // the sessions that added the fields underneath them.
  const shouted = MARKERS.find((m) => item.title.toUpperCase().includes(m));
  if (shouted) {
    problems.push(`${where} — the title says ${shouted}; the listing adds that from the field`);
  }
  // A `Needs:` written as a sentence about its prerequisite rather than as its
  // title. It matches nothing, so it fails open (`needs.ts`) — and on 27
  // September 2026 `next` handed out THE WINCH's look while its simulation
  // lane was still in the file, because the line read *§41 THE WINCH's
  // simulation lane, above, landed first*. A misspelt title cannot be told
  // from a landed one; these two phrases can, and no title ends in them.
  if (SENTENCE_NEED.test(needOf(item))) {
    problems.push(`${where} — the Needs: line is a sentence; it is the other entry's title`);
  }
  const reserved = fieldOf(item.body, WHERE);
  if (reserved.trim().toLowerCase() === "phone") {
    // A check that needs a phone in a hand is the owner's regression pass and
    // never an entry, since 27 September 2026 (`where.ts`).
    problems.push(
      `${where} — Where: is "phone"; a check needing a phone is the owner's regression pass, not an entry`,
    );
  } else if (reserved && item.where === "anywhere") {
    // `cloud` reaches here too, and on purpose: forty entries carried it
    // until 21 September 2026, and one copied out of an old entry has to be
    // reported rather than quietly kept from the machine reading it.
    problems.push(`${where} — Where: is ${JSON.stringify(reserved)}; the value is "local"`);
  }
  return problems;
}

/**
 * Refuse to hand out an entry a cold session could not act on. Said before
 * the branch is made, so a refusal leaves nothing to release.
 */
export function refuseUnlessWhole(item: Item): void {
  const problems = problemsWith(item);
  if (problems.length === 0) return;
  throw new Error(
    `${JSON.stringify(item.title)} is not an entry a cold session could act on — fix it first:\n` +
      problems.map((p) => `  - ${p}`).join("\n"),
  );
}
