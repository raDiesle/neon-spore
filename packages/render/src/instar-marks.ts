import { circleSubpath } from "@neon-spore/content";
import {
  type InstarGesture,
  type InstarMark,
  type InstarState,
  instarActing,
  instarMarkDone,
  instarStep,
  instarStrikeBeat,
  type SimConfig,
} from "@neon-spore/sim";
import type { CueKind } from "./boss-cue.js";
import { strokeGlow } from "./glow.js";
import { drawInstarCall } from "./instar-call.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-shape.js";
import { instarSway } from "./instar-sway.js";
import {
  drawInstarDone,
  drawInstarWindow,
  instarAwaited,
  instarTogetherLeft,
} from "./instar-together.js";
import { drawInstarWord } from "./instar-word.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { instarMarkIsMine } from "./view-role-clocks-b.js";

/**
 * **THE INSTAR's marks: the only control on the screen.** A red ring on the
 * part the script wants moved, the gesture drawn inside it
 * (`instar-glyphs.ts`), the word for it and the kind of action over that in a
 * scanner box over it (`instar-word.ts`), a progress arc that fills as the
 * part gives, and **the window**: a second ring closing in on the mark from
 * outside over the step's `windowBeats`, so how long is left is read off the
 * picture and not off a number — the world teaches the pair, and the two
 * lines are only the name of what the ring already shows.
 *
 * Whose the mark is, is the split of this boss (`view-role-clocks-b.ts`):
 * on the seat it wants, the ring is bright and the box carries the kind and
 * the gesture (`docs/decisions.md` #34's own vocabulary, `boss-cue.ts`); on
 * the other, the ring is dim and the box carries one line, *P1'S* or
 * *P2'S*, because that seat's job is to watch it and say when it is
 * done.
 *
 * Nothing is drawn but in the `act` phase, save the **anticipation**: over
 * the last part of a morph the marks glow up faintly on the parts they are
 * about to ask for, so the pair's thumbs are already there when the window
 * opens.
 *
 * **The step's own call stands under both marks** (`instar-call.ts`): who the
 * pose is waiting on and how long they have, which is the one thing neither
 * ring can say because it is about the pair.
 *
 * **A mark answered while its partner is still out is not finished**, and
 * what that costs is drawn next door (`instar-together.ts`): the dot carries
 * the together window closing into it, and every ring still open goes urgent,
 * because those are the ones the pair is late on.
 *
 * The hit test is here too, next to the ring it answers (`handles.ts`'s
 * rule). It hands *every* seat's press through: the simulation is what
 * refuses the wrong thumb and says so (`sim/instar-hand.ts`).
 */

/**
 * The six gestures' verbs, and the `CueKind` each reduces to — #34's own
 * four (`boss-cue.ts`): a press of a button, a hold of one, a thumb carried,
 * a turn of the crank. A pull and a swipe are both a carry, one held at its
 * depth and one let go on the lift; a tap is the press repeated.
 */
export const INSTAR_WORDS: Record<InstarGesture, { kind: CueKind; word: string }> = {
  pullDown: { kind: "CARRY", word: "PULL DOWN" },
  pullUp: { kind: "CARRY", word: "PULL UP" },
  tap: { kind: "PRESS", word: "TAP TAP" },
  swipeDown: { kind: "CARRY", word: "SWIPE DOWN" },
  turn: { kind: "TURN", word: "TURN" },
  hold: { kind: "HOLD", word: "HOLD BOTH" },
};

/** The two lines a seat reads over a mark: the kind and the gesture on its
 * own mark, the owner's name alone on its partner's. */
export function instarMarkWord(mark: InstarMark, role: ViewRole): { kind?: CueKind; word: string } {
  if (instarMarkIsMine(role, mark.seat)) return INSTAR_WORDS[mark.gesture];
  return { word: mark.seat === "p1" ? "P1'S" : "P2'S" };
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
  const sway = instarSway(s, cfg, beat, beatPhase);
  if (s.phase === "morph") {
    if (morph < ANTICIPATE_FROM) return;
    const glow = ((morph - ANTICIPATE_FROM) / (1 - ANTICIPATE_FROM)) * 0.5;
    for (const mark of step.marks) {
      const at = instarMarkPoint(l, mark, sway);
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
  const awaited = instarAwaited(s, cfg, beat, beatPhase);
  step.marks.forEach((mark, i) => {
    const at = instarMarkPoint(l, mark, sway);
    const mine = instarMarkIsMine(role, mark.seat);
    // Beside the ring, clear of the window ring at its widest, away from the middle.
    const side = mark.xMilli < 500 ? -1 : 1;
    if (instarMarkDone(s, i)) {
      drawInstarDone(
        ctx,
        l,
        at.x,
        at.y,
        r,
        time,
        instarTogetherLeft(s, cfg, i, beat, beatPhase),
        side,
      );
      return;
    }
    const along = Math.max(0, Math.min(1, (s.progress[i] ?? 0) / mark.need));
    const held = (s.thumbs[i] ?? 0) !== 0;
    drawRing(ctx, at.x, at.y, r, mark.gesture, mine, held, along, time, awaited);
    drawInstarWindow(ctx, at.x, at.y, r, left, mine);
    const { kind, word } = instarMarkWord(mark, role);
    drawInstarWord(ctx, l, word, at.x + side * r * 3.1, at.y, side, mine, kind);
  });
  drawInstarCall(ctx, l, s, cfg, beat, beatPhase);
}

/**
 * The ring itself: red, brighter for the seat it wants, breathing until a
 * thumb lands, its arc filling as the part gives.
 *
 * `awaited` is the partner already answered and counting: the ring breathes
 * harder and burns brighter, because this is the mark the step is waiting on
 * and what happens if it does not come is the other one going back to nought
 * (`instar-together.ts`).
 */
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
  awaited: boolean,
): void {
  const beat = awaited ? 7 : 4;
  const swell = awaited ? 0.14 : 0.08;
  const breathe = held ? 1 : 1 + swell * Math.sin(time * beat);
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
    held || awaited ? PALETTE.redRim : PALETTE.red,
    STROKE.inner,
    (mine ? (held ? 1.2 : 0.9) : 0.4) * (awaited ? 1.35 : 1),
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
