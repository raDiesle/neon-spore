import type { World } from "@neon-spore/sim";
import {
  aim,
  fresh,
  living,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
  until,
  ward,
} from "./pose-kit.js";

/**
 * The one ordinary screen the WORDINGS page names things on.
 *
 * Not a pose — nothing here is a state to be checked against — but built with
 * the pose kit for the pose kit's reason: the picture is the shipping renderer
 * over a world the simulation actually ran into this shape, so a label points
 * at a thing the game draws today and not at a drawing of one. Everything a
 * regular wave puts on a phone is in it at once: a scar in the hull, one slick
 * and one bulb falling, a shot on its way up, both swellings up, a blip on
 * the strip and the siren lit by the rock the blip is warning about. The
 * wave is SALVAGE, the first played on the whole STANDARD panel, so every
 * ordinary button is there to be named.
 */

/** The first wave that names the full STANDARD set (`control-sets-table.ts`). */
export const WORDINGS_WAVE = 13;

export const SLICK_COL = 3;
export const BULB_COL = 7;
export const SCAR_COL = 1;
export const SHIELD_COL = 5;
/** The row the shot is caught on, between the hull and the bulb. */
const SHOT_ROW = 11.5;

export function wordingsWorld(): World {
  const w = fresh(
    [
      // The first body is not shot: it reaches the hull and leaves the scar.
      living("red", SCAR_COL, 0),
      living("red", SLICK_COL, 7),
      living("cyan", BULB_COL, 8),
      // Far enough off that only the strip knows about them: a rock for the
      // pilot's strip, a body for the navigator's — each seat is warned about
      // what it answers (`showsRadar`) — and the torch, which lights the siren.
      rock(9, "meteor", 20),
      living("cyan", 2, 21),
      rock(SHIELD_COL, "torch", 22),
    ],
    [],
    null,
    {},
    WORDINGS_WAVE,
  );
  until(w, "the first body breaching the hull", (x) => x.scars.length > 0);
  // The two living bodies have to be on the field and the torch's warning on
  // before the shot is fired, so the frame carries all of it at once.
  until(w, "both bodies on the field", (x) => x.creatures.length >= 2 && x.beat >= 16);
  // Commands are on absolute ticks (`run`), so each is sent on the tick the
  // world has reached.
  run(w, TPB * 2, [aim(w.tick, BULB_COL), ward(w.tick, SHIELD_COL)]);
  // Kept on the tick the shot is halfway up to the bulb — a shot is fast, and
  // a beat later it has already landed.
  runUntil(w, "the shot halfway to the bulb", [shoot(w.tick, "cyan")], (x) =>
    x.bullets.some((b) => b.row + b.subMilli / 1000 <= SHOT_ROW),
  );
  return w;
}
