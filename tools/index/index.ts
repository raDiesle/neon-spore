/**
 * Pure logic for `docs/INDEX.md`'s "## Code" table: which files must have a
 * row, what a missing row's text should be, which rows no longer have a file
 * under them, and how the table is rendered. No file-system access here —
 * `run.ts` is the only place that reads a directory or writes the file, so
 * this module is unit-testable on strings.
 */

export const CODE_HEADING = "## Code\n";
export const START_MARKER = "<!-- index:code:start -->";
export const END_MARKER = "<!-- index:code:end -->";

/** Package roots, in the order their `###` sections appear. */
export const GROUPS = [
  "packages/sim",
  "packages/content",
  "packages/render",
  "packages/net",
  "packages/audio",
  "apps/game",
  "apps/server",
  "tools",
] as const;

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
export function deriveHeaderSentence(source: string): string {
  const block = /\/\*\*([\s\S]*?)\*\//.exec(source);
  if (block) {
    const lines = (block[1] ?? "")
      .split("\n")
      .map((l) =>
        l
          .trim()
          .replace(/^\*\s?/, "")
          .trim(),
      )
      .filter((l) => l.length > 0);
    const raw = lines.join(" ").trim();
    if (raw.length > 0) return truncateSentence(raw);
  }
  const lineComment = source.split("\n").find((l) => l.trim().startsWith("//"));
  if (lineComment) {
    const raw = lineComment
      .trim()
      .replace(/^\/\/\s?/, "")
      .trim();
    if (raw.length > 0) return truncateSentence(raw);
  }
  return "(no header comment — add one)";
}

const LIMIT = 110;

function truncateSentence(raw: string): string {
  const stopAt = raw.indexOf(". ");
  let cut = stopAt === -1 ? raw : raw.slice(0, stopAt);
  let elided = false;
  if (cut.length > LIMIT) {
    // A clause boundary reads as a finished thought; a bare word boundary does
    // not, and says so with an ellipsis rather than stopping mid-sentence.
    const head = cut.slice(0, LIMIT);
    const clause = Math.max(
      head.lastIndexOf(" — "),
      head.lastIndexOf(", "),
      head.lastIndexOf(": "),
    );
    if (clause > LIMIT / 3) {
      cut = head.slice(0, clause);
    } else {
      const lastSpace = head.lastIndexOf(" ");
      cut = head.slice(0, lastSpace === -1 ? LIMIT - 1 : lastSpace);
      elided = true;
    }
  }
  cut = cut.trim();
  if (cut.endsWith(".")) cut = cut.slice(0, -1);
  // A cut mid-emphasis leaves an unmatched "**" — drop it rather than ship broken markdown.
  if ((cut.match(/\*\*/g)?.length ?? 0) % 2 === 1) {
    cut = cut.replace(/\*\*[^*]*$/, "").trimEnd();
  }
  if (elided) cut = `${cut.replace(/[,;:—-]+$/, "").trimEnd()}…`;
  return cut;
}

export function formatRow(path: string, text: string): string {
  return `| \`${path}\` | ${text} |`;
}

/** Splits the document around the Code table so everything else passes through untouched. */
export function splitDoc(text: string): {
  before: string;
  intro: string;
  body: string;
  after: string;
} {
  const headingIdx = text.indexOf(CODE_HEADING);
  if (headingIdx === -1) {
    throw new Error("docs/INDEX.md has no '## Code' heading to anchor the generated table on");
  }
  const before = text.slice(0, headingIdx + CODE_HEADING.length);
  const rest = text.slice(headingIdx + CODE_HEADING.length);
  const startIdx = rest.indexOf(START_MARKER);
  const endIdx = rest.indexOf(END_MARKER);
  if (startIdx !== -1 && endIdx !== -1) {
    return {
      before,
      intro: rest.slice(0, startIdx).trim(),
      body: rest.slice(startIdx + START_MARKER.length, endIdx),
      after: rest.slice(endIdx + END_MARKER.length).trim(),
    };
  }
  // First run: no markers yet, the whole remainder is the old flat table.
  return { before, intro: "", body: rest, after: "" };
}

/**
 * What the generator is allowed to ask about the working tree. Three questions
 * and no file-system access, so the whole of this module stays testable on
 * strings — `run.ts` is the only place that reads a directory.
 */
export interface Tree {
  /** Every in-scope source file, repo-relative with forward slashes. */
  scope: string[];
  /** A file's text, asked only for a path that has no row yet. */
  read: (relPath: string) => string;
  /** Whether anything is at this path. */
  has: (relPath: string) => boolean;
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
 * exactly.
 */
export function generateIndex(currentText: string, tree: Tree): string {
  const { before, intro, body, after } = splitDoc(currentText);
  const existing = parseRows(body).filter((r) => rowLives(r.path, tree.has));
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
    byGroup.get(g)?.push({ path, line: formatRow(path, deriveHeaderSentence(tree.read(path))) });
  }
  // Existing rows keep their hand-curated order; new rows (already alphabetical
  // via the scope list) are appended after them within the same group.

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
