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
  // And the two states the pair's own calls put it in: a jammed valve, a
  // wound band, and the two thumbs on the dial (`gauge-hand.ts`). A device
  // that thinks the valve still answers is a device moving a needle the
  // other one is not.
  push(g.jamBeat);
  push(g.handOn ? 1 : 0);
  push(g.liftBeat);
  push(g.boundBeat);
  push(g.openThumb ? 1 : 0);
  // The shot in the air and the bare rim after a hit: a device that thinks
  // the bolt has landed hears a mark the other has not yet made.
  push(g.shotTick);
  push(g.regrowBeat);
  push(g.woundBeat);
  return out;
}
