import { text } from "./gestures-page.js";

/**
 * **A picture made large on a click**, over the whole window — the owner, 9
 * October 2026: the cards on CONTROLS › ON THE FIELD were too small to judge
 * a control by. The picture is drawn again at the size it is shown rather
 * than stretched, so `draw` is handed the room there is and answers a canvas
 * that fills it. A view may be offered beside the first (the whole phone,
 * for the place a control stands in); a click outside the picture, the ✕ or
 * Escape closes it.
 */

export interface ZoomView {
  label: string;
  draw: (width: number, height: number) => HTMLCanvasElement;
}

function open(title: string, views: readonly ZoomView[]): void {
  const shade = document.createElement("div");
  shade.className = "pic-zoom";
  const bar = document.createElement("div");
  bar.className = "pic-zoom-bar";
  bar.appendChild(text("b", title));
  const stage = document.createElement("div");
  stage.className = "pic-zoom-stage";
  const close = (): void => {
    shade.remove();
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") close();
  };
  const buttons = views.map((v) => {
    const b = text("button", v.label);
    b.addEventListener("click", () => show(v));
    return b;
  });
  const show = (v: ZoomView): void => {
    for (const [i, b] of buttons.entries()) b.classList.toggle("on", views[i] === v);
    // The stage's own padding is 14 px a side and 14 below (`director-zoom.css`).
    const room = stage.getBoundingClientRect();
    stage.replaceChildren(v.draw(Math.floor(room.width - 28), Math.floor(room.height - 14)));
  };
  if (views.length > 1) bar.append(...buttons);
  const x = text("button", "✕");
  x.addEventListener("click", close);
  bar.appendChild(x);
  shade.append(bar, stage);
  shade.addEventListener("click", (e) => {
    if (e.target === shade || e.target === stage) close();
  });
  window.addEventListener("keydown", onKey);
  document.body.appendChild(shade);
  const [first] = views;
  if (first) show(first);
}

/** `el` opens the views on a click, the first of them shown. */
export function zoomable(el: HTMLElement, title: string, views: readonly ZoomView[]): HTMLElement {
  el.classList.add("zoomable");
  el.title = "Click to enlarge";
  el.addEventListener("click", () => open(title, views));
  return el;
}
