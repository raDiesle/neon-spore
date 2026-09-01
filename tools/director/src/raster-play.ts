import { WAVES } from "@neon-spore/content";
import { button, el } from "./dom.js";
import { bindRasterField, DEFAULT_WAVE } from "./raster-field.js";

/**
 * "PLAY IT" — the section that puts the burst where it would actually live.
 *
 * The rest of this tab shows the animation; this shows the *game*, and they
 * are not the same review. A burst on a 300 px card with nothing else moving
 * always looks good. The question is whether it reads at 26 px objects, over a
 * hull, under a HUD, at tempo, when you are also watching a rock fall — and
 * the only way to answer that is to fire a shot and see.
 *
 * The switch is the point of the section. It flips the baked burst without
 * touching the wave, so the comparison is one tap on a field that keeps
 * running rather than two page loads and a memory of the first one.
 * `docs/decisions.md` #24 measured that at seven to twelve seconds a flip, and
 * a comparison costing that is one nobody makes.
 */

/** A phone, at a size a desktop column and a phone screen can both hold. */
const FIELD_W = 340;
const FIELD_H = Math.round(FIELD_W * (844 / 390));

export function playSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "PLAY IT"));
  section.appendChild(
    el(
      "p",
      "note",
      "The shipping renderer against a real World, stepped at the real tick " +
        "rate, answering a finger through the same touch.ts the phone calls. " +
        "Drag along the hull to slide the cannon, tap to fire, and hold on the " +
        "shield to guard — both seats on the one screen, the way the editor's " +
        "own stage shows them.",
    ),
  );
  section.appendChild(
    el(
      "p",
      "note",
      "BAKED BURST switches the atlas in and out live. Off is exactly what the " +
        "game ships today; on is the same frame with the burst drawn over the " +
        "sparks, never instead of them. Nothing here writes to the game — the " +
        "field a player opens is unchanged either way.",
    ),
  );
  const mount = el("div");
  mount.id = "rasterPlayMount";
  section.appendChild(mount);
  return section;
}

/** Built on first sight of the tab — a live world is not page-load work. */
export function drawPlay(mount: HTMLElement): void {
  const controls = el("div", "holder-row");

  const picker = document.createElement("select");
  WAVES.forEach((wave, i) => {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `${i + 1}. ${wave.name}`;
    picker.appendChild(option);
  });
  picker.value = String(DEFAULT_WAVE < 0 ? 0 : DEFAULT_WAVE);
  controls.appendChild(picker);

  let baked = true;
  const toggle = button("BAKED BURST — ON");
  const restart = button("↺ RESTART");
  controls.appendChild(toggle);
  controls.appendChild(restart);
  mount.appendChild(controls);

  const canvas = document.createElement("canvas");
  canvas.className = "holder-shot";
  canvas.style.width = `${FIELD_W}px`;
  canvas.style.height = `${FIELD_H}px`;
  canvas.style.maxWidth = "100%";
  // The field is the one thing on this page a finger acts on, so it may not
  // be scrolled by the same drag that slides the cannon.
  canvas.style.touchAction = "none";
  mount.appendChild(canvas);

  const field = bindRasterField(canvas);
  picker.addEventListener("change", () => field.setWave(Number(picker.value)));
  restart.addEventListener("click", () => field.restart());
  toggle.addEventListener("click", () => {
    baked = !baked;
    toggle.textContent = `BAKED BURST — ${baked ? "ON" : "OFF"}`;
    field.setBaked(baked);
  });
}
