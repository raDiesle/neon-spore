import {
  beadIsActive,
  beadIsSpent,
  type CreatureKind,
  colourArmourLeft,
  isMeteorKind,
  recoilTurn,
} from "@neon-spore/sim";
import { drawBalloon } from "./balloon.js";
import { drawChoir } from "./choir.js";
import type { Body } from "./creature-body-in.js";
import { drawGhost, showsGhostBody } from "./ghost.js";
import { drawLid } from "./lid.js";
import { drawLiving } from "./living-draw.js";
import { MAGNET_LOOK } from "./magnet.js";
import { drawMeteor } from "./meteor.js";
import { showsBeadColor } from "./strand.js";
import { drawRaisin, STRAND_LOOK } from "./strand-bead.js";
import { drawStillBead } from "./strand-still.js";
import { drawTorch } from "./torch.js";
import { showsVeilCore } from "./veil.js";
import { showsVolleyCore } from "./volley.js";
import { drawWisp, showsWisp, wispJump } from "./wisp.js";

/**
 * **Which draw path a body gets, as a table rather than a chain.**
 *
 * `drawCreatures` used to pick with one long `if / else if` — torch, rock,
 * ghost, wisp, lid, then a fall-through to `drawLiving`. Adding THE VEER put a
 * plain `if` between two rungs of it and severed the chain: every kind after
 * the cut fell through to `drawLiving`, and a torch was asked for a silhouette
 * it has not got. Four frame tests caught that one because those kinds happen
 * to throw; a kind that merely looked wrong would have shipped.
 *
 * A lookup cannot be severed by a statement landing in the middle of it, which
 * is the whole of why this file exists. What it holds is only the **exclusive**
 * half — the one body draw a creature gets. The things laid *over* a body (the
 * carom's crust, the volley's shell, the recoil's cage, the veer's rider, the
 * clasp's membrane) stay as the separate `if`s they already are in the caller,
 * because they are additions rather than choices.
 */

// **What a body draw is handed** — the `Body` type — is `creature-body-in.ts`
// next door, cut out when THE BALLOON's row took this file over its 250-line
// limit. The seam is `touch-field.ts`' exactly: that is a *shape*, and this is
// the decision procedure that reads one. Re-exported below, so nothing that
// already reached for a `Body` through this file had to move.
export type { Body } from "./creature-body-in.js";

type BodyDraw = (b: Body) => void;

/** The rock draw, and the only one a body gets from `isMeteorKind` alone. */
function drawMeteorBody({ ctx, l, c, x, y, time }: Body): void {
  drawMeteor(ctx, l, c, x, y, time);
}

/**
 * A torch is a rock by `isMeteorKind` and has a body of its own regardless, so
 * it sits in the table where the table wins.
 */
function drawTorchBody({ ctx, l, c, x, y, time }: Body): void {
  drawTorch(ctx, l, c, x, y, time);
}

/**
 * A ghost has a contour of its own that is not a blob, so it is routed away
 * from `drawLiving` the way a rock is — and on player 1's screen it is drawn as
 * *nothing at all*, which is the creature. Not a faint body: a halo, a glow
 * pass and a rim all reach outside the contour they belong to, so the colour
 * would show as a rim of light around a column player 1 must not be able to
 * name. `showsGhostBody` is the one gate (`ghost.ts`).
 */
function drawGhostBody({ ctx, l, world, c, x, y, time, near }: Body): void {
  if (showsGhostBody(l, world.cfg, c)) drawGhost(ctx, l, world.cfg, c, x, y, time, near);
}

/**
 * The body that is drawn as *nothing at all* on the other screen. THE VEIL
 * below hides what is inside a cloud both seats can see; this one is not on
 * player 1's field in any form, which is why it has no second half to lay over
 * an empty tile. `showsWisp` is the one gate (`wisp.ts`), and the teleport is
 * its own picture rather than `drawLiving` under a transform: it squashes,
 * stretches into a line and leaves a ring behind on the tile.
 */
function drawWispBody({ ctx, l, world, c, x, y, time, beats, beatPhase, near }: Body): void {
  if (!showsWisp(l)) return;
  const jump = wispJump(world.cfg, world.beat, beatPhase);
  drawWisp(ctx, l, world.cfg, c, x, y, time, beats, near, jump);
}

/**
 * An armoured eye, and the second body with a contour of its own that is not a
 * blob: two arcs meeting at a corner either side, which no radial contour
 * describes (`content/lid-shape.ts`). Both screens draw the whole of it —
 * nothing about a lid is split — so unlike the ghost and the wisp it has no
 * gate, only a draw path of its own (`lid.ts`).
 */
function drawLidBody({ ctx, l, world, c, x, y, time, beats, near }: Body): void {
  drawLid(ctx, l, world.cfg, c, x, y, time, beats, near);
}

/**
 * A horseshoe on two coloured poles with an armoured plate under it, and the
 * third body with a contour of its own that is no blob: a band with a hole
 * through it and an opening at the bottom, which no radial contour describes
 * (`content/magnet-shape.ts`). Both screens draw the whole of it — nothing
 * about a magnet is hidden — so it has no gate, only a draw path of its own.
 *
 * Through the record rather than by calling the draw directly, for
 * `drawStrandBody`'s reason: a candidate look is a field patched onto
 * `MAGNET_LOOK` for the length of one frame (`docs/versus.md`).
 */
function drawMagnetBody(b: Body): void {
  MAGNET_LOOK.body({
    ctx: b.ctx,
    l: b.l,
    cfg: b.world.cfg,
    c: b.c,
    x: b.x,
    y: b.y,
    beats: b.beats,
    // The same map a wrong colour writes to, read here as the seconds of white
    // left on the plate after it turned a bolt away (`effects-ingest.ts`).
    struck: b.blocked.get(b.c.id) ?? 0,
    near: b.near,
  });
}

/**
 * The ordinary blob, and what a kind nobody has listed here gets.
 *
 * A veil is drawn as the body inside the cloud — `wornKind` again — but on
 * player 2's screen it is drawn as *nothing*, and the cloud alone stands there.
 * A volley with every plate still on is drawn as nothing under its shell, and
 * that is the owner's own instruction rather than a flourish: the ball is
 * opaque and the only colour on it is the seams. Both for one reason — a halo,
 * a rim and a glow pass all reach outside the contour they belong to, so the
 * colour would show as a ring of light around the one thing holding the body
 * back. `showsVeilCore` and `showsVolleyCore` are the two copies of that gate.
 */
function drawLivingBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, beats, beatPhase, near } = b;
  if (c.kind === "veil" && !showsVeilCore(l)) return;
  if (!showsVolleyCore(world.cfg, c)) return;
  drawLiving(
    ctx,
    l,
    c,
    x,
    y,
    beats,
    beatPhase,
    time,
    // The longer of the two: the spark render/ holds for a third of a second
    // off any `reject`, and the window the simulation is really refusing shots
    // in when the reject was a wrong colour. Read off the world rather than
    // timed here, so the grey body and the shot that bounces off it can never
    // be two different lengths (`sim/colour-armour.ts`).
    Math.max(b.blocked.get(c.id) ?? 0, colourArmourLeft(world, c)),
    world.cfg,
    near,
    recoilTurn(c, beatPhase),
  );
}

/**
 * One bead of THE STRAND, and the only row in this table whose answer depends
 * on **which screen is asking**.
 *
 * A bead already shot is a raisin on both, because how far along the thread
 * the pair has got is the one fact about this creature that is not split. A
 * live one is the slick or the bulb its colour names on the pilot's screen —
 * the ordinary living draw, `wornKind` and all — and on the navigator's a reel
 * rolling between the two of them. Deliberately not the real body drawn grey:
 * a slick is flat and a bulb is round, so the silhouette alone would name the
 * colour, which is `showsVeilCore`'s argument about a halo said about a shape
 * instead (`strand-bead.ts`).
 *
 * And only the bead a shot can actually answer rolls. The rest of the thread
 * is that same reel stopped and drawn as a grey outline — the wrong-colour
 * look, which already means *nothing reaches this* — so the navigator's screen
 * says which one is live in the body itself as well as under the arrow
 * (`strand-still.ts`).
 */
function drawStrandBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, near } = b;
  const bead = { ctx, l, cfg: world.cfg, c, x, y, time, beatPhase: b.beatPhase, near };
  if (beadIsSpent(c)) {
    drawRaisin(bead);
    return;
  }
  // Through the record rather than by calling the reel directly: a candidate
  // look is a field patched onto `STRAND_LOOK` for the length of one draw, and
  // a draw path that named the function would never see it (`docs/versus.md`).
  if (!showsBeadColor(l)) {
    if (beadIsActive(world, c)) STRAND_LOOK.bead(bead);
    else drawStillBead(bead);
    return;
  }
  drawLivingBody(b);
}

/** The kinds whose body is not the ordinary blob and not a rock. */
const EXCLUSIVE: ReadonlyMap<CreatureKind, BodyDraw> = new Map<CreatureKind, BodyDraw>([
  ["torch", drawTorchBody],
  // THE COIL is a rock and is **not** an `isMeteorKind` — the shield strips its
  // dome rather than turning it away, so it is not in that list and would fall
  // through to `drawLiving`, which would ask a body with no contour for one
  // and throw. A row here rather than a name in `kinds.ts`: what it looks like
  // and what answers it are two questions, and this file is the first.
  ["coil", drawMeteorBody],
  ["ghost", drawGhostBody],
  ["wisp", drawWispBody],
  ["lid", drawLidBody],
  ["strand", drawStrandBody],
  ["magnet", drawMagnetBody],
  // Three dots in a membrane, and the one body with no blob contour because it
  // is not one body yet: `living-look.ts` answers `null`, so `drawLiving`
  // would ask for a silhouette that does not exist. `drawChoir` takes a `Body`
  // rather than loose arguments so this stays a row instead of a wrapper —
  // `MAGNET_LOOK.body` next door already reads its own record the same way.
  ["choir", drawChoir],
  // A skin two hands change the shape of, which is why `living-look.ts`
  // answers `null` for it and `drawLiving` cannot have it (`balloon.ts`).
  ["balloon", drawBalloon],
]);

/**
 * The one body draw this kind gets.
 *
 * `isMeteorKind` rather than five rows for the five tiers: the list of rocks is
 * the simulation's to keep, and a sixth tier added there must not need a second
 * entry here to be drawn as a rock. The table is asked first because the torch
 * and THE VEER are rocks by that rule and the torch has a body of its own —
 * THE VEER has not, so it takes the rock draw and its rider is laid over the
 * top by the caller.
 */
export function bodyDraw(kind: CreatureKind): BodyDraw {
  return EXCLUSIVE.get(kind) ?? (isMeteorKind(kind) ? drawMeteorBody : drawLivingBody);
}
