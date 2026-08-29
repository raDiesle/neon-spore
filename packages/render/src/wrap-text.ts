/**
 * Greedy wrap against the measured width. `ctx.font` must already be set.
 *
 * Shared by the two states a wave opens in — the introduction's three lines of
 * type and the guide's panel — which are drawn in two files and would
 * otherwise carry the same fifteen lines twice.
 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}
