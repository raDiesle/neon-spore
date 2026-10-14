import type { LeadState, SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { faded } from "./lead-rock.js";
import { leadRidgeY } from "./lead-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE LEAD's flights: the shots climbing over the ridge until they are judged.
 * Off `lead-draw.ts` because they touch nothing of the body; `drawLead` draws
 * them after the ridge and before the mound.
 */

/** How far above the ridge a flight climbs before it is judged, in tiles, and a bolt's length. */
const FLIGHT_RISE = 0.9;
const BOLT = 0.3;

/**
 * The shots in the air: a white bolt over each flight's column, climbing
 * from the ridge's underside over the beats of the flight, on both screens —
 * the shot is the pilot's own and the column it went up is no secret from
 * anyone. It is judged on `dueBeat`, and on that beat it is at the top of its
 * climb; what happens to it there is the receipts' (`lead-fx.ts`).
 */
export function drawFlights(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LeadState,
  beat: number,
  beatPhase: number,
  time: number,
  fade: number,
): void {
  const ridge = leadRidgeY(l, cfg);
  const beats = Math.max(1, cfg.leadFlightBeats);
  for (const f of s.flights) {
    const spent = Math.min(1, Math.max(0, (beat - (f.dueBeat - beats) + beatPhase) / beats));
    const x = tileCX(l, f.col);
    const y = ridge.bottom - spent * (ridge.bottom - ridge.top + FLIGHT_RISE * l.tile);
    const p = new Path2D();
    p.moveTo(x, y + BOLT * l.tile * 0.5);
    p.lineTo(x, y - BOLT * l.tile * 0.5);
    strokeGlow(
      ctx,
      p,
      faded(PALETTE.text, fade),
      STROKE.outline,
      (0.9 + 0.3 * Math.sin(time * 14)) * fade,
    );
  }
}
