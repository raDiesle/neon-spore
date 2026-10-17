import type { Wave, WaveEntry } from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";
import { brushArtImage } from "./brush-art.js";
import { silhouette } from "./silhouette.js";
import { BRUSHES, type Brush, brushOf, entryAt, podAt, podBrushOf } from "./state.js";

/**
 * What one cell of the map draws: the creature that arrives on that beat, and
 * the pod that hangs in that column.
 *
 * Split out of `grid.ts` when the pod stopped being a glyph and started being
 * a picture, which took that file over the line limit. The seam is the same
 * one `grid-note.ts` was cut along — next door is the cells and the gestures
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
  const title = cellTitle(entry, pod, beat, col);
  if (title) button.title = title;
}

/**
 * **What a tile holds, in words, on hover** — the owner, 16 October 2026. A
 * 26px picture tells a slick from a bulb but not a red one from a cyan one in
 * a hurry, nor a WARD pod from a husk wearing one, and the row a pod hangs on
 * is a digit in a corner. `undefined` for an empty tile, which says nothing.
 */
function cellTitle(
  entry: WaveEntry | undefined,
  pod: PodEntry | undefined,
  beat: number,
  col: number,
): string | undefined {
  const lines: string[] = [];
  if (entry) {
    const brush = brushOf(entry);
    const spec = BRUSHES.find((x) => x.brush === brush);
    const parts = [spec?.label ?? brush];
    // A METEOR is five tiers under one brush, and the tier is the speed.
    if (brush === "rock" && entry.kind) parts.push(entry.kind);
    if (entry.color) parts.push(entry.color);
    lines.push(parts.join(" · "));
    if (spec?.note) lines.push(spec.note);
  }
  if (pod) {
    const spec = BRUSHES.find((x) => x.brush === podBrushOf(pod));
    lines.push(`${spec?.label ?? "POD"} pod · hangs on row ${pod.row}`);
    if (spec?.note) lines.push(spec.note);
  }
  if (lines.length === 0) return undefined;
  lines.push(`beat ${beat} · column ${col}`);
  return lines.join("\n");
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
 * *field* the thing hangs, and the map's vertical axis is time — so it stays a
 * number in the corner, and the panel above the map is where it is changed
 * (`cell-config-pod.ts`). The glyph comes back only when the frame could not
 * be built at all.
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
    mark.textContent = husked(pod, String(pod.row));
  } else {
    mark.textContent = husked(pod, `${podGlyph(brush)}${pod.row}`);
  }
  // The HOLLOW brush's stroke is white, the colour of *leave that one alone*
  // on the field (`render/src/lure-alarm.ts`), so a husk's mark says so
  // without a rule here.
  const spec = BRUSHES.find((x) => x.brush === brush);
  if (spec) mark.style.color = spec.stroke;
  button.appendChild(mark);
}

/**
 * **A hollow pod's mark, which is the row with a cross in front of it.**
 *
 * The map draws a husk as the pod it claims to be, so this is the one place an
 * author can see which of three identical cells is the lie. Two characters and
 * not a word: the cell is a few pixels wide and the row number has to stay
 * readable beside it.
 */
function husked(pod: PodEntry, text: string): string {
  return pod.kind === "husk" ? `✗${text}` : text;
}

/**
 * The mark a pod falls back to when its picture could not be built.
 *
 * It lived beside the list of pods under the map until that list went away
 * (`grid-note.ts`), and this is the only place left that needs it: a cell is
 * where a pod is now both drawn and pointed at.
 */
function podGlyph(brush: Brush): string {
  // The husk's cross is `husked`'s, so both kinds fall back to the one ring.
  return brush === "pod" || brush === "husk" ? "◎" : "◇";
}
