import { button, el } from "./checks-dom.js";
import type { Pair } from "./versus-pair.js";

/**
 * The generic widgets a live ALTERNATIVES screen runs on — a toggle button and
 * a rate picker — plus the pause/rate/blink/zoom bar built from them.
 *
 * Split out of `versus-page.ts` to keep that file under the line ceiling; a
 * `screenshot` row (`versus-page.ts`'s `renderScreen`) never calls
 * `controlsBar` at all; it freezes the pair itself and offers nothing to run
 * it with.
 */

const RATES = [0.25, 0.5, 1, 2];

function toggle(label: string, on: (state: boolean) => void): HTMLButtonElement {
  const b = button(label);
  b.addEventListener("click", () => {
    const next = b.dataset.state !== "on";
    b.dataset.state = next ? "on" : "off";
    b.classList.toggle("on", next);
    on(next);
  });
  return b;
}

function picker<T>(items: readonly T[], name: (x: T) => string, on: (x: T) => void, at = 0) {
  const sel = document.createElement("select");
  items.forEach((item, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = name(item);
    sel.appendChild(opt);
  });
  sel.value = String(at);
  sel.addEventListener("change", () => {
    const item = items[Number(sel.value)];
    if (item) on(item);
  });
  return sel;
}

/** The pause/rate/blink/zoom bar and its note. */
export function controlsBar(stage: HTMLElement, pair: Pair): HTMLElement[] {
  const bar = el("div", "versus-bar");
  bar.append(
    toggle("⏸", (paused) => pair.setRunning(!paused)),
    picker(RATES, (r) => `${r}×`, pair.setRate, RATES.indexOf(1)),
    toggle("BLINK", (on) => {
      stage.classList.toggle("is-blink", on);
      pair.setBlink(on);
    }),
    toggle("2× — NOT TRUE SIZE", (on) => pair.setZoom(on ? 2 : 1)),
  );
  const note = el(
    "p",
    "versus-blink-note",
    "BLINK superimposes the two sides and flips between them once a second — " +
      "the astronomer's trick for a difference too small to catch side by side.",
  );
  return [note, bar];
}
