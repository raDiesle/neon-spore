import { FRONT, SIDE } from "@neon-spore/content";
import { beatSeconds, type InstarState, type SimConfig } from "@neon-spore/sim";
import { DEG, HUSH, idleDrift, subSeed, wander } from "./idle-drift.js";
import { INSTAR_HEAD } from "./instar-head-look.js";
import { instarParts } from "./instar-parts.js";
import type { InstarDrift } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import { instarFigure } from "./instar-shape.js";
import { instarHandover } from "./instar-turn.js";
import { bodyLife } from "./motion-life.js";
import { phaseInto } from "./phase-into.js";
import { type SlowSpan, slowHush } from "./slow-hush.js";

/**
 * **THE INSTAR turns on the idle drift** — the owner, 26 September 2026: the
 * full body should keep turning, look left, then right, the body too, so it
 * reads 3D (`docs/spec/living-bosses.md` §1). The side-on body is seen through
 * the rig's `view(SIDE + yaw, pitch)` and rolled about the line of sight
 * (`instar-place.ts` `instarDrifted`), and the head turns on top of it, its
 * own yaw leading the body's (`idle-drift.ts`), and every part on it drifts
 * on its own as well (`instar-parts.ts`).
 *
 * **A face looks at the players.** The head's yaw is folded: the drift's
 * "away" half is turned back toward the viewer, so the head swings between
 * profile and three-quarter and never shows the back of its skull
 * (`headTurn`).
 *
 * **It is offered, not shipped**: `amount` is 0 on the field and VERSUS's
 * candidate (`tools/versus/candidates/instar-drift/turn`) sets it to 1. At 0
 * there is no drift at all — `instarDrift` answers `undefined` and every
 * drawer and the hit test take the path they took before.
 *
 * **It is hushed** where a thumb needs the body still: to a tenth while THE
 * SLOW is open over live marks (`HUSH.liveMark`, the owner, 27 September 2026),
 * not at all face-on (the turn hands the body over, `instarHandover`), and
 * stilled over the first beats of `down`, as the weave is.
 *
 * **`reach` and `shake` are THE INSTAR's own**, on top of the shared drift —
 * the owner, 1 October 2026: the turn reads better, but the body should move
 * and shake more. `reach` scales every drifted angle, parts and all, past the
 * shared table's (`idle-drift.ts`'s ceilings are the shared drift's, at a
 * reach of 1); `shake` adds a quick tremor to the body's roll and pitch, a
 * second's cell rather than eight. Both ride the hush, so the body is as
 * still over live marks, face-on and beaten as it was.
 */
export const INSTAR_DRIFT: {
  amount: number;
  /** How far past the shared drift every angle turns: 1 is `IDLE_DRIFT`'s. */
  reach: number;
  /** The tremor on the body's roll and pitch, as a share of `SHAKE`'s; 0 is none. */
  shake: number;
  /** Whether each part drifts on the body as well (`instar-parts.ts`); off, the body turns whole. */
  parts: boolean;
  /** The head at `yaw` (`SIDE` profile, `FRONT` face-on), where the profile's head would be:
   * whichever head `INSTAR_HEAD` draws turned. */
  head: (ctx: CanvasRenderingContext2D, look: Look, yaw: number) => void;
} = {
  amount: 0,
  reach: 1,
  shake: 0,
  parts: true,
  head: (ctx, look, yaw) => INSTAR_HEAD.turned(ctx, look, yaw),
};

/** THE INSTAR's own seed for the drift, so it does not turn in step with another boss. */
const SEED = 163;
/** Beats of `down` over which a beaten body stops turning. */
const STILLING = 2;
/** The tremor at a `shake` of 1, degrees and seconds: quick, and small beside the turn. */
const SHAKE = { roll: { amp: 3, period: 1.1 }, pitch: { amp: 2, period: 0.9 } } as const;

/** The drift this frame, about the body's middle as the weave carried it; `undefined` when off. */
export function instarDrift(
  s: InstarState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
  sway: { xMilli: number; yMilli: number },
): InstarDrift | undefined {
  if (INSTAR_DRIFT.amount <= 0) return undefined;
  const f = instarFigure(s, beat, beatPhase);
  const still = s.phase === "down" ? Math.max(0, 1 - phaseInto(s, beat, beatPhase) / STILLING) : 1;
  const hush =
    INSTAR_DRIFT.amount *
    bodyLife() *
    slowHush(slow, beat, beatPhase, HUSH.liveMark) *
    instarHandover(f.side) *
    still;
  const time = (beat + beatPhase) * beatSeconds(cfg);
  const reached = hush * INSTAR_DRIFT.reach;
  const pose = idleDrift(time, SEED, reached);
  const shake = hush * INSTAR_DRIFT.shake * DEG;
  return {
    pivotXMilli: (f.headX + f.rearX) / 2 + sway.xMilli,
    pivotYMilli: (f.headY + f.rearY) / 2 + sway.yMilli,
    ...pose,
    roll: pose.roll + wander(time, subSeed(SEED, 8), SHAKE.roll) * shake,
    pitch: pose.pitch + wander(time, subSeed(SEED, 9), SHAKE.pitch) * shake,
    ...(INSTAR_DRIFT.parts ? { parts: instarParts(time, reached, f, sway) } : {}),
  };
}

/**
 * The head's yaw on the screen: the body's turn and the head's own on it,
 * folded toward the viewer and kept between the profile and face-on.
 */
export function headTurn(d: InstarDrift): number {
  return Math.min(FRONT, SIDE + Math.abs(d.yaw + d.headYaw + (d.parts?.headTurn ?? 0)));
}
