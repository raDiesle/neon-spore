import type { SimEvent } from "@neon-spore/sim";
import type { Arrivals } from "./arrivals.js";
import type { LayEcho } from "./cannon-maw.js";
import type { DeflectFx } from "./deflect.js";
import { ingestBreach, ingestDeflect } from "./effects-breach.js";
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
      ctx.layEcho.start(ctx.beatSeconds);
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
    case "wispHop":
    // THE GHOST's three, and all three for the same reason: none of them is a
    // particle on the field. The escape is `ghost-release.ts`, a transient
    // that belongs to one body; the turn at a wall and the charge that ends
    // the prowling are read off `ghostLaps` every frame, on the body itself,
    // on the one screen that draws it.
    case "ghostRelease":
    case "ghostTurn":
    case "ghostCharge":
      break;
    default:
      assertNever(e);
  }
}
