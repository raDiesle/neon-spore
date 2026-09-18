import {
  type GaugeState,
  gaugeBound,
  gaugeJammed,
  NO_BEARING,
  type SimConfig,
} from "@neon-spore/sim";
import {
  type Dial,
  gaugeBandMid,
  gaugeNeedleTip,
  showsGaugeMarks,
  showsGaugeValve,
} from "./gauge.js";
import { gaugeDial } from "./gauge-round.js";
import { drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";

/**
 * **THE GAUGE's two thumbs on the dial itself**: the pilot's on the needle
 * while the valve is dead, and the navigator's on the band while it is wound
 * tight. Drawn and answered in one file for `gorge-grip.ts`' reason — the
 * circle a thumb is answered at is the circle the ring is drawn from.
 *
 * Each ring stands on the half of the picture its own seat is shown
 * (`showsGaugeValve`, `showsGaugeMarks`), which is the round's whole split: he
 * has never seen the band and she has never had a valve. The ring is
 * `queen-grip.ts`' — breathing until a thumb lands, filled once one has — so a
 * held needle and a held mark read as one gesture across the whole game.
 *
 * **Neither ring is ever standing when nothing would answer it.** The
 * simulation refuses a needle that is not jammed and a band that is not wound
 * (`sim/gauge-hand.ts`), and the same two questions are asked here rather than
 * a second opinion written down beside them — a ring on a needle that still
 * answers its valve would be a control drawn where it is not answered, which
 * is the thing `handles.ts` exists to prevent.
 *
 * No dial on either ring. THE GORGE's pry carries one because its window runs
 * out on a clock; both of these last exactly as long as the thumb does, and
 * the settle a lifted needle costs is the *other* seat's problem to hear about
 * — her call is refused, and the cue over it goes out (`boss-cue-read-e.ts`).
 */

/** The ring on the end of the needle: where the cue's frame already stands. */
export function gaugeNeedleGrip(l: Layout, cfg: SimConfig, dial: Dial, g: GaugeState): Circle {
  const tip = gaugeNeedleTip(dial, g);
  return { x: tip.x, y: tip.y, r: handleRadius(l, cfg) };
}

/** The ring in the middle of the band, out at the rim where the band is drawn. */
export function gaugeBandGrip(l: Layout, cfg: SimConfig, dial: Dial, g: GaugeState): Circle {
  const mid = gaugeBandMid(dial, g);
  return { x: mid.x, y: mid.y, r: handleRadius(l, cfg) };
}

/**
 * The press, for whichever of the two this seat has this beat.
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
  // The live screen's dial, which is the only one a finger ever lands on: a
  // rehearsal's film is lower (`clearTop`) and takes no input.
  const dial = gaugeDial(l, undefined);
  if (field.seat === 1 && gaugeJammed(g) && hitCircle(gaugeNeedleGrip(l, field.cfg, dial, g), x, y))
    return needleTouch(dial);
  if (field.seat === 2 && gaugeBound(g) && hitCircle(gaugeBandGrip(l, field.cfg, dial, g), x, y))
    return bandTouch(x, y);
  return null;
}

/**
 * His hand on the needle, and it is a **turn** rather than a carry: the hold's
 * origin is the dial's own middle, so every move reports where round the face
 * the finger is (`turnAbout` in `touch-drag.ts`, `turns`). The needle then
 * simply goes where he points, which is what makes it worth having while the
 * valve — a thing that walks — is dead.
 *
 * The press itself says `NO_BEARING`: a hand that has landed and not yet said
 * where. Reading a bearing off the press would move the needle by however far
 * his thumb missed its own tip by, on the one gesture in this round that is
 * supposed to be exact.
 */
function needleTouch(dial: Dial): Touch {
  const target = "gaugeNeedle";
  return {
    player: 1,
    command: { kind: "drag", target, on: true, fromMilli: NO_BEARING },
    hold: { kind: "drag", target, player: 1, originX: dial.cx, originY: dial.cy, turns: true },
  };
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
 * ring stands on the needle and the band rather than under them.
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
  if (showsGaugeValve(role) && gaugeJammed(g)) {
    const c = gaugeNeedleGrip(l, cfg, dial, g);
    drawGripRing(ctx, c.x, c.y, c.r, g.handOn, time);
  }
  if (showsGaugeMarks(role) && gaugeBound(g)) {
    const c = gaugeBandGrip(l, cfg, dial, g);
    drawGripRing(ctx, c.x, c.y, c.r, g.openThumb, time);
  }
}
