/**
 * Where a file's import statements are: which names each one binds, and what
 * text binds them.
 *
 * The ranges here are what `imports.ts` cuts, and they are deliberately narrow.
 * A statement's range stops at its `;` so that the doc comment above it is
 * outside every cut, and an element's range starts at the first code character
 * inside the list so that a comment written between two names stays where it
 * was. `classify.ts` says which characters are code.
 */

import { CODE, classify, STRING } from "./classify.js";

/** One name an import statement binds, and the text that binds it. */
export type Binding = {
  readonly local: string;
  readonly start: number;
  readonly end: number;
  readonly kind: "default" | "namespace" | "named";
};

/** One `import ... from "..."` statement. */
export type ImportDecl = {
  readonly start: number;
  readonly end: number;
  readonly bindings: readonly Binding[];
  /** The `{` and the character after the `}`, when the statement has a list. */
  readonly listStart: number | null;
  readonly listEnd: number | null;
};

function isWordChar(c: string | undefined): boolean {
  return c !== undefined && /[A-Za-z0-9_$]/.test(c);
}

function skipTrivia(text: string, kind: Uint8Array, from: number): number {
  let i = from;
  while (i < text.length && (kind[i] !== CODE || /\s/.test(text[i] ?? ""))) i++;
  return i;
}

function readWord(text: string, from: number): string {
  let i = from;
  while (i < text.length && isWordChar(text[i])) i++;
  return text.slice(from, i);
}

/** The local name an element of a `{ ... }` list binds: `type a as b` binds `b`. */
function localOf(element: string): string {
  const words = element.split(/\s+/).filter(Boolean);
  const as = words.lastIndexOf("as");
  const name = as >= 0 ? words[as + 1] : words.at(-1);
  return name ?? "";
}

function listBindings(text: string, kind: Uint8Array, open: number): Binding[] {
  const bindings: Binding[] = [];
  let start = open + 1;
  for (let i = start; i < text.length; i++) {
    if (kind[i] !== CODE) continue;
    const c = text[i];
    if (c !== "," && c !== "}") continue;
    // A comment written inside the list belongs to the element it sits before
    // and is left where it is: the range below starts at the first code
    // character, so dropping a name never takes a comment with it.
    let from = start;
    while (from < i && (kind[from] !== CODE || /\s/.test(text[from] ?? ""))) from++;
    let to = i;
    while (to > from && (kind[to - 1] !== CODE || /\s/.test(text[to - 1] ?? ""))) to--;
    if (to > from) {
      bindings.push({ local: localOf(text.slice(from, to)), start: from, end: to, kind: "named" });
    }
    if (c === "}") break;
    start = i + 1;
  }
  return bindings;
}

/** Past the statement: its `from "..."` and the `;` if one is written. */
function declEnd(text: string, kind: Uint8Array, from: number): number {
  let i = from;
  while (i < text.length) {
    if (kind[i] === STRING) {
      while (i < text.length && kind[i] === STRING) i++;
      const after = skipTrivia(text, kind, i);
      return text[after] === ";" ? after + 1 : i;
    }
    if (text[i] === "\n" && kind[i] === CODE) return i;
    i++;
  }
  return text.length;
}

function parseDecl(text: string, kind: Uint8Array, start: number): ImportDecl | null {
  let i = skipTrivia(text, kind, start + "import".length);
  const bindings: Binding[] = [];
  let listStart: number | null = null;
  let listEnd: number | null = null;
  if (kind[i] === STRING)
    return { start, end: declEnd(text, kind, i), bindings, listStart, listEnd };
  if (readWord(text, i) === "type") {
    const after = skipTrivia(text, kind, i + 4);
    if (readWord(text, after) !== "from") i = after;
  }
  while (i < text.length) {
    const c = text[i];
    if (c === "{") {
      listStart = i;
      bindings.push(...listBindings(text, kind, i));
      let close = i;
      while (close < text.length && !(text[close] === "}" && kind[close] === CODE)) close++;
      listEnd = close + 1;
      i = skipTrivia(text, kind, close + 1);
    } else if (c === "*") {
      const as = skipTrivia(text, kind, i + 1);
      const name = skipTrivia(text, kind, as + 2);
      const local = readWord(text, name);
      if (local === "") return null;
      bindings.push({ local, start: i, end: name + local.length, kind: "namespace" });
      i = skipTrivia(text, kind, name + local.length);
    } else if (isWordChar(c)) {
      const word = readWord(text, i);
      if (word === "from")
        return { start, end: declEnd(text, kind, i), bindings, listStart, listEnd };
      bindings.push({ local: word, start: i, end: i + word.length, kind: "default" });
      i = skipTrivia(text, kind, i + word.length);
    } else if (c === ",") {
      i = skipTrivia(text, kind, i + 1);
    } else return null;
  }
  return null;
}

/**
 * Every import statement in `text`, in order. A dynamic `import(...)` and the
 * word inside a comment or a string are not statements and are not returned.
 */
export function importDecls(text: string): ImportDecl[] {
  const kind = classify(text);
  const decls: ImportDecl[] = [];
  for (let i = 0; i + 6 <= text.length; i++) {
    if (kind[i] !== CODE || !text.startsWith("import", i)) continue;
    if (isWordChar(text[i - 1]) || text[i - 1] === "." || isWordChar(text[i + 6])) continue;
    const after = skipTrivia(text, kind, i + 6);
    if (text[after] === "(" || text[after] === ".") continue;
    const decl = parseDecl(text, kind, i);
    if (!decl) continue;
    decls.push(decl);
    i = decl.end - 1;
  }
  return decls;
}
