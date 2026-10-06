import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { FlueBeam } from "./flue-beam.js";
import { flueCentre } from "./flue-shape.js";
import { FLUE_STRINGS, flueDroop, flueStringFoot } from "./flue-strings.js";
import { FlueVerdicts } from "./flue-verdicts.js";
import { FlueWord } from "./flue-word.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE FLUE leaves behind a frame: the **flash** at the sight as the
 * ember is met, the **flare** of the level's stud lighting, the red **sting**
 * where a shot was spent on the flue, the **swing** a string cut sets the
 * flue into (`flue-strings.ts`), the plating's shudder as the flue goes
 * cold, and the bursts its other receipts throw.
 *
 * Everything else — where the ember is, which studs are lit, how many shots
 * are left — is read off the boss every frame (`flue-draw.ts`).
 *
 * **Both screens are thrown the same**: the pilot calls and the navigator
 * fires, and each has to see the shot land or not. The burst of a hit is at
 * the sight, where the ember was met; it says nothing the navigator's screen
 * should not know, since the sight is where every hit is.
 *
 * **A level cleared is a step landed**, and deals the flue the blow every
 * boss takes (`boss-hurt.ts`). A shot spent deals nothing to it; the third
 * one's blow at the hull is the boss's own (`flue-blow.ts`). Which shot was
 * right is `verdicts` (`flue-verdicts.ts`); the spore beamed away and back
 * after either is `beam` (`flue-beam.ts`), and MISS stamped under the sight
 * is `word` (`flue-word.ts`). Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How strong the plating's shudder is as the flue goes cold, and how long, in beats. */
const SPENT_FORCE = 0.8;
const SPENT_BEATS = 1.2;
/** How fast a hit's flash, a stud's flare and a miss's sting fade, per second. */
const FLASH_DECAY = 3;
const FLARE_DECAY = 2;
const STING_DECAY = 1.6;
/** The swing a string cut sets going: how fast it dies, per second, and how fast it swings, radians a second. */
const SWING_DAMP = 2.4;
const SWING_RATE = 9;

export class FlueFx {
  private flashNow = 0;
  private flareNow = 0;
  private stingNow = 0;
  private swingFrom = 0;
  private swingAge = 0;
  /** The shudder down the plating as the flue is spent. */
  readonly shock = new HullShock();
  /** The blow a level cleared deals the flue. */
  readonly hurt = new BossHurt();
  /** Was the last shot at the sight right (`flue-verdicts.ts`). */
  readonly verdicts = new FlueVerdicts();
  /** The spore beamed out where a shot met it and back in at the left end (`flue-beam.ts`). */
  readonly beam = new FlueBeam();
  /** MISS and what to change, under the sight (`flue-word.ts`). */
  readonly word = new FlueWord();

  /** How bright the flash at the sight a hit left still is, 0..1. */
  get flash(): number {
    return this.flashNow;
  }

  /** How bright the flare on the stud of the level just cleared still is, 0..1. */
  get flare(): number {
    return this.flareNow;
  }

  /** How sharp the red sting at the sight a shot spent left still is, 0..1 (`flue-sting.ts`). */
  get sting(): number {
    return this.stingNow;
  }

  /**
   * The turn a string just cut adds to how the flue hangs, radians: it starts
   * at the hang the cut left, so the flue falls into its new one and swings
   * past it.
   */
  get swing(): number {
    if (this.swingFrom === 0) return 0;
    return (
      this.swingFrom * Math.exp(-SWING_DAMP * this.swingAge) * Math.cos(SWING_RATE * this.swingAge)
    );
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.verdicts.ingest(events);
    this.beam.ingest(events);
    this.word.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("flue")) continue;
      const mid = flueCentre(l, cfg);
      switch (e.type) {
        case "flueEnter":
          burst(mid.x, mid.y, 12, PALETTE.flueSoot);
          break;
        case "flueLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "flueHit":
          burst(fieldX(l, e.col), mid.y, 16, PALETTE.hullRim);
          this.flashNow = 1;
          this.flareNow = 1;
          this.hurt.hit();
          break;
        case "flueMiss":
          // The shot spent: a hurt, red at the sight (`flue-sting.ts`).
          burst(fieldX(l, e.col), mid.y + 0.4 * l.tile, 10, PALETTE.red);
          this.stingNow = 1;
          this.cut(l, cfg, FLUE_STRINGS - e.shots, burst);
          break;
        case "flueSpent":
          burst(mid.x, mid.y, 24, PALETTE.flueSoot);
          burst(mid.x, mid.y, 10, PALETTE.hullRim);
          this.shock.strike(beatSeconds * SPENT_BEATS, SPENT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  /** String `cut - 1` parting: a spray of red where it held, and the flue let fall into its new hang. */
  private cut(l: Layout, cfg: SimConfig, cut: number, burst: Burst): void {
    if (cut < 1 || cut > FLUE_STRINGS) return;
    const foot = flueStringFoot(l, cfg, cut - 1);
    burst(foot.x, foot.y - 0.6 * l.tile, 8, PALETTE.red);
    this.swingFrom = flueDroop(l, cfg, cut - 1) - flueDroop(l, cfg, cut);
    this.swingAge = 0;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    this.flareNow = Math.max(0, this.flareNow - FLARE_DECAY * step);
    this.stingNow = Math.max(0, this.stingNow - STING_DECAY * step);
    this.swingAge += step;
    if (this.swingAge * SWING_DAMP > 8) this.swingFrom = 0;
    this.shock.update(dt);
    this.hurt.update(dt);
    this.verdicts.update(dt);
    this.beam.update(dt);
    this.word.update(dt);
  }

  clear(): void {
    this.flashNow = 0;
    this.flareNow = 0;
    this.stingNow = 0;
    this.swingFrom = 0;
    this.swingAge = 0;
    this.shock.clear();
    this.hurt.clear();
    this.verdicts.clear();
    this.beam.clear();
    this.word.clear();
  }
}
