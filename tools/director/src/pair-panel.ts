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
 * is playing, not a property of one panel, and there is exactly one stage.
 * `render()` exists because this is no longer the only writer of `cfg`'s
 * switch: `demo-panel.ts` sets it too, straight from `DEMONSTRATIONS`, and a
 * button painted once at `bindPairPanel` time would go on showing whatever it
 * opened with. `main.ts` calls it after every demo, the same way it already
 * calls `renderShip`.
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
 */
export interface PairPanel {
  render(): void;
}

export function bindPairPanel(cfg: SimConfig, onChange: () => void): PairPanel {
  const briefButton = document.getElementById("briefToggle");

  briefButton?.classList.toggle("on", cfg.briefings);
  briefButton?.addEventListener("click", () => {
    cfg.briefings = !cfg.briefings;
    briefButton.classList.toggle("on", cfg.briefings);
    onChange();
  });

  return {
    render: () => {
      // `demo-panel.ts` sets `cfg.briefings` from outside this file, the same
      // reason `render()` exists at all — see the class doc above.
      briefButton?.classList.toggle("on", cfg.briefings);
    },
  };
}
