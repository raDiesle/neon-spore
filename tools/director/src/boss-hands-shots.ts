import {
  BEARING_TURN,
  type Color,
  candleBoss,
  candleEating,
  candleSmoking,
  candleWicked,
  NO_BEARING,
  type OrreryState,
  orreryCoreCol,
  orreryTurnPerTickMilli,
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
 *
 * **THE BULB QUEEN was here too and is not any more.** This page went over
 * its 250 on 19 September 2026, when THE CANDLE's last step turned out to be
 * two gestures rather than a shot, and the seam the silent effects pages use
 * settled it: the page hands its *last* boss across rather than the lane
 * cutting its own rows out of the middle. Hers is `boss-hands-queen.ts`,
 * beside the poses page she already had.
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
 * **The pilot's thumb on a cracked ring**, one sample a tick.
 *
 * The fourth rig with no finger on it, after the desk keyboard, `bun run
 * frames`'s press line and a rehearsal's ghost thumb — and it turns at the
 * rate all three of those ask for rather than one of its own:
 * `orreryTurnPerTickMilli`, one organ a beat, the ring's own drift
 * (`sim/orrery-hand.ts`; `packages/sim/test/copies-table.ts` carries the
 * row). A gallery pose that wound faster than a hand can would stand a boss
 * in a state at a tempo the game never reaches.
 *
 * The first sample is the grab: a hand going on has no reference yet, so it
 * buys nothing and the one after it is the first organ's worth
 * (`orreryRingHeard`). Between rings the bearing is simply left where it
 * was, because that is where a thumb that never lifted actually is.
 */
function windRing(w: World, b: OrreryState): Omit<TimedCommand, "tick"> {
  const at =
    b.handAtMilli === NO_BEARING
      ? 0
      : (b.handAtMilli + orreryTurnPerTickMilli(w.cfg)) % BEARING_TURN;
  return { player: 1, command: { kind: "drag", target: "orreryRing", on: true, fromMilli: at } };
}

/**
 * THE ORRERY: the core's own colour up the core's own column, as often as
 * the cannon allows — only a shot leaving on a beat every standing ring is
 * open on takes a ring, and one off the beat costs nothing. Naked, the
 * core takes nothing but the lance: the navigator holds the colour down and
 * the cannon still until the lobe is full (`orreryStruck`).
 *
 * **And a cracked ring before any of it**, which is the one place this hand
 * touches a ring at all. While the rings are turning a thumb is offered and
 * never asked for — bringing an alignment forward is a judgement about where
 * three gaps are, and a rig that made it would pose a state a pair never
 * reaches by playing. Once a ring is `seized` there is no judgement left in
 * it: the shaft is shut, a shot is spent on armour, and winding the gap home
 * is the only thing on the field that counts (`sim/orrery-shot.ts`). So the
 * hand winds, and the detent that lands the gap at the bottom is what takes
 * the ring off and lets the rest of this function run again.
 */
export const orreryHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "orrery" || b.phase === "out") return [];
  if (b.phase === "seized") return [windRing(w, b)];
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
 *
 * **And the last step is not a shot at all**, which is the one place this
 * hand stops spraying. At the last glow the trigger counts for nothing
 * (`candleStruck`) and the only thing on the field that does anything is the
 * pilot's thumb on the flame, pulled to the bottom of the wick
 * (`sim/candle-hand.ts`) — so the hand pulls, and the column stops mattering
 * because no shot is going anywhere. Off the wick the bolt is still nothing
 * and only the beam reaches what is left, so the cannon goes back under the
 * smoke and the navigator holds a colour down: the fill lands the beam in
 * that column inside `candleSmokeBeats`, and late is a relight a step
 * brighter and the pull to make again. `lancePrimeBeats` is three of that
 * six, which is the pair's whole margin and the hand takes it the moment the
 * wick starts smoking.
 */
export const candleHand: Hand = (w) => {
  const c = candleBoss(w);
  if (c === null || c.phase === "dark" || c.phase === "out") return [];
  if (candleWicked(c)) return [pull(w.cfg.candlePinchMilli)];
  if (w.cannonCol !== c.col) return [aim(c.col)];
  if (candleSmoking(c)) return w.prime === null && w.beam === null ? [prime("red")] : [];
  if (candleEating(c) && c.faceCol === c.col) return [];
  return free(w) ? [fire("red")] : [];
};

/** The pilot's thumb on the flame, `milli` deep down the wick (`sim/candle-hand.ts`). */
const pull = (milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "candleWick", on: true, fromMilli: 0, fromYMilli: milli },
});

/** The navigator's colour held down, which is how the beam is started. */
const prime = (color: Color): Press => ({ player: 2, command: { kind: "prime", on: true, color } });
