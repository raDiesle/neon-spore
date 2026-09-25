import type { SimConfig } from "@neon-spore/sim";

/**
 * The one switch that exists because the game has two people in front of it,
 * turned on from the one screen that has neither.
 *
 * `packages/sim/src/config-pair.ts` explains why `DEFAULT_CONFIG` ships
 * `briefings` off: a determinism run, a shape sheet and `relay:check` all want
 * the wave rather than the lesson, and every one of them would sit at a dial
 * nobody can turn. That default is correct. What was missing was the dial
 * itself — the director built the wave opening and then built from a config
 * where it was off, so the reasonable conclusion from outside was that it did
 * not exist. `PairConfig` used to carry a second field; THE FORK retired into
 * the ready gate at the end of a guide and took it with it, so `briefings` is
 * now the whole interface.
 *
 * `shotChargeBeats` does **not** get a row here, and it briefly did — a range
 * input was added and then removed in the same run once `apps/game/src/
 * testing.ts` turned out to already carry one: its own test panel's "Shot
 * lay" slider, 0 to 1 in eighth-beat steps, writing the same field. Two
 * controls for one number is worse than either alone — whoever finds the
 * second has no way to know the first exists, and the day one of them writes
 * somewhere the other does not read is a bug nobody asked for. `testing.ts`'s
 * is the one kept: it sits where somebody *playing* the game reaches for it,
 * and playing is the only way to judge whether a shorter lay still reads.
 * The wind-up question — whether it is an animation problem or a balance one —
 * belongs to that slider now, not to this panel.
 *
 * One instance, global, the same as `bindTuning` — `cfg` is the run the stage
 * is playing, not a property of one panel, and there is exactly one stage. It
 * returned a `render()` while it was not the only writer of `cfg`'s switch:
 * DEMOS set it too, straight from `DEMONSTRATIONS`, and a button painted once
 * at `bindPairPanel` time would have gone on showing whatever it opened with.
 * The owner took DEMOS off the director on 14 September 2026 and this is the
 * only writer again, so the repaint went with its one caller.
 *
 * `#briefToggle` (a plain `<button>` in `index.html`'s `.transport`) is bound
 * directly rather than through a checkbox row, because the owner asked for it
 * to sit under the stage — one click from what it changes, in the same row as
 * `↺ WAVE` and `▣ SHEET`. It works the way those buttons do — pressed once it
 * stays on until pressed again, shown with the `on` class the role buttons
 * already use for exactly that. It is not the stage's own click, which
 * `bindStageTouch` (`stage-touch.ts`) answers directly, and the two stay
 * apart: this says whether a card can open at all, a press on the field steps
 * through the one that is up right now and puts it away. Merging them would
 * mean turning briefings on had no way to get the first card off the stage.
 *
 * **There are two of it**: `#briefToggleField` is the phone's copy in the strip
 * over the field, beside TEST/P1/P2, because RUN is behind the menu there (the
 * owner, 24 September 2026, *add briefing button on screen*). Both flip the one
 * switch and both light together, the way the role buttons' two copies do.
 */
/** RUN's button, and the phone's copy of it over the field. */
const BRIEF_IDS = ["briefToggle", "briefToggleField"] as const;

export function bindPairPanel(cfg: SimConfig, onChange: () => void): void {
  const buttons = BRIEF_IDS.map((id) => document.getElementById(id)).filter(
    (b): b is HTMLElement => b !== null,
  );
  const paint = (on: boolean): void => {
    for (const b of buttons) b.classList.toggle("on", on);
  };

  const set = (on: boolean): void => {
    cfg.briefings = on;
    paint(on);
    onChange();
  };
  paint(cfg.briefings);
  for (const b of buttons) b.addEventListener("click", () => set(!cfg.briefings));
}
