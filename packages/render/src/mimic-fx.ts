import type { Color, SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { mimicPictureBox } from "./mimic-board.js";
import { mimicHang } from "./mimic-pose.js";
import { MANTLE, type MimicPose } from "./mimic-shape.js";
import { PALETTE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * What THE MIMIC leaves behind a frame (§11.60, *The receipts*): the **peel**,
 * a picture painted exactly lifting off the board like a sticker and
 * drifting down the field turning over; the **flash** of the core taking a
 * tap, in the colour it was lit; the hull's shudder as the mottle slaps into
 * shape and as it falls spent; and the bursts its other receipts throw.
 *
 * Everything else — the flinch, the reach, the roll, the split, the clench —
 * is the pose, read off the boss every frame (`mimic-pose.ts`).
 *
 * **Both screens are thrown the same**: a peel shows the picture that was
 * painted on the painter's screen too, which by then is answered.
 *
 * **A peel is one counted step** and deals the lighter blow; **a tap on the
 * core** deals the whole one (`boss-hurt.ts`). Nothing else deals any.
 *
 * The events carry the middle column and no place on the mantle, so the
 * drawer hands over the pose it drew each frame (`note`), THE LAMPREY's way;
 * a peel carries where its picture stood.
 * The third reach throws nothing here: the hull it breaks is the mimic's own
 * blow (`mimic-blow.ts`). Everything is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 */

/** How strong the hull's shudder is for the slap and the fall, and how long, in beats. */
const SLAP_FORCE = 0.2;
const SLAP_BEATS = 0.4;
const SPENT_FORCE = 0.5;
const SPENT_BEATS = 1;
/** How fast a peel drifts away and a core's flash fades, per second. */
const PEEL_DECAY = 0.6;
const FLASH_DECAY = 3;

/** A picture peeled off the board: which, in what colours, where it stood, a square's size, and how much of its drift is left. */
export interface Peel {
  now: number;
  sign: number;
  ink: number;
  x: number;
  y: number;
  size: number;
  /** Which way it drifts as it falls: -1 left, 1 right. */
  side: -1 | 1;
}

export class MimicFx {
  private pose: MimicPose | null = null;
  private peelOf: Peel = { now: 0, sign: -1, ink: 0, x: 0, y: 0, size: 0, side: 1 };
  private flashNow = 0;
  private coreHex: string = PALETTE.hullRim;
  /** The hull's shudder as the mottle slaps into shape, and as it falls spent. */
  readonly shock = new HullShock();
  /** The blow a shot into the core deals; a peel the lighter one. */
  readonly hurt = new BossHurt();

  /** The last sign peeled off, drifting down. */
  get peel(): Peel {
    return this.peelOf;
  }

  /** The last shot into the core: how bright its flash still is, 0..1, and the colour it was lit. */
  get flash(): { now: number; hex: string } {
    return { now: this.flashNow, hex: this.coreHex };
  }

  /** The drawer's word for where the mantle is, which the events do not carry. */
  note(p: MimicPose): void {
    this.pose = p;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("mimic")) continue;
      const p = this.mantle(l, cfg);
      switch (e.type) {
        case "mimicEnter":
          // The mottle slapping round against the top of the field.
          burst(p.x, p.y, 8, PALETTE.mimicMottle);
          this.shock.strike(beatSeconds * SLAP_BEATS, SLAP_FORCE);
          break;
        case "mimicSign":
        case "mimicChange":
          burst(p.x, p.y, 3, PALETTE.mimicSign);
          break;
        case "mimicPeel": {
          const box = mimicPictureBox(l, cfg, e.sign, e.at);
          if (box === null) break;
          this.peelOf = {
            now: 1,
            sign: e.sign,
            ink: e.ink,
            x: box.x,
            y: box.y,
            size: l.tile,
            side: box.x < p.x ? -1 : 1,
          };
          burst(box.x, box.y, 10, PALETTE.good);
          this.hurt.jab();
          break;
        }
        case "mimicLapse":
        case "mimicRoll":
          burst(p.x, p.y, 4, PALETTE.mimicMottle);
          break;
        case "mimicReach":
          // The arm's creak, at the tip it reached to.
          burst(p.x, p.y + p.r * p.squash + p.reach, 4, PALETTE.mimicSkinDark);
          break;
        case "mimicCore":
          this.coreHex = this.lit(e.color);
          burst(p.x, p.y, 8, this.coreHex);
          break;
        case "mimicHit":
          burst(p.x, p.y, 8 + 4 * e.hits, this.coreHex);
          this.flashNow = 1;
          this.hurt.hit();
          break;
        case "mimicClose":
          burst(p.x, p.y, 6, PALETTE.mimicMottle);
          break;
        case "mimicSpent":
          burst(p.x, p.y, 20, PALETTE.mimicMottle);
          burst(p.x, p.y, 8, PALETTE.mimicSkinDark);
          this.shock.strike(beatSeconds * SPENT_BEATS, SPENT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  /** The core's lit colour, as `mimic-draw.ts` lights it. */
  private lit(color: Color | "either"): string {
    return stepColour(color).rim;
  }

  /** Where the mantle is: as last drawn, or hung at rest before the first frame. */
  private mantle(l: Layout, cfg: SimConfig): MimicPose {
    if (this.pose !== null) return this.pose;
    const { x, y } = mimicHang(l, cfg);
    return {
      x,
      y,
      r: MANTLE * l.tile,
      squash: 1,
      turn: 1,
      arms: [],
      wave: 0,
      split: 0,
      core: 0,
      reach: 0,
      spent: 0,
      face: 1,
      held: 0,
    };
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.peelOf.now = Math.max(0, this.peelOf.now - PEEL_DECAY * step);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    this.shock.update(dt);
    this.hurt.update(dt);
  }

  clear(): void {
    this.pose = null;
    this.peelOf = { now: 0, sign: -1, ink: 0, x: 0, y: 0, size: 0, side: 1 };
    this.flashNow = 0;
    this.coreHex = PALETTE.hullRim;
    this.shock.clear();
    this.hurt.clear();
  }
}
