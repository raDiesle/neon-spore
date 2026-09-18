import {
  type Color,
  candleBoss,
  candleEating,
  orreryCoreCol,
  queenGesture,
  queenMarkCol,
  type TimedCommand,
  vaneColor,
  vaneOpen,
  vaneOpeningNow,
  vanePhase,
  vanePinned,
  vaneSplitCol,
  type World,
  wardenColor,
  wardenCycle,
  wardenEyeOpen,
  wardenPhase,
  wardenTether,
  wardenThrown,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the bosses a shot answers** — THE WARDEN, THE VANE,
 * THE ORRERY, THE CANDLE — each a `Hand` (`poses-bosses-kit.ts`): what to
 * press this tick, read off the field as it stands, the way a pair plays it.
 *
 * Each hand is the fight's own rule played straight, and nothing cleverer:
 * the cannon under the thing to hit, the colour the boss is showing, the
 * shot when the opening is there. A hand that knew more than the pair could
 * — the beat a gap will open on, the column a drift will land in — would
 * pose a state the game never puts a pair in. They wait the way a pair
 * waits, and they spray where a pair sprays: a shot off the beat costs
 * nothing on any of these four (`warden.test.ts`, `vane.test.ts`,
 * `orrery.test.ts`, `candle.test.ts`), so the hand fires whenever the
 * cannon is free and lets the boss judge the beat.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const drag = (milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0, fromYMilli: milli },
});
/** The navigator's thumb landing on the eye. */
const thumb: Press = {
  player: 2,
  command: { kind: "drag", target: "wardenEye", on: true, fromMilli: 0, fromYMilli: 0 },
};
/** The pilot's swipe across the hatch: the lift, with how far the thumb went. */
const swipe = (milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "wardenHatch", on: false, fromMilli: milli, fromYMilli: 0 },
});

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/**
 * THE WARDEN: the pilot grabs the rope the moment it hangs and hauls it
 * taut (two presses, the grab and the pull — `wardenTetherHeard`), and the
 * navigator puts the rim's colour up the pupil's column while the eye is
 * open. The rope snaps back with the plate, and the next cycle lowers
 * another. From NARROW the navigator's thumb goes on the eye as well, and
 * under GLARE there is no rope: the pilot swipes the hatch open and the
 * shot goes in the window (`warden-hand.ts`).
 */
export const wardenHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "warden") return [];
  const asks = wardenPhase(b.plates).asks;
  const out: Press[] = [];
  if (asks === "throw") {
    if (!wardenThrown(w, b)) return [swipe(w.cfg.wardenThrowMilli)];
  } else {
    if (wardenTether(w) === null) return [];
    if (asks === "hold" && !b.eyeHeld) out.push(thumb);
    if (!wardenEyeOpen(w, b)) return [...out, drag(b.pulling ? w.cfg.wardenTautMilli : 0)];
  }
  out.push(aim(b.pupilCol));
  if (free(w) && w.cannonCol === b.pupilCol)
    out.push(fire(wardenColor(wardenCycle(w.cfg, w.waveBeat))));
  return out;
};

/** The pilot's thumb landing on the arm: it stops where it stands. */
const pinArm: Press = {
  player: 1,
  command: { kind: "drag", target: "vaneArm", on: true, fromMilli: 0 },
};
/** The navigator's carry off the seized housing: the lift, and how far it went. */
const haul = (milli: number): Press => ({
  player: 2,
  command: { kind: "drag", target: "vaneHousing", on: false, fromMilli: 0, fromYMilli: milli },
});

/**
 * THE VANE: the bearing opens in one column and one colour, and the shot goes
 * up that column in that colour while it is open (`vaneOpen`, `vaneSplitCol`,
 * `vaneColor`). Under SWING the cycle opens it at each end of the sweep; from
 * VEER the pilot's thumb on the arm does, and under SEIZE the navigator hauls
 * the seized housing off the pinned arm as well (`sim/vane-hand.ts`).
 */
export const vaneHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "vane") return [];
  const asks = vanePhase(b.pins).asks;
  const out: Press[] = [];
  if (asks !== "shoot") {
    if (!vanePinned(w, b)) return [pinArm];
    if (asks === "haul" && !b.hauled) out.push(haul(w.cfg.vaneHaulMilli));
  }
  if (!vaneOpen(w) && out.length === 0) return [];
  const col = vaneSplitCol(w, b);
  if (col === -1) return out;
  out.push(aim(col));
  if (vaneOpen(w) && free(w) && w.cannonCol === col)
    out.push(fire(vaneColor(vaneOpeningNow(w.waveBeat))));
  return out;
};

/**
 * THE ORRERY: the core's own colour up the core's own column, as often as
 * the cannon allows — only a shot leaving on a beat every standing ring is
 * open on takes a ring, and one off the beat costs nothing. Naked, the
 * core takes nothing but the lance: the navigator holds the colour down and
 * the cannon still until the lobe is full (`orreryStruck`).
 */
export const orreryHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "orrery" || b.phase === "out") return [];
  const col = orreryCoreCol(w.cfg);
  if (w.cannonCol !== col) return [aim(col)];
  if (b.phase === "naked") {
    return w.prime === null
      ? [{ player: 2, command: { kind: "prime", on: true, color: b.color } }]
      : [];
  }
  return free(w) ? [fire(b.color)] : [];
};

/**
 * THE CANDLE: either colour up the glow's column dims it a step, so the
 * cannon follows the drift and fires whenever it is under the glow — except
 * from the column the glow faces while it is eating, where the flash would
 * be swallowed and put a step back (`candleEats`). Then the hand waits for
 * the next turn, which is what the pilot is for.
 */
export const candleHand: Hand = (w) => {
  const c = candleBoss(w);
  if (c === null || c.phase === "dark" || c.phase === "out") return [];
  if (w.cannonCol !== c.col) return [aim(c.col)];
  if (candleEating(c) && c.faceCol === c.col) return [];
  return free(w) ? [fire("red")] : [];
};

/**
 * THE BULB QUEEN: the cannon under the real mark and her open colour up it,
 * every phase — and, from BROOD, player 1's thumb on that mark as well
 * (`sim/queen-hand.ts`): pressed while a window is up and nothing is pried,
 * which is what opens it; held from the announcement under SCREAM, which is
 * what keeps it open. The hand knows the side, which the pair only knows
 * once player 2 has said it; it is played straight otherwise, and a shot
 * that lands is what closes the bloom.
 */
export const queenHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "queen") return [];
  const q = w.creatures.find((c) => c.id === b.creatureId);
  if (q === undefined) return [];
  const col = queenMarkCol(q.col, b.weakSide);
  const out: Press[] = [aim(col)];
  const gesture = queenGesture(b);
  const asked = b.openBeat !== -1 && q.color === null && b.pryBeat === -1;
  if (gesture === "pry" && asked) out.push(mark(b.weakSide));
  if (gesture === "hold" && b.openBeat !== -1 && b.holdSide !== b.weakSide) {
    out.push(mark(b.weakSide));
  }
  if (q.color !== null && free(w) && w.cannonCol === col) out.push(fire(q.color));
  return out;
};

/** Player 1's thumb landing on one of her marks, `id` 0 the left and 1 the right. */
const mark = (side: -1 | 1): Press => ({
  player: 1,
  command: {
    kind: "drag",
    target: "queenMark",
    on: true,
    fromMilli: 0,
    fromYMilli: 0,
    id: side === -1 ? 0 : 1,
  },
});
