import type { SimEvent, World } from "@neon-spore/sim";
import { drawBolt } from "./bolt.js";
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

// **The bolt itself is `bolt.ts` now**, cut out when THE COIL's charge started
// jumping from one dome to the next along a line that is not a column. It is
// the same light doing the same thing, so a second copy of the shape would
// have been the kind of thing `copies-table.ts` catches after the fact.
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
        drawBolt(ctx, x, l.hullY, x, y, l.tile, seed, alpha * (k === 0 ? 1 : 0.7), 1.6);
      }
      // Where it lands. The one part of this drawn as light rather than as a
      // line: the shell is being hit, not cut.
      halo(ctx, x, y, l.tile * 1.4, PALETTE.shieldRim, 0.5 * alpha);
    }
  }
}
