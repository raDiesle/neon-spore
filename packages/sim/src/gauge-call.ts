import type { GaugeState } from "./gauge.js";
import { drawBand, gaugeHits, gaugeWoundOpen } from "./gauge-band.js";
import { gaugeSettling } from "./gauge-hand.js";
import { gaugeLevelUp } from "./gauge-level.js";
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
  // **Refused rather than missed**, four times: while a shot is still in the
  // air, while the rim is bare between two wounds, while her own thumb is
  // holding the band open, and while his needle is still settling from his
  // hand. Each is the round asking for something else at that moment, and a
  // miss would charge her for a state one of them is in the middle of leaving.
  if (gauge.shotTick !== -1 || !gaugeWoundOpen(gauge)) return;
  if (gauge.openThumb || gaugeSettling(world.cfg, gauge, world.beat)) return;

  gauge.calledBeat = world.beat;
  gauge.calledMilli = gauge.needleMilli;
  gauge.calledGood = false;
  gauge.calledColor = color;
  gauge.calledTick = world.tick;
  gauge.shotTick = world.tick + world.cfg.gaugeShotTicks;
}

/**
 * **The bolt reaches the rim**, and the call is judged there: along the line
 * the cannon stood on when she fired, against the wound as it is now — which
 * is the wound she fired at, because a band with a shot on its way to it does
 * not walk (`stepGauge`). The owner, 29 September 2026: *first shot must reach
 * the coloured area, and then destroyed if correct colour*.
 */
export function gaugeShotLands(world: World, gauge: GaugeState): void {
  gauge.shotTick = -1;
  const good =
    gaugeHits(world.cfg, gauge, gauge.calledMilli) && gauge.calledColor === gauge.woundColor;
  gauge.calledGood = good;
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
  // The mark that finishes a level opens the next after a longer rest, free of
  // the bind (`gauge-level.ts`).
  if (gaugeLevelUp(world, gauge)) return;
  // Every other mark winds the band tight, and the one after it lets it go:
  // the round alternates between the two states rather than ending in one.
  gauge.boundBeat = gauge.marks % world.cfg.gaugeBindMarks === 0 ? world.beat : -1;
  if (gauge.boundBeat !== -1) world.events.push({ type: "gaugeBind" });
  // A mark spends the wound it was made on. The rim stands bare for a break
  // first — the burst is seen, and the pair knows the next one is coming —
  // and the next opens somewhere else, in a colour of its own.
  gauge.regrowBeat = world.beat + world.cfg.gaugeRegrowBeats;
}

/** On the beat: a bare rim whose break is over opens its next wound. */
export function gaugeWoundRegrows(world: World, gauge: GaugeState): void {
  if (gaugeWoundOpen(gauge) || world.beat < gauge.regrowBeat) return;
  gauge.regrowBeat = -1;
  drawBand(world, gauge);
}
