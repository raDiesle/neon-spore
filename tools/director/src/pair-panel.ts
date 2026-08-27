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
 */
export function bindPairPanel(cfg: SimConfig, onChange: () => void): void {
  const mount = document.getElementById("pairPanel");
  if (!mount) return;
  mount.replaceChildren();

  mount.appendChild(
    toggleRow(
      "Briefings",
      "A wave opens on a card for anything the pair has not met yet.",
      () => cfg.briefings,
      (on) => {
        cfg.briefings = on;
      },
      onChange,
    ),
  );
  mount.appendChild(
    toggleRow(
      "THE FORK",
      "The rest between waves ends in a wait only two thumbs can cross.",
      () => cfg.forkBetweenWaves,
      (on) => {
        cfg.forkBetweenWaves = on;
      },
      onChange,
    ),
  );
  mount.appendChild(
    toggleRow(
      "Interludes (THE GAUGE)",
      "The gaps between acts may carry a round that is not the field.",
      () => cfg.interludes,
      (on) => {
        cfg.interludes = on;
      },
      onChange,
    ),
  );
  mount.appendChild(
    toggleRow(
      "Cannon wind-up",
      "shotChargeBeats: a press waits for the next half-beat instead of firing on the tick.",
      () => cfg.shotChargeBeats > 0,
      (on) => {
        cfg.shotChargeBeats = on ? 0.5 : 0;
      },
      onChange,
    ),
  );
}

function toggleRow(
  label: string,
  note: string,
  get: () => boolean,
  set: (on: boolean) => void,
  onChange: () => void,
): HTMLElement {
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
  return row;
}
