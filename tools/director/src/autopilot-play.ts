import {
  bossFromWave,
  controlSet,
  placedFaults,
  podsFromWave,
  queueFromWave,
  type Wave,
} from "@neon-spore/content";
import { computeLayout, type Field } from "@neon-spore/render";
import { PLAY_CHARGE, type SimConfig, step, type World } from "@neon-spore/sim";
import { fresh, POSE_CONFIG } from "./pose-kit.js";
import { stageAutopilot } from "./stage-autopilot.js";
import { stageField } from "./stage-field.js";

/**
 * **AUTO plays a wave out, and every breach it lets through is counted** —
 * the bar `autopilot-field.test.ts` holds every ordinary wave of the game to,
 * and the one the composer holds a wave it is deciding whether to keep to
 * (`compose-check.ts`). One copy, so a wave the composer keeps is one that
 * test passes.
 */

/**
 * **The two charges a hand has to play at**, and every `autopilot-*.test.ts`
 * runs its `describe` under both (`describe.each(CHARGES)`).
 *
 * The director plays at whatever its panel says, nought by default
 * (`POSE_CONFIG`); the game lays every shot over half a beat (`PLAY_CHARGE`,
 * `sim/shot-charge.ts`), so a press leaves on the charge's grid and out of
 * the column the cannon stands in then. A hand that times a shot to a tick is
 * right at one and wrong at the other: THE TRAPEZE's went four for four here
 * and one for ten in the game, and THE JAM's slid the cannon off its runaway
 * shot while it was still in the muzzle (8 October 2026).
 */
export const CHARGES: readonly (readonly [string, Partial<SimConfig>])[] = [
  ["with no charge", {}],
  ["at the game's charge", PLAY_CHARGE],
];

/** A wave stood up the way the game starts it, at `index` in the list, on
 * the poses' config and the charge `cfg` lays a shot over. */
export function standWave(wave: Wave, index: number, cfg: Partial<SimConfig>): World {
  const cols = POSE_CONFIG.cols;
  return fresh(
    queueFromWave(wave, cols),
    podsFromWave(wave, cols),
    bossFromWave(wave, cols),
    cfg,
    index,
    placedFaults(wave.faults),
  );
}

/** AUTO on BOTH until the wave is credited, or the budget is spent, with every
 * breach it let through counted. Scars are not enough: a soundbox discharging
 * breaches the hull and draws no scar (`breachUnscarred`), and the poses'
 * config never fails a wave. */
export function playOut(world: World): { world: World; breaches: number } {
  // The finger AUTO draws is placed on the stage's own layout and field, so
  // the rig is the one `autopilot.test.ts` stands a boss up with.
  const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, world.cfg, "test");
  const field = (seat: 1 | 2): Field =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode("both");
  let breaches = 0;
  for (let i = 0; i < 30_000 && world.balance.wavesCleared === 0; i++) {
    step(world, auto.commands(world));
    breaches += world.events.filter((e) => e.type === "breach").length;
  }
  return { world, breaches };
}

/** Whether AUTO clears the wave with no breach, at both charges. */
export function playsClean(wave: Wave, index: number): boolean {
  return CHARGES.every(([, cfg]) => {
    const { world, breaches } = playOut(standWave(wave, index, cfg));
    return world.balance.wavesCleared === 1 && breaches === 0;
  });
}
