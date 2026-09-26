import { MAX_BEARING_STEP, NO_BEARING, TURN } from "./bearing.js";
import type { SimConfig } from "./config.js";
import { ticksPerBeat } from "./config-derived.js";
import { type GimbalRing, gimbalBoss, gimbalTurning, INNER, OUTER } from "./gimbal.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two hands on THE GIMBAL, one ring each, and **the same turn means two
 * different things**.
 *
 * Both are a `drag` carrying a **bearing** rather than a displacement, the
 * crank's own gesture (`crank.ts`, and the argument in
 * `bearing.ts`): a finger going round a ring says where it *is*, because one
 * four times round the same circle is back where it grabbed four times over.
 * The first sample after a hand goes on says only where it started, which is
 * why a grab carries `NO_BEARING` — a hand that pretended to have grabbed at
 * the top would turn the ring up to half a turn nobody travelled.
 *
 * **The step is read on the hand's own face, and applied to the wheel.** The
 * outer ring faces the pilot and the two frames are the same. The inner ring
 * faces the navigator from the other side, so her clockwise is the wheel's
 * counter-clockwise and her step goes in negated — `MirroredBearing`, which
 * is `gimbalShownMilli` read backwards, and the one line this whole boss is.
 * Nothing on either screen says it: she finds it out by turning.
 *
 * **Geometry says which ring is whose**, so the seat is checked against the
 * target's own name rather than carried beside it: `gimbalOuter` is the
 * pilot's and `gimbalInner` the navigator's, always, and the wrong seat's
 * thumb does nothing. Silently — there is no mark to be refused on, and the
 * ring each seat is shown is the only one they can see at all
 * (`docs/spec/bosses-choreographed.md` §18, *what each seat sees*).
 *
 * Everything else about the turn — whether a ring sits on its mark, for how
 * long, and what that shears — is the beat's (`gimbal-step.ts`). A hand here
 * only ever moves a ring.
 */

/** Which ring a target names, and which seat may send it. `null` is neither. */
function ringFor(target: string): { ring: GimbalRing; player: 1 | 2 } | null {
  if (target === "gimbalOuter") return { ring: OUTER, player: 1 };
  if (target === "gimbalInner") return { ring: INNER, player: 2 };
  return null;
}

export function gimbalHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const which = ringFor(command.target);
  if (which === null || which.player !== player) return;
  const s = gimbalBoss(world);
  if (s === null) return;
  const ring = which.ring;
  // The hand off the ring, or one that has just gone on: either way there is
  // no reference, and the ring is left where it stands — to drift back to
  // rest on the beat if the hand stays off (`gimbal-step.ts`). **Heard in
  // every phase**: a hand lifted while the drum shears is off the ring all
  // the same, and a ring that kept its bearing through the shear would be
  // held, and drawn held, with no finger on it when the next marks lit.
  if (!command.on || command.fromMilli < 0) {
    s.handMilli[ring] = NO_BEARING;
    return;
  }
  // Only the turn itself waits for the marks.
  if (!gimbalTurning(s)) return;
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  const was = s.handMilli[ring];
  s.handMilli[ring] = at;
  if (was === NO_BEARING) return;
  const step = (at - was + TURN) % TURN;
  if (step === 0) return;
  // Signed, on the face the hand is on: past half a turn between two samples
  // the shorter way round is the way the finger actually went.
  const shown = step <= MAX_BEARING_STEP ? step : step - TURN;
  // And the same turn on the true wheel, mirrored for the ring gripped from
  // the far face. Thousandths in and thousandths out, integers throughout —
  // two devices cannot round this apart.
  const turned = ring === OUTER ? shown : -shown;
  s.atMilli[ring] = (((s.atMilli[ring] + turned) % TURN) + TURN) % TURN;
}

/**
 * How far a key turns a ring in one tick, for a desk with no thumb to go round
 * a circle with — **four times the drift**, and the multiple is the argument.
 *
 * The drift is the only turning speed this boss names: `gimbalDriftMilli` a
 * beat is what a ring does to itself with no hand on it (`gimbal-step.ts`), so
 * a key that turned at exactly that would be a hand worth nothing at all.
 * Four is the smallest multiple that is still slow enough not to step a ring
 * over its own tolerance between two samples — `gimbalTrueMilli` is a window
 * 45 thousandths wide and four drifts is 240 thousandths spread across a
 * beat's ticks — and a window a desk cannot land in is a control the rig
 * cannot rehearse (`apps/game/src/keys-turn.ts`).
 */
export function gimbalTurnPerTickMilli(cfg: SimConfig): number {
  return Math.max(1, Math.round((4 * cfg.gimbalDriftMilli) / ticksPerBeat(cfg)));
}
