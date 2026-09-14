import { type MazeState, mazeHeartColor } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * The numbers THE MAZE's heart runs on, kept apart from the drawing of it
 * (`maze-heart.ts`): which blood the round is on, the double thump, the tempo
 * from whole to hurt, and how long a wound lasts. Everything here reads
 * `world.beat` and the frame's phase and stores nothing, so both phones thump
 * together and a restart has nothing to clear. `maze-drips.ts` and
 * `maze-stage.ts` ask it for the blood alone.
 */
/**
 * The two colours it alternates between, in round order: a slick's red, then a
 * bulb's cyan. Named against the creatures rather than against the palette
 * keys, because that is what the owner asked for and what a player would say.
 */
const BLOODS: readonly [{ tint: string; rim: string }, { tint: string; rim: string }] = [
  { tint: PALETTE.red, rim: PALETTE.redRim },
  { tint: PALETTE.cyan, rim: PALETTE.cyanRim },
];

/**
 * Which blood this round runs on. Which colour that *is* is `sim`'s rule, not
 * this file's: it decides whether a shot arriving in the middle counts, and a
 * second copy of it here is how a heart comes to be drawn one colour and to
 * accept the other.
 */
export function mazeHeartBlood(round: number): { tint: string; rim: string } {
  return mazeHeartColor(round) === "red" ? BLOODS[0]! : BLOODS[1]!;
}

/**
 * The double thump, 0 at rest and 1 at the top of a squeeze.
 *
 * Two squeezes a beat, the second smaller and close behind the first, then a
 * long fall to nothing — lub, dub, wait. The wait is most of the beat and is
 * what stops it reading as a pulsing light: a heart is mostly still.
 */
export function thump(phase: number): number {
  const p = phase - Math.floor(phase);
  const hit = (at: number, width: number, height: number) => {
    const d = (p - at) / width;
    return d < 0 || d > 1 ? 0 : height * Math.sin(d * Math.PI) ** 2;
  };
  return Math.min(1, hit(0, 0.17, 1) + hit(0.22, 0.13, 0.55));
}

/** Thumps a beat at full health, and at none. The owner asked for it to start
 * much slower than it did and to beat more as it is hurt; these are the two
 * ends of that. */
const SLOWEST = 0.34;
const FASTEST = 1.15;

/** Beats a hit's own burst lasts — the flare, the recoil and the throw. */
const WOUND = 1.6;

/** Where the heart is in its beat, from the round and the beat it is on. */
export interface HeartPulse {
  /** The heart's own clock — beats scaled by how hurt it is. */
  readonly time: number;
  /** A hit just landed, 1 on the beat it lands and 0 once `WOUND` beats have gone. */
  readonly struck: number;
  /** How far the muscle is squeezed, 0 at rest and 1 at the top of a thump or a hit. */
  readonly squeeze: number;
}

/**
 * The pulse this frame. It reads the whole round rather than a beat: how much
 * of the boss's hull is gone is how fast it beats, and a verdict just landed
 * is a hit it has to show.
 */
export function heartPulse(m: MazeState, beat: number, beatPhase: number): HeartPulse {
  const hurt = Math.max(0, Math.min(1, 1 - m.hullMilli / 100_000));
  // Slow when it is whole, racing when it is not. A rate rather than a
  // schedule, so nothing has to be stored between beats to know where it is.
  const time = (beat + beatPhase) * (SLOWEST + (FASTEST - SLOWEST) * hurt);
  // A hit throws the muscle open on top of whatever it was doing.
  const struck =
    m.phase === "verdict" && m.verdict === 1
      ? Math.max(0, 1 - (beat - m.phaseBeat + beatPhase) / WOUND)
      : 0;
  const squeeze = Math.min(1, thump(time) + struck * 0.9);
  return { time, struck, squeeze };
}
