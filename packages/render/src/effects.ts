import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { Arrivals } from "./arrivals.js";
import { BeatboxSilences } from "./beatbox-silence.js";
import { BeatboxWaves } from "./beatbox-wave.js";
import { ChoirQuake } from "./choir-quake.js";
import { ClaspFrames } from "./clasp-frames.js";
import { CoilFlightFx } from "./coil-flight.js";
import { CoordGrid } from "./coord-grid.js";
import { CrawlerFx } from "./crawler-fx.js";
import { Debris } from "./debris.js";
import { DeflectFx } from "./deflect.js";
import { BodyTransients } from "./effects-body.js";
import { BossTransients } from "./effects-boss.js";
import { drawAll, ingestAll, resetAll, updateAll } from "./effects-frame.js";
import { ShipMoods } from "./effects-ship.js";
import { GhostTrail } from "./ghost-trail.js";
import { HarpoonLineFx } from "./harpoon-line.js";
import type { SurfaceY } from "./hull-frame.js";
import { HuskDeflates } from "./husk-deflate.js";
import type { LayEcho } from "./lay-echo.js";
import type { Layout } from "./layout.js";
import { OpeningFx } from "./opening-fx.js";
import { RecoilLeapFx } from "./recoil-leap.js";
import { RicochetFx } from "./ricochet.js";
import { RockImpactFx } from "./rock-impact.js";
import { ShotOutFx } from "./shot-out.js";
import { Sparks } from "./sparks.js";
import { SpriteBursts } from "./sprite-burst.js";
import { VolleyShardsFx } from "./volley-shards.js";

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
  /** And the ones that belong to one boss, read above the loop by the boss
   * pass: `effects.boss.mirror`, `.fleet`, `.afterImage` (`effects-boss.ts`). */
  readonly boss = new BossTransients();
  /** THE RECOIL's knock-back as a throw, one beat long from the frame of the
   * hit. Public: `drawCreatures` asks it where each recoil is drawn
   * (`recoil-leap.ts`), which is not a place a transient can paint. */
  readonly recoilLeap = new RecoilLeapFx();
  /** THE COIL's rock thrown out of its dome to the far wall, from the frame
   * the dome went. Public for the leap's reason: `drawCreatures` asks it
   * where the torch is drawn (`coil-flight.ts`). */
  readonly coilFlight = new CoilFlightFx();
  /**
   * The line a harpoon fault is fired down and reeled back up
   * (`harpoon-line.ts`). Public and drawn by the field pass rather than here:
   * it belongs with the lantern it comes out of, which is under the bodies,
   * and it needs the world to say where the body it is attached to is drawn.
   */
  readonly harpoonLine = new HarpoonLineFx();
  /** THE VOLLEY's shell in pieces (`volley-shards.ts`). */
  readonly volleyShards = new VolleyShardsFx();
  /** A bolt carried on past the top row to the top of the screen (`shot-out.ts`). */
  readonly shotOut = new ShotOutFx();
  /** And on HARD a wasted one, glancing off the top back onto the hull. Drawn
   * over the hull by the ship pass, like `rockImpact` (`ricochet.ts`). */
  readonly ricochet = new RicochetFx();
  /** THE CRAWLER's three: a burst ring's goo, the swept lane, the burrow's
   * banks — each outliving what it is about (`crawler-fx.ts`). */
  readonly crawler = new CrawlerFx();
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
  /** The husks the pair refused, flying off. A second and a bit each, which is
   * longer than anything else the mouth throws — it is a joke, and a joke has
   * to be given room (`husk-deflate.ts`). */
  readonly huskDeflates = new HuskDeflates();
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

  /** Every event applied to whatever here outlives its frame. The routing
   * is `effects-frame.ts`'s `ingestAll`, beside the three other verbs the
   * class says to its roster; what `well` means is written there. */
  ingest(
    events: readonly SimEvent[],
    l: Layout,
    time: number,
    creatureIdAt: (col: number, row: number) => number,
    cfg: SimConfig,
    well = false,
  ): void {
    ingestAll(this, events, l, time, creatureIdAt, cfg, well);
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
