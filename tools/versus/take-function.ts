/**
 * Taking a candidate whose field is a **function**: the text work, with no
 * file system in it.
 *
 * `record-edit.ts` writes a value into a record and refuses a function, and
 * the refusal is right — `toString` hands back what the transpiler made, not
 * how the file spells it. What it meant in practice was measured the day the
 * command was written: fourteen of fifteen candidates patch a drawing
 * function, so `adopt` reached one slot in fifteen and every other adoption
 * was a lane doing by hand the four steps the refusal printed. Those four are
 * the same every time, which is what makes them a tool's job rather than a
 * person's:
 *
 * 1. the candidate's implementation file moves into the package the record
 *    lives in (`destinationFor`);
 * 2. its import specifiers are rewritten for where it now stands
 *    (`rewriteSpecifiers`);
 * 3. the record's field points at the moved function (`pointRecord`, in
 *    `take-record.ts` beside this);
 * 4. the implementation nothing reads any more goes (`retireImport` there,
 *    and the file itself in `take-function-fs.ts`, which is the half that
 *    looks).
 *
 * Every function here takes source text and gives source text back, so the
 * test can hold it to a candidate written in a string. The candidate's own
 * `index.ts` is read for one fact — which identifier the field is given, and
 * which sibling file that identifier is imported from — and a field written
 * as an inline function stays a refusal: there is no file to move, and
 * copying a function body out of one literal into another is the guess this
 * tool exists not to make.
 */

import { basename, posix } from "node:path";

/** Which identifier a field is given in a candidate's `fields: { … }`, or
 * undefined for a field written inline or not written at all. `{ pit }` is
 * `pit`. */
export function fieldIdent(indexSrc: string, field: string): string | undefined {
  const at = /\bfields\s*:\s*\{/.exec(indexSrc);
  if (!at) return undefined;
  const open = at.index + at[0].length - 1;
  const close = partner(indexSrc, open);
  const body = indexSrc.slice(open + 1, close);
  const named = new RegExp(`(?:^|[,{\\s])${field}\\s*:\\s*([A-Za-z_$][\\w$]*)\\s*(?:,|$)`).exec(
    body.trim(),
  );
  if (named) return named[1];
  const shorthand = new RegExp(`(?:^|[,{\\s])${field}\\s*(?:,|$)`).exec(body.trim());
  return shorthand ? field : undefined;
}

/** The module an identifier is imported from in this source, or undefined
 * when it is not imported by that name — declared locally, or reached as
 * `ns.member`, both of which are a refusal. */
export function importedFrom(src: string, ident: string): string | undefined {
  const re = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*"([^"]+)"/g;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    const names = (m[1] ?? "").split(",").map((n) => {
      const parts = n
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/);
      return (parts[1] ?? parts[0] ?? "").trim();
    });
    if (names.includes(ident)) return m[2];
  }
  return undefined;
}

/**
 * Where a candidate's sibling file lands, repo-relative.
 *
 * The default name is the record's file with its `-look` taken off, then the
 * candidate's own name: `spall` on `crater-look.ts` becomes `crater-spall.ts`.
 * A sibling not called `paint` keeps its own name as a suffix, so GULLET's
 * `throat.ts` becomes `hull-gullet-throat.ts` and a set of files that import
 * each other stays a set. `as` is the flag that overrides the base.
 */
export function destinationFor(
  recordFile: string,
  candidate: string,
  sibling: string,
  as?: string,
): string {
  const pkgSrc = posix.dirname(recordFile);
  const stem = basename(recordFile, ".ts").replace(/-look$/, "");
  const base = as ?? `${stem}-${candidate}`;
  const name = sibling === "paint" ? base : `${base}-${sibling}`;
  return posix.join(pkgSrc, `${name}.ts`);
}

/** The package a repo-relative path is in — `render` for
 * `packages/render/src/x.ts` — or undefined outside `packages/`. */
export function packageOf(file: string): string | undefined {
  const m = /^packages\/([^/]+)\/src\//.exec(file);
  return m?.[1];
}

/**
 * A moved file's import specifiers, rewritten for where it now stands.
 *
 * Three cases, resolved against the file's old directory. A specifier that
 * reaches a **sibling that moved with it** follows the sibling to its new
 * name. One that reaches into the **package the file is moving into** becomes
 * the short relative form, `./x.js`. One that reaches **another package**
 * becomes that package's bare specifier — the candidate directory has no
 * `package.json` and the package it is moving into does — which reaches only
 * what the package's index exports; `bun run check` says so if it does not.
 * Anything else is left alone: a bare specifier already, or a path this
 * cannot place, which the check will name.
 */
export function rewriteSpecifiers(
  src: string,
  from: string,
  to: string,
  moved: ReadonlyMap<string, string>,
): string {
  const fromDir = posix.dirname(from);
  const toDir = posix.dirname(to);
  const pkg = packageOf(to);
  return src.replace(/(from\s*")([^"]+)(")/g, (whole, head: string, spec: string, tail: string) => {
    if (!spec.startsWith(".")) return whole;
    const abs = posix.normalize(posix.join(fromDir, spec)).replace(/\.js$/, ".ts");
    const landed = moved.get(abs);
    if (landed) return `${head}${relative(toDir, landed)}${tail}`;
    const target = packageOf(abs);
    if (target === undefined) return whole;
    if (target === pkg) return `${head}${relative(toDir, abs)}${tail}`;
    return `${head}@neon-spore/${target}${tail}`;
  });
}

/** `./x.js` from one directory to a file, always with the leading dot. */
function relative(fromDir: string, file: string): string {
  const rel = posix.relative(fromDir, file).replace(/\.ts$/, ".js");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

/** The repo-relative file a relative specifier in `file` reaches. */
export function resolveSpec(file: string, spec: string): string {
  return posix.normalize(posix.join(posix.dirname(file), spec)).replace(/\.js$/, ".ts");
}

/** `paint` for `tools/versus/candidates/x/y/paint.ts`. */
export function siblingName(file: string): string {
  return basename(file, ".ts");
}

/** The index of the bracket closing the one that opens at `open`. */
export function partner(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
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
    if (c === "}" || c === "]" || c === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return src.length - 1;
}

export function skipString(src: string, i: number): number {
  const quote = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") {
      j++;
      continue;
    }
    if (src[j] === quote) return j;
  }
  return src.length;
}
