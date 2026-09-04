import {
  isBossBody,
  isMeteorKind,
  recoilTurn,
  veilArmourPhase,
  type World,
  wispOnField,
} from "@neon-spore/sim";
import { drawCaromCrust } from "./carom.js";
import { claspResonance, drawClaspShield } from "./clasp.js";
import { creatureCenter } from "./creature-place.js";
import { drawDartJet } from "./dart.js";
import { byDepth, depthScale, drawnRow, nearness } from "./depth.js";
import { drawGhost, showsGhostBody } from "./ghost.js";
import { mountPlace } from "./gyre-place.js";
import type { Layout } from "./layout.js";
import { drawLid } from "./lid.js";
import { drawLidCords } from "./lid-string.js";
import { drawLiving } from "./living-draw.js";
import { drawMeteor } from "./meteor.js";
import { drawRecoilCage } from "./recoil.js";
import { drawTorch } from "./torch.js";
import { drawVeilCloud, showsVeilCore } from "./veil.js";
import { drawWisp, showsWisp, wispJump } from "./wisp.js";
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
    // A body on a rim is placed by the wheel that carries it, not by the walk
    // every falling body takes: it turns rather than crosses, and the arc is
    // written down once in `gyre-place.ts` so the rim, the spokes and the six
    // contours cannot come apart. Null for everything else, which is what keeps
    // this a line rather than a branch.
    const onRim = mountPlace(l, world, c, beatPhase, time);
    const { x, y } = onRim ?? creatureCenter(l, c, beatPhase);
    const row = onRim ? onRim.row : drawnRow(c, beatPhase);
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
    // Under the body it is pushing, so the contour sits on its own exhaust
    // rather than inside it. Inside the perspective transform with everything
    // else, so a jet at the bottom of the field grows the way its body does.
    if (c.kind === "dart") drawDartJet(ctx, l, c, x, y, beatPhase);
    if (c.kind === "torch") drawTorch(ctx, l, c, x, y, time);
    else if (isMeteorKind(c.kind)) drawMeteor(ctx, l, c, x, y, time);
    // A ghost has a contour of its own that is not a blob, so it is routed
    // away from `drawLiving` the way a rock is — and on player 1's screen it
    // is drawn as *nothing at all*, which is the creature. Not a faint body:
    // a halo, a glow pass and a rim all reach outside the contour they belong
    // to, so the colour would show as a rim of light around a column player 1
    // must not be able to name. `showsGhostBody` is the one gate (`ghost.ts`).
    else if (c.kind === "ghost") {
      if (showsGhostBody(l, world.cfg, c)) drawGhost(ctx, l, world.cfg, c, x, y, time, near);
    }
    // A veil is drawn as the body inside the cloud — `wornKind` again — but on
    // player 2's screen it is drawn as *nothing*, and the cloud alone stands
    // there. Not an opaque cloud over a hidden body: a halo, a motion trail
    // and a glow pass all reach outside the contour they belong to, so the
    // colour would show as a rim of light around a shape player 2 must not be
    // able to name. `showsVeilCore` is the one gate (`veil.ts`).
    // And the body that is drawn as *nothing at all* on the other screen. The
    // veil above hides what is inside a cloud both seats can see; this one is
    // not on player 1's field in any form, which is why it has no branch after
    // the draw the way the cloud does — there is no second half to lay over an
    // empty tile. `showsWisp` is the one gate (`wisp.ts`), and the teleport is
    // its own picture rather than `drawLiving` under a transform: it squashes,
    // stretches into a line and leaves a ring behind on the tile.
    else if (c.kind === "wisp") {
      if (showsWisp(l)) {
        drawWisp(
          ctx,
          l,
          world.cfg,
          c,
          x,
          y,
          time,
          beats,
          near,
          wispJump(world.cfg, world.beat, beatPhase),
        );
      }
    }
    // An armoured eye, and the second body with a contour of its own that is
    // not a blob: two arcs meeting at a corner either side, which no radial
    // contour describes (`content/lid-shape.ts`). Both screens draw the whole
    // of it — nothing about a lid is split — so unlike the ghost and the veil
    // above it has no gate, only a draw path of its own (`lid.ts`).
    else if (c.kind === "lid") drawLid(ctx, l, world.cfg, c, x, y, time, beats, near);
    // The last argument is THE RECOIL's colour turning over mid-knock-back —
    // one for every other body, and the whole of the crossing for that one
    // (`recoilTurn` in sim/recoil.ts, derived from the two fields the glide
    // itself is drawn between rather than from anything render remembers).
    else if (c.kind !== "veil" || showsVeilCore(l))
      drawLiving(
        ctx,
        l,
        c,
        x,
        y,
        beats,
        beatPhase,
        time,
        blocked.get(c.id) ?? 0,
        world.cfg,
        near,
        recoilTurn(c, beatPhase),
      );
    // The weather over that body, on both screens and identical on both — the
    // clasp's arrangement below, one creature earlier in the pass.
    if (c.kind === "veil") {
      const seen = showsVeilCore(l);
      const open = veilArmourPhase(world, c);
      drawVeilCloud(ctx, l, world.cfg, c, x, y, time, beats, near, open, seen);
    }
    // And THE CAROM's crust, on the same terms and for the same reason: it is
    // a shell around a body rather than a substitute for one, so `wornKind`
    // has already drawn the slick or the bulb burning inside it. Both screens
    // get the whole of it — nothing about a carom is split — so there is no
    // gate, only a draw of its own. Nothing is drawn for the rock it becomes:
    // by then `c.kind` is `meteor` and `drawMeteor` far above has it.
    if (c.kind === "carom") drawCaromCrust(ctx, l, world.cfg, c, x, y, time, beatPhase, near);
    // And THE RECOIL's cage, on the same terms and for the same reason: it is
    // a frame around a body rather than a substitute for one, so `wornKind`
    // has already drawn the slick or the bulb inside it in whichever colour
    // this bounce left it. Both screens get the whole of it — nothing about a
    // recoil is split — so there is no gate, only a draw of its own.
    if (c.kind === "recoil") drawRecoilCage(ctx, l, world.cfg, c, x, y, time, near);
    // The clasp's shield goes on *after* the body, because it is a membrane
    // around one and not a substitute for one — `wornKind` has already drawn
    // the slick or the bulb inside, in its own colour, which is what player 2
    // has to be able to read through it (`clasp.ts`).
    if (c.kind === "clasp") {
      drawClaspShield(
        ctx,
        l,
        world.cfg,
        x,
        y,
        time,
        near,
        claspResonance(world.shieldCol, c.col),
        claspImage,
      );
    }
    ctx.restore();
  }
  // The cords, after every body: flat, outside the perspective transform, and
  // last so that a handle is never behind the eye it hangs off or behind the
  // body in the next column (`lid-string.ts`).
  drawLidCords(ctx, l, world, beatPhase, time);
}
