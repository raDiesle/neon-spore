import {
  balloonHeld,
  balloonPull,
  balloonTension,
  type Creature,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { balloonRy } from "./balloon.js";
import { creatureCenter } from "./creature-place.js";
import { glidePhase } from "./depth.js";
import { strokeGlow } from "./glow.js";
import { drawHandleHint, drawHandleRing, type HintStyle, handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE BALLOON's two handles**: the one thing on this field that two people
 * take hold of at the same time.
 *
 * Every handle before this one was the pilot's — THE MAZE's string, THE
 * WARDEN's rope, THE LID's cord, THE CHOIR's two arrows — and each of their
 * files says so in the same sentence: player 2 fires and carries both colours,
 * so a gate either seat could open would be a creature one phone could play.
 * This creature answers that from the other end. It cannot be played by one
 * phone *because there are two handles*, and the sides are fixed in advance —
 * the left is the pilot's and the right is the navigator's — so the only thing
 * left to say out loud is which body (`sim/balloon-pull.ts`).
 *
 * **Both are drawn on both screens, and that is the point.** Every other
 * handle in the game is drawn where it can be used and dimmed where it cannot;
 * here each seat has to be able to see the *other* one moving, because the
 * moment they are both taut is a moment neither of them can feel. The one that
 * is yours is bright and the one that is not is dim, which is the same rule
 * `drawHandleHint` already applies to a word — said about a control instead.
 *
 * **Flat, outside the perspective transform, and its own pass**, for
 * `lid-string.ts`' reason word for word: a handle is hit-tested against the
 * circle it is drawn at, and a circle scaled by the row it is on is a control
 * that changes size under the thumb.
 */

/** Which seat owns which side. One place, asked by the drawing and by the hit
 * test, so a handle can never be answered for a seat it was not drawn for. */
export function balloonHandleSeat(side: -1 | 1): 1 | 2 {
  return side === -1 ? 1 : 2;
}

/**
 * Where one of this balloon's handles rests, with no hand on it.
 *
 * **The one place it is written down.** `handles.ts` answers a press exactly
 * here and this file draws exactly here — a button drawn in one place and
 * answered in another is a button that works until somebody moves one of them.
 *
 * It reads nothing about the pull: a press is tested against the resting
 * circle whatever the skin is doing. The handle travels while it is dragged
 * and that costs nothing, because by then the pointer is captured and nothing
 * is hit-tested again.
 */
export function balloonHandleCircle(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  beat: number,
  beatPhase: number,
  side: -1 | 1,
): Circle {
  // The beat as well as the phase, because a balloon's step is spread over
  // several of them and the body is drawn part-way along it (`glidePhase`).
  const { x, y } = creatureCenter(l, c, glidePhase(cfg, beat, c, beatPhase));
  // How far off the body it hangs is the simulation's number, not this file's:
  // it is the same figure the rule uses to place the thing a hand takes hold
  // of, so a handle drawn wide of its own circle is impossible by arithmetic.
  return { x: x + (side * l.tile * cfg.balloonHandleMilli) / 1000, y, r: handleRadius(l, cfg) };
}

/** Where it actually stands: its rest plus how far the hand has carried it.
 * The pull is thousandths of a tile, which is what `l.tile` turns back into
 * pixels — and the rule has already cut it to taut, so nothing here bounds it
 * a second time (`sim/balloon-pull.ts`). */
function handleAt(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  beat: number,
  beatPhase: number,
  side: -1 | 1,
): Circle {
  const rest = balloonHandleCircle(l, cfg, c, beat, beatPhase, side);
  const pull = balloonPull(c, balloonHandleSeat(side));
  return { ...rest, x: rest.x + (pull * l.tile) / 1000 };
}

/** Every handle on the field, drawn flat. Called from `drawCreatures` after
 * the bodies, so a handle is never behind the body it hangs off or behind a
 * body in the next lane. */
export function drawBalloonHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const beats = world.beat + beatPhase;
  for (const c of world.creatures) {
    if (c.kind !== "balloon") continue;
    for (const side of [-1, 1] as const) {
      drawOne(ctx, l, world, c, side, beatPhase, time, beats);
    }
  }
}

function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  side: -1 | 1,
  beatPhase: number,
  time: number,
  beats: number,
): void {
  const cfg = world.cfg;
  const player = balloonHandleSeat(side);
  const head = handleAt(l, cfg, c, world.beat, beatPhase, side);
  const held = balloonHeld(c, player);
  const pull = balloonTension(cfg, c, player) / 1000;
  // Whose it is on *this* screen. The rig sees both as its own, which is what
  // makes a two-seat control drawable in one frame for a test.
  const mine = l.role === "test" || (l.role === "p1") === (player === 1);
  const body = creatureCenter(l, c, glidePhase(cfg, world.beat, c, beatPhase));

  // The tab: a short line from the skin out to the ring, so the handle reads
  // as attached to this body and not to the one in the next lane. It starts at
  // the body's own edge, which grows as the body swells.
  const edge = balloonRy(l, cfg, c, beats) * 0.82;
  const tab = new Path2D();
  tab.moveTo(body.x + side * edge, body.y);
  tab.lineTo(head.x - side * head.r * 0.9, head.y);
  strokeGlow(ctx, tab, mine ? PALETTE.text : PALETTE.dim, STROKE.inner, held ? 1.1 : 0.45);

  drawHandleRing(ctx, {
    x: head.x,
    y: head.y,
    r: head.r,
    hex: mine ? PALETTE.rock : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull,
    time,
  });
  if (!held) hint(ctx, l, head, side);
}

/**
 * Which way this one has to go, and whose it is.
 *
 * `drawHandleHint`'s three older callers say "PULL" to the pilot and "PILOT'S"
 * to the navigator, because every handle written before this one was the
 * pilot's. Here each seat has one, so the word names the *direction* instead:
 * the pair already knows whose side is whose, and what a thumb needs told is
 * that this control is carried outward rather than pressed. Both seats read the
 * same arrow — it is the brightness, not the word, that says whose it is.
 */
const HINT_BALLOON: HintStyle = { fontTiles: 0.22, mine: 0.8, theirs: 0.35 };

function hint(ctx: CanvasRenderingContext2D, l: Layout, head: Circle, side: -1 | 1): void {
  const word = side === -1 ? "◀ PULL" : "PULL ▶";
  drawHandleHint(ctx, l, l.role, head.x, head.y + l.tile * 0.58, HINT_BALLOON, {
    seat: balloonHandleSeat(side),
    mine: word,
    theirs: word,
  });
}
