import { codexSwapped, type World } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, showsCodex } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE CODEX, seen: the air over the field going wrong.**
 *
 * While the key is turned over, the light across the field travels in slow bands
 * — the shapes under them brighten and dim as a band passes, the way heat over a
 * road moves what is behind it. It is the only thing that says the fault is on,
 * and it is drawn on the **pilot's** screen and on nothing the navigator sees
 * (`showsCodex`, and `sim/codex.ts` for why).
 *
 * **It is light and not displacement**, which is a decision about cost rather
 * than about the look. A true refraction would have to read back what has
 * already been painted and push it sideways — a canvas read per frame, on a
 * phone, for one wave in the game. Bands of light over the field say the same
 * thing to a player at arm's length: *something is between you and the field*.
 * The bands move slowly enough to read as a medium rather than a flicker, and
 * they do not touch the hull or the panel — whatever is wrong is out there, not
 * in the ship.
 *
 * **Nothing here decides anything.** Which way the key is round is
 * `codexSwapped`, a function of the wave's own beat in the simulation, so the
 * two devices agree about it without this file existing.
 */

/** Bands across the field at once. Four is a wave a player can follow the
 * crest of; more reads as noise and fewer as a sweep. */
const BANDS = 4;
/** Tiles a crest travels a second. Slow on purpose: a medium, not a flicker. */
const DRIFT = 1.6;

export function drawCodexShimmer(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  if (!showsCodex(l.role) || !codexSwapped(world)) return;
  const top = l.gridTop;
  const height = l.hullY - top;
  if (height <= 0) return;

  // One period per band, travelling down the field. `time` and not the beat:
  // the air is not on the metronome, and a shimmer that pulsed with the beat
  // would read as something the pair could count — which is the one thing this
  // fault must not offer.
  const period = height / BANDS;
  const offset = ((time * DRIFT * l.tile) % period) - period;
  ctx.save();
  for (let i = 0; i <= BANDS + 1; i++) {
    const y = top + offset + i * period;
    const band = ctx.createLinearGradient(0, y, 0, y + period);
    // Brightest a third of the way in rather than in the middle: a crest with a
    // long tail behind it reads as travelling, and a symmetrical one reads as a
    // stripe that is simply there.
    band.addColorStop(0, rgba(PALETTE.arc, 0));
    band.addColorStop(0.34, rgba(PALETTE.arc, 0.1));
    band.addColorStop(1, rgba(PALETTE.arc, 0));
    ctx.fillStyle = band;
    ctx.fillRect(l.gridLeft, Math.max(top, y), l.gridWidth, Math.min(period, l.hullY - y));
  }
  ctx.restore();
}
