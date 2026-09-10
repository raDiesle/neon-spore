import type { WaveEntry } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import type { CrawlerSide, GhostPath, RockCross, RockSize } from "@neon-spore/sim";
import { BODY_KINDS, bodyOf, colorForBody, type MeteorSpeed, setBody } from "./entry-fields.js";
import { silhouette } from "./silhouette.js";

/**
 * **How a row under the selected cell is drawn, and what each of its values is
 * called.** `cell-config.ts` next door decides *which* rows a cell gets; this
 * is every one of them made out of elements.
 *
 * Split off that file when the torch got a width of its own and it reached the
 * 250-line ceiling — along the seam the file's own header already draws. The
 * question it answers grows by one row per per-arrival number the game
 * invents, and none of those touch anything here: a new row is a call to
 * `choiceRow` and a one-line label function, so this half grows by two lines
 * where that one grows by a decision.
 *
 * Nothing here decides anything either. Every function takes what to show and
 * a callback for the press; which of them is drawn at all, and what a press
 * means to the wave, are both next door.
 */

/** A rock's fall, said in the unit the pair actually say out loud: tiles a
 * beat, which is what the tier number *is* (`fallTilesPerBeat`). */
export function speedLabel(speed: MeteorSpeed): string {
  return `×${speed}`;
}

/** How fast a balloon climbs, said in the same unit and the same way a rock's
 * fall is: rows a step, which is also lanes a step, because the path is a
 * diagonal (a step comes every `balloonClimbBeats`). The same label
 * deliberately — the pair says "twice as fast" about both, and two spellings
 * would be two words for one idea. */
export function riseLabel(rise: number): string {
  return `×${rise}`;
}

/** The path a ghost takes, said the way the wave's guide says it: it falls,
 * or it goes across. */
export function pathLabel(path: GhostPath): string {
  return path === "down" ? "DOWN" : "ACROSS";
}

/** How many bodies hang on the thread, or run along the worm. The bare
 * number: the label beside it already says what is being counted. */
export function beadLabel(beads: number): string {
  return String(beads);
}

/** Which wall a worm comes over, said the way the wave's guide says it. */
export function sideLabel(side: CrawlerSide): string {
  return side === "left" ? "LEFT" : "RIGHT";
}

/**
 * The route a rock takes, said as the picture of it: it falls down the column
 * it was painted in, or it comes over one of the two walls and walks a row.
 *
 * The arrows are the pod's own labels (`cell-config-pod.ts`), and deliberately
 * so — a pod that crosses and a rock that crosses do the same thing to the
 * field, and an author who has learnt one row should not have to learn a
 * second vocabulary for the other.
 */
export function crossLabel(cross: RockCross | null): string {
  if (cross === null) return "FALLS";
  return cross === -1 ? "◀ CROSSES" : "CROSSES ▶";
}

/** One tile or the 2x2 square. The number is the width in tiles, so the label
 * says the shape rather than repeating it. */
export function sizeLabel(size: RockSize): string {
  return size === 1 ? "1×1" : "2×2";
}

/**
 * The body behind a lure, a shell, a clasp or a dart, drawn as the two
 * silhouettes rather than as the two colour words. The author is choosing a
 * shape — the colour is only how the game names it (`setBody`) — and a red and
 * a cyan swatch side by side say nothing about which one is flat and wide.
 */
export function bodyRow(e: WaveEntry, onEdit: () => void): HTMLElement {
  const current = bodyOf(e);
  const row = labelled("BODY");
  for (const body of BODY_KINDS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = current === body ? "chip on" : "chip";
    button.dataset.body = body;
    button.append(silhouette(body.toUpperCase(), bodyStroke(body), 20), text(body.toUpperCase()));
    button.addEventListener("click", () => {
      setBody(e, body);
      onEdit();
    });
    row.appendChild(button);
  }
  return row;
}

/** The stroke a body's card is drawn in: its own colour, straight out of the
 * palette the game draws it with. */
function bodyStroke(body: "slick" | "bulb"): string {
  return colorForBody(body) === "red" ? PALETTE.red : PALETTE.cyan;
}

export function choiceRow<T>(
  label: string,
  options: readonly T[],
  current: T,
  name: (value: T) => string,
  pick: (value: T) => void,
): HTMLElement {
  const row = labelled(label);
  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = option === current ? "chip on" : "chip";
    button.textContent = name(option);
    button.addEventListener("click", () => pick(option));
    row.appendChild(button);
  }
  return row;
}

export function labelled(label: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "cell-row";
  const name = document.createElement("span");
  name.className = "cell-row-label";
  name.textContent = label;
  row.appendChild(name);
  return row;
}

function text(value: string): HTMLElement {
  const span = document.createElement("span");
  span.textContent = value;
  return span;
}
