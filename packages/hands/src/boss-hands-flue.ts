import {
  flueBoss,
  flueEmberMet,
  flueLitLevel,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE FLUE played right**, for the autopilot: the navigator's thumb sent
 * on the lead the pilot would call — a bolt fired, or the level's colour held
 * down to fill the beam, the tick a shot pressed then would meet the ember
 * over the cannon (`sim/flue-lead.ts`). The pilot sends nothing: the cannon
 * is held under the middle, and what the pilot does is say *now*.
 *
 * **Near the middle, not on it**: within half the reach a shot meets the
 * ember at, so a tick's difference in where the commands land never turns a
 * hit into a miss. A beam's thumb is lifted once the lobe has gone off, so
 * the next one is a fresh press.
 */
type Press = Omit<TimedCommand, "tick">;

export const flueHand = (w: World): Press[] => {
  const s = flueBoss(w);
  if (s === null) return [];
  if (w.prime?.spent)
    return [{ player: 2, command: { kind: "prime", on: false, color: w.prime.color } }];
  const level = flueLitLevel(s);
  if (level === null || w.prime !== null || w.bullets.length > 0) return [];
  if (w.tick - w.lastFireTick < w.cfg.fireEveryBeats * ticksPerBeat(w.cfg)) return [];
  const at = flueEmberMet(w, s, level.weapon);
  if (at === null || Math.abs(at) > w.cfg.flueHitMilli / 2) return [];
  return level.weapon === "bolt"
    ? [{ player: 2, command: { kind: "fire", color: level.color } }]
    : [{ player: 2, command: { kind: "prime", on: true, color: level.color } }];
};
