/**
 * `docs/parked.md` — the ideas a session had and did not act on.
 *
 * They are not checks. A check is work already landed that nobody has looked
 * at; a parked idea is work nobody has decided to do, and the difference
 * matters because the first is an obligation and the second is an offer. They
 * are kept apart so that the outstanding list stays a list where every row is
 * real.
 *
 * One `##` heading per idea, and an entry leaves the file by being deleted —
 * done or refused, the history keeps it either way. Nothing is ticked, because
 * a file of ticked boxes is a file nobody reads to the bottom of.
 *
 * **The whole entry is carried, not its heading.** This used to return a title
 * and a date and drop the three sentences underneath, which are the entry —
 * what it is, why it was not done then, and where to start. A page showing
 * seventy-five titles and no prose cannot be read to decide anything, so the
 * one thing the reader has to do to decide was the one thing it left in the
 * file.
 */

import type { BacklogGroup } from "./backlog.js";

export interface Parked {
  title: string;
  /** The line under the heading: when, and off which branch. */
  origin: string;
  /** `Kind · Stage` — see the file's own header for the two vocabularies. */
  label: string;
  /** Everything after those two lines: the argument, in markdown. */
  body: string;
  /**
   * The `###` section the entry sits under, or "" above the first one. The
   * file postpones creatures and bosses to the bottom under one of these,
   * and an entry read out of that section reads as ordinary backlog.
   */
  section: string;
}

const HEADING = /^## (.+)$/;
const SUBHEADING = /^### (.+)$/;
const ORIGIN = /^_?(\d{4}-\d{2}-\d{2} · .+?)_?$/;
const LABEL =
  /^(?:Mechanic|Creature|Graphics|Sound|Tool|Performance|Correctness|Documentation) · (?:Idea|Designed|Implemented)$/;

export function parseParked(md: string): Parked[] {
  const entries: Parked[] = [];
  const body: string[] = [];
  let section = "";
  // The entry the prose is landing on, rather than the last one parsed: a
  // `###` section carries a paragraph of its own, and that paragraph belongs
  // to the section rather than to whichever entry happened to come before it.
  let current: Parked | null = null;

  const flush = (): void => {
    if (current) current.body = body.join("\n").trim();
    body.length = 0;
  };

  for (const raw of md.split("\n")) {
    const line = raw.trim();

    const sub = SUBHEADING.exec(line);
    if (sub) {
      flush();
      current = null;
      section = (sub[1] ?? "").trim();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      current = { title: (heading[1] ?? "").trim(), origin: "", label: "", body: "", section };
      entries.push(current);
      continue;
    }

    if (!current) continue;
    if (!current.origin && ORIGIN.test(line)) {
      current.origin = (ORIGIN.exec(line)?.[1] ?? "").trim();
      continue;
    }
    if (!current.label && LABEL.test(line)) {
      current.label = line;
      continue;
    }
    body.push(raw);
  }
  flush();
  return entries;
}

/**
 * `docs/parked.md`, in the file's own order, as one group per `###` section —
 * the loose entries first, then the sections the file postpones to its bottom.
 *
 * Each entry carries its whole argument in `detail`. A parked idea is an offer
 * the owner has to *decide* on, and a title with a date is not enough to
 * decide with: the sentences underneath say what it is, why it was not done
 * then, and where to start, which is the entire content of the decision. They
 * used to stay in the file while the page showed only the heading.
 */
export function parkedGroups(md: string): BacklogGroup[] {
  const groups: BacklogGroup[] = [];
  for (const e of parseParked(md)) {
    const title = e.section === "" ? "PARKED BY A SESSION" : e.section.toUpperCase();
    let group = groups.find((g) => g.title === title);
    if (!group) {
      group = {
        title,
        note:
          e.section === ""
            ? "noticed and not done — what it is, why it was skipped, where to start — docs/parked.md"
            : "held back on purpose, and last, for the reason under the heading — docs/parked.md",
        builtHidden: 0,
        entries: [],
        reading: true,
      };
      groups.push(group);
    }
    group.entries.push({
      name: e.title,
      kind: e.label,
      note: e.origin,
      detail: e.body,
      ref: "parked.md",
    });
  }
  return groups;
}
