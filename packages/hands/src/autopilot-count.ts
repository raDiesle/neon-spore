import {
  beatPhaseTicks,
  type Creature,
  colourIsArmoured,
  countdownIsOpen,
  shieldRow,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE COUNT, shot on its zero** (`sim/countdown.ts`).
 *
 * A countdown body lets a shot in only on the beats its count reads nought,
 * and a shot off them shuts it for `countdownShutBeats` — so a cannon that
 * fires the moment it stands under one spends every zero it fires before. The
 * pair's sentence is the pilot's *on the zero*; this is that: hold the shot
 * until the body is open, not shut, and open long enough for the shot to get
 * there — the shot's grid (`shotChargeBeats`) and its climb to the body's
 * row — and choose a body that can be answered now over one that cannot, so a
 * second count on the field is not left to fall while the first is closed.
 */

/** Ticks spare at the far end of the window, for a body that falls a row as the shot climbs. */
const SPARE_TICKS = 2;

/** Whether a shot fired now at `c` is let in when it arrives: always, for any body but a count. */
export function countReady(w: World, c: Creature): boolean {
  if (c.kind !== "countdown") return true;
  if (colourIsArmoured(w, c) || !countdownIsOpen(w.cfg, w.beat, c)) return false;
  let after = 0;
  while (after < w.cfg.countdownOpenBeats && countdownIsOpen(w.cfg, w.beat + after + 1, c)) after++;
  const tpb = ticksPerBeat(w.cfg);
  const left = after * tpb + tpb - beatPhaseTicks(w.cfg, w.tick);
  const climb = Math.ceil(((shieldRow(w.cfg) - c.row) * tpb) / w.cfg.bulletTilesPerBeat);
  const grid = Math.ceil(w.cfg.shotChargeBeats * tpb);
  return left > climb + grid + SPARE_TICKS;
}
