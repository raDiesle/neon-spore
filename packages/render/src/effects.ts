import { colSpan, isMeteorKind, type SimEvent } from "@neon-spore/sim";
import { Arrivals } from "./arrivals.js";
import { drawBanner } from "./banner.js";
import { LayEcho } from "./cannon-maw.js";
import { DeflectFx } from "./deflect.js";
import { burstFor } from "./effects-spark.js";
import { type Layout, tileCX } from "./layout.js";
import { LureVanishFx } from "./lure-vanish.js";
import { PALETTE } from "./palette.js";
import { RockImpactFx } from "./rock-impact.js";
import { MirrorFx } from "./simon-fx.js";
import { Sparks } from "./sparks.js";
import { SwallowFx } from "./swallow.js";
import { rockRadius } from "./torch.js";
import { WardenFx } from "./warden-fx.js";

/** How long "DEFLECTED" stays up. Long enough to look at, short enough to miss. */
const BANNER_LIFE = 0.9;
/** How long the queen shudders after losing a petal. */
const QUEEN_SHAKE_LIFE = 0.35;

/**
 * Everything transient. Effects own their own state, are fed only by
 * `SimEvent`s, and write nothing back — the world does not know they exist.
 * The deflection gets the most work, deliberately: it is the one moment that
 * needs both players, and docs/spec/systems.md 5.8 says a pair that cannot see
 * it worked will never learn the timing.
 */
export class Effects {
  private sparks = new Sparks();
  private deflectFx = new DeflectFx();
  private rockImpactFx = new RockImpactFx();
  private blockedUntil = new Map<number, number>();
  private guardHit = 0;
  /** Taking a pod in — its own two-part clock, see `swallow.ts`. */
  private swallow = new SwallowFx();
  /** Counts down after she loses a petal. There is only ever one queen. */
  private queenShakeUntil = 0;
  /** Which impacts have visibly landed — see `arrivals.ts`. */
  private arrivals = new Arrivals();
  /** A lure folding to a point, two rows short of the hull — `lure-vanish.ts`. */
  private lureVanish = new LureVanishFx();
  /**
   * THE MIRROR's own transients. Public because the boss is drawn as a whole
   * ship rather than as a handful of particles: `canvas2d` reads `armed` and
   * `intake` off it to build the mirror's hull mood, and calls its own draws.
   */
  readonly mirror = new MirrorFx();
  /** THE WARDEN's one transient: the line whipping down after it is torn.
   * Public for the mirror's reason — the boss is drawn as a whole body by
   * `boss-draw.ts`, not as a handful of particles here. */
  readonly warden = new WardenFx();
  /** The fire opening relaxing after a shot — `canvas2d.ts` folds it onto
   * `HullMood.lay`, the way it reads `armed` off the mirror. */
  readonly layEcho = new LayEcho();

  /** Per-creature grey flash after a wrong-colour hit, keyed by creature id. */
  get blocked(): ReadonlyMap<number, number> {
    return this.blockedUntil;
  }

  /** 0..1, how hard the queen is shuddering right now. */
  get queenShake(): number {
    return Math.max(0, this.queenShakeUntil / QUEEN_SHAKE_LIFE);
  }

  get deflectFlash(): number {
    return this.guardHit;
  }

  /** 0..1 while the membrane around the maw is coming apart. */
  get chew(): number {
    return this.swallow.chew;
  }

  /** 0..1 for the light that goes through the ship once the pod is inside. */
  get charge(): number {
    return this.swallow.charge;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    time: number,
    creatureIdAt: (col: number, row: number) => number,
    beatSeconds: number,
  ): void {
    this.mirror.ingest(events);
    this.warden.ingest(events);
    this.lureVanish.ingest(events, l);
    for (const e of events) {
      const spark = burstFor(e, l);
      if (spark) this.burst(spark.x, spark.y, spark.n, spark.hex);

      switch (e.type) {
        // Everything below either remembers something past this frame or is
        // not a burst at all. The rest is `effects-spark.ts`'s table.
        case "reject": {
          const id = creatureIdAt(e.col, e.row);
          if (id) this.blockedUntil.set(id, 0.35);
          break;
        }
        case "petal":
          this.queenShakeUntil = QUEEN_SHAKE_LIFE;
          break;
        case "fire":
          this.layEcho.start(beatSeconds);
          break;
        case "breach": {
          // A rock is still visibly falling when the sim resolves the hit, so
          // its burst waits for it to arrive (rock-impact.ts). A living
          // creature falls one tile a beat, already at the hull, and fires now.
          if (isMeteorKind(e.kind)) {
            const r = rockRadius(l, e.kind);
            const span = colSpan(e.kind);
            const loCol = Math.round(e.col - (span - 1) / 2);
            // Two bursts flanking the crater, not one on top of it: sparks fly
            // off the rim the rock tore, not out of thin air at its centre.
            const arrive = (ax: number, ay: number): void => {
              this.burst(ax - r * 0.8, ay, 8 * e.span, PALETTE.red);
              this.burst(ax + r * 0.8, ay, 8 * e.span, PALETTE.red);
              // Only now does this rock's own crack get to show.
              this.arrivals.mark(loCol, span, e.beat);
            };
            this.rockImpactFx.spawn(
              tileCX(l, e.col),
              l,
              time,
              beatSeconds,
              e.kind,
              e.fromRow,
              true,
              arrive,
            );
          } else {
            this.burst(tileCX(l, e.col), l.hullY, 16 * e.span, PALETTE.red);
          }
          break;
        }
        case "podTaken": {
          // Sparks flying *inwards*: the one moment in the game where the ship
          // takes something instead of losing it.
          this.sparks.implode(tileCX(l, e.col), l.hullY, 22, PALETTE.pod, l.tile * 1.9);
          this.swallow.start(e.kind);
          break;
        }
        case "deflect": {
          const x = tileCX(l, e.col);
          // Same lateness as a breach, so the bounce waits for the rock too.
          // `embed: false` — a deflected rock bounces, it never sinks in.
          this.rockImpactFx.spawn(x, l, time, beatSeconds, e.kind, e.fromRow, false, (ax, ay) => {
            this.deflectFx.spawn(ax, ay, l.tile, e.span);
            this.burst(ax, ay, 26 * e.span, PALETTE.shieldRim);
            this.guardHit = BANNER_LIFE;
          });
          break;
        }
        default:
          break;
      }
    }
  }

  update(dt: number, l: Layout): void {
    this.sparks.update(dt);
    this.deflectFx.update(dt, l.tile);
    this.rockImpactFx.update(dt, l);
    for (const [id, t] of this.blockedUntil) {
      const left = t - dt;
      if (left <= 0) this.blockedUntil.delete(id);
      else this.blockedUntil.set(id, left);
    }
    this.guardHit = Math.max(0, this.guardHit - dt);
    this.swallow.update(dt);
    this.queenShakeUntil = Math.max(0, this.queenShakeUntil - dt);
    this.layEcho.update(dt);
    this.mirror.update(dt);
    this.warden.update(dt);
    this.lureVanish.update(dt);
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. */
  draw(ctx: CanvasRenderingContext2D): void {
    this.deflectFx.draw(ctx);
    this.sparks.draw(ctx);
    this.lureVanish.draw(ctx);
  }

  /**
   * The last step of a rock's fall, replayed until it reaches the hull, and
   * the stuck-then-rolling rock afterwards. Drawn *over* the hull, unlike the
   * rest of this class: a rock falling or lodged has to stay in front.
   * `skinAt` is the hull's real, breathing surface (`hullSkinY`), so a stuck
   * rock rides the motion its crater does rather than an approximation of it.
   */
  drawRockImpact(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    time: number,
    skinAt: (x: number) => number,
  ): void {
    this.rockImpactFx.draw(ctx, l, time, skinAt);
  }

  /** Whether a rock is still sitting in its own crater at this x — the hull
   * asks before it draws that crater at all (`craters.ts`). */
  rockCoversCrater(x: number, tile: number): boolean {
    return this.rockImpactFx.coversCrater(x, tile);
  }

  /** Whether the rock that scarred this column on this beat has landed yet —
   * the hull asks before drawing that scar's crack (`scars.ts`'s `arrived`). */
  hasArrived(col: number, beat: number): boolean {
    return this.arrivals.has(col, beat);
  }

  /** Forget everything transient: a wave has (re)started and none of it
   * belongs on screen now. Without this a rock from the run just abandoned
   * latches an arrival (`arrivals.ts`) against a beat the new run is about to
   * reuse — showing that beat's crack before its own rock ever lands. */
  reset(): void {
    this.sparks.clear();
    this.deflectFx.clear();
    this.rockImpactFx.clear();
    this.arrivals.clear();
    this.blockedUntil.clear();
    this.guardHit = 0;
    this.swallow.clear();
    this.queenShakeUntil = 0;
    this.layEcho.clear();
    this.mirror.clear();
    this.warden.reset();
    this.lureVanish.clear();
  }

  /** The word itself, over the hull — DEFLECTED, or a pod's one-word receipt. */
  drawBanner(ctx: CanvasRenderingContext2D, l: Layout): void {
    drawBanner(ctx, l, {
      guardHit: this.guardHit,
      swallow: this.swallow.remaining,
      swallowLife: this.swallow.life,
      chewShare: this.swallow.chewShare,
      podKind: this.swallow.podKind,
    });
  }

  private burst(x: number, y: number, n: number, hex: string): void {
    this.sparks.burst(x, y, n, hex);
  }
}
