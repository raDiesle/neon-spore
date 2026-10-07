/**
 * A three-way merge of one block of lines, for when both sides edited the same
 * queue entry but not the same lines of it.
 *
 * `queue-merge.ts` follows an entry by its heading and refused whenever both
 * sides had touched one. On 7 October 2026 that stopped a landing on nothing:
 * the lane had claimed its second half with `bun run queue take`, which put a
 * `Taken:` line under `Found:` on the trunk, and then narrowed the same
 * entry's `Files:` line as it landed the first half. Two edits, one line apart,
 * and git's own merge calls lines that touch a conflict. Here they are two
 * hunks of base and neither overlaps the other, so both are kept.
 *
 * What still refuses: two sides changing the same base line, or inserting at
 * the same point, unless they did it identically. Those are a disagreement.
 */

/** One side's change: base lines `[start, end)` replaced by `lines`. */
interface Hunk {
  start: number;
  end: number;
  lines: string[];
}

/** The hunks that turn `base` into `side`, from a longest common subsequence. */
function hunks(base: readonly string[], side: readonly string[]): Hunk[] {
  const n = base.length;
  const m = side.length;
  // lcs[i][j]: the common subsequence's length of base[i..] and side[j..].
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    const row = lcs[i] as number[];
    const below = lcs[i + 1] as number[];
    for (let j = m - 1; j >= 0; j--) {
      row[j] =
        base[i] === side[j]
          ? (below[j + 1] as number) + 1
          : Math.max(below[j] as number, row[j + 1] as number);
    }
  }
  const out: Hunk[] = [];
  let i = 0;
  let j = 0;
  let open: Hunk | null = null;
  const at = (a: number, b: number) => (lcs[a] as number[])[b] as number;
  while (i < n || j < m) {
    if (i < n && j < m && base[i] === side[j] && at(i, j) === at(i + 1, j + 1) + 1) {
      if (open) out.push(open);
      open = null;
      i++;
      j++;
      continue;
    }
    open ??= { start: i, end: i, lines: [] };
    if (j < m && (i === n || at(i, j + 1) >= at(i + 1, j))) open.lines.push(side[j++] as string);
    else open.end = ++i;
  }
  if (open) out.push(open);
  return out;
}

function sameHunk(a: Hunk, b: Hunk): boolean {
  return a.start === b.start && a.end === b.end && a.lines.join("\n") === b.lines.join("\n");
}

/** Whether two sides' hunks touch the same base lines, or insert at one point. */
function clash(a: Hunk, b: Hunk): boolean {
  if (a.start === a.end && b.start === b.end) return a.start === b.start;
  if (a.start === a.end) return b.start < a.start && a.start < b.end;
  if (b.start === b.end) return a.start < b.start && b.start < a.end;
  return a.start < b.end && b.start < a.end;
}

/** `base` with both sides' edits, or `null` when they changed the same lines differently. */
export function mergeLines(base: string, trunk: string, lane: string): string | null {
  const was = base.split("\n");
  const ours = hunks(was, trunk.split("\n"));
  const theirs = hunks(was, lane.split("\n"));
  const all: Hunk[] = [...ours];
  for (const h of theirs) {
    if (ours.some((o) => sameHunk(o, h))) continue;
    if (ours.some((o) => clash(o, h))) return null;
    all.push(h);
  }
  // An insertion sorts before a change starting at the same line, so a line
  // put under `Found:` stays above the `Files:` line the other side rewrote.
  all.sort((a, b) => a.start - b.start || a.end - b.end);
  const out: string[] = [];
  let i = 0;
  for (const h of all) {
    out.push(...was.slice(i, h.start), ...h.lines);
    i = h.end;
  }
  out.push(...was.slice(i));
  return out.join("\n");
}
