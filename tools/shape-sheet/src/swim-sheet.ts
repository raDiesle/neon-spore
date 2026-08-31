// Reaching into the director for the pose arithmetic rather than repeating it,
// exactly as `drawn-size.ts` does and for the same reason: `motionTransform`
// and `tilePixels` are what a card on the SHAPES tab actually applies, and a
// filmstrip that worked the pose out a second way would be a picture of
// something the page does not draw. `tools/director/src/` is not this lane's
// to edit, only to call — see `CLAUDE.md`.
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import {
  motionTransform,
  tilePixels,
  transformedBounds,
} from "../../director/src/shapes-motion.js";
import type { CatalogueEntry } from "./catalogue.js";
import { contourAt } from "./contour.js";
import { JELLY_BODIES, JELLY_RECIPES } from "./jelly-bodies.js";
import { boundsOver } from "./metrics.js";
import { SWIM_PERIOD } from "./motions/pulse.js";
import { contraction } from "./parts/swim.js";
import { sheet } from "./svg.js";

/**
 * The swim sheet: one pulse cycle of every jelly, left to right.
 *
 * The motion sheet onion-skins a wobble into one cell, which answers *how far
 * does this breathe* and is the right question for a body that only breathes.
 * A swim stroke is not an envelope, it is an **order of events** — the bell
 * squeezes, the water leaves, the tentacles go taut, the bell opens, the
 * tentacles spread — and every one of those overlaid on one cell is a smear.
 * So this is a strip: the same body at nine moments across one cycle, read the
 * way a strip is read.
 *
 * Both halves of the stroke are applied, because either alone is a different
 * animal: the contour squeezes (`parts/swim.ts`) and `JET` lifts the body
 * (`motions/pulse.ts`), through the director's own `motionTransform` so the
 * strip shows what a card shows.
 *
 * **One scale per row, never per frame.** A frame fitted to its own contents
 * would rescale the squeeze away — the whole subject of the picture — so each
 * row is fitted once over its entire cycle, and a body that ends the row
 * smaller is a body that got smaller.
 */

const FRAMES = 9;
const CELL = 128;
const GAP = 4;
const ROW = CELL + 46;

/** Seconds in one cycle, from the beat the bell is actually keeping. */
const CYCLE = (SWIM_PERIOD * 60) / DEFAULT_CONFIG.bpm;
const TIMES = Array.from({ length: FRAMES }, (_, i) => (i / (FRAMES - 1)) * CYCLE);

function row(entry: CatalogueEntry, index: number): string {
  const pulse = JELLY_RECIPES[index]?.pulse;
  const subject = entry.subject;
  const still = boundsOver(subject, TIMES);
  const tile = tilePixels(still);
  const pivot = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
  const box = transformedBounds(subject, entry.motion, TIMES, tile, pivot);
  const scale = (CELL - 16) / Math.max(box.x1 - box.x0, box.y1 - box.y0);
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;

  const y = 96 + index * ROW;
  const cells: string[] = [
    `  <text x="40" y="${y - 10}" fill="#F2E9DC" font-family="Courier New, monospace"` +
      ` font-size="11" letter-spacing="2">${subject.name}</text>`,
    `  <text x="${44 + subject.name.length * 8}" y="${y - 10}" fill="#7A6FA8"` +
      ` font-family="Courier New, monospace" font-size="9">${subject.note}</text>`,
  ];

  for (let i = 0; i < FRAMES; i++) {
    const t = TIMES[i] as number;
    const x = 40 + i * (CELL + GAP);
    // How hard it is squeezing this frame, drawn as a bar under the cell. The
    // eye reads a strip as evenly spaced in time and reads nothing at all
    // about *where in the stroke* a frame sits; the bar is that, and it is
    // read off the same function the contour is sampled through.
    const c = contraction(pulse, t);
    const bar = (CELL - 16) * c;
    const pose = motionTransform(entry.motion, t, pivot, tile);
    cells.push(`  <g transform="translate(${x} ${y})">
    <rect width="${CELL}" height="${CELL}" rx="8" fill="#0E0A22" stroke="#241B4F"/>
    <g transform="translate(${CELL / 2} ${CELL / 2}) scale(${scale.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})">
      <g transform="${pose}">
        <path d="${contourAt(subject, t)}" fill="#1A1036" fill-opacity="0.6" stroke="#2FE0F0"
              stroke-width="${(1.7 / scale).toFixed(2)}" stroke-linejoin="round"/>
      </g>
    </g>
    <rect x="8" y="${CELL + 6}" width="${(CELL - 16).toFixed(1)}" height="3" rx="1.5" fill="#241B4F"/>
    <rect x="8" y="${CELL + 6}" width="${bar.toFixed(1)}" height="3" rx="1.5" fill="#FFC24B"/>
    <text x="${CELL / 2}" y="${CELL + 24}" text-anchor="middle" fill="#574D84"
          font-family="Courier New, monospace" font-size="7">${(t / CYCLE).toFixed(2)}</text>
  </g>`);
  }
  return cells.join("\n");
}

const head =
  `  <text x="40" y="66" fill="#7A6FA8" font-family="Courier New, monospace" font-size="9">` +
  `one pulse cycle · ${SWIM_PERIOD} beats at ${DEFAULT_CONFIG.bpm} BPM · ` +
  `gold bar is the bell's contraction, and the tentacles are always behind it</text>`;

await sheet({
  out: "../swim-sheet.svg",
  title: "NEON SPORE · SWIM SHEET",
  width: 40 + FRAMES * (CELL + GAP) + 36,
  height: 96 + JELLY_BODIES.length * ROW + 20,
  body: [head, ...JELLY_BODIES.map(row)].join("\n"),
  count: JELLY_BODIES.length,
});
