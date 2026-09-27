import {
  type FlueState,
  flueDrifts,
  flueLitStep,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE FLUE is posed off** (§40, *Animation*), five poses: the
 * ember drifting, the damper shut; a vent's three notches spent, the ember
 * steadied; both vents spent and the core bared, the damper dropped clear;
 * the core guarded, the damper creeping back up; and the damper swung wide
 * for good, the ember gone still.
 *
 * **Where the ember is drawn is the simulation's place, spread across the
 * beat**, THE BURGEE's arrangement (`burgee-pose.ts`): the simulation moves
 * it once a beat, so while it drifts it is drawn half a beat's drift either
 * side of that place and turned back off either end of the slot the way the
 * simulation turns it, which makes the drift the continuous even glide the
 * spec asks for. **Steady, it is drawn exactly on its place and nothing
 * else**: the glide stopping dead is the tell, and it must not ease.
 */

/** The flue sliding down into the field as it arrives: 0 above it, 1 in place. */
export function flueArrived(s: FlueState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "slack" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.flueSlackBeats));
}

/** Where the ember is drawn this frame, thousandths of a column off the middle. */
export function flueEmberDrawn(world: World, s: FlueState, beatPhase: number): number {
  if (!flueDrifts(world, s)) return s.emberMilli;
  const span = world.cfg.flueSpanMilli;
  const at = s.emberMilli + s.emberDir * world.cfg.flueDriftMilli * (beatPhase - 0.5);
  if (at > span) return 2 * span - at;
  if (at < -span) return -2 * span - at;
  return at;
}

/**
 * The ember's smear behind it, in thousandths of a column: half a beat's
 * drift while it glides, and nothing at all the instant it steadies.
 */
export function flueSmear(world: World, s: FlueState): number {
  return flueDrifts(world, s) ? world.cfg.flueDriftMilli / 2 : 0;
}

/** How much of the lit step is still to run, 1 as it lights and 0 when it is out. */
export function flueLeft(s: FlueState, beat: number, beatPhase: number): number {
  const step = flueLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - phaseInto(s, beat, beatPhase) / Math.max(1, step.beats));
}

/**
 * How far the damper is open: shut over a core not bared, clear of the row
 * while it is, creeping back up across a lit damper's window — held, the
 * simulation leaves it open, run out, it shuts — and swung wide past clear
 * once the flue is spent.
 */
export function flueDamperOpen(
  s: FlueState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase === "spent") return 1 + flueSpent(s, cfg, beat, beatPhase);
  if (!s.bared) return 0;
  if (flueLitStep(s)?.ask === "damper") return flueLeft(s, beat, beatPhase);
  return 1;
}

/** How far the spent flue has faded, 0 not spent and 1 gone. */
export function flueSpent(s: FlueState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "spent") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.flueSpentBeats));
}
