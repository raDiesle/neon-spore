import { midCol } from "./config.js";
import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import { openSlow } from "./slow.js";
import {
  type SurgeState,
  surgeBand,
  surgeBulbLeft,
  surgeBulbRow,
  surgeBulbSpan,
  surgeHeld,
  surgeHoldsCharge,
} from "./surge.js";
import type { World } from "./world.js";

/**
 * **The three ends of a charge**: the vent, the burst and the loss.
 *
 * Cut between `surge-hand.ts` and `surge-step.ts` because both arrive
 * here — a burst is what a mutual lift over the band comes to *and* what
 * the pressure reaching the top of the gauge on the beat comes to — and a
 * file the hands imported from the clock, and the clock from the hands,
 * would be a circle. The judgement of a lift is here too, since it is the
 * only reader of all three.
 */

/** The column the ear pans a hand's events on: its seat's side of the bulb. */
export function surgeHandCol(world: World, player: 1 | 2): number {
  const col = midCol(world.cfg) + (player === 1 ? -1 : 1);
  return Math.max(0, Math.min(world.cfg.cols - 1, col));
}

/** One thumb off the bulb, by a lift or thrown. Says nothing about the charge. */
export function surgeDrop(world: World, s: SurgeState, player: 1 | 2): void {
  if (!surgeHeld(s, player)) return;
  if (player === 1) s.heldP1 = false;
  else s.heldP2 = false;
  world.events.push({ type: "surgeRelease", player, col: surgeHandCol(world, player) });
}

/**
 * Both thumbs off inside the band: a notch opens and stays open, the
 * pressure is spent, and the bulb hangs a row lower. The last notch is the
 * eversion, which is the clock's to finish (`surge-step.ts`).
 */
export function surgeVent(world: World, s: SurgeState): void {
  const cfg = world.cfg;
  s.notches = Math.min(cfg.surgeNotches, s.notches + 1);
  s.pressureMilli = 0;
  s.nearBeat = -1;
  const col = midCol(cfg);
  const row = surgeBulbRow(s, cfg);
  if (s.notches >= cfg.surgeNotches) {
    s.evertBeat = world.beat;
    openSlow(world, cfg.surgeEvertBeats, "show");
    world.events.push({ type: "surgeEvert", col, row });
    return;
  }
  world.events.push({ type: "surgeVent", col, notches: s.notches, row });
}

/** One gum out of the bulb, down one of its own columns, from the row under it. */
function throwGum(world: World, s: SurgeState): void {
  const cfg = world.cfg;
  const col = surgeBulbLeft(cfg) + nextInt(world.rng, surgeBulbSpan(cfg));
  // The row under the bulb rather than its own: a gum on the bulb's row
  // would be a body the bulb absorbs the next beat (`surge-step.ts`).
  const row = surgeBulbRow(s, cfg) + 1;
  world.creatures.push({
    id: world.nextId++,
    kind: "gum",
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  world.events.push({ type: "surgeGum", col, row });
}

/**
 * The pressure went over — on a lift past the band, or on the beat at the
 * top of the gauge. Both thumbs are thrown off, the charge is gone, the bulb
 * re-seals for `surgeBurstBeats`, and it throws its gums down its own
 * columns. From `surgeCloseNotches` open, a notch closes again.
 */
export function surgeBurst(world: World, s: SurgeState): void {
  const cfg = world.cfg;
  s.burstBeat = world.beat;
  s.pressureMilli = 0;
  s.nearBeat = -1;
  s.liftTick = -1;
  surgeDrop(world, s, 1);
  surgeDrop(world, s, 2);
  const col = midCol(cfg);
  const gums = Math.max(0, cfg.surgeBurstGums);
  world.events.push({ type: "surgeBurst", col, gums });
  for (let i = 0; i < gums; i++) throwGum(world, s);
  if (s.notches > 0 && s.notches >= cfg.surgeCloseNotches) {
    s.notches -= 1;
    world.events.push({ type: "surgeClose", col, notches: s.notches });
  }
}

/**
 * The last thumb came off short of the band, or too long after the first:
 * the charge did not count. It is lost with it — unless the bulb has
 * learned to hold, in which case it keeps what it has and the pair may
 * take hold again and say the number again.
 */
export function surgeLose(world: World, s: SurgeState): void {
  s.nearBeat = -1;
  if (!surgeHoldsCharge(s, world.cfg)) s.pressureMilli = 0;
  world.events.push({ type: "surgeLost", col: midCol(world.cfg) });
}

/**
 * The last thumb off: what the charge comes to. A mutual lift — the second
 * inside a beat of the first — is read against the band; anything else is
 * the charge lost.
 */
export function surgeJudge(world: World, s: SurgeState, mutual: boolean): void {
  if (mutual) {
    const band = surgeBand(s, world.cfg);
    if (s.pressureMilli > band.high) {
      surgeBurst(world, s);
      return;
    }
    if (s.pressureMilli >= band.low) {
      surgeVent(world, s);
      return;
    }
  }
  surgeLose(world, s);
}
