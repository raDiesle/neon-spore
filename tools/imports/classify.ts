/**
 * Which of a file's characters are code rather than a comment or a string.
 *
 * The comment is the whole reason this exists: `tools/hooks/guard.ts` refuses
 * biome's `--unsafe` fix precisely because it deletes a statement together with
 * the doc comment above it, and `imports.ts` only dares drop a name that is
 * written nowhere outside a comment. So a scanner that reads a comment as code
 * merely keeps a name nobody uses, while one that reads a string as code can
 * see `//` inside a URL and swallow the rest of the line — and the use it hides
 * is the reason that name stays. Strings are therefore scanned exactly,
 * template substitutions and all, and every remaining doubt is spent on keeping
 * a name rather than cutting one.
 */

/** A character is code, part of a string or regex, or part of a comment. */
export const CODE = 0;
export const STRING = 1;
export const COMMENT = 2;

/** After one of these, a `/` opens a regex rather than dividing. */
const BEFORE_REGEX = new Set("(,=:[!&|?{};+-*%~^<>".split(""));

/** And after one of these words, which end in a character a name could end in. */
const KEYWORDS_BEFORE_REGEX = new Set([
  "return",
  "typeof",
  "case",
  "in",
  "of",
  "do",
  "else",
  "yield",
  "await",
  "void",
  "delete",
  "instanceof",
]);

function stringEnd(text: string, open: number, quote: string): number {
  let i = open + 1;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === quote || c === "\n") return i + 1;
    i++;
  }
  return text.length;
}

/** Past the closing `/` and its flags. A character class may hold a bare `/`. */
function regexEnd(text: string, open: number): number {
  let i = open + 1;
  let inClass = false;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === "\n") return i;
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      i++;
      while (i < text.length && /[a-z]/.test(text[i] ?? "")) i++;
      return i;
    }
    i++;
  }
  return text.length;
}

/**
 * Every character of `text`, as `CODE`, `STRING` or `COMMENT`.
 *
 * A template literal's `${...}` is code, and the braces inside it are counted,
 * so a template nested in a substitution ends where it really ends rather than
 * at the next backtick.
 */
export function classify(text: string): Uint8Array {
  const kind = new Uint8Array(text.length);
  const substitutions: number[] = [];
  let depth = 0;
  let last = "";
  let lastWord = "";
  let i = 0;
  const mark = (from: number, to: number, k: number) => {
    for (let j = from; j < to && j < text.length; j++) kind[j] = k;
  };

  /** From a backtick or the `}` closing a substitution to the next hole or end. */
  const template = (from: number): number => {
    let j = from + 1;
    while (j < text.length) {
      const c = text[j];
      if (c === "\\") {
        j += 2;
        continue;
      }
      if (c === "`") {
        mark(from, j + 1, STRING);
        return j + 1;
      }
      if (c === "$" && text[j + 1] === "{") {
        mark(from, j + 2, STRING);
        substitutions.push(depth);
        return j + 2;
      }
      j++;
    }
    mark(from, text.length, STRING);
    return text.length;
  };

  while (i < text.length) {
    const c = text[i] ?? "";
    const next = text[i + 1];
    if (c === "/" && next === "/") {
      const stop = text.indexOf("\n", i);
      const end = stop < 0 ? text.length : stop;
      mark(i, end, COMMENT);
      i = end;
      continue;
    }
    if (c === "/" && next === "*") {
      const close = text.indexOf("*/", i + 2);
      const end = close < 0 ? text.length : close + 2;
      mark(i, end, COMMENT);
      i = end;
      continue;
    }
    if (c === '"' || c === "'") {
      const end = stringEnd(text, i, c);
      mark(i, end, STRING);
      last = c;
      i = end;
      continue;
    }
    if (c === "`") {
      i = template(i);
      last = "`";
      continue;
    }
    // A `/` after a name or a closing bracket divides; after anything else it
    // opens a regex. Reading a division as a regex only hides code inside a
    // string region, which keeps a name rather than dropping one.
    if (
      c === "/" &&
      (last === "" || BEFORE_REGEX.has(last) || KEYWORDS_BEFORE_REGEX.has(lastWord))
    ) {
      const end = regexEnd(text, i);
      mark(i, end, STRING);
      last = "/";
      i = end;
      continue;
    }
    if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i;
      while (j < text.length && /[A-Za-z0-9_$]/.test(text[j] ?? "")) j++;
      lastWord = text.slice(i, j);
      last = text[j - 1] ?? "";
      i = j;
      continue;
    }
    lastWord = "";
    if (c === "{") depth++;
    else if (c === "}") {
      const open = substitutions.at(-1);
      if (open !== undefined && depth === open) {
        substitutions.pop();
        i = template(i);
        last = "`";
        continue;
      }
      depth--;
    }
    if (!/\s/.test(c)) last = c;
    i++;
  }
  return kind;
}
