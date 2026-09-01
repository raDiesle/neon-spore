import type { WaveEntry } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import type { RockSize } from "@neon-spore/sim";
import {
  authorsBody,
  BODY_KINDS,
  bodyOf,
  colorForBody,
  isTieredRock,
  METEOR_SIZES,
  METEOR_SPEEDS,
  type MeteorSpeed,
  meteorSize,
  meteorSpeed,
  setBody,
  setMeteorSize,
  setMeteorSpeed,
} from "./entry-fields.js";
import { silhouette } from "./silhouette.js";

/**
 * The rows under the selected cell that configure the arrival in it: how fast
 * and how wide a rock comes down, and which body is behind a lure, a shell, a
 * clasp or a dart.
 *
 * **These used to be brushes.** Five meteor buttons in the palette were five
 * fall speeds, and the body under a shell was not authorable at all. Both are
 * facts about *one arrival* rather than about a tool, so they belong to the
 * cell you are pointing at — see `entry-fields.ts` for the reading and the
 * writing, and `brushes.ts` for why the palette lost four buttons.
 *
 * Its own file rather than more of `cell-panel.ts` because the two answer
 * different questions: that one is what is in the cell and what can be done to
 * the cell, and this is what the thing in it *is*. That file is also at its
 * length limit, and this half is the one that grows — every future per-arrival
 * number is another row here and nothing at all there.
 *
 * Nothing here decides anything: it draws whatever `entry-fields.ts` says and
 * calls back when a button is pressed. A row whose question the entry does not
 * answer is not drawn at all rather than drawn disabled — a shell has no speed,
 * and a greyed-out speed row on one would read as a speed it happens to be at.
 */
export interface CellConfigOptions {
  /** The entry in the selected cell, or nothing. */
  entry(): WaveEntry | undefined;
  /** The entry changed: mark the wave dirty and redraw everything. */
  onEdit(): void;
}

export function cellConfig({ entry, onEdit }: CellConfigOptions): HTMLElement | null {
  const e = entry();
  if (!e) return null;

  const rows: HTMLElement[] = [];
  if (isTieredRock(e)) {
    rows.push(
      choiceRow("SPEED", METEOR_SPEEDS, meteorSpeed(e), speedLabel, (speed) => {
        setMeteorSpeed(e, speed);
        onEdit();
      }),
    );
    rows.push(
      choiceRow("SIZE", METEOR_SIZES, meteorSize(e), sizeLabel, (size: RockSize) => {
        setMeteorSize(e, size);
        onEdit();
      }),
    );
  }
  if (authorsBody(e)) {
    rows.push(bodyRow(e, onEdit));
  }
  if (!rows.length) return null;

  const box = document.createElement("div");
  box.className = "cell-config";
  box.append(...rows);
  return box;
}

/** A rock's fall, said in the unit the pair actually say out loud: tiles a
 * beat, which is what the tier number *is* (`fallTilesPerBeat`). */
function speedLabel(speed: MeteorSpeed): string {
  return `×${speed}`;
}

/** One tile or the 2x2 square. The number is the width in tiles, so the label
 * says the shape rather than repeating it. */
function sizeLabel(size: RockSize): string {
  return size === 1 ? "1×1" : "2×2";
}

/**
 * The body behind a lure, a shell, a clasp or a dart, drawn as the two
 * silhouettes rather than as the two colour words. The author is choosing a
 * shape — the colour is only how the game names it (`setBody`) — and a red and
 * a cyan swatch side by side say nothing about which one is flat and wide.
 */
function bodyRow(e: WaveEntry, onEdit: () => void): HTMLElement {
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

function choiceRow<T>(
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

function labelled(label: string): HTMLElement {
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
