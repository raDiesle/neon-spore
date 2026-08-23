import {
  blobPath,
  crystalPath,
  HULL,
  hullPointAt,
  JELLY,
  MANTA,
  METEOR,
  openSmoothPath,
  type Bump,
} from "@neon-spore/content";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * The SVG test sheet.
 *
 * Its point is not the picture — it is that the picture comes out of the *same*
 * functions the canvas calls. `content/shapes.ts` returns SVG path data, and
 * `new Path2D(d)` accepts it, so a silhouette can be looked at in a browser at
 * any size without a game running, and a change to a shape parameter shows up
 * in both places or in neither.
 *
 * Regenerate with `bun run --cwd tools/shape-sheet build`.
 */

const OUT = resolve(import.meta.dir, "../shape-sheet.svg");
const CELL = 180;
const COLS = 3;
/** Frozen time. A sheet that animated would be useless for comparing revisions. */
const T = 0;

interface Cell {
  name: string;
  note: string;
  d: string;
  /** An open contour must not be filled — SVG would close it across the ends. */
  open?: boolean;
}

function creature(name: string, note: string, s: typeof MANTA): Cell {
  return {
    name,
    note,
    d: blobPath(0, 0, s.rx, s.ry, s.lobes, s.depth, s.wobble, T, s.seed),
  };
}

/**
 * The hull as the game draws it: one contour with a cannon lobe, and a shield
 * lobe that only exists while armed. Two cells, so the difference between
 * passive and armed is visible side by side — that difference is the thing
 * spec 5.8 says has to be unmissable.
 */
function hull(armed: boolean): Cell {
  // Illustrative proportions. The game derives these from the tile size, so the
  // sheet is for judging the *shape*, not for measuring pixels against a phone.
  const rx = 300;
  const ry = 48;
  const bumps: Bump[] = [
    { angle: -Math.PI / 2, strength: 0.5, plateau: 0.014, shoulder: 0.026 },
  ];
  if (armed) {
    bumps.push({ angle: -Math.PI / 2 + 0.16, strength: 0.34, plateau: 0.024, shoulder: 0.03 });
  }
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const a = -Math.PI / 2 - 0.42 + 0.84 * (i / 120);
    pts.push(hullPointAt(a, 0, ry, rx, ry, HULL.lobes, HULL.depth, HULL.wobble, T, HULL.seed, bumps));
  }
  return {
    name: armed ? "HULL · ARMED" : "HULL · PASSIVE",
    note: armed ? "cannon lobe + shield lobe" : "cannon lobe only",
    d: openSmoothPath(pts),
    open: true,
  };
}

const CELLS: Cell[] = [
  creature("MANTA", `${MANTA.lobes} lobes · depth ${MANTA.depth}`, MANTA),
  creature("JELLY", `${JELLY.lobes} lobes · depth ${JELLY.depth}`, JELLY),
  {
    name: "METEOR",
    note: `${METEOR.sides} facets · dead rock`,
    d: crystalPath(0, 0, 46, 46, METEOR.sides, METEOR.depth, METEOR.wobble, T, METEOR.seed),
  },
  hull(false),
  hull(true),
];

function cell(c: Cell, index: number): string {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = 40 + col * (CELL + 40);
  const y = 70 + row * (CELL + 70);
  // The hull is far wider than a creature, so it is scaled to fit its cell.
  const scale = c.open ? 0.26 : 0.85;
  const fill = c.open ? 'fill="none"' : 'fill="#190F2C" fill-opacity="0.55"';
  return `  <g transform="translate(${x + CELL / 2} ${y + CELL / 2})">
    <rect x="${-CELL / 2}" y="${-CELL / 2}" width="${CELL}" height="${CELL}" rx="10"
          fill="#0E0A22" stroke="#241B4F"/>
    <g transform="scale(${scale})">
      <path d="${c.d}" ${fill} stroke="#2FE0F0" stroke-width="${(2.5 / scale).toFixed(2)}"
            stroke-linejoin="round" stroke-linecap="round"/>
    </g>
    <text y="${CELL / 2 + 18}" text-anchor="middle" fill="#F2E9DC"
          font-family="Courier New, monospace" font-size="11">${c.name}</text>
    <text y="${CELL / 2 + 32}" text-anchor="middle" fill="#7A6FA8"
          font-family="Courier New, monospace" font-size="9">${c.note}</text>
  </g>`;
}

const rows = Math.ceil(CELLS.length / COLS);
const width = 40 + COLS * (CELL + 40);
const height = 70 + rows * (CELL + 70);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#07060F"/>
  <text x="40" y="40" fill="#FFC24B" font-family="Courier New, monospace"
        font-size="14" letter-spacing="3">NEON SPORE · SHAPE SHEET</text>
${CELLS.map(cell).join("\n")}
</svg>
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, svg, "utf8");
console.log(`wrote ${OUT} — ${CELLS.length} shapes`);
