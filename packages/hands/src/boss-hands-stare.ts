import { stareBoss, stareLidFree } from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * The free seat's thumb on THE STARE's lid: pulled to the bottom the tick
 * the eye looks at the other seat, and lifted the tick after it is shut.
 * The hand is read every tick, so it grabs whichever seat is free that
 * look (`sim/stare-hand.ts`).
 */
export const lidHand =
  (lift: boolean): Hand =>
  (w) => {
    const s = stareBoss(w);
    if (s === null) return [];
    if (s.phase === "shut")
      return lift
        ? [
            {
              player: s.lidSeat as 1 | 2,
              command: { kind: "drag", target: "stareLid", on: false, fromMilli: 0 },
            },
          ]
        : [];
    const player = stareLidFree(s, 1) ? 1 : stareLidFree(s, 2) ? 2 : null;
    if (player === null) return [];
    const fromYMilli = w.cfg.stareLidPullMilli;
    return [
      { player, command: { kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli } },
    ];
  };
