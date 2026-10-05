import {
  type LedgerState,
  ledgerFootable,
  ledgerHaulable,
  ledgerNext,
  ledgerPlugs,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { ledgerBeadU, ledgerRootCircle } from "./ledger-cord-shape.js";
import { ledgerCordRing, ledgerHaulCircle } from "./ledger-haul.js";
import { ledgerBeadCircle } from "./ledger-pull.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { showsLedgerBead, showsLedgerSocket } from "./view-role-clocks.js";

/**
 * **THE LEDGER's three rings answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a fight split in two lets
 * it, which is THE GAUGE's case (`gauge-marks.ts`).
 *
 * Whether each is offered is the simulation's (`sim/ledger-gates.ts`): the
 * root is the navigator's — the foot while the cord is `rooting`, the plug
 * from `paying` through `whipping` — and the bead and the haul are the
 * pilot's. On the screen that shows it, a ring offered and not yet held wears
 * the halo under it.
 *
 * **Half of the convention is missing on purpose.** Every ring stands on one
 * screen only, because each would read out the half of the cord the other
 * seat is not shown (`ledger-grip.ts`, `ledger-pull.ts`) — so there is no
 * partner's ring and clock, and no press from the wrong seat to refuse red:
 * the other seat has nothing to press.
 *
 * The verdicts are green: a step of the foot and a thumb into the socket
 * (`ledgerFoot`, `ledgerPlug`) on the root, and a pull on the bead that
 * jumped (`ledgerPull`), which is the soonest return still — the ring has
 * gone from it, so the verdict rides the bead instead. **The haul has none**:
 * it lands in the tick the cord tears out of the ship, and the tear's flash,
 * burst and shock are its answer (`ledger-fx.ts`).
 *
 * Held in `LedgerFx`, the boss's own. Keys are 0 for the root and 1 for the bead.
 */
export class LedgerMarks {
  /** Was the last touch on each ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "ledgerFoot" || e.type === "ledgerPlug") this.verdicts.mark(ROOT, true);
      if (e.type === "ledgerPull") this.verdicts.mark(BEAD, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

export const ROOT = 0;
export const BEAD = 1;

/** Her ring, offered and not yet held, on the ship pass under it (`ledger-root.ts`). */
export function drawLedgerRootAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  time: number,
): void {
  if (!showsLedgerSocket(l.role)) return;
  const { cfg, beat } = world;
  const foot = ledgerFootable(t, cfg, beat) && t.foot < 0;
  const plug = ledgerPlugs(t, cfg, beat) && !t.plug;
  if (foot || plug) halo(ctx, ledgerRootCircle(l, cfg, t), time);
}

/** And its verdict, over it. */
export function drawLedgerRootVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  verdicts: GripVerdicts,
): void {
  if (!showsLedgerSocket(l.role)) return;
  const v = verdicts.at(ROOT);
  if (v === null) return;
  const at = ledgerRootCircle(l, world.cfg, t);
  drawVerdictRing(ctx, at.x, at.y, at.r, v);
}

/** His two, offered and not yet held, with the body and under the rings (`ledger-draw.ts`). */
export function drawLedgerPilotAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  beatPhase: number,
  time: number,
): void {
  if (!showsLedgerBead(l.role)) return;
  const { cfg, beat } = world;
  const bead = ledgerBeadCircle(l, cfg, t, beat, beatPhase, time);
  if (bead !== null) halo(ctx, bead, time);
  else if (ledgerHaulable(t, cfg, beat) && t.haulMilli === 0) {
    halo(ctx, ledgerHaulCircle(l, cfg, t, time), time);
  }
}

/** The pull's verdict, on the return it moved, over the beads. */
export function drawLedgerPilotVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  beatPhase: number,
  time: number,
  verdicts: GripVerdicts,
): void {
  if (!showsLedgerBead(l.role)) return;
  const v = verdicts.at(BEAD);
  const b = ledgerNext(t);
  if (v === null || b === null || b.last) return;
  const at = ledgerCordRing(l, world.cfg, t, time, ledgerBeadU(b, world.beat, beatPhase));
  drawVerdictRing(ctx, at.x, at.y, at.r, v);
}

function halo(ctx: CanvasRenderingContext2D, at: Circle, time: number): void {
  drawMarkHalo(ctx, at.x, at.y, at.r, time);
}
