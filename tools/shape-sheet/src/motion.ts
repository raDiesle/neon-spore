import { boundsOver, travel, WOBBLE_PERIOD } from "./metrics.js";
import { SUBJECTS, type Subject } from "./subjects.js";
import { CELL, COLS, fit, frame, sheet } from "./svg.js";

/**
 * The motion sheet: the shape sheet's answer to animation.
 *
 * A still frame cannot show a wobble, and a screenshot of a running game shows
 * one arbitrary instant of it. So each cell here is onion-skinned — the same
 * contour drawn at `FRAMES` moments across one wobble period, oldest faintest.
 * What you are judging is the *envelope*: how far the outline breathes, whether
 * a lobe swings or merely shivers, whether the armed hull still reads as armed
 * at every instant rather than only at t = 0.
 *
 * One static image answers those questions, which is the point: motion becomes
 * something you can look at, diff and archive.
 *
 * Regenerate with `bun run --cwd tools/shape-sheet motion`.
 */

const FRAMES = 8;

function cell(s: Subject, index: number): string {
  const times = Array.from({ length: FRAMES }, (_, i) => (i / FRAMES) * WOBBLE_PERIOD);
  const f = fit(boundsOver(s, times));
  const layers: string[] = [];
  for (let i = 0; i < FRAMES; i++) {
    const t = times[i]!;
    const newest = i === 0;
    // t = 0 is the frame the shape sheet shows, so it stays the bright one.
    const opacity = newest ? 1 : 0.14 + 0.3 * (1 - i / FRAMES);
    const stroke = newest ? "#2FE0F0" : "#8A6BF0";
    const width = ((newest ? 2.5 : 1.6) / f.scale).toFixed(2);
    layers.push(
      `      <path d="${s.path(s.pointsAt(t))}" fill="none" stroke="${stroke}"` +
        ` stroke-opacity="${opacity.toFixed(2)}" stroke-width="${width}"` +
        ` stroke-linejoin="round" stroke-linecap="round"/>`,
    );
  }
  const body = `    <g transform="${f.transform}">
${layers.join("\n")}
    </g>`;
  const note = `${FRAMES} frames · travel ${travel(s).toFixed(1)}px`;
  return frame(index, s.name, note, body);
}

const rows = Math.ceil(SUBJECTS.length / COLS);
await sheet({
  out: "../motion-sheet.svg",
  title: "NEON SPORE · MOTION SHEET",
  width: 40 + COLS * (CELL + 40),
  height: 70 + rows * (CELL + 70),
  body: SUBJECTS.map(cell).join("\n"),
  count: SUBJECTS.length,
});
