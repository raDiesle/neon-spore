import { midCol, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { HullShock } from "./hull-shock.js";
import { LATCH_AT_REST } from "./latch-pose.js";
import { type LatchBody, latchGripY, latchHang } from "./latch-shape.js";
import { LatchVerdicts } from "./latch-verdicts.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE LATCH leaves behind a frame (§11.61, *The receipts*): the **torn
 * body**, the one a knot pulled in tears off the colony, flung clear and
 * falling away; the hull's shudder as the tendril hooks into it and as the
 * rope snaps at the end; and the bursts its other receipts throw — the rope
 * fraying at the grips on a slip, the colony spitting as it rears, the rope
 * shining where the pair held a yank.
 *
 * Everything else — the stretch, the rear, the spring back of a slip — is
 * the pose, read off the boss every frame (`latch-pose.ts`); the grips'
 * answers to a touch are `marks` (`latch-verdicts.ts`).
 *
 * **A knot in is the colony's blow**: it tears a body off, the step of the
 * script that is its health, so it deals the whole blow (`boss-hurt.ts`).
 * Nothing else deals any.
 *
 * The events carry the middle column and no place on the colony, so the
 * drawer hands over the bodies it drew each frame (`note`), THE MIMIC's way.
 * A level run out throws nothing here: the hull it tears is the latch's own
 * blow (`latch-blow.ts`). Everything is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 */

/** How strong the hull's shudder is for the hook and the snap, and how long, in beats. */
const HOOK_FORCE = 0.25;
const HOOK_BEATS = 0.4;
const SNAP_FORCE = 0.5;
const SNAP_BEATS = 1;
/** How fast a torn body falls away, per second. */
const TORN_DECAY = 0.7;
/** How many bits a slip throws per tile of rope it lost, and at most. */
const SLIP_PER_TILE = 4;
const SLIP_MOST = 14;

/** A body torn off the colony: where it was, its size, which way it is flung, and how much of its fall is left. */
export interface Torn {
  now: number;
  x: number;
  y: number;
  r: number;
  /** Away from the core: -1 left, 1 right. */
  side: -1 | 1;
}

const NONE: Torn = { now: 0, x: 0, y: 0, r: 0, side: 1 };

export class LatchFx {
  private bodies: readonly LatchBody[] = [];
  private tornOf: Torn = { ...NONE };
  /** The grips' verdicts on a touch, and the marks they stand on. */
  readonly marks = new LatchVerdicts();
  /** The hull's shudder as the tendril hooks in, and as the rope snaps. */
  readonly shock = new HullShock();
  /** The blow a knot pulled in deals. */
  readonly hurt = new BossHurt();

  /** The last body torn off, falling away. */
  get torn(): Torn {
    return this.tornOf;
  }

  /** The drawer's word for where the bodies are, which the events do not carry. */
  note(bodies: readonly LatchBody[]): void {
    this.bodies = bodies;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.marks.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("latch")) continue;
      const hang = this.bodies[0] ?? latchHang(l, cfg, LATCH_AT_REST);
      const rope = { x: tileCX(l, midCol(cfg)), y: latchGripY(l, cfg) };
      switch (e.type) {
        case "latchEnter":
          // The tendril's hook biting into the plating.
          burst(rope.x, l.hullY, 8, PALETTE.latchTendril);
          this.shock.strike(beatSeconds * HOOK_BEATS, HOOK_FORCE);
          break;
        case "latchLevel":
          burst(rope.x, rope.y, 3, PALETTE.latchKnot);
          break;
        case "latchKnot": {
          burst(rope.x, rope.y, 6, PALETTE.latchKnot);
          const body = this.bodies.find((b) => b.knot === e.knots);
          if (body !== undefined) {
            this.tornOf = {
              now: 1,
              x: body.x,
              y: body.y,
              r: body.r,
              side: body.x < hang.x ? -1 : 1,
            };
            burst(body.x, body.y, 10, PALETTE.latchSkin);
          }
          this.hurt.hit();
          break;
        }
        case "latchSlip": {
          const n = Math.min(SLIP_MOST, 2 + Math.round((SLIP_PER_TILE * e.lostMilli) / 1000));
          burst(rope.x, rope.y, n, PALETTE.latchTendril);
          break;
        }
        case "latchRear":
          burst(hang.x, hang.y, 5, PALETTE.latchSkinDark);
          break;
        case "latchBraced":
          burst(rope.x, rope.y, 6, PALETTE.good);
          break;
        case "latchSpent":
          // The rope snapping at the colony, and the colony torn loose.
          burst(hang.x, hang.y, 20, PALETTE.latchSkin);
          burst(hang.x, hang.y, 8, PALETTE.latchSkinDark);
          this.shock.strike(beatSeconds * SNAP_BEATS, SNAP_FORCE);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.tornOf.now = Math.max(0, this.tornOf.now - TORN_DECAY * step);
    this.marks.update(dt);
    this.shock.update(dt);
    this.hurt.update(dt);
  }

  clear(): void {
    this.bodies = [];
    this.tornOf = { ...NONE };
    this.marks.clear();
    this.shock.clear();
    this.hurt.clear();
  }
}
