import { drawPullKnob, PALETTE, pullTrackPoint, smoothstep } from "@neon-spore/render";
import { drawVerdictRing } from "../../../packages/render/src/grip-verdict.js";
import { drawMarkTheirs } from "../../../packages/render/src/mark-feedback.js";
import type { ComboRule, ThumbStep } from "./combo-kinds.js";
import { scriptedThumb } from "./combo-kinds.js";
import { PARTNER_TRACK } from "./combo-lab-rule.js";
import { viewOf } from "./hold-goo/view.js";
import { drawHoldClock } from "./hold-goo/wait.js";
import {
  BEAT_SECONDS,
  freshHold,
  HOLD_AT,
  HOLD_R,
  type HoldAsk,
  type LabHold,
  lift,
  move,
  press,
  tick,
} from "./hold-lab-rule.js";
import { LAB_KNOB, LAB_TILE, LAB_W } from "./pull-lab-shapes.js";

/**
 * **HOLD WHILE THE PARTNER WORKS**, in THE COMBO LAB: this thumb holds a mark
 * — the HOLD LAB's own rule and look (`hold-lab-rule.ts`) — and the partner,
 * the lab's hand, does their part only while it is down: **pulls** their knob
 * the whole way (THE LAMPREY's head, its tail held in a `pull`), or **taps**
 * their mark three times (the lit tooth, the tail held in a `teeth`). The
 * hold is counted the moment the partner is done; let go before, it is
 * refused, red, and what the partner had done is lost with it.
 *
 * The partner's part is drawn as the game draws a partner's: the knob dim,
 * with no arrow and no channel; the mark with the turning ring that says
 * someone else is being waited on (`drawMarkTheirs`), and a verdict ring a tap.
 * The mark wears the waiting clock on its shoulder from the moment it is up,
 * before the thumb is on it, as every hold does.
 */

type Partner = "pull" | "tap";

interface HoldPartner {
  hold: LabHold;
  /** Seconds this hold has been down, and the partner's share done when it was let go. */
  held: number;
  lost: number;
}

/** The partner comes in half a second after the hold is on, and pulls for 1.6 s or taps every 0.45 s. */
const WAKES = 0.5;
const PULLS = 1.6;
const TAPS = 3;
const TAP_EVERY = 0.45;
/** Seconds what the partner had done drains away after a refusal. */
const DRAIN = 0.5;
/** Never counted by the beats: the partner counts it. */
const FOREVER: HoldAsk = { key: "partner", label: "", beats: 1e6 };
/** The partner's mark, for a tap: right of the hold, a little higher. */
const TAP_AT = { x: LAB_W * 0.72, y: LAB_TILE * 4 };

const span = (p: Partner): number => WAKES + (p === "pull" ? PULLS : TAPS * TAP_EVERY);

/** How much of their part the partner has done, 0..1. */
function done(p: Partner, s: HoldPartner): number {
  const h = s.hold;
  if (h.phase === "done") return 1;
  if (h.phase === "held") {
    const t = Math.max(0, s.held - WAKES);
    return p === "pull" ? Math.min(1, t / PULLS) : Math.min(TAPS, Math.floor(t / TAP_EVERY)) / TAPS;
  }
  const failed = h.last === "refused" || h.last === "slipped";
  return failed ? s.lost * Math.max(0, 1 - h.age / DRAIN) : 0;
}

function count(s: HoldPartner): void {
  const h = s.hold;
  h.phase = "done";
  h.fill = 1;
  h.verdict = "counted";
  h.last = "counted";
  h.since = 0;
  h.age = 0;
  h.from = { fill: 1, off: { ...h.off } };
  h.counted++;
  h.waiting = true;
}

function paintPartner(
  ctx: CanvasRenderingContext2D,
  p: Partner,
  s: HoldPartner,
  time: number,
): void {
  const share = done(p, s);
  if (p === "pull") {
    const at = pullTrackPoint(PARTNER_TRACK, share);
    const pulling = s.hold.phase === "held" && s.held > WAKES;
    drawPullKnob(ctx, { x: at.x, y: at.y }, LAB_KNOB, {
      hex: PALETTE.dim,
      rim: PALETTE.rock,
      held: pulling || s.hold.phase === "done",
      time,
      way: null,
      theirs: true,
    });
    return;
  }
  const r = LAB_KNOB * 1.2;
  drawMarkTheirs(ctx, TAP_AT.x, TAP_AT.y, r, time);
  if (s.hold.phase !== "held") return;
  // A flash on the partner's mark for every tap, as the game greens a tap.
  const t = Math.max(0, s.held - WAKES);
  const taps = Math.min(TAPS, Math.floor(t / TAP_EVERY));
  if (taps > 0)
    drawVerdictRing(ctx, TAP_AT.x, TAP_AT.y, r, { good: true, age: t - taps * TAP_EVERY });
}

/** AUTO: one hold to the end of the partner's part, one let go halfway, over and over. */
function loopOf(p: Partner): ThumbStep[] {
  const T = span(p);
  const at = HOLD_AT;
  return [
    { until: 0.8, down: false, to: at },
    { until: 0.8 + T + 0.4, down: true, to: at },
    { until: 2.4 + T, down: false, to: at },
    { until: 2.4 + T + WAKES + (T - WAKES) * 0.5, down: true, to: at },
    { until: 4.2 + T * 1.5, down: false, to: at },
  ];
}

function holdPartner(p: Partner): ComboRule<HoldPartner> {
  const steps = loopOf(p);
  const ask: HoldAsk = {
    key: p,
    label: "",
    beats: Math.max(1, Math.round(span(p) / BEAT_SECONDS)),
  };
  return {
    key: p === "pull" ? "holdpull" : "holdtap",
    label: p === "pull" ? "HOLD WHILE THE PARTNER PULLS" : "HOLD WHILE THE PARTNER TAPS",
    kind: "held",
    says:
      p === "pull"
        ? "a mark held until the partner has pulled theirs the whole way"
        : "a mark held until the partner has tapped theirs three times",
    like:
      p === "pull"
        ? "THE LAMPREY's tail in a pull, held while the head is pulled off its tile"
        : "THE LAMPREY's tail in a teeth, held while the lit tooth is tapped",
    fresh: () => ({ hold: freshHold(), held: 0, lost: 0 }),
    press(s, at) {
      if (press(s.hold, at)) s.held = 0;
    },
    move(s, at) {
      const share = done(p, s);
      move(s.hold, at);
      if (s.hold.phase === "idle") s.lost = share;
    },
    lift(s) {
      const share = done(p, s);
      lift(s.hold);
      s.lost = share;
    },
    tick(s, dt) {
      tick(s.hold, FOREVER, dt);
      if (s.hold.phase !== "held") return;
      s.held += dt;
      s.hold.fill = done(p, s);
      if (s.hold.fill >= 1) count(s);
    },
    paint(ctx, s, look, time) {
      paintPartner(ctx, p, s, time);
      ctx.save();
      look.paint({ ...viewOf(ctx, s.hold, ask, time), r: HOLD_R });
      ctx.restore();
      if (!s.hold.waiting) drawHoldClock(ctx, HOLD_AT, HOLD_R, 1, time);
    },
    state(s) {
      const h = s.hold;
      if (h.verdict === "counted") return "COUNTED";
      if (h.verdict === "refused") return "LET GO EARLY · REFUSED";
      if (h.verdict === "slipped") return "OFF THE MARK";
      return h.phase === "held" ? "HOLDING · THE PARTNER WORKS" : "WAITING";
    },
    tally: (s) => ({ counted: s.hold.counted, refused: s.hold.refused, strayed: s.hold.slipped }),
    thumb: (t) => scriptedThumb(steps, t, smoothstep),
    loop: steps[steps.length - 1]?.until ?? 1,
  };
}

export const HOLD_PULL = holdPartner("pull");
export const HOLD_TAP = holdPartner("tap");
