import type { CreatureSilhouette } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { bakedCache } from "./baked.js";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";
import { livingBodyMul } from "./creature-place.js";
import type { Wash } from "./creature-tint.js";
import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/**
 * **How far an enemy may glance** — the owner, 14 October 2026: every enemy
 * glances as the bosses do, *within the naming gate*, so each kind stays its
 * own word across a voice delay.
 *
 * The size is the largest the gate allows, **searched, not guessed**
 * (`tools/shape-sheet/src/nameability-glance.ts`): every living kind turned
 * about its centre through every swing and roll of a COCK round, crossed with
 * its whole pose window. The reach was searched first, with no roll, because
 * the turn is the part an eye sees from across the field: at 0.23 the wisp's
 * lobes, bunched on one half and spread on the other, cover the limpet's and
 * the blister's. Then the roll at that reach: at 0.15 the beatbox and the
 * leech share a box. A hundredth under either is what ships, and
 * `tools/shape-sheet/test/nameability-glance.test.ts` holds both edges.
 *
 * Measured on the bodies the gate knows, the living ones. The ghost and the
 * wisp's trail are mostly not drawn, and a rock is not a living word; the
 * lanes that turn those say so where they do.
 *
 * `tilt` is LOOK's, and an enemy cocks.
 */
export const CREATURE_GLANCE_SIZE: GlanceSize = { reach: 0.22, cock: 0.14, tilt: 0 };

/** How dark the far side goes, reached at the widest turn: the bosses' own (`baton-glance.ts`). */
const FAR_DARK = 0.6;
/** How far out from its centre, in body radii, a turned body's layer reaches: its lobes and its glow. */
const LAYER_REACH = 2;
/** Seconds apart in the round one enemy is from the next by id, so no two set off together. */
const STAGGER = 1.7;

/** One record a temper, read off the enemy's id and kept while it is on the field. */
const GLANCES = bakedCache<number, Glance>();

/** The glance of the enemy `id`: COCK at `CREATURE_GLANCE_SIZE`, on a temper of its own. */
export function creatureGlance(id: number): Glance {
  let glance = GLANCES.get(id);
  if (glance === undefined) {
    glance = glanceOf(cock, CREATURE_GLANCE_SIZE, temperOf(id));
    GLANCES.set(id, glance);
  }
  return glance;
}

/** Drop the records of every enemy no longer on the field. */
export function forgetGlances(creatures: readonly Creature[]): void {
  if (GLANCES.size === 0) return;
  const here = new Set(creatures.map((c) => c.id));
  for (const id of GLANCES.keys()) if (!here.has(id)) GLANCES.delete(id);
}

/**
 * **A living body, glancing** (the owner, 14 October 2026: *they should be not
 * exactly equal*). The body alone turns, about its centre with a `hold` of 0,
 * on its own temper and its own place in the round; whatever is laid over it
 * — `drawOverBody`, grips, marks and cords — stays flat. A body has no one
 * path for the far side's dark to fill, so it is laid on the layer
 * (`drawGlancedLayer`'s `atop`). Still, it is drawn once and exactly as before.
 */
export function drawGlancedLiving(
  b: Body,
  swell = 1,
  shape?: CreatureSilhouette,
  wash?: Wash,
): void {
  const r = b.l.tile * 0.4 * livingBodyMul(b.c);
  const f = glanceFrame(creatureGlance(b.c.id), b.time + b.c.id * STAGGER, {
    x: b.x,
    y: b.y,
    r,
    hold: 0,
  });
  if (glanceStill(f)) {
    drawLivingBody(b, swell, shape, wash);
    return;
  }
  const shade = {
    dark: FAR_DARK,
    full: CREATURE_GLANCE_SIZE.reach,
    reach: LAYER_REACH,
    atop: true,
  };
  drawGlancedLayer(b.ctx, f, shade, (g) => {
    drawLivingBody({ ...b, ctx: g }, swell, shape, wash);
    return [];
  });
}
