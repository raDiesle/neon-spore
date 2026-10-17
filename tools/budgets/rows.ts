/**
 * **The op-count budget rows of a test file, read and raised in place** — the
 * half of `bun run budgets:measure` that needs no test run (`measure.ts`).
 *
 * Seven files in `packages/render/test` keep a budget as object literals of
 * op counts, and a look that moves every frame moves dozens of them: the
 * siren's idle bar moved 98 values across six files on 17 October 2026. A
 * file's `MEASURE` switch prints each row as `budgetRow` writes it, and the
 * rows went back into their tables by hand — or by a scratch script that a
 * lane wrote, used once and threw away. This is that script, kept.
 *
 * A printed row is matched to **the next literal in the source with the same
 * key set**, in order, which is how the tables are laid out: the rows are
 * measured in the order they are written. A literal is only an object of
 * `key: number` pairs, comments allowed between them — two of the files keep
 * a sentence inside a row — so a viewport or a config is never mistaken for
 * one unless its keys are a printed row's. A value is **raised and never
 * lowered**: a budget is a ceiling, and a count that came in under it is
 * left where it was, so a lowered row is always somebody's decision.
 */

/** One printed or written row: its keys in order, and their values. */
export type Row = ReadonlyMap<string, number>;

/** A row literal in source, with where each value sits so it can be rewritten. */
export interface Literal {
  /** Offset of its `{`. */
  start: number;
  fields: { key: string; value: number; from: number; to: number }[];
}

/** What `raise` did. */
export interface Raised {
  text: string;
  /** Every value that went up: the source line, the key, from, to. */
  changes: { line: number; key: string; from: number; to: number }[];
}

/** `const MEASURE = …;`, once per budget file. */
const SWITCH = /^const MEASURE = (true|false);$/m;

/** The file with its switch thrown to `on`. Throws unless it has exactly one. */
export function withMeasure(source: string, on: boolean): string {
  const all = source.match(new RegExp(SWITCH.source, "gm")) ?? [];
  if (all.length !== 1) {
    throw new Error(`wants one \`const MEASURE = false;\` line, found ${all.length}`);
  }
  return source.replace(SWITCH, `const MEASURE = ${on};`);
}

/** Every row the test printed, in order: a line ending in a `{ … },` literal. */
export function printedRows(output: string): Row[] {
  const rows: Row[] = [];
  for (const line of output.split("\n")) {
    const at = line.indexOf("{");
    if (at < 0 || !/\},\s*$/.test(line)) continue;
    const lit = literalAt(line, at);
    if (lit) rows.push(new Map(lit.fields.map((f) => [f.key, f.value])));
  }
  return rows;
}

/** Every row literal in `source`, in order, skipping strings and comments. */
export function rowLiterals(source: string): Literal[] {
  const out: Literal[] = [];
  let i = 0;
  while (i < source.length) {
    const skipped = skipQuoted(source, i);
    if (skipped > i) {
      i = skipped;
      continue;
    }
    if (source[i] === "{") {
      const lit = literalAt(source, i);
      if (lit) out.push(lit);
    }
    i++;
  }
  return out;
}

/**
 * `source` with each printed row's values raised where they rose, matched to
 * the next literal with the same key set. Throws, naming the row, when one
 * matches nothing — a file is written whole or not at all.
 */
export function raise(source: string, printed: readonly Row[]): Raised {
  const literals = rowLiterals(source);
  const edits: { from: number; to: number; value: number }[] = [];
  const changes: Raised["changes"] = [];
  let cursor = 0;
  printed.forEach((row, n) => {
    const keys = [...row.keys()].sort().join(",");
    let found = cursor;
    while (found < literals.length && keysOf(literals[found] as Literal) !== keys) found++;
    const lit = literals[found];
    if (!lit) throw new Error(`printed row ${n + 1} (${keys}) matches no row literal after it`);
    cursor = found + 1;
    for (const f of lit.fields) {
      const measured = row.get(f.key) ?? 0;
      if (measured <= f.value) continue;
      edits.push({ from: f.from, to: f.to, value: measured });
      changes.push({ line: lineOf(source, f.from), key: f.key, from: f.value, to: measured });
    }
  });
  let text = source;
  for (const e of edits.sort((a, b) => b.from - a.from)) {
    text = text.slice(0, e.from) + String(e.value) + text.slice(e.to);
  }
  return { text, changes };
}

function keysOf(lit: Literal): string {
  return lit.fields
    .map((f) => f.key)
    .sort()
    .join(",");
}

function lineOf(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset; i++) if (source.charCodeAt(i) === 10) line++;
  return line;
}

/** The literal opening at `start`, or null when what follows is not one. */
function literalAt(s: string, start: number): Literal | null {
  const fields: Literal["fields"] = [];
  let i = gap(s, start + 1);
  while (s[i] !== "}") {
    const key = keyAt(s, i);
    if (!key) return null;
    i = gap(s, key.end);
    if (s[i] !== ":") return null;
    i = gap(s, i + 1);
    const num = /^\d[\d_]*/.exec(s.slice(i, i + 24));
    if (!num) return null;
    fields.push({
      key: key.name,
      value: Number(num[0].replace(/_/g, "")),
      from: i,
      to: i + num[0].length,
    });
    i = gap(s, i + num[0].length);
    if (s[i] === ",") i = gap(s, i + 1);
    else if (s[i] !== "}") return null;
  }
  return fields.length > 0 ? { start, fields } : null;
}

function keyAt(s: string, i: number): { name: string; end: number } | null {
  const q = s[i];
  if (q === '"' || q === "'") {
    const close = s.indexOf(q, i + 1);
    return close < 0 ? null : { name: s.slice(i + 1, close), end: close + 1 };
  }
  const id = /^[A-Za-z_$][\w$]*/.exec(s.slice(i, i + 64));
  return id ? { name: id[0], end: i + id[0].length } : null;
}

/** Past whitespace and comments from `i`. */
function gap(s: string, i: number): number {
  for (;;) {
    while (i < s.length && /\s/.test(s[i] as string)) i++;
    if (s.startsWith("//", i)) {
      const nl = s.indexOf("\n", i);
      i = nl < 0 ? s.length : nl + 1;
    } else if (s.startsWith("/*", i)) {
      const end = s.indexOf("*/", i + 2);
      i = end < 0 ? s.length : end + 2;
    } else return i;
  }
}

/** Past a comment or a string starting at `i`, or `i` itself when neither does. */
function skipQuoted(s: string, i: number): number {
  if (s.startsWith("//", i) || s.startsWith("/*", i)) return gap(s, i);
  const q = s[i];
  if (q !== '"' && q !== "'" && q !== "`") return i;
  let j = i + 1;
  while (j < s.length && s[j] !== q) j += s[j] === "\\" ? 2 : 1;
  return j + 1;
}
