import type { Wave } from "@neon-spore/content";
import { LIMIT, lineCount } from "../../hooks/file-size.ts";
import { serializeWaveArray } from "./serialize.js";

/**
 * **The list of act files, read and written** — `packages/content/src/waves/acts.ts`.
 *
 * The game is heading for a thousand waves (the owner, 14 October 2026), and
 * each act file holds about fifteen before the 250-line ceiling. Cut by hand,
 * a new act was a new file, an import and a spread in `waves.ts`, and five
 * lines in the director's own table — the table was 170 lines at 28 acts. So
 * the list lives in one generated file, the director's table is read off it
 * (`waves-act-files.ts`), and the save cuts a full act on its own (`cutAct`).
 *
 * Pure: strings in, strings out. The save does the reading and writing.
 */

/** One act in the list: its file name without `.ts`, and its export. */
export interface ActName {
  name: string;
  exportName: string;
}

/** `act-3b` → `WAVES_ACT_3B`; `act-1-2` → `WAVES_ACT_1_2`. */
export function exportNameFor(name: string): string {
  return `WAVES_${name.toUpperCase().replace(/-/g, "_")}`;
}

/** The acts `acts.ts` lists, in the order of its array — the game's order. */
export function parseActList(source: string): ActName[] {
  const files = new Map<string, string>();
  for (const m of source.matchAll(/^import \{ (WAVES_\w+) \} from "\.\/([\w-]+)\.js";$/gm)) {
    if (m[1] && m[2]) files.set(m[1], m[2]);
  }
  const body = source.slice(source.indexOf("export const WAVE_ACTS"));
  const out: ActName[] = [];
  for (const m of body.matchAll(/^ {2}(WAVES_\w+),$/gm)) {
    const exportName = m[1] ?? "";
    const name = files.get(exportName);
    if (name === undefined)
      throw new Error(`acts.ts lists ${exportName} and imports no file for it`);
    out.push({ name, exportName });
  }
  return out;
}

/**
 * `acts.ts` rewritten to list `acts`, keeping everything else in `source` —
 * the type import and the comment — byte for byte. Imports are sorted the
 * way Biome sorts them, by path with numbers compared as numbers, so the file
 * is lint-clean as written; the array keeps the order it is given.
 */
export function actListSource(source: string, acts: readonly ActName[]): string {
  const imports = [...acts]
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
    .map((a) => `import { ${a.exportName} } from "./${a.name}.js";`);
  const kept = source.replace(/^import \{ WAVES_\w+ \} from "\.\/[\w-]+\.js";\n/gm, "");
  const typeLine = 'import type { Wave } from "../wave-types.js";\n';
  const withImports = kept.replace(typeLine, `${typeLine}${imports.join("\n")}\n`);
  const at = withImports.indexOf("export const WAVE_ACTS");
  const head = withImports.slice(0, withImports.indexOf("= [", at) + 3);
  return `${head}\n${acts.map((a) => `  ${a.exportName},`).join("\n")}\n];\n`;
}

/** The ids an act file's array holds, in order — read off its source. */
export function idsInAct(source: string, exportName: string): string[] {
  const at = source.indexOf(`export const ${exportName}: Wave[] = [`);
  if (at === -1) return [];
  return [...source.slice(at).matchAll(/^ {4}id: "([^"]+)",$/gm)].map((m) => m[1] ?? "");
}

/**
 * **Which act each wave of a saved list goes to: the one it is already in.**
 *
 * The save used to cut the flat list at each act's current length, so a wave
 * inserted in act one pushed one wave out of every act after it into the
 * next, all the way down — every file rewritten, and the comment at the top of
 * each one now standing over a wave it was not written about. Now a wave
 * stays in the act that holds its id, and a new wave joins the act of the
 * wave before it. The order of the game is kept by never going back: a wave
 * dragged up from a later act joins the act it was dropped into.
 */
export function assignToActs(
  waves: readonly Wave[],
  ids: readonly (readonly string[])[],
): Wave[][] {
  const owner = new Map<string, number>();
  ids.forEach((list, act) => {
    for (const id of list) owner.set(id, act);
  });
  const out: Wave[][] = ids.map(() => []);
  let act = 0;
  for (const wave of waves) {
    const home = owner.get(wave.id);
    if (home !== undefined && home > act) act = home;
    out[act]?.push(wave);
  }
  return out;
}

/** An act file's text is cut when it would pass this, leaving Biome room to
 * wrap a long line or two without crossing the ceiling. */
export const CUT_AT = LIMIT - 10;

/** The source a new act file starts from: what it is, and where it plays. */
export function freshActSource(name: string, from: string): string {
  return [
    'import type { Wave } from "../wave-types.js";',
    "",
    "/**",
    ` * Cut from \`${from}.ts\` by the director's save when that file passed the`,
    " * 250-line ceiling; it plays straight after it (`acts.ts`).",
    " */",
    `export const ${exportNameFor(name)}: Wave[] = [`,
    "];",
    "",
  ].join("\n");
}

/** A name for a file cut from `from` that no act in `taken` has: the act's
 * own name and a page, `act-1-p2`, so it can never be taken for an act of
 * its own number. */
export function freshActName(from: string, taken: ReadonlySet<string>): string {
  const root = from.replace(/-p\d+$/, "");
  for (let n = 2; ; n++) {
    const name = `${root}-p${n}`;
    if (!taken.has(name)) return name;
  }
}

/**
 * One act's waves, as the texts of the files they need: the act's own file
 * first, holding as many as fit under `CUT_AT`, then one fresh file for each
 * further run of them. Most saves get back exactly one text.
 */
export function cutAct(
  act: ActName,
  source: string,
  waves: readonly Wave[],
  taken: Set<string>,
): { act: ActName; text: string }[] {
  const out: { act: ActName; text: string }[] = [];
  let current = act;
  let base = source;
  let chunk: Wave[] = [];
  for (const wave of waves) {
    const tried = serializeWaveArray(base, [...chunk, wave], current.exportName);
    if (chunk.length > 0 && lineCount(tried) > CUT_AT) {
      out.push({ act: current, text: serializeWaveArray(base, chunk, current.exportName) });
      const name = freshActName(act.name, taken);
      taken.add(name);
      current = { name, exportName: exportNameFor(name) };
      base = freshActSource(name, out[out.length - 1]?.act.name ?? act.name);
      chunk = [];
    }
    chunk.push(wave);
  }
  out.push({ act: current, text: serializeWaveArray(base, chunk, current.exportName) });
  return out;
}

/** An import line an act file carries: `import { NAME } from "../x.js";`. */
const IMPORT_LINE = /^import (type )?\{ (\w+) \} from "([^"]+)";\n/gm;

/** Every import any of `sources` carries, by the name it brings in. */
export function knownImports(sources: readonly string[]): Map<string, string> {
  const known = new Map<string, string>();
  for (const source of sources) {
    for (const m of source.matchAll(IMPORT_LINE)) if (m[2]) known.set(m[2], m[0].trimEnd());
  }
  return known;
}

/**
 * **An act file's imports, made to match what its waves use.** A boss that
 * carries a script — THE INSTAR's steps, PINBALL's boards — names it, and
 * the name is imported at the top of the file it is in. Move that wave to
 * another act, by a cut or by a drag, and the old file imports a name it no
 * longer uses while the new one uses a name it never imported. So every name
 * used is imported, from wherever another act imported it, and an unused one
 * is dropped; the lines are sorted by path the way Biome sorts them.
 */
export function fixImports(text: string, known: ReadonlyMap<string, string>): string {
  const body = text.replace(IMPORT_LINE, "");
  const lines: string[] = [];
  for (const [name, line] of known) {
    if (line.startsWith("import type") || new RegExp(`\\b${name}\\b`).test(body)) {
      lines.push(line);
    }
  }
  const from = (line: string) => line.slice(line.indexOf('"'));
  const sorted = [...new Set(lines)].sort((a, b) =>
    from(a).localeCompare(from(b), "en", { numeric: true }),
  );
  return `${sorted.join("\n")}\n${body.replace(/^\n*/, "\n")}`;
}
