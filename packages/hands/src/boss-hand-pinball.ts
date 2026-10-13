import {
  type PinBall,
  type PinballState,
  pinCannonMilli,
  pinFieldCol,
  pinHeightMilli,
  pinLaunchVelocity,
  pinPhysics,
  pinRestingBall,
  pinTargetsLeft,
  stepBall,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **PINBALL played by AUTO**: latch the needle on an angle that reaches a
 * target, launch on a bar that does, wind the plunger when the last shot left
 * the spring slack, and slide the cannon under wherever the ball will come
 * down.
 *
 * It once latched on its first tick and launched on its next, so every shot
 * left straight up at four thousandths of the bar, rose half the table, fell
 * back onto the cannon and was fired again the same way until the round's
 * clock ran out — no piece lit, no frame of the board in play
 * (`docs/queue.md`, 10 October 2026).
 *
 * **It looks ahead by flying the ball itself.** What a flight lights stays
 * standing until the flight is over (`PinballState.lit`), so a copy of the
 * ball stepped through the sim's own `stepBall` against the board as it
 * stands meets exactly what the real one will. Only a nudge could change it,
 * and this hand never nudges.
 *
 * **It moves, then it settles.** A board's last target is often reached from
 * only a few columns, so after `MOVE_BEATS` with nothing in reach the hand
 * tries the other columns too, one a tick, and slides the cannon to one that
 * reaches. A board can stand with no target reachable at all, so after
 * `PATIENT_BEATS` it takes a shot that lights anything, and after twice that,
 * any shot at all.
 */

/**
 * The powers tried while the needle sweeps, from soft to the top of the bar.
 * Two were too few: a board's last target is often reached only by a narrow
 * band of the bar, and the hand spent round after round on plain pegs.
 *
 * The bar is tried at these again and nowhere else: a needle latched for a
 * shot at one of them launches when the bar comes round to it, and a trial
 * flown on every tick of the bar made AUTO's PINBALL the slowest thing a test
 * plays. Each is a whole number of the bar's own steps, so it stands on them.
 */
const POWERS = [400, 600, 752, 852, 952] as const;
/** Beats since the last flight before a shot that lights only a plain piece will do. */
const PATIENT_BEATS = 12;
/**
 * How far ahead a trial flight is flown, in beats. A good shot is up the table
 * and back on the cannon in four to twelve; one still in the air at sixteen
 * has come to rest on a block, where it would sit out the whole flight clock
 * and take forty-eight beats of the round's with it. Flying every trial to
 * that clock also made one AUTO round cost seconds.
 */
const AHEAD_BEATS = 16;
/** How far ahead the catch looks: the cannon moves the tick it is told, so two beats is room. */
const CATCH_BEATS = 2;
/**
 * The needle and the catch are judged every this many ticks, not on every
 * one. The needle moves under a degree in that time; the catch looks two
 * beats ahead.
 */
const EVERY_TICKS = 3;
/** Beats since the last flight before the cannon is moved to find a target. */
const MOVE_BEATS = 4;

type Press = Omit<TimedCommand, "tick">;

interface Flight {
  /** Targets this flight would light. */
  targets: number;
  /** Pieces of any kind it would light. */
  pieces: number;
  /** Whether it takes every target left, which ends the round mid-flight. */
  clears: boolean;
  /** Whether it came back down inside the ticks it was flown for. */
  landed: boolean;
}

/**
 * Fly `ball`, a copy, to the floor, the board cleared, or `ticks`, and say what
 * it met. A trial (`below`) stops as soon as the ball is falling under the
 * lowest piece left, since there is nothing more for it to light and the
 * floor is only a fall away — most of a trial's ticks were that fall.
 */
function fly(w: World, b: PinballState, ball: PinBall, ticks: number, below = false): Flight {
  const phys = pinPhysics(w.cfg);
  const floor = pinHeightMilli(w.cfg);
  const left = pinTargetsLeft(b);
  let low = floor;
  if (below) {
    low = 0;
    b.pieces.forEach((p, i) => {
      if (b.alive[i]) low = Math.max(low, p.yMilli + p.hMilli + phys.ballMilli);
    });
  }
  const lit = new Set<number>();
  let targets = 0;
  for (let t = 0; t < ticks && ball.yMilli <= floor && targets < left; t++) {
    if (ball.yMilli > low && ball.vyMilli > 0) break;
    for (const i of stepBall(ball, b.pieces, b.alive, phys)) {
      if (lit.has(i)) continue;
      lit.add(i);
      if (b.pieces[i]?.target === true) targets += 1;
    }
  }
  const landed = ball.yMilli > floor || (ball.yMilli > low && ball.vyMilli > 0);
  return { targets, pieces: lit.size, clears: targets >= left, landed };
}

/** A shot that takes a target and is back on the cannon, or one that ends the board. */
const good = (f: Flight): boolean => f.clears || (f.landed && f.targets > 0);

/** What a shot launched now at this angle and power would do, from the cannon at `col`. */
function shot(w: World, b: PinballState, powerMilli: number, col = w.cannonCol): Flight {
  const ball = pinRestingBall(w, b);
  ball.xMilli = pinCannonMilli(w.cfg, col);
  const v = pinLaunchVelocity(w.cfg, b.angleMilli, powerMilli);
  ball.vxMilli = v.vxMilli;
  ball.vyMilli = v.vyMilli;
  return fly(w, b, ball, AHEAD_BEATS * ticksPerBeat(w.cfg), true);
}

/** Whether a shot is worth taking, given how long this one has been waited for. */
function worth(f: Flight, waited: number): boolean {
  if (good(f) || waited >= 2 * PATIENT_BEATS) return true;
  return waited >= PATIENT_BEATS && f.landed && f.pieces > 0;
}

export const pinballHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "pinball" || b.phase !== "play") return [];
  const waited = w.beat - Math.max(b.flightBeat, b.roundBeat);
  const judged = w.tick % EVERY_TICKS === 0;
  if (b.shot === "aim") {
    if (!judged) return [];
    const latch: Press = { player: 1, command: { kind: "latch" } };
    // Where the cannon stands, and once that has had `MOVE_BEATS` to find
    // nothing, every other judged tick one other column round the hull: the
    // cannon slides there with the latch if it has a target.
    const turn = Math.trunc(w.tick / EVERY_TICKS);
    const moving = waited >= MOVE_BEATS && turn % 2 === 1;
    if (!moving) return POWERS.some((p) => worth(shot(w, b, p), waited)) ? [latch] : [];
    const col = Math.trunc(turn / 2) % w.cfg.cols;
    if (col === w.cannonCol || !POWERS.some((p) => good(shot(w, b, p, col)))) return [];
    return [{ player: 1, command: { kind: "cannonCol", col } }, latch];
  }
  if (b.shot === "flight") {
    if (!judged) return [];
    const ball = { ...b.ball };
    fly(w, b, ball, CATCH_BEATS * ticksPerBeat(w.cfg));
    if (ball.yMilli <= pinHeightMilli(w.cfg)) return [];
    const col = pinFieldCol(w.cfg, ball.xMilli);
    return col === w.cannonCol ? [] : [{ player: 1, command: { kind: "cannonCol", col } }];
  }
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
  const launch: Press = { player: 2, command: { kind: "launch" } };
  if (waited >= 2 * PATIENT_BEATS) return [launch];
  const near = POWERS.some((p) => Math.abs(b.powerMilli - p) * 2 < w.cfg.pinballPowerMilli);
  return near && worth(shot(w, b, b.powerMilli), waited) ? [launch] : [];
};
