/**
 * Pure logic for `docs/INDEX.md`'s "## Code" table: which files must have a
 * row, what a missing row's text should be, and how the table is rendered.
 * No file-system access here — `run.ts` is the only place that reads a
 * directory or writes the file, so this module is unit-testable on strings.
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

/** True for a file the Code table must carry a row for. */
export function isInScope(relPath: string): boolean {
  if (!relPath.endsWith(".ts") || relPath.endsWith(".test.ts")) return false;
  if (relPath.split("/").pop() === "index.ts") return false;
  if (relPath.includes("/node_modules/") || relPath.includes("/dist/")) return false;
  return /^(?:packages|apps)\/[^/]+\/src\//.test(relPath);
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

function truncateSentence(raw: string): string {
  const stopAt = raw.indexOf(". ");
  let cut = stopAt === -1 ? raw : raw.slice(0, stopAt);
  if (cut.length > 110) {
    const lastSpace = cut.slice(0, 110).lastIndexOf(" ");
    cut = cut.slice(0, lastSpace === -1 ? 110 : lastSpace);
  }
  cut = cut.trim();
  if (cut.endsWith(".")) cut = cut.slice(0, -1);
  // A cut mid-emphasis leaves an unmatched "**" — drop it rather than ship broken markdown.
  if ((cut.match(/\*\*/g)?.length ?? 0) % 2 === 1) {
    cut = cut.replace(/\*\*[^*]*$/, "").trimEnd();
  }
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
 * Rebuilds the whole `docs/INDEX.md` text. `scopePaths` are every in-scope
 * source file (repo-relative, forward slashes); `readSource` fetches a
 * file's text for header-sentence extraction, only for paths with no row yet.
 */
export function generateIndex(
  currentText: string,
  scopePaths: string[],
  readSource: (relPath: string) => string,
): string {
  const { before, intro, body, after } = splitDoc(currentText);
  const existing = parseRows(body);
  const existingByPath = new Map(existing.map((r) => [r.path, r]));
  const dirPrefixes = existing.filter((r) => r.path.endsWith("/")).map((r) => r.path);
  const covered = (p: string) => existingByPath.has(p) || dirPrefixes.some((d) => p.startsWith(d));

  const byGroup = new Map<string, Row[]>(GROUPS.map((g) => [g, []]));
  for (const row of existing) {
    const g = groupFor(row.path);
    if (!g) throw new Error(`row for '${row.path}' does not belong to any known group`);
    byGroup.get(g)?.push(row);
  }
  for (const path of scopePaths) {
    if (covered(path)) continue;
    const g = groupFor(path);
    if (!g) continue; // scope filter already restricts to packages/apps roots
    const text = deriveHeaderSentence(readSource(path));
    byGroup.get(g)?.push({ path, line: formatRow(path, text) });
  }
  // Existing rows keep their hand-curated order; new rows (already alphabetical
  // via scopePaths) are appended after them within the same group.

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
