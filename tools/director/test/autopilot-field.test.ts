import { describe, expect, test } from "bun:test";
import { WAVES, type Wave } from "@neon-spore/content";
import type { SimConfig, World } from "@neon-spore/sim";
import { fileCosts } from "../../test/figure.js";
import { playOut, standWave } from "../src/autopilot-play.js";
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

// Every ordinary wave of the game, played out, per charge: about two and a
// half seconds idle at 571 waves (15 October 2026), and it grows with the list.
fileCosts(2500);

/** Wave `index` stood up the way the game starts it. */
const waveWorld = (index: number, cfg: Partial<SimConfig>): World =>
  standWave(WAVES[index] as Wave, index, cfg);

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
