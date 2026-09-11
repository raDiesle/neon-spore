import { beatboxArms, type CreatureSilhouette } from "@neon-spore/content";
import {
  beatboxHitsMade,
  type CreatureKind,
  colourArmourLeft,
  isMeteorKind,
} from "@neon-spore/sim";
import { drawBalloon } from "./balloon.js";
import { beatboxArmGrown, beatboxSwell } from "./beatbox.js";
import { drawBeatboxAir } from "./beatbox-air.js";
import { beatboxWash } from "./beatbox-wash.js";
import { drawChoir } from "./choir.js";
import { drawChokeBody } from "./choke.js";
import { drawCountMarks } from "./countdown.js";
import type { Body } from "./creature-body-in.js";
import { drawMagnetBody, drawStrandBody } from "./creature-body-worn.js";
import { livingBodyMul } from "./creature-place.js";
import type { Wash } from "./creature-tint.js";
import { drawCrystalBody } from "./crystal.js";
import { drawGhost, showsGhostBody } from "./ghost.js";
import { drawGumBody } from "./gum.js";
import { drawLid } from "./lid.js";
import { drawLiving } from "./living-draw.js";
import { drawMeteor } from "./meteor.js";
import { MOUNT_LOOK } from "./mount-look.js";
import { rindWears } from "./rind-look.js";
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
 * `drawMagnetBody` and `drawStrandBody`, the two body draws that read their
 * own record rather than calling a draw function directly, live in
 * `creature-body-worn.ts` next door — cut out when THE BEATBOX's row took
 * this file over its 250-line limit.
 */

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
/**
 * A soundbox: the air it is moving, and then the body itself with however many
 * arms the run standing on it has grown.
 *
 * It takes the ordinary blob draw and is listed here anyway, because three
 * things about it are decided per *body* rather than per kind and none of them
 * can be answered by a lookup on a silhouette.
 *
 * - The **swell**, which changes several times a beat: a pulse on every beat
 *   and a much bigger one on a beat a thumb landed (`beatbox.ts`). It is
 *   passed as a swell rather than folded into `livingBodyMul`, which is the
 *   size a thumb is hit-tested against and must not move inside a beat.
 * - The **arms**, one per beat the pair got right, walked out of the body's
 *   own rim so each is the same mass as the box rather than a shape drawn
 *   beside it (`content/silhouettes-beatbox.ts`).
 * - The **alarm**, for the two beats after a run comes apart.
 *
 * The air goes down first and under everything, so the rings leave from behind
 * the body rather than across it (`beatbox-air.ts`).
 */
function drawBeatboxBody(b: Body): void {
  const swell = beatboxSwell(b.c, b.world.beat, b.beatPhase);
  const r = b.l.tile * 0.4 * livingBodyMul(b.c) * swell;
  drawBeatboxAir(b.ctx, b.world, b.c, b.x, b.y, r, b.beatPhase);
  const shape = beatboxArms(beatboxHitsMade(b.c), beatboxArmGrown(b.world, b.c));
  drawLivingBody(b, swell, shape, beatboxWash(b.world, b.c, b.beatPhase));
}

export function drawLivingBody(b: Body, swell = 1, shape?: CreatureSilhouette, wash?: Wash): void {
  const { ctx, l, world, c, x, y, time, beats, beatPhase, near } = b;
  if (c.kind === "veil" && !showsVeilCore(l)) return;
  if (!showsVolleyCore(world.cfg, c)) return;
  // A rind under a look that gives it a body of its own wears that body while
  // it has a layer on, the way a soundbox wears its arms: a contour that is a
  // fact about this body now rather than about its kind (`rind-look.ts`).
  const over = shape ?? rindWears(c, world.cfg);
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
    b.turn,
    swell,
    over,
    wash,
  );
}

/** The kinds whose body is not the ordinary blob and not a rock. */
const EXCLUSIVE: ReadonlyMap<CreatureKind, BodyDraw> = new Map<CreatureKind, BodyDraw>([
  ["torch", drawTorchBody],
  // THE COIL is a rock and **not** an `isMeteorKind` — the shield strips its
  // dome rather than turning it away — so without a row it would fall through
  // to `drawLiving` and ask a body with no contour for one.
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
  // A soundbox, and the one row here whose draw *is* `drawLivingBody` — see
  // its own header. A row rather than a branch inside that function, because
  // this table is the place a kind's draw is decided and a lone `if` in the
  // fall-through is exactly the severed chain this file exists to prevent.
  ["beatbox", drawBeatboxBody],
  // A skin two hands change the shape of, which is why `living-look.ts`
  // answers `null` for it and `drawLiving` cannot have it (`balloon.ts`).
  ["balloon", drawBalloon],
  // A slick or a bulb on a wheel's rim, by `drawLivingBody` — with the contour
  // left to `MOUNT_LOOK.shape`, `undefined` as it ships (`mount-look.ts`).
  ["mount", (b) => drawLivingBody(b, 1, MOUNT_LOOK.shape(b))],
  // Two bodies in one shell: a slick and a bulb by `drawLiving`, each in its
  // own tile, and the shell and the join drawn over them (`crystal.ts`).
  ["crystal", drawCrystalBody],
  // A sac in the air and nothing at all once it is stuck: the smear is drawn
  // over the ship by `drawStuckGums`, from `canvas2d.ts` (`gum.ts`).
  ["gum", drawGumBody],
  // And THE CHOKE, the same arrangement: the strand in the air here, the
  // loops on the cannon over the ship by `drawStuckChokes` (`choke.ts`).
  ["choke", drawChokeBody],
  // THE COUNT: the ordinary body, and on the pilot's screen only, the marks
  // cut into its rim over the top (`countdown.ts`).
  [
    "countdown",
    (b) => {
      drawLivingBody(b);
      drawCountMarks(b);
    },
  ],
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
