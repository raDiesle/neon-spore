import { gaugeShotLands, gaugeWoundRegrows } from "../src/gauge-call.js";
import type { GaugeState, World } from "../src/index.js";

/**
 * **A call's whole answer at once**, for a test that is about what a call
 * *means* rather than how long it takes: the bolt lands this tick, and a wound
 * it shot out opens its successor straight away. The flight and the bare rim
 * are proved on their own in `gauge-flight.test.ts`; everything else keeps the
 * one-press, one-answer shape it was written in.
 */
export function landNow(world: World, g: GaugeState): void {
  if (g.shotTick !== -1) gaugeShotLands(world, g);
  if (g.regrowBeat !== -1) {
    g.regrowBeat = world.beat;
    gaugeWoundRegrows(world, g);
  }
}
