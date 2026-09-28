import {
  type MazeState,
  mazeHeartAsks,
  mazeStringAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { mazeHeartRing } from "./maze-grip.js";
import { mazeStringCircle, mazeStringHandle } from "./maze-string.js";
import { seatOf } from "./view-role.js";

/**
 * **THE MAZE's string and heart answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each part is asked is the simulation's (`mazeStringAsks`,
 * `mazeHeartAsks`), and whose it is never changes: the string is the pilot's,
 * under `read` to turn and under `grip` to brace, and the heart is the
 * navigator's while it holds the shot. On this screen the part asked of this
 * seat wears the halo, until the sim has this hand on it (`dragging`,
 * `gripThumb`), whose lit knob or filled ring says so; the part asked of the
 * partner wears their turning ring and the clock — *not your hand, theirs* —
 * and whether the partner is on it is still never drawn.
 *
 * The verdicts come last, over everything, on every screen: the green of her
 * thumb landing on the heart and of the tear, which is both hands at once,
 * and the red of a press from the seat the part is not asked of (`mazeGrip`,
 * `mazeVerdict`, `mazeRefuse`). Keys are 0 for the string and 1 for the heart.
 * Kept in `MazeGripFx` (`maze-grip-fx.ts`), which is `BossTransients.maze`.
 */
export class MazeMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "mazeGrip" && e.on) this.verdicts.mark(HEART, true);
      // Only the tear is a right verdict (`mazeRight`), and it took both hands.
      if (e.type === "mazeVerdict" && e.right) {
        this.verdicts.mark(STRING, true);
        this.verdicts.mark(HEART, true);
      }
      if (e.type === "mazeRefuse") this.verdicts.mark(e.part === "string" ? STRING : HEART, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const STRING = 0;
const HEART = 1;

/** The two parts: where each stands this frame, whose it is, whether asked and held. */
function parts(l: Layout, cfg: SimConfig, m: MazeState) {
  const knob = mazeStringHandle(l, cfg, m);
  const string: Circle = { x: knob.x, y: knob.y, r: mazeStringCircle(l, cfg).r };
  return [
    { id: STRING, c: string, seat: 1, asked: mazeStringAsks(m), held: m.dragging },
    { id: HEART, c: mazeHeartRing(l, cfg, m), seat: 2, asked: mazeHeartAsks(m), held: m.gripThumb },
  ] as const;
}

/** The asking, drawn over the drum and under the string's knob and the heart's ring. */
export function drawMazeAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  time: number,
): void {
  const seat = seatOf(l.role);
  for (const p of parts(l, cfg, m)) {
    if (!p.asked || p.c.r <= 0) continue;
    if (p.seat === seat) {
      if (!p.held) drawMarkHalo(ctx, p.c.x, p.c.y, p.c.r, time);
    } else {
      drawMarkTheirs(ctx, p.c.x, p.c.y, p.c.r, time);
      drawMarkWait(ctx, p.c.x, p.c.y, p.c.r, time);
    }
  }
}

/** The verdict round each part, last of all. */
export function drawMazeVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  verdicts: GripVerdicts,
): void {
  for (const p of parts(l, cfg, m)) {
    const v = verdicts.at(p.id);
    if (v === null || p.c.r <= 0) continue;
    drawVerdictRing(ctx, p.c.x, p.c.y, p.c.r, v);
  }
}
