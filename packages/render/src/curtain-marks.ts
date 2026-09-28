import {
  type Creature,
  type CurtainState,
  curtainHemAsks,
  gripsCreature,
  type SimConfig,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import { curtainHemAt, curtainHemRest, curtainSheetMidX } from "./curtain-grip.js";
import { drawnCol } from "./depth.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Layout, tileCY } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE CURTAIN's hem and sheet answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * **The hem is the pilot's, and both screens draw it** (`curtain-grip.ts`).
 * While the rail is jammed and the hem at rest it asks him
 * (`sim/curtain-hand.ts` `curtainHemAsks`): the halo under it on his screen,
 * and on hers the partner's ring and clock, since her shot up the core's
 * column waits on his lift. The lift reaching the top washes it green
 * (`curtainLift`), and her press on it red (`curtainRefuse`).
 *
 * **The sheet is carried by both hands and has no open mark** — its ring is
 * drawn only while a thumb is on it, THE CAIRN's case (`cairn-marks.ts`) — so
 * what it has is the verdict: a shove that carried it is green
 * (`curtainShove`), and a shove into the jammed rail red (`curtainJam`), the
 * one wrong gesture of the pinned state.
 *
 * Held in `CurtainFx`, the boss's own (`curtain-fx.ts`).
 */
export class CurtainMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "curtainLift") this.verdicts.mark(HEM, true);
      if (e.type === "curtainRefuse") this.verdicts.mark(HEM, false);
      if (e.type === "curtainShove") this.verdicts.mark(SHEET, true);
      if (e.type === "curtainJam") this.verdicts.mark(SHEET, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The keys: one hem and one sheet, and the world knows where each is. */
export const HEM = 0;
export const SHEET = 1;

/** The asking, drawn under the hem's ring. */
export function drawCurtainAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: CurtainState,
  body: Creature,
  beatPhase: number,
  time: number,
): void {
  if (!curtainHemAsks(c)) return;
  const at = curtainHemRest(l, cfg, body, beatPhase);
  if (at === null) return;
  if (l.role !== "p2") {
    drawMarkHalo(ctx, at.x, at.y, at.r, time);
  } else {
    drawMarkTheirs(ctx, at.x, at.y, at.r, time);
    drawMarkWait(ctx, at.x, at.y, at.r, time);
  }
}

/**
 * The verdict round each part, over everything. The hem's where the hem has
 * got to; the sheet's round the hand ring, and only while a hand is on the
 * sheet, since that ring is only drawn then (`curtain-draw.ts`).
 */
export function drawCurtainVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: CurtainState,
  body: Creature,
  beatPhase: number,
  verdicts: GripVerdicts,
): void {
  const hem = verdicts.at(HEM);
  const at = hem === null ? null : curtainHemAt(l, world.cfg, c, body, beatPhase);
  if (hem !== null && at !== null) drawVerdictRing(ctx, at.x, at.y, at.r, hem);
  const sheet = verdicts.at(SHEET);
  if (sheet === null) return;
  if (!gripsCreature(world, 1, body.id) && !gripsCreature(world, 2, body.id)) return;
  const mid = curtainSheetMidX(l, world.cfg, drawnCol(body, beatPhase));
  if (mid === null) return;
  drawVerdictRing(ctx, mid, tileCY(l, world.cfg.curtainRow), l.tile * 0.8, sheet);
}
