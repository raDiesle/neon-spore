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
 */

export interface Parked {
  title: string;
  /** The line under the heading: when, and off which branch. */
  origin: string;
}

const HEADING = /^## (.+)$/;
const ORIGIN = /^_(.+)_$/;

export function parseParked(md: string): Parked[] {
  const entries: Parked[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    const heading = HEADING.exec(line);
    if (heading) {
      entries.push({ title: (heading[1] ?? "").trim(), origin: "" });
      continue;
    }
    const last = entries.at(-1);
    if (last && !last.origin) {
      const origin = ORIGIN.exec(line);
      if (origin) last.origin = (origin[1] ?? "").trim();
    }
  }
  return entries;
}
