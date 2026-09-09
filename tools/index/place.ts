import type { Row } from "./index.js";

/**
 * **Where a new row goes.** Split out of `index.ts` on that file's line count;
 * it is one question and it has one answer.
 */

/** How many characters two paths share from the left. */
function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/**
 * Put a new row where a reader would look for it: **beside the rows whose names
 * it shares a beginning with**, rather than at the bottom of its section.
 *
 * Splitting `crawler.ts` produced `crawler-ring.ts`, and this tool wrote its row
 * seventy lines below `crawler.ts` and `crawler-skin.ts` — the two rows anybody
 * looking it up would have been reading. The completeness test passed either
 * way, so nothing caught it, and every session that added a file paid the same
 * minute moving the row by hand.
 *
 * The rule is the longest shared path prefix, which for a split file is the
 * whole of the parent's name — `crawler-ring.ts` follows `crawler-skin.ts`
 * follows `crawler.ts`. When no name in the section is about the same thing,
 * the directory is still a shared prefix and still an answer: a row lands at
 * the end of its own directory rather than at the end of the section, which is
 * where the section's other directories begin. Appending is left for a
 * directory that has no rows at all, which is a genuinely new place.
 *
 * Inserted *after* the last row it ties with, so a file split into three keeps
 * the order it was split in.
 */
export function fileBeside(rows: Row[], row: Row): void {
  const dir = row.path.slice(0, row.path.lastIndexOf("/") + 1);
  let best = 0;
  let at = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r === undefined || !r.path.startsWith(dir)) continue;
    // Any row in the same directory is already a better answer than the bottom
    // of the section, so the floor is the directory itself and the name only
    // decides *which* of its rows to follow.
    const n = Math.max(dir.length, sharedPrefix(r.path, row.path));
    if (n >= best) {
      best = n;
      at = i;
    }
  }
  if (at < 0) rows.push(row);
  else rows.splice(at + 1, 0, row);
}
