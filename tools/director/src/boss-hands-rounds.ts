import {
  type Color,
  gaugeRound,
  gaugeSeated,
  MAZE_TURN,
  type MirrorStep,
  mazeCoreEntrance,
  mazeCurrent,
  mazeHeartColor,
  mazeRound,
  mirrorGesture,
  type ScoutState,
  scoutCurrent,
  scoutHome,
  scoutRound,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the rounds a hand has to play** — THE MAZE, THE
 * GAUGE, THE MIRROR's pin, THE SCOUT's little ship — each a `Hand`
 * (`poses-bosses-kit.ts`). A round's other phases arrive with nobody
 * pressing (`poses-bosses-rounds.ts`); these are the ones whose played states
 * do not, and each hand plays the round's own test rig straight: the string
 * pulled until the way in clicks onto a column, the shot up it; the valve
 * turned toward the mark and the call when the needle sits between them.
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
 * THE GAUGE: the pilot turns the valve toward the mark he cannot see, and
 * the navigator calls whenever the needle is seated between her marks
 * (`gaugeSeated`). A call wide of the band costs a rest and nothing else.
 */
export const gaugeHand: Hand = (w) => {
  const g = gaugeRound(w);
  if (g === null || g.phase !== "play") return [];
  const out: Press[] = [];
  const want = g.needleMilli < g.markMilli ? 1 : -1;
  if (g.valve !== want) out.push(valve(want));
  if (gaugeSeated(w, g)) out.push({ player: 2, command: { kind: "call" } });
  return out;
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

/** Where the scout is heading for: the first mote it has not got, else home. */
function scoutTarget(w: World, s: ScoutState): { colMilli: number; rowMilli: number } {
  const arena = scoutCurrent(s);
  for (let i = 0; i < arena.motes.length; i++) {
    if (s.carrying.includes(i) || s.banked.includes(i)) continue;
    const mote = arena.motes[i];
    if (mote !== undefined) return mote;
  }
  return scoutHome(w.cfg.cols, w.cfg.rows);
}

/** The heading, in thousandths of a degree, that points along `(dc, dr)`. 0 is straight up. */
function scoutBearing(dc: number, dr: number): number {
  const deg = (Math.atan2(dc, -dr) * 180_000) / Math.PI;
  return ((Math.round(deg) % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
}

/** The shortest way round from one heading to another, signed. */
function turnToward(from: number, to: number): number {
  const diff = (((to - from) % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
  return diff > MAZE_TURN / 2 ? diff - MAZE_TURN : diff;
}

/**
 * Whether a hazard sits close enough, row and column both, that burning
 * toward the target risks it this beat. `scout-flight.test.ts`'s autopilot
 * never asks this, but it flies the arena's own seven columns; a pose flies
 * it stretched to eleven (`queue-boss.ts`) at the ship's unstretched speed,
 * so the crossing runs long and the hazard is not where the narrow one left it.
 */
function scoutDanger(s: ScoutState): boolean {
  return s.hazards.some(
    (h) => Math.abs(s.rowMilli - h.rowMilli) <= 3_000 && Math.abs(s.colMilli - h.colMilli) <= 3_500,
  );
}

/**
 * THE SCOUT: a deliberately stupid autopilot, lifted from
 * `content/test/scout-flight.test.ts`'s own — points the nose at the first
 * mote it has not got, burns while aimed and under half top speed, coasts
 * otherwise, and heads home once it is carrying everything. It does not lead
 * a hazard or plan an order, only hold off a near one (`scoutDanger`), and
 * exists here only to reach `laden` and `heavy`, not to fly well.
 */
export const scoutHand: Hand = (w) => {
  const s = scoutRound(w);
  if (s === null) return [];
  const want = scoutTarget(w, s);
  const dc = want.colMilli - s.colMilli;
  const dr = want.rowMilli - s.rowMilli;
  const off = turnToward(s.headingMilli, scoutBearing(dc, dr));
  const out: Press[] = [];
  const aimed = Math.abs(off) <= w.cfg.scoutTurnMilliDeg;
  const speedSq = s.vColMilli * s.vColMilli + s.vRowMilli * s.vRowMilli;
  const cruising = speedSq >= (w.cfg.scoutMaxSpeedMilli / 2) * (w.cfg.scoutMaxSpeedMilli / 2);
  const dir = off > 0 ? 1 : -1;
  if (!aimed && s.turn !== dir) {
    out.push({ player: 1, command: { kind: "scoutTurn", dir, on: true } });
  } else if (aimed && s.turn !== 0) {
    out.push({ player: 1, command: { kind: "scoutTurn", dir: 1, on: false } });
  }
  const burn = aimed && !cruising && !scoutDanger(s);
  if (burn !== s.burning) out.push({ player: 1, command: { kind: "scoutBurn", on: burn } });
  // The navigator holds the mouth open the whole flight — an open mouth costs
  // nothing, and this hand only has to arrive loaded, not play the maw well.
  out.push({ player: 2, command: { kind: "scoutMaw" } });
  return out;
};

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
