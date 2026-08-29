import type { SimConfig } from "@neon-spore/sim";

/**
 * The switches that exist because the game has two people in front of it,
 * turned on from the one screen that has neither.
 *
 * `packages/sim/src/config-pair.ts` explains why `DEFAULT_CONFIG` ships them
 * off: a determinism run, a shape sheet and `relay:check` all want the wave
 * rather than the lesson, and every one of them would sit at a dial nobody can
 * turn. That default is correct. What was missing was the dial itself — the
 * director built `THE FORK`, the briefing card and THE GAUGE and then built
 * from a config where all three are off, so the reasonable conclusion from
 * outside was that none of them existed.
 *
 * One instance, global, the same as `bindTuning` — `cfg` is the run the stage
 * is playing, not a property of one panel, and there is exactly one stage.
 * A wave watched with the pair on and then off is two runs of the same wave,
 * not two waves, which is the comparison a determinism argument already makes
 * for `guardWindowMs` in `tuning.ts`'s own presets.
 *
 * `shotChargeBeats` sits beside the three booleans rather than inside
 * `PairConfig`, for the reason `config-shot.ts` gives: it stops nothing and
 * blocks no headless caller, so it is not one of the three switches — but it
 * is the fourth invisible thing the brief named (the cannon's wind-up), so it
 * gets a row here rather than a fifth place in the editor to look for it.
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
  const rows: { box: HTMLInputElement; get: () => boolean }[] = [];
  pairMount?.replaceChildren();

  const add = (
    mount: HTMLElement | null,
    label: string,
    note: string,
    get: () => boolean,
    set: (on: boolean) => void,
  ): void => {
    if (!mount) return;
    const { row, box } = toggleRow(label, note, get, set, onChange);
    rows.push({ box, get });
    mount.appendChild(row);
  };

  briefButton?.classList.toggle("on", cfg.briefings);
  briefButton?.addEventListener("click", () => {
    cfg.briefings = !cfg.briefings;
    briefButton.classList.toggle("on", cfg.briefings);
    onChange();
  });

  add(
    pairMount,
    "THE FORK",
    "The rest between waves ends in a wait only two thumbs can cross.",
    () => cfg.forkBetweenWaves,
    (on) => {
      cfg.forkBetweenWaves = on;
    },
  );
  add(
    pairMount,
    "Cannon wind-up",
    "shotChargeBeats: a press waits for the next half-beat instead of firing on the tick.",
    () => cfg.shotChargeBeats > 0,
    (on) => {
      cfg.shotChargeBeats = on ? 0.5 : 0;
    },
  );

  return {
    render: () => {
      for (const { box, get } of rows) box.checked = get();
      // `demo-panel.ts` sets `cfg.briefings` from outside this file, the same
      // reason `render()` exists at all — see the class doc above.
      briefButton?.classList.toggle("on", cfg.briefings);
    },
  };
}

function toggleRow(
  label: string,
  note: string,
  get: () => boolean,
  set: (on: boolean) => void,
  onChange: () => void,
): { row: HTMLElement; box: HTMLInputElement } {
  const row = document.createElement("label");
  row.className = "pair-row";

  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = get();
  box.addEventListener("change", () => {
    set(box.checked);
    onChange();
  });

  const text = document.createElement("span");
  const b = document.createElement("b");
  b.textContent = label;
  const p = document.createElement("p");
  p.className = "note";
  p.textContent = note;
  text.append(b, p);

  row.append(box, text);
  return { row, box };
}
