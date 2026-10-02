import { type SimConfig, type SinewState, sinewHeld, sinewPull } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import type { GripVerdict } from "./grip-verdict.js";
import { drawHandleDial, handleRadius } from "./handle-draw.js";
import { seatIsMine } from "./handle-word.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_DOWN } from "./pull-line.js";
import {
  drawSinewChannel,
  drawSinewHandleHalo,
  drawSinewHandleMarks,
  sinewHandleAsks,
} from "./sinew-marks.js";
import { type Point, sinewLanded, sinewMassCentre, sinewMassRx } from "./sinew-shape.js";
import { sinewWord } from "./sinew-word.js";
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
 * **Each is the shared knob** (`pull-knob.ts`), and yours carries the way down
 * inside it; the partner's carries none, since a gesture on a mark reads as
 * *your next move* (`docs/queue.md`, 30 September 2026). The dial round it is
 * the ring's, kept (`drawHandleDial`): it is how much of each pull is in.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring punches its circle out of the background before it draws its
 * own colour, so it reads over whatever it hangs on — and a handle resting
 * `REST_OUT` radii off the mass's edge hangs over the mass's own outer lobe on
 * the side it is on. The first frame of this boss from the pilot's seat came
 * back with a clean black bite out of the right lobe where the navigator's
 * handle rests, and the cord running to it disappearing under the bite. Theirs
 * is its rim and its wash now.
 *
 * **The ember ring still fills, and `theirs` is why that is not a
 * contradiction.** While the handles swing neither seat may take hold, so both
 * copies go ember — but `theirs` is a question about *whose*, not about
 * pressable: yours stays yours through the snap-back, and the disc under it is
 * how a handle being whipped across the arena stays a handle rather than a
 * smear. What the other seat gets is the same ember rim over the arena, which
 * is the whip said without a hole travelling with it.
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
 * The press. `bossOf(field, "sinew")` is `null` on every wave without the
 * boss, and a press then falls through to whatever is behind it exactly as if
 * no ring were there. This seat's own handle is taken hold of; the partner's
 * is handed through holding nothing, for the simulation to refuse in red
 * (`sim/sinew-hand.ts`, `sinew-marks.ts`) — a press and no more, so no move of
 * the thumb is refused a second time. Once the mass has landed no handle is
 * drawn, and neither answers.
 */
export function sinewHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "sinew");
  if (s === null || sinewLanded(s)) return null;
  for (const side of [-1, 1] as const) {
    const rest = sinewHandleCircle(l, field.cfg, s, field.beat, field.beatPhase, side);
    if (!hitCircle(rest, x, y)) continue;
    const target = side === -1 ? "sinewLeft" : "sinewRight";
    const command = { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 } as const;
    if (sinewHandleSeat(side) !== field.seat) return { player: field.seat, command, hold: null };
    return {
      player: field.seat,
      command,
      hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
    };
  }
  return null;
}

/**
 * **Whose thumb the handle under this point is for** — the desk's question
 * before a press (`desk-grab.ts`, as `spoolGripSeat`), because both handles
 * are there for either seat and each refuses the one it is not.
 */
export function sinewGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "sinew");
  if (s === null || sinewLanded(s)) return undefined;
  for (const side of [-1, 1] as const) {
    const rest = sinewHandleCircle(l, field.cfg, s, field.beat, field.beatPhase, side);
    if (hitCircle(rest, x, y)) return sinewHandleSeat(side);
  }
  return undefined;
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
  /** Each handle's verdict, keyed by its owner's seat (`sinew-fx.ts`). */
  verdicts: { at(key: number): GripVerdict | null },
): void {
  const falling = s.fallBeat >= 0 && s.outBeat < 0;
  for (const side of [-1, 1] as const) {
    const player = sinewHandleSeat(side);
    const head = sinewHandleAt(l, cfg, s, beat, beatPhase, side, swingTiles);
    const held = sinewHeld(s, player);
    const pull = Math.min(1, sinewPull(s, player) / Math.max(1, cfg.sinewReachMilli));
    const mine = seatIsMine(l.role, player);
    const asks = sinewHandleAsks(cfg, s, player, falling, swinging);
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
    if (mine && !falling && !swinging) {
      const rest = { ...sinewHandleCircle(l, cfg, s, beat, beatPhase, side), x: head.x };
      const len = (cfg.sinewReachMilli * l.tile) / 1000;
      drawSinewChannel(ctx, rest, head, len, pull, held, time);
    }
    drawSinewHandleHalo(ctx, head, mine, asks, time);
    // The shared knob, carrying the way down on its owner's screen alone.
    const rim = swinging ? PALETTE.emberRim : mine ? PALETTE.text : PALETTE.rock;
    drawPullKnob(ctx, head, head.r, {
      hex: swinging ? PALETTE.ember : mine ? PALETTE.rock : PALETTE.dim,
      rim,
      held,
      time,
      way: mine ? PULL_DOWN : null,
      theirs: !mine,
    });
    drawHandleDial(ctx, head.x, head.y, head.r, rim, pull);
    drawSinewHandleMarks(ctx, head, mine, asks, time, verdicts.at(player));
    // **The cue, and not a word of this file's own** (`decisions.md` #34,
    // `boss-cue-text.ts`). Which word, and the three silences, are
    // `sinew-word.ts`'s — the argument is long and the one thing it must not do
    // is say a number. What is this file's is *where*: the word stands on the
    // ring, and the ring's place is the drawing's, because the snap-back's whip
    // is a transient a reading off `World` would have to work out again.
    //
    // **And only on the seat whose thumb it is.** The other seat's ring is
    // still drawn dim beside its own, which is what says the partner's hand has
    // landed; the dim *word* under it was the second prompt system this entry
    // closes, and a cue is owed to whoever can act on it.
    const say = sinewWord(cfg, s, player, falling, swinging);
    if (say === null) continue;
    const cue: BossCue = {
      seat: player,
      kind: say.kind,
      word: say.word,
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
