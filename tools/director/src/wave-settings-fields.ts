import {
  CONTROL_SETS,
  type ControlSetId,
  controlSet,
  DEFAULT_CONTROL_SET_ID,
} from "@neon-spore/content";
import { bindBossTypeField } from "./boss-type-field.js";
import { renderControlSetNote } from "./control-set-note.js";
import { currentWave, type Store } from "./state.js";
import { bindWaveNoteField } from "./wave-note-field.js";

/**
 * WAVE SETTINGS' fields over the open wave: NAME, NOTE, the kind of boss and
 * the control set. Out of `rail.ts` the day NOTE took that file to its
 * length limit; the list and the wave actions stay there.
 *
 * Prose — the name, the note, the kind of boss — goes through `onEdit` and
 * restarts nothing; the control set changes what the stage draws and goes
 * through `onSelect`, the caller's full refresh. A name typed redraws the
 * list too (`onRename`), since the list shows it.
 */
export interface WaveSettingsFields {
  render(): void;
}

export function bindWaveSettingsFields(
  store: Store,
  on: { select: () => void; edit: () => void; rename: () => void },
): WaveSettingsFields {
  const name = document.getElementById("fName") as HTMLInputElement | null;
  const noteField = bindWaveNoteField(store, on.edit);
  const controlsField = document.getElementById("fControlSet") as HTMLSelectElement | null;
  const controlsWhy = document.getElementById("fControlSetWhy");
  const controlsRoster = document.getElementById("fControlSetRoster");
  // Over the control set, for the reason it is over it in the markup: which
  // kind of boss this is, on the waves that have one (`boss-type-field.ts`).
  const bossTypeField = bindBossTypeField(document.getElementById("bossTypeField"));

  if (controlsField) {
    controlsField.replaceChildren();
    for (const set of CONTROL_SETS) {
      const opt = document.createElement("option");
      opt.value = set.id;
      opt.textContent = set.name;
      controlsField.appendChild(opt);
    }
  }

  // Typing a name changes the list but must not restart the stage — only the
  // shape of a wave does that, never its prose.
  name?.addEventListener("input", () => {
    const wave = currentWave(store);
    if (!wave || !name) return;
    wave.name = name.value;
    store.dirty = true;
    on.rename();
    on.edit();
  });

  // A control set is a shape choice, the same weight as the boss: it changes
  // what the band would draw, not just what a wave says about itself.
  controlsField?.addEventListener("change", () => {
    const wave = currentWave(store);
    if (!wave || !controlsField) return;
    const picked = controlsField.value as ControlSetId;
    wave.controls = picked === DEFAULT_CONTROL_SET_ID ? undefined : picked;
    store.dirty = true;
    on.select();
  });

  // The kind of boss is what the wave says about itself and changes nothing
  // the stage draws.
  bossTypeField.onChange((type) => {
    const wave = currentWave(store);
    if (!wave?.boss) return;
    wave.bossType = type;
    store.dirty = true;
    on.edit();
  });

  return {
    render() {
      const wave = currentWave(store);
      if (name) name.value = wave?.name ?? "";
      noteField.render(wave);
      const active = controlSet(wave?.controls);
      if (controlsField) controlsField.value = active.id;
      if (controlsWhy) controlsWhy.textContent = active.why;
      // What the choice puts in their hands, beside the choice itself.
      renderControlSetNote(controlsRoster, active);
      bossTypeField.render(wave);
    },
  };
}
