import { type SimConfig, type StareState, stareLidFree } from "@neon-spore/sim";
import { rimBox, rimPoint } from "./eye-rim.js";
import { strokeGlow } from "./glow.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullKnob, PULL_GRAB } from "./pull-knob.js";
import { PULL_DOWN, straightPullTrack } from "./pull-line.js";
import { drawPullTrack } from "./pull-track.js";
import { type StareEye, stareEye, stareLidDrop } from "./stare-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
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
 * in a channel from the brow to where a shut lid's edge stops that fills
 * green behind it — the owner's rule for every handle you pull
 * (`pull-track.ts`, `pull-knob.ts`); it breathes while it is free, is lit
 * while it is held, and is not drawn while the eye is forcing the lid back
 * up — the eye has it then, not a thumb.
 *
 * The **rest** is the one place the circle is written down, and the hit
 * test answers there, widened by `PULL_GRAB`, whatever the lid is doing: a
 * press is tested against the brow, and the pointer is captured from that
 * press on (`handles.ts`).
 */

/**
 * Where the lid's edge starts, in socket heights above the eye's middle: the
 * brow, just clear of the lashes' tips — the film stands 1.45 sockets above
 * the middle (`eye.ts` `FLUID_MUL`) and the hairs reach most of another.
 */
const BROW = 2.3;
/** Where a shut lid's edge stops: the film's floor, and a little under it. */
const FLOOR = 0.85;
/**
 * The almond the flap is clipped to — the film's, a shade larger, so the
 * film's own wobble never shows past the lid's edge. Not the socket's inner
 * rim: what the lid has to cover is the whole of what the eye draws.
 */
const COVER_MUL = 1.55;
const COVER_POINTS = 24;

/** Where the ring rests, with no hand on the lid. */
export function stareLidRest(l: Layout, cfg: SimConfig): Circle {
  const e = stareEye(l, cfg);
  return { x: e.cx, y: e.cy - e.ry * BROW, r: handleRadius(l, cfg) };
}

/**
 * The lid's edge, in canvas pixels, for how far down it is. The drop is the
 * thumb's share of `stareLidPullMilli`, and the edge travels the eye's whole
 * height on it rather than the thumb's own pixels: a lid the simulation
 * calls shut has to look shut, and half a tile of thumb is not an eye's
 * worth of lid.
 */
function lidEdgeY(e: StareEye, brow: number, drop: number): number {
  return brow + drop * (e.cy + e.ry * FLOOR - brow);
}

/** The almond the flap fills, as a path. */
function coverPath(e: StareEye): Path2D {
  const box = rimBox(e.rx, e.ry, COVER_MUL);
  const p = new Path2D();
  for (let i = 0; i <= COVER_POINTS; i++) {
    const q = rimPoint(box, (i / COVER_POINTS) % 1);
    if (i === 0) p.moveTo(e.cx + q.x, e.cy + q.y);
    else p.lineTo(e.cx + q.x, e.cy + q.y);
  }
  p.closePath();
  return p;
}

/**
 * The press, answered for the seat the eye is not looking at, while it is
 * looking. `bossOf(field, "stare")` is `null` on every wave without the eye, and a press
 * then falls through to whatever is behind it as if no ring were there. The
 * hold's origin is the finger: how far *down* it has come from where it
 * landed is the pull (`sim/stare-hand.ts`).
 */
export function stareLidUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "stare");
  if (s === null || !stareLidFree(s, field.seat)) return null;
  const rest = stareLidRest(l, field.cfg);
  if (!hitCircle({ ...rest, r: rest.r * PULL_GRAB }, x, y)) return null;
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
  const edge = lidEdgeY(e, rest.y, drop);
  if (drop > 0) {
    // The flap: the eye's own almond, filled down to where the lid has come.
    const w = e.rx * COVER_MUL;
    ctx.save();
    ctx.clip(coverPath(e));
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fillRect(e.cx - w, rest.y - e.ry, w * 2, edge - rest.y + e.ry);
    ctx.restore();
    // Its edge, curved like the lid it is, lit in the eye's ink.
    const lip = new Path2D(
      `M ${e.cx - w} ${edge - e.ry * 0.3} Q ${e.cx} ${edge + e.ry * 0.35} ${e.cx + w} ${edge - e.ry * 0.3}`,
    );
    strokeGlow(ctx, lip, rim, STROKE.outline, 0.9);
  }
  if (!showsStareLid(role, s.watching)) return;
  if (s.phase === "opening") return;
  const held = s.lidSeat !== 0;
  const head = { x: rest.x, y: edge };
  // Down only, and the whole of the edge's travel: the knob rides the edge,
  // not the thumb, so the channel is where the edge can go.
  const len = lidEdgeY(e, rest.y, 1) - rest.y;
  const track = straightPullTrack({
    from: rest,
    r: rest.r,
    head,
    held,
    rest: PULL_DOWN,
    len,
    follow: false,
  });
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: drop, time });
  drawPullKnob(ctx, head, rest.r, { ...LOOK, held, time });
}

/** The handle's colours: the cowl's rock, lit to the text colour while held. */
const LOOK = { hex: PALETTE.rock, rim: PALETTE.text } as const;
