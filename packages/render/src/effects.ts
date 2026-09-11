import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { Arrivals } from "./arrivals.js";
import { BeatboxSilences } from "./beatbox-silence.js";
import { BeatboxWaves } from "./beatbox-wave.js";
import { ChoirQuake } from "./choir-quake.js";
import { ClaspFrames } from "./clasp-frames.js";
import { CoordGrid } from "./coord-grid.js";
import { CrawlerFx } from "./crawler-fx.js";
import { Debris } from "./debris.js";
import { DeflectFx } from "./deflect.js";
import { BodyTransients } from "./effects-body.js";
import { breakSparks } from "./effects-break.js";
import { drawAll, resetAll, updateAll } from "./effects-frame.js";
import { ingestOne } from "./effects-ingest.js";
import { ShipMoods } from "./effects-ship.js";
import { burstFor } from "./effects-spark.js";
import { FleetFx } from "./fleet-fx.js";
import { GhostTrail } from "./ghost-trail.js";
import type { SurfaceY } from "./hull-frame.js";
import type { LayEcho } from "./lay-echo.js";
import type { Layout } from "./layout.js";
import { OpeningFx } from "./opening-fx.js";
import { RecoilLeapFx } from "./recoil-leap.js";
import { RockImpactFx } from "./rock-impact.js";
import { MirrorFx } from "./simon-fx.js";
import { Sparks } from "./sparks.js";
import { SpriteBursts } from "./sprite-burst.js";
import { WardenFx } from "./warden-fx.js";

/**
 * Everything transient. Effects own their own state, are fed only by
 * `SimEvent`s, and write nothing back — the world does not know they exist.
 * The deflection gets the most work, deliberately: it is the one moment that
 * needs both players, and docs/spec/systems.md 5.8 says a pair that cannot see
 * it worked will never learn the timing.
 */
export class Effects {
  readonly sparks = new Sparks();
  /**
   * The pieces a broken body left, still in the air — the fracture half of an
   * impact, where `sparks` is the flash half (`debris.ts`, `shatter.ts`).
   *
   * It draws nothing on the shipped field: `BREAK_LOOK.wedges` is 0, so every
   * `break` returns on its first line. It is here because a VERSUS candidate
   * cannot add a transient to this class — it can only patch a record — and a
   * seam that exists only when something is using it is a seam nobody can
   * offer an answer through (`docs/versus.md`).
   */
  readonly debris = new Debris();
  readonly deflectFx = new DeflectFx();
  /**
   * The last step of a rock's fall, replayed until it reaches the hull, and
   * the stuck-then-rolling rock afterwards. Public and drawn *over* the hull
   * by the ship pass rather than by `draw` here; the hull also asks it
   * whether a rock still sits in its own crater (`craters.ts`).
   */
  readonly rockImpact = new RockImpactFx();
  readonly blockedUntil = new Map<number, number>();
  /**
   * The ship's own clocks — the swallow, the fire opening, the deflection
   * flash and the queen's shudder, with the banner the last two write
   * (`effects-ship.ts`). Public: `ingestOne` is handed it whole.
   */
  readonly ship = new ShipMoods();
  /** Which impacts have visibly landed. Public: the hull asks before it
   * draws a scar's crack (`arrivals.ts`, `scars.ts`'s `arrived`). */
  readonly arrivals = new Arrivals();
  /** The transients that belong to one body — `effects-body.ts`. */
  readonly bodies = new BodyTransients();
  /** THE RECOIL's knock-back as a throw, one beat long from the frame of the
   * hit. Public: `drawCreatures` asks it where each recoil is drawn
   * (`recoil-leap.ts`), which is not a place a transient can paint. */
  readonly recoilLeap = new RecoilLeapFx();
  /** THE CRAWLER's three: a burst ring's goo, the swept lane, the burrow's
   * banks — each outliving what it is about (`crawler-fx.ts`). */
  readonly crawler = new CrawlerFx();
  /**
   * THE MIRROR's own transients. Public: the boss is drawn as a whole ship
   * rather than as particles, and `canvas2d` reads `armed` and `intake` off
   * it to build the mirror's hull mood.
   */
  readonly mirror = new MirrorFx();
  /** THE WARDEN's one transient: the line whipping down after it is torn.
   * Public for the mirror's reason — the boss is drawn as a whole body by
   * `boss-draw.ts`, not as a handful of particles here. */
  readonly warden = new WardenFx();
  /** THE FLEET's salvoes between the muzzle and the square. Public for the
   * mirror's reason, and asked questions as well as drawn: the marks and the
   * scars check with it before calling a square spent (`fleet-fx.ts`). */
  readonly fleet = new FleetFx();
  /**
   * The baked burst, played from an atlas over a destroyed creature. Public
   * because installing the atlas is the *host's* decision: `apps/game` does it
   * behind `?raster=1` and the director on the RASTER page — until one of them
   * does, this draws nothing (`sprite-burst.ts`, `docs/raster.md`).
   */
  readonly spriteBursts = new SpriteBursts();
  /**
   * THE CLASP's hand-painted shield, on exactly the same terms one asset
   * along: the strip is installed by a host behind `?raster=1` and the
   * procedural shell is what draws until one is (`clasp-frames.ts`). It holds
   * an image and no per-frame state, so `reset` has nothing to clear in it —
   * a restart must not unload an atlas somebody is in the middle of looking
   * at.
   */
  readonly claspFrames = new ClaspFrames();
  /**
   * The two clocks a wave's opening needs and a world standing still cannot
   * give it: how long the page that is up has been up, and the blobs a circle
   * throws when it says READY. Public: `briefing.ts` draws the opening, and
   * this is only where it is kept and cleared.
   */
  readonly opening = new OpeningFx();
  /**
   * Where every ghost has just been. Driven from the field pass rather than
   * fed by an event — only the pass that draws a body knows where — and kept
   * here because it outlives its frame (`ghost-trail.ts`).
   */
  readonly ghostTrail = new GhostTrail();
  /**
   * The lettered grid coming up and going again. Driven from `canvas2d.ts`
   * rather than fed by an event — it is a fade toward a fact read fresh every
   * frame — and kept here because it outlives its frame, or a restarted wave
   * would inherit it half up (`reset`).
   */
  readonly coordGrid = new CoordGrid();
  /** THE CHOIR's earthquake: the one transient that moves the *picture* rather
   * than something in it, applied where the stage is placed (`choir-quake.ts`). */
  readonly quake = new ChoirQuake();
  /** THE BEATBOX's discharges, outliving their frame like everything above. */
  readonly beatboxWaves = new BeatboxWaves();
  /** And its silencings, which are the same picture with nowhere to go
   * (`beatbox-silence.ts`). */
  readonly beatboxSilences = new BeatboxSilences();

  /** Per-creature grey flash after a wrong-colour hit, by creature id. */
  get blocked(): ReadonlyMap<number, number> {
    return this.blockedUntil;
  }

  /** The five below are the ship's own, read straight off `ship`. They stay
   * spelled out here because `field-pose.ts`, `boss-draw.ts` and the tests ask
   * `Effects` for them, and which object keeps the clock is this file's
   * business rather than theirs. */
  get layEcho(): LayEcho {
    return this.ship.layEcho;
  }

  get queenShake(): number {
    return this.ship.queenShake;
  }

  get deflectFlash(): number {
    return this.ship.deflectFlash;
  }

  get chew(): number {
    return this.ship.chew;
  }

  get charge(): number {
    return this.ship.charge;
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
    this.fleet.ingest(events, beatSeconds);
    this.bodies.ingest(events, l, cfg, beatSeconds, time);
    this.recoilLeap.ingest(events, beatSeconds);
    for (const e of events) {
      const spark = burstFor(e, l);
      if (spark) this.sparks.burst(spark.x, spark.y, breakSparks(e, spark.n), spark.hex);

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
        rockImpactFx: this.rockImpact,
        arrivals: this.arrivals,
        deflectFx: this.deflectFx,
        ship: this.ship,
        crawler: this.crawler,
        quake: this.quake,
        beatboxWaves: this.beatboxWaves,
        beatboxSilences: this.beatboxSilences,
        blockedUntil: this.blockedUntil,
        debris: this.debris,
        burst: (x, y, n, hex) => this.sparks.burst(x, y, n, hex),
      });
    }
  }

  /** Every clock forward by `dt`, every transient drawn, and everything
   * forgotten when a wave restarts — one subject and one file
   * (`effects-frame.ts`). What is left here is what this class *owns*. */
  update(dt: number, l: Layout): void {
    updateAll(this, dt, l);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    world: World,
    beatPhase: number,
    surfaceY?: SurfaceY,
  ): void {
    drawAll(this, ctx, l, world, beatPhase, surfaceY);
  }

  reset(): void {
    resetAll(this);
  }

  /** The word itself, over the hull — DEFLECTED, or a pod's one-word receipt. */
  drawBanner(ctx: CanvasRenderingContext2D, l: Layout): void {
    this.ship.drawBanner(ctx, l);
  }
}
