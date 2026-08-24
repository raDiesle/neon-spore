import { silhouette } from "./silhouette.js";
import { BRUSHES, type Brush } from "./state.js";

export interface Palette {
  current(): Brush;
  render(): void;
}

export function bindPalette(onPick: () => void): Palette {
  const brushBar = document.getElementById("brushes");
  let brush: Brush = "alt";

  const render = (): void => {
    if (!brushBar) return;
    brushBar.replaceChildren();
    for (const b of BRUSHES) {
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
