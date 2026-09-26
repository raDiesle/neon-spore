import {
  type Color,
  type MirrorStep,
  mazeCoreEntrance,
  mazeCurrent,
  mazeHeartColor,
  mazeRound,
  mirrorGesture,
  type TimedCommand,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on the rounds a hand has to play** — THE MAZE, THE
 * MIRROR's pin, PINBALL's three thumbs — each a
 * `Hand` (`hand.ts`). A round's other phases arrive with nobody
 * pressing (`poses-bosses-rounds.ts`); these are the ones whose played states
 * do not, and each hand plays the round's own test rig straight: the string
 * pulled until the way in clicks onto a column, the shot up it.
 *
 * THE GAUGE's two are next door in `boss-hands-gauge.ts`, cut off when this
 * file reached its limit: one of them plays its round *wrong* on purpose,
 * which is the only way to the jam, and that wanted saying at some length.
 * THE SCOUT's little ship is in `boss-hands-scout.ts`, since it looks ahead.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const valve = (dir: -1 | 1): Press => ({ player: 1, command: { kind: "valve", on: true, dir } });

/**
 * THE MAZE: the pilot's thumb pulls the string until a way in clicks onto a
 * column (`mazeCommit`); a press while it is clicked breaks the detent and
 * pulls on, so the thumb presses once per click and waits for the next. On
 * the way in that reaches the middle the cannon slides under the lit column
 * and the navigator's shot goes up it in the heart's colour (`mazeHeard`).
 */
export const mazeHand: Hand = (w) => {
  const m = mazeRound(w);
  if (m === null) return [];
  // The heart holding the shot: his hand on the string, her thumb carried
  // down the whole pull, on one tick (`sim/maze-hand.ts`).
  if (m.phase === "grip") {
    return [
      { player: 1, command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0 } },
      {
        player: 2,
        command: {
          kind: "drag",
          target: "mazeHeart",
          on: true,
          fromMilli: 0,
          fromYMilli: w.cfg.mazeHeartPullMilli,
        },
      },
    ];
  }
  if (m.phase !== "read") return [];
  const wheel = mazeCurrent(m);
  if (wheel === null) return [];
  if (m.lockedWay === mazeCoreEntrance(wheel)) {
    const out: Press[] = [aim(m.lockedCol)];
    if (w.cannonCol === m.lockedCol) out.push(fire(mazeHeartColor(m.round)));
    return out;
  }
  return m.turn === 0 ? [valve(1)] : [];
};

/**
 * THE MIRROR: the step it is waiting for, one a tick, on the panel under an
 * ordinary round and on its own lobes under the last (`mirrorGesture`) —
 * the lift that is a carry past `mirrorCarryMilli`, the press that is a
 * guard — then both thumbs pinned once it stands at no hull. The hand knows
 * the sequence, which the pair only knows by having watched it; it plays
 * it straight otherwise.
 */
export const mirrorHand: Hand = (w) => {
  const m = w.boss;
  if (m === null || m.kind !== "mirror") return [];
  const gesture = mirrorGesture(m);
  if (gesture === "hold") {
    return m.holdThumbs === 3 ? [] : [lobe(1, 0, true, 0), lobe(2, 1, true, 0)];
  }
  if (m.phase !== "listen") return [];
  const want = m.rounds[m.round]?.[m.matched];
  if (want === undefined) return [];
  if (gesture === "answer") return [panelStep(w.cannonCol, want)];
  const carry = w.cfg.mirrorCarryMilli;
  switch (want) {
    case "cannonLeft":
      return [lobe(1, 0, false, -carry)];
    case "cannonRight":
      return [lobe(1, 0, false, carry)];
    case "intake":
      return [lobe(1, 0, false, 0)];
    case "guard":
      return [lobe(1, 1, true, 0)];
    case "fireRed":
      return [lobe(2, 0, false, -carry)];
    case "fireCyan":
      return [lobe(2, 0, false, carry)];
  }
};

/** A step made on the panel, the way `sim/commands.ts` hears one. */
function panelStep(cannonCol: number, step: MirrorStep): Press {
  switch (step) {
    case "cannonLeft":
      return aim(cannonCol - 1);
    case "cannonRight":
      return aim(cannonCol + 1);
    case "intake":
      return { player: 1, command: { kind: "intake" } };
    case "guard":
      return { player: 1, command: { kind: "guard" } };
    case "fireRed":
      return fire("red");
    case "fireCyan":
      return fire("cyan");
  }
}

/** A thumb on one of the mirror's lobes: a press, or a lift carried `fromMilli`. */
function lobe(player: 1 | 2, id: 0 | 1, on: boolean, fromMilli: number): Press {
  return {
    player,
    command: { kind: "drag", target: "mirrorLobe", on, fromMilli, fromYMilli: 0, id },
  };
}

/**
 * PINBALL: latch the needle wherever it has swept to, wind the plunger if the
 * last shot left the spring slack, and launch on the bar.
 *
 * It aims at nothing. A pose runs until the state it wants arrives, and the
 * three states here are `aim`, `power` and `flight` — each of which is a
 * different thumb rather than a different place on the board
 * (`sim/pinball-controls.ts`, `sim/pinball-hand.ts`).
 */
export const pinballHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "pinball" || b.phase !== "play") return [];
  if (b.shot === "aim") return [{ player: 1, command: { kind: "latch" } }];
  if (b.shot !== "power") return [];
  if (b.slack) {
    return [
      {
        player: 1,
        command: {
          kind: "drag",
          target: "pinPlunger",
          on: false,
          fromMilli: 0,
          fromYMilli: w.cfg.pinballWindMilli,
        },
      },
    ];
  }
  return [{ player: 2, command: { kind: "launch" } }];
};
