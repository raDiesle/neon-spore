import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import type { GripVerdicts } from "./grip-verdict.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type Point, seamCentre } from "./seam-shape.js";
import { SeamMarks, seamGritCircle } from "./seam-verdicts.js";

/**
 * What THE SEAM leaves behind a frame (§26, *Presentation*): the **click**
 * down the plating as a point is shot shut; the grit taken on the shield
 * going off as an ordinary spark there; the **reseal**, the flash down the
 * whole crack as a bolt fired into the dark holds the ridge shut one beat
 * longer (row 16, `sim/seam-step.ts` `seamFiredInto`) — the state says the
 * ridge was held (`held`) but not when; the plating's shudder as the ridge
 * splits; the bursts its other receipts throw; and its marks' verdicts on a
 * touch (`seam-verdicts.ts`).
 *
 * Everything else — how open each point is, the lit point, the grit and the
 * rock in flight — is read off the boss every frame (`seam-draw.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: which seat answers
 * a step is the colour it asks for, and either may take the shield.
 *
 * **A point shot shut is a movement landed** — the three are its health — so
 * it deals the ridge the blow every boss takes (`boss-hurt.ts`); **a point
 * shot that dims, a rock shot out and the glow quenched** are steps answered
 * that seal nothing, and deal the lighter one. A step lighting, a shot into
 * the glow with more wanted, the grit on the shield and the split deal
 * nothing.
 *
 * The events carry no place on the ridge but a column, so the drawer tells
 * the fx every frame where the crack's lit mark and the rock stand
 * (`note`), THE GOVERNOR's way. A step run out and the false point fired at
 * throw nothing here: the hull they break is the seam's own blow
 * (`seam-blow.ts`). Everything is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 */

/** How strong the plating's click is for a sealed point, and the shudder for the split, and how long, in beats. */
const SEAL_FORCE = 0.35;
const SEAL_BEATS = 0.4;
const SPLIT_FORCE = 0.8;
const SPLIT_BEATS = 1.2;
/** How fast the reseal's flash dies, per second. */
const RESEAL_DECAY = 2.5;

export class SeamFx {
  private resealNow = 0;
  private crack: Point = { x: 0, y: 0 };
  private rock: Point | null = null;
  /** The click down the plating as a point seals, and the shudder as the ridge splits. */
  readonly shock = new HullShock();
  /** The blow a sealed point deals the ridge; a dim, a rock shot out and the glow quenched the lighter one. */
  readonly hurt = new BossHurt();
  private readonly said = new SeamMarks();

  /** The crack's, the rock's and the shield's verdicts on a touch. */
  get verdicts(): GripVerdicts {
    return this.said.verdicts;
  }

  /** How bright the reseal's flash still is, 0..1. */
  get reseal(): number {
    return this.resealNow;
  }

  /** The drawer's word for where the crack's lit mark and the rock in flight stand, which the events do not carry. */
  note(crack: Point, rock: Point | null): void {
    this.crack = crack;
    this.rock = rock;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.said.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("seam")) continue;
      const mid = seamCentre(l, cfg);
      switch (e.type) {
        case "seamEnter":
          burst(mid.x, mid.y, 12, PALETTE.rockDark);
          break;
        case "seamSeal":
          // Shot shut: shell grit off the point, and the plating clicks.
          burst(this.crack.x, this.crack.y, 10, PALETTE.rock);
          this.shock.strike(beatSeconds * SEAL_BEATS, SEAL_FORCE);
          this.hurt.hit();
          break;
        case "seamDim":
          burst(this.crack.x, this.crack.y, 4, PALETTE.rock);
          this.hurt.jab();
          break;
        case "seamQuench":
          burst(this.crack.x, this.crack.y, e.left > 0 ? 4 : 10, PALETTE.hullRim);
          if (e.left === 0) this.hurt.jab();
          break;
        case "seamRockOut": {
          const at = this.rock ?? mid;
          burst(at.x, at.y, 8, PALETTE.rock);
          this.hurt.jab();
          break;
        }
        case "seamBlock": {
          // The grit going off the shield as any deflected hit does.
          const at = seamGritCircle(l, cfg);
          burst(at.x, at.y, 8, PALETTE.hullRim);
          break;
        }
        case "seamReseal":
          this.resealNow = 1;
          break;
        case "seamSplit":
          burst(mid.x, mid.y, 24, PALETTE.rock);
          burst(mid.x, mid.y, 10, PALETTE.hullRim);
          this.shock.strike(beatSeconds * SPLIT_BEATS, SPLIT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    this.resealNow = Math.max(0, this.resealNow - RESEAL_DECAY * Math.min(dt, 1 / 30));
    this.shock.update(dt);
    this.hurt.update(dt);
    this.said.update(dt);
  }

  clear(): void {
    this.resealNow = 0;
    this.crack = { x: 0, y: 0 };
    this.rock = null;
    this.shock.clear();
    this.hurt.clear();
    this.said.clear();
  }
}
