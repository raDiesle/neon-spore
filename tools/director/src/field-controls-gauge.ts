import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GAUGE's thumbs on the dial, in a file of their own —
 * `field-controls-page.ts` is at its limit, the split every boss since THE
 * INSTAR has made. They sit together because they are one arrangement: each
 * is a gesture on the picture rather than on the panel, and neither seat can
 * see the other's half of why (`sim/gauge-hand.ts`, `render/gauge-grip.ts`,
 * `docs/spec/interludes.md`). The pilot's needle was the first of them, while
 * the valve was jammed; it went with the jam on 2 October 2026, when a mistake
 * began to lose the round.
 *
 * Each row names **its own state** rather than the phase the two of them live
 * inside: `THE GAUGE · BOUND` and the others are poses on the STATES
 * sheet, reached by a hand that plays the round into them and not by a field
 * written by hand (`poses-bosses-rounds.ts`, `packages/hands/src/boss-hands-gauge.ts`). The first rows
 * pointed at `THE GAUGE · PLAY` until 21 September 2026, which is a picture of
 * the round with neither control drawn on it — a reader following the link
 * found no ring where the row said one stands.
 *
 * THE GAUGE'S TOOTH turns the split round for one rest: it is
 * the pilot's screen that shows which tooth is loose, and the navigator's
 * hand that pulls it (`sim/gauge-tooth.ts`).
 */
export const GAUGE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GAUGE'S BAND",
    where:
      "a ring in the middle of the band, out at the rim, on player 2's " +
      "screen only — where the band is drawn at all — and only while it is " +
      "wound tight; haloed until her thumb is down, and green the moment it lands",
    seat:
      "player 2 only — the navigator, whose marks they are; player 1's press " +
      "falls through, never refused: a refusal would tell him where the band is",
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
    pose: "THE GAUGE · BOUND",
  },
  {
    name: "THE GAUGE'S TOOTH",
    where:
      "a ring on every tooth still in the rim, on player 2's screen only, and " +
      "only in the rest after the first level while a tooth is loose; which " +
      "one is loose shows on player 1's screen alone, wobbling",
    seat:
      "player 2 only — the navigator pulls; player 1's press falls through, " +
      "never refused: he has no hand on the teeth, only the count",
    gesture: "grab and drag",
    does:
      "Pulls a tooth out of the rim: the press names the tooth and a drag of " +
      "gaugeToothPullMilli takes it. The loose one ends the rest early, after " +
      "the ordinary regrow; any other comes out anyway and loses the round, " +
      "and a rest of gaugeToothBeats that runs out with the " +
      "loose one still in costs the same (sim/gauge-tooth.ts).",
    source: "touch.ts — gaugeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gaugeTooth",
    sends: ["drag"],
    pose: "THE GAUGE · LOOSE",
  },
  {
    name: "THE GAUGE'S TONGUE",
    where:
      "a ring on each side of the tongue, on both screens, only in the rest " +
      "after the second level while the tongue is out",
    seat: "both — each seat wrings its own half, and neither half does anything alone",
    gesture: "grab and drag",
    does:
      "Twists the tongue: each press carries its drag across as a twist of its " +
      "own half. When both hands are on it and have dragged opposite ways by " +
      "gaugeTongueTwistMilli or more, it is wrung, and the rest ends early " +
      "after the ordinary regrow; the same way round wrings nothing, and a " +
      "rest of gaugeTongueBeats that runs out with the tongue still out loses " +
      "the round (sim/gauge-tongue.ts).",
    source: "touch.ts — gaugeGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gaugeTongue",
    sends: ["drag"],
    pose: "THE GAUGE · TWISTING",
  },
];
