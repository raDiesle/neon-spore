import { circleSubpath } from "@neon-spore/content";
import {
  type InstarGesture,
  type InstarMark,
  type InstarState,
  instarActing,
  instarMarkDone,
  instarStep,
  instarSwipeAlong,
  type SimConfig,
} from "@neon-spore/sim";
import type { CueKind } from "./boss-cue.js";
import { strokeGlow } from "./glow.js";
import { drawVerdictRing, type GripVerdict } from "./grip-verdict.js";
import { drawInstarHalo, drawInstarTheirs } from "./instar-mark-feedback.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-place.js";
import { drawInstarRing } from "./instar-ring.js";
import { INSTAR_FLIGHT_ENDS, instarThreat } from "./instar-shape.js";
import { instarSway } from "./instar-sway.js";
import {
  drawInstarDone,
  drawInstarWindow,
  instarAwaited,
  instarTogetherLeft,
} from "./instar-together.js";
import { drawInstarSwipe, instarTrack } from "./instar-track.js";
import { drawInstarWord, type MarkRoom } from "./instar-word.js";
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
 * **No line is written for the step as a whole.** Two rings up at once are
 * the pose saying *either order*, and the owner took the sentence that said
 * it again off the glass on 24 September 2026 (`test/pair-order.test.ts`).
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
 * The gestures' verbs, and the `CueKind` each reduces to — #34's own
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
  turnBack: { kind: "TURN", word: "TURN BACK" },
  hold: { kind: "HOLD", word: "HOLD BOTH" },
  // THE NETTLE's panel verbs: a press of a panel button, said as the button is.
  shoot: { kind: "PRESS", word: "SHOOT" },
  shield: { kind: "PRESS", word: "SHIELD" },
  suck: { kind: "PRESS", word: "SUCK" },
};

/** The two lines a seat reads over a mark: the kind and the gesture on its
 * own mark, the owner's name alone on its partner's. */
export function instarMarkWord(mark: InstarMark, role: ViewRole): { kind?: CueKind; word: string } {
  if (instarMarkIsMine(role, mark.seat)) return INSTAR_WORDS[mark.gesture];
  return { word: mark.seat === "p1" ? "P1'S" : "P2'S" };
}

/** The morph's last stretch over which the marks glow up on their parts:
 * from the moment the body's flight is over (`instar-flight.ts`). */
const ANTICIPATE_FROM = INSTAR_FLIGHT_ENDS;

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
  verdicts: { at(key: number): GripVerdict | null },
): void {
  const step = instarStep(s);
  if (step === null) return;
  const r = instarMarkRadius(l, cfg);
  const sway = instarSway(s, cfg, beat, beatPhase);
  if (s.phase === "morph") {
    if (morph < ANTICIPATE_FROM) return;
    const glow = ((morph - ANTICIPATE_FROM) / (1 - ANTICIPATE_FROM)) * 0.5;
    for (const mark of step.marks) {
      const at = instarMarkPoint(l, mark, sway, 0);
      const p = new Path2D(circleSubpath(at.x, at.y, r * (1.6 - 0.6 * glow)));
      strokeGlow(ctx, p, PALETTE.red, STROKE.inner, glow);
    }
    return;
  }
  if (!instarActing(s)) return;
  const awaited = instarAwaited(s, cfg, beat, beatPhase);
  // How far the window has run moves a swept mark; what is left of it closes the ring.
  const along = instarThreat(s, beat, beatPhase);
  const left = 1 - along;
  // Beside the ring, clear of the window ring at its widest.
  const off = r * 3.1;
  const rooms = step.marks.map((m) => markRoom(l, cfg, m, sway, along, r, off));
  step.marks.forEach((mark, i) => {
    const at = instarMarkPoint(l, mark, sway, along);
    const mine = instarMarkIsMine(role, mark.seat);
    // Away from the middle, and never over the step's other marks.
    const room = { own: rooms[i] as MarkRoom, avoid: rooms.filter((_, j) => j !== i) };
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
    } else {
      // A swipe's arc is *this* carry on its way to the lift that counts it
      // — the owner's, 24 September 2026, generic — and the eggs left on the
      // body are the count; every other gesture's arc is its count.
      const swipe = mark.gesture === "swipeDown";
      const count = (s.progress[i] ?? 0) / mark.need;
      const along = Math.max(0, Math.min(1, swipe ? instarSwipeAlong(s, cfg, i) / 1000 : count));
      const held = (s.thumbs[i] ?? 0) !== 0;
      const { kind, word } = instarMarkWord(mark, role);
      if (swipe) {
        // A track and not a ring: the way the thumb goes (`instar-track.ts`).
        const t = instarTrack(at.x, at.y, r, (l.tile * cfg.instarSwipeMilli) / 1000);
        drawInstarSwipe(ctx, t, r, mine, held, along, time, awaited, left);
        const mid = (t.top + t.bottom) / 2;
        drawInstarWord(ctx, l, word, at.x + side * off, mid, side, mine, kind, room);
        drawVerdict(ctx, verdicts, i, at.x, at.y, r);
        return;
      }
      if (mine) drawInstarHalo(ctx, at.x, at.y, r, time);
      drawInstarRing(ctx, at.x, at.y, r, mark.gesture, mine, held, along, time, awaited);
      if (!mine) drawInstarTheirs(ctx, at.x, at.y, r, time);
      drawInstarWindow(ctx, at.x, at.y, r, left, mine);
      drawInstarWord(ctx, l, word, at.x + side * off, at.y, side, mine, kind, room);
    }
    drawVerdict(ctx, verdicts, i, at.x, at.y, r);
  });
}

/** The room a mark takes this frame: its ring, or a swipe's whole track, and
 * `off` round it — what a word beside another mark may not cover. */
function markRoom(
  l: Layout,
  cfg: SimConfig,
  mark: InstarMark,
  sway: { xMilli: number; yMilli: number },
  along: number,
  r: number,
  off: number,
): MarkRoom {
  const at = instarMarkPoint(l, mark, sway, along);
  const bottom =
    mark.gesture === "swipeDown"
      ? instarTrack(at.x, at.y, r, (l.tile * cfg.instarSwipeMilli) / 1000).bottom
      : at.y;
  return { left: at.x - off, right: at.x + off, top: at.y - off, bottom: bottom + off };
}

/** The verdict goes over the ring, the track's top or the dot, whichever this
 * frame drew: the touch that finished a mark is judged green on the mark it
 * finished. */
function drawVerdict(
  ctx: CanvasRenderingContext2D,
  verdicts: { at(key: number): GripVerdict | null },
  i: number,
  x: number,
  y: number,
  r: number,
): void {
  const v = verdicts.at(i);
  if (v !== null) drawVerdictRing(ctx, x, y, r, v);
}
