import { measure } from "./metrics.js";
import { type Nameability, nameability, overlaps, type Span } from "./nameability.js";
import { livingKinds, SUBJECTS } from "./subjects.js";

/**
 * The shape sheet in numbers.
 *
 * Deterministic and line-oriented, so two revisions can be diffed instead of
 * compared by eye — and so the cheap question ("did that make the wobble
 * bigger?") can be asked without rendering anything at all.
 *
 * `bun run --cwd tools/shape-sheet report`
 */

const cols = [
  "SHAPE",
  "W",
  "H",
  "AREA",
  "LENGTH",
  "TRAVEL",
  "BREATH%",
  "ASPECT",
  "LOBE",
  "SIZE px",
] as const;
const widths = [14, 7, 7, 9, 9, 8, 9, 12, 6, 10];

function row(cells: string[]): string {
  return cells
    .map((c, i) => c.padEnd(widths[i]!))
    .join("")
    .trimEnd();
}

/** A range that never moved is one number; printing `9-9` only hides that. */
function spanText(s: Span, digits: number): string {
  const lo = s.lo.toFixed(digits);
  const hi = s.hi.toFixed(digits);
  return lo === hi ? lo : `${lo}-${hi}`;
}

/**
 * The three nameability axes, by kind. Only what `drawLiving` draws has them:
 * the rock does not sway, the hull is not a creature anybody has to name, and
 * a range measured through a pose that does not exist would be a column of
 * zeroes pretending to be a measurement.
 */
const AXES = new Map<string, Nameability>(
  livingKinds().map((kind) => [kind.toUpperCase(), nameability(kind)]),
);

const lines = [row([...cols]), row(widths.map((w) => "-".repeat(w - 1)))];

for (const s of SUBJECTS) {
  const m = measure(s);
  const n = AXES.get(s.name);
  lines.push(
    row([
      s.name.replace(" · ", "·"),
      m.w.toFixed(1),
      m.h.toFixed(1),
      m.area === 0 ? "open" : m.area.toFixed(0),
      m.length.toFixed(1),
      m.travel.toFixed(2),
      m.breath.toFixed(2),
      n ? spanText(n.aspect, 2) : "·",
      n ? spanText(n.lobe, 0) : "·",
      n ? spanText(n.size, 1) : "·",
    ]),
  );
}

/**
 * What actually keeps each pair apart, and by how much.
 *
 * The table above says where every kind sits; this says which axis is load
 * bearing, which is the thing an amplitude change moves. A pair separated on
 * one axis alone is a pair one raised number away from being the same word,
 * and reading that off three overlapping columns by eye is exactly the work
 * this line exists to save.
 */
function gapOn(a: Span, b: Span): number {
  return overlaps(a, b) ? 0 : a.lo > b.hi ? a.lo - b.hi : b.lo - a.hi;
}

const names = [...AXES.keys()];
const pairs: string[] = [];
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const a = AXES.get(names[i]!)!;
    const b = AXES.get(names[j]!)!;
    const kept = [
      ["aspect", gapOn(a.aspect, b.aspect), 2],
      ["lobe", gapOn(a.lobe, b.lobe), 0],
      ["size", gapOn(a.size, b.size), 1],
    ] as const;
    const held = kept.filter(([, gap]) => gap > 0);
    const how = held.length
      ? held.map(([axis, gap, d]) => `${axis} +${gap.toFixed(d)}`).join(", ")
      : "NOTHING — same word";
    pairs.push(`  ${`${names[i]}/${names[j]}`.padEnd(14)}${how}`);
  }
}

console.log(lines.join("\n"));
console.log("\nTOLD APART BY");
console.log(pairs.join("\n"));
