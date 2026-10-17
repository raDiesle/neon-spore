import { lineCount } from "../../hooks/file-size.ts";

/**
 * **How many lines a text will be once Biome has formatted it.**
 *
 * The serializer aims at Biome's output, and misses on a line it never
 * learned to wrap — a blister's arrival with its gesture fields, THE SEAM's
 * thirteen steps on one line. Biome breaks them after the save, and an act
 * the cut judged at 240 lines landed at 340 (15 October 2026, when the
 * bosses moved). So the cut counts what Biome will make of a line, not the
 * line: one that fits is one; one that does not is its outermost bracket
 * broken one item to a line, each item judged again two spaces in.
 */

const WIDTH = 100;

/** Walks `text` from `from`, skipping strings, and calls `at` on every
 * character outside one with the bracket depth before it. */
function walk(text: string, from: number, at: (c: string, i: number, depth: number) => boolean) {
  let depth = 0;
  let quote = "";
  for (let i = from; i < text.length; i++) {
    const c = text[i] as string;
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (at(c, i, depth)) return;
    if ("[{(".includes(c)) depth++;
    else if ("]})".includes(c)) depth--;
  }
}

/** The index of the bracket closing the one at `open`. */
function closing(line: string, open: number): number {
  let found = -1;
  walk(line, open, (c, i, depth) => {
    if (depth === 1 && "]})".includes(c)) found = i;
    return found >= 0;
  });
  return found;
}

/** The items of a bracket's inside, split at its own commas. */
function items(inside: string): string[] {
  const cuts = [-1];
  walk(inside, 0, (c, i, depth) => {
    if (c === "," && depth === 0) cuts.push(i);
    return false;
  });
  cuts.push(inside.length);
  return cuts
    .slice(1)
    .map((end, k) => inside.slice((cuts[k] as number) + 1, end).trim())
    .filter((s) => s.length > 0);
}

/**
 * Whether an item is one Biome never keeps beside another in an array: an
 * object of two fields or more, or an array of two items or more.
 */
function bulky(item: string): boolean {
  const pair = item.startsWith("{") ? "}" : item.startsWith("[") ? "]" : "";
  if (!pair || !item.endsWith(pair)) return false;
  return items(item.slice(1, -1)).length > 1;
}

/**
 * Whether a line holds an array Biome breaks however short it is — two or
 * more items, every one bulky (THE GOVERNOR's `marks`, 17 October 2026: an
 * act the cut judged at 238 lines landed at 251). A line that holds one is
 * broken at its outermost bracket too, as Biome breaks every group round a
 * group that must break.
 */
function mustBreak(line: string): boolean {
  let found = false;
  walk(line, 0, (c, i) => {
    if (c !== "[") return false;
    const close = closing(line, i);
    const inner = close < 0 ? [] : items(line.slice(i + 1, close));
    found = inner.length > 1 && inner.every(bulky);
    return found;
  });
  return found;
}

/** The lines Biome makes of one line. */
export function biomeLines(line: string, width = WIDTH): number {
  if (line.length <= width && !mustBreak(line)) return 1;
  let open = -1;
  walk(line, 0, (c, i) => {
    if ("[{(".includes(c)) open = i;
    return open >= 0;
  });
  const close = open < 0 ? -1 : closing(line, open);
  if (close < 0) return 1;
  const indent = " ".repeat((line.match(/^ */)?.[0].length ?? 0) + 2);
  const inner = items(line.slice(open + 1, close));
  return inner.reduce((n, item) => n + biomeLines(`${indent}${item},`, width), 2);
}

/** The lines Biome makes of a whole text, counted as `lineCount` counts. */
export function biomeLineCount(text: string): number {
  return text.split("\n").reduce((n, line) => n + biomeLines(line) - 1, lineCount(text));
}
