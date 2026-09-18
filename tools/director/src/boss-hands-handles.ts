import {
  BEARING_TURN,
  type InstarMark,
  instarActing,
  instarBoss,
  instarMarkDone,
  instarSeatHears,
  instarStep,
  sinewBoss,
  sinewInZone,
  sinewSwinging,
  sinewZone,
  surgeBand,
  surgeBoss,
  surgeEverting,
  surgeHeld,
  surgeInBand,
  surgeSealing,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the bosses a handle answers** — THE SINEW, THE
 * SURGE, THE INSTAR — each a `Hand` (`poses-bosses-kit.ts`). None of these
 * is shot at: the pair holds a thing on the screen, and what the boss judges
 * is how far, how long and whether both hands did it together. So each hand
 * here is a drag on the boss's own `DragTarget`, re-sent every tick with
 * where the finger is, the way a device reports it, and read against the
 * boss's own predicates for when to let go.
 */

type Press = Omit<TimedCommand, "tick">;

/** A hand on one of THE SINEW's handles: how far down, and how far across. */
function tendon(player: 1 | 2, on: boolean, down = 0, across = 0): Press {
  return {
    player,
    command: {
      kind: "drag",
      target: player === 1 ? "sinewLeft" : "sinewRight",
      on,
      fromMilli: across,
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
    return [tendon(1, true, reach / 2, reach), tendon(2, true, reach / 2, reach)];
  }
  const zone = sinewZone(s, w.cfg);
  const each = Math.floor((zone.low + zone.high) / 4) + Math.floor(s.slackMilli / 2);
  if (each > reach) return [tendon(1, false), tendon(2, false)];
  return [tendon(1, true, each), tendon(2, true, each)];
};

/** THE SINEW's hands pulled past the zone's top, for the snap-back. */
export const sinewSnapHand: Hand = (w) => {
  const s = sinewBoss(w);
  if (s === null || sinewSwinging(s, w) || !sinewInZone(s, w.cfg)) return sinewHand(w);
  const reach = w.cfg.sinewReachMilli;
  return [tendon(1, true, reach), tendon(2, true, reach)];
};

/** A thumb on or off THE SURGE's bulb. */
function bulb(player: 1 | 2, on: boolean): Press {
  return { player, command: { kind: "drag", target: "surgeBulb", on, fromMilli: 0 } };
}

/**
 * THE SURGE: both thumbs on the bulb while the pressure climbs
 * (`surgeChargePerHand` a hand a beat), and both lifted on the one tick
 * once it is inside the notch's band — the second lift is the one judged,
 * and two lifts within a beat of each other are mutual (`surgeLift`,
 * `surgeJudge`). Past the band, the only way down is the burst, so both
 * thumbs stay on for it. With `vent` false the hands never lift: the bulb
 * bursts, which is the sealing.
 */
export function surgeHandWith(vent: boolean): Hand {
  return (w) => {
    const s = surgeBoss(w);
    if (s === null || surgeEverting(s) || surgeSealing(s, w)) return [];
    const on = [bulb(1, true), bulb(2, true)];
    if (!vent || !surgeHeld(s, 1) || !surgeHeld(s, 2)) return on;
    if (surgeInBand(s, w.cfg)) return [bulb(1, false), bulb(2, false)];
    return s.pressureMilli > surgeBand(s, w.cfg).high ? on : [];
  };
}

export const surgeHand: Hand = surgeHandWith(true);

/**
 * THE INSTAR: every mark of the step that is up, answered in its own
 * gesture by the seat it belongs to, all in the same ticks — a pull carried
 * to its depth and kept there, a tap that lifts between presses, a swipe
 * carried past `instarSwipeMilli` and lifted, a turn wound a quarter a tick,
 * a hold both thumbs stay on (`instar-hand.ts`). A mark answered alone slips
 * when its partner is late (`instarTogetherBeats`), which is why the hand
 * answers them all at once.
 */
export const instarHand: Hand = (w) => {
  const s = instarBoss(w);
  if (s === null || !instarActing(s)) return [];
  const marks = instarStep(s)?.marks ?? [];
  const out: Press[] = [];
  marks.forEach((mark, i) => {
    if (instarMarkDone(s, i) && mark.gesture !== "hold") return;
    for (const player of [1, 2] as const) {
      if (instarSeatHears(mark.seat, player)) out.push(gesture(w, player, i, mark));
    }
  });
  return out;
};

/** One tick of one mark's gesture, for one thumb (`INSTAR_GESTURES`). */
function gesture(w: World, player: 1 | 2, id: number, mark: InstarMark): Press {
  const even = w.tick % 2 === 0;
  const drag = (on: boolean, fromMilli = 0, fromYMilli = 0): Press => ({
    player,
    command: { kind: "drag", target: "instarMark", on, fromMilli, fromYMilli, id },
  });
  switch (mark.gesture) {
    case "pullDown":
      return drag(true, 0, mark.need);
    case "pullUp":
      return drag(true, 0, -mark.need);
    case "tap":
      return drag(even);
    case "swipeDown":
      return drag(even, 0, w.cfg.instarSwipeMilli);
    case "turn":
      return drag(true, ((w.tick * BEARING_TURN) / 4) % BEARING_TURN);
    case "hold":
      return drag(true);
  }
}
