import {
  type InstarGesture,
  instarActing,
  instarMarkDone,
  instarStep,
  instarSwipeAlong,
  type SceneMark,
  type SceneState,
  type SimConfig,
  slowing,
  type World,
} from "@neon-spore/sim";
import type { CueKind } from "./boss-cue.js";
import { asksGrab } from "./boss-cue-shape.js";
import { drawVerdictRing, type GripVerdict } from "./grip-verdict.js";
import { saysHold, saysTap } from "./handle-word.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-place.js";
import { drawInstarPull, instarMarkPulls, instarPullSpan } from "./instar-pull.js";
import { drawInstarRing } from "./instar-ring.js";
import { instarThreat } from "./instar-shape.js";
import type { Sway } from "./instar-sway.js";
import { drawInstarDone, instarAwaited, instarTogetherLeft } from "./instar-together.js";
import { drawInstarWord, type MarkRoom } from "./instar-word.js";
import type { Layout, ViewRole } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { drawPressDrop } from "./press-drop.js";
import { drawSoakHold } from "./soak-hold.js";
import { instarMarkIsMine } from "./view-role-clocks-b.js";

/**
 * **THE INSTAR's marks: the only control on the screen.** A red ring on the
 * part the script wants moved, the gesture drawn inside it
 * (`instar-glyphs.ts`), the word for it and the kind of action over that in a
 * scanner box over it (`instar-word.ts`), and a progress arc that fills as
 * the part gives. A pull is the PULL LAB's knob (`instar-pull.ts`) and a hold
 * the HOLD LAB's drop (`soak-hold.ts`), with no word. **No window ring**: the
 * red ring that closed in on every mark over the step's `windowBeats` went on
 * 13 October 2026 — the owner, *there is red circle around the control - this
 * makes it inconsistent. remove it*. The window is still the slow's, and the
 * fuse still burns it down (`slow-fuse.ts`).
 *
 * Whose the mark is, is the split of this boss (`view-role-clocks-b.ts`):
 * on the seat it wants, the ring is bright and the box carries the kind and
 * the gesture (`docs/decisions.md` #34's own vocabulary, `boss-cue.ts`); on
 * the other, the ring is dim and the box carries one line, *P1'S* or
 * *P2'S*, because that seat's job is to watch it and say when it is
 * done.
 *
 * **A mark is up only while it can be answered**: in the `act` phase and
 * while THE SLOW is open (`instarMarksUp`). The owner, 27 September 2026:
 * *the red circles for an upcoming action before slow should only be visible
 * when they are receiving actions already and when the slow animation
 * happens.* So the faint ring that used to glow up over the last of a morph
 * is gone — a ring on a part that cannot be answered yet — and so is the
 * ring left standing on the frozen field under the fail screen, where the
 * step is still `act` but its window struck and shut the slow.
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
 * The hit test is next door, over the same rings (`instar-mark-grip.ts`).
 * It hands *every* seat's press through: the simulation is what refuses the
 * wrong thumb and says so (`sim/instar-hand.ts`).
 */

/** How far beside a ring its word hangs, in ring radii: where the window ring was widest. */
export const MARK_WORD_OFF = 3.1;

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
export function instarMarkWord(mark: SceneMark, role: ViewRole): { kind?: CueKind; word: string } {
  if (instarMarkIsMine(role, mark.seat)) {
    // A shoot mark that asks for a colour says it: the crosshair is drawn in
    // it too (`instar-crosshair.ts`), and a word is what the pair says aloud.
    if (mark.gesture === "shoot" && mark.color !== undefined)
      return { kind: "PRESS", word: mark.color === "red" ? "SHOOT RED" : "SHOOT CYAN" };
    return INSTAR_WORDS[mark.gesture];
  }
  return { word: mark.seat === "p1" ? "P1'S" : "P2'S" };
}

/**
 * Whether the step's marks are up this frame: it is acting and THE SLOW is
 * open. The step opens the slow for exactly its window and shuts it on the
 * landing and on the strike (`sim/instar-step.ts`), so outside a failed
 * wave the two agree; after a strike they do not, and the slow is the one
 * that has it right. The hit test asks the same of the field's window
 * (`instar-mark-grip.ts`), so no press takes hold of a ring nobody can see.
 */
export function instarMarksUp(
  world: Pick<World, "slowFromBeat" | "slowToBeat" | "beat">,
  s: SceneState,
): boolean {
  return instarActing(s) && slowing(world);
}

export function drawInstarMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SceneState,
  sway: Sway,
  beat: number,
  beatPhase: number,
  time: number,
  role: ViewRole,
  verdicts: { at(key: number): GripVerdict | null },
): void {
  const step = instarStep(s);
  if (step === null || !instarMarksUp(world, s)) return;
  const cfg = world.cfg;
  const r = instarMarkRadius(l, cfg);
  const awaited = instarAwaited(s, cfg, beat, beatPhase);
  // How far the window has run moves a swept mark.
  const along = instarThreat(s, beat, beatPhase);
  // Beside the ring, clear of the window ring at its widest.
  const off = r * MARK_WORD_OFF;
  const rooms = step.marks.map((m) => markRoom(l, cfg, m, sway, along, off));
  step.marks.forEach((mark, i) => {
    const at = instarMarkPoint(l, mark, sway, along);
    const mine = instarMarkIsMine(role, mark.seat);
    // Away from the middle, and never over the step's other marks.
    const below = mark.gesture === "shoot";
    const room = { own: rooms[i] as MarkRoom, avoid: rooms.filter((_, j) => j !== i), below };
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
      // A pull, a swipe or a turn of its own seat says nothing (`asksGrab`),
      // nor a hold (`saysHold`) or a tap (`saysTap`); the partner's mark still names whose it is.
      const says = (kind === undefined || !asksGrab({ kind })) && !saysHold(word) && !saysTap(word);
      if (instarMarkPulls(mark.gesture)) {
        // The PULL LAB's knob and channel, and the window round where it is grabbed (`instar-pull.ts`).
        if (mine) drawMarkHalo(ctx, at.x, at.y, r, time);
        const key = `instar:${s.cursor}:${i}`;
        drawInstarPull(ctx, l, cfg, mark, at, { mine, held, share: along, time, key });
        if (!mine) drawMarkTheirs(ctx, at.x, at.y, r, time);
        if (!mine) drawMarkWait(ctx, at.x, at.y, r, time);
        if (says) drawInstarWord(ctx, l, word, at.x + side * off, at.y, side, mine, kind, room);
        drawVerdict(ctx, verdicts, i, at.x, at.y, r);
        return;
      }
      // A shoot mark's light is the part's own red glow (`instar-weak.ts`), not a halo over it.
      if (mine && mark.gesture !== "shoot") drawMarkHalo(ctx, at.x, at.y, r, time);
      // A hold is the HOLD LAB's drop, filling as the beats are held (`soak-hold.ts`),
      // and a tap THE PRESS LAB's, a terrace a tap (`press-drop.ts`).
      const drop = mark.gesture === "hold" || mark.gesture === "tap";
      if (mark.gesture === "hold") {
        drawSoakHold(ctx, at, r, { time, held, fill: along, theirs: !mine });
      } else if (mark.gesture === "tap") {
        const done = s.progress[i] ?? 0;
        drawPressDrop(ctx, at, r, { time, times: mark.need, done, theirs: !mine });
      } else drawInstarRing(ctx, at.x, at.y, r, mark, mine, held, along, time, awaited);
      if (!mine) drawMarkTheirs(ctx, at.x, at.y, r, time);
      if (drop && !mine) drawMarkWait(ctx, at.x, at.y, r, time);
      if (says) drawInstarWord(ctx, l, word, at.x + side * off, at.y, side, mine, kind, room);
    }
    drawVerdict(ctx, verdicts, i, at.x, at.y, r);
  });
}

/** The room a mark takes this frame: its ring, or a pull's whole channel, and
 * `off` round it — what a word beside another mark may not cover. */
function markRoom(
  l: Layout,
  cfg: SimConfig,
  mark: SceneMark,
  sway: { xMilli: number; yMilli: number },
  along: number,
  off: number,
): MarkRoom {
  const at = instarMarkPoint(l, mark, sway, along);
  return padded(instarPullSpan(l, cfg, mark, at), off);
}

/** A box `pad` out round `span` on every side. */
function padded(span: MarkRoom, pad: number): MarkRoom {
  return {
    left: span.left - pad,
    right: span.right + pad,
    top: span.top - pad,
    bottom: span.bottom + pad,
  };
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
