/**
 * Draw a skin without starting anything.
 *
 * ```
 * bun run shapes:still chamber                 every body under CHAMBER
 * bun run shapes:still chamber "THE POMMEL"    one body, large
 * bun run shapes:still all "THE POMMEL"        one body under every skin
 * ```
 *
 * The gap this closes: until now a skin could only be seen by starting the
 * director, opening the SHAPES tab and clicking a switcher, so the one question
 * a skin exists to answer was out of reach from a terminal and out of reach
 * entirely for a single body. `skins/chamber.ts` landed never having been
 * drawn, and the lane that wrote it drew its interior twice — once for real and
 * once in a throwaway script, because a throwaway script was the only way to
 * look at anything.
 *
 * Written into `tools/shape-sheet/`, beside `shape-sheet.svg` and
 * `motion-sheet.svg`, because it is the same kind of artefact and belongs where
 * somebody already looks for one. Unlike those two it is **not** committed:
 * they are the whole catalogue every time and this file is whatever was last
 * asked for, so its diff would say which question somebody happened to ask
 * rather than anything about the tree.
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CATALOGUE } from "@neon-spore/shape-sheet";
import { skinStill, UNDRAWABLE } from "./src/skin-still.js";
import { SKINS, type SkinId } from "./src/skins/index.js";

const OUT = resolve(import.meta.dir, "../shape-sheet/skin-sheet.svg");

/** Big enough that an interior is a picture rather than a texture. */
const ONE = 320;
const MANY = 132;
const GAP = 16;
const LABEL = 22;

interface Cell {
  label: string;
  svg: string;
}

function grid(cells: Cell[], box: number, title: string): string {
  const cols = Math.max(1, Math.min(cells.length, Math.floor(1200 / (box + GAP))));
  const rows = Math.ceil(cells.length / cols);
  const w = GAP + cols * (box + GAP);
  const h = 54 + rows * (box + GAP + LABEL);
  const body = cells
    .map((c, i) => {
      const x = GAP + (i % cols) * (box + GAP);
      const y = 54 + Math.floor(i / cols) * (box + GAP + LABEL);
      // The still is a whole `<svg>` with its own viewBox, so it is placed
      // rather than re-fitted — nothing here knows how a card is framed, which
      // is the point of `figureLayout` owning that alone.
      const inner = c.svg.replace("<svg ", `<svg x="${x}" y="${y}" `);
      return `${inner}
  <text x="${x + box / 2}" y="${y + box + 14}" text-anchor="middle" fill="#F2E9DC"
        font-family="Courier New, monospace" font-size="10">${c.label}</text>`;
    })
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#07060F"/>
  <text x="${GAP}" y="34" fill="#FFC24B" font-family="Courier New, monospace"
        font-size="14" letter-spacing="3">${title}</text>
${body}
</svg>
`;
}

const [skinArg, nameArg] = process.argv.slice(2);
if (!skinArg) {
  console.error("usage: bun run shapes:still <skin|all> [SHAPE NAME]");
  console.error(`skins: ${SKINS.map((s) => s.id).join(", ")}`);
  process.exit(1);
}

const entries = nameArg
  ? CATALOGUE.filter((e) => e.subject.name.toUpperCase() === nameArg.toUpperCase())
  : CATALOGUE;
if (entries.length === 0) {
  console.error(`no shape named ${nameArg}`);
  process.exit(1);
}

let cells: Cell[];
let box: number;
let title: string;

if (skinArg === "all") {
  const entry = entries[0];
  if (!entry) process.exit(1);
  box = MANY;
  // Every skin the shim can draw. The ones it cannot are named rather than
  // skipped silently — a missing cell in a sheet reads as a skin that failed.
  cells = SKINS.filter((s) => !UNDRAWABLE[s.id]).map((s) => ({
    label: s.label,
    svg: skinStill(entry, { skin: s.id, box }),
  }));
  for (const [id, why] of Object.entries(UNDRAWABLE)) console.log(`skipped ${id}: ${why}`);
  title = `${entry.subject.name} — EVERY SKIN`;
} else {
  const skin = SKINS.find((s) => s.id === skinArg);
  if (!skin) {
    console.error(`no skin ${skinArg} — have ${SKINS.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }
  box = entries.length === 1 ? ONE : MANY;
  cells = entries.map((e) => ({
    label: e.subject.name,
    svg: skinStill(e, { skin: skin.id as SkinId, box }),
  }));
  title = `${skin.label} — ${entries.length === 1 ? entries[0]?.subject.name : `${entries.length} BODIES`}`;
}

await writeFile(OUT, grid(cells, box, title), "utf8");
console.log(`wrote ${OUT} — ${cells.length} cells`);
