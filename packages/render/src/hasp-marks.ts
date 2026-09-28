import { type HaspState, haspWheelUp, type SimConfig } from "@neon-spore/sim";
import { drawVerdictRing, type GripVerdict } from "./grip-verdict.js";
import { HASP_LATCH_MARK, HASP_WHEEL_MARK } from "./hasp-fx.js";
import { haspLatchAsks, haspLatchCircle, haspWheelAsks, haspWheelCircle } from "./hasp-grip.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { showsHaspLatch, showsHaspWheel } from "./view-role-clocks-c.js";

/**
 * **THE HASP's two marks answer a touch the way every mark does**
 * (`mark-feedback.ts`, `.claude/skills/new-boss` §5) — with one piece of the
 * convention left out on purpose.
 *
 * This seat's open mark wears the halo: his latch while it will take a hand
 * and he is not past the grip (the moment `HOLD` stands on it,
 * `boss-cue-read-z.ts`), her working wheel while it is up and her hand is off
 * the rim, seized or not, because her place on it is what makes *go* one
 * word (`hasp-grip.ts`). And each mark's verdict (`hasp-fx.ts`): the latch
 * green on the grip and red on the burn, the wheel green when it comes free
 * under her hand and red when it seizes there.
 *
 * **No partner's ring, and no waiting clock.** Every other boss shows the seat
 * a mark is not asking the partner's ring where it is; here each seat is
 * shown its own half and never the other's, and the split is the fight
 * (§11.37, `view-role-clocks-c.ts`). A ring on her screen where his latch is
 * would be the latch drawn for her, and one that went away when he gripped
 * would be the gate said aloud. So the wrong seat has no mark to press, and
 * nothing is refused on it: a thumb there finds whatever is behind it.
 */

/** The halo's and the verdict's radius round the latch's bar, in handle radii. */
const RING = 1.5;

/** The halos, under the marks: drawn before the wheel and the latch. */
export function drawHaspHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  if (showsHaspWheel(l.role) && haspWheelAsks(s)) {
    const w = haspWheelCircle(l, cfg, s);
    drawMarkHalo(ctx, w.x, w.y, w.r, time);
    ctx.globalAlpha = fade;
  }
  if (showsHaspLatch(l.role) && haspLatchAsks(s, cfg)) {
    const bar = haspLatchCircle(l, cfg, s);
    drawMarkHalo(ctx, bar.x, bar.y, bar.r * RING, time);
    ctx.globalAlpha = fade;
  }
}

/** The verdicts, over the marks, each only where its mark is drawn. */
export function drawHaspVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  verdicts: { at(key: number): GripVerdict | null },
): void {
  const wheel = verdicts.at(HASP_WHEEL_MARK);
  if (wheel !== null && showsHaspWheel(l.role) && haspWheelUp(s)) {
    const w = haspWheelCircle(l, cfg, s);
    drawVerdictRing(ctx, w.x, w.y, w.r, wheel);
  }
  const latch = verdicts.at(HASP_LATCH_MARK);
  if (latch !== null && showsHaspLatch(l.role)) {
    const bar = haspLatchCircle(l, cfg, s);
    drawVerdictRing(ctx, bar.x, bar.y, bar.r * RING, latch);
  }
}
