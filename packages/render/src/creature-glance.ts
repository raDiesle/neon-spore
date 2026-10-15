import type { CreatureSilhouette } from "@neon-spore/content";
import type { Creature, CreatureKind } from "@neon-spore/sim";
import { bakedCache } from "./baked.js";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";
import { ownLightReach } from "./creature-detail.js";
import { livingBodyMul } from "./creature-place.js";
import type { Wash } from "./creature-tint.js";
import { type Glance, type GlanceFrame, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf, rove } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";
import { plateLightShift } from "./shell-draw.js";

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
 * Measured on the bodies the gate knows, the living ones. A rock is not a
 * living word, and turns at `ROCK_GLANCE_SIZE` below. **The ghost and the wisp
 * do not glance**: each is mostly not drawn — the ghost is nothing on player
 * 1's field and the wisp nothing on player 2's — and where one is, it is a
 * glow and a trail rather than a body with a side to turn.
 *
 * `tilt` is LOOK's, and an enemy cocks.
 */
export const CREATURE_GLANCE_SIZE: GlanceSize = { reach: 0.22, cock: 0.14, tilt: 0 };

/**
 * **How far a rock may glance**: a stone is big and not a living word, so it
 * turns further than the gate lets a blob — THE THROAT's turn and roll, with
 * no tilt, since a rock cocks as an enemy does. A rock spins anyway; the roll
 * rides on the spin.
 */
export const ROCK_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.14, tilt: 0 };

/**
 * **How far a body two hands hang off may glance**: a living body's turn with
 * no roll. Such a body turns holding the two points its handles sit at
 * (`GlancedPart.hold`), so the skin still meets them where they are drawn and
 * answered; a roll about the centre would carry both off them (`balloon.ts`).
 */
export const HELD_GLANCE_SIZE: GlanceSize = { ...CREATURE_GLANCE_SIZE, cock: 0 };

/**
 * **The kinds that rove** (`glance-styles.ts`): they hold looks up and down as
 * well as across, where every other enemy cocks — the owner, 15 October 2026:
 * *"bulb" might look good if we also glance him not only to left and right,
 * but also to top and bottom*. The four round bodies the naming gate lets
 * turn every way at `CREATURE_GLANCE_SIZE`, each against every other kind
 * cocking or roving (`tools/shape-sheet/test/nameability-glance.test.ts`). A
 * slick roving joins the weight's word, and the dart, limpet and blister the
 * wisp's, so those cock.
 */
export const ROVERS: ReadonlySet<CreatureKind> = new Set<CreatureKind>([
  "bulb",
  "throb",
  "countdown",
  "mine",
]);

/** Which of the sizes a body turns at. */
export type GlanceSort = "living" | "rock" | "held";

const SIZES: Readonly<Record<GlanceSort, GlanceSize>> = {
  living: CREATURE_GLANCE_SIZE,
  rock: ROCK_GLANCE_SIZE,
  held: HELD_GLANCE_SIZE,
};

/** How dark the far side goes, reached at the widest turn: the bosses' own (`baton-glance.ts`). */
const FAR_DARK = 0.6;
/** How far out from its centre, in body radii, a turned body's layer reaches: its lobes and its glow. */
const LAYER_REACH = 2;
/** Seconds apart in the round one enemy is from the next by id, so no two set off together. */
const STAGGER = 1.7;

/** One record a temper, read off the enemy's id and kept while it is on the field. */
const GLANCES: Readonly<Record<GlanceSort, Map<number, Glance>>> = {
  living: bakedCache<number, Glance>(),
  rock: bakedCache<number, Glance>(),
  held: bakedCache<number, Glance>(),
};

/**
 * The glance of the enemy `id`: COCK at its sort's size, on a temper of its
 * own — or ROVE, for a living one of a kind that roves.
 */
export function creatureGlance(
  id: number,
  sort: GlanceSort = "living",
  kind?: CreatureKind,
): Glance {
  const held = GLANCES[sort];
  let glance = held.get(id);
  if (glance === undefined) {
    const roves = sort === "living" && kind !== undefined && ROVERS.has(kind);
    glance = glanceOf(roves ? rove : cock, SIZES[sort], temperOf(id));
    held.set(id, glance);
  }
  return glance;
}

/** Drop the records of every enemy no longer on the field. */
export function forgetGlances(creatures: readonly Creature[]): void {
  if (Object.values(GLANCES).every((held) => held.size === 0)) return;
  const here = new Set(creatures.map((c) => c.id));
  for (const held of Object.values(GLANCES)) {
    for (const id of held.keys()) if (!here.has(id)) held.delete(id);
  }
}

/**
 * One turning body: its radius, the unit its turn is counted in; its sort; its
 * layer's reach in radii; how far either side of its centre, in radii, the
 * points it holds still sit — 0, the centre, unless hands hang off it; and
 * whether it wears its own light, the plume and halo `drawLivingBody` ends
 * with, which reach past the body and the layer must hold.
 */
export interface GlancedPart {
  r: number;
  sort?: GlanceSort;
  reach?: number;
  hold?: number;
  lit?: boolean;
}

/** Where body `b`'s glance stands this frame — what `glancedPoint` asks to find a point of it as drawn. */
export function bodyGlanceFrame(
  b: Pick<Body, "c" | "x" | "y" | "time">,
  part: GlancedPart,
): GlanceFrame {
  const at = { x: b.x, y: b.y, r: part.r, hold: part.hold ?? 0 };
  return glanceFrame(creatureGlance(b.c.id, part.sort, b.c.kind), b.time + b.c.id * STAGGER, at);
}

/**
 * How dark a turned body's far side goes, and how far its layer reaches: its
 * own `reach`, or as far as its light does when it wears one.
 */
export function bodyShade(b: Pick<Body, "l" | "c">, part: GlancedPart) {
  const light =
    part.lit === true
      ? ownLightReach(b.l, part.r, plateLightShift(b.c, part.r))
      : { up: 0, side: 0 };
  return {
    dark: FAR_DARK,
    full: SIZES[part.sort ?? "living"].reach,
    reach: Math.max(part.reach ?? LAYER_REACH, light.side / part.r),
    up: light.up / part.r,
    atop: true,
  };
}

/**
 * **A body, glancing** (the owner, 14 October 2026: *they should be not
 * exactly equal*). What `draw` paints turns about the body's centre, on its
 * own temper and its own place in the round; whatever the caller lays over it
 * — grips, marks, cords, a streak — stays flat. A body has no one path for the
 * far side's dark to fill, so it is laid on the layer (`drawGlancedLayer`'s
 * `atop`). Still, `draw` paints straight onto the screen, exactly as before.
 */
export function drawGlancedBody(
  b: Body,
  part: GlancedPart,
  draw: (ctx: CanvasRenderingContext2D) => void,
): void {
  const f = bodyGlanceFrame(b, part);
  if (glanceStill(f)) {
    draw(b.ctx);
    return;
  }
  drawGlancedLayer(b.ctx, f, bodyShade(b, part), (g) => {
    draw(g);
    return [];
  });
}

/** The ordinary living blob, glancing: `drawLivingBody` through `drawGlancedBody`. */
export function drawGlancedLiving(
  b: Body,
  swell = 1,
  shape?: CreatureSilhouette,
  wash?: Wash,
): void {
  const r = b.l.tile * 0.4 * livingBodyMul(b.c);
  drawGlancedBody(b, { r: r * swell, lit: true }, (ctx) =>
    drawLivingBody({ ...b, ctx }, swell, shape, wash),
  );
}
