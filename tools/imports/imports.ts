/**
 * Dropping the names a file split strands in an import list, and refusing to
 * delete a statement.
 *
 * The narrow half of a fix biome will only offer whole. Its unsafe fix for
 * `correctness/noUnusedImports` deletes an unused import together with the doc
 * comment above it, which is why `tools/hooks/guard.ts` blocks
 * `--write --unsafe`; but taking one *specifier* out of a list —
 * `step` out of `import { beatPhase, step, type World }` — touches no comment
 * at all, because the comment is attached to the statement and the statement
 * survives. That case is this file. The other one, where the whole statement
 * would go, is reported and left for somebody to read — **when there is a
 * comment directly above it**. With none, the statement goes too: the previous
 * line is another import, a blank or the file's start, so there is nothing
 * for the cut to take with it. Cutting the field's hands out of `step.ts` on
 * 23 September 2026 stranded fourteen such statements, not one with a comment
 * over it, and all fourteen were printed for a person and cut by a script.
 */

import { classify } from "./classify.js";
import { type Binding, type ImportDecl, importDecls } from "./scan.js";
import { usedElsewhere } from "./uses.js";

/** A statement every one of whose names is unused, under a comment: left alone, and reported. */
export type Left = {
  readonly line: number;
  readonly lastLine: number;
  readonly names: readonly string[];
  readonly statement: string;
};

/** One name taken out of a list, for the report. */
export type Dropped = { readonly line: number; readonly name: string };

export type Pruned = {
  readonly text: string;
  readonly dropped: readonly Dropped[];
  readonly left: readonly Left[];
};

function lineOf(text: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

/**
 * The statement's whole lines, when it can go without taking a comment: it
 * starts its line, nothing but whitespace follows it on its last one, and the
 * line above is blank, the file's start, or part of another import. A blank on
 * both sides goes with it, so the gap it leaves is one blank and not two.
 */
function statementCut(
  text: string,
  decl: ImportDecl,
  decls: readonly ImportDecl[],
): [number, number] | null {
  const from = text.lastIndexOf("\n", decl.start - 1) + 1;
  if (text.slice(from, decl.start).trim() !== "") return null;
  const eol = text.indexOf("\n", decl.end);
  const lineEnd = eol < 0 ? text.length : eol;
  if (text.slice(decl.end, lineEnd).trim() !== "") return null;
  let to = eol < 0 ? text.length : eol + 1;

  let above = from - 2;
  while (above >= 0 && /\s/.test(text[above] ?? "") && text[above] !== "\n") above--;
  const blankAbove = from === 0 || above < 0 || text[above] === "\n";
  if (!blankAbove && !decls.some((d) => d !== decl && above >= d.start && above < d.end)) {
    return null;
  }
  if (blankAbove) {
    const next = text.indexOf("\n", to);
    if (next >= 0 && text.slice(to, next).trim() === "") to = next + 1;
  }
  return [from, to];
}

/** A cut, and the whitespace and comma that would otherwise be left behind. */
function widen(text: string, from: number, to: number, listEnd: number): [number, number] {
  let after = to;
  while (after < text.length && /\s/.test(text[after] ?? "")) after++;
  if (text[after] === "," && after < listEnd) {
    after++;
    while (after < text.length && /[^\S\n]/.test(text[after] ?? "")) after++;
    if (text[after] === "\n") after++;
    return [from, after];
  }
  let before = from;
  while (before > 0 && /\s/.test(text[before - 1] ?? "")) before--;
  if (text[before - 1] === ",") return [before - 1, to];
  return [from, to];
}

/**
 * `source` with every stranded specifier taken out of its list, plus what was
 * dropped and what was left for a person.
 *
 * When every name a statement binds is unused, the statement goes whole if
 * `statementCut` finds no comment above it, and each of its names is a
 * `Dropped` row; otherwise it is untouched and one `Left` row says so.
 */
export function pruneImports(source: string): Pruned {
  const decls = importDecls(source);
  const kind = classify(source);
  const dropped: Dropped[] = [];
  const left: Left[] = [];
  const cuts: [number, number][] = [];

  for (const decl of decls) {
    if (decl.bindings.length === 0) continue;
    const unused = decl.bindings.filter((b) => !usedElsewhere(b.local, source, kind, decls));
    if (unused.length === 0) continue;
    if (unused.length === decl.bindings.length) {
      const whole = statementCut(source, decl, decls);
      if (whole) {
        cuts.push(whole);
        for (const b of unused) dropped.push({ line: lineOf(source, b.start), name: b.local });
        continue;
      }
      left.push({
        line: lineOf(source, decl.start),
        lastLine: lineOf(source, decl.end - 1),
        names: unused.map((b) => b.local),
        statement: source.slice(decl.start, decl.end).replace(/\s+/g, " "),
      });
      continue;
    }
    const listGone =
      decl.listStart !== null &&
      decl.bindings.filter((b) => b.kind === "named").length ===
        unused.filter((b) => b.kind === "named").length &&
      unused.some((b) => b.kind === "named");
    for (const binding of unused) {
      dropped.push({ line: lineOf(source, binding.start), name: binding.local });
    }
    const listEnd = decl.listEnd ?? decl.end;
    for (const [from, to] of runsOf(source, decl.bindings, new Set(unused))) {
      if (listGone && decl.bindings.some((b) => b.start === from && b.kind === "named")) continue;
      cuts.push(widen(source, from, to, listEnd));
    }
    // An emptied `{ }` goes with the comma that held it on, never on its own.
    if (listGone && decl.listStart !== null && decl.listEnd !== null) {
      cuts.push(widen(source, decl.listStart, decl.listEnd, decl.end));
    }
  }

  let text = source;
  for (const [from, to] of merged(cuts).reverse()) {
    text = text.slice(0, from) + text.slice(to);
  }
  return { text, dropped, left };
}

/**
 * The unused bindings as spans, neighbours joined: two unused names side by
 * side are one cut, not two that each claim the comma between them. Cut one
 * by one, `paintSpace` at the end of `{ actTint, drawStars, paintSpace }`
 * reached back for the comma `drawStars` had already taken, and the list
 * lost its `}` instead (`docs/queue.md`, 16 October 2026). A comment between
 * two names keeps them apart, so it stays where it is.
 */
function runsOf(
  text: string,
  bindings: readonly Binding[],
  unused: ReadonlySet<Binding>,
): [number, number][] {
  const runs: [number, number][] = [];
  let run: [number, number] | null = null;
  for (const b of bindings) {
    if (!unused.has(b)) {
      run = null;
      continue;
    }
    if (run && b.kind === "named" && /^[\s,]*$/.test(text.slice(run[1], b.start))) run[1] = b.end;
    else {
      run = [b.start, b.end];
      runs.push(run);
    }
  }
  return runs;
}

/** The cuts in order, any that overlap made one, so no cut is applied to text another has moved. */
function merged(cuts: readonly [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [from, to] of [...cuts].sort((a, b) => a[0] - b[0])) {
    const last = out[out.length - 1];
    if (last && from < last[1]) last[1] = Math.max(last[1], to);
    else out.push([from, to]);
  }
  return out;
}
