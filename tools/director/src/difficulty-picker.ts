import {
  DIFFICULTIES,
  type Difficulty,
  difficultyOf,
  playDifficulty,
  type SimConfig,
} from "@neon-spore/sim";

/**
 * **THE THREE TEMPI A PAIR CAN CHOOSE, beside the field rather than behind a
 * slider.**
 *
 * The owner asked for this on 15 September 2026, with the strip of buttons it
 * stands in. `bpm` has been movable since the tool existed — TUNING's first
 * slider, two points at a time from 40 to 200 — and that is the right control
 * for judging one wave and the wrong one for the question this answers, which
 * is *what does this wave feel like on Hard*. The game offers three levels and
 * three only (`sim/difficulty.ts`), and a session that wants one of them should
 * not have to remember which number it is.
 *
 * **The slider is still there and this picker does not fight it.** They are two
 * views of the one `cfg.bpm`: turning the picker moves the slider's value, and
 * moving the slider off all three tempi leaves the picker reading CUSTOM. The
 * fourth entry is not a level — it cannot be *chosen*, and `render` is what
 * puts it there and takes it away, so the list says what the run is actually
 * at rather than the nearest thing to it.
 */

/** What the picker shows when `bpm` is at none of the three. */
export const CUSTOM = "custom";

/** The word on a row. The tempo is *not* on it: the strip is 120 px wide and
 * `MEDIUM · 96 BPM` came back from the browser with the number cut off. The
 * number is under the picker instead (`noteFor`), where it is the one line
 * that has to change when the picker turns. */
export function labelFor(level: Difficulty): string {
  return level.toUpperCase();
}

/** The line under the picker: what the run is actually at. It says the level
 * again for the CUSTOM case, where the picker's own word is not a level. */
export function noteFor(bpm: number): string {
  return `${bpm} BPM`;
}

/**
 * What the picker's rows are for a given tempo: the three levels, and CUSTOM
 * first when the tempo is none of them.
 *
 * Pure, and tested as such: this runner has no DOM, so the deciding half is a
 * function over a number and `bind` below is the two lines of wiring that a
 * browser is the only honest check of (`columns.test.ts`'s argument).
 */
export function rowsFor(bpm: number): { value: string; label: string }[] {
  const rows = DIFFICULTIES.map((level) => ({ value: level, label: labelFor(level) }));
  if (difficultyOf(bpm) !== null) return rows;
  return [{ value: CUSTOM, label: "CUSTOM" }, ...rows];
}

/** Which row stands selected for a tempo. */
export function selectedFor(bpm: number): string {
  return difficultyOf(bpm) ?? CUSTOM;
}

export interface DifficultyPicker {
  /** Read `cfg` again and redraw — after the slider moved, or a preset landed. */
  render(): void;
}

/**
 * The picker, bound.
 *
 * `onChange` is the same callback the sliders are given in `main.ts`: the grid,
 * the ship, the sheet and the stage all read the tempo, and a rebuild is what
 * makes the field play at the new one.
 */
export function bindDifficultyPicker(cfg: SimConfig, onChange: () => void): DifficultyPicker {
  const select = document.getElementById("fDifficulty") as HTMLSelectElement | null;
  const note = document.getElementById("fDifficultyWhy");
  if (!select) return { render: () => {} };

  const render = (): void => {
    const want = rowsFor(cfg.bpm);
    // Rebuilt wholesale rather than patched: CUSTOM comes and goes with the
    // slider, and three rows is not a list worth diffing.
    select.textContent = "";
    for (const row of want) {
      const option = document.createElement("option");
      option.value = row.value;
      option.textContent = row.label;
      select.appendChild(option);
    }
    select.value = selectedFor(cfg.bpm);
    if (note) note.textContent = noteFor(cfg.bpm);
  };

  select.addEventListener("change", () => {
    // CUSTOM is a report and not a choice. It is only ever in the list while
    // the tempo is already at it, so picking it is a no-op — and putting the
    // run back to a level it was never at would be the picker moving the
    // thing it is describing.
    const level = select.value;
    if (level === CUSTOM) return;
    if (!(DIFFICULTIES as readonly string[]).includes(level)) return;
    playDifficulty(cfg, level as Difficulty);
    render();
    onChange();
  });

  // Opens on whatever the run is at, which on a fresh page is MEDIUM: the
  // game's default level and `DEFAULT_CONFIG.bpm` are the same tempo by
  // construction (`sim/difficulty.ts`), so nothing here has to say so.
  render();
  return { render };
}
