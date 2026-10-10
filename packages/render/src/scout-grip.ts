import {
  type ScoutState,
  type SimConfig,
  scoutHome,
  scoutLineOffered,
  scoutNavigator,
  scoutNose,
  scoutPilot,
  scoutPrimed,
  scoutPrimeOffered,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { scoutAt } from "./scout-draw.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE SCOUT's two hands on its own picture**: the navigator's line on a
 * laden ship and the pilot's prime on a heavy one's thruster
 * (`sim/scout-hand.ts`, `docs/spec/interludes.md`, THE SCOUT's *Three loads,
 * three hands*).
 *
 * Both shipped in the simulation on 18 September 2026 with nothing on either
 * screen to take hold of — "a line is drawn nowhere, a heavy ship's thruster
 * looks the same primed or cold". The look is exempt under *a look with no
 * shipped alternative*: there was no drawing of either control to run a
 * candidate against.
 *
 * **Both are on the little ship, and the split keeps them apart.** The brief
 * puts her thumb *on the ship* and his thumb *on the ship*, and they are
 * offered together the moment the fifth mote is aboard — but the pilot is
 * shown a ship with a nose and the navigator is shown a ship with none
 * (`view-role.ts`), so neither seat ever has to tell one ring from the other.
 * Hers is the ship's own middle, where her screen has nothing but a place;
 * his stands off the stern, clear of the beads that ride the rim and exactly
 * where the wake comes out when the thruster answers.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring punches its circle out of the background first so it reads
 * over whatever it is on, and hers is on the **ship** — the one thing either
 * seat is watching in this round — so the pilot was shown his own little ship
 * with a hole through the middle of it for as long as the load was past
 * `scoutLadenMotes`. His stands off the stern in empty air and never cost
 * anything; it is dimmed on her screen by the same line and now fills nothing
 * there either. `render/test/handle-hole-rulings.test.ts` counts the discs,
 * which is a thing that can be done without flying the round at all. It could
 * not be *photographed* for want of a verb — `--press` knew none of the
 * pilot's three — and it can be now: `tools/frames/scout-press.ts` carries the
 * flight that puts four motes aboard and takes her ring's picture.
 *
 * **Both are holds, and both rings say so the same way**: full and lit while
 * the thumb is down, empty the moment it lifts. The prime was a carry that
 * bought a window, with a dial draining it, until the owner called it a hold
 * on 10 October 2026 — and the carry never reached the simulation from a
 * thumb, because a drag's lift reports no distance unless it is a swipe
 * (`touch.ts`). `scoutPrimed` is asked for the lit ring rather than the
 * thumb, because it is what the flight acts on.
 */

/** How far off the stern the pilot's ring stands, in ship radii. */
const STERN = 2.2;

/** Whether the round is in the one phase that hears either hand (`scout-round.ts`). */
function afoot(scout: ScoutState): boolean {
  return scout.phase === "play";
}

/** The ship's own circle: the navigator's line, on a place and nothing else. */
export function scoutLineCircle(l: Layout, cfg: SimConfig, scout: ScoutState): Circle {
  const { x, y } = scoutAt(l, scout);
  return { x, y, r: handleRadius(l, cfg) };
}

/**
 * The pilot's circle, off the stern along the heading — behind the beads,
 * which ride the rim at a little over one radius, and in the air the wake
 * takes up while the thruster is lit (`scout-ship.ts`).
 */
export function scoutPrimeCircle(l: Layout, cfg: SimConfig, scout: ScoutState): Circle {
  const { x, y } = scoutAt(l, scout);
  const nose = scoutNose(scout.headingMilli);
  const back = ((cfg.scoutRadiusMilli * l.tile) / 1000) * STERN;
  return {
    x: x - (nose.colMilli / 1000) * back,
    y: y - (nose.rowMilli / 1000) * back,
    r: handleRadius(l, cfg),
  };
}

/**
 * Whether the line is being offered: the simulation's own gate
 * (`scoutLineOffered`) — the ship is past `scoutLadenMotes`. A thumb already
 * on it is not refused, because the hold *is* the control and letting go is
 * how it ends.
 */
export function scoutLineGrippable(cfg: SimConfig, scout: ScoutState): boolean {
  return scoutLineOffered(cfg, scout);
}

/** And whether the prime is: past `scoutHeavyMotes`, where the burn stops answering. */
export function scoutPrimeGrippable(cfg: SimConfig, scout: ScoutState): boolean {
  return scoutPrimeOffered(cfg, scout);
}

interface Hand {
  target: "scoutLine" | "scoutPrime";
  seat: 1 | 2;
  c: Circle;
}

/** The rings on offer under a point, this seat's own first where they overlap. */
function handsUnder(l: Layout, x: number, y: number, field: Field, scout: ScoutState): Hand[] {
  const { cfg } = field;
  const hands: Hand[] = [];
  const hers = scoutNavigator(scout);
  const his = scoutPilot(scout);
  if (scoutLineGrippable(cfg, scout)) {
    hands.push({ target: "scoutLine", seat: hers, c: scoutLineCircle(l, cfg, scout) });
  }
  if (scoutPrimeGrippable(cfg, scout)) {
    hands.push({ target: "scoutPrime", seat: his, c: scoutPrimeCircle(l, cfg, scout) });
  }
  return hands
    .filter((h) => hitCircle(h.c, x, y))
    .sort((a, b) => Number(b.seat === field.seat) - Number(a.seat === field.seat));
}

/**
 * The press on whichever ring is on offer, from either seat. The line is the
 * navigator's and the prime the pilot's (`sim/scout-hand.ts`). **A press from
 * the other seat is handed through with no hold**, so the simulation can
 * refuse it once and the ring wash red (`scout-marks.ts`) — both rings are
 * drawn on both screens.
 */
export function scoutGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const scout = bossOf(field, "scout");
  if (scout === null) return null;
  const hand = handsUnder(l, x, y, field, scout)[0];
  if (hand === undefined) return null;
  return grab(hand.target, field.seat, hand.seat === field.seat, x, y);
}

/**
 * The seat a press on a ring on offer belongs to, so one mouse at a desk
 * takes the navigator's line rather than having it refused as the pilot's
 * (`desk-grab.ts` `markSeat`).
 */
export function scoutGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const scout = bossOf(field, "scout");
  if (scout === null) return undefined;
  return handsUnder(l, x, y, field, scout)[0]?.seat;
}

function grab(
  target: "scoutLine" | "scoutPrime",
  player: 1 | 2,
  owns: boolean,
  x: number,
  y: number,
): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: owns ? { kind: "drag", target, player, originX: x, originY: y } : null,
  };
}

/**
 * Both rings and the line itself, drawn with the ship so the ship and the
 * hands on it are one drawing.
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made: the line takes the pilot's turn and burn away
 * while it runs, and the prime is the reason his burn is answering at all, so
 * each of these two is a thing the *other* seat is waiting on.
 */
export function drawScoutGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  scout: ScoutState,
  time: number,
): void {
  if (!afoot(scout)) return;
  if (scoutLineGrippable(cfg, scout)) {
    if (scout.reeling) drawLineHome(ctx, l, cfg, scout);
    const hers = scoutNavigator(scout);
    ring(ctx, scoutLineCircle(l, cfg, scout), l, hers, scout.reeling, scout.reeling ? 1 : 0, time);
  }
  if (!scoutPrimeGrippable(cfg, scout)) return;
  const his = scoutPilot(scout);
  const lit = scoutPrimed(cfg, scout);
  ring(ctx, scoutPrimeCircle(l, cfg, scout), l, his, lit, lit ? 1 : 0, time);
}

/**
 * The line, while her thumb is on it: straight from the ship to home, because
 * straight is exactly what it does. It is drawn under the ring and over the
 * arena, so what it runs through is on both screens — a hazard on this line is
 * a hazard the ship is being dragged into, and she is the one who can see it.
 */
function drawLineHome(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  scout: ScoutState,
): void {
  const from = scoutAt(l, scout);
  const to = scoutAt(l, scoutHome(cfg.cols, cfg.rows));
  const line = new Path2D();
  line.moveTo(from.x, from.y);
  line.lineTo(to.x, to.y);
  strokeGlow(ctx, line, PALETTE.hull, STROKE.inner, 0.8);
}

function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  player: 1 | 2,
  held: boolean,
  pull: number,
  time: number,
): void {
  const mine = l.role === "test" || (l.role === "p1") === (player === 1);
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: mine ? PALETTE.hull : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull,
    time,
    theirs: !mine,
  });
}
