import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GAUGE's two thumbs on the dial, in a file of their own —
 * `field-controls-page.ts` is at its limit, the split every boss since THE
 * INSTAR has made. They sit together because they are one arrangement: each
 * is a control the round takes *away* from a seat and hands back as a gesture
 * on the picture, and neither seat can see the other's half of why
 * (`sim/gauge-hand.ts`, `render/gauge-grip.ts`, `docs/spec/interludes.md`).
 *
 * Both rows name `THE GAUGE · PLAY`, which is the phase the two states live
 * inside rather than a picture of either. Neither the jam nor the bind has a
 * pose of its own yet; that is in `docs/queue.md`.
 */
export const GAUGE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GAUGE'S NEEDLE",
    where:
      "a ring on the end of the needle, on player 1's screen only, and only " +
      "while the valve is jammed — nowhere at all while the valve answers",
    seat: "player 1 only — the pilot, whose valve it is; player 2's press falls through",
    gesture: "grab and drag",
    does:
      "Swings the needle by hand while the valve is dead. A miss jams it " +
      "(sim/gauge.ts) and the next call that lands clears it. The turn is a " +
      "bearing about the dial's middle, so the needle goes where the finger " +
      "points rather than walking there — and the press itself says nothing, " +
      "so a thumb that missed its own tip does not move it. What it costs is " +
      "gaugeSettleBeats after the lift, in which her call is refused " +
      "(sim/gauge-hand.ts).",
    source: "touch.ts — gaugeGripUnder() under handleUnder(), turned by turnAbout()",
    holdKind: "drag",
    dragTarget: "gaugeNeedle",
    sends: ["drag"],
    pose: "THE GAUGE · PLAY",
  },
  {
    name: "THE GAUGE'S BAND",
    where:
      "a ring in the middle of the band, out at the rim, on player 2's " +
      "screen only — where the band is drawn at all — and only while it is wound tight",
    seat: "player 2 only — the navigator, whose marks they are",
    gesture: "hold",
    does:
      "Holds the wound band open: every gaugeBindMarks marks it winds to " +
      "gaugeBoundSpanMilli, and her thumb gives the full width back and stops " +
      "it walking for as long as she keeps it there. She cannot call while it " +
      "is down, which is the whole price — the pair has to agree out loud on " +
      "the moment she lets go (sim/gauge-hand.ts, gauge-band.ts).",
    source: "touch.ts — gaugeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gaugeBand",
    sends: ["drag"],
    pose: "THE GAUGE · PLAY",
  },
];
