import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE PULSE's bar**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * Two rows on one target, which is `field-controls-mirror.ts`' arrangement and
 * `field-controls-well.ts`' argument: one handle read two ways by the state it
 * is taken in, so the pair learn one place and two sentences. What is unusual
 * here is that the second reading needs **both** of them on it at once — the
 * only control in the game that is worth nothing from one seat and everything
 * from two (`sim/pulse-hand.ts`).
 *
 * It is also the only row on this tab for an **interlude**. The no-travel rule
 * does not reach a round (`docs/decisions.md` #21) and neither does the field:
 * there is no hull under this bar and nothing falling behind it. It is on this
 * tab all the same, because the tab is the list of what `touch.ts` answers
 * above the band, and this is answered there (`render/pulse-grip.ts`).
 *
 * **The rule shipped first and the picture came after.** The wave's own guide
 * has said *Bar low: a thumb on it carries them* since the round landed, over
 * a bar with nothing on it to take hold of — which is why there was no row
 * here and `on-field-controls.test.ts` had `pulseMeter` filed as `unbuilt`.
 */
export const PULSE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE PULSE'S BRACE",
    where:
      "on the meter itself, across the top of both screens, and only once it " +
      "has dropped under pulseFlutterMilli — the bar grows a dashed box a " +
      "handle's height round it, and the end nearest each seat lights while " +
      "that seat is holding",
    seat: "either, and one at a time — whichever of them can best afford to stop playing",
    gesture: "hold",
    does:
      "Takes this seat out of the song and puts it behind the other one. " +
      "While the thumb is down its own arrows are passed over rather than " +
      "missed and nothing it presses counts, and the seat still playing pays " +
      "pulseBracePermille of a miss instead of all of it (sim/pulse-hand.ts). " +
      "So it is never worse than not bracing — what it costs is notes that " +
      "seat was not going to be judged on either way — and the whole question " +
      "is which of them is reading their half well enough to carry both. It " +
      "is refused on a steady bar, which is why the box is not drawn on one: " +
      "a control offered where the rule drops it is the thing this tab " +
      "exists to prevent (render/pulse-grip.ts).",
    source: "touch.ts — pulseMeterUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "pulseMeter",
    sends: ["drag"],
    pose: "THE PULSE · FLUTTER",
  },
  {
    name: "THE PULSE'S ARREST",
    where:
      "the same box on the same bar, gone red, once the meter is under " +
      "pulseArrestMilli — with one thumb on it the word under the bar reads " +
      "BOTH, and with two it reads HELD",
    seat: "both at once, and nothing at all from one",
    gesture: "hold",
    does:
      "Puts pulseArrestGainMilli a beat back into the meter, on the beat and " +
      "never on the tick, and only while both thumbs are down and neither of " +
      "them is hitting an arrow. It is capped at pulseFlutterMilli: holding " +
      "the bar buys the stage back out of danger and never fills it, so the " +
      "song is still the only thing that can (sim/pulse-hand.ts). A bar spent " +
      "saving the meter is a bar of arrows missed by both of them, so the " +
      "pair have to agree out loud on which bar to spend — which is THE " +
      "INSTAR's together means together arriving in a round. One thumb here " +
      "buys the brace above and nothing else.",
    source: "touch.ts — pulseMeterUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "pulseMeter",
    sends: ["drag"],
    pose: "THE PULSE · ARREST",
  },
];
