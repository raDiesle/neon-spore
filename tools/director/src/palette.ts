import { silhouette } from "./silhouette.js";
import { BRUSHES, type Brush } from "./state.js";

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
  let brush: Brush = "red";

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
    for (const b of BRUSHES) {
      if (hide.has(b.brush)) continue;
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
  };

  render();
  return { current: () => brush, render };
}
