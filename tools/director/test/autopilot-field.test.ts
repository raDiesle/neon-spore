import { describe, expect, test } from "bun:test";
import {
  buildBoss,
  buildPods,
  buildQueue,
  controlSet,
  placedFaults,
  WAVES,
} from "@neon-spore/content";
import { computeLayout, type Field } from "@neon-spore/render";
import { type SimConfig, step, type World } from "@neon-spore/sim";
import { fresh, POSE_CONFIG } from "../src/pose-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays an ordinary wave too**: the cannon and the shield together,
 * fed through `step` the way a thumb's presses are (`packages/hands/src/autopilot-field-hand.ts`).
 * Pinned here: BOTH clears ONE LAST CHANCE, rocks and slimes both, with every
 * rock turned by the dome; and every ordinary wave not named below is cleared
 * with no breach of the hull.
 */

/** Ordinary waves AUTO plays and cannot clear clean, each with its reason.
 * Every creature has its verb answered now — the pods (`autopilot-pod-hand.ts`),
 * THE SHELL, THE LURE and THE WISP (`autopilot-aim.ts`), THE MOULT, THE
 * LIMPET and THE LEECH, THE LID, THE FENCE, THE MAGNET, THE CRYSTAL, THE
 * CHOIR, THE CRAWLER, THE JAM's runaway cannon, and the bodies a finger
 * answers (`autopilot-touch.ts`); THE CLASP and THE STRAND are the field
 * hand's own. A wave that gains a verb is a name here or a hand for it.
 *
 * THE JAM was one until its runaway was placed at beat 7: it used to fire its
 * first shot on the beat its first lure came on over the cannon, which no
 * hand could answer. FIVE BLISTERS was one while AUTO only tapped a blister;
 * it has all five gestures now (`autopilot-blister.ts`). */
const HALF_PLAYED = new Set<string>([]);

/** Wave `index` stood up the way the game starts it, on the poses' config
 * and the charge `cfg` lays a shot over. */
function waveWorld(index: number, cfg: Partial<SimConfig>): World {
  const cols = POSE_CONFIG.cols;
  return fresh(
    buildQueue(index, cols),
    buildPods(index, cols),
    buildBoss(index, cols),
    cfg,
    index,
    placedFaults(WAVES[index]?.faults),
  );
}

/** AUTO on BOTH until the wave is credited, or the budget is spent, with every
 * breach it let through counted. Scars are not enough: a soundbox discharging
 * breaches the hull and draws no scar (`breachUnscarred`), and the poses'
 * config never fails a wave. */
function playOut(world: World): { world: World; breaches: number } {
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

describe.each(CHARGES)("AUTO on a wave with no boss, %s", (_charge, cfg) => {
  test("BOTH clears ONE LAST CHANCE with every rock turned by the dome", () => {
    const index = WAVES.findIndex((w) => w.name === "ONE LAST CHANCE");
    const { world, breaches } = playOut(waveWorld(index, cfg));
    expect(world.balance.wavesCleared).toBe(1);
    expect(world.scars).toEqual([]);
    expect(breaches).toBe(0);
    expect(world.guard.tries).toBeGreaterThan(0);
    expect(world.guard.deflected).toBe(world.guard.tries);
  });

  test("BOTH clears every ordinary wave not named as half played, with no breach", () => {
    const failed: string[] = [];
    WAVES.forEach((wave, index) => {
      if (wave.boss || HALF_PLAYED.has(wave.name)) return;
      const { world, breaches } = playOut(waveWorld(index, cfg));
      if (world.balance.wavesCleared !== 1 || breaches > 0) failed.push(wave.name);
    });
    expect(failed).toEqual([]);
  });
});
