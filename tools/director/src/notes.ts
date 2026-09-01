/**
 * `docs/release-notes.md`, parsed — the pure half of the RELEASE NOTES sheet.
 *
 * What stood here before was TO CHECK: a list of obligations derived from
 * `Check:` trailers, with a ▶ RUN, a ✓ TESTED and a ✗ FAILED on every row. It
 * was accurate and it asked the reader for something on every visit, which is
 * what finished it — a list you owe answers to stops being opened at about the
 * length that one reached.
 *
 * This is the same information with the asking removed. Every row is a landing
 * that already happened; there is no verdict to give, no count that means
 * anything is waiting, and no state that can fall out of date, because the file
 * is written once by `bun run land` and never edited afterwards.
 *
 * Pure so the shape can be tested without a repository or a browser.
 */

export interface Note {
  /** `2026-09-01`, straight off the commit. */
  date: string;
  /** Abbreviated sha, as git prints it. */
  sha: string;
  /** The commit subject — this repository writes them as sentences. */
  subject: string;
  /** The first paragraph of the body, or "" for a subject-only commit. */
  summary: string;
}

/** `## 2026-09-01 · 56107e8 — The siren gets a left and a right` */
const HEADING = /^##\s+(\d{4}-\d{2}-\d{2})\s+·\s+(\S+)\s+—\s+(.+)$/;

/**
 * Entries out of the file, in the order they appear — which is newest first,
 * because that is the order `prepend` writes them in.
 *
 * A line that is not a heading belongs to the entry above it. Anything before
 * the first heading is the preamble and is dropped: it explains the file to
 * somebody reading the file, and the sheet has its own subtitle for that.
 */
export function parseNotes(md: string): Note[] {
  const notes: Note[] = [];
  const bodies: string[][] = [];
  for (const raw of md.split("\n")) {
    const heading = HEADING.exec(raw.trim());
    if (heading) {
      notes.push({
        date: heading[1] ?? "",
        sha: heading[2] ?? "",
        subject: (heading[3] ?? "").trim(),
        summary: "",
      });
      bodies.push([]);
      continue;
    }
    const body = bodies.at(-1);
    if (!body) continue;
    const line = raw.trim();
    if (line) body.push(line);
  }
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    if (note) note.summary = (bodies[i] ?? []).join(" ");
  }
  return notes;
}

/** The entries grouped under their date, so a day reads as a day. */
export function byDay(notes: readonly Note[]): { date: string; notes: Note[] }[] {
  const days: { date: string; notes: Note[] }[] = [];
  for (const note of notes) {
    const last = days.at(-1);
    if (last && last.date === note.date) last.notes.push(note);
    else days.push({ date: note.date, notes: [note] });
  }
  return days;
}
