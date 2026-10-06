import { type SimConfig, type SimEvent, type SnakeState, snakeJawsAsks } from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { snakeAfoot, snakeJawsCircle } from "./snake-grip.js";

/**
 * **SNAKE's jaws answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether they are asked is the simulation's (`sim/snake-controls.ts`
 * `snakeJawsAsks`), and they are always the pilot's to prise. On his screen
 * they wear the halo until the prise opens the mouth, which ends the asking
 * for the mouth's rest; on hers they wear his turning ring and the clock. The
 * test screen is both seats'. The tail was the driver's second part until the
 * owner took its hold out on 6 October 2026.
 *
 * The verdicts come last, over everything: the green of the prise
 * (`snakePrise`) and the red of a press from her seat (`snakeRefuse`). A
 * round, so fed by the takeover (`effects-round-marks.ts`).
 */
export class SnakeMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "snakePrise") this.verdicts.mark(JAWS, true);
      if (e.type === "snakeRefuse") this.verdicts.mark(JAWS, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const JAWS = 0;

interface Part {
  key: number;
  c: Circle | null;
  seat: 1 | 2;
  asked: boolean;
  held: boolean;
}

/** The parts — the jaws alone now: where they stand this tick, whose, whether asked. */
function parts(l: Layout, cfg: SimConfig, snake: SnakeState, tick: number): Part[] {
  return [
    {
      key: JAWS,
      c: snakeJawsCircle(l, cfg, snake, tick),
      seat: 1,
      asked: snakeJawsAsks(cfg, snake, tick),
      held: false,
    },
  ];
}

/** Whether this screen's seat is the part's — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

/** The asking, drawn over the body and under the ring. */
export function drawSnakeAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  snake: SnakeState,
  tick: number,
  time: number,
): void {
  for (const p of parts(l, cfg, snake, tick)) {
    if (!p.asked || p.c === null) continue;
    if (mine(l, p.seat)) {
      if (!p.held) drawMarkHalo(ctx, p.c.x, p.c.y, p.c.r, time);
    } else {
      drawMarkTheirs(ctx, p.c.x, p.c.y, p.c.r, time);
      drawMarkWait(ctx, p.c.x, p.c.y, p.c.r, time);
    }
  }
}

/** The verdict round each part, last of all — and none on a body folded up. */
export function drawSnakeVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  snake: SnakeState,
  tick: number,
  verdicts: GripVerdicts,
): void {
  if (!snakeAfoot(snake)) return;
  for (const p of parts(l, cfg, snake, tick)) {
    const v = verdicts.at(p.key);
    if (v !== null && p.c !== null) drawVerdictRing(ctx, p.c.x, p.c.y, p.c.r, v);
  }
}
