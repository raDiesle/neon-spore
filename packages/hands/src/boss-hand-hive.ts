import {
  hiveBoss,
  hiveClenched,
  hiveNext,
  hiveOpen,
  hivePinched,
  hiveSealedBy,
  hiveSwellingAt,
  NO_PINCH,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on THE HIVE**, a `Hand` (`hand.ts`) — cut
 * out of `boss-hands-field.ts` for THE FLEET's reason (`boss-hand-fleet.ts`):
 * the mass's own two states gave the fight two gestures more than that file
 * had room for.
 *
 * The shot half is the fight played straight. An open breach's colour up its
 * column seals it (`hiveStruck`), and the spill down that column is the same
 * colour, living (`livingKindForColor`), so it costs the hand nothing to fire
 * at whether the body is still falling or already gone: the first shot kills
 * it as it would any coloured creature, the next reaches the top and seals.
 * A wrung breach takes either colour (`hiveSealedBy`), so the hand fires
 * whatever that column's site already answers to. Sealed scars are left
 * alone: a bolt into one is skin.
 *
 * **The pilot's haul comes before any of it**, because a clenched underside
 * is out of the cannon's reach as well as out of his thumb's: there is
 * nothing else to do with the beats.
 *
 * **The navigator's hold is a second hand and not part of the first**
 * (`hiveWringHand`), which is the one thing here that is not the fight
 * played straight. Wringing every lobe is *slower*, because the wring
 * provokes and a provoked column drops a body on the beat the bolt was going
 * to cross it — so the hand that wrings seals nothing and the fight never
 * ends. A pair would wring the lobe they cannot name a colour for, which is
 * a judgement no hand has; the sheet only needs the gesture shown once.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: "red" | "cyan"): Press => ({ player: 2, command: { kind: "fire", color } });

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/** The pilot's thumb dragging a clenched underside back down, in one carry. */
const haul = (milli: number): Press => ({
  player: 1,
  command: { kind: "drag", target: "hiveLobe", on: true, fromMilli: 0, fromYMilli: milli },
});

/** The navigator's thumb on swelling lobe `id`, or lifted off. */
const hold = (on: boolean, id: number): Press => ({
  player: 2,
  command: { kind: "drag", target: "hiveLobe", on, fromMilli: 0, fromYMilli: 0, id },
});

export const hiveHand: Hand = (w) => {
  const s = hiveBoss(w);
  if (s === null || s.downBeat >= 0) return [];
  // Out of reach: the one thing to do is pull it back into reach, and the
  // whole carry goes down in one press — a thumb that wobbles is the
  // simulation's problem, not a pose's (`hive-hand.ts`).
  if (hiveClenched(s)) return [haul(w.cfg.hiveHaulMilli)];
  for (let i = 0; i < s.opened; i++) {
    if (!hiveOpen(s, i)) continue;
    const col = s.cols[i] ?? 0;
    if (w.cannonCol !== col) return [aim(col)];
    const color = hiveSealedBy(s, i, "red") ? "red" : "cyan";
    return free(w) ? [fire(color)] : [];
  }
  return [];
};

/**
 * The same hand with the navigator's thumb on the lobe about to open: it
 * lands the tick the swell starts and is let go of at the opening, which is
 * where the simulation counts what it was worth. One card's hand
 * (`poses-bosses-hands-field.ts`), for the reason above.
 */
export const hiveWringHand: Hand = (w) => {
  const s = hiveBoss(w);
  if (s === null) return hiveHand(w);
  const next = hiveNext(s);
  const out: Press[] = [];
  if (next >= 0 && hiveSwellingAt(s, w.cfg, w.beat, next) && hivePinched(s) !== next) {
    out.push(hold(true, next));
  } else if (hivePinched(s) !== NO_PINCH && !hiveSwellingAt(s, w.cfg, w.beat, hivePinched(s))) {
    out.push(hold(false, hivePinched(s)));
  }
  return [...out, ...hiveHand(w)];
};
