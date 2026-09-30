import { type ControlSet, seatedSet, type WaveGuide } from "@neon-spore/content";
import { DeskSeat } from "@neon-spore/render";
import type { SimConfig, World } from "@neon-spore/sim";
import { bindKeyHelp } from "./key-help.js";
import { bindKeys, type Keys } from "./keys.js";
import { draftControlSet, draftGuide } from "./stage-draft.js";
import type { Store } from "./state.js";

/**
 * The panel the stage is standing on, and the keyboard that is that panel too.
 *
 * Cut out of `stage.ts` when THE SCOUT's seat swap took it to 225 lines: the
 * set is read fresh from the draft and seated as the round seats it on this
 * tick, and everything else the stage does is handed the call rather than the
 * set, so an edit or a swap is seen on the next press.
 */
export interface StageControls {
  /** What the wave being edited says (`stage-draft.ts`), seated as the round
   * seats it on this tick (`content/control-seats.ts`). */
  controls: () => ControlSet;
  guide: () => WaveGuide | null;
  /** The two seat keys, which say whose hand the mouse is under TEST
   * (`render/desk-seat.ts`): held here by the keyboard, read by every hit test. */
  desk: DeskSeat;
  keys: Keys;
}

export function bindStageControls(store: Store, cfg: SimConfig, world: () => World): StageControls {
  const controls = () => seatedSet(draftControlSet(store), world());
  const guide = () => draftGuide(store);
  const desk = new DeskSeat();
  // The keyboard is that panel too: a key is a seat and a slot on it, and the
  // stage is the one panel that knows which wave it is standing on (`keys.ts`).
  const keys = bindKeys(cfg, () => world().creatures, controls, desk);
  bindKeyHelp(controls);
  return { controls, guide, desk, keys };
}
