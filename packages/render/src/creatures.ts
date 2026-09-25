import { isBossBody, recoilTurn, type World, wispOnField } from "@neon-spore/sim";
import { drawBalloonHandles } from "./balloon-handles.js";
import type { CoilFlightFx } from "./coil-flight.js";
import { bodyDraw } from "./creature-body.js";
import { drawOverBody } from "./creature-over.js";
import { centerAt, creatureCenter } from "./creature-place.js";
import { DART_LOOK } from "./dart-look.js";
import { byDepth, depthScale, drawnRow, glidePhase, nearness } from "./depth.js";
import { drawProjected } from "./flip-reveal.js";
import { mountPlace } from "./gyre-place.js";
import type { SurfaceY } from "./hull-frame.js";
import { landingY } from "./landing.js";
import type { Layout } from "./layout.js";
import { drawLidCords } from "./lid-string.js";
import type { RecoilLeapFx } from "./recoil-leap.js";
import { drawWeightPress } from "./weight.js";
import { showsWisp } from "./wisp.js";
import { drawWispGround } from "./wisp-ground.js";
import { drawWispSearch, showsWispSearch } from "./wisp-search.js";

/**
 * Creature silhouettes come from `legacy/style-guide.html` by way of
 * `content/shapes.ts`: one blob contour per kind, tuned by lobes, depth and
 * wobble. The wobble is time-based, so a creature is never quite still.
 *
 * On top of the contour sits the own-motion the raster prototype gives each
 * kind. Spec 5.8 is strict about what it may touch: **nothing**. The bulb
 * sways and pumps, the slick tilts and ripples, but neither ever leaves its
 * column, so the lane stays exactly readable while the picture stays alive.
 *
 * The pose is sampled on `beat + beatPhase`, which both devices derive from
 * the same tick counter — not on `time`, which is `performance.now()` and is
 * therefore a different number on each phone. See `content/own-motion.ts`.
 */
export function drawCreatures(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
  blocked: ReadonlyMap<number, number>,
  claspImage: CanvasImageSource | null = null,
  /** The ship's plating, for the glides that end *in* it: every body's last
   * one (`landing.ts`). Absent, a body lands on its row's centre. */
  skinY?: SurfaceY,
  /** THE RECOIL's throw: where a struck recoil is drawn for the beat after
   * the hit, and how far its colour has turned (`recoil-leap.ts`). Absent,
   * a recoil glides the way the simulation wrote it, jump and all. */
  leaps?: RecoilLeapFx,
  /** THE COIL's throw: where a rock out of a dome is drawn for the rest of
   * the beat it was freed in, and the dome its tail runs from
   * (`coil-flight.ts`). Absent, it glides the way the simulation wrote it. */
  flights?: CoilFlightFx,
): void {
  // The pose clock, in beats. `beatPhase` alone would restart it every beat.
  const beats = world.beat + beatPhase;
  // The two halves of a wisp that are not the body, both flat — outside the
  // per-body perspective transform below, because a mark that names a square
  // has to be *on* that square (`wisp-ground.ts`).
  //
  // On the navigator's screen: the pool of light under it, the arc it is
  // flying and the tile it is coming down on, all behind `showsWisp`, because
  // the landing marker is the one thing player 1 must never have. On the
  // pilot's: a target-lock frame walking the grid, which knows nothing about
  // where anything is and says so (`wisp-search.ts`). The rig draws both.
  if (wispOnField(world)) {
    if (showsWisp(l)) drawWispGround(ctx, l, world, beatPhase);
    if (showsWispSearch(l)) drawWispSearch(ctx, l, world.cfg, time);
  }
  // Farthest first: which of two overlapping bodies is in front used to be
  // decided by spawn order, which is not a fact about the picture. See
  // `byDepth` — it copies rather than sorting the simulation's own array.
  for (const c of byDepth(world.creatures, beatPhase)) {
    // A boss body is drawn by `boss-draw.ts`, because its picture depends on
    // `world.boss` and not on the creature alone — and so is the tether, which
    // is a line down a column rather than a thing standing on a tile.
    if (isBossBody(c.kind) || c.kind === "tether") continue;
    // And THE GYRE's hub, which is an armature spanning five rows rather
    // than a body on a tile. `gyre.ts` draws every wheel in one pass before
    // this one, because `byDepth` sorts body by body and a hub taking its
    // turn in that order would have its spokes over the mounts above it and
    // under the ones below. The six on its rim are `mount`s and go through
    // the ordinary living draw below, which is the whole creature.
    if (c.kind === "gyre") continue;
    // And every link of a worm, for the hub's reason with a sharper edge: the
    // rings of a crawler *overlap*, each leading dome over the tucked tail of
    // the one behind it, so the run has to be painted back to front — and
    // `byDepth` sorts on the row, which every link of a worm shares.
    // `drawCrawlers` above has already drawn the whole of it (`crawler.ts`).
    if (c.kind === "crawler") continue;
    // And a wall, for the crawler's reason with nothing left over: it is not a
    // body on a tile at all, and `drawFences` above has already drawn the
    // whole of it. One that fell through here would be handed to `drawLiving`
    // and drawn as a blob standing in column zero.
    if (c.kind === "fence") continue;
    // A body on a rim is placed by the wheel that carries it, not by the walk
    // every falling body takes: it turns rather than crosses, and the arc is
    // written down once in `gyre-place.ts` so the rim, the spokes and the six
    // contours cannot come apart. Null for everything else, which is what keeps
    // this a line rather than a branch.
    const onRim = mountPlace(l, world, c, beatPhase, time);
    // A balloon's step is spread over several beats, and `glidePhase` is the
    // one place that is asked (`depth.ts`); everything else glides by the beat.
    const glide = glidePhase(world.cfg, world.beat, c, beatPhase);
    // A struck recoil is on a throw of its own for a beat, placed by the
    // transient that remembers where it left from; every other frame of a
    // recoil, and every other body, is where the simulation's glide puts it.
    const leap = c.kind === "recoil" ? leaps?.place(c, beats, beatPhase) : undefined;
    // And a torch out of a dome is on a throw of its own to the far wall,
    // placed by the transient that saw the dome go, landing where the sim's
    // glide would have — so the impact takes it over in the same place.
    const flown = c.kind === "torch" ? flights?.place(c, l, beats, skinY) : undefined;
    const placed =
      onRim ??
      flown ??
      (leap ? centerAt(l, c, leap.row, leap.col) : creatureCenter(l, world, c, glide));
    const x = placed.x;
    // A landing beat ends half-sunk in the skin and not under the membrane at
    // the hull row's centre: a rock so that `RockImpactFx` takes it over where
    // it stands, everything else so that the beat it is seen to touch the ship
    // is the beat the ship answers (`landing.ts`).
    const y = onRim || flown ? placed.y : landingY(l, world.cfg, c, x, placed.y, glide, skinY);
    const row = onRim ? onRim.row : flown ? flown.row : leap ? leap.row : drawnRow(c, glide);
    const turn = leap ? leap.turn : recoilTurn(c, beatPhase);
    const near = nearness(l, row);
    // Perspective as one transform about the body's own centre, rather than a
    // radius threaded through three drawing files: it takes the rock and the
    // torch with it, and it scales their line weights by the same factor, so
    // the style guide's "1.2–1.8 px at 26 px object size" survives the growth.
    const k = depthScale(world.cfg, l, row);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.translate(-x, -y);
    // Under THE FLIP, the whole body — jet, contour and whatever covers it —
    // goes through the projection's tear near the hull (`flip-reveal.ts`).
    drawProjected(ctx, l, c.id, row, x, y, time, () => {
      // Under the body it is pushing, so the contour sits on its own exhaust
      // rather than inside it. Inside the perspective transform with everything
      // else, so a jet at the bottom of the field grows the way its body does.
      if (c.kind === "dart") DART_LOOK.jet(ctx, l, c, x, y, beatPhase);
      // **The one body draw, chosen by a table** (`creature-body.ts`). It used to
      // be an `if / else if` chain here, and adding THE VEER put a plain `if`
      // between two of its rungs: every kind after the cut fell through to
      // `drawLiving`, and a torch was asked for a silhouette it has not got. A
      // lookup cannot be severed by a statement landing in the middle of it,
      // which is why the choice moved out and the things laid *over* a body
      // stayed here as the separate `if`s they already were.
      bodyDraw(c.kind)({
        ctx,
        l,
        world,
        c,
        x,
        y,
        time,
        beats,
        beatPhase,
        near,
        blocked,
        turn,
        tailFrom: flown?.from,
      });
      // Everything laid *over* that body — the veil's cloud, the carom's crust,
      // the coil's dome, the clasp's shield — is `creature-over.ts`: one `if` per
      // covering, each an addition to what the table drew, inside this transform.
      drawOverBody(ctx, l, world, c, x, y, time, beats, beatPhase, near, turn, claspImage);
    });
    ctx.restore();
  }
  // The cords, after every body: flat, outside the perspective transform, and
  // last so that a handle is never behind the eye it hangs off or behind the
  // body in the next column (`lid-string.ts`).
  drawLidCords(ctx, l, world, beatPhase, time);
  // And THE BALLOON's two handles, on exactly the same terms and last for the
  // same reason: they are flat, they are hit-tested against the circle they
  // are drawn at, and a handle behind the body in the next lane is a handle a
  // thumb cannot find (`balloon-handles.ts`).
  drawBalloonHandles(ctx, l, world, beatPhase, time);
  // And the pressure on THE WEIGHT, last and flat for the handles' reasons —
  // with one of its own that no other overlay has: what it draws depends on
  // **which screen this is**, because a hand on a weight is shown to the seat
  // whose hand it is and to nobody else (`weight.ts`).
  drawWeightPress(ctx, l, world, beatPhase, time);
}
