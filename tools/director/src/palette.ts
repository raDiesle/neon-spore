import { brushArt } from "./brush-art.js";
import { readActiveCategory, writeActiveCategory } from "./brush-category.js";
import { brushTooltip } from "./brush-tooltip.js";
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
 * The palette: a rail of category tabs and, under the one that is open, a
 * button per brush.
 *
 * **A brush is not held.** Clicking one paints the tile already selected on
 * the map and stops there — the button never stays lit, and nothing lingers
 * to paint a second cell by accident. Selecting is the map's job (a click on
 * a cell, `grid.ts`) and painting is the palette's; a wave author points at a
 * tile, then names what goes in it, and that naming is exactly how the panel
 * under the map is reached for whatever was already there — select first,
 * and its options are already on screen, no separate "pick this thing" step
 * required.
 */
export function bindPalette({ selection, hidden, onPaint }: PaletteOptions): Palette {
  const categoryBar = document.getElementById("brushCategories");
  const brushBar = document.getElementById("brushes");
  let category: string | null = readActiveCategory();

  const render = (): void => {
    if (!categoryBar || !brushBar) return;
    const hide = hidden();

    // A group every brush of which the current wave hides — the boss-panel
    // creature groups on a boss wave — drops out entirely, tab and all,
    // rather than leaving an empty one to switch to.
    const visibleGroups = BRUSH_GROUPS.map((group) => ({
      group,
      brushes: group.brushes.filter((b) => !hide.has(b)),
    })).filter((g) => g.brushes.length > 0);

    categoryBar.replaceChildren();
    brushBar.replaceChildren();
    if (!visibleGroups.length) return;

    // The active tab may have just lost every brush it held (a wave switch),
    // or never been chosen at all; either way, fall back to the first one on
    // offer rather than showing no options at all.
    if (!visibleGroups.some((g) => g.group.label === category)) {
      category = visibleGroups[0]?.group.label ?? null;
    }

    for (const { group } of visibleGroups) {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = group.label === category ? "brush-category on" : "brush-category";
      tab.textContent = group.label;
      tab.addEventListener("click", () => {
        category = group.label;
        writeActiveCategory(group.label);
        render();
      });
      categoryBar.appendChild(tab);
    }

    const active = visibleGroups.find((g) => g.group.label === category);
    if (!active) return;
    const byBrush = new Map(BRUSHES.map((b) => [b.brush, b] as const));
    for (const brushKind of active.brushes) {
      const b = byBrush.get(brushKind);
      if (!b) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "brush";
      // The wave that first introduces what the brush paints, and the
      // brush's own description under it — both in the tooltip, so hovering
      // says the same thing whether or not SHOW DESCRIPTIONS is on.
      const wave = brushTooltip(b.brush);
      const lines = [wave, b.note].filter((l): l is string => Boolean(l));
      if (lines.length) button.title = lines.join("\n");

      // The button's own picture — a settled frame of the real renderer
      // where this module has one (`brush-art.ts`), the plain contour
      // otherwise.
      const art = brushArt(b.brush);
      if (art) {
        button.appendChild(art);
      } else {
        for (const subject of b.subjects) button.appendChild(silhouette(subject, b.stroke, 34));
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
      brushBar.appendChild(button);
    }
  };

  render();
  return { render };
}
