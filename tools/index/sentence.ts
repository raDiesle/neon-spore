/**
 * **The one line a row carries**, read off the file's own header comment and cut
 * to something a table can hold. Split out of `index.ts` on that file's line
 * count: next door is what the table *is*, and this is what a row *says*.
 */

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
