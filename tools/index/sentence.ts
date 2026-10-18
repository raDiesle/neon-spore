/**
 * **The one line a row carries**, read off the file's own header comment and cut
 * to something a table can hold. Split out of `index.ts` on that file's line
 * count: next door is what the table *is*, and this is what a row *says*.
 */

export function deriveHeaderSentence(source: string, limit = LIMIT): string {
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
    if (raw.length > 0) return truncateSentence(raw, limit);
  }
  const lineComment = source.split("\n").find((l) => l.trim().startsWith("//"));
  if (lineComment) {
    const raw = lineComment
      .trim()
      .replace(/^\/\/\s?/, "")
      .trim();
    if (raw.length > 0) return truncateSentence(raw, limit);
  }
  return "(no header comment — add one)";
}

/** How long a row runs before it is cut at a clause; a caller may lift it
 * (`refresh.ts` does, for an act file whose whole sentence is its contents). */
const LIMIT = 110;

/**
 * A sentence ends at ". ", or at ".** " when the header's first sentence is set
 * in bold — which most are, and which `indexOf(". ")` read straight past into
 * the paragraph, cut mid-emphasis and left nothing of (eleven empty rows,
 * 27 September 2026).
 */
const SENTENCE_END = /\.(\*\*)? /;

function truncateSentence(raw: string, limit: number): string {
  const stop = SENTENCE_END.exec(raw);
  let cut = stop ? raw.slice(0, stop.index) + (stop[1] ?? "") : raw;
  let elided = false;
  if (cut.length > limit) {
    // A clause boundary reads as a finished thought; a bare word boundary does
    // not, and says so with an ellipsis rather than stopping mid-sentence.
    const head = cut.slice(0, limit);
    const clause = Math.max(
      head.lastIndexOf(" — "),
      head.lastIndexOf(", "),
      head.lastIndexOf(": "),
    );
    if (clause > limit / 3) {
      cut = head.slice(0, clause);
    } else {
      const lastSpace = head.lastIndexOf(" ");
      cut = head.slice(0, lastSpace === -1 ? limit - 1 : lastSpace);
      elided = true;
    }
  }
  cut = cut.trim();
  if (cut.endsWith(".")) cut = cut.slice(0, -1);
  // A cut mid-emphasis leaves an unmatched "**" — drop it rather than ship
  // broken markdown, or close it when dropping it would leave nothing.
  if ((cut.match(/\*\*/g)?.length ?? 0) % 2 === 1) {
    const dropped = cut.replace(/\*\*[^*]*$/, "").trimEnd();
    if (dropped !== "") cut = dropped;
    else {
      cut = `${cut.replace(/[,;:—-]+$/, "").trimEnd()}${elided ? "…" : ""}**`;
      elided = false;
    }
  }
  if (elided) cut = `${cut.replace(/[,;:—-]+$/, "").trimEnd()}…`;
  return cut;
}
