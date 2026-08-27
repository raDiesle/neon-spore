/**
 * A restatement of a `Check:` trailer, computed fresh every time — never kept
 * beside it, because a mapping kept by hand goes stale exactly the way the
 * director's brushes did: named by hand while `docs/INDEX.md` vouched that
 * they came from the bestiary, and two creatures shipped that could not be
 * placed at all. This is the same shape of mistake, one file over.
 *
 * Two pieces, both derived from things a commit already carries:
 *
 * - **the subject** — which creature, wave, boss or sheet — read off the
 *   check's own text. The design vocabulary is written in shouted case
 *   (`THE WARDEN`, `THE CAIRN`, `HUSK 1`), so a run of two or more shouted
 *   words is the thing being talked about, not a restatement of it.
 * - **where to stand** — which tool opens the thing — read off the paths the
 *   commit actually changed. A commit touching `packages/render/` wants
 *   `bun run preview`; one touching `packages/net/` wants the relay check;
 *   and so on. `docs/verification.md` names the mapping; this is where it
 *   lives as code instead of as something a session has to remember.
 *
 * Neither half replaces the trailer. Both are quoted beside it, and both are
 * silent when they have nothing to add — in particular when the trailer
 * already names a `bun run …` of its own, since a hint that only repeats the
 * command is noise on a list whose only value is that everything on it is
 * real.
 */

/**
 * A shouted word, then one to three more shouted words or numbers:
 * `THE WARDEN`, `HUSK 1`, `ON THE FIELD` — but not `96 BPM`, where the
 * shouting is a unit rather than a name and starts on the number, not a word.
 */
const SUBJECT = /\b[A-Z][A-Z']*(?:\s+(?:[A-Z][A-Z']*|\d+)){1,3}\b/;

/** The subject a check's own text names, or null when nothing is shouted. */
export function subjectOf(text: string): string | null {
  // A trailing apostrophe belongs to a possessive the regex could not follow
  // onto its lowercase `s` — `THE TITHE's` — not to the name itself.
  return SUBJECT.exec(text)?.[0]?.replace(/'+$/, "") ?? null;
}

interface Stand {
  test: (path: string) => boolean;
  where: string;
}

/**
 * Checked in this order on purpose: the specific packages first, so a commit
 * that touches both `packages/net/` and `packages/render/` — a protocol
 * change with a status light redrawn to match — is sent to the relay rather
 * than to the broadest, most common rule. `packages/render/` sits last
 * because almost everything eventually draws something, and a rule that
 * fired on that alone would drown out the others.
 */
const STANDS: readonly Stand[] = [
  { test: (p) => p.startsWith("packages/net/"), where: "`bun run relay:check`" },
  { test: (p) => p.startsWith("packages/audio/"), where: "the director's ♪ SOUND sheet" },
  { test: (p) => p.includes("briefing"), where: "the director's CARDS tab" },
  {
    test: (p) => p.startsWith("tools/shape-sheet/") || p === "packages/content/src/silhouettes.ts",
    where: "`bun run shapes:page`",
  },
  {
    test: (p) => p.startsWith("packages/render/") || p.startsWith("apps/game/"),
    where: "`bun run preview`",
  },
];

/** Which tool opens what this commit changed, or null when none of the table says. */
export function whereToStand(paths: readonly string[]): string | null {
  for (const stand of STANDS) {
    if (paths.some(stand.test)) return stand.where;
  }
  return null;
}

/**
 * The restatement itself: the subject, then where to open it, in one short
 * line — or null when there is nothing to add beside the trailer's own
 * sentence. Never called when the trailer already names a command: that case
 * has already told the reader where to stand, and a second telling is noise.
 */
export function restate(text: string, paths: readonly string[]): string | null {
  const subject = subjectOf(text);
  const where = whereToStand(paths);
  if (!subject && !where) return null;
  if (subject && where) return `${subject} — open ${where}`;
  return subject ?? `open ${where}`;
}
