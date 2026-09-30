import type { GaugeState } from "./gauge.js";
import { nextInt } from "./rng.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GAUGE's loose tooth**: the rest between the first level and the
 * second, spent on a gesture. The owner, 29 September 2026: *add some
 * intermediate choreographed on screen gesture events, e.g. pull teeth out
 * ( p1 needs to tell p2 which one to pull out.)*
 *
 * So the round's split is turned round for one rest. The pilot's screen is
 * the one that shows *which* tooth is loose — it wobbles there and nowhere
 * else — and the navigator's is the one with a hand on the teeth. He counts
 * it out, *fifth from the left*, and she pulls. The right one ends the rest
 * early, after the ordinary break; a wrong one comes out anyway and costs
 * what a miss costs, the valve jammed into the next level. A rest that runs
 * out with the loose tooth still in costs the same.
 *
 * The rest itself is `gaugeToothBeats` long rather than
 * `gaugeLevelRestBeats`, and it is the level's own rest: the next level's
 * clock is held full through it (`gaugeBeatsLeft`) and the rim stands bare,
 * so the pull is the only thing either of them can do.
 *
 * Which level it comes between is choreography, not difficulty — the same
 * argument `GAUGE_PHASES` makes — so it is a constant rather than a field.
 */

/** Teeth round the rim, end to end of the dial. The picture draws this many. */
export const GAUGE_TEETH = 15;

/** The level whose opening rest the tooth comes loose in: after the first. */
export const GAUGE_TOOTH_LEVEL = 1;

/** Whether a tooth is loose and waiting to be pulled. */
export function gaugeToothLoose(gauge: GaugeState): boolean {
  return gauge.looseTooth !== -1;
}

/** Whether the teeth are asked of the navigator's hand: live, and one loose. */
export function gaugeToothAsks(gauge: GaugeState): boolean {
  return gauge.phase === "play" && gaugeToothLoose(gauge);
}

/** Whether tooth `k` is already out. */
export function gaugeToothPulled(gauge: GaugeState, k: number): boolean {
  return (gauge.pulledTeeth & (1 << k)) !== 0;
}

/**
 * On a level up: if this is the level the tooth comes loose in, pick it and
 * stretch the rest to `gaugeToothBeats`. The two teeth at either end are never
 * chosen — half-drawn at the dial's corners, they are not a tooth anyone can
 * count to.
 */
export function gaugeLoosenTooth(world: World, gauge: GaugeState): void {
  if (gauge.level !== GAUGE_TOOTH_LEVEL) return;
  gauge.looseTooth = 1 + nextInt(world.rng, GAUGE_TEETH - 2);
  gauge.levelBeat = world.beat + world.cfg.gaugeToothBeats;
  gauge.regrowBeat = gauge.levelBeat;
}

/**
 * On the beat: a rest that ran out with the tooth still in. It stays in, and
 * the valve is jammed into the level — what a wrong pull costs, because not
 * pulling is the same mistake made slower.
 */
export function gaugeToothLapses(world: World, gauge: GaugeState): void {
  if (!gaugeToothLoose(gauge) || world.beat < gauge.levelBeat) return;
  gauge.looseTooth = -1;
  gauge.jamBeat = world.beat;
  world.events.push({ type: "gaugeJam" });
}

/**
 * Her hand on a tooth. The press names the tooth (`id`); the drag says how far
 * it has been pulled, and a pull past `gaugeToothPullMilli` in any direction
 * takes it out. The pilot has no hand on the teeth — his screen shows which,
 * hers does the pulling, which is the whole of the gesture.
 */
export function gaugeToothHeard(
  world: World,
  gauge: GaugeState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 2 || !gaugeToothAsks(gauge)) return;
  if (!command.on) {
    releaseTooth(gauge);
    return;
  }
  if (gauge.toothHold === -1) {
    const k = command.id ?? -1;
    if (k < 0 || k >= GAUGE_TEETH || gaugeToothPulled(gauge, k)) return;
    gauge.toothHold = k;
    world.events.push({ type: "gaugeHold", part: "tooth" });
  }
  gauge.toothDxMilli = command.fromMilli;
  gauge.toothDyMilli = command.fromYMilli ?? 0;
  const pull = world.cfg.gaugeToothPullMilli;
  const dx = gauge.toothDxMilli;
  const dy = gauge.toothDyMilli;
  if (dx * dx + dy * dy < pull * pull) return;
  pulled(world, gauge, gauge.toothHold);
}

/** A tooth out, the right one or not. */
function pulled(world: World, gauge: GaugeState, k: number): void {
  gauge.pulledTeeth |= 1 << k;
  releaseTooth(gauge);
  if (k !== gauge.looseTooth) {
    // The wrong one comes out all the same, and the loose one is still loose.
    gauge.jamBeat = world.beat;
    world.events.push({ type: "gaugeWrongPull" });
    world.events.push({ type: "gaugeJam" });
    return;
  }
  gauge.looseTooth = -1;
  world.events.push({ type: "gaugePull" });
  // The rest ends early, after the ordinary break a mark leaves.
  const next = Math.min(gauge.levelBeat, world.beat + world.cfg.gaugeRegrowBeats);
  gauge.levelBeat = next;
  gauge.regrowBeat = next;
}

/** Her hand off the teeth, and the tooth it was on back in its socket. */
export function releaseTooth(gauge: GaugeState): void {
  gauge.toothHold = -1;
  gauge.toothDxMilli = 0;
  gauge.toothDyMilli = 0;
}
