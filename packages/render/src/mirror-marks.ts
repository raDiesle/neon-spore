import {
  type MirrorState,
  mirrorAsks,
  mirrorGesture,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { mirrorLobeCircle, thumbBit } from "./mirror-grip.js";
import { seatOf } from "./view-role.js";

/**
 * **THE MIRROR's two lobes answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Which lobe a round asks of which seat is the simulation's
 * (`sim/mirror-hand.ts` `mirrorAsks`). On this screen a lobe asked of this
 * seat wears the halo under the grip's ring (`mirror-grip.ts`), unless the
 * sim already has this thumb on it under `hold`, whose filled ring says so;
 * a lobe asked only of the partner wears their turning ring and the clock —
 * *not your thumb, theirs* — except where it stands inside one of this
 * seat's, its cannon over the pair's shield, where a press is this seat's
 * (`mirror-grip.ts` `lobeUnder`) and the clock would cover it. Whether the partner's thumb is on it is still
 * never drawn: the clock is the same with it on or off, and that is the
 * split.
 *
 * The verdicts come last, over everything, on every screen: the green of a
 * step made right on a lobe or of the pin landing, the red of a wrong step
 * or a press from the seat the lobe is not asked of (`mirrorTouch`,
 * `mirrorGrip`, `mirrorRefuse`). Keys are the lobes' `mirrorLobe` ids, 0 its
 * cannon and 1 its shield.
 */
export class MirrorMarks {
  /** Was the last touch on each lobe right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "mirrorTouch") this.verdicts.mark(e.id, e.right);
      if (e.type === "mirrorRefuse") this.verdicts.mark(e.id, false);
      if (e.type === "mirrorGrip" && e.on) {
        this.verdicts.mark(0, true);
        this.verdicts.mark(1, true);
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The column each lobe stands in: its cannon's own, its shield over the pair's. */
function colOf(m: MirrorState, shieldCol: number, id: 0 | 1): number {
  return id === 0 ? m.cannonCol : shieldCol;
}

/** Whether a lobe's centre stands inside one of `mine`: the two lobes one inside the other. */
function insideOwn(
  l: Layout,
  cfg: SimConfig,
  m: MirrorState,
  shieldCol: number,
  mine: readonly (0 | 1)[],
  c: Circle,
): boolean {
  return mine.some((id) =>
    hitCircle(mirrorLobeCircle(l, cfg, id, colOf(m, shieldCol, id)), c.x, c.y),
  );
}

/** The asking, drawn over the mirror and under the grip's rings. */
export function drawMirrorAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MirrorState,
  shieldCol: number,
  time: number,
): void {
  const seat = seatOf(l.role);
  const mine = mirrorAsks(m, seat);
  const theirs = mirrorAsks(m, seat === 1 ? 2 : 1);
  const held = mirrorGesture(m) === "hold" && (m.holdThumbs & thumbBit(seat)) !== 0;
  for (const id of [0, 1] as const) {
    const c = mirrorLobeCircle(l, cfg, id, colOf(m, shieldCol, id));
    if (mine.includes(id)) {
      if (!held) drawMarkHalo(ctx, c.x, c.y, c.r, time);
    } else if (theirs.includes(id) && !insideOwn(l, cfg, m, shieldCol, mine, c)) {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
  }
}

/** The verdict round each lobe, last of all. */
export function drawMirrorVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MirrorState,
  shieldCol: number,
  verdicts: GripVerdicts,
): void {
  for (const id of [0, 1] as const) {
    const v = verdicts.at(id);
    if (v === null) continue;
    const c = mirrorLobeCircle(l, cfg, id, colOf(m, shieldCol, id));
    drawVerdictRing(ctx, c.x, c.y, c.r, v);
  }
}
