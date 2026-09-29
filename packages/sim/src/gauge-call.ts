import { type GaugeState, gaugeSeated } from "./gauge.js";
import { drawBand } from "./gauge-band.js";
import { gaugeSettling } from "./gauge-hand.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **The navigator's call**: the one thing in THE GAUGE that can be wrong.
 *
 * Out of `gauge.ts` when the call learned its colour and that file reached its
 * limit. The owner, 27 September 2026, answering whether the wound's colour
 * should stay a picture: *a rule*. So her panel is the ship's two fire
 * buttons, red and cyan, and the wound is one or the other, drawn with the
 * band (`drawBand`). A call lands when the needle is between the marks **and**
 * it went out in the wound's colour; anything else is a miss, and a miss jams
 * the valve. The colour is hers to read — his screen has no wound on it — so
 * it adds nothing for him to say and one more thing for her to get right.
 *
 * A call also reports itself, in `events-gauge.ts`: `gaugeMark` or
 * `gaugeMiss`, and `gaugeJam` or `gaugeBind` beside it when the same call
 * sticks the valve or winds the band. Both of the second pair are facts about
 * the *other* seat's half, which is exactly why an ear says them faster than
 * an eye finding the other screen could (`docs/queue.md`, 19 September 2026).
 */
export function gaugeCalled(world: World, gauge: GaugeState, color: Color): void {
  // Two calls in a row cost the rest between them whether the first landed or
  // not, so a thumb held on the button is slower than a pair who talk.
  if (world.beat - gauge.calledBeat < world.cfg.gaugeCallRestBeats) return;
  // **Refused rather than missed**, twice: while her own thumb is holding the
  // band open, and while his needle is still settling from his hand. Both are
  // the round asking for something else at that moment, and a miss would
  // charge her for a state one of them is in the middle of leaving — the
  // rest between calls would run as well, so a pair doing exactly what the
  // round asked would be slowed for it.
  if (gauge.openThumb || gaugeSettling(world.cfg, gauge, world.beat)) return;

  const good = gaugeSeated(world, gauge) && color === gauge.woundColor;
  gauge.calledBeat = world.beat;
  gauge.calledMilli = gauge.needleMilli;
  gauge.calledGood = good;
  gauge.calledColor = color;
  gauge.calledTick = world.tick;
  if (!good) {
    gauge.misses += 1;
    // And the valve sticks. A miss is the one thing in this round that was
    // free — time, and the pair was going to spend that anyway — so what it
    // costs now is the control itself, until the next call lands.
    gauge.jamBeat = world.beat;
    world.events.push({ type: "gaugeMiss" });
    world.events.push({ type: "gaugeJam" });
    return;
  }
  gauge.marks += 1;
  gauge.jamBeat = -1;
  world.events.push({ type: "gaugeMark" });
  // Every other mark winds the band tight, and the one after it lets it go:
  // the round alternates between the two states rather than ending in one.
  gauge.boundBeat = gauge.marks % world.cfg.gaugeBindMarks === 0 ? world.beat : -1;
  if (gauge.boundBeat !== -1) world.events.push({ type: "gaugeBind" });
  // A mark spends the band it was made on: the next one is somewhere else, in
  // a colour of its own, and the pair has to find it again from words alone.
  drawBand(world, gauge);
}
