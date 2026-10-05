import {
  type AntiphonState,
  antiphonBoss,
  antiphonChooser,
  antiphonIsOrgan,
  antiphonStanding,
  antiphonVeinMilli,
  cairnState,
  spliceRound,
  spliceWantedAfterFlights,
  type TimedCommand,
  undertowBoss,
  undertowEbbing,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on the bosses a taking answers** — THE CAIRN, THE
 * SPLICE, THE UNDERTOW, THE ANTIPHON — each a `Hand` (`hand.ts`).
 * A rock pulled out of the pile, a number sucked down its straw, a lobe
 * taken by its colour, an organ pitted by its own colour: each is one thing
 * taken off the boss, and the hand takes it the way the pair does, one
 * press a tick, reading the field for which thing is up now.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const intake = (): Press => ({ player: 1, command: { kind: "intake" } });

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
 * THE UNDERTOW: every lobe that stands is answered by its colour — the
 * cannon under a yellow one and the maw opened, the shield carried under a
 * cyan one and raised — and a tall one is tapped back down first, because it
 * is the one about to burst (`undertow-press.ts`). The maw stays open only
 * while the press keeps coming (`intakeWindowTicks`), so the hand presses
 * every tick it stands under the lobe. The clock does the rest: a level is
 * survived, not cleared.
 */
export const undertowHand: Hand = (w) => {
  const u = undertowBoss(w);
  if (u === null || undertowEbbing(u)) return [];
  const tall = u.lobes.find((x) => x.stage === "tall");
  if (tall !== undefined) {
    const command = {
      kind: "drag",
      target: "undertowTap",
      on: true,
      fromMilli: 0,
      id: tall.col,
    } as const;
    return [{ player: 1, command }];
  }
  const b = u.lobes.find((x) => x.stage === "standing");
  if (b === undefined) return [];
  if (b.answer === "shield") {
    if (w.shieldCol !== b.col) return [{ player: 2, command: { kind: "shieldCol", col: b.col } }];
    return [{ player: 1, command: { kind: "guard" } }];
  }
  if (w.cannonCol !== b.col) return [aim(b.col)];
  return [intake()];
};

/** How far down its vein AUTO carries a candidate each tick, in thousandths of the vein. */
const ANTIPHON_STEP = 250;

/** The chooser's thumb on candidate `id`, carried `milli` of the way down its vein. */
function carry(w: World, s: AntiphonState, id: number, milli: number): Press {
  return {
    player: antiphonChooser(s),
    command: {
      kind: "drag",
      target: "antiphonRail",
      on: true,
      ...antiphonVeinMilli(w.cfg, s, id, milli),
      id,
    },
  };
}

/**
 * THE ANTIPHON: the chooser carries the organ down its vein to the organ's
 * place once it has pushed all the way out (`antiphonStanding`,
 * `sim/antiphon-hand.ts`) — a quarter of the vein a tick, as a device
 * reports where the finger *is* — and it pits; the ship, last of the
 * organs, the same. It starts a beat into the window, the time a pair takes
 * to say a shape, so the window's marks are up long enough to be read
 * (`tools/director/test/boss-hush.test.ts`). The pair finds the organ by
 * talking; the hand reads it off the state, because the state posed is the
 * stillness after the sixth pit and the ship going down.
 */
export const antiphonHand: Hand = (w) => {
  const s = antiphonBoss(w);
  if (s === null || s.downBeat >= 0 || s.organ === null) return [];
  if (w.beat < s.organ.grownBeat + w.cfg.antiphonGrowBeats + 1) return [];
  const from = s.carried === s.answer ? s.carryMilli : 0;
  return [carry(w, s, s.answer, Math.min(1000, from + ANTIPHON_STEP))];
};

/**
 * THE ANTIPHON's carry held half way, for a pose of the gesture: the chooser
 * has a decoy on its vein and has not let go — the pose wants the carry
 * rather than the verdict, and a decoy carried home would strike the hull.
 */
export const antiphonCarryHand: Hand = (w) => {
  const s = antiphonBoss(w);
  if (s === null || s.downBeat >= 0 || !antiphonStanding(s, w.cfg, w.beat)) return [];
  const id = s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i));
  return id < 0 ? [] : [carry(w, s, id, 500)];
};
