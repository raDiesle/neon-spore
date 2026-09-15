import type { SimConfig } from "@neon-spore/sim";
import { bindDifficultyPicker } from "./difficulty-picker.js";
import { bindTuning } from "./tuning.js";

/**
 * **THE TEMPO HAS TWO CONTROLS AND THEY ARE ONE NUMBER.**
 *
 * TUNING's first slider moves `bpm` two points at a time, from 40 to 200, which
 * is the right control for judging one wave. The DIFFICULTY picker beside the
 * field sets it to one of the game's three levels, which is the right control
 * for *what does this wave feel like on Hard* (`difficulty-picker.ts`, the
 * owner's ask of 15 September 2026). Whichever is turned, the other is put back
 * to what the run now says: a slider reading 96 under a run at 120 is the tool
 * disagreeing with itself, and a picker that rounded a dragged slider to the
 * nearest level would say the run is at a tempo it is not.
 *
 * Its own file because the two have to be bound in terms of each other — each
 * one's callback redraws the other — and `main.ts` is at its 250-line ceiling.
 * The seam is the honest one: everything here is about the one number, and
 * `onChange` is the caller's own *the run moved, repaint it*.
 */
export function bindTempoControls(cfg: SimConfig, onChange: () => void): void {
  const tuning = bindTuning(cfg, () => {
    onChange();
    // A slider dragged off all three levels is what puts CUSTOM in the picker,
    // and a preset landing on one is what takes it out again.
    difficulty.render();
  });
  const difficulty = bindDifficultyPicker(cfg, () => {
    onChange();
    tuning.render();
  });
}
