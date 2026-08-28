import { CATALOGUE } from "./catalogue.js";
import { drawnSize, FLOOR_HI, FLOOR_LO, isWide } from "./drawn-size.js";
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

/**
 * The 20–26 px floor `docs/spec/graphics.md` sets for a body to stay
 * nameable — printed instead of measured by hand, per the queue entry this
 * replaced. `bun run shapes:report -- 92 46` asks the same question the
 * paired-cards lane did before widening the card instead of halving it: at a
 * 92 px card, does 46 px width still hold every square body above the floor?
 *
 * The frame is CLI input rather than a hardcoded 92: `argv[2]` is the card's
 * height and pad basis (`shapeFigure`'s `box`), `argv[3]` its width, default
 * equal — the square every card gets unless `isWide` widens it. A `bun run`
 * flag needs `--`, so the args land after it: `bun run report -- 92 46`.
 */
const argBox = Number(process.argv[2]);
const box = Number.isFinite(argBox) && argBox > 0 ? argBox : 92;
const argWidth = Number(process.argv[3]);
const width = Number.isFinite(argWidth) && argWidth > 0 ? argWidth : box;

const dCols = ["SHAPE", "LONG px", "SHORT px", "FLOOR"] as const;
const dWidths = [22, 9, 10, 24];
function dRow(cells: string[]): string {
  return cells
    .map((c, i) => c.padEnd(dWidths[i]!))
    .join("")
    .trimEnd();
}

const dLines = [dRow([...dCols]), dRow(dWidths.map((w) => "-".repeat(w - 1)))];
let under26 = 0;
let under20 = 0;
let wide = 0;

for (const entry of CATALOGUE) {
  if (isWide(entry)) {
    wide++;
    dLines.push(
      dRow([entry.subject.name.replace(" · ", "·"), "·", "·", "WIDE — not modelled here"]),
    );
    continue;
  }
  const d = drawnSize(entry, box, width);
  const mark =
    d.long < FLOOR_LO ? `under ${FLOOR_LO}` : d.long < FLOOR_HI ? `under ${FLOOR_HI}` : "";
  if (d.long < FLOOR_HI) under26++;
  if (d.long < FLOOR_LO) under20++;
  dLines.push(
    dRow([entry.subject.name.replace(" · ", "·"), d.long.toFixed(1), d.short.toFixed(1), mark]),
  );
}

console.log(`\nDRAWN SIZE at box ${box} px, width ${width} px (floor ${FLOOR_LO}-${FLOOR_HI} px)`);
console.log(dLines.join("\n"));
const square = CATALOGUE.length - wide;
console.log(
  `\n${under26} of ${square} square cards under ${FLOOR_HI} px, ${under20} under ${FLOOR_LO} px` +
    (wide ? ` (${wide} wide entries not modelled)` : ""),
);
