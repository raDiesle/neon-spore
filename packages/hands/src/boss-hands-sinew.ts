import {
  sinewBoss,
  sinewBowFromMilli,
  sinewCaught,
  sinewInZone,
  sinewSwinging,
  sinewZone,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on THE SINEW**: the hold in the zone, the snap and the
 * catch, each a drag on one of its two handles re-sent every tick with where
 * the finger is (`boss-hands-handles.ts` says why a handle is played that
 * way). Their own file since 15 October 2026, when the handles learned to
 * follow their bow and took the file they shared past 225 lines.
 */

type Press = Omit<TimedCommand, "tick">;

/**
 * A hand on one of THE SINEW's handles: how far down, and how far across —
 * on the handle's bow where it is not carried across (`sim/sinew-bow.ts`).
 */
function tendon(w: World, player: 1 | 2, on: boolean, down = 0, across?: number): Press {
  const at = sinewBowFromMilli(w.cfg, player, down);
  return {
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "sinewLeft" : "sinewRight",
      on,
      fromMilli: across ?? at.fromMilli,
      fromYMilli: down,
    },
  };
}

/**
 * THE SINEW: both hands pull so their sum sits in the middle of the zone,
 * each carrying half of it and half of the slack the tendon has gone by
 * (`sinewSum`, `sinew.test.ts`'s `inZone`), and hold there for the beats
 * the fibre takes to part. From the fourth fibre the slack creeps under a
 * hand, and a sum it has pushed past the hands' reach is answered the way
 * the design asks — both hands off, which resets it, and on again. Falling,
 * both hands sway the one way, far enough to walk the mass a column a beat
 * clear of the ship (`sinewSwayMilli`, `sinewClearCols`).
 */
export const sinewHand: Hand = (w) => {
  const s = sinewBoss(w);
  if (s === null || s.outBeat >= 0 || sinewSwinging(s, w)) return [];
  const reach = w.cfg.sinewReachMilli;
  if (s.fallBeat >= 0) {
    return [tendon(w, 1, true, reach / 2, reach), tendon(w, 2, true, reach / 2, reach)];
  }
  const zone = sinewZone(s, w.cfg);
  // Each hand brings half the sum at its power — the called one once a call
  // is out, since the sum is next read on the shift's beat
  // (`sim/sinew-shift.ts`) — and a hand that cannot reach its half leaves
  // the rest to the other.
  const half = Math.floor((zone.low + zone.high) / 4) + Math.floor(s.slackMilli / 2);
  const g1 = s.callP1Permille > 0 ? s.callP1Permille : s.powerP1Permille;
  const g2 = s.callP2Permille > 0 ? s.callP2Permille : s.powerP2Permille;
  const p1 = Math.min(reach, Math.ceil((half * 1000) / g1));
  const p2 = Math.ceil(((half * 2 - Math.floor((p1 * g1) / 1000)) * 1000) / g2);
  if (p2 > reach) return [tendon(w, 1, false), tendon(w, 2, false)];
  return [tendon(w, 1, true, p1), tendon(w, 2, true, p2)];
};

/** THE SINEW's hands pulled past the zone's top, for the snap-back. */
export const sinewSnapHand: Hand = (w) => {
  const s = sinewBoss(w);
  if (s === null || sinewSwinging(s, w) || !sinewInZone(s, w.cfg)) return sinewHand(w);
  const reach = w.cfg.sinewReachMilli;
  return [tendon(w, 1, true, reach), tendon(w, 2, true, reach)];
};

/**
 * THE SINEW's hands catching a whipping tendon: a snap first, then both
 * hands taken back onto the swinging handles and carried **apart** — the
 * pilot's left, the navigator's right — which ends the swing on that beat
 * (`sinewCatching`, `sim/sinew-hand.ts`). It keeps holding them apart for
 * the beats the catch lasts, because the pull that would otherwise be sent
 * is the one that would snap the tendon again and take the state away.
 */
export const sinewCatchHand: Hand = (w) => {
  const s = sinewBoss(w);
  if (s === null || s.outBeat >= 0 || s.fallBeat >= 0) return [];
  const reach = w.cfg.sinewReachMilli;
  if (sinewSwinging(s, w) || sinewCaught(s, w.cfg, w.beat)) {
    return [tendon(w, 1, true, 0, -reach), tendon(w, 2, true, 0, reach)];
  }
  return sinewSnapHand(w);
};
