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
  vaneOpening,
  vaneWeakCol,
  type World,
  wardenColor,
  wardenCycle,
  wardenEyeOpen,
  wardenTether,
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

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/**
 * THE WARDEN: the pilot grabs the rope the moment it hangs and hauls it
 * taut (two presses, the grab and the pull — `wardenTetherHeard`), and the
 * navigator puts the rim's colour up the pupil's column while the eye is
 * open. The rope snaps back with the plate, and the next cycle lowers
 * another.
 */
export const wardenHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "warden" || wardenTether(w) === null) return [];
  if (!wardenEyeOpen(w, b)) return [drag(b.pulling ? w.cfg.wardenTautMilli : 0)];
  const out: Press[] = [aim(b.pupilCol)];
  if (free(w) && w.cannonCol === b.pupilCol)
    out.push(fire(wardenColor(wardenCycle(w.cfg, w.waveBeat))));
  return out;
};

/**
 * THE VANE: the bearing splits at each end of the sweep, in one column and
 * one colour, and the shot goes up that column in that colour while the
 * split is there (`vaneOpen`, `vaneWeakCol`, `vaneColor`).
 */
export const vaneHand: Hand = (w) => {
  if (!vaneOpen(w)) return [];
  const col = vaneWeakCol(w.cfg, w.waveBeat);
  const out: Press[] = [aim(col)];
  if (free(w) && w.cannonCol === col) out.push(fire(vaneColor(vaneOpening(w.waveBeat))));
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
