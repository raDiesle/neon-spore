import { type BellowsState, bellowsDepthMilli, bellowsHeld, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **How far through a pose THE BELLOWS is**, and how full each chamber is
 * drawn — the clock the whole scene is posed off (§19, *Animation*).
 *
 * Its own page off `bellows-draw.ts` for `gimbal-drum.ts`'s reason: next door
 * is *where the lung is*, which a thumb is answered against, and here is
 * *what it is doing*, which nothing is ever answered against. Every number
 * here is read off the boss and the beat, so nothing is kept between frames
 * and a restart poses the lung from the state alone (`restart.test.ts`).
 *
 * **The five poses are the seven phases, and the morph between two of them is
 * always the fill.** There is one body and one number in it — how far a
 * housing is drawn out — so a pose is never cut to: the chambers move to it
 * over the beats the simulation gives the phase, which is the standard a
 * boss's look is measured against (`.claude/skills/new-boss` §5).
 */

/** How far through a phase the scene is, 0..1, counted from the beat it began. */
function through(s: BellowsState, beats: number, beat: number, beatPhase: number): number {
  const done = (beat - s.phaseBeat + beatPhase) / Math.max(1, beats);
  return Math.min(1, Math.max(0, done));
}

/** How far up out of the dark the lung has come, 0..1 — 1 everywhere but the opening still. */
export function bellowsStillPhase(
  s: BellowsState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "still" ? through(s, cfg.bellowsStillBeats, beat, beatPhase) : 1;
}

/** How far through a jam, 0..1; 0 outside one, so the shudder is drawn by multiplication. */
export function bellowsJamPhase(
  s: BellowsState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "jam" ? 1 - through(s, cfg.bellowsJamBeats, beat, beatPhase) : 0;
}

/** How far the seam parting right now has opened, 0..1; 0 when none is. */
export function bellowsSeamGoing(
  s: BellowsState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "seam" ? smoothstep(through(s, cfg.bellowsSeamBeats, beat, beatPhase)) : 0;
}

/**
 * **How far the two halves have fallen away from each other**, 0..1, and the
 * one number the perspective change rides: nought while the waist holds, and
 * rising over the vent's own beats once it has let go
 * (`bellowsMouthPath`). Everything the split is made of reads this, so a
 * housing and its mouth cannot swing apart.
 */
export function bellowsApart(
  s: BellowsState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "vent" ? smoothstep(through(s, cfg.bellowsVentBeats, beat, beatPhase)) : 0;
}

/**
 * **How far a seat's chamber is drawn out**, in thousandths — the fill, and
 * the whole of the morph between two poses.
 *
 * The lung is one breath in two chambers: the pilot's draws open under his
 * hand, the breath crosses the waist, and the navigator's shuts under hers.
 * So while it is his beat the fill *is* his thumb's depth, and while it is
 * hers her chamber is full and closing by hers — the picture is deformed by
 * how far the answer is along, which is the fourth of the five standards.
 *
 * **A jam is drawn as the folds caught halfway** on both. What the state says
 * in that phase is only *neither handle moves*, and the pose the pair has to
 * recognise across two screens is *stuck* — a chamber left wherever the last
 * stroke happened to leave it would make the fault look like an ordinary beat.
 */
export function bellowsFillMilli(
  s: BellowsState,
  cfg: SimConfig,
  player: 1 | 2,
  beat: number,
  beatPhase: number,
): number {
  const reach = Math.max(1, cfg.bellowsReachMilli);
  const carried = Math.round((bellowsDepthMilli(s, player) * 1000) / reach);
  const settling = bellowsHeld(s, player) ? carried : 0;
  switch (s.phase) {
    case "still":
      return 0;
    case "pull":
      return player === 1 ? settling : 0;
    case "push":
      return player === 1 ? 1000 : 1000 - settling;
    case "jam":
      return 500;
    case "seam":
      // The breath has crossed: his chamber drawn out and hers pressed flat,
      // which is the shape that parted the seam, easing back as the ribs
      // settle over `bellowsSeamBeats`.
      return player === 1 ? 1000 - Math.round(700 * bellowsSettle(s, cfg, beat, beatPhase)) : 0;
    case "last":
      return 1000;
    case "vent":
      return Math.round(1000 * (1 - bellowsApart(s, cfg, beat, beatPhase)));
    default:
      return 0;
  }
}

/** How far the ribs have settled after a seam parted, 0..1 — the breath going out of the pose. */
function bellowsSettle(s: BellowsState, cfg: SimConfig, beat: number, beatPhase: number): number {
  return smoothstep(through(s, cfg.bellowsSeamBeats, beat, beatPhase));
}
