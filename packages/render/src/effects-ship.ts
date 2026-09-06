import type { PodKind } from "@neon-spore/sim";
import { drawBanner } from "./banner.js";
import { LayEcho } from "./lay-echo.js";
import type { Layout } from "./layout.js";
import { SwallowFx } from "./swallow.js";

/** How long "DEFLECTED" stays up. Long enough to look at, short enough to miss. */
const BANNER_LIFE = 0.9;
/** How long the queen shudders after losing a petal. */
const QUEEN_SHAKE_LIFE = 0.35;

/**
 * The ship's own moods — what the hull does about something that happened to
 * it, rather than about a body on the field. Taking a pod in, the fire opening
 * relaxing after a shot, the flash a ward earns and the shudder a lost petal
 * costs, and the one word each of the last two puts over the hull.
 *
 * Split out of `Effects` on that file's line count: it was at its 250-line
 * ceiling and a new transient costs six lines there. These four belong
 * together — every one of them is a clock about the ship — and `Effects` keeps
 * the names its callers already read (`chew`, `charge`, `deflectFlash`,
 * `queenShake`, `layEcho`, `drawBanner`), so nothing outside moved.
 */
export class ShipMoods {
  /** Taking a pod in — its own two-part clock, see `swallow.ts`. */
  private swallow = new SwallowFx();
  /** Counts down while DEFLECTED is up. */
  private guardHit = 0;
  /** Counts down after she loses a petal. There is only ever one queen. */
  private queenShakeUntil = 0;
  /** The fire opening relaxing after a shot — `canvas2d.ts` folds it onto
   * `HullMood.lay`, the way it reads `armed` off the mirror. */
  readonly layEcho = new LayEcho();

  get deflectFlash(): number {
    return this.guardHit;
  }

  /** 0..1, how hard the queen is shuddering right now. */
  get queenShake(): number {
    return Math.max(0, this.queenShakeUntil / QUEEN_SHAKE_LIFE);
  }

  /** 0..1 while the membrane around the maw is coming apart. */
  get chew(): number {
    return this.swallow.chew;
  }

  /** 0..1 for the light that goes through the ship once the pod is inside. */
  get charge(): number {
    return this.swallow.charge;
  }

  /** A pod is going in; the receipt follows the chewing (`banner.ts`). */
  swallowPod(kind: PodKind): void {
    this.swallow.start(kind);
  }

  /** A rock came back off the shield, or a volley did. */
  deflected(): void {
    this.guardHit = BANNER_LIFE;
  }

  /** A petal is off the queen. */
  shudder(): void {
    this.queenShakeUntil = QUEEN_SHAKE_LIFE;
  }

  update(dt: number): void {
    this.guardHit = Math.max(0, this.guardHit - dt);
    this.queenShakeUntil = Math.max(0, this.queenShakeUntil - dt);
    this.swallow.update(dt);
    this.layEcho.update(dt);
  }

  clear(): void {
    this.guardHit = 0;
    this.queenShakeUntil = 0;
    this.swallow.clear();
    this.layEcho.clear();
  }

  /** The word itself, over the hull — DEFLECTED, or a pod's one-word receipt. */
  drawBanner(ctx: CanvasRenderingContext2D, l: Layout): void {
    drawBanner(ctx, l, this.guardHit, this.swallow);
  }
}
