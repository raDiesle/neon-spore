import { stareBoss, type TimedCommand, type World } from "@neon-spore/sim";

type Press = Omit<TimedCommand, "tick">;

/**
 * **THE STARE played right**, for the STATES sheet and the autopilot: hands
 * off the ship on every beat — the eye cannot be hurt, so there is nothing to
 * shoot (`sim/stare.ts`) — and the lashes pulled while the eye charges.
 */
export const stareHand = (w: World): Press[] => lashHand(w);

/**
 * Both thumbs on the lashes while the eye charges, each going up a whole pull
 * on one tick and back down on the next — a lash a seat every two ticks,
 * which is far quicker than a thumb and is the point: the sheet is after the
 * states, not the race.
 */
export const lashHand = (w: World): Press[] => {
  const s = stareBoss(w);
  if (s === null || s.phase !== "charge") return [];
  const out: Press[] = [];
  for (const player of [1, 2] as const) {
    const seat = player - 1;
    // At the bottom of its stroke with a hand on: up. Anywhere else: down.
    const up = s.lashHeld[seat] && s.lashBaseMilli[seat] === 0;
    const fromYMilli = up ? -w.cfg.stareLashPullMilli : 0;
    out.push({
      player,
      command: { kind: "drag", target: "stareLash", on: true, fromMilli: 0, fromYMilli },
    });
  }
  return out;
};
