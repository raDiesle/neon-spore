import {
  type BatonState,
  batonDrawing,
  batonMayStrip,
  batonMergeSocket,
  batonSwelling,
  type SimConfig,
} from "@neon-spore/sim";
import { socketPoint } from "./baton-socket-draw.js";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";
import { showsCannon, showsShield } from "./view-role.js";

/**
 * **THE BATON's own arm as a control**: the shell a thumb strips off a
 * swelling socket, and the two beads a thumb each draws into one. Drawn and
 * answered in one file for `gorge-grip.ts`' reason — the circle a thumb is
 * answered at is the circle the ring is drawn from.
 *
 * **The strip's ring is on whichever screen the beat put it.** Every other
 * handle in the game belongs to a seat; this one belongs to the seat the
 * *lock* is on, and the lock moves every beat (`sim/baton-hand.ts`). So the
 * ring appears on the phone of whoever just acted — the one whose panel is
 * grey (`band-lock.ts`) — and crosses to the other when the turn does. That is
 * the whole picture of the rule: the beat you cannot touch the ship in is the
 * beat you can reach the arm.
 *
 * **The merge's two rings are on one screen each**, by geometry and never by
 * colour: the upper bead is the pilot's and the one that waited is the
 * navigator's (`batonMergeSocket`). Each ring fills under its own thumb and
 * neither says whether the other is down — that is the sentence the pair has
 * to say, and it is the one sentence this fight has never made them say,
 * because until this state nothing here could be done together at all.
 *
 * Both dials run **out**: the swell's window before the shell falls, and the
 * merge's before the bead that waited is shaken home.
 */

/** Where the ring on a swelling socket rests. */
export function batonSwellRest(l: Layout, cfg: SimConfig, b: BatonState): Circle | null {
  if (b.swellSocket < 0 || !batonSwelling(b, b.swellSocket)) return null;
  const at = socketPoint(l, cfg, b, b.swellSocket);
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}

/** Where the ring on this seat's bead rests, under `merging`. */
export function batonDrawRest(
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  player: 1 | 2,
): Circle | null {
  if (b.stage !== "merging") return null;
  const at = socketPoint(l, cfg, b, batonMergeSocket(cfg, player));
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}

/** Whether this role is that seat's screen. The director's `both` is both. */
function seatShows(role: ViewRole, player: 1 | 2): boolean {
  return player === 1 ? showsCannon(role) : showsShield(role);
}

/**
 * A press on the arm: the swelling socket while one is coming away, or either
 * bead while the two are being drawn together. `id` is the socket, which is
 * the whole of what the hand says — the simulation decides whether this seat
 * was the one who could say it, and refuses out loud if not
 * (`sim/baton-hand.ts`), which `baton-marks.ts` washes red. So the wrong seat's
 * press is handed through rather than dropped: the unlocked seat's on the
 * shell with its hold, since the strip counts a thumb only once it is lifted,
 * and a thumb on the partner's bead with none, since a held drag repeats its
 * press every move and would be refused on every one.
 */
export function batonSocketUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "baton");
  if (b === null) return null;
  const hit = socketAt(l, field, b, x, y, field.seat);
  if (hit === null) return null;
  const { socket, held } = hit;
  const target = "batonSocket";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id: socket },
    hold: held
      ? { kind: "drag", target, player: field.seat, originX: x, originY: y, id: socket }
      : null,
  };
}

/**
 * Which seat a desk pointer on the arm is — the locked seat on the shell, the
 * bead's own on a bead — so the test screen signs the press with the seat the
 * ring is asking, and a seat key still pins it to the other (`desk-grab.ts`).
 */
export function batonGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const b = bossOf(field, "baton");
  if (b === null) return undefined;
  const hit = socketAt(l, field, b, x, y, 1);
  if (hit === null) return undefined;
  if (b.stage === "merging") return hit.socket === batonMergeSocket(field.cfg, 1) ? 1 : 2;
  if (batonMayStrip(b, 1, field.beat)) return 1;
  return batonMayStrip(b, 2, field.beat) ? 2 : undefined;
}

/** The socket under the thumb, `first`'s own bead tried before the other's
 * where the two rings meet; `held` is whether the press keeps its hold. */
function socketAt(
  l: Layout,
  field: Field,
  b: BatonState,
  x: number,
  y: number,
  first: 1 | 2,
): { socket: number; held: boolean } | null {
  if (b.stage === "merging") {
    for (const seat of first === 1 ? ([1, 2] as const) : ([2, 1] as const)) {
      const rest = batonDrawRest(l, field.cfg, b, seat);
      if (rest === null || !hitCircle(rest, x, y)) continue;
      return { socket: batonMergeSocket(field.cfg, seat), held: seat === field.seat };
    }
    return null;
  }
  if (b.stage !== "passing") return null;
  const rest = batonSwellRest(l, field.cfg, b);
  if (rest === null || !hitCircle(rest, x, y)) return null;
  return { socket: b.swellSocket, held: true };
}

/** How much of a window is left, one down to nought. */
function left(from: number, span: number, beat: number, beatPhase: number): number {
  return Math.max(0, Math.min(1, (span - (beat - from + beatPhase)) / span));
}

/**
 * The rings, drawn after the arm so they stand on it and nothing stands on
 * them. Nothing here outlives a frame: every number is off the boss, the beat
 * and the wall clock, which is `baton-draw.ts`' own rule.
 */
export function drawBatonGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  role: ViewRole,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (b.stage === "merging") {
    for (const player of [1, 2] as const) {
      const rest = batonDrawRest(l, cfg, b, player);
      if (rest === null || !seatShows(role, player)) continue;
      drawGripRing(ctx, rest.x, rest.y, rest.r, batonDrawing(b, player), time);
      drawGripDial(
        ctx,
        rest.x,
        rest.y,
        rest.r,
        left(b.stageBeat, cfg.batonMergeWindowBeats, beat, beatPhase),
      );
    }
    return;
  }
  const rest = batonSwellRest(l, cfg, b);
  if (rest === null) return;
  for (const player of [1, 2] as const) {
    if (!seatShows(role, player) || !batonMayStrip(b, player, beat)) continue;
    drawGripRing(ctx, rest.x, rest.y, rest.r, false, time);
    drawGripDial(
      ctx,
      rest.x,
      rest.y,
      rest.r,
      left(b.swellBeat, cfg.batonSwellBeats, beat, beatPhase),
    );
    return;
  }
}
