import type { GrindstoneAsk } from "./grindstone.js";

/**
 * What THE GRINDSTONE says as it happens, one line per thing the picture and
 * the sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The wheel turns on its axle mid-hull, so every one is there; the
 * ones about a flat or a jaw say which with `side`, the pilot's nought and
 * the navigator's one.
 */

interface GrindstoneColEvent {
  /** The column it happened over. */
  col: number;
}

export type GrindstoneEvent =
  /** The wheel turns in rough, both flats gritted, the caliper slack, the axle dark. */
  | ({ type: "grindstoneEnter" } & GrindstoneColEvent)
  /** A step lit: a flat to grind, a shot at the axle, or the caliper to clamp. */
  | ({ type: "grindstoneLight"; ask: GrindstoneAsk } & GrindstoneColEvent)
  /** Fresh reversals shaved the lit flat; `gritMilli` is the grit left on it. */
  | ({ type: "grindstoneShave"; side: 0 | 1; gritMilli: number } & GrindstoneColEvent)
  /** A flat ground clean; `passes` is how many it has taken now. */
  | ({ type: "grindstoneClear"; side: 0 | 1; passes: number } & GrindstoneColEvent)
  /** A pass ran out: the flat regrits solid, to be ground from its first pass again. */
  | ({ type: "grindstoneRegrit"; side: 0 | 1 } & GrindstoneColEvent)
  /** Both flats clean: the caliper bites shut and the axle lights. */
  | ({ type: "grindstoneBite" } & GrindstoneColEvent)
  /** A jaw pad lifted in a lit clamp step: the count starts over. */
  | ({ type: "grindstoneSlip"; side: 0 | 1 } & GrindstoneColEvent)
  /** Both jaws held their beats: the caliper stays locked. */
  | ({ type: "grindstoneClamp" } & GrindstoneColEvent)
  /** A clamp step ran out: the caliper springs loose and the axle goes dark, to be clamped again. */
  | ({ type: "grindstoneLoose" } & GrindstoneColEvent)
  /** The axle shot in its colour; `hits` is how many it has taken. */
  | ({ type: "grindstoneHit"; hits: number } & GrindstoneColEvent)
  /** A fire step ran out with the axle unshot: the hull takes it. */
  | ({ type: "grindstoneMiss" } & GrindstoneColEvent)
  /** The script is done: the caliper snaps off and the wheel spins free. */
  | ({ type: "grindstoneFree" } & GrindstoneColEvent)
  /** The freed wheel has spun away `grindstoneFreeBeats`; the wave may end. */
  | ({ type: "grindstoneOut" } & GrindstoneColEvent);
