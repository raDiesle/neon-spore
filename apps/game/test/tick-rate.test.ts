import { describe, expect, test } from "bun:test";
import { InputDelay } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG, ticksPerBeat, type World } from "@neon-spore/sim";
import { tickMs, ticksAhead } from "../src/tick-rate.js";

/**
 * **A press waits the same number of milliseconds whatever the beat is doing.**
 *
 * THE SLOW makes a tick worth four times its ordinary length, so a delay
 * counted in ticks was four times as long in the hand on exactly the beats a
 * boss made dramatic. `InputDelay` holds milliseconds for that reason, and
 * this file holds the other half: a wait that *crosses the end of a window* is
 * walked rather than divided, because the ticks on the far side of the
 * boundary are short ones.
 *
 * Every number below is the shipped config: 120 Hz and 96 bpm, so 75 ticks to
 * a beat, 8⅓ ms an ordinary tick and 25 ms a slowed one.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const ORDINARY = 1000 / CFG.tickHz;

/** 150 ms of measured trip plus the 45 ms margin: 195 ms, which is 24 ticks. */
const LINK_MS = 195;

function linked(): InputDelay {
  const delay = new InputDelay({ tickHz: CFG.tickHz, floorTicks: CFG.inputDelayTicks });
  delay.observe(150);
  expect(delay.ms).toBeCloseTo(LINK_MS, 6);
  return delay;
}

/** A world with a window open, `ticks` of it left to run from where it stands. */
function slowWith(ticks: number): World {
  const world = createWorld(CFG, 1);
  const beats = Math.ceil(ticks / TPB);
  world.tick = beats * TPB - ticks;
  world.slowFromBeat = world.beat;
  world.slowToBeat = world.beat + beats;
  return world;
}

describe("how long a tick is worth", () => {
  test("is the ordinary rate on an ordinary beat", () => {
    expect(tickMs(createWorld(CFG, 1))).toBeCloseTo(ORDINARY, 9);
  });

  test("is four times that inside one of THE SLOW's windows", () => {
    expect(tickMs(slowWith(TPB))).toBeCloseTo(ORDINARY * (1000 / CFG.slowRateMilli), 9);
  });
});

describe("how far ahead a press is scheduled", () => {
  test("is the plain division when the whole wait is at one rate", () => {
    expect(ticksAhead(linked(), createWorld(CFG, 1))).toBe(24);
    // A window with two whole beats left is far more than 195 ms of slowed
    // ticks, so the wait never leaves it and the division is right again.
    expect(ticksAhead(linked(), slowWith(TPB * 2))).toBe(6);
  });

  /**
   * The bug. Two slowed ticks are 67 ms at a quarter rate; the other 128 ms
   * are spent on the far side of the boundary at 8⅓ ms each, which is sixteen
   * more. Divided at the rate in force it would have been six ticks — 67 ms
   * inside the window and 33 ms outside it, and a press answered in half the
   * time the link asked for.
   */
  test("spends the tail of a wait at the rate the tail is played at", () => {
    expect(ticksAhead(linked(), slowWith(2))).toBe(18);
  });

  /**
   * The property, rather than one arithmetic: a press is never answered sooner
   * than the link asked for, wherever in a window it is made. Short is the
   * direction that stalls a run, and the tick the boundary falls on is exactly
   * the one an off-by-one would put it on.
   */
  test("is never shorter in the hand than the delay it was given", () => {
    for (let left = 1; left <= TPB * 2; left++) {
      const world = slowWith(left);
      const ticks = ticksAhead(linked(), world);
      const slowed = Math.min(ticks, left);
      const ms = slowed * tickMs(world) + (ticks - slowed) * ORDINARY;
      expect(ms, `${left} ticks of window left`).toBeGreaterThanOrEqual(LINK_MS);
    }
  });

  test("is at least one tick, however slow the beat is", () => {
    const delay = new InputDelay({ tickHz: CFG.tickHz, floorTicks: 1, marginMs: 0 });
    expect(ticksAhead(delay, slowWith(TPB))).toBeGreaterThanOrEqual(1);
  });
});
