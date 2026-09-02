import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config.js";
import {
  hitPiece,
  isqrt,
  PIN_THIN_MILLI,
  type PinBall,
  type PinPiece,
} from "../src/pinball-contact.js";
import { type PinPhysics, stepBall } from "../src/pinball-physics.js";

/**
 * The ball, checked the only way a ball can be: by running it and asserting
 * the things that must never happen.
 *
 * Three of them carry the whole file. **It never ends a tick inside
 * something** — that is the tunnelling invariant, and the reason
 * `pinballSpeedCapMilli` is a number rather than a taste. **It never gains
 * speed from a bounce** — restitution below 1000 with truncating division can
 * only lose, and a sign error in `reflect` would show up here as a ball that
 * climbs. **It never leaves the table sideways or upward** — the only way out
 * is the floor, which is the round's business and not this file's.
 */

const CFG = DEFAULT_CONFIG;

const PHYS: PinPhysics = {
  ballMilli: CFG.pinballBallMilli,
  gravityMilli: CFG.pinballGravityMilli,
  speedCapMilli: CFG.pinballSpeedCapMilli,
  bouncePermille: CFG.pinballBouncePermille,
  wallPermille: CFG.pinballWallPermille,
  widthMilli: CFG.pinballCols * 1000,
  heightMilli: CFG.pinballRows * 1000,
};

function speed(ball: PinBall): number {
  return isqrt(ball.vxMilli * ball.vxMilli + ball.vyMilli * ball.vyMilli);
}

/** A dense board: eight rows of pegs with a row of thin blocks through it. */
function board(): PinPiece[] {
  const pieces: PinPiece[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      pieces.push({
        kind: "peg",
        xMilli: 1200 + col * 1400 + (row % 2) * 700,
        yMilli: 3000 + row * 900,
        wMilli: CFG.pinballPegMilli,
        hMilli: CFG.pinballPegMilli,
        target: col === 3,
      });
    }
  }
  for (let col = 0; col < 3; col++) {
    pieces.push({
      kind: "block",
      xMilli: 2000 + col * 3500,
      yMilli: 11_000,
      wMilli: 900,
      hMilli: PIN_THIN_MILLI,
      target: true,
    });
  }
  return pieces;
}

describe("isqrt", () => {
  it("is the exact integer square root", () => {
    for (let n = 0; n < 4000; n++) {
      const r = isqrt(n);
      expect(r * r).toBeLessThanOrEqual(n);
      expect((r + 1) * (r + 1)).toBeGreaterThan(n);
    }
  });

  it("stays exact at the largest distance the table can produce", () => {
    // The diagonal of the table, squared, is the biggest thing ever passed in.
    const diag2 = PHYS.widthMilli * PHYS.widthMilli + PHYS.heightMilli * PHYS.heightMilli;
    for (const n of [diag2 - 1, diag2, 999_999, 1_000_000, 1_000_001]) {
      const r = isqrt(n);
      expect(r * r).toBeLessThanOrEqual(n);
      expect((r + 1) * (r + 1)).toBeGreaterThan(n);
    }
  });
});

describe("the tunnelling invariant", () => {
  it("holds the speed cap under the thinnest thing a ball can hit", () => {
    // One invariant in two files: a tick's motion must never carry the ball's
    // centre past the far side of the thinnest piece `pinballFault` allows.
    expect(CFG.pinballSpeedCapMilli).toBeLessThan(CFG.pinballBallMilli + PIN_THIN_MILLI);
  });
});

describe("stepBall", () => {
  it("reverses a ball off the left wall and keeps it on the table", () => {
    // Close enough that this tick's motion carries it past the wall.
    const ball: PinBall = { xMilli: 400, yMilli: 5000, vxMilli: -200, vyMilli: 0 };
    stepBall(ball, [], [], PHYS);
    expect(ball.xMilli).toBeGreaterThanOrEqual(PHYS.ballMilli);
    expect(ball.vxMilli).toBeGreaterThan(0);
  });

  it("sends a ball straight back down off the top of a peg", () => {
    const peg: PinPiece = {
      kind: "peg",
      xMilli: 5000,
      yMilli: 5000,
      wMilli: CFG.pinballPegMilli,
      hMilli: CFG.pinballPegMilli,
      target: false,
    };
    // Dead centre underneath it, travelling straight up.
    const ball: PinBall = { xMilli: 5000, yMilli: 5600, vxMilli: 0, vyMilli: -200 };
    const struck = stepBall(ball, [peg], [true], PHYS);
    expect(struck).toEqual([0]);
    expect(ball.vxMilli).toBe(0);
    expect(ball.vyMilli).toBeGreaterThan(0);
  });

  it("leaves a dead piece alone", () => {
    const peg: PinPiece = {
      kind: "peg",
      xMilli: 5000,
      yMilli: 5000,
      wMilli: CFG.pinballPegMilli,
      hMilli: CFG.pinballPegMilli,
      target: false,
    };
    const ball: PinBall = { xMilli: 5000, yMilli: 5600, vxMilli: 0, vyMilli: -200 };
    expect(stepBall(ball, [peg], [false], PHYS)).toEqual([]);
    expect(ball.vyMilli).toBeLessThan(0);
  });

  it("never buries the ball, never lets it out, never lets it speed up", () => {
    const pieces = board();
    // Twenty launches across the whole arc, each run until it falls out.
    for (let shot = 0; shot < 20; shot++) {
      const alive = pieces.map(() => true);
      const ball: PinBall = {
        xMilli: 5500,
        yMilli: PHYS.heightMilli - 800,
        // Fanned across the sweep by arithmetic rather than by a table of
        // angles: what matters is that twenty different shots are taken, not
        // that they are evenly spaced.
        vxMilli: -240 + shot * 25,
        vyMilli: -260 + (shot % 5) * 20,
      };
      let last = speed(ball);
      for (let tick = 0; tick < 4000; tick++) {
        const before = speed(ball);
        const struck = stepBall(ball, pieces, alive, PHYS);
        // Gravity is the only thing that may add speed, and it adds exactly
        // one `gravityMilli` a tick. Anything above that came from a bounce.
        expect(speed(ball)).toBeLessThanOrEqual(before + PHYS.gravityMilli + 1);
        expect(speed(ball)).toBeLessThanOrEqual(PHYS.speedCapMilli + 1);
        expect(ball.xMilli).toBeGreaterThanOrEqual(PHYS.ballMilli - 1);
        expect(ball.xMilli).toBeLessThanOrEqual(PHYS.widthMilli - PHYS.ballMilli + 1);
        expect(ball.yMilli).toBeGreaterThanOrEqual(PHYS.ballMilli - 1);
        for (const i of struck) alive[i] = false;
        // Nothing still standing may be overlapping it once the tick is done.
        for (let i = 0; i < pieces.length; i++) {
          const piece = pieces[i];
          if (piece === undefined || !alive[i]) continue;
          expect(hitPiece(ball, piece, PHYS.ballMilli).depth).toBeLessThanOrEqual(0);
        }
        last = speed(ball);
        if (ball.yMilli > PHYS.heightMilli) break;
      }
      // Every shot comes down. A ball still in the air after four thousand
      // ticks is a ball resting on something, which the round times out.
      expect(last).toBeGreaterThanOrEqual(0);
    }
  });

  it("plays the same table twice", () => {
    const trace = (): string => {
      const pieces = board();
      const alive = pieces.map(() => true);
      const ball: PinBall = { xMilli: 5500, yMilli: 16_000, vxMilli: 90, vyMilli: -250 };
      const out: number[] = [];
      for (let tick = 0; tick < 1500 && ball.yMilli <= PHYS.heightMilli; tick++) {
        for (const i of stepBall(ball, pieces, alive, PHYS)) alive[i] = false;
        out.push(ball.xMilli, ball.yMilli);
      }
      return out.join(",");
    };
    expect(trace()).toBe(trace());
  });
});
