import { GAUGE_PHASES, type GaugeState } from "./gauge.js";

/**
 * THE GAUGE's half of the boss fingerprint (`hash-boss.ts`), in the shape
 * `mazeHashParts` set: a flat list of numbers, in a fixed order. Split out when
 * the wound took a colour (29 September 2026) and the two more numbers took
 * `hash-boss.ts` past its limit.
 */
export function gaugeHashParts(g: GaugeState): number[] {
  const out: number[] = [];
  const push = (n: number): void => {
    out.push(n);
  };
  push(GAUGE_PHASES.indexOf(g.phase));
  push(g.phaseBeat);
  push(g.openBeat);
  push(g.level);
  push(g.levelBeat);
  push(g.passed ? 1 : 0);
  push(g.needleMilli);
  push(g.valve);
  push(g.markMilli);
  push(g.driftDir);
  push(g.marks);
  push(g.misses);
  push(g.calledBeat);
  push(g.calledMilli);
  push(g.calledGood ? 1 : 0);
  push(g.calledTick);
  // The wound's colour and the one the last call went out in: a device
  // that thinks the wound is red hears a cyan call land that the other misses.
  push(g.woundColor === "red" ? 1 : 2);
  push(g.calledColor === "red" ? 1 : 2);
  // And the state the pair's own marks put it in: a wound band, and her
  // thumb on it (`gauge-hand.ts`). A device that thinks the band is held is
  // a device whose band stands still while the other's walks.
  push(g.boundBeat);
  push(g.openThumb ? 1 : 0);
  // The shot in the air and the bare rim after a hit: a device that thinks
  // the bolt has landed hears a mark the other has not yet made.
  push(g.shotTick);
  push(g.regrowBeat);
  push(g.woundBeat);
  // The teeth between two levels: a device that thinks one is still loose,
  // or that a second is, hears a pull land that the other one refuses.
  push(g.looseTooth);
  push(g.pulledTeeth);
  push(g.toothPulls);
  push(g.toothHold);
  push(g.toothDxMilli);
  push(g.toothDyMilli);
  // The tongue after the second: a device that missed one hand on it hears
  // the other twist it alone.
  push(g.tongueOut ? 1 : 0);
  push(g.tongueHolds);
  push(g.tongueP1Milli);
  push(g.tongueP2Milli);
  return out;
}
