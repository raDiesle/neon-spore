import { blobPoints, livingPath, livingSilhouette, POD } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { litRound } from "./key-light.js";
import { LIVING_SKIN } from "./living-skin.js";
import { keyAxis, STONE_LOOK } from "./meteor-look.js";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { castShadow, clearShadow } from "./snake-skin.js";
import { splinePath } from "./spline.js";

/**
 * What is standing on a tile: the things to shoot, the things to swallow and
 * the meteors in the way.
 *
 * **All three are borrowed rather than invented**, and the owner asked for
 * exactly that. A thing to collect is drawn as the pod the field already has —
 * the same amber contour, the same lit core — because the pair has spent five
 * acts learning that an amber blob with a light in it is a thing to take in,
 * and a round is not the place to teach a second vocabulary. A thing to shoot
 * is a slick or a bulb, the two bodies the field is mostly made of, for the
 * same reason one step on: the seat with the trigger should not have to be
 * told what an enemy looks like.
 *
 * They were a barbed square and an amber ring before this, which read as
 * *machinery* — right for a round that is not the field, wrong for the two
 * things in it a player already knows by sight.
 *
 * **The borrow was only ever of the outline, until 20 September 2026.** Each
 * of the three was its silhouette filled with its own deep — `redDark` is
 * `#190F2C`, `podDark` is `#2C1C05` — a neon rim round that, and one pale disc
 * in the middle. Magnified off a real frame, seven things on the board were
 * seven instances of the same drawing: a coloured outline, a fill darker than
 * the floor it stood on, a dot. Against a body next to them that carries a
 * shadow, a lit side and scales (`snake-skin.ts`), they read as counters
 * placed on a grid and not as anything standing in a place.
 *
 * So each now calls the material the game already ships for it, rather than
 * one written again here: `LIVING_SKIN` for a creature (flesh, bevel, key
 * light, sheen — `living-skin.ts`) and `STONE_LOOK` for a rock (`meteor-look.ts`,
 * which is also where a crater's lit rim is decided). The pod keeps the flat
 * amber it has on the field, because a borrow that restyles the thing it
 * borrowed is no longer a borrow — what it gains here is the one thing the
 * field cannot give it, which is a floor.
 *
 * **And all three are stood on that floor.** `castShadow` is the arena's own
 * light, the same call the body makes, and it is what was actually missing: a
 * shape with nothing under it reads as a hole in the grid however good its
 * skin is.
 *
 * **Which enemy is which is the index and nothing else.** Even is a slick, odd
 * a bulb. It has to be a fact about the authored list rather than a random
 * one: `packages/render` may not roll a die and two devices have to draw the
 * same arena, and an enemy that changed body between two frames would be a
 * body player 1 could not describe out loud. Which *shape* each of those two
 * words means is `livingSilhouette`'s answer and not this file's, so an arena
 * enemy and a body on the field can never come to be different slicks.
 *
 * Its own file because `snake-draw.ts` is the arena — the floor, the wall and
 * where a tile is — and this is what is standing on it.
 */

/** How much of a tile a body fills. Under a whole one, so the grid still reads. */
const BODY = 0.34;

/**
 * A soft shadow on the arena floor under whatever is filled next, and then the
 * shadow put away again.
 *
 * Wrapped rather than the two calls written out at each of the three sites,
 * because the thing that matters is that the shadow lands on **one fill and no
 * other pass**: left on, it follows the bevel stroke and the sheen inside
 * `LIVING_SKIN` and the body grows a second, blurred copy of itself.
 */
function standing(ctx: CanvasRenderingContext2D, arena: Arena, path: Path2D, dark: string): void {
  castShadow(ctx, arena);
  ctx.fillStyle = dark;
  ctx.fill(path);
  clearShadow(ctx);
}

/** One enemy: a slick or a bulb, in the red the field spends on a thing to shoot. */
export function drawSnakeEnemy(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  index: number,
  pulse: number,
): void {
  const slick = index % 2 === 0;
  const shape = livingSilhouette(slick ? "slick" : "bulb");
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * BODY;
  const scale = r / Math.max(shape.rx, shape.ry);
  // The contour's own wobble phase, taken off the beat the caller handed in
  // and the tile the body stands on: no wall clock, no rng, and two bodies on
  // two tiles that are never caught at the same moment of the same breath.
  const t = pulse + (col * 3 + row) * 0.37;
  const path = new Path2D(livingPath(shape, t));
  // The slick tilts and the bulb pumps, which is what each of them does on the
  // field. Both are read out of the same number, so neither needs a clock.
  const spin = slick ? (pulse - 0.5) * 0.34 : 0;

  ctx.save();
  ctx.translate(x, y);
  if (slick) ctx.rotate(spin);
  else ctx.scale(1 + (pulse - 0.5) * 0.1, 1 - (pulse - 0.5) * 0.1);
  ctx.scale(scale, scale);
  standing(ctx, arena, path, PALETTE.redDark);
  // The field's own creature skin, handed the rotation this transform carries
  // so the lit shoulder stays where the arena's light is while the body turns
  // under it. `rot` is the whole reason `BodyPaint` carries one.
  LIVING_SKIN.paint(ctx, path, "nonzero", {
    hex: PALETTE.red,
    rim: PALETTE.redRim,
    dark: PALETTE.redDark,
    r,
    scale,
    rx: shape.rx,
    ry: shape.ry,
    rot: spin,
  });
  ctx.restore();
}

/** How far a pod's flesh is carried from its deep toward its own amber. Under
 * `living-skin.ts`'s 0.42, because a pod carries a lit core and a creature does
 * not: the same mix that makes a slick solid makes a pod a lamp with a brighter
 * lamp inside it. */
const POD_FLESH = 0.3;

/** One point: the field's own pod, breathing where it was placed. */
export function drawSnakePoint(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  pulse: number,
): void {
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * 0.32;
  const scale = r / Math.max(POD.rx, POD.ry);
  const t = pulse + (col + row * 2) * 0.53;
  const path = splinePath(
    blobPoints(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, POD.wobble, t, POD.seed),
    true,
  );

  // The wide calm halo a moored pod carries. It is what says "this is not
  // coming for you", which in here is what says "drive over it".
  halo(ctx, x, y, r * (1.9 + 0.3 * pulse), PALETTE.pod, 0.12 + 0.08 * pulse);
  const lean = (pulse - 0.5) * 0.16;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(scale, scale);
  standing(ctx, arena, path, PALETTE.podDark);
  // Flesh, then the key light over it — `living-skin.ts`'s first two clauses
  // and not its whole skin, which belongs to creatures. A pod on the field is
  // its deep filled flat, and there it is right: the sky behind it is nearly
  // that colour, so the neon rim and the halo carry the whole shape. On a lit
  // floor the same fill is a hole with a rim round it, which is what the board
  // read as. The value half only, for the reason `LIGHT_HALF` gives a
  // creature — a pod's amber is a thing said out loud, and darkening is the
  // one operation that cannot move it.
  ctx.fillStyle = mixHex(PALETTE.podDark, PALETTE.pod, POD_FLESH);
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, Math.max(POD.rx, POD.ry), "value", lean);
  ctx.restore();
  strokeGlow(ctx, path, PALETTE.pod, Math.max(1, r * 0.11) / scale, 0.8 + 0.4 * pulse);
  ctx.globalAlpha = 0.55 + 0.45 * pulse;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * (0.26 + 0.05 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * The edges of one meteor: seven sides and no two the same length, because a
 * rock is the one thing here that should not look made.
 *
 * The lengths are a written-down list and not a roll, for `drawSnakeEnemy`'s
 * reason — two devices draw the same arena — and the same seven serve every
 * rock on the board, which at tile size is a texture rather than a repeat.
 */
const EDGES = [1, 0.82, 0.95, 0.78, 1.02, 0.86, 0.92];

/**
 * One meteor, drawn as the stone the field is full of.
 *
 * It lives here rather than in `snake-draw.ts` because it is a thing standing
 * on a tile and not part of the arena, and because it had the same defect as
 * the other two: a flat grey heptagon with a black dot on it, which is a
 * button. `STONE_LOOK` is the shipped rock — the pale face, the key light over
 * it, the rim — and its `pit` is a crater with a lit far wall rather than a
 * hole punched in the middle. What the arena adds is the shadow, the one fact
 * about a rock lying on a floor that a rock in space never needed.
 */
export function drawSnakeRock(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
): void {
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * 0.36;
  const path = new Path2D();
  for (const [i, mul] of EDGES.entries()) {
    const a = (i / EDGES.length) * Math.PI * 2;
    const px = Math.cos(a) * r * mul;
    const py = Math.sin(a) * r * mul;
    if (i === 0) path.moveTo(px, py);
    else path.lineTo(px, py);
  }
  path.closePath();

  ctx.save();
  ctx.translate(x, y);
  standing(ctx, arena, path, PALETTE.rockDark);
  // No turn: a meteor in this arena stands on a tile rather than tumbling, so
  // the light on it is the key light with nothing taken back out.
  STONE_LOOK.body(ctx, path, r, 0, 0);
  const { dx, dy } = keyAxis(0);
  STONE_LOOK.pit(ctx, r * 0.25, -r * 0.2, r * 0.22, dx, dy, r, 0);
  ctx.restore();
}
