import { bellowsChamberCol, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { bellowsCentre } from "./bellows-shape.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE BELLOWS leaves behind a frame: the **shudder** of the ribs when a
 * handle is worked out of turn and both jam, the **jolt** of the whole lung
 * dropping in its mounting as a seam lets go, the **glare** of the held
 * breath going out across the field, and the bursts its sixteen receipts
 * throw.
 *
 * Everything else — how far each chamber is drawn out, how many seams the
 * waist has, how deep a thumb has its handle — is read off the boss every
 * frame (`bellows-draw.ts`, `bellows-pose.ts`). These three are here for THE
 * GIMBAL's reason: a jam is one tick in the simulation, and a lung that
 * simply stopped moving on the next frame would be a rule being enforced
 * rather than something seizing under two hands.
 *
 * **The events of this family are read here, above the loop**, the way THE
 * GIMBAL's and THE FILAMENT's are, rather than as rows in a spark table at
 * its limit (`effects-spark-silent-boss-b.ts` keeps the rows, for the reason
 * written over them). **A thing a seat did bursts over that seat's own
 * chamber** and a thing the lung did bursts at the waist — the same rule the
 * sounds pan by, so the picture and the ear agree about whose beat it was
 * (`audio/bind-bellows.ts`). Everything is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 */

const SHUDDER_DECAY = 6;
const JOLT_TILES = 0.18;
const JOLT_DECAY = 8;
const GLARE_DECAY = 3;

export class BellowsFx {
  private shudderNow = 0;
  private joltNow = 0;
  private glareNow = 0;

  /** How hard the ribs are shaking after a jam, 0..1. */
  get shudder(): number {
    return this.shudderNow;
  }

  /** How far the lung is thrown down in its mounting right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How much the vented breath is washing the frame, 0..1. */
  get glare(): number {
    return this.glareNow;
  }

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const mid = bellowsCentre(l, cfg);
    const over = (player: 1 | 2): number => fieldX(l, bellowsChamberCol(cfg, player));
    for (const e of events) {
      switch (e.type) {
        case "bellowsEnter":
          burst(mid.x, mid.y, 14, PALETTE.rock);
          break;
        // The marks lighting is the quietest of the sixteen on purpose: the
        // handles are drawn glowing, and a burst over them would be a second
        // thing saying the same at the moment the pair has to start talking.
        case "bellowsMarks":
          burst(mid.x, mid.y, 4, PALETTE.rock);
          break;
        case "bellowsGrip":
          burst(over(e.player), mid.y, 4, PALETTE.rock);
          break;
        case "bellowsPulled":
          burst(over(1), mid.y, 8, PALETTE.wispRim);
          break;
        case "bellowsSeam":
          burst(mid.x, mid.y, 16, PALETTE.wispRim);
          this.joltNow = JOLT_TILES;
          break;
        // The jam bursts over the seat that caused it, which is the one thing
        // the pair has to work out and the one thing the event carries.
        case "bellowsJam":
          burst(over(e.player), mid.y, 10, PALETTE.rockDark);
          this.shudderNow = 1;
          break;
        case "bellowsLate":
          burst(mid.x, mid.y, 8, PALETTE.rockDark);
          this.shudderNow = 1;
          break;
        // The two hazards, each thrown where it will have to be answered: the
        // spark at the gap it leaks from, the hull strike at the hull.
        case "bellowsSpark":
          burst(mid.x, mid.y, 10, PALETTE.ember);
          break;
        case "bellowsSparkOut":
          burst(fieldX(l, e.col), mid.y, 12, PALETTE.emberRim);
          break;
        case "bellowsSparkHit":
          burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.joltNow = JOLT_TILES;
          break;
        case "bellowsBreath":
          burst(fieldX(l, e.col), mid.y, 14, PALETTE.wisp);
          break;
        case "bellowsGlow":
          burst(over(1), mid.y, 6, PALETTE.wispRim);
          burst(over(2), mid.y, 6, PALETTE.wispRim);
          break;
        // The finale's three: the waist letting go, the one handle held too
        // long, and the breath going out of the whole thing.
        case "bellowsSplit":
          burst(mid.x, mid.y, 26, PALETTE.wispRim);
          this.joltNow = JOLT_TILES * 1.6;
          break;
        case "bellowsHold":
          burst(mid.x, mid.y, 6, PALETTE.rockDark);
          this.shudderNow = 0.6;
          break;
        case "bellowsVent":
          burst(mid.x, mid.y, 30, PALETTE.wisp);
          this.glareNow = 1;
          break;
        case "bellowsOut":
          burst(mid.x, mid.y, 18, PALETTE.wisp);
          break;
        default:
          break;
      }
    }
  }

  /** The ribs stilled, the mounting settled, the vent gone off the frame. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.shudderNow = Math.max(0, this.shudderNow - this.shudderNow * SHUDDER_DECAY * step);
    if (this.shudderNow < 0.002) this.shudderNow = 0;
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.glareNow = Math.max(0, this.glareNow - this.glareNow * GLARE_DECAY * step);
    if (this.glareNow < 0.002) this.glareNow = 0;
  }

  clear(): void {
    this.shudderNow = 0;
    this.joltNow = 0;
    this.glareNow = 0;
  }
}
