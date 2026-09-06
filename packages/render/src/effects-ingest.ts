import type { SimEvent } from "@neon-spore/sim";
import type { Arrivals } from "./arrivals.js";
import type { CrawlerFx } from "./crawler-fx.js";
import type { DeflectFx } from "./deflect.js";
import { ingestBreach, ingestDeflect } from "./effects-breach.js";
import { isIngestSilent } from "./effects-ingest-silent.js";
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
    default:
      assertNever(e);
  }
}
