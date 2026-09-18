import {
  type Creature,
  type QueenGesture,
  type QueenState,
  queenGesture,
  type SimConfig,
} from "@neon-spore/sim";
import { drawGripDial, drawGripRing, drawThrownRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout, showsQueenShape } from "./layout.js";
import { queenMarkCenter } from "./queen-figure.js";
import type { Field, Touch } from "./touch.js";

/**
 * **THE BULB QUEEN's marks as a control**, for the two phases that ask a
 * thumb for them (`QUEEN_GESTURES`, `sim/queen-mark.ts`): BROOD's pry and
 * SCREAM's hold. A ring round **both** marks on player 1's screen, because
 * player 1 is the seat that is not shown which of the two is real — the
 * ring says *one of these*, and which one is player 2's to say out loud
 * (`queen-weakpoint.ts`). Player 2 is never drawn the ring, and his thumb on
 * it is refused without a sound (`sim/queen-hand.ts`), so there is nothing
 * to draw him refusing.
 *
 * The ring is drawn **outside** the mark and never fills it: the mark is the
 * creature that is coming, which is the other half of what player 1 has to
 * say, and a handle laid over it would take that half away. The word for the
 * gesture is the cue reader's (`boss-cue-read.ts`), the way every other
 * word on the field is.
 *
 * Three states, all read off the beat the sim already stores, so nothing
 * here outlives a frame: **asked**, the ring breathing on both marks;
 * **pried** (`pryBeat`), the armour thrown off the real one in a ring that
 * runs outward over the beat after; **held** (`holdSide`), the ring filled
 * on the mark under the thumb, with the beats of hold left closing round it
 * as a dial — the one readout of a thumb player 2 cannot see.
 */

/** Which mark to ring, relative to the mark's own radius: outside it, clear of the shell's lip. */
const RING_MUL = 1.55;

/** What her picture is asking of player 1's thumb this frame, or `null` between windows. */
export function queenAsks(boss: QueenState, queen: Creature): QueenGesture | null {
  const gesture = queenGesture(boss);
  if (boss.openBeat === -1) return null;
  if (gesture === "pry") return boss.pryBeat === -1 && queen.color === null ? "pry" : null;
  if (gesture === "hold") return "hold";
  return null;
}

/** The queen's body on the field, if she is the boss up. */
function queenOf(field: Field): Creature | null {
  const boss = field.queen;
  if (boss === null) return null;
  return field.creatures.find((c) => c.id === boss.creatureId) ?? null;
}

/**
 * A press on one of her marks while a ring is up: the nearest under the
 * thumb, as a `drag` on `queenMark` with `id` 0 for the left mark and 1 for
 * the right (`instarMark`'s way). The circle answered is the handle's own
 * size (`handleRadius`) and not the mark's, which is drawn smaller than a
 * thumb.
 */
export function queenMarkUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const boss = field.queen;
  const queen = queenOf(field);
  if (boss === null || queen === null || field.seat !== 1) return null;
  if (queenAsks(boss, queen) === null) return null;
  const r = handleRadius(l, field.cfg);
  let best: { id: number; d: number } | null = null;
  for (const side of [-1, 1] as const) {
    const at = queenMarkCenter(l, queen, side);
    if (!hitCircle({ x: at.x, y: at.y, r }, x, y)) continue;
    const d = (x - at.x) ** 2 + (y - at.y) ** 2;
    if (best === null || d < best.d) best = { id: side === -1 ? 0 : 1, d };
  }
  if (best === null) return null;
  const id = (best as { id: number }).id;
  return {
    player: 1,
    command: { kind: "drag", target: "queenMark", on: true, fromMilli: 0, fromYMilli: 0, id },
    hold: { kind: "drag", target: "queenMark", player: 1, originX: x, originY: y, id },
  };
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * The rings, drawn after the shell so they stand over its lip. `ox`/`oy` is
 * her shudder, the same one the marks were drawn with. The rings themselves
 * are `grip-rings.ts`, shared with THE MIRROR's lobes.
 */
export function drawQueenGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  queen: Creature,
  boss: QueenState,
  beat: number,
  beatPhase: number,
  time: number,
  ox: number,
  oy: number,
): void {
  const asks = queenAsks(boss, queen);
  const mine = showsQueenShape(l.role);
  for (const side of [-1, 1] as const) {
    const at = queenMarkCenter(l, queen, side);
    const x = at.x + ox;
    const y = at.y + oy;
    const r = at.r * RING_MUL;
    // The pry landing: the armour off, thrown outward over the beat after.
    // On every screen, because the mark opening is on every screen.
    if (boss.pryBeat !== -1 && boss.weakSide === side && queen.color !== null) {
      const k = clamp01(beat - boss.pryBeat + beatPhase);
      if (k < 1) drawThrownRing(ctx, x, y, at.r * (1.2 + 1.6 * k), 1 - k);
    }
    if (!mine || asks === null) continue;
    const held = asks === "hold" && boss.holdSide === side;
    drawGripRing(ctx, x, y, r, held, time);
    // The dial: how much of the hold is left, on the mark being held, while
    // it is the one that is open. It runs from the opening, not the thumb —
    // `holdBloom` counts from `openBeat` — so it is the beat she shuts on.
    if (held && boss.weakSide === side && queen.color !== null) {
      const left = 1 - clamp01((beat - boss.openBeat + beatPhase) / cfg.queenHoldBeats);
      drawGripDial(ctx, x, y, r, left);
    }
  }
}
