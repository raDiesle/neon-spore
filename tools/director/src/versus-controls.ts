import { button, el } from "./dom.js";
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

/** A button that remembers whether it is on. `hook` is a class `bun run shot
 * --click` can name, for the ones a picture has to be taken through. */
function toggle(label: string, on: (state: boolean) => void, hook = ""): HTMLButtonElement {
  const b = button(label);
  if (hook) b.classList.add(hook);
  b.addEventListener("click", () => {
    const next = b.dataset.state !== "on";
    b.dataset.state = next ? "on" : "off";
    b.classList.toggle("on", next);
    on(next);
  });
  return b;
}

/**
 * A `<select>` over a list, addressed by the **value** of the thing it picks
 * rather than by its position.
 *
 * `String(item)` and not an index, because `bun run shot --select` matches a
 * `<select>` by option value and `.versus-rate=0.25` is a sentence somebody can
 * write down. The rate picker is the one that pays for it: at 0.25× a thrust
 * burning for one beat of a two-second replay stretches past the whole window,
 * so every frame carries it and a picture of it stops being a lottery.
 */
function picker<T>(
  items: readonly T[],
  name: (x: T) => string,
  on: (x: T) => void,
  at = 0,
  hook = "",
) {
  const sel = document.createElement("select");
  if (hook) sel.className = hook;
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = String(item);
    opt.textContent = name(item);
    sel.appendChild(opt);
  });
  sel.value = String(items[at]);
  sel.addEventListener("change", () => {
    const item = items.find((x) => String(x) === sel.value);
    if (item !== undefined) on(item);
  });
  return sel;
}

/** The pause/rate/blink/zoom bar and its note. */
export function controlsBar(stage: HTMLElement, pair: Pair): HTMLElement[] {
  const bar = el("div", "versus-bar");
  bar.append(
    toggle("⏸", (paused) => pair.setRunning(!paused)),
    picker(RATES, (r) => `${r}×`, pair.setRate, RATES.indexOf(1), "versus-rate"),
    toggle("BLINK", (on) => {
      stage.classList.toggle("is-blink", on);
      pair.setBlink(on);
    }),
    toggle("2× — NOT TRUE SIZE", (on) => pair.setZoom(on ? 2 : 1), "versus-zoom"),
  );
  const note = el(
    "p",
    "versus-blink-note",
    "BLINK superimposes the two sides and flips between them once a second — " +
      "the astronomer's trick for a difference too small to catch side by side.",
  );
  return [note, bar];
}
