import {
  BEARING_TURN,
  type GimbalRing,
  type GimbalState,
  gimbalBoss,
  gimbalLeaking,
  gimbalMarkMilli,
  gimbalTurning,
  INNER,
  NO_BEARING,
  OUTER,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GIMBAL played right**, for the STATES sheet: both rings carried onto
 * their own marks and held there, and the seam shot out when it leaks.
 *
 * The interesting part is that the hand cannot aim at a *bearing* — it aims
 * at a rim, and the rim it is turning may be the mirrored one. So it works
 * the way a player does: it asks where the mark is on the true wheel, takes
 * the difference from where the ring is standing, and offers its own thumb
 * that much further round **its own face** — negated on the inner ring,
 * because that is what her face does to a turn (`sim/gimbal.ts`
 * `gimbalShownMilli`). Everything is mod one turn, so the short way round and
 * the long way round land on the same bearing and the hand never has to
 * choose.
 *
 * The bolt is here rather than in a pose of its own because the seam is not a
 * state: it opens under the last shear and it is gone a few beats later
 * either way, so a card for it would be a card for a moment.
 */
type Press = Omit<TimedCommand, "tick">;

export const gimbalHand = (w: World): Press[] => {
  const s = gimbalBoss(w);
  if (s === null) return [];
  const out: Press[] = [];
  if (gimbalTurning(s)) {
    out.push(rim(s, w.beat, OUTER, 1), rim(s, w.beat, INNER, 2));
  }
  // The one thing in this fight the cannon does, and either colour does it.
  if (gimbalLeaking(s)) {
    out.push({ player: 1, command: { kind: "cannonCol", col: s.seamCol } });
    out.push({ player: 2, command: { kind: "fire", color: "cyan" } });
  }
  return out;
};

/** One thumb on one rim: down where it is not, else carried onto its mark. */
function rim(s: GimbalState, beat: number, ring: GimbalRing, player: 1 | 2): Press {
  const target = ring === OUTER ? "gimbalOuter" : "gimbalInner";
  const drag = (fromMilli: number): Press => ({
    player,
    command: { kind: "drag", target, on: true, fromMilli, fromYMilli: 0 },
  });
  const was = s.handMilli[ring] ?? NO_BEARING;
  if (was === NO_BEARING) return drag(0);
  const mark = gimbalMarkMilli(s, beat, ring);
  if (mark === NO_BEARING) return drag(was);
  const apart = (mark - (s.atMilli[ring] ?? 0) + BEARING_TURN) % BEARING_TURN;
  const shown = ring === OUTER ? apart : -apart;
  return drag((((was + shown) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN);
}
