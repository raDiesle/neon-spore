import { type GaugeState, gaugeBandAsks, gaugeGape, type SimConfig } from "@neon-spore/sim";
import { type Dial, gaugeBandMid, showsGaugeMarks, showsGaugeValve } from "./gauge.js";
import { gaugeOpenDial } from "./gauge-gape.js";
import { gaugeDial } from "./gauge-round.js";
import { drawGaugeTongueRing, gaugeTongueUnder } from "./gauge-tongue-grip.js";
import { drawGaugeToothRings, gaugeToothUnder } from "./gauge-tooth-grip.js";
import { drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";

/**
 * **THE GAUGE's thumbs on the dial itself**: the navigator's on the band
 * while it is wound tight — and hers on the teeth for one rest, which is
 * `gauge-tooth-grip.ts`, and both on the tongue for the next, which is
 * `gauge-tongue-grip.ts`. The pilot's on the needle, while the valve was
 * jammed, went with the jam on 2 October 2026, when a mistake began to lose
 * the round instead.
 * Drawn and answered in one file for `gorge-grip.ts`' reason — the circle a
 * thumb is answered at is the circle the ring is drawn from.
 *
 * Each ring stands on the half of the picture its own seat is shown
 * (`showsGaugeValve`, `showsGaugeMarks`), which is the round's whole split: he
 * has never seen the band and she has never had a valve. The ring is
 * `queen-grip.ts`' — breathing until a thumb lands, filled once one has — so a
 * held band and a held mark read as one gesture across the whole game.
 *
 * **The ring is never standing when nothing would answer it.** The simulation
 * refuses a band that is not wound (`sim/gauge-hand.ts`), and the same
 * question is asked here — `gaugeBandAsks` — rather than a second opinion
 * written down beside it: a ring on a band that is not wound would be a
 * control drawn where it is not answered, which is the thing `handles.ts`
 * exists to prevent.
 *
 * No dial on the ring. THE GORGE's tap carries one because it counts taps
 * out; this one lasts exactly as long as the thumb does.
 */

/** The ring in the middle of the band, out at the rim where the band is drawn. */
export function gaugeBandGrip(l: Layout, cfg: SimConfig, dial: Dial, g: GaugeState): Circle {
  const mid = gaugeBandMid(dial, g);
  return { x: mid.x, y: mid.y, r: handleRadius(l, cfg) };
}

/**
 * The press, for whichever of the dial's grips this seat has this beat.
 *
 * `bossOf(field, "gauge")` is `null` on every wave that is not the round, and
 * a press then falls through to whatever is behind it. Outside `play` there is
 * nothing to take hold of at all: the lead-in is for reading two screens and
 * the verdict is for looking at one, which is the gate `gaugeRoundHeard` puts
 * on every command the round hears.
 */
export function gaugeGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const g = bossOf(field, "gauge");
  if (g === null || g.phase !== "play") return null;
  // The rim where the mouth has settled, which is where the frame draws it
  // but for the gulp's fraction of a beat (`gauge-gape.ts`).
  const dial = gaugeOpenDial(gaugeDial(l), gaugeGape(g));
  if (field.seat === 2 && gaugeBandAsks(g) && hitCircle(gaugeBandGrip(l, field.cfg, dial, g), x, y))
    return bandTouch(x, y);
  // Both hands on the tongue, in the rest after the second (`gauge-tongue-grip.ts`).
  const hand = handleRadius(l, field.cfg);
  const tongue = gaugeTongueUnder(dial, hand, g, field.seat, x, y);
  if (tongue !== null) return tongue;
  // Her hand on the teeth, in the rest after the first level (`gauge-tooth-grip.ts`).
  if (field.seat === 2) return gaugeToothUnder(dial, hand, g, x, y);
  return null;
}

/**
 * Her thumb holding the wound band open, and it is neither a carry nor a turn:
 * the simulation reads only that it is down (`sim/gauge-hand.ts`). The hold is
 * an ordinary drag so the lift arrives the ordinary way, and the displacement
 * it reports on the way is a number nothing looks at.
 */
function bandTouch(x: number, y: number): Touch {
  const target = "gaugeBand";
  return {
    player: 2,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: 2, originX: x, originY: y },
  };
}

/**
 * The rings, for the seat this screen is. Called after the dial is drawn, so a
 * ring stands on the band rather than under it.
 */
export function drawGaugeGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  dial: Dial,
  g: GaugeState,
  role: ViewRole,
  time: number,
): void {
  if (g.phase !== "play") return;
  if (showsGaugeMarks(role) && gaugeBandAsks(g)) {
    const c = gaugeBandGrip(l, cfg, dial, g);
    drawGripRing(ctx, c.x, c.y, c.r, g.openThumb, time);
  }
  const hand = handleRadius(l, cfg);
  if (showsGaugeMarks(role)) drawGaugeToothRings(ctx, dial, hand, g, time);
  if (showsGaugeValve(role)) drawGaugeTongueRing(ctx, dial, hand, g, 1, time);
  if (showsGaugeMarks(role)) drawGaugeTongueRing(ctx, dial, hand, g, 2, time);
}
