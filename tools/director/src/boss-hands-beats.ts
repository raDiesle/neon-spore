import {
  type BatonBead,
  type BatonState,
  batonBeadCol,
  batonBoss,
  batonLaunchable,
  batonMayStrip,
  batonMergeSocket,
  batonSocketCol,
  type Color,
  gumIsFlung,
  MILLI,
  type TimedCommand,
  throatBoss,
  throatMouthCol,
  throatMouthRow,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the bosses a beat answers** — THE BATON and THE
 * THROAT — each a `Hand` (`poses-bosses-kit.ts`). The shot bosses' hands
 * (`boss-hands-shots.ts`) spray and let the boss judge the beat; these two
 * cannot, because what they answer is not a shot but a moment: a turn taken
 * and then the other seat's, a gum flung along a row as the mouth passes. So each hand reads the moment off the field the way the pair
 * does — off the boss's own predicates, never off a clock of its own — and
 * presses when it is there.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const trigger = (): Press => ({ player: 1, command: { kind: "guard" } });

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/**
 * THE BATON: the pilot under the bead that sits longest and his trigger
 * sends it; the navigator's bolt in the bead's colour through it in the
 * air, with the cannon following the flight (`batonBeadCol`). On the
 * crossing the acts alternate — his trigger, her bolt — and the lock
 * swallows whichever seat is out of turn, so both may press every tick.
 * A rock the wave drops down the bead's column eats her bolt, and that is
 * the miss (`batonCrossBeat`): the hand does not know a way round it,
 * because the pair has none, and plays the regrown arm through to the
 * crossing the column is clear for. Falling, the maw under the pod
 * (`batonBeadTaken`).
 *
 * It also plays the arm's own two thumbs (`sim/baton-hand.ts`): whichever seat
 * the beat locked out strips the shell that is coming away, and under
 * `merging` both thumbs go down on their own bead, which is the only way past
 * that stage. `batonDrawHand` below is the same hand with one thumb kept off,
 * so the state can be posed instead of walked through.
 */
export const batonHand: Hand = (w) => draws(w, [1, 2]);

/** The same, with only the pilot's thumb on his bead: `merging` holds open. */
export const batonDrawHand: Hand = (w) => draws(w, [1]);

function draws(w: World, seats: readonly (1 | 2)[]): Press[] {
  const b = batonBoss(w);
  if (b === null || b.stage === "unfolding" || b.stage === "down") return [];
  if (b.stage === "merging") {
    return seats.map((player) => ({
      player,
      command: {
        kind: "drag" as const,
        target: "batonSocket" as const,
        on: true,
        fromMilli: 0,
        fromYMilli: 0,
        id: batonMergeSocket(w.cfg, player),
      },
    }));
  }
  if (b.stage === "falling") {
    const pod = w.pods.find((p) => p.id === b.podId);
    if (pod === undefined) return [];
    return [aim(Math.round(pod.colMilli / MILLI)), { player: 1, command: { kind: "intake" } }];
  }
  if (b.stage === "crossing") {
    const bead = b.beads[0];
    if (bead === undefined) return [];
    // Her act is the bolt through the bead in the air; his is the trigger
    // under the socket it left (`batonActor`, `baton.test.ts`'s `act`).
    if (b.acts % 2 === 1) return shot(w, b, bead);
    return [aim(batonSocketCol(b, bead.socket)), trigger()];
  }
  const out: Press[] = strip(w, b);
  const flying = b.beads.find((bead) => bead.flying && !bead.struck);
  if (flying !== undefined) return [...out, ...shot(w, b, flying)];
  const next = batonLaunchable(w.cfg, b);
  if (next === null) return out;
  return [...out, aim(batonSocketCol(b, next.socket)), trigger()];
}

/**
 * The shell coming away, taken by whichever seat the beat locked out — a
 * fresh press every other tick, lifting in between, because the arm counts a
 * thumb already down once (`stripThumbs`) and the shell asks for
 * `batonSwellStrips` of them.
 */
function strip(w: World, b: BatonState): Press[] {
  for (const player of [1, 2] as const) {
    if (!batonMayStrip(b, player, w.beat)) continue;
    const down = (b.stripThumbs & (player === 1 ? 1 : 2)) !== 0;
    return [
      {
        player,
        command: {
          kind: "drag",
          target: "batonSocket",
          on: !down,
          fromMilli: 0,
          fromYMilli: 0,
          id: b.swellSocket,
        },
      },
    ];
  }
  return [];
}

/** The cannon under a bead in flight, and the bolt in its colour once it is. */
function shot(w: World, b: BatonState, bead: BatonBead): Press[] {
  const col = batonBeadCol(w.cfg, b, bead, w.tick);
  const out: Press[] = [aim(col)];
  if (free(w) && w.cannonCol === col) out.push(fire(bead.color));
  return out;
}

/**
 * THE THROAT: a gum on the row above the mouth's, still falling, is gripped
 * and flung toward the mouth — the carry is answered on the beat, after the
 * fall has put the gum on the mouth's row, and it flies level from there
 * (`gumSwiped`, `throatFedFling`). Either hand may; this is the navigator's.
 */
export const throatHand: Hand = (w) => {
  const b = throatBoss(w);
  if (b === null || b.phase === "everts") return [];
  const row = throatMouthRow(w.cfg);
  const mouth = throatMouthCol(w.cfg, b, w.beat + 1);
  const out: Press[] = [];
  for (const c of w.creatures) {
    if (c.kind !== "gum" || gumIsFlung(c) || c.row !== row - 1 || c.col === mouth) continue;
    const dir = c.col < mouth ? 1 : -1;
    out.push({ player: 2, command: { kind: "grip", id: c.id } });
    out.push({
      player: 2,
      command: {
        kind: "drag",
        target: "gripBody",
        on: true,
        fromMilli: dir * w.cfg.gumSwipeMilli,
        id: c.id,
      },
    });
  }
  return out;
};
