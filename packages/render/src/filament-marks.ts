import type { FilamentState, SimEvent } from "@neon-spore/sim";
import { filamentGrabCircle } from "./filament-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";

/**
 * **THE FILAMENT's two thumbs answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * The whole convention, since both screens draw both rings
 * (`filament-turn-draw.ts`): this seat's ring wears the halo while its move
 * is open and no thumb is on it (`sim/filament-turn.ts` `filamentAsks`), and
 * the partner's dim ring wears the waiting clock while the line waits on
 * them — that half shipped on 25 September.
 *
 * The verdicts are the line's own words (`events-filament.ts`), each on the
 * thumb whose mistake it names: a tile lit or followed washes that ring
 * green; a snap is his, a recoil hers, and a line that went dark is the two
 * of them too far apart, so both rings go red; a line left standing past its
 * clock is red on the thumb it waited on. **The verdict is drawn where the
 * ring is now**, which after a strike is the free end — the place both thumbs
 * have to grab again.
 *
 * Held in `FilamentFx`, the boss's own (`filament-fx.ts`). Keyed by seat.
 */
export class FilamentMarks {
  /** Was the last touch of each seat's thumb right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case "filamentDrawn":
          this.verdicts.mark(1, true);
          break;
        case "filamentFollowed":
          this.verdicts.mark(2, true);
          break;
        case "filamentSnap":
          this.verdicts.mark(1, false);
          break;
        case "filamentRecoil":
          this.verdicts.mark(2, false);
          break;
        case "filamentDark":
          this.verdicts.mark(1, false);
          this.verdicts.mark(2, false);
          break;
        case "filamentLate":
          this.verdicts.mark(e.seat, false);
          break;
        default:
          break;
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

/** Each seat's verdict, round its ring where the ring is now, on every screen — both draw both rings. */
export function drawFilamentVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  v: GripVerdicts,
): void {
  for (const seat of [1, 2] as const) {
    const verdict = v.at(seat);
    const c = verdict === null ? null : filamentGrabCircle(l, s, seat);
    if (verdict !== null && c !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  }
}
