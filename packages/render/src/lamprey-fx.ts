import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import type { GripVerdicts } from "./grip-verdict.js";
import { mixHex } from "./hex.js";
import { HullShock } from "./hull-shock.js";
import { LampreyChomp } from "./lamprey-chomp.js";
import { LampreyCrumbs } from "./lamprey-crumbs.js";
import { type LampreyPose, lampreyToothAt, type Point } from "./lamprey-shape.js";
import { LampreyVerdicts } from "./lamprey-verdicts.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * What THE LAMPREY leaves behind a frame (§11.59, *The receipts*): the
 * **tooth** a crack knocks out, flung off the ring and tumbling away; the
 * **snap**, a ring closing on the tooth that went back in; the **gulp**, the
 * gullet flashing in its colour as a shot goes down it; the hull's shudder
 * as a bite goes through it and as the eel is spent; the **chomp** of a
 * body eaten, caught in its jaws and crushed (`lamprey-chomp.ts`), and the
 * **crumbs** it spills as they shut (`lamprey-crumbs.ts`); the bursts its
 * other receipts throw; and its marks' verdicts on a touch
 * (`lamprey-verdicts.ts`).
 *
 * Everything else — where the mouth is, which teeth are out — is read off
 * the boss every frame (`lamprey-draw.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: the tail is one
 * seat's and the head the other's, and each has to see the other land.
 *
 * **A crack is one counted hit** and deals the lighter blow; **a bite freed**
 * — the mouth let go of its tile — and **a shot down the gullet** are a
 * sequence landed and deal the whole one (`boss-hurt.ts`). A bite, a grip, a
 * slip, a rear and the spend deal nothing.
 *
 * The events carry a column and a tooth and no place on the mouth, so the
 * drawer hands over the eel it drew each frame (`note`), THE GOVERNOR's way:
 * a cracked tooth flies from where it stood, and a burst is thrown where the
 * mouth is. A full bite throws nothing here but the shudder: the hull it
 * breaks is the eel's own blow (`lamprey-blow.ts`). Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** A rock between the teeth: the burning stone's brown, not the grey of its dust. */
const ROCK = mixHex(PALETTE.ember, PALETTE.rockDark, 0.6);
/** How strong the hull's shudder is for a bite gone through and the spend, and how long, in beats. */
const FULL_FORCE = 0.7;
const FULL_BEATS = 0.8;
const SPENT_FORCE = 0.5;
const SPENT_BEATS = 1;
/** How fast a flung tooth, a snap and a gulp fade, per second. */
const TOOTH_DECAY = 1.6;
const SNAP_DECAY = 4;
const GULP_DECAY = 3;

/** A tooth knocked off the ring: where it stood, which way it was flung, and how much of its flight is left. */
export interface FlungTooth {
  now: number;
  at: Point;
  /** Out from the mouth's middle, a unit vector. */
  dir: Point;
}

export class LampreyFx {
  private pose: LampreyPose | null = null;
  private flungNow = 0;
  private flungAt: Point = { x: 0, y: 0 };
  private flungDir: Point = { x: 0, y: -1 };
  private snapNow = 0;
  private snapTooth = 0;
  private gulpNow = 0;
  private gulpHits = 0;
  private rearHex: string = PALETTE.hullRim;
  /** The hull's shudder as a bite goes through it, and as the eel is spent. */
  readonly shock = new HullShock();
  /** The blow a bite freed and a shot down the gullet deal; a crack the lighter one. */
  readonly hurt = new BossHurt();
  private readonly said = new LampreyVerdicts();
  /** The crumbs left where it ate (`lamprey-crumbs.ts`). */
  readonly crumbs = new LampreyCrumbs();
  /** A body caught in the jaws and crushed (`lamprey-chomp.ts`). */
  readonly chomp = new LampreyChomp();
  private chompHex: string = ROCK;
  /** Where the jaws shut on what they caught, for the next `ingest` to throw its burst: it lands frames after the eat. */
  private crushed: Point | null = null;

  /** The tail's, the head's, the tooth's and the gullet's verdicts on a touch. */
  get verdicts(): GripVerdicts {
    return this.said.verdicts;
  }

  /** The last tooth knocked out, in flight. */
  get flung(): FlungTooth {
    return { now: this.flungNow, at: this.flungAt, dir: this.flungDir };
  }

  /** The last tooth snapped back in: how bright the ring closing on it still is, 0..1, and which. */
  get snap(): { now: number; tooth: number } {
    return { now: this.snapNow, tooth: this.snapTooth };
  }

  /** The last shot down the gullet: how bright it still is, 0..1, the hit it was, and the colour it was lit. */
  get gulp(): { now: number; hits: number; hex: string } {
    return { now: this.gulpNow, hits: this.gulpHits, hex: this.rearHex };
  }

  /** The drawer's word for where the eel is, which the events do not carry. */
  note(p: LampreyPose): void {
    this.pose = p;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    _cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    if (this.crushed !== null) {
      burst(this.crushed.x, this.crushed.y, 6, this.chompHex);
      this.crushed = null;
    }
    this.said.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("lamprey")) continue;
      const mouth = this.mouth(l, "col" in e ? e.col : 0);
      switch (e.type) {
        case "lampreyEnter":
          burst(mouth.x, mouth.y, 8, PALETTE.lampreyHide);
          break;
        case "lampreyEat": {
          // Caught where the body was; its crumbs spill as the jaws shut on it (`update`).
          const at = { x: fieldX(l, e.col), y: tileCY(l, e.row) };
          this.chompHex =
            e.food === "slick" ? PALETTE.red : e.food === "bulb" ? PALETTE.cyan : ROCK;
          this.chomp.bite(at, this.chompHex, mouth, l.tile);
          break;
        }
        case "lampreyDung":
          burst(fieldX(l, e.col), tileCY(l, e.row), 6, PALETTE.lampreyDung);
          break;
        case "lampreyBite":
          // The sucker slammed into the tile.
          burst(mouth.x, mouth.y, 8, PALETTE.lampreyHide);
          break;
        case "lampreyCrack": {
          const at = this.tooth(mouth, e.tooth);
          const len = Math.hypot(at.x - mouth.x, at.y - mouth.y);
          this.flungNow = 1;
          this.flungAt = at;
          this.flungDir =
            len > 0 ? { x: (at.x - mouth.x) / len, y: (at.y - mouth.y) / len } : { x: 0, y: -1 };
          burst(at.x, at.y, 6, PALETTE.lampreyTooth);
          this.hurt.jab();
          break;
        }
        case "lampreySnap":
          if (e.tooth >= 0) {
            this.snapNow = 1;
            this.snapTooth = e.tooth;
            const at = this.tooth(mouth, e.tooth);
            burst(at.x, at.y, 3, PALETTE.rockDark);
          }
          break;
        case "lampreySlip":
          burst(mouth.x, mouth.y, 3, PALETTE.red);
          break;
        case "lampreyFull":
          burst(mouth.x, mouth.y, 10, PALETTE.red);
          this.shock.strike(beatSeconds * FULL_BEATS, FULL_FORCE);
          break;
        case "lampreyLoose":
          burst(mouth.x, mouth.y, 6, PALETTE.lampreyHide);
          this.hurt.hit();
          break;
        case "lampreyRear":
          this.rearHex = stepColour(e.color).rim;
          burst(mouth.x, mouth.y, 8, this.rearHex);
          break;
        case "lampreyHit":
          burst(mouth.x, mouth.y, 8 + 4 * e.hits, this.rearHex);
          this.gulpNow = 1;
          this.gulpHits = e.hits;
          this.hurt.hit();
          break;
        case "lampreySpent":
          burst(mouth.x, mouth.y, 20, PALETTE.lampreyHide);
          burst(mouth.x, mouth.y, 8, PALETTE.lampreyTooth);
          this.shock.strike(beatSeconds * SPENT_BEATS, SPENT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  /** Where the mouth is: as last drawn, or at the hull under the event's column before the first frame. */
  private mouth(l: Layout, col: number): Point {
    return this.pose ?? { x: fieldX(l, col), y: l.hullY };
  }

  /** Where tooth `t` stood on the mouth last drawn, or the mouth's middle before the first frame. */
  private tooth(mouth: Point, t: number): Point {
    return this.pose === null ? mouth : lampreyToothAt(this.pose, t);
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.flungNow = Math.max(0, this.flungNow - TOOTH_DECAY * step);
    this.snapNow = Math.max(0, this.snapNow - SNAP_DECAY * step);
    this.gulpNow = Math.max(0, this.gulpNow - GULP_DECAY * step);
    if (this.gulpNow === 0) this.gulpHits = 0;
    this.shock.update(dt);
    this.hurt.update(dt);
    this.said.update(dt);
    this.crumbs.update(dt);
    if (this.chomp.update(dt) && this.pose !== null) {
      // Out of the seam, a little ahead of the hinge.
      const reach = this.pose.r * 0.55;
      const face = this.chomp.face;
      const at = {
        x: this.pose.x + Math.cos(face) * reach,
        y: this.pose.y + Math.sin(face) * reach,
      };
      this.crumbs.drop(at, this.chompHex);
      this.crushed = at;
    }
  }

  clear(): void {
    this.pose = null;
    this.flungNow = 0;
    this.flungAt = { x: 0, y: 0 };
    this.flungDir = { x: 0, y: -1 };
    this.snapNow = 0;
    this.snapTooth = 0;
    this.gulpNow = 0;
    this.gulpHits = 0;
    this.rearHex = PALETTE.hullRim;
    this.shock.clear();
    this.hurt.clear();
    this.said.clear();
    this.crumbs.clear();
    this.chomp.clear();
    this.chompHex = ROCK;
    this.crushed = null;
  }
}
