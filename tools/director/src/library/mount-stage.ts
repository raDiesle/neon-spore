import { type Body, computeLayout, drawLivingBody, type MountLook } from "@neon-spore/render";
import { type Creature, createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * One of THE GYRE's mounts, drawn on a card with a contour of the caller's
 * choosing.
 *
 * On the field a mount goes through `drawLivingBody` with `MOUNT_LOOK.shape`'s
 * answer (`creature-body.ts`), and the record is the one seam a VERSUS
 * candidate patched. Here the answer is handed straight to the same draw, so
 * no record is swapped at all: the card asks the look for its contour and
 * draws the game's own slick or bulb inside it, with the skin, the interior
 * and the sway the field gives a body of that colour.
 *
 * A look keyed on the rim turns to face the hub (`mount-bearing.ts`), so the
 * card gives the mount a wheel: a hub standing up and to the left of it, the
 * way the top-right mount on THE GYRE sees its own. Roots reach down-left
 * toward it and a crown points away from it, which is the whole of what
 * either look argues, and neither shows with the fallback of a body off any
 * wheel.
 */

/** A tile that makes a body most of a card wide: a living body's radius is
 * two fifths of a tile (`creature-place.ts`), and a rooted contour reaches
 * past it. The grid's width is the whole of what sets the tile. */
const TILE = 170;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const HUB: Creature = {
  id: 20,
  kind: "gyre",
  col: 2,
  row: 3,
  fromRow: 3,
  color: null,
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
};

const MOUNT: Creature = {
  id: 21,
  kind: "mount",
  col: 4,
  row: 5,
  fromRow: 5,
  color: "cyan",
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
  gyreId: HUB.id,
  gyreSlot: 1,
};

/** A world with nothing in it but the wheel's hub, for `hubOf` to find. The
 * seed is any: nothing here advances it. */
const WORLD = createWorld(DEFAULT_CONFIG, 1, []);
WORLD.creatures.push(HUB);

const NO_BLOCKS: ReadonlyMap<number, number> = new Map();

export function drawMountStage(c: AssetContext, f: AssetFrame, look: MountLook): void {
  const { ctx, w, h } = c;
  const beats = f.t / BEAT_SECONDS;
  const body: Body = {
    ctx,
    l: LAYOUT,
    world: WORLD,
    c: MOUNT,
    x: w / 2,
    y: h / 2,
    time: f.t,
    beats,
    beatPhase: f.beatPhase,
    // At arm's length: the haze is distance.
    near: 1,
    blocked: NO_BLOCKS,
  };
  ctx.save();
  drawLivingBody(body, 1, look.shape(body));
  ctx.restore();
}
