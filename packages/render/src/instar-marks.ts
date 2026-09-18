import { circleSubpath } from "@neon-spore/content";
import {
  type InstarGesture,
  type InstarMark,
  type InstarState,
  instarActing,
  instarMarkDone,
  instarStep,
  instarStrikeBeat,
  NO_BEARING,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-shape.js";
import { drawInstarWord } from "./instar-word.js";
import { hitCircle, type Layout, type ViewRole } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { instarMarkIsMine } from "./view-role-clocks-b.js";

/**
 * **THE INSTAR's marks: the only control on the screen.** A red ring on the
 * part the script wants moved, the gesture drawn inside it
 * (`instar-glyphs.ts`), the word for it in a scanner box over it
 * (`instar-word.ts`), a progress arc that fills as the part gives, and
 * **the window**: a second ring closing in on the mark from outside over the
 * step's `windowBeats`, so how long is left is read off the picture and not
 * off a number — the world teaches the pair, and the word is only the name
 * of what the ring already shows.
 *
 * Whose the mark is, is the split of this boss (`view-role-clocks-b.ts`):
 * on the seat it wants, the ring is bright and the word is the gesture; on
 * the other, the ring is dim and the word is *PILOT'S* or *NAVIGATOR'S*,
 * because that seat's job is to watch it and say when it is done.
 *
 * Nothing is drawn but in the `act` phase, save the **anticipation**: over
 * the last part of a morph the marks glow up faintly on the parts they are
 * about to ask for, so the pair's thumbs are already there when the window
 * opens.
 *
 * The hit test is here too, next to the ring it answers (`handles.ts`'s
 * rule). It hands *every* seat's press through: the simulation is what
 * refuses the wrong thumb and says so (`sim/instar-hand.ts`).
 */

export const INSTAR_WORDS: Record<InstarGesture, string> = {
  pullDown: "PULL DOWN",
  pullUp: "PULL UP",
  tap: "TAP TAP",
  swipeDown: "SWIPE DOWN",
  turn: "TURN",
  hold: "HOLD BOTH",
};

/** The word a seat reads over a mark: the gesture on its own, the owner's name on the other. */
export function instarMarkWord(mark: InstarMark, role: ViewRole): string {
  if (instarMarkIsMine(role, mark.seat)) return INSTAR_WORDS[mark.gesture];
  return mark.seat === "p1" ? "PILOT'S" : "NAVIGATOR'S";
}

/** The morph's last stretch over which the marks glow up on their parts. */
const ANTICIPATE_FROM = 0.6;

export function drawInstarMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: InstarState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  time: number,
  morph: number,
  role: ViewRole,
): void {
  const step = instarStep(s);
  if (step === null) return;
  const r = instarMarkRadius(l, cfg);
  if (s.phase === "morph") {
    if (morph < ANTICIPATE_FROM) return;
    const glow = ((morph - ANTICIPATE_FROM) / (1 - ANTICIPATE_FROM)) * 0.5;
    for (const mark of step.marks) {
      const at = instarMarkPoint(l, mark);
      const p = new Path2D(circleSubpath(at.x, at.y, r * (1.6 - 0.6 * glow)));
      strokeGlow(ctx, p, PALETTE.red, STROKE.inner, glow);
    }
    return;
  }
  if (!instarActing(s)) return;
  const left = Math.max(
    0,
    Math.min(1, (instarStrikeBeat(s) - beat - beatPhase) / step.windowBeats),
  );
  step.marks.forEach((mark, i) => {
    const at = instarMarkPoint(l, mark);
    const mine = instarMarkIsMine(role, mark.seat);
    if (instarMarkDone(s, i)) {
      drawDone(ctx, at.x, at.y, r, time);
      return;
    }
    const along = Math.max(0, Math.min(1, (s.progress[i] ?? 0) / mark.need));
    const held = (s.thumbs[i] ?? 0) !== 0;
    drawRing(ctx, at.x, at.y, r, mark.gesture, mine, held, along, time);
    drawWindow(ctx, at.x, at.y, r, left, mine);
    // Beside the ring, clear of the window ring at its widest, away from the middle.
    const side = mark.xMilli < 500 ? -1 : 1;
    drawInstarWord(ctx, l, instarMarkWord(mark, role), at.x + side * r * 3.1, at.y, side, mine);
  });
}

/** The ring itself: red, brighter for the seat it wants, breathing until a thumb lands, its arc filling as the part gives. */
function drawRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  gesture: InstarGesture,
  mine: boolean,
  held: boolean,
  along: number,
  time: number,
): void {
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = PALETTE.red;
  ctx.globalAlpha = held ? 0.5 + along * 0.4 : mine ? 0.22 : 0.1;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(
    ctx,
    p,
    held ? PALETTE.redRim : PALETTE.red,
    STROKE.inner,
    mine ? (held ? 1.2 : 0.9) : 0.4,
  );
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.95 : 0.5;
  drawInstarGlyph(ctx, gesture, x, y, r, time);
  ctx.restore();
  if (along <= 0) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * along);
  ctx.stroke();
  ctx.restore();
}

/** The window: a ring closing in from outside, brighter and faster the less is left. */
function drawWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  left: number,
  mine: boolean,
): void {
  const p = new Path2D(circleSubpath(x, y, r * (1.75 + 1.1 * left)));
  const urgency = 1 - left;
  strokeGlow(ctx, p, PALETTE.red, STROKE.inner, (0.25 + 0.65 * urgency) * (mine ? 1 : 0.5));
}

/** A mark answered: a small filled dot in the rim's colour, and no word. */
function drawDone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const p = new Path2D(circleSubpath(x, y, r * 0.5));
  ctx.save();
  ctx.fillStyle = PALETTE.redRim;
  ctx.globalAlpha = 0.6 + 0.2 * Math.sin(time * 3);
  ctx.fill(p);
  ctx.restore();
}

/**
 * A press on one of the marks while they are up: the nearest ring under the
 * thumb, as a `drag` on `instarMark` with `id` naming which. A `turn` mark's
 * hold keeps the *mark's centre* as its origin and is flagged `turns`, so
 * every move after it reports a bearing round the ring rather than a carry
 * (`touch-drag.ts` `turnAbout`) — THE CLAW's crank, on the field.
 */
export function instarMarkUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "instar");
  if (s === null || !instarActing(s)) return null;
  const step = instarStep(s);
  if (step === null) return null;
  const r = instarMarkRadius(l, field.cfg);
  let best: { id: number; mark: InstarMark; d: number } | null = null;
  step.marks.forEach((mark, id) => {
    const at = instarMarkPoint(l, mark);
    if (!hitCircle({ x: at.x, y: at.y, r }, x, y)) return;
    const d = (x - at.x) ** 2 + (y - at.y) ** 2;
    if (best === null || d < best.d) best = { id, mark, d };
  });
  if (best === null) return null;
  const { id, mark } = best as { id: number; mark: InstarMark };
  const turns = mark.gesture === "turn";
  const at = instarMarkPoint(l, mark);
  return {
    player: field.seat,
    command: {
      kind: "drag",
      target: "instarMark",
      on: true,
      fromMilli: turns ? NO_BEARING : 0,
      fromYMilli: 0,
      id,
    },
    hold: {
      kind: "drag",
      target: "instarMark",
      player: field.seat,
      originX: turns ? at.x : x,
      originY: turns ? at.y : y,
      id,
      ...(turns ? { turns: true as const } : {}),
    },
  };
}
