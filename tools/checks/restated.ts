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
  let lastWasQuote = false;

  for (const raw of md.split("\n")) {
    const heading = HEADING.exec(raw);
    if (heading) {
      sha = heading[1] ?? "";
      pending = null;
      lastWasQuote = false;
      continue;
    }
    const quote = QUOTE.exec(raw);
    if (quote) {
      // A quote that wrapped is one quote. `checksIn` folds a trailer's
      // continuation lines for the same reason and learned it the same way:
      // a session wraps at the margin the way it wraps everything else, and
      // the half of the sentence carrying the key ends up on the floor. Two
      // entries were lost to exactly this before the fold went in.
      if (pending && lastWasQuote) {
        pending.text = `${pending.text} ${(quote[1] ?? "").trim()}`;
        continue;
      }
      pending = {
        sha,
        text: (quote[1] ?? "").trim(),
        subject: "",
        changed: "",
        decide: "",
        where: "",
      };
      entries.push(pending);
      lastWasQuote = true;
      continue;
    }
    const field = FIELD.exec(raw);
    // A blank line closes the quote; a field closes it; anything else that is
    // not blank continues it, with or without its own `>`. Markdown calls
    // that a lazy continuation and a session writing prose produces one
    // without thinking about it — which is how two quotes ended up keyed to
    // half a sentence, the same failure `checksIn` records having made and
    // fixed for the trailers themselves.
    if (lastWasQuote && pending && !field && raw.trim()) {
      pending.text = `${pending.text} ${raw.trim()}`;
      continue;
    }
    lastWasQuote = false;
    if (field && pending) {
      const key = field[1] as "subject" | "changed" | "decide" | "where";
      pending[key] = (field[2] ?? "").trim();
    }
  }
  return entries.filter((e) => e.sha && e.text);
}

/** The one entry keyed to this check, or null when nobody wrote one. */
/**
 * The trailer's text is the key; the sha only breaks a tie.
 *
 * It was sha *and* text, which is how `docs/verified.md` keys a decision, and
 * it was wrong here for a reason that took three lanes in one night to become
 * obvious: **a decision is written after its commit has landed, and a
 * restatement is written before.** Every lane that lands behind another one is
 * replayed, its commit is rewritten, and the sha it keyed itself to stops
 * existing — six entries orphaned that way in a single evening, one of them
 * after the lane had already hand-corrected the key once.
 *
 * A trailer's text is a whole sentence somebody wrote about one specific
 * thing, so on its own it is very nearly unique, and it survives a rebase
 * because rebasing does not rewrite messages. Where two checks genuinely
 * share a text the sha decides between them, which keeps the property the
 * original keying was protecting: a restatement can never silently attach to
 * the wrong check.
 */
export function findRestated(
  entries: readonly Restated[],
  sha: string,
  text: string,
): Restated | null {
  const sameText = entries.filter((e) => e.text === text);
  if (sameText.length === 1) return sameText[0] ?? null;
  return sameText.find((e) => sameCommit(e.sha, sha)) ?? null;
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
  // Orphaned means no check says this sentence at all — not that the sha
  // moved, which is what a rebase does to every lane that lands second.
  return entries.filter((e) => !checks.some((c) => c.text === e.text));
}
