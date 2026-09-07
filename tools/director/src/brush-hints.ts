/**
 * SHOW DESCRIPTIONS: whether each brush in the palette carries its sentence,
 * and the memory of that answer between sessions.
 *
 * Cut out of `main.ts` when the armed brush and the drag took that file past
 * its 250-line limit. It is the right thing to have moved: `main.ts` is where
 * the director's panels are *wired to each other*, and this is one switch over
 * one class on one element, with nothing else in the file able to see it.
 *
 * A brush's sentence is off by default — the name is usually enough, and the
 * full blurb is one hover away on the card (`brush-tooltip.ts`) and one click
 * away in CREATURES. Persisted the way the tuning presets are.
 */
const BRUSH_HINTS_KEY = "neon-spore-director-brush-hints";

export function bindBrushHints(): void {
  const brushes = document.getElementById("brushes");
  const toggle = document.getElementById("brushHintToggle");
  let show = window.localStorage.getItem(BRUSH_HINTS_KEY) === "1";
  const apply = (): void => {
    brushes?.classList.toggle("hide-hints", !show);
    if (toggle) toggle.textContent = show ? "HIDE DESCRIPTIONS" : "SHOW DESCRIPTIONS";
  };
  apply();
  toggle?.addEventListener("click", () => {
    show = !show;
    window.localStorage.setItem(BRUSH_HINTS_KEY, show ? "1" : "0");
    apply();
  });
}
