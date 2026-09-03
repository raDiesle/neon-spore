import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { Arrivals } from "./arrivals.js";
import { drawBanner } from "./banner.js";
import { LayEcho } from "./cannon-maw.js";
import { CoordGrid } from "./coord-grid.js";
import { DeflectFx } from "./deflect.js";
import { BodyTransients } from "./effects-body.js";
import { ingestOne, QUEEN_SHAKE_LIFE } from "./effects-ingest.js";
import { burstFor } from "./effects-spark.js";
import { GhostTrail } from "./ghost-trail.js";
import type { Layout } from "./layout.js";
import { RockImpactFx } from "./rock-impact.js";
import { MirrorFx } from "./simon-fx.js";
import { Sparks } from "./sparks.js";
import { SpriteBursts } from "./sprite-burst.js";
import { SwallowFx } from "./swallow.js";
import { WardenFx } from "./warden-fx.js";

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
  /** The two transients that belong to one body — `effects-body.ts`. */
  private bodies = new BodyTransients();
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
  /**
   * The baked burst, played from an atlas over a destroyed creature. Public
   * because installing the atlas is the *host's* decision, not the renderer's:
   * `apps/game` does it behind `?raster=1` and the director does it on the
   * RASTER page, and until one of them does, this draws nothing and the field
   * looks exactly as it shipped. See `sprite-burst.ts` and `docs/raster.md`.
   */
  readonly spriteBursts = new SpriteBursts();
  /** The fire opening relaxing after a shot — `canvas2d.ts` folds it onto
   * `HullMood.lay`, the way it reads `armed` off the mirror. */
  readonly layEcho = new LayEcho();
  /**
   * Where every ghost has just been. Public and driven from the field pass
   * rather than fed by an event, for the coord grid's reason below: it is a
   * sample of where a body is drawn, and only the pass that draws it knows
   * that. It lives here because it outlives its frame — see `ghost-trail.ts`.
   */
  readonly ghostTrail = new GhostTrail();
  /**
   * The lettered grid coming up and going again. Public and driven from
   * `canvas2d.ts` rather than fed by an event, because it is not a transient
   * at all — it is a fade toward a fact about the world (is anything on the
   * field named by tile), and the fact is read fresh every frame. It lives
   * here for the one reason everything else here does: it outlives its frame,
   * so a wave restarting with it half up would carry that into the new run
   * (`reset`).
   */
  readonly coordGrid = new CoordGrid();

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
    cfg: SimConfig,
  ): void {
    // Derived, not passed: `cfg` arrived for `claspBreakBeats`, and a second
    // parameter saying the same number is how two clocks start.
    const beatSeconds = 60 / cfg.bpm;
    this.mirror.ingest(events);
    this.warden.ingest(events);
    this.bodies.ingest(events, l, cfg, beatSeconds);
    for (const e of events) {
      const spark = burstFor(e, l);
      if (spark) this.burst(spark.x, spark.y, spark.n, spark.hex);

      // Everything past the burst table: `effects-ingest.ts`'s `ingestOne`,
      // split out on this file's own line count. Its switch is exhaustive
      // over `SimEvent`, not this call site — see its own comment.
      ingestOne(e, {
        l,
        time,
        beatSeconds,
        creatureIdAt,
        sparks: this.sparks,
        spriteBursts: this.spriteBursts,
        rockImpactFx: this.rockImpactFx,
        arrivals: this.arrivals,
        deflectFx: this.deflectFx,
        swallow: this.swallow,
        layEcho: this.layEcho,
        blockedUntil: this.blockedUntil,
        setGuardHit: (v) => {
          this.guardHit = v;
        },
        setQueenShake: (v) => {
          this.queenShakeUntil = v;
        },
        burst: (x, y, n, hex) => this.burst(x, y, n, hex),
      });
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
    this.bodies.update(dt);
    this.spriteBursts.update(dt);
    this.ghostTrail.update(dt);
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. The
   * world is here for the clasp transients alone — `drawOnBodies` says why. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    this.deflectFx.draw(ctx);
    this.sparks.draw(ctx);
    this.bodies.draw(ctx);
    this.spriteBursts.draw(ctx);
    this.bodies.drawOnBodies(ctx, l, world, beatPhase);
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
    this.bodies.clear();
    this.spriteBursts.clear();
    this.coordGrid.clear();
    this.ghostTrail.clear();
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
