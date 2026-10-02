import type { ControlDef } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { drawGaugeLobe, gaugeLobeOf } from "./gauge-button.js";
import type { Circle } from "./layout.js";
import { drawPinLobe, pinLobeOf } from "./pinball-button.js";
import { drawPulseLobe, pulseLobeOf } from "./pulse-button.js";
import { drawScoutLobe, scoutLobeOf } from "./scout-button.js";
import type { SeatSkin } from "./seat-skin.js";
import { drawSnakeLobe, snakeLobeOf } from "./snake-button.js";

/**
 * **The rounds' buttons on the band**: the five interludes whose controls
 * left their slab panels for the band's own sockets, each after the owner
 * asked for it to look like the game it is part of. Each is one picture in a
 * file of its own; this is only which of them a control is.
 *
 * Cut out of `band-control.ts` when THE THROAT's set took that file to 236
 * lines, along the seam it already had: the panel's own buttons there, a
 * round's here, a boss's in `band-control-bosses.ts`.
 *
 * Draws the face and answers true when the control is one of these, and
 * answers false having drawn nothing when it is not.
 */
export function drawRoundFace(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  c: ControlDef,
  world: World,
  skin: SeatSkin,
  /** This device's own input delay, in ticks: THE PULSE's chart is drawn
   * ahead of the simulation to be pressed on time (`pulse-button.ts`). */
  lead: number,
): boolean {
  // THE PULSE's four, and it is the first *round* whose buttons are lobes on
  // the band rather than a slab panel of its own. The owner asked for that
  // round to look like the game it is part of, so its lanes stand in the same
  // sockets as everything else and this branch is the whole of the difference
  // (`pulse-button.ts`).
  if (pulseLobeOf(c.id) !== null) {
    drawPulseLobe(ctx, circle, c.id, world, skin, lead);
    return true;
  }
  // PINBALL's two, on the band for the same reason and after the same request:
  // the needle player 1 stops, and the shot player 2 takes off the bar
  // (`pinball-button.ts`).
  const pin = pinLobeOf(c.id);
  if (pin !== null) {
    drawPinLobe(ctx, circle, pin, world, skin);
    return true;
  }
  // THE SCOUT's four, on the band because its design put them in THE CLAW's
  // sockets and that panel is the band: the nose under the pilot's thumb, and
  // the mouth under the navigator's (`scout-button.ts`).
  const scout = scoutLobeOf(c.id);
  if (scout !== null) {
    drawScoutLobe(ctx, circle, scout, world, skin);
    return true;
  }
  // SNAKE's four, on the band since the owner asked for its buttons to look
  // like the others: the heading under the driver's thumb, the head under
  // the shooter's (`snake-button.ts`).
  const snake = snakeLobeOf(c.id);
  if (snake !== null) {
    drawSnakeLobe(ctx, circle, snake, world, skin);
    return true;
  }
  // THE GAUGE's three, the last round to leave its slabs, after the same
  // request: the claw's two turns under the pilot's thumb, and the reach under
  // the navigator's (`gauge-button.ts`).
  const gauge = gaugeLobeOf(c.id);
  if (gauge !== null) {
    drawGaugeLobe(ctx, circle, gauge, world, skin);
    return true;
  }
  return false;
}
