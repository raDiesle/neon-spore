import {
  type ScoutState,
  type SimConfig,
  scoutHome,
  scoutLoad,
  scoutNose,
  scoutPrimed,
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
 * puts her thumb *on the ship* and his carry *on the ship*, and they are
 * offered together the moment the fifth mote is aboard — but the pilot is
 * shown a ship with a nose and the navigator is shown a ship with none
 * (`view-role.ts`), so neither seat ever has to tell one ring from the other.
 * Hers is the ship's own middle, where her screen has nothing but a place;
 * his stands off the stern, clear of the beads that ride the rim and exactly
 * where the wake comes out when the thruster answers.
 *
 * **The prime's dial is the window it bought.** `scoutPrimeTicks` is the whole
 * of what the gesture is for, and a pilot who cannot see it running out is a
 * pilot pressing a burn that has quietly stopped answering — so the ring
 * fills on the carry and drains, and `scoutPrimed` is asked for it rather
 * than the window being worked out a second time.
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
 * Whether the line is being offered: `scoutHandHeard`'s own gate read back
 * rather than restated — the ship is past `scoutLadenMotes`. A thumb already
 * on it is not refused, because the hold *is* the control and letting go is
 * how it ends.
 */
export function scoutLineGrippable(cfg: SimConfig, scout: ScoutState): boolean {
  return afoot(scout) && scoutLoad(cfg, scout) !== "light";
}

/** And whether the prime is: past `scoutHeavyMotes`, where the burn stops answering. */
export function scoutPrimeGrippable(cfg: SimConfig, scout: ScoutState): boolean {
  return afoot(scout) && scoutLoad(cfg, scout) === "heavy";
}

/**
 * The press, answered for whichever of the two this seat owns. A press from
 * the wrong seat falls through to whatever is behind it, exactly as if no ring
 * were there — which for this round is the arena, and the arena takes no
 * presses at all.
 */
export function scoutGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const scout = bossOf(field, "scout");
  if (scout === null) return null;
  const { cfg, seat } = field;
  if (seat === 2 && scoutLineGrippable(cfg, scout)) {
    if (hitCircle(scoutLineCircle(l, cfg, scout), x, y)) return grab("scoutLine", 2, x, y);
  }
  if (seat === 1 && scoutPrimeGrippable(cfg, scout)) {
    if (hitCircle(scoutPrimeCircle(l, cfg, scout), x, y)) return grab("scoutPrime", 1, x, y);
  }
  return null;
}

function grab(target: "scoutLine" | "scoutPrime", player: 1 | 2, x: number, y: number): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player, originX: x, originY: y },
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
  tick: number,
  time: number,
): void {
  if (!afoot(scout)) return;
  if (scoutLineGrippable(cfg, scout)) {
    if (scout.reeling) drawLineHome(ctx, l, cfg, scout);
    ring(ctx, scoutLineCircle(l, cfg, scout), l, 2, scout.reeling, scout.reeling ? 1 : 0, time);
  }
  if (!scoutPrimeGrippable(cfg, scout)) return;
  // The dial is the window, so what fills is the number the flight acts on.
  const left = scout.primeTick < 0 ? 0 : cfg.scoutPrimeTicks - (tick - scout.primeTick);
  const pull = Math.max(0, Math.min(1, left / cfg.scoutPrimeTicks));
  ring(ctx, scoutPrimeCircle(l, cfg, scout), l, 1, scoutPrimed(cfg, scout, tick), pull, time);
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
  });
}
