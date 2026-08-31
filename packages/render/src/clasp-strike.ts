import type { SimEvent, World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The ward reaching up the column and taking a clasp's shield off it.
 *
 * The owner asked for exactly this: *"when the shield is activated under the
 * shield enemy, the bolts go up and hit the shielded enemy, so it vanishes."*
 * Until now the two halves of that moment were drawn in two places and never
 * joined — the ship's rim threw taller arcs while the two columns lined up
 * (`shield-spark.ts`'s `resonantLook`), and the bubble blinked out where it
 * stood (`clasp-break.ts`) — so the pair saw a cause and an effect with
 * nothing travelling between them. This is the thing that travels.
 *
 * **It is the same light, not a new one.** The bolts are `PALETTE.shieldRim`,
 * the colour the ship's own arcs are already throwing off the hull a frame
 * earlier, and they leave from the hull surface in the shield's column. A
 * player who has watched the rim spit for a whole wave should read this as
 * that, at full reach, rather than as a weapon they did not know they had.
 *
 * Pure render, like everything else in `effects-body.ts`: the simulation broke
 * the clasp on the instant of the trigger and has no idea this is being drawn.
 * Nothing here is ever read back into a world.
 */

/** One strike, aged in seconds. Keyed by the body it is reaching for. */
export interface ClaspStrike {
  /** The creature the bolt lands on — an ordinary slick or bulb by now. */
  id: number;
  age: number;
}

/**
 * How long a strike is on screen, in seconds. Short: it is the instant of the
 * connection, and the blizzard inside the ball (`clasp-break.ts`) is what
 * carries the picture for the beat afterwards.
 */
const LIFE = 0.26;
/** Bolts per strike. Three reads as a discharge; one reads as a laser. */
const BOLTS = 3;
/** Vertices along a bolt, end to end. */
const STEPS = 9;
/** Sideways wander per vertex, as a share of a tile. */
const JITTER = 0.3;

/** Deterministic, not `Math.random` — `shield-spark.ts` makes the argument. */
function signedHash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

/**
 * One bolt from `(x0, y0)` to `(x1, y1)`, drawn twice: a wide soft pass and a
 * hard thin one over it. `strokeGlow` is the wrong tool here for the reason
 * `shield-spark.ts` gives — it softens a curve meant to look drawn, and a
 * discharge is meant to look struck.
 */
function bolt(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tile: number,
  seed: number,
  alpha: number,
  width: number,
): void {
  const path = (): void => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let i = 1; i < STEPS; i++) {
      const f = i / STEPS;
      // The wander is pinched to nothing at both ends, so the bolt leaves the
      // hull where the shield is and lands on the body rather than near it.
      const spread = Math.sin(f * Math.PI);
      ctx.lineTo(
        x0 + (x1 - x0) * f + signedHash(seed + i * 7.7) * JITTER * tile * spread,
        y0 + (y1 - y0) * f,
      );
    }
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = PALETTE.shieldRim;
  ctx.globalAlpha = alpha * 0.3;
  ctx.lineWidth = width * 3;
  path();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  path();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** Every strike in flight. Fed by `claspBreak`, and by nothing else. */
export class ClaspStrikeFx {
  private live: ClaspStrike[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "claspBreak") continue;
      this.live.push({ id: e.id, age: 0 });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    for (const fx of this.live) {
      const c = world.creatures.find((x) => x.id === fx.id);
      if (!c) continue;
      const t = fx.age / LIFE;
      // Full brightness on arrival, then out. A bolt does not fade in.
      const alpha = Math.max(0, 1 - t);
      if (alpha <= 0) continue;
      const { x, y } = creatureCenter(l, c, beatPhase);
      for (let k = 0; k < BOLTS; k++) {
        // Each bolt is redrawn from a different seed a few times over its
        // life, so the discharge crackles instead of holding one shape.
        const seed = k * 131 + Math.floor(fx.age * 90) * 17;
        bolt(ctx, x, l.hullY, x, y, l.tile, seed, alpha * (k === 0 ? 1 : 0.7), 1.6);
      }
      // Where it lands. The one part of this drawn as light rather than as a
      // line: the shell is being hit, not cut.
      halo(ctx, x, y, l.tile * 1.4, PALETTE.shieldRim, 0.5 * alpha);
    }
  }
}
