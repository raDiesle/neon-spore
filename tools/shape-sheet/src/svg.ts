import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Bounds } from "./metrics.js";

/** Cell geometry and page furniture, shared by the shape sheet and the motion sheet. */
export const CELL = 180;
export const COLS = 3;

export interface Fit {
  scale: number;
  transform: string;
}

/**
 * Centre a subject in its cell and scale it to fill it.
 *
 * The alternative — a scale per subject, chosen by hand — is what the sheet
 * used to do, and it made the hull a 49px smear in a 180px box: a silhouette
 * you cannot see is not a test. Proportions between cells were never
 * comparable anyway (the game derives them from the tile size), so the cell is
 * better spent on the shape than on preserving a ratio that means nothing.
 */
export function fit(b: Bounds, pad = 24): Fit {
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  const scale = (CELL - pad) / Math.max(w, h);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  return {
    scale,
    transform: `scale(${scale.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`,
  };
}

/** One labelled cell on a sheet, positioned by index. `body` is drawn centred. */
export function frame(index: number, name: string, note: string, body: string): string {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = 40 + col * (CELL + 40) + CELL / 2;
  const y = 70 + row * (CELL + 70) + CELL / 2;
  return `  <g transform="translate(${x} ${y})">
    <rect x="${-CELL / 2}" y="${-CELL / 2}" width="${CELL}" height="${CELL}" rx="10"
          fill="#0E0A22" stroke="#241B4F"/>
${body}
    <text y="${CELL / 2 + 18}" text-anchor="middle" fill="#F2E9DC"
          font-family="Courier New, monospace" font-size="11">${name}</text>
    <text y="${CELL / 2 + 32}" text-anchor="middle" fill="#7A6FA8"
          font-family="Courier New, monospace" font-size="9">${note}</text>
  </g>`;
}

export interface Sheet {
  out: string;
  title: string;
  width: number;
  height: number;
  body: string;
  count: number;
}

export async function sheet(s: Sheet): Promise<void> {
  const out = resolve(import.meta.dir, s.out);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" width="${s.width}" height="${s.height}">
  <title>${s.title}</title>
  <rect width="${s.width}" height="${s.height}" fill="#07060F"/>
  <text x="40" y="40" fill="#FFC24B" font-family="Courier New, monospace"
        font-size="14" letter-spacing="3">${s.title}</text>
${s.body}
</svg>
`;
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, svg, "utf8");
  console.log(`wrote ${out} — ${s.count} shapes`);
}
