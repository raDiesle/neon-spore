/**
 * Taking a candidate's function-valued fields: the half that looks at the
 * tree.
 *
 * `take-function.ts` is the text work and is tested on strings; this reads the
 * candidate's `index.ts` and its siblings, decides where every file lands,
 * asks whether anything still imports what the record used to point at, and
 * hands `decide.ts` a plan it can write in one go — or the first reason it
 * cannot. Nothing here writes: `adopt` collects the whole slot's plan before
 * it touches a file, so a candidate with three good fields and one this cannot
 * place leaves the tree exactly as it found it.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import {
  destinationFor,
  fieldIdent,
  importedFrom,
  resolveSpec,
  rewriteSpecifiers,
  siblingName,
} from "./take-function.js";
import { pointRecord, retireImport } from "./take-record.js";
import type { Patch, Variant } from "./variant.js";

/** One file that moves: where it was, where it lands, and its rewritten text. */
export interface Moved {
  readonly from: string;
  readonly to: string;
  readonly text: string;
}

/** A module the record stopped importing, and what becomes of its file. */
export interface Retired {
  readonly file: string;
  /** Whether the file goes: nothing else imports it once the record stops. */
  readonly delete: boolean;
  readonly note: string;
}

export interface FunctionTake {
  readonly moves: readonly Moved[];
  /** The record's text with every function field pointed at its moved home. */
  readonly recordText: string;
  readonly fields: readonly { field: string; ident: string; from: string; to: string }[];
  readonly retired: readonly Retired[];
}

export interface TakeRefusal {
  readonly why: string;
}

/**
 * The plan for every function-valued field of one patch.
 *
 * `recordText` is the record file's source as it stands after any plain
 * fields were written — `decide.ts` runs `rewriteRecord` first and hands the
 * result in, so the two kinds of field land in one file rather than racing.
 */
export function planFunctionTake(
  root: string,
  won: Variant,
  patch: Patch,
  fields: readonly string[],
  recordText: string,
  as?: string,
): FunctionTake | TakeRefusal {
  const indexFile = `${won.dir}/index.ts`;
  const indexSrc = readFileSync(join(root, indexFile), "utf8");

  // Which sibling each field's function comes from — the same file for two
  // fields is one move, and a field written inline is the refusal it was.
  const wanted = new Map<string, { field: string; ident: string }[]>();
  for (const field of fields) {
    const ident = fieldIdent(indexSrc, field);
    if (!ident) {
      return {
        why: `\`${field}\` is written inline in ${indexFile}; there is no file to move. Take this slot by hand.`,
      };
    }
    const spec = importedFrom(indexSrc, ident);
    if (!spec?.startsWith("./")) {
      return {
        why: `\`${field}\` is \`${ident}\`, which ${indexFile} does not import from a sibling file. Take this slot by hand.`,
      };
    }
    const sibling = resolveSpec(indexFile, spec);
    wanted.set(sibling, [...(wanted.get(sibling) ?? []), { field, ident }]);
  }

  // Every sibling moves, not only the ones a field names: they import each
  // other, and a sibling left behind is a sibling deleted with the slot.
  const siblings = readdirSync(join(root, won.dir))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => posix.join(won.dir, f));
  const moved = new Map<string, string>();
  for (const s of siblings) {
    const to = destinationFor(patch.where.file, won.name, siblingName(s), as);
    if (existsSync(join(root, to))) {
      return { why: `${to} already exists; say where the file should land with --as <name>` };
    }
    moved.set(s, to);
  }
  const moves: Moved[] = [...moved].map(([from, to]) => ({
    from,
    to,
    text: rewriteSpecifiers(readFileSync(join(root, from), "utf8"), from, to, moved),
  }));

  // The record, field by field, and the old value each one displaces.
  let text = recordText;
  const out: FunctionTake["fields"][number][] = [];
  const displaced: string[] = [];
  for (const [sibling, list] of wanted) {
    const to = moved.get(sibling);
    if (!to) return { why: `${sibling} is not beside ${indexFile}` };
    const spec = `./${posix.basename(to).replace(/\.ts$/, ".js")}`;
    for (const { field, ident } of list) {
      const pointed = pointRecord(text, patch.where.symbol, field, ident, spec);
      if ("why" in pointed) return { why: `${patch.where.file} — ${pointed.why}` };
      text = pointed.text;
      displaced.push(pointed.was);
      out.push({ field, ident, from: sibling, to });
    }
  }

  // What the record stopped reading. An import that nothing else in the tree
  // reaches is a file with no reader, and it goes; one still read stays.
  const retired: Retired[] = [];
  for (const was of displaced) {
    const r = retireImport(text, was);
    text = r.text;
    if (!r.module) continue;
    const file = resolveSpec(patch.where.file, r.module);
    const readers = importersOf(root, file, patch.where.file);
    retired.push({
      file,
      delete: readers.length === 0,
      note:
        readers.length === 0
          ? `${file} — nothing else imports it; deleted`
          : `${file} — still imported by ${readers.join(", ")}; left standing`,
    });
  }
  return { moves, recordText: text, fields: out, retired };
}

/** Every source file under `packages`, `apps` and `tools` that imports
 * `file`, other than `except` — repo-relative, forward slashes. */
export function importersOf(root: string, file: string, except: string): string[] {
  const hits: string[] = [];
  for (const top of ["packages", "apps", "tools"]) walk(join(root, top), root, file, except, hits);
  return hits;
}

function walk(dir: string, root: string, file: string, except: string, hits: string[]): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    // `.claude` by name as well as by its dot: a lane's own checkout lives
    // under `.claude/worktrees`, and a walk that descended into it would
    // count another tree's readers as this one's.
    if (name === "node_modules" || name === "dist" || name === ".claude") continue;
    if (name.startsWith(".")) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      walk(abs, root, file, except, hits);
      continue;
    }
    if (!name.endsWith(".ts")) continue;
    const rel = posix.normalize(abs.slice(root.length).replace(/\\/g, "/").replace(/^\//, ""));
    if (rel === except) continue;
    const src = readFileSync(abs, "utf8");
    for (const m of src.matchAll(/from\s*"(\.[^"]+)"/g)) {
      if (resolveSpec(rel, m[1] ?? "") === file) {
        hits.push(rel);
        break;
      }
    }
  }
}
