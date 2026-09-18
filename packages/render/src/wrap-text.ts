/**
 * Greedy wrap against the measured width. `ctx.font` must already be set.
 *
 * Shared by the two states a wave opens in — the introduction's three lines of
 * type and the guide's panel — which are drawn in two files and would
 * otherwise carry the same fifteen lines twice.
 *
 * A newline in the text is a line of its own, always: the boss guides are
 * written as numbered steps, one per line (the owner, 18 September 2026), and
 * the three of them the game still draws as prose (`guide-prose.ts`) would
 * otherwise run the steps together — `fillText` draws a newline as nothing.
 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  return text.split("\n").flatMap((para) => wrapLine(ctx, para, maxWidth));
}

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
