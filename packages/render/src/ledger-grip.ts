import { type LedgerState, ledgerFootable, ledgerPlugs, type World } from "@neon-spore/sim";
import { hitCircle, type Layout } from "./layout.js";
import { ledgerRootCircle } from "./ledger-cord-shape.js";
import { drawSoakHold } from "./soak-hold.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The navigator's two hands on THE LEDGER's root**: the foot of the cord
 * while it is still paying out, and her thumb in the socket once it is in
 * (`sim/ledger-hand.ts`, `docs/spec/bosses.md` §11.27).
 *
 * Both shipped in the simulation on 19 September 2026 with nothing drawn to
 * take hold of: no ring, no branch of `touch.ts`, no seat that could see one.
 * The look is exempt under *a look with no shipped alternative* — there was no
 * drawing of either to run a candidate against.
 *
 * **One circle, and the movement says which gesture it is.** That is this
 * boss's arrangement and no other's: the two are the same hand on the same
 * thing at two times — the root of the cord — and they are never offered
 * together, because the foot is `rooting` alone and the plug is `paying` and
 * `whipping`. Giving them two places would have taught a pair that the root
 * has a handle *and* a second handle beside it, when what it has is a hand on
 * it that means different things before and after the cord goes in. The pair
 * learns one sentence — *your hand is on the root* — which is the sentence
 * this whole fight is played with.
 *
 * **Which seat was decided before the placement was.** Half of one drawn
 * object is hidden from each of them: he is shown the returns coming down and
 * how many beats are left of them, she is shown where the cord is rooted and
 * the column it walks to next, and the cord itself fades out above the plating
 * on his screen (`ledger-cord.ts`, `ledger-read.ts`). A thumb may only be put
 * on the part of the cord its own seat can see, so both of these are hers.
 *
 * **It stands clear of the lock rather than inside it.** `drawHandleRing`
 * fills opaquely and the white lock around the socket is the one mark on
 * either screen that names the column the plate has to be in — the fight's
 * whole instruction, drawn as interface rather than as body
 * (`ledger-read.ts`). So the ring hangs **a tile and a fifth** above the plating,
 * in the air the cord's last stretch comes down through, and the lock and the
 * chevron beside it are left standing under it; the figure was walked up over two frames, the dial
 * closing over the lock's brackets at half a tile and coming down onto them
 * at a whole one (`ledger-shape.ts`). The circle itself is
 * that file, with everything else about where this boss is: the word that
 * stands in `rooting` stands on it (`boss-cue-read-o.ts`).
 *
 * **It is the HOLD LAB's drop** (`soak-hold.ts`) since 14 October 2026, the
 * owner on this boss: *why there is a circle with asks for taps, but follows
 * old visual, not the up to date "press" visuals and behavior?* It was a
 * violet handle ring with a dial draining round it, the look every hold wore
 * before 13 October; the drop is every hold's now, and both of hers are a
 * thumb that rests.
 */

/** The one circle, from the file that holds every other place this boss is. */
export { ledgerRootCircle };

/**
 * The press, answered as whichever of the two the fight is offering. **Both
 * are player 2's**, so a press from the pilot falls through to whatever is
 * behind it exactly as if no ring were there — which is what `ledgerHandsHeard`
 * does with the command anyway.
 *
 * The two gates are exclusive by construction (`rooting` against `paying` and
 * `whipping`), so the order here decides nothing; the foot is asked first
 * because it is the one that comes first in the fight.
 */
export function ledgerGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const t = bossOf(field, "ledger");
  if (t === null || field.seat !== 2) return null;
  const { cfg, beat } = field;
  if (!hitCircle(ledgerRootCircle(l, cfg, t), x, y)) return null;
  if (ledgerFootable(t, cfg, beat)) return grab("ledgerFoot", x, y);
  if (ledgerPlugs(t, cfg, beat)) return grab("ledgerSocket", x, y);
  return null;
}

/**
 * Either of them, as a plain drag carrying no number: there is one cord and
 * one socket, and the world knows which column both of them are in. The foot
 * reads `fromMilli` off every move after this one and the plug reads nothing
 * at all, so the grab is the same shape for both.
 */
function grab(target: "ledgerFoot" | "ledgerSocket", x: number, y: number): Touch {
  return {
    player: 2,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: 2, originX: x, originY: y },
  };
}

/**
 * The ring, drawn **on the finished ship** beside the grommet and the lock it
 * belongs to (`ledger-root.ts`), and not with the body and the cord.
 *
 * The body goes down with the field pass and the ship is painted over it; this
 * ring stands a tile and a fifth off the hull line, where that pass is at its
 * busiest.
 * It is the argument `ledger-root.ts` makes for the grommet and the lock being
 * there — the first capture of this boss had the grommet surviving as a smudge
 * and the lock not surviving at all — and it applies to a disc more than to
 * either of them.
 *
 * **Drawn on her screen alone**, which is not the bargain `sinew-handles.ts`
 * made — every handle since has stood on both screens, dim on the seat that
 * may not pull it, because neither of them can feel the other's thumb. It
 * does not hold on this boss, and the frame that was taken of it is why: the
 * ring stands in `t.socket`'s own column, so a dim one on his screen *names
 * the column the cord is rooted in* — the exact half of this fight the cord
 * is faded out above the plating to keep from him (`ledger-cord.ts`,
 * `view-role-clocks.ts`). A handle drawn where it may not be held is a small
 * courtesy; one that reads out the other seat's secret is the fight. So it
 * goes behind `showsLedgerSocket`, with the grommet and the lock it stands
 * over (`ledger-root.ts`) — THE SCOUT's pair, where a split fight shows
 * neither seat both handles.
 *
 * **The drop's water rises on two different clocks.** The foot's is how much
 * of `ledgerRootBeats` has gone — two beats, and then where the cord went in
 * is where it went in for the rest of the fight, so what she is watching fill
 * is her whole chance to choose the geometry used up. The plug's is the grace
 * spent, of `ledgerPlugBeats` for the whole encounter, and it is drawn
 * **whether or not her thumb is down** because the count keeps either way
 * (`ledger-step.ts`) — THE UNDERTOW's free, read the same way.
 */
export function drawLedgerGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  beatPhase: number,
  time: number,
): void {
  const { cfg, beat } = world;
  const at = ledgerRootCircle(l, cfg, t);
  if (ledgerFootable(t, cfg, beat)) {
    const paid = (beat - t.rootBeat + beatPhase) / Math.max(1, cfg.ledgerRootBeats);
    drawSoakHold(ctx, at, at.r, { time, held: t.foot >= 0, fill: clamp(paid) });
    return;
  }
  if (!ledgerPlugs(t, cfg, beat)) return;
  const spent = 1 - t.plugBeats / Math.max(1, cfg.ledgerPlugBeats);
  drawSoakHold(ctx, at, at.r, { time, held: t.plug, fill: clamp(spent) });
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
