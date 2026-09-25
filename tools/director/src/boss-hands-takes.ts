import {
  antiphonBoss,
  antiphonCrossed,
  antiphonGrown,
  antiphonIsOrgan,
  type Color,
  cairnState,
  spliceRound,
  spliceWantedAfterFlights,
  type TimedCommand,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the bosses a taking answers** — THE CAIRN, THE
 * SPLICE, THE UNDERTOW, THE ANTIPHON — each a `Hand` (`poses-bosses-kit.ts`).
 * A rock pulled out of the pile, a number sucked down its straw, a lobe
 * held in the maw, an organ pitted by its own colour: each is one thing
 * taken off the boss, and the hand takes it the way the pair does, one
 * press a tick, reading the field for which thing is up now.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const intake = (): Press => ({ player: 1, command: { kind: "intake" } });

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/**
 * THE CAIRN: the pilot's hand on the pile, carried a tile to the right — a
 * device reports where the finger *is*, so the grip and the carry go every
 * tick (`cairn.test.ts`'s `carry`) — and the right-hand pair of columns
 * comes away as a rock (`pullFromCairn`). The shed is the pile's own clock
 * and wants no hand at all.
 */
export const cairnHand: Hand = (w) => {
  const b = cairnState(w);
  if (b === null || b.units <= 0) return [];
  const body = w.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return [];
  return [
    { player: 1, command: { kind: "grip", id: body.id } },
    {
      player: 1,
      command: {
        kind: "drag",
        target: "gripBody",
        on: true,
        fromMilli: w.cfg.gripPushMilli,
        id: body.id,
      },
    },
  ];
};

/**
 * THE CAIRN's other hand, and the one that does the least: a thumb put on the
 * pile and **not** carried. The grip goes every tick, the way a device reports
 * a finger that is still there, and no drag goes at all — that absence is the
 * gesture (`sim/cairn-hold.ts`). One beat of it and the pile's clock stops and
 * says so.
 */
export const cairnHoldHand: Hand = (w) => {
  const b = cairnState(w);
  if (b === null || b.units <= 0) return [];
  const body = w.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return [];
  return [{ player: 1, command: { kind: "grip", id: body.id } }];
};

/**
 * THE SPLICE: the cannon under the entrance whose straw carries the number
 * wanted next and the maw opened there, counting the numbers already on their
 * way down as fed (`spliceWantedAfterFlights`) — so it slides on and sucks the
 * next while one is still falling — until the round is passed (`spliceHeard`). The pair
 * reads the straw off the tangle; the hand reads the permutation, because
 * what it poses is the verdict and the pass, not the tracing.
 */
export const spliceHand: Hand = (w) => {
  const s = spliceRound(w);
  if (s === null || s.passBeat !== -1) return [];
  const col = s.entranceCols[spliceWantedAfterFlights(s)];
  if (col === undefined) return [];
  if (w.cannonCol !== col) return [aim(col)];
  return [intake()];
};

/**
 * THE UNDERTOW: the last lobe is not taken but *held* — the maw open under
 * it for `undertowHoldBeats`, counted on the beat (`undertow-step.ts`'s
 * `last`). The maw stays open only while the press keeps coming
 * (`intakeWindowTicks`), so the hand presses every tick it stands under
 * the lobe. The earlier lobes are the clock's and go by untaken here: the
 * phases advance by beat count, and the state posed is the taking.
 */
export const undertowHand: Hand = (w) => {
  const u = undertowBoss(w);
  if (u === null || u.phase !== "last") return [];
  const b = u.breaches.find((x) => x.stage === "standing");
  if (b === undefined) return [];
  if (w.cannonCol !== b.col) return [aim(b.col)];
  return [intake()];
};

/**
 * THE ANTIPHON: the organ's own colour up the organ's own column once it
 * has pushed all the way out (`antiphonGrown`, `antiphonStruck`) pits it;
 * the ship, last of the organs, the same. The pair finds the organ on the
 * navigator's rail; the hand reads it off the surface, because the state
 * posed is the stillness after the sixth pit and the ship going down.
 */
export const antiphonHand: Hand = (w) => {
  const s = antiphonBoss(w);
  if (s === null || s.downBeat >= 0) return [];
  const o = s.organs.find((x) => antiphonGrown(x, w.cfg, w.beat));
  if (o === undefined) return [];
  if (w.cannonCol !== o.col) return [aim(o.col)];
  return free(w) ? [fire(o.color)] : [];
};

/**
 * THE ANTIPHON's other hand, the navigator's: she carries a candidate down
 * off her rail and it stops counting (`sim/antiphon-hand.ts`). Nothing may be
 * pulled before the organ stands, so the hand waits the growth out, and it
 * takes the first candidate that is neither an organ nor already crossed —
 * a decoy, because pulling the organ off is the same mistake as firing at
 * one, and the pose wants the crossing rather than the punishment.
 */
export const antiphonPullHand: Hand = (w) => {
  const s = antiphonBoss(w);
  if (s === null || s.downBeat >= 0) return [];
  const o = s.organs[0];
  if (o === undefined || !antiphonGrown(o, w.cfg, w.beat)) return [];
  const id = s.rail.findIndex((c, i) => !antiphonIsOrgan(s, c) && !antiphonCrossed(s, i));
  if (id < 0) return [];
  return [
    {
      player: 2,
      command: {
        kind: "drag",
        target: "antiphonRail",
        on: true,
        fromMilli: 0,
        fromYMilli: w.cfg.antiphonPullMilli,
        id,
      },
    },
  ];
};
