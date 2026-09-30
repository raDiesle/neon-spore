import type { GaugeState } from "./gauge.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GAUGE's tongue**, in the rest after the second level. The owner, 30
 * September 2026: *or to rotate the tongue that it gets twisted by both
 * players*.
 *
 * The tooth's rest is his eyes and her hand (`gauge-tooth.ts`); this one is
 * both hands and no secret. The tongue lolls out of the mouth on both screens,
 * each has a hold on it, and it twists only while the two are wrung opposite
 * ways at once — his thumb dragged one way, hers the other, each at least
 * `gaugeTongueTwistMilli`. A hand let go unwinds its own half, so neither can
 * wind it and wait: the pair has to count *three, two, one* and pull
 * together. What the round says with it is the one thing the rest of it
 * never needs — the same moment, on both seats.
 *
 * The rest is `gaugeTongueBeats` long. A twist ends it early, as the right
 * tooth does; a rest that runs out with the tongue still out jams the valve
 * for the level it opens onto, as the tooth's lapse does. Nothing is drawn
 * from the rng: there is nothing here one of them knows and the other does
 * not.
 */

/** The level whose rest the tongue comes out in: after the second. Choreography, not tuning. */
export const GAUGE_TONGUE_LEVEL = 2;

/** Whether the tongue is out and not yet twisted. */
export function gaugeTongueOut(g: GaugeState): boolean {
  return g.tongueOut;
}

/** Whether a hand on the tongue would be heard now. */
export function gaugeTongueAsks(g: GaugeState): boolean {
  return g.phase === "play" && g.tongueOut;
}

/** From `gaugeLevelUp`: the rest after the second level is the tongue's. */
export function gaugeLoosenTongue(world: World, g: GaugeState): void {
  if (g.level !== GAUGE_TONGUE_LEVEL) return;
  g.tongueOut = true;
  releaseTongue(g);
  g.levelBeat = world.beat + world.cfg.gaugeTongueBeats;
  g.regrowBeat = g.levelBeat;
}

/** On the beat: a rest that ran out with the tongue still out jams the valve. */
export function gaugeTongueLapses(world: World, g: GaugeState): void {
  if (!g.tongueOut || world.beat < g.levelBeat) return;
  g.tongueOut = false;
  releaseTongue(g);
  g.jamBeat = world.beat;
  world.events.push({ type: "gaugeJam" });
}

/**
 * One hand on the tongue, either seat's. `fromMilli` is how far that thumb
 * has dragged across since it took hold, signed; the two only twist it wrung
 * opposite ways.
 */
export function gaugeTongueHeard(
  world: World,
  g: GaugeState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (!gaugeTongueAsks(g)) return;
  const bit = player === 1 ? 1 : 2;
  if (!command.on) {
    // Let go, and that half unwinds.
    g.tongueHolds &= ~bit;
    if (player === 1) g.tongueP1Milli = 0;
    else g.tongueP2Milli = 0;
    return;
  }
  if ((g.tongueHolds & bit) === 0) {
    g.tongueHolds |= bit;
    world.events.push({ type: "gaugeHold", part: "tongue" });
  }
  if (player === 1) g.tongueP1Milli = command.fromMilli;
  else g.tongueP2Milli = command.fromMilli;
  if (twisted(world, g)) twist(world, g);
}

function twisted(world: World, g: GaugeState): boolean {
  if (g.tongueHolds !== 3) return false;
  const a = g.tongueP1Milli;
  const b = g.tongueP2Milli;
  const least = world.cfg.gaugeTongueTwistMilli;
  return a * b < 0 && Math.min(Math.abs(a), Math.abs(b)) >= least;
}

/** Wrung: the tongue goes back in, and the next level comes after a break. */
function twist(world: World, g: GaugeState): void {
  g.tongueOut = false;
  releaseTongue(g);
  world.events.push({ type: "gaugeTwist" });
  const next = Math.min(g.levelBeat, world.beat + world.cfg.gaugeRegrowBeats);
  g.levelBeat = next;
  g.regrowBeat = next;
}

/** Both hands off the tongue, as a phase change takes them (`releaseGaugeHands`). */
export function releaseTongue(g: GaugeState): void {
  g.tongueHolds = 0;
  g.tongueP1Milli = 0;
  g.tongueP2Milli = 0;
}
