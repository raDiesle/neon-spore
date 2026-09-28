import {
  type RatchetState,
  ratchetCatchAsks,
  ratchetPawlAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { ratchetCatchCircle, ratchetPadCircle, ratchetTakesHand } from "./ratchet-grip.js";
import { showsRatchetCatch, showsRatchetPawl } from "./view-role-clocks-c.js";

/**
 * **THE RATCHET's catch and pawl answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — THE HASP's case, which this boss is
 * built on (`hasp-marks.ts`).
 *
 * Whether a mark asks is the simulation's (`sim/ratchet.ts`): her catch while
 * the rack takes a hand, it is not set and the state is not the kick
 * (`ratchetCatchAsks`); his pawl while a tooth is lit, or the kick or the
 * bind wants it down, and his thumb is off it (`ratchetPawlAsks`).
 *
 * **No partner's ring, and no waiting clock**, HASP's reason: each seat is
 * shown its own half and never the other's (`view-role-clocks-c.ts`), and a
 * ring on his screen that went away when she set the catch would be `SET`
 * said for her. The wrong seat has no mark to press, so nothing is refused.
 *
 * The verdicts are the rack's own words, each on the hand it names: `SET`
 * greens the catch and a clean tooth the pawl; **a burnt tooth is red on
 * both**, because the tooth is the two hands' one sequence and neither screen
 * shows which half of it was missing — the ring is the one mark a burn
 * leaves, and it is a verdict rather than a reward (`ratchet-fx.ts`). The
 * story states green or red the hand they asked for: the slip and the wind
 * her catch, the kick his pawl, the bind both.
 *
 * Held in `RatchetFx` (`ratchet-fx.ts`). Keyed by `RATCHET_CATCH_MARK` and
 * `RATCHET_PAWL_MARK`.
 */
export const RATCHET_CATCH_MARK = 0;
export const RATCHET_PAWL_MARK = 1;

/** Each word of the rack's that is a verdict: what it says of the catch, and of the pawl — `null` for nothing. */
const SAYS: Readonly<Record<string, readonly [boolean | null, boolean | null]>> = {
  ratchetSet: [true, null],
  ratchetClick: [null, true],
  ratchetBurn: [false, false],
  ratchetBite: [true, null],
  ratchetDrop: [false, null],
  ratchetSeat: [null, true],
  ratchetFly: [null, false],
  ratchetMesh: [true, true],
  ratchetShake: [false, false],
  ratchetWound: [true, null],
  ratchetUnwind: [false, null],
};

export class RatchetMarks {
  /** Was the last touch on the catch, and on the pawl, right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const said = SAYS[e.type];
      if (said === undefined) continue;
      const [caught, pawl] = said;
      if (caught !== null) this.verdicts.mark(RATCHET_CATCH_MARK, caught);
      if (pawl !== null) this.verdicts.mark(RATCHET_PAWL_MARK, pawl);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The halos, under the marks, each on its own seat's screen. */
export function drawRatchetHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  if (showsRatchetPawl(l.role) && ratchetPawlAsks(s)) {
    const pad = ratchetPadCircle(l, cfg);
    drawMarkHalo(ctx, pad.x, pad.y, pad.r, time);
    ctx.globalAlpha = fade;
  }
  if (showsRatchetCatch(l.role) && ratchetCatchAsks(s, cfg)) {
    const bar = ratchetCatchCircle(l, cfg, s);
    drawMarkHalo(ctx, bar.x, bar.y, bar.r, time);
    ctx.globalAlpha = fade;
  }
}

/** The verdicts, over the marks, each only where its mark is drawn. */
export function drawRatchetVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
  v: GripVerdicts,
): void {
  const pawl = v.at(RATCHET_PAWL_MARK);
  if (pawl !== null && showsRatchetPawl(l.role)) {
    const pad = ratchetPadCircle(l, cfg);
    drawVerdictRing(ctx, pad.x, pad.y, pad.r, pawl);
  }
  const caught = v.at(RATCHET_CATCH_MARK);
  if (caught !== null && showsRatchetCatch(l.role) && ratchetTakesHand(s)) {
    const bar = ratchetCatchCircle(l, cfg, s);
    drawVerdictRing(ctx, bar.x, bar.y, bar.r, caught);
  }
}
