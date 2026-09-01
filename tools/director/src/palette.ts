import { brushArtImage } from "./brush-art.js";
import { readClosedCategories, writeClosedCategories } from "./brush-category.js";
import { bindBrushCard } from "./brush-tooltip.js";
import type { Selection } from "./selection.js";
import { silhouette } from "./silhouette.js";
import { BRUSH_GROUPS, BRUSHES, type Brush } from "./state.js";

export interface Palette {
  render(): void;
}

export interface PaletteOptions {
  /** Which cell a brush click paints. */
  selection: Selection;
  /** Brushes the current wave has no use for — a boss wave has no use for the
   * three that place a living creature or a rock. Hiding the button is the
   * visible half of the guard; `paint` in state.ts holds the other half, so a
   * selection carried over from another wave cannot place one either. */
  hidden(): ReadonlySet<Brush>;
  /** Paint the selected cell with a brush and settle everything an edit
   * touches — a wave rebuild, the status line, the stage. A no-op when
   * nothing is selected: a brush has nowhere to land until a tile does. */
  onPaint(brush: Brush): void;
}

/**
 * The palette: an accordion of categories, each with its own brushes directly
 * under it in the same column.
 *
 * It used to be a rail of tabs beside a wide grid of options — one category
 * on screen at a time, the buttons stretched across a track with room to
 * spare. That cost two things the author actually wanted: seeing SHIELD and
 * MIXED at once, and a palette narrow enough to sit *beside* the map rather
 * than above it. Every category opens by default and folds on its own click;
 * the buttons are as small as a 26px picture and a name allow, so the whole
 * column is content-width.
 *
 * **A brush is not held.** Clicking one paints the tile already selected on
 * the map and stops there — the button never stays lit, and nothing lingers
 * to paint a second cell by accident. Selecting is the map's job (a click on
 * a cell, `grid.ts`) and painting is the palette's; a wave author points at a
 * tile, then names what goes in it, and that naming is exactly how the panel
 * beside the map is reached for whatever was already there — select first,
 * and its options are already on screen, no separate "pick this thing" step
 * required.
 */
export function bindPalette({ selection, hidden, onPaint }: PaletteOptions): Palette {
  const brushBar = document.getElementById("brushes");
  const closed = readClosedCategories();

  // ERASE is a tool action rather than a creature, so its button is static
  // markup outside the list `render()` rebuilds — it reads the same wherever
  // the categories above it have been folded to, and it is bound once.
  const erase = document.getElementById("brushErase");
  if (erase) {
    erase.title = BRUSHES.find((b) => b.brush === "erase")?.note ?? "";
    erase.addEventListener("click", () => {
      if (!selection.at()) return;
      onPaint("erase");
    });
  }

  const brushButton = (b: (typeof BRUSHES)[number]): HTMLElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "brush";
    // The picture at a size worth looking at, the wave it first arrives in
    // and the brush's own sentence — on a card that opens under the pointer
    // (`brush-tooltip.ts`), so hovering says all three whether or not SHOW
    // DESCRIPTIONS is on. It replaces a `title` attribute, which could carry
    // two of the three and never the one that matters most.
    bindBrushCard(button, b.brush);

    // The button's own picture — a settled frame of the real renderer where
    // this module has one (`brush-art.ts`), the plain contour otherwise.
    const art = brushArtImage(b.brush, 26);
    if (art) {
      button.appendChild(art);
    } else {
      for (const subject of b.subjects) button.appendChild(silhouette(subject, b.stroke, 26));
    }

    const text = document.createElement("div");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = b.label;
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = b.note;
    text.append(name, hint);
    button.appendChild(text);

    button.addEventListener("click", () => {
      if (!selection.at()) return;
      onPaint(b.brush);
    });
    return button;
  };

  const render = (): void => {
    if (!brushBar) return;
    const hide = hidden();

    // A group every brush of which the current wave hides — the boss-panel
    // creature groups on a boss wave — drops out entirely, header and all,
    // rather than leaving an empty one to fold.
    const visibleGroups = BRUSH_GROUPS.map((group) => ({
      group,
      brushes: group.brushes.filter((b) => !hide.has(b)),
    })).filter((g) => g.brushes.length > 0);

    brushBar.replaceChildren();
    const byBrush = new Map(BRUSHES.map((b) => [b.brush, b] as const));

    for (const { group, brushes } of visibleGroups) {
      const section = document.createElement("div");
      section.className = closed.has(group.label) ? "brush-group closed" : "brush-group";

      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "brush-category";
      tab.textContent = group.label;
      tab.addEventListener("click", () => {
        if (closed.has(group.label)) closed.delete(group.label);
        else closed.add(group.label);
        writeClosedCategories(closed);
        render();
      });
      section.appendChild(tab);

      const list = document.createElement("div");
      list.className = "brush-list";
      for (const brushKind of brushes) {
        const b = byBrush.get(brushKind);
        if (b) list.appendChild(brushButton(b));
      }
      section.appendChild(list);
      brushBar.appendChild(section);
    }
  };

  render();
  return { render };
}
