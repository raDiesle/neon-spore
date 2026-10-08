import type { BastionLayer, BastionState, SimConfig } from "@neon-spore/sim";
import { type At, bastionCentre } from "./bastion-shape.js";
import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";

/**
 * **THE BASTION's pose**: where in its story the moon is this frame, read off
 * the boss and the beat and never kept — coming in out of deep space, a shell
 * coming away, a shell growing back, a node charging, the core blowing.
 */
export interface BastionPose {
  /** The moon's centre this frame. */
  c: At;
  /**
   * How near the moon has come, 0..1: it arrives out of deep space at its own
   * place, growing as it comes, never down past the top of the screen where
   * the seat switcher stands (`boss-top.test.ts`).
   */
  near: number;
  /** The shell coming away and how far it has gone, 0..1, or null. */
  shed: { layer: BastionLayer; k: number } | null;
  /** How whole the lit shell is: below 1 while it grows back. */
  grow: number;
  /** How far the core has blown, 0..1: nought until the last shell is off. */
  blow: number;
  /** How far the charging node has charged, 0..1, or -1 with none. */
  charge: number;
  /** The beat's swell, 1 on the beat and 0 half a beat after: what the lights breathe on. */
  pulse: number;
}

/** A pose with the moon at rest, every shell whole: what a test draws by. */
export function bastionAtRest(l: Layout, cfg: SimConfig): BastionPose {
  return { c: bastionCentre(l, cfg), near: 1, shed: null, grow: 1, blow: 0, charge: -1, pulse: 0 };
}

export function bastionPose(
  l: Layout,
  cfg: SimConfig,
  s: BastionState,
  beat: number,
  beatPhase: number,
): BastionPose {
  const now = beat + beatPhase;
  const since = now - s.phaseBeat;
  const c = bastionCentre(l, cfg);
  const pulse = Math.max(0, 1 - 2 * beatPhase);
  // Coming in out of the dark, slowing as it arrives.
  const near = s.phase === "enter" ? smoothstep(Math.min(1, since / cfg.bastionEnterBeats)) : 1;
  const gone = s.steps[s.cursor - 1]?.layer;
  const shed =
    (s.phase === "shed" || s.phase === "spent") && gone !== undefined
      ? { layer: gone, k: Math.min(1, since / cfg.bastionShedBeats) }
      : null;
  const grow = s.phase === "regrow" ? Math.min(1, since / cfg.bastionRegrowBeats) : 1;
  const blow = s.phase === "spent" ? Math.min(1, since / cfg.bastionSpentBeats) : 0;
  const charge =
    s.dischargeBeat < 0
      ? -1
      : Math.max(0, Math.min(1, 1 - (s.dischargeBeat - now) / cfg.bastionChargeBeats));
  return { c, near, shed, grow, blow, charge, pulse };
}
