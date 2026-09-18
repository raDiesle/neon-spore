import { type SimConfig, type SinewState, sinewHeld, sinewPull } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type Point, sinewMassCentre, sinewMassRx } from "./sinew-shape.js";
import { sinew } from "./tether-sinew.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE SINEW's two handles**, one either side of the mass and one per seat:
 * the left is the pilot's and the right the navigator's, THE BALLOON's
 * sides (`balloon-handles.ts`), and the second pair on the field that two
 * people take hold of at once.
 *
 * Each hangs off the mass on a short cord — the shipped SINEW tether look,
 * which is a piece of the boss and pulses toward the thing it pulls on
 * (`tether-sinew.ts`) — and is carried **down** to pull and **sideways** to
 * sway, the two axes the drag has (`touch-drag.ts`). Both are drawn on both
 * screens, yours bright and theirs dim, so each seat can see the other's
 * hand come down: the sum is the two of them together and the moment it
 * enters the zone is a moment neither hand can feel.
 *
 * The **rest** is the one place the circle is written down: the hit test
 * answers a press exactly here and the ring is drawn from exactly here, so a
 * handle cannot be drawn beside one mass and answered beside another. It
 * reads no clock and no whip: a press is tested against where the handle
 * rests whatever the snap-back is doing to it, and while the handles are
 * swinging no hand takes hold anyway (`sim/sinew-hand.ts`).
 */

/** Which seat owns which side. Asked by the drawing and by the hit test. */
export function sinewHandleSeat(side: -1 | 1): 1 | 2 {
  return side === -1 ? 1 : 2;
}

/** How far outside the mass's edge the ring rests, in radii, and how far
 * above the mass's centre, in tiles. */
const REST_OUT = 1.6;
const REST_UP = 0.35;

/** Where one handle rests, with no hand on it, kept on the glass by its radius. */
export function sinewHandleCircle(
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
  side: -1 | 1,
): Circle {
  const mass = sinewMassCentre(l, cfg, s, beat, beatPhase);
  const r = handleRadius(l, cfg);
  const rest = mass.x + side * (sinewMassRx(l, cfg) + REST_OUT * r);
  return { x: Math.min(Math.max(rest, r), l.width - r), y: mass.y - REST_UP * l.tile, r };
}

/**
 * Where it stands: its rest, plus the hand's sway and pull, plus the whip.
 * Exported for `handle-place.ts`, which is the caption and the ghost hand
 * asking the same question the drawing does, so a rehearsal's ring cannot
 * stand where the handle is not. Those two pass no whip: while the handles
 * swing no hand is on them (`sim/sinew-hand.ts`), and a film's page about
 * the snap points at the rock, not the ring.
 */
export function sinewHandleAt(
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
  side: -1 | 1,
  swingTiles: number,
): Circle {
  const rest = sinewHandleCircle(l, cfg, s, beat, beatPhase, side);
  const player = sinewHandleSeat(side);
  const sway = player === 1 ? s.swayP1Milli : s.swayP2Milli;
  return {
    ...rest,
    x: rest.x + (sway * l.tile) / 1000 + swingTiles * l.tile,
    y: rest.y + (sinewPull(s, player) * l.tile) / 1000,
  };
}

/**
 * The press, answered for this seat's side only. `bossOf(field, "sinew")` is `null` on
 * every wave without the boss, and a press then falls through to whatever
 * is behind it exactly as if no ring were there.
 */
export function sinewHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "sinew");
  if (s === null) return null;
  const side = field.seat === 1 ? -1 : 1;
  if (sinewHandleSeat(side) !== field.seat) return null;
  const rest = sinewHandleCircle(l, field.cfg, s, field.beat, field.beatPhase, side);
  if (!hitCircle(rest, x, y)) return null;
  const target = side === -1 ? "sinewLeft" : "sinewRight";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
  };
}

export function drawSinewHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  mass: Point,
  beat: number,
  beatPhase: number,
  time: number,
  /** The snap-back's whip, in tiles, and whether the handles are swinging. */
  swingTiles: number,
  swinging: boolean,
): void {
  const falling = s.fallBeat >= 0 && s.outBeat < 0;
  for (const side of [-1, 1] as const) {
    const player = sinewHandleSeat(side);
    const head = sinewHandleAt(l, cfg, s, beat, beatPhase, side, swingTiles);
    const held = sinewHeld(s, player);
    const pull = Math.min(1, sinewPull(s, player) / Math.max(1, cfg.sinewReachMilli));
    const mine = l.role === "test" || (l.role === "p1") === (player === 1);
    // The cord, from the mass's own flank out to the ring: the shipped sinew
    // look, in the boss's colour for the hand that is yours.
    sinew({
      ctx,
      anchor: { x: mass.x + side * sinewMassRx(l, cfg) * 0.85, y: mass.y },
      head: { x: head.x, y: head.y },
      held,
      pull,
      time,
      tile: l.tile,
      hex: mine ? PALETTE.hull : PALETTE.dim,
      rim: mine ? PALETTE.hullRim : PALETTE.rock,
    });
    drawHandleRing(ctx, {
      x: head.x,
      y: head.y,
      r: head.r,
      hex: swinging ? PALETTE.ember : mine ? PALETTE.rock : PALETTE.dim,
      rim: swinging ? PALETTE.emberRim : mine ? PALETTE.text : PALETTE.rock,
      held,
      pull,
      time,
    });
    if (held || swinging) continue;
    // **The cue, and not a word of this file's own** (`decisions.md` #34,
    // `boss-cue-text.ts`). The verb is the axis — down to pull while the tendon
    // holds, sideways to steer once the mass is falling — and the kind is the
    // carry both of them are. Built here rather than read off `World` next door
    // because the ring's place is the drawing's: the snap-back's whip is a
    // transient, and a reading that worked it out again would put the word
    // where the ring is not.
    //
    // **And only on the seat whose thumb it is.** The other seat's ring is
    // still drawn dim beside its own, which is what says the partner's hand has
    // landed; the dim *word* under it was the second prompt system this entry
    // closes, and a cue is owed to whoever can act on it.
    const cue: BossCue = {
      seat: player,
      kind: "CARRY",
      word: falling ? "SWAY" : "PULL",
      x: head.x,
      y: head.y,
      halfW: head.r,
      halfH: head.r,
      seed: 59 + player,
      framed: false,
    };
    if (cueSeen(cue, l.role)) drawCueText(ctx, cue, time);
  }
}
