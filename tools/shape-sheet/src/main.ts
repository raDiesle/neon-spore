import { contourAt, type Subject } from "./contour.js";
import { boundsOver } from "./metrics.js";
import { SUBJECTS } from "./subjects.js";
import { CELL, COLS, fit, frame, sheet } from "./svg.js";

/**
 * The SVG test sheet.
 *
 * Its point is not the picture — it is that the picture comes out of the *same*
 * functions the canvas calls. Every silhouette lives in `subjects.ts`, which
 * samples contours through `hullRadiusMul` and `crystalRadiusMul`, so a shape
 * can be looked at in a browser at any size without a game running, and a
 * change to a shape parameter shows up in both places or in neither.
 *
 * Time is frozen at `t = 0`. The contours wobble, and a sheet that animated
 * would be useless for comparing one revision against the next — motion is the
 * motion sheet's job.
 *
 * Regenerate with `bun run --cwd tools/shape-sheet build`.
 */

const T = 0;

function cell(s: Subject, index: number): string {
  const d = contourAt(s, T);
  const f = fit(boundsOver(s, [T]));
  const fill = s.open
    ? 'fill="none"'
    : `fill="#190F2C" fill-opacity="0.55"${s.hole ? ' fill-rule="evenodd"' : ""}`;
  const body = `    <g transform="${f.transform}">
      <path d="${d}" ${fill} stroke="#2FE0F0" stroke-width="${(2.5 / f.scale).toFixed(2)}"
            stroke-linejoin="round" stroke-linecap="round"/>
    </g>`;
  return frame(index, s.name, s.note, body);
}

const rows = Math.ceil(SUBJECTS.length / COLS);
await sheet({
  out: "../shape-sheet.svg",
  title: "NEON SPORE · SHAPE SHEET",
  width: 40 + COLS * (CELL + 40),
  height: 70 + rows * (CELL + 70),
  body: SUBJECTS.map(cell).join("\n"),
  count: SUBJECTS.length,
});
