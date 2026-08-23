import { measure } from "./metrics.js";
import { SUBJECTS } from "./subjects.js";

/**
 * The shape sheet in numbers.
 *
 * Deterministic and line-oriented, so two revisions can be diffed instead of
 * compared by eye — and so the cheap question ("did that make the wobble
 * bigger?") can be asked without rendering anything at all.
 *
 * `bun run --cwd tools/shape-sheet report`
 */

const cols = ["SHAPE", "W", "H", "AREA", "LENGTH", "TRAVEL", "BREATH%"] as const;
const widths = [14, 7, 7, 9, 9, 8, 8];

function row(cells: string[]): string {
  return cells
    .map((c, i) => c.padEnd(widths[i]!))
    .join("")
    .trimEnd();
}

const lines = [row([...cols]), row(widths.map((w) => "-".repeat(w - 1)))];

for (const s of SUBJECTS) {
  const m = measure(s);
  lines.push(
    row([
      s.name.replace(" · ", "·"),
      m.w.toFixed(1),
      m.h.toFixed(1),
      m.area === 0 ? "open" : m.area.toFixed(0),
      m.length.toFixed(1),
      m.travel.toFixed(2),
      m.breath.toFixed(2),
    ]),
  );
}

console.log(lines.join("\n"));
