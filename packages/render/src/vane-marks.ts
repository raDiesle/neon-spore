import {
  type SimConfig,
  type SimEvent,
  type VaneState,
  vaneArmAsks,
  vaneHousingAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { vaneHousingCircle } from "./vane-grip.js";
import { seatOf } from "./view-role.js";

/**
 * **THE VANE's arm and housing answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each part is asked is the simulation's (`sim/vane-open.ts`
 * `vaneArmAsks`, `vaneHousingAsks`), and whose it is never changes: the arm
 * is the pilot's, the housing the navigator's. On this screen the part asked
 * of this seat wears the halo under its ring (`vane-grip.ts`); the part asked
 * of the partner wears their turning ring and the clock — *not your thumb,
 * theirs* — which is the navigator's whole view of VEER until his pin lands.
 *
 * The verdicts come last, over everything, on every screen: the green of a
 * pin landing on the arm or a haul carrying the housing off, the red of a
 * press from the seat the part is not asked of (`vanePin`, `vaneHaul`,
 * `vaneRefuse`). Keys are 0 for the arm and 1 for the housing.
 */
export class VaneMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "vanePin") this.verdicts.mark(ARM, true);
      if (e.type === "vaneHaul") this.verdicts.mark(HOUSING, true);
      if (e.type === "vaneRefuse") this.verdicts.mark(e.part === "arm" ? ARM : HOUSING, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const ARM = 0;
const HOUSING = 1;

/** The two parts' circles, the arm's on the tip as drawn this instant. */
function partsAt(
  l: Layout,
  cfg: SimConfig,
  tip: { x: number; y: number },
  pivot?: number,
): [Circle, Circle] {
  return [{ x: tip.x, y: tip.y, r: handleRadius(l, cfg) }, vaneHousingCircle(l, cfg, pivot)];
}

/** The asking, drawn over the mechanism and under the grip's rings. */
export function drawVaneAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  beat: number,
  tip: { x: number; y: number },
  time: number,
  pivot?: number,
): void {
  const asked = [vaneArmAsks(cfg, b, beat), vaneHousingAsks(cfg, b, beat)];
  const seat = seatOf(l.role);
  partsAt(l, cfg, tip, pivot).forEach((c, part) => {
    if (!asked[part]) return;
    if ((part === ARM ? 1 : 2) === seat) {
      drawMarkHalo(ctx, c.x, c.y, c.r, time);
      return;
    }
    drawMarkTheirs(ctx, c.x, c.y, c.r, time);
    drawMarkWait(ctx, c.x, c.y, c.r, time);
  });
}

/** The verdict round each part, last of all. */
export function drawVaneVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  tip: { x: number; y: number },
  verdicts: GripVerdicts,
  pivot?: number,
): void {
  partsAt(l, cfg, tip, pivot).forEach((c, part) => {
    const v = verdicts.at(part);
    if (v !== null) drawVerdictRing(ctx, c.x, c.y, c.r, v);
  });
}
