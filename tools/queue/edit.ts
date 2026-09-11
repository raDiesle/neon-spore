/**
 * Editing `docs/queue.md` and `docs/parked.md` in place: the claim written
 * into an entry, the claim taken back out, and the entry removed once it has
 * landed. Reading them is `queue.ts` next door.
 *
 * Every one of these is a line-level edit rather than a parse and a reprint,
 * and that is deliberate: both files are prose somebody wrote by hand, and a
 * round trip through `parseItems` would return them with the wording tidied
 * and the blank lines regularised. `queue done` must change one section and
 * leave every character of the rest exactly where it was, or the diff it
 * commits is unreadable and nobody reviews it again.
 */

import { FILES, FOUND, HEADING, TAKEN } from "./queue.js";

/**
 * The lines of one `##` section, as a half-open range over `lines`.
 * `[-1, -1]` when no entry carries that title.
 */
function sectionOf(lines: readonly string[], title: string): [number, number] {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = HEADING.exec(lines[i] ?? "");
    if (!m) continue;
    if (start === -1 && m[1] === title) start = i;
    else if (start !== -1) return [start, i];
  }
  return start === -1 ? [-1, -1] : [start, lines.length];
}

/**
 * The markdown with a `Taken:` line written into one entry — the claim, as the
 * file itself says it.
 *
 * It goes directly under `Found:` so the two dates read together: when this was
 * noticed, and when somebody picked it up. An entry that already carries one is
 * an error rather than an overwrite, because the only way to reach that state
 * is two sessions claiming the same item, which is the thing the mark exists to
 * make impossible.
 */
export function markTaken(md: string, title: string, mark: string): string {
  const lines = md.split("\n");
  const [start, end] = sectionOf(lines, title);
  if (start === -1) throw new Error(`no entry titled ${JSON.stringify(title)}`);
  let at = -1;
  for (let i = start; i < end; i++) {
    const line = (lines[i] ?? "").trim();
    if (TAKEN.test(line)) throw new Error(`${JSON.stringify(title)} is already taken: ${line}`);
    if (FOUND.test(line) || (at === -1 && FILES.test(line))) at = i;
  }
  if (at === -1) throw new Error(`${JSON.stringify(title)} has no Found: or Files: line to sit by`);
  return [...lines.slice(0, at + 1), `- **Taken:** ${mark}`, ...lines.slice(at + 1)].join("\n");
}

/** The markdown with one entry's `Taken:` line removed. Silent when there is none. */
export function clearTaken(md: string, title: string): string {
  const lines = md.split("\n");
  const [start, end] = sectionOf(lines, title);
  if (start === -1) throw new Error(`no entry titled ${JSON.stringify(title)}`);
  const kept = lines.filter((line, i) => !(i >= start && i < end && TAKEN.test(line.trim())));
  return kept.join("\n");
}

/** The markdown with one `##` section taken out. Throws if the title is not there. */
export function removeItem(md: string, title: string): string {
  const lines = md.split("\n");
  const [start, end] = sectionOf(lines, title);
  if (start === -1) throw new Error(`no entry titled ${JSON.stringify(title)}`);
  const kept = [...lines.slice(0, start), ...lines.slice(end)];
  return `${kept
    .join("\n")
    .replace(/\n{3,}$/, "\n\n")
    .trimEnd()}\n`;
}

/** Whether the markdown has an entry under this title at all. */
export function hasEntry(md: string, title: string): boolean {
  return sectionOf(md.split("\n"), title)[0] !== -1;
}
