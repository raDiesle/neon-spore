import { type ControlSet, controlSet, type WaveGuide } from "@neon-spore/content";
import { currentWave, type Store } from "./state.js";

/**
 * **What the wave being edited says about itself**, read fresh on every call.
 *
 * The stage plays `store.waves` — the draft — and not the shipped `WAVES`, so
 * everything the renderer cannot work out from a world has to be handed to it
 * from here. `world.wave` is a bare index and it means two different things
 * depending on who holds the world: for the game it indexes the shipped list,
 * and for this tool it indexes a draft that by definition has not shipped.
 * `ViewState.controls` and `ViewState.guide` are where each of these lands and
 * why each exists.
 *
 * Read fresh rather than captured, because the rail's picker changes the wave
 * under the loop and an author retypes a field between two frames.
 *
 * Their own file, off `stage.ts`, when the guide joined the panel and took
 * that file over its line limit. The seam is real: everything else there is
 * *wiring* — a canvas, a keyboard, a pointer, a loop — and these two are the
 * only place it asks the store a question about content.
 */

/** The panel this wave is played on — the wave's own `controls` field, the one
 * `rail.ts`'s picker writes, and never an index. */
export function draftControlSet(store: Store): ControlSet {
  return controlSet(currentWave(store)?.controls);
}

/**
 * The guide this wave opens on: the rehearsal it plays, or — on the few still
 * owed a film — its three blocks of words.
 *
 * `null` and never `undefined` when the draft has no guide. `undefined` means
 * *ask the shipped list* (`render/renderer.ts`), which is what a stage playing
 * a draft is getting away from — and a draft wave with no guide has none,
 * not one nobody has said.
 */
export function draftGuide(store: Store): WaveGuide | null {
  return currentWave(store)?.guide ?? null;
}
