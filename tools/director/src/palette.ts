import { silhouette } from "./silhouette.js";
import { BRUSH_GROUPS, BRUSHES, type Brush } from "./state.js";

export interface Palette {
  current(): Brush;
  render(): void;
}

/**
 * `hidden` names brushes the current wave has no use for — a boss wave has no
 * use for the three that place a living creature or a rock. Hiding the button
 * is the visible half of the guard; `paint` in state.ts holds the other half,
 * so a selection carried over from another wave cannot place one either.
 */
export function bindPalette(onPick: () => void, hidden: () => ReadonlySet<Brush>): Palette {
  const brushBar = document.getElementById("brushes");
  // The first brush in bestiary order, not a hardcoded colour — the bestiary
  // no longer starts with a coloured kind on any guarantee.
  let brush: Brush = BRUSHES[0]?.brush ?? "erase";

  const render = (): void => {
    if (!brushBar) return;
    const hide = hidden();
    // The selection may have just become hidden by a wave switch; fall back to
    // the first brush still on offer rather than leaving a dead one selected.
    if (hide.has(brush)) {
      const first = BRUSHES.find((b) => !hide.has(b.brush));
      if (first) brush = first.brush;
    }
    brushBar.replaceChildren();
    const byBrush = new Map(BRUSHES.map((b) => [b.brush, b] as const));
    for (const group of BRUSH_GROUPS) {
      const visible = group.brushes.filter((b) => !hide.has(b));
      // A group every brush of which the current wave hides — the boss-panel
      // creature groups on a boss wave — loses its label along with its
      // buttons, rather than leaving a heading with nothing under it.
      if (!visible.length) continue;

      const label = document.createElement("div");
      label.className = "brush-group-label";
      label.textContent = group.label;
      brushBar.appendChild(label);

      for (const brushKind of visible) {
        const b = byBrush.get(brushKind);
        if (!b) continue;
        const button = document.createElement("button");
        button.type = "button";
        button.className = b.brush === brush ? "brush on" : "brush";

        for (const subject of b.subjects) {
          button.appendChild(silhouette(subject, b.stroke, 34));
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
          brush = b.brush;
          render();
          onPick();
        });
        brushBar.appendChild(button);
      }
    }
  };

  render();
  return { current: () => brush, render };
}
