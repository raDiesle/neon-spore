import { midCol, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { TrapezeFlag } from "./trapeze-flag.js";
import { trapezePivot, trapezeSpindleAt, trapezeTip } from "./trapeze-shape.js";
import { TrapezeVerdicts } from "./trapeze-verdicts.js";

/**
 * What THE TRAPEZE keeps between frames (§11.56): **the flag where it is
 * drawn** (`trapeze-flag.ts`), what its receipts leave in the body for a
 * moment, and the bursts its fifteen events throw.
 *
 * **What the receipts leave**: a freeze's **snap**, a ring thrown off the
 * mark; a tap off the mark's **flap**, a quick shiver down the canvas; a
 * **limp** flutter, long and slow with no snap, for a swipe that caught
 * nothing and, less of it, for a catch run out; a catch's **taut** crack,
 * the canvas pulled open and flat; the spindle's **light** as both catches
 * are in; and its **flash** on a hit, wider for every hit. A catch, a
 * recatch and a hit are a step landed, so each deals the blow every boss
 * takes (`boss-hurt.ts`), and a freeze on the mark, a correct hit short of
 * a catch, the lighter jab. The shot's colour is the lit step's and not in
 * `trapezeHit`, so the drawer tells it every frame (`tell`). **Both screens
 * are thrown the same.** Cleared in `Effects.reset()`.
 */

/** How fast a flutter dies away, and a freeze's snap, a flap, a catch's crack, the light and a hit's flash, per second. */
const LIMP_DECAY = 0.7;
const SNAP_DECAY = 3;
const FLAP_DECAY = 3.5;
const TAUT_DECAY = 2.2;
const LIGHT_DECAY = 1.5;
const FLASH_DECAY = 3;
/** How much of a flutter a catch run out leaves: the flag sagging as it swings on. */
const SWAY_LIMP = 0.55;

export class TrapezeFx {
  private limpNow = 0;
  private snapNow = 0;
  private snapCol = 0;
  private flapNow = 0;
  private tautNow = 0;
  private lightNow = 0;
  private flashNow = 0;
  private flashHits = 0;
  private shotHex: string = PALETTE.hullRim;
  /** The flag where it is drawn, eased. */
  readonly flag = new TrapezeFlag();
  /** The blow a catch, a recatch and a hit deal the trapeze, and a freeze's jab. */
  readonly hurt = new BossHurt();
  /** Whether the last touch on each of the flag's marks was right (`trapeze-verdicts.ts`). */
  readonly verdicts = new TrapezeVerdicts();

  /** How much of a flutter is still in the canvas, 1 as it starts and 0 gone. */
  get limp(): number {
    return this.limpNow;
  }

  /** A freeze's snap off the mark: how much is left of it, 0..1, and the column it landed over. */
  get snap(): { now: number; col: number } {
    return { now: this.snapNow, col: this.snapCol };
  }

  /** A tap off the mark's shiver down the canvas, a catch's pull taut, and the spindle lighting, each 0..1. */
  get flap(): number {
    return this.flapNow;
  }
  get taut(): number {
    return this.tautNow;
  }
  get light(): number {
    return this.lightNow;
  }

  /** The spindle hit's flash: how bright it still is, 0..1, and the hit it was. */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** The drawer's word for the colour the spindle is lit, which `trapezeHit` does not carry. */
  tell(shotHex: string): void {
    this.shotHex = shotHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    _beatSeconds: number,
    burst: Burst,
  ): void {
    this.verdicts.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("trapeze")) continue;
      const spindle = trapezeSpindleAt(l, cfg);
      const mark = "col" in e ? trapezeTip(l, cfg, (e.col - midCol(cfg)) * 1000) : spindle;
      switch (e.type) {
        case "trapezeEnter": {
          const pivot = trapezePivot(l, cfg);
          burst(pivot.x, pivot.y, 10, PALETTE.trapezeSteelDark);
          break;
        }
        case "trapezeFreeze":
          burst(mark.x, mark.y, 5, PALETTE.hullRim);
          this.snapNow = 1;
          this.snapCol = e.col;
          this.hurt.jab();
          break;
        case "trapezeFlap":
          burst(mark.x, mark.y, 3, PALETTE.trapezeCanvasDark);
          this.flapNow = 1;
          break;
        case "trapezeLapse":
          burst(mark.x, mark.y, 4, PALETTE.trapezeCanvasDark);
          break;
        case "trapezeFlutter":
          burst(mark.x, mark.y, 3, PALETTE.trapezeCanvas);
          this.limpNow = 1;
          break;
        case "trapezeCatch":
        case "trapezeRecatch":
          burst(mark.x, mark.y, 9, PALETTE.trapezeCanvasCaught);
          this.tautNow = 1;
          this.limpNow = 0;
          this.hurt.hit();
          break;
        case "trapezeSway":
          burst(mark.x, mark.y, 5, PALETTE.trapezeCanvasDark);
          this.limpNow = Math.max(this.limpNow, SWAY_LIMP);
          break;
        case "trapezeSpindle":
          burst(spindle.x, spindle.y, 12, PALETTE.hullRim);
          this.lightNow = 1;
          break;
        case "trapezeDim":
          burst(spindle.x, spindle.y, 6, PALETTE.trapezeSteelDark);
          break;
        case "trapezeHit":
          burst(spindle.x, spindle.y, 8 + 6 * e.hits, this.shotHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "trapezeMiss":
          burst(spindle.x, spindle.y, 8, PALETTE.trapezeSteelDark);
          break;
        case "trapezeSpent":
          burst(spindle.x, spindle.y, 16, PALETTE.trapezeSteel);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.limpNow = Math.max(0, this.limpNow - LIMP_DECAY * step);
    this.snapNow = Math.max(0, this.snapNow - SNAP_DECAY * step);
    this.flapNow = Math.max(0, this.flapNow - FLAP_DECAY * step);
    this.tautNow = Math.max(0, this.tautNow - TAUT_DECAY * step);
    this.lightNow = Math.max(0, this.lightNow - LIGHT_DECAY * step);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.hurt.update(dt);
    this.flag.update(dt);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.limpNow = 0;
    this.snapNow = 0;
    this.snapCol = 0;
    this.flapNow = 0;
    this.tautNow = 0;
    this.lightNow = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.shotHex = PALETTE.hullRim;
    this.hurt.clear();
    this.flag.clear();
    this.verdicts.clear();
  }
}
