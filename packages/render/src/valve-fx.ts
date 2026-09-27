import { type SimConfig, type SimEvent, VALVE_PINS } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { HullShock } from "./hull-shock.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { valveStoryBurst } from "./valve-fx-story.js";
import {
  type Point,
  valveCentre,
  valveHoleCentre,
  valveHolePath,
  valveSparkPoint,
  valveWheel,
} from "./valve-shape.js";

/**
 * What THE VALVE leaves behind a frame: the **clamp** that flares round the
 * wheel as the navigator's tap freezes it, the **flare** in the slot a pin
 * has just left, the **kick** that knocks the drum as the wheel is thrown off
 * its mark, the **shock** through the hull as the spark lands or the face
 * falls open, and the bursts its thirteen receipts throw — with its story's
 * twelve, whose bursts are `valve-fx-story.ts`'.
 *
 * Everything else — where the wheel stands, which pins are out, how far the
 * drum lists — is read off the boss every frame (`valve-draw.ts`,
 * `valve-pose.ts`), and the story's states are read off its phase
 * (`valve-story.ts`): only their bursts, the blow an answer deals the drum
 * and the shudder a run-out one sends through the hull come through here.
 *
 * **Both screens are thrown the same**, like the drawing: each thumb times
 * itself off the other's half.
 *
 * **A freeze is a step landed** — the navigator inside the window — and so is
 * a pin drawn out, so both deal the drum the blow every boss takes
 * (`boss-hurt.ts`). A slip, a lapse or a thaw is the wheel thrown back and
 * deals nothing: it kicks.
 *
 * The spark is shot out wherever it had fallen to and the event says only the
 * column, so its fall is timed from the leak on this side too, THE KEEL's
 * rock, and the burst thrown where the drawing had it (`valveSparkPoint`).
 * Points on the drum are taken at rest, unlisted. Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How far the drum is knocked round by a kick, in radians, and how fast it settles. */
const KICK = 0.09;
const KICK_DECAY = 8;
/** How fast the clamp's flare and a slot's fade, per second. */
const CLAMP_DECAY = 2.5;
const SLOT_DECAY = 2;
/** The hull's shudder as the spark lands, and as the face falls open, in beats and strength. */
const SPARK_BEATS = 1;
const OPEN_BEATS = 1.5;
const OPEN_FORCE = 1.4;

export class ValveFx {
  private kickNow = 0;
  private clampNow = 0;
  private slotNow = 0;
  private slotAt = 0;
  private sparkAge = 0;
  private sparkFall = 0;
  /** The shudder down the plating as the spark lands and the face falls open (`frame-on-ship.ts`). */
  readonly shock = new HullShock();
  /** The blow a freeze and a pull deal the drum. */
  readonly hurt = new BossHurt();

  /** How far the drum is knocked round right now, in radians — a slip, a lapse or a thaw. */
  get kick(): number {
    return this.kickNow;
  }

  /** How bright the clamp round the frozen wheel flares, 0..1. */
  get clamp(): number {
    return this.clampNow;
  }

  /** The slot the last pin left and how bright it flares, 0..1. */
  get slot(): { i: number; now: number } {
    return { i: this.slotAt, now: this.slotNow };
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("valve")) continue;
      const c = valveCentre(l, cfg);
      const on = (p: Point): Point => ({ x: c.x + p.x, y: c.y + p.y });
      const wheel = on(valveWheel(l).at);
      switch (e.type) {
        case "valveEnter":
          burst(c.x, c.y, 12, PALETTE.rock);
          break;
        case "valveLight":
          burst(wheel.x, wheel.y, 4, PALETTE.hullRim);
          break;
        case "valveHold":
          burst(wheel.x, wheel.y, 6, PALETTE.hullRim);
          break;
        case "valveFreeze":
          burst(wheel.x, wheel.y, 10, PALETTE.hullRim);
          this.clampNow = 1;
          this.hurt.hit();
          break;
        case "valveSlip":
        case "valveLapse":
        case "valveThaw":
          burst(wheel.x, wheel.y, 6, PALETTE.rockDark);
          this.kickNow = KICK;
          this.clampNow = 0;
          break;
        case "valvePull": {
          this.slotAt = Math.max(0, Math.min(VALVE_PINS - 1, VALVE_PINS - 1 - e.pins));
          this.slotNow = 1;
          this.clampNow = 0;
          const at = on(valveHoleCentre(l, this.slotAt, VALVE_PINS));
          burst(at.x, at.y, 10, PALETTE.rock);
          this.hurt.hit();
          break;
        }
        case "valveSpark": {
          this.sparkAge = 0;
          this.sparkFall = Math.max(1, cfg.valveSparkBeats) * beatSeconds;
          const at = valveSparkPoint(l, c, e.col, 0);
          burst(at.x, at.y, 6, PALETTE.emberRim);
          break;
        }
        case "valveSparkOut": {
          const along = smoothstep(Math.min(1, this.sparkAge / Math.max(1e-6, this.sparkFall)));
          const at = valveSparkPoint(l, c, e.col, along);
          burst(at.x, at.y, 12, PALETTE.ember);
          this.sparkFall = 0;
          break;
        }
        case "valveSparkHit":
          burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.shock.strike(SPARK_BEATS * beatSeconds, 1);
          this.sparkFall = 0;
          break;
        case "valveOpen":
          burst(c.x, c.y, 20, PALETTE.rock);
          this.shock.strike(OPEN_BEATS * beatSeconds, OPEN_FORCE);
          break;
        default: {
          const blow = valveStoryBurst(e, l, cfg, c, burst);
          if (blow === "landed") this.hurt.hit();
          else if (blow === "struck") this.shock.strike(SPARK_BEATS * beatSeconds, 1);
          break;
        }
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.kickNow = Math.max(0, this.kickNow - this.kickNow * KICK_DECAY * step);
    if (this.kickNow < 0.002) this.kickNow = 0;
    this.clampNow = Math.max(0, this.clampNow - CLAMP_DECAY * step);
    this.slotNow = Math.max(0, this.slotNow - SLOT_DECAY * step);
    this.shock.update(dt);
    if (this.sparkFall > 0) this.sparkAge += dt;
    this.hurt.update(dt);
  }

  clear(): void {
    this.kickNow = 0;
    this.clampNow = 0;
    this.slotNow = 0;
    this.slotAt = 0;
    this.sparkAge = 0;
    this.sparkFall = 0;
    this.shock.clear();
    this.hurt.clear();
  }
}

/**
 * The clamp and the slot, in the drum's own frame, drawn by `valve-draw.ts`
 * inside its turn: a white ring biting round the wheel's rim, and the glow in
 * the slot a pin has just left. Here rather than in the drawing, which is at
 * its length, because they are nothing but this file's two numbers drawn.
 */
export function drawValveFx(ctx: CanvasRenderingContext2D, l: Layout, fx: ValveFx): void {
  if (fx.clamp > 0) {
    const { at, r } = valveWheel(l);
    const ring = new Path2D();
    ring.arc(at.x, at.y, r * (1.02 + 0.2 * fx.clamp), 0, Math.PI * 2);
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9 * fx.clamp);
    ctx.stroke(ring);
    strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.inner, 1.6 * fx.clamp);
  }
  const slot = fx.slot;
  if (slot.now > 0)
    strokeGlow(
      ctx,
      valveHolePath(l, slot.i, VALVE_PINS),
      PALETTE.hullRim,
      STROKE.inner,
      1.8 * slot.now,
    );
}
