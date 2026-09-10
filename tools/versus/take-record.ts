/**
 * The record's side of taking a function-valued field: the field pointed at
 * the moved function, and the old value's import taken out.
 *
 * Cut off `take-function.ts` when the two halves of that file went past its
 * length together. That file reads the candidate and moves its files; this
 * edits the shipped record, which is the one write in the whole take that can
 * lose somebody's work, and so is the half with the refusals in it.
 */

import { importedFrom, partner, skipString } from "./take-function.js";

/** One record field pointed somewhere else, and what stood there before. */
export interface Pointed {
  readonly text: string;
  /** The value's old spelling — an identifier, or an inline function's text. */
  readonly was: string;
}

export interface PointRefusal {
  readonly why: string;
}

/**
 * A record's field pointed at an identifier imported from `spec`, with the
 * import added — to a line that already imports from `spec`, or as a new line
 * after the last import. `{ pit }` becomes `{ pit: shards }`; `pit: old`
 * becomes `pit: shards`; an inline function is replaced whole.
 *
 * A name the record file already uses is a refusal rather than a shadow: the
 * moved file's export could be renamed, but not by a tool that would have to
 * guess what to.
 */
export function pointRecord(
  src: string,
  symbol: string,
  field: string,
  ident: string,
  spec: string,
): Pointed | PointRefusal {
  // Names in code, not in strings or comments: an import path that happens to
  // contain the word is not a name in use.
  if (new RegExp(`\\b${ident}\\b`).test(bareCode(src))) {
    return {
      why: `\`${ident}\` is already a name in this file; the moved function cannot be imported under it`,
    };
  }
  const decl = new RegExp(`export\\s+const\\s+${symbol}\\b`).exec(src);
  if (!decl) return { why: `no \`export const ${symbol}\` in this file` };
  const open = src.indexOf("{", src.indexOf("=", decl.index));
  if (open < 0) return { why: `\`${symbol}\` is not assigned an object literal` };
  const close = partner(src, open);
  const span = valueSpan(src, open, close, field);
  if (!span) return { why: `no \`${field}\` at the top level of \`${symbol}\`` };
  const old = src.slice(span.from, span.to);
  const was = old.trim();
  const tail = /\s*$/.exec(old)?.[0] ?? "";
  let out = `${src.slice(0, span.from)}${span.lead}${field}: ${ident}${tail}${src.slice(span.to)}`;
  out = addImport(out, ident, spec);
  return { text: out, was };
}

/** Where one field stands inside a literal — the whole `name: value` or the
 * shorthand `name` — and the whitespace that led to it. */
function valueSpan(
  src: string,
  open: number,
  close: number,
  field: string,
): { from: number; to: number; lead: string } | undefined {
  let depth = 0;
  for (let i = open; i <= close; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i);
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    if (depth !== 1) continue;
    const head = new RegExp(`^(\\s*)${field}(\\s*:|\\s*(?=[,}]))`).exec(
      src.slice(i, i + field.length + 40),
    );
    if (!head || !/[{,\s]/.test(src[i - 1] ?? "")) continue;
    const from = i;
    // The value runs to the comma or closing brace at this depth.
    let d = 0;
    for (let j = i + head[0].length; j <= close; j++) {
      const ch = src[j];
      if (ch === '"' || ch === "'" || ch === "`") {
        j = skipString(src, j);
        continue;
      }
      if (ch === "{" || ch === "[" || ch === "(") d++;
      if (ch === "}" || ch === "]" || ch === ")") {
        if (d === 0) return { from, to: j, lead: head[1] ?? "" };
        d--;
      }
      if (ch === "," && d === 0) return { from, to: j, lead: head[1] ?? "" };
    }
    return undefined;
  }
  return undefined;
}

function addImport(src: string, ident: string, spec: string): string {
  const existing = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*"${spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}";`,
  );
  const hit = existing.exec(src);
  if (hit) {
    const names = (hit[1] ?? "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    names.push(ident);
    names.sort();
    return src.replace(hit[0], `import { ${names.join(", ")} } from "${spec}";`);
  }
  const line = `import { ${ident} } from "${spec}";\n`;
  const imports = [...src.matchAll(/^import[^;]*;\n/gm)];
  const last = imports[imports.length - 1];
  if (!last || last.index === undefined) return line + src;
  const at = last.index + last[0].length;
  return src.slice(0, at) + line + src.slice(at);
}

/** What retiring an old value found. */
export interface Retired {
  readonly text: string;
  /** The relative module the old identifier came from, when it was imported. */
  readonly module?: string;
  readonly note: string;
}

/**
 * The old value's import taken out of the record file, when it was one.
 *
 * An identifier imported from a relative module loses its name in that import
 * — the whole line when it was alone there — and the module is reported so
 * the file-system half can ask whether anything else still reads it. An
 * identifier declared in this file, or an inline function, leaves nothing to
 * take out here and says so.
 */
export function retireImport(src: string, was: string): Retired {
  if (!/^[A-Za-z_$][\w$]*$/.test(was))
    return { text: src, note: "the old value was written inline; it went with the field" };
  const spec = importedFrom(src, was);
  if (spec === undefined)
    return {
      text: src,
      note: `\`${was}\` is declared in the record's own file and is left standing`,
    };
  const re = new RegExp(
    `import\\s*(type\\s*)?\\{([^}]*)\\}\\s*from\\s*"${spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}";\\n?`,
  );
  const hit = re.exec(src);
  if (!hit)
    return { text: src, note: `\`${was}\` is imported in a form this cannot edit; left standing` };
  const names = (hit[2] ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(
      (n) =>
        n &&
        n
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .pop() !== was,
    );
  const text =
    names.length === 0
      ? src.replace(hit[0], "")
      : src.replace(hit[0], `import ${hit[1] ?? ""}{ ${names.join(", ")} } from "${spec}";\n`);
  return { text, module: spec, note: `\`${was}\` is no longer imported from \`${spec}\`` };
}

/** The source with every string literal and comment blanked, so a word found
 * in it is an identifier and not a path or a sentence. */
function bareCode(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
}
