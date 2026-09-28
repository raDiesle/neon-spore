import {
  type SimConfig,
  type SimEvent,
  type SnakeState,
  snakeJawsAsks,
  snakeTailAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { snakeAfoot, snakeJawsCircle, snakeTailCircle } from "./snake-grip.js";

/**
 * **SNAKE's jaws and tail answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each is asked is the simulation's (`sim/snake-controls.ts`
 * `snakeJawsAsks`, `snakeTailAsks`), and whose it is never changes: the jaws
 * are the pilot's to prise and the tail the driver's to lift. On this screen
 * the part asked of this seat wears the halo until it is taken — the prise
 * opening the mouth, which ends the asking for the mouth's rest, or her thumb
 * on the tail (`tailHeld`) — and the part asked of the partner wears their
 * turning ring and the clock. The test screen is both seats', so both are its.
 *
 * The verdicts come last, over everything: the green of the prise and of the
 * lift (`snakePrise`, `snakeLift`), and the red of a press from the seat the
 * part is not asked of (`snakeRefuse`). Keys are 0 for the jaws and 1 for the
 * tail. A round, so fed by the takeover (`effects-round-marks.ts`).
 */
export class SnakeMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "snakePrise") this.verdicts.mark(JAWS, true);
      if (e.type === "snakeLift") this.verdicts.mark(TAIL, true);
      if (e.type === "snakeRefuse") this.verdicts.mark(e.part === "jaws" ? JAWS : TAIL, false);
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
const TAIL = 1;

interface Part {
  key: number;
  c: Circle | null;
  seat: 1 | 2;
  asked: boolean;
  held: boolean;
}

/** The two parts: where each stands this tick, whose it is, whether asked and held. */
function parts(l: Layout, cfg: SimConfig, snake: SnakeState, tick: number): Part[] {
  return [
    {
      key: JAWS,
      c: snakeJawsCircle(l, cfg, snake, tick),
      seat: 1,
      asked: snakeJawsAsks(cfg, snake, tick),
      held: false,
    },
    {
      key: TAIL,
      c: snakeTailCircle(l, cfg, snake, tick),
      seat: 2,
      asked: snakeTailAsks(cfg, snake),
      held: snake.tailHeld,
    },
  ];
}

/** Whether this screen's seat is the part's — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

/** The asking, drawn over the body and under the two rings. */
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
