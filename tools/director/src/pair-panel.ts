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
 * click from what it changes — rather than two tabs away. `#briefToggle`
 * (in the stage column) takes that row; `#pairPanel` (in TUNING → PAIR) keeps
 * the other two, which are not about the stage in the same direct way. It is
 * still the dial for `cfg.briefings`, the same field `openBriefings` reads —
 * moving where the checkbox is drawn does not touch what it means.
 */
export interface PairPanel {
  render(): void;
}

export function bindPairPanel(cfg: SimConfig, onChange: () => void): PairPanel {
  const pairMount = document.getElementById("pairPanel");
  const briefMount = document.getElementById("briefToggle");
  const rows: { box: HTMLInputElement; get: () => boolean }[] = [];
  pairMount?.replaceChildren();
  briefMount?.replaceChildren();

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

  add(
    briefMount,
    "Briefings",
    "A wave opens on a card for anything the pair has not met yet.",
    () => cfg.briefings,
    (on) => {
      cfg.briefings = on;
    },
  );
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
