import {
  type LedgerState,
  ledgerHaulable,
  ledgerPullable,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import {
  drawLedgerHaul,
  drawPilotRing,
  ledgerCordRing,
  ledgerHaulCircle,
  STILL,
} from "./ledger-haul.js";
import { ledgerBeadU } from "./ledger-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsLedgerBead } from "./view-role-clocks.js";

/**
 * **The pilot's two hands on THE LEDGER's cord**: his thumb on the soonest
 * return, and his carry on the taut cord at the end (`sim/ledger-hand.ts`,
 * `docs/spec/bosses.md` §11.27).
 *
 * Both shipped in the simulation on 19 September 2026 with nothing drawn to
 * take hold of: no ring, no branch of `touch.ts`, no seat that could see one.
 * The look is exempt under *a look with no shipped alternative* — there was no
 * drawing of either to run a candidate against.
 *
 * **Neither of his stands on the root, and that is the whole placement.** The
 * cord fades out above the plating on his screen so he cannot read the column
 * it is rooted in (`ledger-cord.ts`), and a ring is a mark: one drawn in the
 * faded stretch would put back exactly what the fade takes away. So the bead's
 * rides the bead, which is already his to see, and the haul's stands at a
 * fixed place above the fade, in the stretch of cord both screens draw whole
 * (`ledger-haul.ts`, `HAUL_U`).
 *
 * **They are drawn with the body and the cord** (`ledger-draw.ts`), before the
 * beads and not after: `drawHandleRing` fills opaquely, and a ring drawn over
 * the bead it is about would leave him holding a disc with no return in it.
 *
 * The two are never offered together — `whipping` against `taut` — so one
 * entry point draws whichever the cord is showing and one answers a press for
 * it.
 */

/**
 * **His ring on the soonest return**, or `null` where there is none to haul.
 *
 * The bead itself comes from the rule (`ledgerPullable`), so the ring cannot
 * be on a different return from the one the press would move — which is the
 * mistake `sim/ledger-gates.ts` exists to make impossible, said about a
 * picture instead of about a rule.
 */
export function ledgerBeadCircle(
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  beat: number,
  beatPhase: number,
  time = STILL,
): Circle | null {
  const b = ledgerPullable(t, cfg, beat);
  if (b === null) return null;
  return ledgerCordRing(l, cfg, t, time, ledgerBeadU(b, beat, beatPhase));
}

/**
 * The press, answered as whichever of the two the cord is offering. **Both are
 * player 1's**, so a press from the navigator falls through to whatever is
 * behind it exactly as if no ring were there — which is what `ledgerHandsHeard`
 * does with the command anyway.
 *
 * The two gates are exclusive by construction, so the order decides nothing;
 * the bead is asked first because it is the one that comes first in the fight.
 */
export function ledgerPullUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const t = bossOf(field, "ledger");
  if (t === null || field.seat !== 1) return null;
  const { cfg, beat, beatPhase } = field;
  const bead = ledgerBeadCircle(l, cfg, t, beat, beatPhase);
  if (bead !== null && hitCircle(bead, x, y)) return grab("ledgerBead", x, y);
  if (!ledgerHaulable(t, cfg, beat)) return null;
  if (!hitCircle(ledgerHaulCircle(l, cfg, t), x, y)) return null;
  return grab("ledgerCord", x, y);
}

/**
 * Either of them, as a plain drag carrying no number. The pull reads nothing
 * off the carry at all — it is over in the tick it is made — and the haul
 * reads `fromYMilli` off every move after this one, so the grab is the same
 * shape for both.
 */
function grab(target: "ledgerBead" | "ledgerCord", x: number, y: number): Touch {
  return {
    player: 1,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: 1, originX: x, originY: y },
  };
}

/**
 * **Both of them are on his screen and neither is dimmed on hers**, which is
 * lane ten's ruling arrived at from the other side (`ledger-grip.ts`).
 *
 * The bead's is behind the same gate as the bead it rides (`showsLedgerBead`):
 * the ring would say where the return has got to, which is the half of this
 * fight she is not shown, and it would say it in the middle of the cord where
 * she reads everything. The last return is the one bead drawn on both screens
 * and this ring is never on it — `ledgerPullable` refuses the last — so the
 * exception and the gate never meet.
 *
 * The haul's was drawn dim on hers for one frame, on the argument that the
 * tear is refused while the plate covers the socket and **he cannot see the
 * column he is being refused for**, so a mark on her screen was her cue to say
 * it was clear. The picture settled it: a ring fills opaquely and hers came
 * out a black disc on the cord, in the one place her screen has never put a
 * disc. The refusal is silent by design and the thing that makes him ask is
 * his own dial standing at nought (`sim/ledger-gates.ts`), so she needed no
 * mark at all.
 *
 * **The bead's dial is the clock its own gesture is racing**: how far down the
 * cord that return has got, so what fills is the chance to haul it and it is
 * full when the bill lands. It is never drawn held, because the pull is over
 * in the tick it is made and the answer is the bead jumping a beat down the
 * cord with its own count dropping — a picture the fight already draws.
 */
export function drawLedgerPulls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  beatPhase: number,
  time: number,
): void {
  if (!showsLedgerBead(l.role)) return;
  const { cfg, beat } = world;
  const b = ledgerPullable(t, cfg, beat);
  if (b !== null) {
    const u = ledgerBeadU(b, beat, beatPhase);
    drawPilotRing(ctx, ledgerCordRing(l, cfg, t, time, u), false, u, time);
    return;
  }
  drawLedgerHaul(ctx, l, cfg, t, beat, time);
}
