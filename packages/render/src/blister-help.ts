import {
  type BlisterSwipeWay,
  blisterBlowsLeft,
  blisterBlowsOf,
  blisterGestureOf,
  blisterHoldShare,
  blisterIsUp,
  blisterLengthMilliOf,
  blisterMayTap,
  blisterRubbing,
  blisterStrokes,
  blisterSwipeHeld,
  blisterSwipeShare,
  blisterWayOf,
  type Creature,
  gripsCreature,
  type World,
} from "@neon-spore/sim";
import { blisterRise } from "./blister.js";
import { drawBlisterBlows } from "./blister-blows.js";
import { drawBlisterLever } from "./blister-lever-help.js";
import { drawBlisterTurn } from "./blister-turn-help.js";
import { flatCenter, flatRadius } from "./creature-place.js";
import { handleRadius } from "./handle-draw.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkWait } from "./mark-feedback.js";
import { drawMarkHeld } from "./mark-progress.js";
import { PALETTE } from "./palette.js";
import { drawPressDrop } from "./press-drop.js";
import { drawPullKnob, PULL_SIZE } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack } from "./pull-track.js";
import { drawRubDrop } from "./rub-drop.js";
import { drawSoakHold } from "./soak-hold.js";

/**
 * **THE BLISTER's help for all seven gestures**, called and not drawn anew
 * (`docs/controls-catalogue.md`): the same pieces every mark in the game
 * wears, laid over and round a body that is up.
 *
 * - On the seat that may knock it down: `drawMarkHalo` inside the body, THE
 *   PRESS LAB's drop every press wears (`press-drop.ts`) over it — yellow,
 *   calling *tap*, STEPS' water a terrace a blow. The owner, 15 October
 *   2026: *they should follow our standard tap control visuals*; it was the
 *   tap's flaring dots (`drawInstarGlyph`) until then.
 * - **The count**, on the seat that may, round every gesture's help: one pip
 *   a blow still owed (`blister-blows.ts`), only on a body that takes more
 *   than one — one blow is every default, and a one-blow body wears none.
 * - On the seat that may not: the waiting clock over it (`drawMarkWait`) —
 *   never the gesture, which reads as *your next move* (`mark-feedback.ts`).
 * - HOLD, on the seat that may: the HOLD LAB's drop every hold wears
 *   (`soak-hold.ts`) in the tap's place, its water welling out to the rim as
 *   the beat in progress fills, and the halo only while no hand is on it. On both screens, while a hand that counts is on it, the
 *   steady green ring a held mark wears (`drawMarkHeld`).
 * - SWIPE, on the seat that may: the PULL LAB's pull every pull wears — the
 *   knob on the body with the way in it, and the thin channel a stroke long
 *   out that way, filling green as the furthest open stroke comes (the owner,
 *   13 October 2026, on THE BLISTER'S SWIPE: *also should use default pull
 *   control we have, no custom one*). The partner is drawn the waiting clock,
 *   never the way.
 * - TURN, on the seat that may: THE MAZE's turn round the body — channel,
 *   lever and knob, filling green as the turn goes round
 *   (`blister-turn-help.ts`). The partner, again, the waiting clock.
 * - RUB, on the seat that may: THE RUB LAB's drop every rub wears, ZIGZAG on
 *   it a stroke for every blow the blister asks, lit as they land
 *   (`rub-drop.ts`), and the halo while no hand is rubbing.
 * - COMBO, on the seat that may: the tap's help until its press is done, and
 *   then SWIPE's pull in the same place, to the right — THE COMBO LAB's
 *   PRESS, THEN PULL, the press counted and gone and a pull come in where it
 *   was. The blow is the two.
 * - LEVER, on the seat that may: THE LEVER LAB's lever down from the body —
 *   graduated groove, band, channel to the band's middle and knob, with the
 *   handle dial filling while it is held in the band (`blister-lever-help.ts`).
 * - The verdict on each blow is a transient and is `blister-verdicts.ts`'.
 *
 * Flat, after every body, outside the perspective transform — the tap's
 * reach is hit-tested at `flatCenter` and `flatRadius` (`blister-tap.ts`), so
 * the help is drawn on the circle the thumb is answered on. It fades in and
 * out with the body coming up and going down (`blisterRise`), and **it never
 * changes the body's shape**: everything here sits on top of the contour.
 */
export function drawBlisterHelp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const c of world.creatures) {
    if (blisterIsUp(c)) drawBlisterHelpOf(ctx, l, world, c, beatPhase, time);
  }
}

/**
 * One blister's help. `rise` is how far up it is drawn, and its own clock's
 * answer where left out: a blister's death hands in the body it kept after
 * the blow, whose clock has stopped (`blister-death-fx.ts`).
 */
export function drawBlisterHelpOf(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
  time: number,
  rise?: number,
): void {
  const h = rise ?? blisterRise(world.cfg, c, beatPhase);
  if (h <= 0) return;
  const { x, y } = flatCenter(l, c, beatPhase);
  const r = flatRadius(l, world.cfg, c, beatPhase);
  const markR = handleRadius(l, world.cfg) * KNOB_SHARE * PULL_SIZE;
  // A seat whose half of a BOTH blister is done may not touch it again until
  // the partner's lands, so it is drawn the wait (`blisterMayTap`).
  const mine = l.role === "test" || blisterMayTap(c, seatOf(l.role));
  ctx.save();
  ctx.globalAlpha *= h;
  const gesture = blisterGestureOf(c);
  const holding = gesture === "hold";
  const held = holding && heldNow(world, c);
  if (mine && blisterStrokes(c)) {
    drawSwipeTrack(ctx, l, world, c, { x, y, r }, time);
  } else if (mine && gesture === "lever") {
    drawBlisterLever(ctx, l, world, c, { x, y, r }, time);
  } else if (mine && gesture === "turn") {
    drawBlisterTurn(ctx, l, world, c, { x, y, r }, time);
  } else if (mine && gesture === "rub") {
    const held = blisterRubbing(c);
    if (!held) drawMarkHalo(ctx, x, y, r, time);
    const turns = blisterBlowsOf(world.cfg, c);
    const done = turns - blisterBlowsLeft(world.cfg, c);
    drawRubDrop(ctx, { x, y }, markR, { time, turns, done, held });
  } else if (mine && holding) {
    if (!held) drawMarkHalo(ctx, x, y, r, time);
    const fill = blisterHoldShare(world, c);
    drawSoakHold(ctx, { x, y }, markR, { time, held, fill });
  } else if (mine) {
    drawMarkHalo(ctx, x, y, r, time);
    const times = blisterBlowsOf(world.cfg, c);
    const done = times - blisterBlowsLeft(world.cfg, c);
    drawPressDrop(ctx, { x, y }, markR, { time, times, done });
  } else {
    drawMarkWait(ctx, x, y, r, time);
  }
  if (held) drawMarkHeld(ctx, x, y, r, time);
  if (mine) drawBlisterBlows(ctx, world.cfg, c, { x, y, r }, time);
  ctx.restore();
}

/** Whether a hand that counts is on it now, on either seat — the sim's own question. */
function heldNow(world: World, c: Creature): boolean {
  return ([1, 2] as const).some((s) => gripsCreature(world, s, c.id) && blisterMayTap(c, s));
}

/**
 * SWIPE's pull: the knob on the body, where the stroke starts, and a channel
 * as long as the stroke the lift counts at (`blisterLengthMilliOf`) out along its
 * way. The knob rides the furthest open stroke, so it goes where the thumb has
 * taken it and no further than the stroke counts.
 */
function drawSwipeTrack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  at: { x: number; y: number; r: number },
  time: number,
): void {
  const length = (blisterLengthMilliOf(world.cfg, c) * l.tile) / 1000;
  const along = blisterSwipeShare(world, c);
  const held = blisterSwipeHeld(c);
  const way = BLISTER_WAY[blisterWayOf(c)];
  const r = handleRadius(l, world.cfg) * KNOB_SHARE;
  const track: PullTrack = {
    pts: [
      { x: at.x, y: at.y },
      { x: at.x + way.dx * length, y: at.y + way.dy * length },
    ],
    w: r * PULL_TRACK_W,
  };
  const key = `blister:${c.id}`;
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: along, time, key });
  const knob = { x: at.x + way.dx * length * along, y: at.y + way.dy * length * along };
  drawPullKnob(ctx, knob, r, { ...LOOK, held, time, way, key });
}

/**
 * The knob, as a share of every pull handle's radius: a blister is small
 * (`blister-turn-help.ts`). **The hold's drop, the rub's and the press's are
 * this knob's size**, drawn `PULL_SIZE` times larger, so the four read as one
 * set: the owner, 17 October 2026, *all on screen controls should have same
 * size. seems like hold and press are smaller than e.g. pull*. They were seven
 * tenths of the body until then — 0.28 of a tile against the knob's 0.48.
 */
const KNOB_SHARE = 0.8;

/** The swipe's colours: THE MAZE's, as the TURN's knob wears them (`blister-turn-help.ts`). */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;

/** Each way a stroke counts, as the unit step on the field. */
export const BLISTER_WAY: Record<BlisterSwipeWay, { dx: number; dy: number }> = {
  down: { dx: 0, dy: 1 },
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  left: { dx: -1, dy: 0 },
};
