import { describe, expect, it } from "bun:test";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  guidePage,
  hashWorld,
  OPENING_GUIDE,
  OPENING_INTRO,
  OPENING_PLAY,
  type OpeningPhase,
  PAIR_ON,
  readyHoldTicks,
  type SpawnEntry,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { Lockstep, type PlayerId, type ServerMessage } from "../src/index.js";
import { Relay } from "./relay.js";

/**
 * A wave's opening, put through the wire.
 *
 * `briefings` is off in `DEFAULT_CONFIG` and on in the game (`config-pair.ts`),
 * so the two runs next door play a wave that has already started and nothing
 * anywhere sent an opening over the scheduler. The opening is the one place
 * `step` takes a different shape — two command kinds are read, everything below
 * the branch is skipped, and the tick still counts — and the word that ends it
 * has to land on the same tick on both devices, or one of them plays a wave the
 * other is still reading about. Each run here presses the opening's own
 * commands a few ticks apart in the two seats, with a different delay in each
 * hand, and asks the same question three times: on which tick did the world
 * leave each state, and was it the same tick on both devices.
 */

const LATENCY = 3;
/** A delay each, unequal on purpose: the ack from the slow hand is the one that decides. */
const DELAYS: [number, number] = [8, 20];
const QUEUE: SpawnEntry[] = [{ beat: 1, col: 2, kind: "slick", color: "red" }];

interface Press {
  tick: number;
  player: PlayerId;
  command: Command;
}

interface Device {
  world: World;
  lock: Lockstep;
  /** The opening's state after each tick, as this device saw it. */
  phases: OpeningPhase[];
}

/** The world with two people in front of it, on a wave that opens the way asked. */
function freshWorld(hasGuide: boolean, guideSteps: number): World {
  const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON };
  const world = createWorld(cfg, 3);
  startWave(
    world,
    0,
    QUEUE.map((e) => ({ ...e })),
    [],
    null,
    hasGuide,
    guideSteps,
  );
  return world;
}

/**
 * `ticks` of both devices, in step, with every tick's command list and every
 * tick's fingerprint compared — the loop `two-devices.test.ts` runs, kept here
 * because what this file records per tick is the opening's phase.
 */
function play(
  hasGuide: boolean,
  guideSteps: number,
  presses: Press[],
  ticks: number,
): [Device, Device] {
  const wire = new Relay(LATENCY);
  const make = (player: PlayerId): Device => ({
    world: freshWorld(hasGuide, guideSteps),
    lock: new Lockstep({
      player,
      delayTicks: DELAYS[player - 1] ?? DEFAULT_CONFIG.inputDelayTicks,
      send: (m) => wire.post(player, m),
    }),
    phases: [],
  });
  const a = make(1);
  const b = make(2);
  const deliver = (to: PlayerId, message: ServerMessage): void =>
    (to === 1 ? a : b).lock.receive(message);

  for (let tick = 0; tick < ticks; tick++) {
    for (const p of presses) {
      if (p.tick === tick) (p.player === 1 ? a : b).lock.press(p.player, p.command, tick);
    }
    let spins = 0;
    do {
      a.lock.pump(tick);
      b.lock.pump(tick);
      wire.advance(deliver);
      if (++spins > 4 * LATENCY + 8 + Math.max(...DELAYS)) {
        throw new Error(`deadlocked at tick ${tick}`);
      }
    } while (!a.lock.ready(tick) || !b.lock.ready(tick));

    const forA = a.lock.commandsFor(tick);
    const forB = b.lock.commandsFor(tick);
    expect(forB).toEqual(forA);
    step(a.world, forA);
    step(b.world, forB);
    // The phase and both fills are in the hash (`briefing.ts`), so this is the
    // opening compared at every tick and not only at the ones a test names.
    expect(hashWorld(b.world)).toBe(hashWorld(a.world));
    a.phases.push(a.world.brief.phase);
    b.phases.push(b.world.brief.phase);
  }
  expect(a.lock.brokenPromises).toBe(0);
  expect(b.lock.brokenPromises).toBe(0);
  return [a, b];
}

/** The first tick after which the world was in `phase`, or -1 if it never was. */
function firstTickIn(device: Device, phase: OpeningPhase): number {
  return device.phases.indexOf(phase);
}

describe("a wave's opening over a delayed link", () => {
  it("leaves the introduction on the tick the slower seat's ack lands, on both devices", () => {
    // Seat 1 acks first, from the hand with the short delay; seat 2 fifteen
    // ticks later from the long one. The second ack is the one that lets the
    // wave start, and it takes effect `DELAYS[1]` ticks after the thumb.
    const [a, b] = play(
      false,
      0,
      [
        { tick: 10, player: 1, command: { kind: "brief" } },
        { tick: 25, player: 2, command: { kind: "brief" } },
      ],
      200,
    );
    expect(a.phases[0]).toBe(OPENING_INTRO);
    const started = firstTickIn(a, OPENING_PLAY);
    expect(firstTickIn(b, OPENING_PLAY)).toBe(started);
    // After the slow hand's press plus its delay, and not before: the fast
    // hand's ack alone held nothing open and started nothing.
    expect(started).toBeGreaterThanOrEqual(25 + DELAYS[1]);
    expect(a.phases.slice(0, started).every((p) => p === OPENING_INTRO)).toBe(true);
    // The clock ran through the introduction and the wave did not: nothing was
    // spawned while the field was held, and the first body came once it was not.
    expect(a.world.tick).toBe(200);
    expect(a.world.spawned).toBe(1);
  });

  it("pages a stepped guide at each seat's own speed and starts the wave off the gate together", () => {
    // Two pages of film and the gate as the third. Seat 1 reads straight
    // through and holds; seat 2 goes back a page, reads again, lifts its thumb
    // before the circle is full — which empties it — and holds a second time.
    const hold = readyHoldTicks({ ...DEFAULT_CONFIG, ...PAIR_ON });
    const [a, b] = play(
      true,
      2,
      [
        { tick: 10, player: 1, command: { kind: "guideStep" } },
        { tick: 15, player: 2, command: { kind: "guideStep" } },
        { tick: 30, player: 1, command: { kind: "guideStep" } },
        { tick: 40, player: 2, command: { kind: "guideStep", back: true } },
        { tick: 50, player: 2, command: { kind: "guideStep" } },
        { tick: 60, player: 1, command: { kind: "brief", on: true } },
        { tick: 70, player: 2, command: { kind: "guideStep" } },
        { tick: 100, player: 2, command: { kind: "brief", on: true } },
        { tick: 105, player: 2, command: { kind: "brief", on: false } },
        { tick: 130, player: 2, command: { kind: "brief", on: true } },
      ],
      320,
    );
    expect(a.phases[0]).toBe(OPENING_GUIDE);
    // A stepped guide's last page was the wave's name, so the gate opens onto
    // the field with no introduction in between (`guidePassed`).
    expect(firstTickIn(a, OPENING_INTRO)).toBe(-1);
    const started = firstTickIn(a, OPENING_PLAY);
    expect(firstTickIn(b, OPENING_PLAY)).toBe(started);
    // Seat 2's second hold lands `DELAYS[1]` after the thumb and then has the
    // whole circle to fill; the lift at 105 cost it everything the first hold
    // had put in, so the earlier hold cannot have been the one that passed.
    expect(started).toBeGreaterThanOrEqual(130 + DELAYS[1] + hold - 1);
    expect(a.phases.slice(0, started).every((p) => p === OPENING_GUIDE)).toBe(true);
    // Both devices read both seats onto the gate, by the same steps.
    for (const device of [a, b]) {
      expect(guidePage(device.world, 1)).toBe(0);
      expect(guidePage(device.world, 2)).toBe(0);
    }
    expect(a.world.spawned).toBe(1);
  });

  it("takes a prose guide through the gate, then the introduction, on the same ticks", () => {
    // No pages to turn: the gate is up at once, and passing it leaves the
    // wave's name still to read, so the acks follow the holds.
    const [a, b] = play(
      true,
      0,
      [
        { tick: 10, player: 1, command: { kind: "brief", on: true } },
        { tick: 30, player: 2, command: { kind: "brief", on: true } },
        { tick: 120, player: 2, command: { kind: "brief" } },
        { tick: 140, player: 1, command: { kind: "brief" } },
      ],
      320,
    );
    expect(a.phases[0]).toBe(OPENING_GUIDE);
    const read = firstTickIn(a, OPENING_INTRO);
    const started = firstTickIn(a, OPENING_PLAY);
    expect(read).toBeGreaterThan(0);
    expect(started).toBeGreaterThan(read);
    expect(firstTickIn(b, OPENING_INTRO)).toBe(read);
    expect(firstTickIn(b, OPENING_PLAY)).toBe(started);
    // The last hand to move decides each time: seat 2's hold, seat 1's ack.
    expect(read).toBeGreaterThanOrEqual(30 + DELAYS[1]);
    expect(started).toBeGreaterThanOrEqual(140 + DELAYS[0]);
    expect(a.world.spawned).toBe(1);
  });
});
