/**
 * The subject of a sound, drawn.
 *
 * Two sources, both of them the game's own. A contour comes through
 * `silhouette.ts`, which reads `shape-sheet`'s subjects — the same geometry
 * the canvas draws. A control comes through `drawStepGlyph`, which is the
 * band's own button at a smaller radius. Nothing on this page invents a
 * picture for something the game already knows how to draw.
 */

import { drawStepGlyph, stepHex } from "@neon-spore/render";
import { hasSilhouette, silhouette } from "./silhouette.js";
import type { Subject } from "./sound-link.js";

const BOX = 40;

/** A control glyph on its own small canvas, at the device's pixel ratio. */
function glyph(subject: Extract<Subject, { kind: "control" }>): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = BOX * dpr;
  canvas.height = BOX * dpr;
  canvas.style.width = `${BOX}px`;
  canvas.style.height = `${BOX}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
    drawStepGlyph(ctx, BOX / 2, BOX / 2, BOX * 0.4, subject.step, 1);
  }
  return canvas;
}

/**
 * The picture, or an empty box of the same size. The empty box is deliberate:
 * a row that simply lost its graphic and a row whose subject has no drawn
 * shape yet have to look different from each other, and they do — one is a
 * gap in a grid, the other is a gap where a shape will go.
 */
export function subjectArt(subject: Subject, bound: boolean, why?: string): HTMLElement {
  const box = document.createElement("span");
  box.className = "art";

  if (subject.kind === "control") {
    box.appendChild(glyph(subject));
    box.style.setProperty("--edge", stepHex(subject.step));
    return box;
  }
  if (subject.kind === "shape" && hasSilhouette(subject.name)) {
    box.appendChild(silhouette(subject.name, bound ? "#2FE0F0" : "#7A6FA8", BOX));
    return box;
  }
  const dash = document.createElement("span");
  dash.className = "art-empty";
  dash.textContent = subject.kind === "shape" ? "?" : "·";
  dash.title =
    subject.kind === "shape"
      ? `${subject.name} has no drawn contour yet — see SHAPES`
      : (why ??
        "nothing on the field to draw: this one belongs to the beat, the screen or the room");
  box.appendChild(dash);
  return box;
}
