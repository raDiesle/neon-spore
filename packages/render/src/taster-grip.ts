import {
  type SimConfig,
  type TasterState,
  tasterPinnable,
  tasterPryable,
  tasterWipable,
} from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { tasterCrestY } from "./taster-draw.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE TASTER's three thumbs on its own fan**: the pilot's pin on a blade
 * that has not decided, the navigator's wipe across a gap where one used to
 * stand, and the pilot's pry on the interlock at the end (`sim/taster-hand.ts`,
 * `docs/spec/bosses.md` §11.25).
 *
 * All three shipped in the simulation on 18 September 2026 with nothing drawn
 * to take hold of: no ring, no branch of `touch.ts`, no seat that could see
 * one. The look is exempt under *a look with no shipped alternative* — there
 * was no drawing of any of the three to run a candidate against.
 *
 * **The fan is on both screens whole**, which is what made the placement
 * question small: no part of this boss is hidden from a seat — the split is
 * the two numbers, his the column coming next and hers the ledger
 * (`taster-read.ts`) — so either thumb can point at any of it and the only
 * question was which movement wants which hand. The fight answers that itself,
 * one hand per movement, and **the three are never offered together**:
 * `fanning`, then `hurrying`, then `closed`.
 *
 * **Two of the three are at the root of a blade and the third is in the air
 * where a blade is gone.** A ring fills opaquely, so a disc on a tip would
 * cover the one thing both seats read off this boss — the lit edge that says
 * which colour cannot break it. At the root it covers the bottom third of a
 * blade and leaves the edge and the point standing, which is `throat-grip.ts`'
 * bargain made a little cheaper. Her gap has no blade to spoil, so hers sits
 * in the empty column above the notch rather than in it: the notch's own sheen
 * is how near the crest is to being cut, and a row of discs over the notches
 * would have hidden the fight's own progress bar.
 *
 * **There are as many gap rings as there are gaps**, six to eight of them by
 * the third movement, and that is the reading rather than a crowd: they are
 * what is left of eleven blades, spaced a tile apart and a fifth of a tile
 * short of touching, so the row of them says how far the fan has been eaten at
 * the same time as it says where a thumb goes.
 */

/** How far above the crest her ring hangs, in tiles: clear of the ridge's top. */
const GAP_TILES = 0.62;

/** Every ring on this fan is the field's own handle, on the field's own tile. */
function ringAt(l: Layout, cfg: SimConfig, col: number, up: number): Circle {
  return { x: tileCX(l, col), y: tasterCrestY(l) - l.tile * up, r: handleRadius(l, cfg) };
}

/** The pin: the root of the blade standing in this column. */
export function tasterBladeCircle(l: Layout, cfg: SimConfig, col: number): Circle {
  return ringAt(l, cfg, col, 0);
}

/** The wipe: the air over the notch, where that column's blade used to stand. */
export function tasterGapCircle(l: Layout, cfg: SimConfig, col: number): Circle {
  return ringAt(l, cfg, col, GAP_TILES);
}

/**
 * The pry: the middle of the crest, which is where the last blades lean across
 * each other and the column the fight's own `tasterPry` event names. His carry
 * is downward out of it, so the ring is under the crossing rather than on it.
 */
export function tasterLockCircle(l: Layout, cfg: SimConfig, t: TasterState): Circle {
  return ringAt(l, cfg, lockCol(t), 0);
}

function lockCol(t: TasterState): number {
  return t.col + Math.floor(t.blades.length / 2);
}

/**
 * The press, answered for whichever of the three this seat owns. A press from
 * the wrong seat falls through to whatever is behind it exactly as if no ring
 * were there, which is what `tasterHandsHeard` does with the command anyway.
 *
 * The `id` both per-column handles report is the **column**, not the index
 * into the fan: that is what `tasterHandsHeard` takes and what it puts through
 * `tasterBladeAt` on the other side of the wire, and a column survives a fan
 * that is re-seated where an index would not.
 */
export function tasterGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const t = bossOf(field, "taster");
  if (t === null) return null;
  const { cfg, seat, beat } = field;
  if (seat === 1 && tasterPryable(t, beat, cfg) && hitCircle(tasterLockCircle(l, cfg, t), x, y)) {
    return grabLock(x, y);
  }
  for (let i = 0; i < t.blades.length; i++) {
    const col = t.col + i;
    if (
      seat === 1 &&
      tasterPinnable(t, cfg, i) &&
      hitCircle(tasterBladeCircle(l, cfg, col), x, y)
    ) {
      return grabCol("tasterBlade", 1, x, y, col);
    }
    if (seat === 2 && tasterWipable(t, cfg, i) && hitCircle(tasterGapCircle(l, cfg, col), x, y)) {
      return grabCol("tasterGap", 2, x, y, col);
    }
  }
  return null;
}

function grabCol(
  target: "tasterBlade" | "tasterGap",
  player: 1 | 2,
  x: number,
  y: number,
  id: number,
): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id },
    hold: { kind: "drag", target, player, originX: x, originY: y, id },
  };
}

function grabLock(x: number, y: number): Touch {
  return {
    player: 1,
    command: { kind: "drag", target: "tasterLock", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "tasterLock", player: 1, originX: x, originY: y },
  };
}

/**
 * All three, drawn with the fan so the fan and the hands on it are one
 * drawing. Each on both screens, bright on the seat that owns it and dim on
 * the other: the pin buys the navigator her window to turn the ledger over,
 * the wipe is the one cut that costs the ledger nothing, and the pry is what
 * her beam is waiting on — so every one of the three is a thing the *other*
 * seat is watching for.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring punches its circle out of the background first, so it reads
 * over whatever it stands on, and this fight is read entirely off the lit edge
 * of a blade: the pin's ring is on the crest and the wipe's is in a gap the
 * crest has already lost. The seat that may not press one cannot see the wash
 * inside the hole, so its copy came out a *second* notch — the one mark this
 * boss uses for progress, said by a handle that meant nothing of the kind.
 * Theirs is its rim and its wash now. The count in
 * `taster-grip-frame.test.ts` is the seat's own for the same reason.
 *
 * **Each dial is the clock its own gesture is racing.** The pin's fills toward
 * `tasterPinBeats`, where the blade decides anyway and comes up thick, so a
 * full ring is a bet lost rather than a hold won. The wipe's has two positions
 * because the carry has two states — `wiped` is the whole of what the round
 * remembers about it — and full means *this carry has spent its cut, lift and
 * come again*. The pry's is the carry itself, `pryMilli` out of
 * `tasterPryMilli`, and when it lands the ring goes out altogether: the window
 * is a beat count and he may let go, so a ring left standing would be asking
 * for a second carry the round refuses.
 */
export function drawTasterGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  t: TasterState,
  beatPhase: number,
  beat: number,
  time: number,
): void {
  if (tasterPryable(t, beat, cfg)) {
    const pull = Math.max(0, Math.min(1, t.pryMilli / Math.max(1, cfg.tasterPryMilli)));
    ring(ctx, tasterLockCircle(l, cfg, t), l, 1, t.pryMilli > 0, pull, time);
  }
  for (let i = 0; i < t.blades.length; i++) {
    const col = t.col + i;
    if (tasterPinnable(t, cfg, i)) {
      const held = t.pin === i;
      const spent = (t.pinBeats + beatPhase) / Math.max(1, cfg.tasterPinBeats);
      ring(ctx, tasterBladeCircle(l, cfg, col), l, 1, held, held ? clamp(spent) : 0, time);
    }
    if (tasterWipable(t, cfg, i)) {
      const held = t.wipe === i;
      ring(ctx, tasterGapCircle(l, cfg, col), l, 2, held, held && t.wiped ? 1 : 0, time);
    }
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
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
