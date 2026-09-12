import type { SimEvent } from "@neon-spore/sim";
import type { Arrivals } from "./arrivals.js";
import { BEATBOX_PER_HIT_MUL, BEATBOX_START_MUL } from "./beatbox.js";
import type { BeatboxSilences } from "./beatbox-silence.js";
import type { BeatboxWaves } from "./beatbox-wave.js";
import type { ChoirQuake } from "./choir-quake.js";
import type { CoilFlightFx } from "./coil-flight.js";
import type { CrawlerFx } from "./crawler-fx.js";
import type { Debris } from "./debris.js";
import type { DeflectFx } from "./deflect.js";
import { ingestBreach, ingestDeflect } from "./effects-breach.js";
import { breakBody } from "./effects-break.js";
import { isIngestSilent } from "./effects-ingest-silent.js";
import type { ShipMoods } from "./effects-ship.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { assertNever } from "./never.js";
import { PALETTE } from "./palette.js";
import type { RockImpactFx } from "./rock-impact.js";
import type { Sparks } from "./sparks.js";
import type { SpriteBursts } from "./sprite-burst.js";

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
  /** Which columns a rock out of THE COIL's dome is landing in this frame,
   * so its impact draws no vertical tail over the line it actually flew
   * (`coil-flight.ts`). */
  coilFlight: CoilFlightFx;
  arrivals: Arrivals;
  deflectFx: DeflectFx;
  ship: ShipMoods;
  crawler: CrawlerFx;
  quake: ChoirQuake;
  /** THE BEATBOX's discharge, travelling down the field (`beatbox-wave.ts`). */
  beatboxWaves: BeatboxWaves;
  /** And a box going quiet, which is the same picture with nowhere to go
   * (`beatbox-silence.ts`). */
  beatboxSilences: BeatboxSilences;
  blockedUntil: Map<number, number>;
  /** The pieces a broken body leaves. Draws nothing until a candidate look
   * asks for a fracture at all (`break-look.ts`). */
  debris: Debris;
  burst: (x: number, y: number, n: number, hex: string) => void;
}

/** How long a wrong-colour hit's grey flash lasts. */
const REJECT_FLASH = 0.35;

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
  // The long tail of events that change nothing `Effects` carries into the
  // next frame, taken out of the union before the switch sees it — the same
  // cut `effects-spark-silent.ts` makes next door, and for the same reason.
  // The guard narrows, so the `assertNever` below still catches an event
  // accounted for in neither place.
  if (isIngestSilent(e)) return;
  switch (e.type) {
    case "reject": {
      const id = ctx.creatureIdAt(e.col, e.row);
      if (id) ctx.blockedUntil.set(id, REJECT_FLASH);
      break;
    }
    // A bolt that met the plate under a magnet. The same clock a `reject`
    // opens, on the same map, and read by the same body draw — but it lights
    // the plate rather than greying the body, because what refused the shot
    // was one edge of this creature and not the whole of it (`magnet.ts`).
    case "magnetPlate": {
      const id = ctx.creatureIdAt(e.col, e.row);
      if (id) ctx.blockedUntil.set(id, REJECT_FLASH);
      break;
    }
    // THE CRAWLER's three, and every one of them outlives what it is about:
    // by the frame after the event there is nothing standing there to hang a
    // picture on, which is `rockImpactFx`'s reason for existing said about a
    // body that left sideways (`crawler-fx.ts`).
    //
    // The splash carries a column and no row: a worm is drawn on the ship's
    // own surface and is pushed up by the cannon under it, so where the ring
    // was standing is a question only the frame that draws the goo can answer
    // (`crawler-fx.ts`).
    case "crawlerBreak":
      ctx.crawler.splash(tileCX(ctx.l, e.col), e.color);
      // And the shipped kill sprite beside it, on the same terms as `destroy`
      // below: this is a cannon shot that killed the thing it hit, and the
      // pair should not have to learn a second reading of that.
      ctx.spriteBursts.spawn(tileCX(ctx.l, e.col), tileCY(ctx.l, e.row), ctx.l.tile * 2.4);
      // And the body itself, on the same terms as `destroy` below, with the
      // kind named here because a link's event does not carry one: what died
      // is a segment of worm and nothing else it could be. THE CRAWLER is
      // drawn by a path of its own rather than by a radial contour, so
      // `breakBody` has no outline to cut and leaves it whole — which is the
      // rule rather than a special case (`effects-break.ts`).
      breakBody(ctx.debris, ctx.l, ctx.time, { ...e, kind: "crawler" });
      break;
    case "crawlerBeam":
      ctx.crawler.beam(e.col);
      break;
    case "crawlerBurrow":
      ctx.crawler.mound(e.col, e.row);
      break;
    case "destroy":
      // The one event this is hung on so far: a cannon shot that killed the
      // thing it hit. The sparks still fly — the sprite is offered beside the
      // shipped burst, not in place of it.
      ctx.spriteBursts.spawn(tileCX(ctx.l, e.col), tileCY(ctx.l, e.row), ctx.l.tile * 2.4);
      // And the body itself, cut into the pieces it came apart into. Silent on
      // the shipped field for the sprite's own reason — it is offered beside
      // the burst, not in place of it (`effects-break.ts`).
      breakBody(ctx.debris, ctx.l, ctx.time, e);
      break;
    case "petal":
      ctx.ship.shudder();
      break;
    case "fire":
      ctx.ship.layEcho.start(ctx.beatSeconds, e.color);
      break;
    case "breach":
      ingestBreach(e, ctx.l, ctx.time, ctx.beatSeconds, {
        burst: ctx.burst,
        rockImpactFx: ctx.rockImpactFx,
        arrivals: ctx.arrivals,
        tail: !ctx.coilFlight.landed(e.col),
      });
      break;
    case "podTaken":
      // Sparks flying *inwards*: the one moment in the game where the ship
      // takes something instead of losing it.
      ctx.sparks.implode(tileCX(ctx.l, e.col), ctx.l.hullY, 22, PALETTE.pod, ctx.l.tile * 1.9);
      ctx.ship.swallowPod(e.kind);
      break;
    case "volleyReturn":
      // The banner a ward earns, and the only half of a `deflect` a volley
      // takes: the pair put the shield in the column and the trigger on the
      // beat, so the ship says so. The tumbling rock `ingestDeflect` throws is
      // deliberately not — the body is still standing there, climbing, and
      // would be drawn twice (`sim/ward.ts`).
      ctx.ship.deflected();
      break;
    // THE CHOIR's two heights of earthquake. The arm is the smaller and the
    // merge the larger, which is the escalation the owner asked for: the field
    // shakes when the first arrow goes out and shakes more when the dots draw
    // together (`choir-quake.ts`).
    case "choirArm":
      ctx.quake.arm();
      break;
    case "choirMerge":
      ctx.quake.merge();
      break;
    case "deflect":
      ingestDeflect(e, ctx.l, ctx.time, ctx.beatSeconds, {
        burst: ctx.burst,
        rockImpactFx: ctx.rockImpactFx,
        arrivals: ctx.arrivals,
        deflectFx: ctx.deflectFx,
        onDeflect: () => ctx.ship.deflected(),
      });
      break;
    // A miscounted run discharging: the arcs that carry the sound down the
    // field at the ship. The two beside it are handled by the burst table
    // alone (`effects-spark.ts`) — they are a flash and nothing that outlives
    // its own frame.
    // A run answered: the body's last act, and the loudest one it makes. The
    // radius is the box's own footprint at the count it died on
    // (`beatboxBodyMul`), so the rings leave the rim the pair was looking at
    // rather than a size decided in the effect.
    case "beatboxSilent":
      ctx.beatboxSilences.cast(
        tileCX(ctx.l, e.col),
        tileCY(ctx.l, e.row),
        ctx.l.tile * 0.4 * (BEATBOX_START_MUL + e.hits * BEATBOX_PER_HIT_MUL),
      );
      break;
    case "beatboxWave":
      // Aimed at the hull row rather than given a fixed reach, because a box
      // discharges anywhere between the top of the field and the plating: a
      // wave that always travelled the same distance would overshoot the ship
      // from low down and stop short from high up, and the owner asked for it
      // to go the whole way every time (`beatbox-wave.ts`).
      ctx.beatboxWaves.cast(tileCX(ctx.l, e.col), tileCY(ctx.l, e.row), ctx.l.hullY);
      break;
    default:
      assertNever(e);
  }
}
