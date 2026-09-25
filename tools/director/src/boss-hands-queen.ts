import {
  type Color,
  queenGesture,
  queenMarkCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on THE BULB QUEEN**, and her own page for the reason
 * every other boss on `boss-hands-shots.ts` is not on one: that page went
 * over its 250 on 19 September 2026, when one boss's last step turned out
 * to be two gestures rather than a shot. The seam is the one the silent
 * effects pages use — the page hands its *last* boss across rather than the
 * lane cutting its own rows out of the middle — and here the last boss is
 * hers. She had a page of her own on the poses side already
 * (`poses-bosses-queen.ts`), which is the only importer this ever had, so
 * the two now sit side by side under the same name.
 *
 * The three one-liners below are declared again rather than imported, which
 * is what all seven hand pages do (`boss-hands-beats.ts` and the rest): a
 * press is three fields and a shared kit for it would be a file to open on
 * the way to reading any one hand.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

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
