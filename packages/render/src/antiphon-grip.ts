import {
  type AntiphonState,
  antiphonExplainer,
  antiphonHeld,
  antiphonOrganAsks,
  type SimConfig,
} from "@neon-spore/sim";
import { antiphonOrganCircle } from "./antiphon-shape.js";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { PALETTE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsAntiphonOrgan } from "./view-role-clocks-b.js";

/**
 * **THE ANTIPHON's first handle: the organ, on the screen it is shown on.**
 *
 * The design's *turn under a hand* (§11.31): a thumb resting on the organ
 * turns it slowly in place, a whole turn in `antiphonTurnBeats`, and it
 * stops the moment the thumb lifts. `antiphonOrgan` is one `DragTarget`
 * and a `drag` on it from either seat is that seat's thumb on the glass
 * (`sim/antiphon-hand.ts`), the way THE SURGE's bulb is — but where the bulb
 * is on both screens, the organ is on one: the chooser sees the rail and
 * nothing to hold there, so on that screen the hit test answers nothing and
 * a thumb there falls through, exactly as if no organ stood.
 *
 * The turn is not a receipt: it changes no window, sinks no organ, names no
 * shape. It is the explainer's way of *looking* — every candidate on the rail
 * faces one way, and an organ turned a little may show its lobes where the
 * rail's decoys hide theirs — and the picture of the organ turning is the
 * only thing the mechanism draws. The hit test is the organ's circle at
 * rest, never the breathing contour; whether the organ *takes* the thumb —
 * not once the body is down — is the simulation's to refuse.
 *
 * What is drawn is a **grip mark** on the organ's lower flank, held while
 * either thumb is on, and the word under it while none is — and, while it
 * is asked (`antiphonOrganAsks`), the halo every asked mark wears under it
 * (`antiphon-marks.ts`). The turn has no verdict: it answers nothing.
 */

/** Where the mark sits, as a share of the organ's radius down from its middle. */
const GRIP_DOWN = 0.45;
/** How big the mark is, in handle radii. */
const GRIP_R = 0.6;
/**
 * The press: anywhere on a standing organ, on a screen that shows one.
 * `bossOf(field, "antiphon")` is `null` on every wave without the boss, and a press
 * then falls through to whatever is behind it.
 */
export function antiphonOrganUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "antiphon");
  if (s === null || s.organ === null || !showsAntiphonOrgan(l.role, s)) return null;
  if (!hitCircle(antiphonOrganCircle(l, field.cfg), x, y)) return null;
  const target = "antiphonOrgan";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
  };
}

/** The grip mark on the standing organ, held while a thumb is on, with the word under it while none is. */
export function drawAntiphonGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  time: number,
  fade: number,
): void {
  if (fade < 1) return;
  const held = antiphonHeld(s, 1) || antiphonHeld(s, 2);
  const asked = antiphonOrganAsks(s);
  const r = handleRadius(l, cfg) * GRIP_R;
  const c = antiphonOrganCircle(l, cfg);
  const y = c.y + c.r * GRIP_DOWN;
  if (asked) drawMarkHalo(ctx, c.x, y, r, time);
  drawHandleRing(ctx, {
    x: c.x,
    y,
    r,
    hex: PALETTE.rock,
    rim: PALETTE.text,
    held,
    pull: 0,
    time,
  });
  if (held) return;
  // **The cue** (`decisions.md` #34, `boss-cue-text.ts`). The seat is the
  // explainer's: the organ stands on their screen and the test screen alone
  // (`showsAntiphonOrgan`), and `cueSeen` says so a second time rather than
  // trusting the caller — a word on the phone whose thumb the game refuses
  // is worse than none. It names no candidate: the turn is how the explainer
  // *looks*, it answers nothing, and the answer is on the other screen.
  const cue: BossCue = {
    seat: antiphonExplainer(s),
    kind: "TURN",
    word: "TURN",
    x: c.x,
    y,
    halfW: r,
    halfH: r,
    seed: 64,
    framed: false,
  };
  if (cueSeen(cue, l.role)) drawCueText(ctx, cue, time);
}
