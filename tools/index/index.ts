/**
 * Pure logic for `docs/INDEX.md`'s "## Code" table: which files must have a
 * row, what a missing row's text should be, which rows no longer have a file
 * under them, and how the table is rendered. No file-system access here —
 * `run.ts` is the only place that reads a directory or writes the file, so
 * this module is unit-testable on strings.
 */

/** Package roots, in the order their `###` sections appear. */
export const GROUPS = [
  "packages/sim",
  "packages/content",
  "packages/render",
  "packages/net",
  "packages/audio",
  "packages/hands",
  "apps/game",
  "apps/server",
  "tools",
] as const;

import { END_MARKER, normaliseEol, START_MARKER, splitDoc } from "./doc.js";
import { fileBeside } from "./place.js";
import { refreshRow } from "./refresh.js";
import { deriveHeaderSentence } from "./sentence.js";

export interface Row {
  path: string;
  line: string;
}

/**
 * Where source lives, by root. A package or an app keeps it under `src/`; a
 * tool is a script and keeps it beside its own directory, so `tools/land/run.ts`
 * and `tools/build-stamp.ts` count and `tools/director/src/**` does too. An
 * app's own build and preview scripts sit next to its `src/` rather than in it.
 */
const SCOPE_PATTERNS = [
  /^(?:packages|apps)\/[^/]+\/src\//,
  /^apps\/[^/]+\/[^/]+\.ts$/,
  /^tools\/[^/]+\.ts$/,
  /^tools\/[^/]+\/[^/]+\.ts$/,
  /^tools\/[^/]+\/src\//,
];

/** True for a file the Code table must carry a row for. */
export function isInScope(relPath: string): boolean {
  if (!relPath.endsWith(".ts") || relPath.endsWith(".test.ts")) return false;
  if (relPath.split("/").pop() === "index.ts") return false;
  if (relPath.includes("/node_modules/") || relPath.includes("/dist/")) return false;
  if (/(^|\/)test\//.test(relPath)) return false;
  return SCOPE_PATTERNS.some((p) => p.test(relPath));
}

export function filterScopeFiles(allPaths: string[]): string[] {
  return allPaths.filter(isInScope).sort();
}

/** The package-root group a row or scope path belongs to, longest prefix wins. */
export function groupFor(relPath: string): (typeof GROUPS)[number] | undefined {
  let best: (typeof GROUPS)[number] | undefined;
  for (const g of GROUPS) {
    if (relPath === g || relPath.startsWith(`${g}/`)) {
      if (!best || g.length > best.length) best = g;
    }
  }
  return best;
}

/** Rows in appearance order — a table header/separator row never matches (no backtick cell). */
export function parseRows(text: string): Row[] {
  const re = /^\|\s*`([^`]+)`\s*\|.*\|\s*$/gm;
  return [...text.matchAll(re)].map((m) => ({ path: m[1] ?? "", line: m[0].trimEnd() }));
}

/** First sentence of a header comment, or the placeholder when there is none. */
export function formatRow(path: string, text: string): string {
  return `| \`${path}\` | ${text} |`;
}

/**
 * What the generator is allowed to ask about the working tree. Four questions
 * and no file-system access, so the whole of this module stays testable on
 * strings — `run.ts` is the only place that reads a directory.
 */
export interface Tree {
  /** Every in-scope source file, repo-relative with forward slashes. */
  scope: string[];
  /** A file's text, asked for a path with no row yet and for one `before` names. */
  read: (relPath: string) => string;
  /** Whether anything is at this path. */
  has: (relPath: string) => boolean;
  /** A changed file's earlier sources, for `refreshRow`; omitted, every row stays. */
  before?: (relPath: string) => readonly string[];
}

/**
 * True while the tree still has something for this row to point at.
 *
 * **Existence, not scope.** A row for a file that exists but is out of scope is
 * a row somebody wrote on purpose — `apps/server/src/index.ts` is one, kept out
 * of scope by the rule that every `index.ts` is a barrel — and dropping it
 * would be the generator throwing away a line a person chose to write. What
 * has to go is a row with nothing behind it at all. A path ending in `/` stands
 * for a directory, so that is what is asked about.
 */
export function rowLives(path: string, has: (relPath: string) => boolean): boolean {
  return has(path.endsWith("/") ? path.slice(0, -1) : path);
}

/**
 * Rebuilds the whole `docs/INDEX.md` text: every in-scope source file gets a
 * row, every row with nothing behind it goes, and everything else passes
 * through byte for byte.
 *
 * **A deleted file's row goes in the same pass that adds a missing one.** It
 * did not use to: the generator completed the table and deliberately kept
 * whatever text was already there, which is right for a row somebody wrote by
 * hand and wrong for a row whose file is gone. `bun run index` then reported
 * "865 in-scope files checked" and wrote nothing while the test that reads the
 * same table failed on "every row's path exists" — so the tool that exists to
 * fix the table could not fix the half it was failing on, and the fix was a
 * hand edit found by reading test output. The invariant that survives is the
 * one the keeping was for: a *surviving* row keeps its hand-written text
 * exactly — and a row that was only ever the header's own sentence follows the
 * header when it changes (`refresh.ts`).
 */
export function generateIndex(currentText: string, tree: Tree): string {
  const { before, intro, body, after } = splitDoc(normaliseEol(currentText));
  const existing = parseRows(body)
    .filter((r) => rowLives(r.path, tree.has))
    .map((r) => refreshRow(r, () => tree.read(r.path), tree.before?.(r.path) ?? []));
  const existingByPath = new Map(existing.map((r) => [r.path, r]));
  const dirPrefixes = existing.filter((r) => r.path.endsWith("/")).map((r) => r.path);
  const covered = (p: string) => existingByPath.has(p) || dirPrefixes.some((d) => p.startsWith(d));

  const byGroup = new Map<string, Row[]>(GROUPS.map((g) => [g, []]));
  for (const row of existing) {
    const g = groupFor(row.path);
    if (!g) throw new Error(`row for '${row.path}' does not belong to any known group`);
    byGroup.get(g)?.push(row);
  }
  for (const path of tree.scope) {
    if (covered(path)) continue;
    const g = groupFor(path);
    if (!g) continue; // scope filter already restricts to packages/apps roots
    fileBeside(byGroup.get(g) ?? [], {
      path,
      line: formatRow(path, deriveHeaderSentence(tree.read(path))),
    });
  }
  // Existing rows keep their hand-curated order; a new row is filed beside its
  // nearest sibling rather than appended (`fileBeside`).

  const sections: string[] = [];
  for (const g of GROUPS) {
    const rows = byGroup.get(g) ?? [];
    if (rows.length === 0) continue;
    sections.push(
      `### ${g}\n\n| Path | One line |\n|---|---|\n${rows.map((r) => r.line).join("\n")}`,
    );
  }

  let out = before;
  if (intro) out += `\n${intro}\n`;
  out += `\n${START_MARKER}\n\n${sections.join("\n\n")}\n\n${END_MARKER}\n`;
  if (after) out += `\n${after}\n`;
  return out;
}
