import { type GaugeState, gaugeBandAsks, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { type Dial, showsGaugeMarks } from "./gauge.js";
import { gaugeBandGrip } from "./gauge-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import type { ViewRole } from "./view-role.js";

/**
 * **THE GAUGE's band answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a round built on a
 * knowledge split lets it.
 *
 * Whether it is asked is the simulation's (`sim/gauge-hand.ts`
 * `gaugeBandAsks`): the band is the navigator's while it is wound. On the
 * screen that shows it, it wears the halo under its ring (`gauge-grip.ts`)
 * until the thumb is down, and the thumb landing washes it green
 * (`gaugeHold`). The needle was the pilot's while the valve was jammed, until
 * the jam went on 2 October 2026.
 *
 * **Half of the convention is missing on purpose.** Every other mark wears
 * the partner's turning ring and clock on the other screen, and a press from
 * the wrong seat is refused red. Here the band is never drawn on the pilot's
 * screen (`docs/spec/interludes.md`), so a ring there would tell him the one
 * thing the round keeps from him. The test screen draws it too.
 */
export class GaugeMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "gaugeHold" && e.part === "band") this.verdicts.mark(BAND, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const BAND = 0;

/** Each part this role's screen shows, where it stands, and whether it is asked and held. */
function parts(
  l: Layout,
  cfg: SimConfig,
  dial: Dial,
  g: GaugeState,
  role: ViewRole,
): { key: number; c: Circle; asked: boolean; held: boolean }[] {
  const out: { key: number; c: Circle; asked: boolean; held: boolean }[] = [];
  if (showsGaugeMarks(role)) {
    const c = gaugeBandGrip(l, cfg, dial, g);
    out.push({ key: BAND, c, asked: gaugeBandAsks(g), held: g.openThumb });
  }
  return out;
}

/** The halo on a part asked and not yet held, under the grip's ring. */
export function drawGaugeAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  dial: Dial,
  g: GaugeState,
  role: ViewRole,
  time: number,
): void {
  for (const p of parts(l, cfg, dial, g, role)) {
    if (p.asked && !p.held) drawMarkHalo(ctx, p.c.x, p.c.y, p.c.r, time);
  }
}

/** The verdict round each part this screen shows, last of all. */
export function drawGaugeVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  dial: Dial,
  g: GaugeState,
  role: ViewRole,
  verdicts: GripVerdicts,
): void {
  for (const p of parts(l, cfg, dial, g, role)) {
    const v = verdicts.at(p.key);
    if (v !== null) drawVerdictRing(ctx, p.c.x, p.c.y, p.c.r, v);
  }
}
