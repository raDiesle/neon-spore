import type { SimConfig } from "@neon-spore/sim";

/**
 * The switches that exist because the game has two people in front of it,
 * turned on from the one screen that has neither.
 *
 * `packages/sim/src/config-pair.ts` explains why `DEFAULT_CONFIG` ships them
 * off: a determinism run, a shape sheet and `relay:check` all want the wave
 * rather than the lesson, and every one of them would sit at a dial nobody can
 * turn. That default is correct. What was missing was the dial itself — the
 * director built the wave opening and THE GAUGE and then built
 * from a config where all three are off, so the reasonable conclusion from
 * outside was that none of them existed.
 *
 * One instance, global, the same as `bindTuning` — `cfg` is the run the stage
 * is playing, not a property of one panel, and there is exactly one stage.
 * A wave watched with the pair on and then off is two runs of the same wave,
 * not two waves, which is the comparison a determinism argument already makes
 * for `guardWindowMs` in `tuning.ts`'s own presets.
 *
 * `shotChargeBeats` sits beside the booleans rather than inside `PairConfig`,
 * for the reason `config-shot.ts` gives: it stops nothing and blocks no
 * headless caller, so it is not a switch at all. It is a slider rather than a
 * checkbox for the same reason — the owner asked to *play with* the number,
 * not flip it: "so 'Cannon wind-up' idea is just for a cool animation, so
 * half a beat is too much probably. can be less, maybe 1/4 beat. you could
 * give me control input to play around for testing only." A checkbox can
 * only ever offer 0 or `apps/game`'s own 0.5; this row is a range input in
 * eighth-beat steps so 0.125 and 0.25 are both one drag away, labelled
 * **(testing)** because that is exactly what it is for. It does not touch
 * `DEFAULT_CONFIG` or `apps/game/src/main.ts`'s own `shotChargeBeats: 0.5` —
 * both stay exactly as shipped; this only ever moves the director's own
 * live `cfg`, the same object `bindTuning`'s sliders already move. Whether a
 * shorter wind-up is worth shipping is not decided here — see
 * `docs/parked.md`'s "Cannon wind-up is an animation question, not a balance
 * one" for what this slider is for and what it is not.
 *
 * `render()` exists because this is no longer the only writer of `cfg`'s
 * switches: `demo-panel.ts` sets them too, straight from `DEMONSTRATIONS`,
 * and a checkbox painted once at `bindPairPanel` time would go on showing
 * whatever it opened with. `main.ts` calls it after every demo, the same way
 * it already calls `renderShip`.
 *
 * Two mounts, not one: "Briefings" toggles whether the field ever opens on a
 * card at all, and the owner asked for that to sit under the stage — one
 * click from what it changes, in the same row as `↺ WAVE` and `▣ SHEET`
 * rather than in a checkbox of its own below them. It is bound directly to
 * `#briefToggle` (a plain `<button>` in `index.html`'s `.transport`, not a
 * mount this file fills), because it works the way those buttons do —
 * pressed once it stays on until pressed again, shown with the `on` class
 * the role buttons already use for exactly that, not a checkbox.
 * `#pairPanel` (in TUNING → PAIR) keeps the other two rows, which are not
 * about the stage in the same direct way and read fine as the checkbox rows
 * they always were. Wherever it is drawn, this is still the dial for
 * `cfg.briefings`, the same field `openBriefings` reads.
 *
 * `#briefToggle` is not the stage's own click, which `bindStageTouch`
 * (`stage-touch.ts`) now answers directly, and the two must stay apart: this
 * says whether a card can open at all, a press on the field steps through
 * the one that is up right now and puts it away. Merging them would mean
 * turning briefings on had no way to get the first card off the stage.
 * `✓ CARD` used to be the third control here and is gone — the field is the
 * button now, on the phone and in the director alike.
 */
export interface PairPanel {
  render(): void;
}

export function bindPairPanel(cfg: SimConfig, onChange: () => void): PairPanel {
  const pairMount = document.getElementById("pairPanel");
  const briefButton = document.getElementById("briefToggle");
  pairMount?.replaceChildren();

  briefButton?.classList.toggle("on", cfg.briefings);
  briefButton?.addEventListener("click", () => {
    cfg.briefings = !cfg.briefings;
    briefButton.classList.toggle("on", cfg.briefings);
    onChange();
  });

  const shotLay = pairMount
    ? sliderRow(
        pairMount,
        "Shot lay (testing)",
        "shotChargeBeats — a press waits this many beats before the shot leaves, " +
          "on a grid measured from the start of the beat. Testing only: this dial " +
          "never touches DEFAULT_CONFIG or apps/game's own 0.5.",
        { min: 0, max: 0.75, step: 0.125, unit: " beats" },
        () => cfg.shotChargeBeats,
        (n) => {
          cfg.shotChargeBeats = n;
        },
        onChange,
      )
    : null;

  return {
    render: () => {
      // `demo-panel.ts` sets `cfg.briefings` from outside this file, the same
      // reason `render()` exists at all — see the class doc above.
      briefButton?.classList.toggle("on", cfg.briefings);
      shotLay?.show();
    },
  };
}

/** A labelled range input, the same row shape `toggleRow` used to draw for a
 * checkbox — `tuning.ts`'s own sliders are the pattern this borrows. */
function sliderRow(
  mount: HTMLElement,
  label: string,
  note: string,
  range: { min: number; max: number; step: number; unit: string },
  get: () => number,
  set: (n: number) => void,
  onChange: () => void,
): { show(): void } {
  const row = document.createElement("div");
  row.className = "pair-row";

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(range.min);
  input.max = String(range.max);
  input.step = String(range.step);
  input.value = String(get());

  const text = document.createElement("span");
  const b = document.createElement("b");
  const value = document.createElement("span");
  const showValue = (): void => {
    value.textContent = `${get()}${range.unit}`;
  };
  b.append(`${label} `, value);
  showValue();
  const p = document.createElement("p");
  p.className = "note";
  p.textContent = note;
  text.append(b, p);

  input.addEventListener("input", () => {
    set(Number(input.value));
    showValue();
    onChange();
  });

  row.append(input, text);
  mount.appendChild(row);

  return {
    show: () => {
      input.value = String(get());
      showValue();
    },
  };
}
