import { type SimConfig, type StareState, stareLidFree } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawHandleRest, drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { type StareEye, stareEye, stareLidDrop } from "./stare-shape.js";
import type { Field, Touch } from "./touch.js";
import type { ViewRole } from "./view-role.js";
import { showsStareLid } from "./view-role-clocks-b.js";

/**
 * **THE STARE's lid**: the one thing on the eye a hand takes hold of, drawn
 * and answered in one file for `sinew-handles.ts`' reason — the circle a
 * thumb is answered at is the circle the ring is drawn from.
 *
 * The lid is a flap of the cowl's own rock, and it comes down over the
 * socket from its top edge: a filled band from the socket's brow to the
 * lid's edge, with the edge lit in the eye's ink, so what the lid covers is
 * seen to be covered. **The lid is on every screen** and the ring is on
 * one: a watched seat has to see the lid come down to know the look is
 * over, and the seat that may pull it is the other one
 * (`showsStareLid`, `sim/stare.ts` `stareLidFree`). The ring rests at the
 * brow while there is no hand on it and rides the edge down with the pull,
 * which is the shipped handle look (`handle-draw.ts`); it breathes while it
 * is free, fills while it is held, and is not drawn while the eye is
 * forcing the lid back up — the eye has it then, not a thumb.
 *
 * The **rest** is the one place the circle is written down, and the hit
 * test answers there whatever the lid is doing: a press is tested against
 * the brow, and the pointer is captured from that press on (`handles.ts`).
 */

/** Where the lid's edge starts, in socket heights above the eye's middle: the brow. */
const BROW = 0.85;

/** Where the ring rests, with no hand on the lid. */
export function stareLidRest(l: Layout, cfg: SimConfig): Circle {
  const e = stareEye(l, cfg);
  return { x: e.cx, y: e.cy - e.ry * BROW, r: handleRadius(l, cfg) };
}

/** The lid's edge, in canvas pixels, for how far down it is. */
function lidEdgeY(l: Layout, cfg: SimConfig, e: StareEye, drop: number): number {
  return e.cy - e.ry * BROW + (drop * cfg.stareLidPullMilli * l.tile) / 1000;
}

/**
 * The press, answered for the seat the eye is not looking at, while it is
 * looking. `field.stare` is `null` on every wave without the eye, and a press
 * then falls through to whatever is behind it as if no ring were there. The
 * hold's origin is the finger: how far *down* it has come from where it
 * landed is the pull (`sim/stare-hand.ts`).
 */
export function stareLidUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = field.stare;
  if (s === null || !stareLidFree(s, field.seat)) return null;
  if (!hitCircle(stareLidRest(l, field.cfg), x, y)) return null;
  return {
    player: field.seat,
    command: { kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "stareLid", player: field.seat, originX: x, originY: y },
  };
}

/**
 * The lid over the eye, and the ring on it for the seat whose thumb it is.
 * Called after the eye is drawn and before the count, so the lid covers the
 * eye and nothing covers the lid. `rim` is the eye's ink at this heat, so
 * the lit edge is the eye's colour and not a colour of its own.
 */
export function drawStareLid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: StareState,
  role: ViewRole,
  beat: number,
  beatPhase: number,
  time: number,
  rim: string,
): void {
  if (s.watching === 0) return;
  const drop = stareLidDrop(s, cfg, beat, beatPhase);
  const e = stareEye(l, cfg);
  const rest = stareLidRest(l, cfg);
  const edge = lidEdgeY(l, cfg, e, drop);
  if (drop > 0) {
    // The flap: the socket's own almond, clipped to what the lid has crossed.
    const socket = new Path2D(
      `M ${e.cx - e.rx} ${e.cy} Q ${e.cx - e.rx * 0.4} ${e.cy - e.ry * 1.7} ${e.cx + e.rx} ${e.cy} Q ${e.cx + e.rx * 0.4} ${e.cy + e.ry * 1.3} ${e.cx - e.rx} ${e.cy} Z`,
    );
    ctx.save();
    ctx.clip(socket);
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fillRect(e.cx - e.rx, rest.y - e.ry, e.rx * 2, edge - rest.y + e.ry);
    ctx.restore();
    // Its edge, curved like the lid it is, lit in the eye's ink.
    const lip = new Path2D(
      `M ${e.cx - e.rx * 0.95} ${edge - e.ry * 0.25} Q ${e.cx} ${edge + e.ry * 0.3} ${e.cx + e.rx * 0.95} ${edge - e.ry * 0.25}`,
    );
    strokeGlow(ctx, lip, rim, STROKE.outline, 0.9);
  }
  if (!showsStareLid(role, s.watching)) return;
  if (s.phase === "opening") return;
  const held = s.lidSeat !== 0;
  if (held) drawHandleRest(ctx, rest, PALETTE.rock);
  drawHandleRing(ctx, {
    x: rest.x,
    y: edge,
    r: rest.r,
    hex: PALETTE.rock,
    rim: PALETTE.text,
    held,
    pull: drop,
    time,
  });
}
