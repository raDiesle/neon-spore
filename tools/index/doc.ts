/**
 * **The shape of `docs/INDEX.md` around its Code table**: the heading and
 * markers the table is anchored on, and the split that lets everything else in
 * the document pass through untouched. Split out of `index.ts` on its line
 * count; that file is what the table holds, and this is where it sits.
 */

export const CODE_HEADING = "## Code\n";
export const START_MARKER = "<!-- index:code:start -->";
export const END_MARKER = "<!-- index:code:end -->";

/**
 * The document with its line endings settled before anything looks at it.
 *
 * **Every marker in this file ends in a newline**, and `indexOf` is exact — so
 * a `docs/INDEX.md` whose lines end `\r\n` failed to find `## Code\n` and threw
 * *docs/INDEX.md has no "## Code" heading*, which is false and sends a reader
 * looking for a heading that is right there. It cost a turn on 9 September
 * 2026, and it will keep happening: `.gitattributes` settles line endings for
 * everything git touches, but **markdown is not formatted by biome**, so a CRLF
 * `.md` in a working tree passes `bun run check` until a tool that matches on a
 * newline breaks on it — and any session editing a document with a script that
 * writes the platform newline puts one there.
 *
 * Normalising rather than refusing, because the file this writes back is LF
 * either way: `.gitattributes` asks for LF, so a run over a CRLF document
 * quietly repairs it, which is the outcome a refusal would have asked a person
 * to produce by hand. What is left of the old error is now true — if it fires,
 * the heading really is missing.
 */
export function normaliseEol(text: string): string {
  return text.includes("\r\n") ? text.replaceAll("\r\n", "\n") : text;
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
