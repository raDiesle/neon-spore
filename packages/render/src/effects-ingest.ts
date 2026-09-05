import type { SimEvent } from "@neon-spore/sim";
import type { Arrivals } from "./arrivals.js";
import type { CrawlerFx } from "./crawler-fx.js";
import type { DeflectFx } from "./deflect.js";
import { ingestBreach, ingestDeflect } from "./effects-breach.js";
import type { LayEcho } from "./lay-echo.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { assertNever } from "./never.js";
import { PALETTE } from "./palette.js";
import type { RockImpactFx } from "./rock-impact.js";
import type { Sparks } from "./sparks.js";
import type { SpriteBursts } from "./sprite-burst.js";
import type { SwallowFx } from "./swallow.js";

/**
 * Everything `ingestOne` needs to act on a single event, gathered rather than
 * passed one field at a time — the same shape `ingestBreach` and
 * `ingestDeflect` already take. `Effects` owns every one of these; this file
 * only borrows them for the length of one call.
 */
export interface IngestOneCtx {
  l: Layout;
  time: number;
  beatSeconds: number;
  creatureIdAt: (col: number, row: number) => number;
  sparks: Sparks;
  spriteBursts: SpriteBursts;
  rockImpactFx: RockImpactFx;
  arrivals: Arrivals;
  deflectFx: DeflectFx;
  swallow: SwallowFx;
  layEcho: LayEcho;
  crawler: CrawlerFx;
  blockedUntil: Map<number, number>;
  setGuardHit: (v: number) => void;
  setQueenShake: (v: number) => void;
  burst: (x: number, y: number, n: number, hex: string) => void;
}

/** How long a wrong-colour hit's grey flash lasts. */
const REJECT_FLASH = 0.35;
/** How long "DEFLECTED" stays up. Long enough to look at, short enough to miss. */
const BANNER_LIFE = 0.9;
/** How long the queen shudders after losing a petal. Exported: `Effects.queenShake`
 * reads it back to normalise the countdown to 0..1. */
export const QUEEN_SHAKE_LIFE = 0.35;

/**
 * One event, applied to whatever `Effects` remembers past this frame. Split
 * out of `Effects.ingest` on line count.
 *
 * The switch is exhaustive **on purpose**, over every case `SimEvent` has —
 * the same reason `effects-spark.ts`'s `burstFor` is: a case silently left out
 * of a `default` compiles today and draws nothing the day a new event needs
 * this file's attention. `assertNever` turns that into a compile error instead.
 * Most of the union is here only to say so — it is read by an `ingest` of its
 * own before `Effects.ingest`'s loop starts (`mirror`, `warden`, `bodies`), or
 * nothing here remembers anything past the frame that `burstFor`'s own table,
 * called before this, has not already decided.
 */
export function ingestOne(e: SimEvent, ctx: IngestOneCtx): void {
  switch (e.type) {
    case "reject": {
      const id = ctx.creatureIdAt(e.col, e.row);
      if (id) ctx.blockedUntil.set(id, REJECT_FLASH);
      break;
    }
    // THE CRAWLER's two endings, and both of them outlive the worm they are
    // about: by the frame after either event there is nothing standing there
    // to hang a picture on, which is `rockImpactFx`'s reason for existing said
    // about a body that left sideways (`crawler-fx.ts`).
    case "crawlerBeam":
      ctx.crawler.beam(e.col, e.row);
      break;
    case "crawlerBurrow":
      ctx.crawler.mound(e.col, e.row);
      break;
    case "destroy":
      // The one event this is hung on so far: a cannon shot that killed the
      // thing it hit. The sparks still fly — the sprite is offered beside the
      // shipped burst, not in place of it.
      ctx.spriteBursts.spawn(tileCX(ctx.l, e.col), tileCY(ctx.l, e.row), ctx.l.tile * 2.4);
      break;
    case "petal":
      ctx.setQueenShake(QUEEN_SHAKE_LIFE);
      break;
    case "fire":
      ctx.layEcho.start(ctx.beatSeconds, e.color);
      break;
    case "breach":
      ingestBreach(e, ctx.l, ctx.time, ctx.beatSeconds, {
        burst: ctx.burst,
        rockImpactFx: ctx.rockImpactFx,
        arrivals: ctx.arrivals,
      });
      break;
    case "podTaken":
      // Sparks flying *inwards*: the one moment in the game where the ship
      // takes something instead of losing it.
      ctx.sparks.implode(tileCX(ctx.l, e.col), ctx.l.hullY, 22, PALETTE.pod, ctx.l.tile * 1.9);
      ctx.swallow.start(e.kind);
      break;
    case "volleyReturn":
      // The banner a ward earns, and the only half of a `deflect` a volley
      // takes: the pair put the shield in the column and the trigger on the
      // beat, so the ship says so. The tumbling rock `ingestDeflect` throws is
      // deliberately not — the body is still standing there, climbing, and
      // would be drawn twice (`sim/ward.ts`).
      ctx.setGuardHit(BANNER_LIFE);
      break;
    case "deflect":
      ingestDeflect(e, ctx.l, ctx.time, ctx.beatSeconds, {
        burst: ctx.burst,
        rockImpactFx: ctx.rockImpactFx,
        arrivals: ctx.arrivals,
        deflectFx: ctx.deflectFx,
        onDeflect: () => ctx.setGuardHit(BANNER_LIFE),
      });
      break;
    // Read above the loop, by an `ingest` of their own, before this switch
    // ever sees them.
    case "mirrorShow":
    case "mirrorEcho":
    case "mirrorVerdict":
    case "mirrorDown":
    case "plate":
    case "lureVanished":
    case "claspBreak":
    case "veilTorn":
    // A layer off THE RIND: the burst is thrown by `burstFor` above, and the
    // skin it came off in is `rind-shed.ts`, ingested with the rest of
    // `effects-body.ts` before this loop starts. The size the body steps down
    // to is not remembered anywhere — it is redrawn every frame straight off
    // `rindLayers` (`livingBodyMul`), which is the one thing that cannot go
    // stale across a restart.
    case "rindShed":
    // A recoil bouncing: the burst is thrown by `burstFor` above and the jet
    // it vented is `recoil-vent.ts`, ingested with the rest of
    // `effects-body.ts` before this loop starts. How broken the cage is drawn
    // is not remembered anywhere — it is read every frame straight off
    // `recoilBounces` (`recoil.ts`), which is the one thing that cannot go
    // stale across a restart.
    case "recoilBounce":
    // A carom turning at a wall, and one cracking open. Neither remembers
    // anything past this frame: how the crust is drawn is read every frame
    // straight off `c.kind` and `caromHeading` (`carom.ts`), and once it is a
    // rock it is drawn by the same `drawMeteor` every other rock is — which is
    // the one thing that cannot go stale across a restart.
    case "caromBounce":
    case "caromCrack":
    // Nothing about the ejected body is remembered either: which way it is
    // going and what is drawn over it are read every frame off `chuteOpen`
    // (`chute.ts`), which is the one thing that cannot go stale across a
    // restart.
    case "caromEject":
    case "chuteOpen":
    // And the canopy cut off one, which does outlive its frame — but as a
    // transient belonging to one body, ingested with the rest of
    // `effects-body.ts` before this loop starts (`chute-cut.ts`).
    case "chuteCut":
    // The shell bursting off a volley. `burstFor` above has already thrown the
    // rock it was made of, and nothing here is remembered past this frame: how
    // many plates are drawn is read every frame straight off `volleyPlates`
    // (`volley.ts`), and once the body is loose it is drawn by the same
    // `drawLiving` every other body is — which is the one thing that cannot go
    // stale across a restart.
    case "volleyHatch":
    // Nothing here remembers anything past this frame: `burstFor`'s table
    // already said what a burst it is or is not, and none of these change
    // what `Effects` carries into the next one.
    case "beat":
    case "waveStart":
    case "needWave":
    case "lanceFull":
    case "lanceSpilled":
    case "hole":
    case "grip":
    case "podLoose":
    case "podLost":
    case "queenDown":
    case "tether":
    case "eyeOpen":
    case "wardenDown":
    case "mazeCommit":
    case "mazeProbe":
    case "mazeVerdict":
    case "mazeDown":
    case "lureHit":
    case "lureSeen":
    case "shellBreak":
    case "shellBare":
    case "veilMorph":
    case "veilRebuff":
    // A wisp hopping leaves nothing behind on the field: the ring and the beam
    // are drawn every frame off the body itself (`wisp.ts`), so there is no
    // transient here — and an event carrying no column could not place one
    // anyway, which is deliberate (`events.ts`).
    // A wheel coming apart. `burstFor` has already said what it throws, and
    // there is nothing to carry into the next frame: the hub is off the field
    // on the same beat, so an entry keyed to it would have nothing to look up.
    case "gyreBroke":
    // A bead shrivelling or filling again, and the thread parting. None of the
    // three leaves a transient: a raisin is drawn off `strandSpent` on the
    // body every frame (`strand.ts`), and the thread is off the field on the
    // beat it breaks, so an entry keyed to it would have nothing to look up.
    case "strandBead":
    case "strandSwell":
    case "strandBroke":
    case "wispHop":
    // THE GHOST's three, and all three for the same reason: none of them is a
    // particle on the field. The escape is `ghost-release.ts`, a transient
    // that belongs to one body; the turn at a wall and the charge that ends
    // the prowling are read off `ghostLaps` every frame, on the body itself,
    // on the one screen that draws it.
    case "ghostRelease":
    case "ghostTurn":
    case "ghostCharge":
    // THE FLEET is drawn straight off the world every frame — the marks from
    // `struck`, the sinking from `sunkBeat` — with one exception, and the
    // exception is read above this loop by an `ingest` of its own: a salvo is
    // in the air for `FLEET_SHELL_BEATS` after the tick that resolved it, so
    // the shell, its shadow and the burst it makes are `FleetFx`'s
    // (`fleet-fx.ts`).
    case "fleetSalvo":
    case "fleetSplash":
    case "fleetHit":
    case "fleetSunk":
    case "fleetDown":
      break;
    default:
      assertNever(e);
  }
}
