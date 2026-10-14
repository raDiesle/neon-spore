import {
  type SimConfig,
  type TasterState,
  tasterLockCol,
  tasterPinnable,
  tasterPryable,
  tasterWipable,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
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
 * **There are as many wipes as there are gaps**, six to eight of them by
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
  return ringAt(l, cfg, tasterLockCol(t), 0);
}

/**
 * The press, answered for whichever of the three is offered under it. Every
 * ring is drawn on both screens, so a press from the wrong seat is handed
 * through with no hold, for `tasterHandsHeard` to refuse once and out loud
 * (`tasterHandRefuse`), the way every mark answers a wrong thumb.
 *
 * The `id` both per-column handles report is the **column**, not the index
 * into the fan: that is what `tasterHandsHeard` takes and what it puts through
 * `tasterBladeAt` on the other side of the wire, and a column survives a fan
 * that is re-seated where an index would not.
 */
export function tasterGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const part = partUnder(l, x, y, field);
  if (part === null) return null;
  const { target } = part;
  // The pry names no column: the interlock is the crest's one.
  const id = part.id === undefined ? {} : { id: part.id };
  const command = { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, ...id } as const;
  if (field.seat !== seatOf(target)) return { player: field.seat, command, hold: null };
  return {
    player: field.seat,
    command,
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y, ...id },
  };
}

/** Whose handle is offered under a point, for a desk's press (`desk-grab.ts`). */
export function tasterGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const part = partUnder(l, x, y, field);
  return part === null ? undefined : seatOf(part.target);
}

type Target = "tasterBlade" | "tasterGap" | "tasterLock";

/** The pin and the pry are the pilot's, the wipe the navigator's. */
function seatOf(target: Target): 1 | 2 {
  return target === "tasterGap" ? 2 : 1;
}

/** The offered handle under a point, whichever seat is asking. */
function partUnder(
  l: Layout,
  x: number,
  y: number,
  field: Field,
): { target: Target; id: number | undefined } | null {
  const t = bossOf(field, "taster");
  if (t === null) return null;
  const { cfg, beat } = field;
  if (tasterPryable(t, beat, cfg) && hitCircle(tasterLockCircle(l, cfg, t), x, y)) {
    return { target: "tasterLock", id: undefined };
  }
  for (let i = 0; i < t.blades.length; i++) {
    const col = t.col + i;
    if (tasterPinnable(t, cfg, i) && hitCircle(tasterBladeCircle(l, cfg, col), x, y)) {
      return { target: "tasterBlade", id: col };
    }
    if (tasterWipable(t, cfg, i) && hitCircle(tasterGapCircle(l, cfg, col), x, y)) {
      return { target: "tasterGap", id: col };
    }
  }
  return null;
}
