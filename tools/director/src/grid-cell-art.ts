import type { Wave } from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";
import { brushArtImage } from "./brush-art.js";
import { podGlyph } from "./grid-pods.js";
import { silhouette } from "./silhouette.js";
import { BRUSHES, type Brush, brushOf, entryAt, podAt, podBrushOf } from "./state.js";

/**
 * What one cell of the map draws: the creature that arrives on that beat, and
 * the pod that hangs in that column.
 *
 * Split out of `grid.ts` when the pod stopped being a glyph and started being
 * a picture, which took that file over the line limit. The seam is the same
 * one `grid-pods.ts` was cut along — next door is the cells and the gestures
 * on them, and nothing here answers a click, holds a selection or knows what a
 * beat is.
 *
 * **One brush is one drawing, wherever it is shown.** The palette's chip, the
 * hover card and the cell are three sizes of the same settled frame
 * (`brush-art.ts`), so what a wave author clicked and what the map shows them
 * afterwards can never be two different pictures. The pod was the one
 * exception until this file existed: MEND, PURGE and WARD were placed from
 * buttons that draw them and landed as ◇ ✦ ◎ — three marks that had to be
 * learnt, in a map where everything else was the thing itself.
 */

/** How big a cell's picture is drawn — a 32px cell, less its border. */
const ART_PX = 26;
/** And how big a pod's is when a creature already has the middle of the cell.
 * Big enough to tell the three apart, small enough not to be mistaken for what
 * the cell sends. */
const POD_BESIDE_PX = 13;

/** Puts whatever the cell holds into it. Nothing, for an empty cell. */
export function fillCell(button: HTMLElement, wave: Wave, beat: number, col: number): void {
  const entry = entryAt(wave, beat, col);
  if (entry) {
    const art = creatureArt(brushOf(entry));
    if (art) button.appendChild(art);
  }
  const pod = podAt(wave, beat, col);
  if (pod) drawPod(button, pod, Boolean(entry));
}

/** The creature's picture, the plain contour for a brush that has none, or
 * nothing at all for one that has neither. */
function creatureArt(brush: Brush): Element | null {
  const art = brushArtImage(brush, ART_PX);
  if (art) return art;
  const spec = BRUSHES.find((x) => x.brush === brush);
  const subject = spec?.subjects[0];
  return subject === undefined ? null : silhouette(subject, spec?.stroke ?? "", ART_PX);
}

/**
 * The pod: its picture, and the row it hangs on.
 *
 * The row is the one thing no picture of a pod can carry — it is where in the
 * *field* the thing hangs, and the map's vertical axis is time
 * (`grid-pods.ts`) — so it stays a number in the corner. The glyph comes back
 * only when the frame could not be built at all.
 */
function drawPod(button: HTMLElement, pod: PodEntry, beside: boolean): void {
  const brush = podBrushOf(pod);
  const art = brushArtImage(brush, beside ? POD_BESIDE_PX : ART_PX);
  const mark = document.createElement("span");
  mark.className = "pod";
  if (art) {
    art.classList.add("pod-art");
    if (beside) art.classList.add("beside");
    button.appendChild(art);
    mark.textContent = String(pod.row);
  } else {
    mark.textContent = `${podGlyph(brush)}${pod.row}`;
  }
  const spec = BRUSHES.find((x) => x.brush === brush);
  if (spec) mark.style.color = spec.stroke;
  button.appendChild(mark);
}
