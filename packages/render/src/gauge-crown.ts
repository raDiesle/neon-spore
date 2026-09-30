import {
  type GaugeState,
  gaugeBeatsLeft,
  gaugeBetweenLevels,
  gaugeWoundOpen,
  type World,
} from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";
import { drawSiren, sirenBottom } from "./siren.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";

/**
 * **THE GAUGE's crown: the siren over the screen and the fuse over the alien's
 * head** — the two instruments every fight on the field already wears, in the
 * room the title and the pips used to take.
 *
 * The owner, 29 September 2026: *add some siren which tells that p2 needs to
 * inform p1 about position maybe "aim position". show the default bosses time
 * remaining bar top of boss.* The round draws its own stage, so neither comes
 * from the field's overlays (`frame-ship.ts`); both are the field's drawings,
 * called from here with what this round knows.
 */

/** How far over the alien's highest reach the fuse burns, in pixels. */
const OVER_HEAD = 14;
/** Between the siren's duty word and the fuse, on a phone too short for both. */
const UNDER_SIREN = 12;
/** The alien's highest reach, as a share of the dial's radius: THE MOTHER's
 * body and a whole arm straight up (`gauge-alien.ts`). */
const REACH = 2.3;
/** Half the fuse's length, as a share of the dial's radius. */
const HALF = 0.9;

/** The navigator's word under the siren, while there is a wound to call. */
export const GAUGE_DUTY = "AIM POSITION";

/**
 * The siren, lit on the navigator's chip while a wound stands open: she has
 * the wound and he has the cannon, and the thing the round asks of her in
 * every one of those beats is to say where. Both phones light the same chip,
 * the field's rule (`siren.ts`); only hers carries the words.
 */
export function drawGaugeSiren(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  g: GaugeState,
  time: number,
  names?: SeatNames,
): void {
  if (g.phase !== "play" || !gaugeWoundOpen(g)) return;
  const word = l.role === "p1" ? null : GAUGE_DUTY;
  drawSiren(ctx, l, { p1: false, p2: true }, word, time, names);
}

/**
 * The level's clock as THE SLOW's fuse, over the alien's head: burning in
 * from both ends, orange at half and red for the last two beats. Held full
 * while the rim is bare between two levels, because that level's clock is
 * (`sim/gauge-level.ts`), and gone once the verdict is in.
 */
export function drawGaugeFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  g: GaugeState,
  dial: Dial,
  beatPhase: number,
): void {
  if (g.phase !== "lead" && g.phase !== "play") return;
  const beats = world.cfg.gaugeLevelBeats;
  const burning = !gaugeBetweenLevels(world, g);
  const left = Math.max(0, gaugeBeatsLeft(world, g) - (burning ? beatPhase : 0));
  if (left <= 0) return;
  const rest = Math.min(1, left / beats);
  const { body, core } = fuseColours(rest);
  const floor = sirenBottom(l) + UNDER_SIREN;
  const y = Math.max(floor, dial.cy - dial.r * REACH - OVER_HEAD);
  drawFuseLine(ctx, l, { x: dial.cx, y, half: dial.r * HALF }, rest, body, core);
}
