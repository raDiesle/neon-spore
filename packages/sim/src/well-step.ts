import type { SimConfig } from "./config.js";
import {
  NO_WELL_GRIP,
  type WellState,
  wellHeldNow,
  wellHoldLeft,
  wellMaxOffsetMilli,
} from "./well.js";
import type { World } from "./world.js";

/**
 * **THE WELL's clock: the face slips, and stops when it has slipped far
 * enough.**
 *
 * Three states and they run in a ring. It opens `still`, seam at twelve,
 * every hour on its own column — `wellStillBeats` of the plain picture, which
 * is the wave teaching itself before it asks anything. Then `rolling`: the
 * whole face turns `wellRollMilli` thousandths of a sector a beat, and the
 * pilot's shortcut walks away from him a quarter of a column at a time. At
 * `wellRollSectors` it is `wound` and it stops, because a face that kept
 * turning would be a fight with no answer in it — a boss that only ever gets
 * worse is a boss the pair watch rather than play.
 *
 * **Nothing here can end a wave and nothing here can hurt anybody.** There is
 * no hull in it, no health, no arrival and no column. The worst a pair who
 * ignore this boss entirely can be in is `wound`, reading numerals instead of
 * counting columns, which is slower and not lost.
 *
 * The hold is THE CAIRN's shape exactly and for its reason (`cairn-hold.ts`):
 * a budget of beats, spent one at a time while a thumb rests on the seam,
 * announced every beat so the ear can count it down, and then it is gone and
 * the face goes anyway. What the beats buy is the thing the pair actually
 * need — time to say a number across the voice delay before the number stops
 * being true.
 *
 * Two of the three turns are here, on the beat, because they are the clock's:
 * `still → rolling` and `rolling → wound`. The third is the pilot's and is
 * answered the moment his thumb reaches it (`well-hand.ts`).
 */
export function stepWell(world: World, b: WellState): void {
  const cfg: SimConfig = world.cfg;
  if (b.phase === "still") {
    if (world.waveBeat - b.phaseBeat < cfg.wellStillBeats) return;
    b.phase = "rolling";
    b.phaseBeat = world.waveBeat;
    world.events.push({ type: "wellRoll" });
    return;
  }
  // `wound` is the far end and waits for a hand; there is no clock on it.
  if (b.phase !== "rolling") return;
  if (wellHeldNow(b) && b.heldBeats < cfg.wellHoldBeats) {
    b.heldBeats += 1;
    world.events.push({ type: "wellHeld", left: wellHoldLeft(cfg, b) });
    return;
  }
  const max = wellMaxOffsetMilli(cfg);
  b.offsetMilli = Math.min(max, b.offsetMilli + cfg.wellRollMilli);
  if (b.offsetMilli < max) return;
  b.phase = "wound";
  b.phaseBeat = world.waveBeat;
  // Re-anchor the thumb that is already down. It grabbed to hold, at an
  // offset the face has since left behind; read as a carry it would swing the
  // seam by everything the slip travelled under it. A hand that stays on
  // through the turn keeps the handle, and starts the carry from here.
  b.gripMilli = wellHeldNow(b) ? b.offsetMilli : NO_WELL_GRIP;
  world.events.push({ type: "wellWound", sectors: cfg.wellRollSectors });
}
