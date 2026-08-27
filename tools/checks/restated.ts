/**
 * `docs/checks/restated.md` — the half of a `Check:` trailer nobody can
 * derive: what changed, in a clause a reader can picture, and the question
 * with a yes and a no. `hint.ts` already derives *where to stand*, off the
 * commit's own changed paths; this is the other half, written by hand by the
 * session that did the work, because it is the only session that ever knows
 * it.
 *
 * Keyed the way `docs/verified.md` keys its decisions — see `ledger.ts` — so
 * a restatement cannot drift onto the wrong check: the commit's own sha
 * (`sameCommit` forgives `%h` growing a digit) and the trailer's exact text.
 */

import { sameCommit } from "./ledger.js";

export interface Restated {
  /** The commit the restatement was written for, as the trailer had it. */
  sha: string;
  /** The trailer's own text, quoted in full — the key, not a summary. */
  text: string;
  subject: string;
  changed: string;
  decide: string;
  where: string;
}

const HEADING = /^##\s+`([0-9a-f]+)`/;
const QUOTE = /^>\s?(.+)$/;
const FIELD = /^-\s+\*\*(subject|changed|decide|where)\*\*\s+(.+)$/;

/**
 * One entry per `> quoted text`, carrying the sha of the `##` heading above
 * it and whichever of the four fields follow before the next quote or
 * heading. A quote with none of the four fields filled in is still kept —
 * an incomplete entry is still a key that should not silently vanish from
 * `orphanedRestated`'s count the moment a field goes missing.
 */
export function parseRestated(md: string): Restated[] {
  const entries: Restated[] = [];
  let sha = "";
  let pending: Restated | null = null;

  for (const raw of md.split("\n")) {
    const heading = HEADING.exec(raw);
    if (heading) {
      sha = heading[1] ?? "";
      pending = null;
      continue;
    }
    const quote = QUOTE.exec(raw);
    if (quote) {
      pending = {
        sha,
        text: (quote[1] ?? "").trim(),
        subject: "",
        changed: "",
        decide: "",
        where: "",
      };
      entries.push(pending);
      continue;
    }
    const field = FIELD.exec(raw);
    if (field && pending) {
      const key = field[1] as "subject" | "changed" | "decide" | "where";
      pending[key] = (field[2] ?? "").trim();
    }
  }
  return entries.filter((e) => e.sha && e.text);
}

/** The one entry keyed to this check, or null when nobody wrote one. */
export function findRestated(
  entries: readonly Restated[],
  sha: string,
  text: string,
): Restated | null {
  for (const entry of entries) {
    if (sameCommit(entry.sha, sha) && entry.text === text) return entry;
  }
  return null;
}

/**
 * Entries that attach to nothing on the trunk right now — a sha the log no
 * longer carries, or a quote that no longer matches a trailer's exact text
 * word for word.
 *
 * `ledger.ts`'s `sameCommit` faces the identical question for decisions and
 * chooses to forgive exactly one kind of drift — an abbreviation growing a
 * digit as the repository does — and nothing else. The same choice is made
 * here, for the same reason: a looser match on the *text* (a prefix, a fuzzy
 * compare) would let a restatement written for one check attach to a
 * different one that happens to start the same way, which is precisely the
 * failure this keying exists to rule out. A hand-typed quote that no longer
 * matches its trailer word for word is therefore **not** attached — but it is
 * not silently dropped either. Silence is right for a check with no
 * restatement at all (most of them, by design); it is wrong for a
 * restatement someone actually wrote that the keying failed to place, because
 * that is a note nobody will ever see again unless something says so. So it
 * is named here, once per run, wherever the outstanding list is read — loud
 * in the sense of "one summary line", not "noise on every check".
 */
export function orphanedRestated(
  entries: readonly Restated[],
  checks: readonly { sha: string; text: string }[],
): Restated[] {
  return entries.filter((e) => !checks.some((c) => sameCommit(e.sha, c.sha) && e.text === c.text));
}
