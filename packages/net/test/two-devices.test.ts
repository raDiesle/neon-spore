import { describe, expect, it } from "bun:test";
import {
  type Command,
  createRng,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  nextInt,
  type SpawnEntry,
  step,
  type World,
} from "@neon-spore/sim";
import { type ClientMessage, Lockstep, type PlayerId, type ServerMessage } from "../src/index.js";

/** Ticks a packet spends in the air. Shorter than the input delay, or nothing works. */
const LATENCY = 3;
const TICKS = 900;

/** A relay with a delay, standing in for the Durable Object and the two phones. */
class Wire {
  private air: { due: number; to: PlayerId; message: ServerMessage }[] = [];
  private now = 0;

  post(from: PlayerId, message: ClientMessage): void {
    const to: PlayerId = from === 1 ? 2 : 1;
    if (message.t === "input") {
      this.air.push({
        due: this.now + LATENCY,
        to,
        message: { t: "input", player: from, tick: message.tick, commands: message.commands },
      });
    } else if (message.t === "confirm") {
      this.air.push({
        due: this.now + LATENCY,
        to,
        message: { t: "confirm", player: from, tick: message.tick },
      });
    }
  }

  /**
   * Time passes and whatever is due lands — in the order it was sent. That is
   * not decoration: a `confirm` overtaking the `input` it was sent after is the
   * peer breaking its own promise, and the scheduler is right to refuse the
   * input. A WebSocket keeps the order, so the test has to as well.
   */
  advance(deliver: (to: PlayerId, message: ServerMessage) => void): void {
    this.now++;
    const landed = this.air.filter((p) => p.due <= this.now);
    this.air = this.air.filter((p) => p.due > this.now);
    for (const packet of landed) deliver(packet.to, packet.message);
  }
}

const QUEUE: SpawnEntry[] = [
  { beat: 1, col: 2, kind: "slick", color: "red" },
  { beat: 2, col: 5, kind: "bulb", color: "cyan" },
  { beat: 3, col: 8, kind: "meteor", color: null },
  { beat: 5, col: 4, kind: "slick", color: "red" },
  { beat: 7, col: 6, kind: "meteorFast", color: null },
];

/** What a thumb does, written down so both devices can be given the same one. */
function script(seed: number): Map<number, Command[]> {
  const rng = createRng(seed);
  const out = new Map<number, Command[]>();
  for (let tick = 0; tick < TICKS; tick += 5 + nextInt(rng, 11)) {
    const roll = nextInt(rng, 4);
    const command: Command =
      roll === 0
        ? { kind: "guard" }
        : roll === 1
          ? { kind: "intake" }
          : roll === 2
            ? { kind: "fire", color: nextInt(rng, 2) === 0 ? "red" : "cyan" }
            : { kind: "cannonCol", col: nextInt(rng, DEFAULT_CONFIG.cols) };
    out.set(tick, [command]);
  }
  return out;
}

interface Device {
  world: World;
  lock: Lockstep;
}

/**
 * A whole run, tick by tick, with the two worlds compared at every one of them.
 *
 * `delays` is what each device schedules by. It is a pair rather than a number
 * because the two are allowed to differ: every command crosses the wire stamped
 * with the tick it lands on, so the delay never has to be agreed — which is
 * what lets a device on a bad line carry its own lag instead of imposing it.
 * `retune` is called each tick so a test can move those numbers mid-run.
 */
function playTogether(
  delays: [number, number],
  retune?: (tick: number, a: Lockstep, b: Lockstep) => void,
): void {
  const wire = new Wire();
  const make = (player: PlayerId): Device => ({
    world: createWorld({ ...DEFAULT_CONFIG }, 0, [...QUEUE.map((e) => ({ ...e }))]),
    lock: new Lockstep({
      player,
      delayTicks: delays[player - 1] ?? DEFAULT_CONFIG.inputDelayTicks,
      send: (m) => wire.post(player, m),
    }),
  });
  const a = make(1);
  const b = make(2);
  const deliver = (to: PlayerId, message: ServerMessage): void =>
    (to === 1 ? a : b).lock.receive(message);

  // Seat 1 holds the cannon and the trigger, seat 2 the shield and the
  // colours, so the two scripts are different on purpose: the interesting
  // desyncs are the ones where the order of two seats' commands could differ.
  const p1 = script(11);
  const p2 = script(29);

  for (let tick = 0; tick < TICKS; tick++) {
    retune?.(tick, a.lock, b.lock);
    for (const c of p1.get(tick) ?? []) a.lock.press(1, c, tick);
    for (const c of p2.get(tick) ?? []) b.lock.press(2, c, tick);

    // The real client pumps once a frame whether or not the tick ran; the
    // extra spins are the stall, which at the start of a run is every tick
    // until the first promises have crossed.
    let spins = 0;
    do {
      a.lock.pump(tick);
      b.lock.pump(tick);
      wire.advance(deliver);
      if (++spins > 4 * LATENCY + 8 + Math.max(...delays)) {
        throw new Error(`deadlocked at tick ${tick}`);
      }
    } while (!a.lock.ready(tick) || !b.lock.ready(tick));

    // Each device works out its own list. That they are the same list is the
    // claim under test, before a single tick of the simulation runs on it.
    const forA = a.lock.commandsFor(tick);
    const forB = b.lock.commandsFor(tick);
    expect(forB).toEqual(forA);
    step(a.world, forA);
    step(b.world, forB);
    expect(hashWorld(b.world)).toBe(hashWorld(a.world));
  }

  // A run that never desynced but also never happened proves nothing.
  expect(a.world.tick).toBe(TICKS);
  expect(a.world.score + a.world.guard.tries).toBeGreaterThan(0);
  expect(a.lock.brokenPromises).toBe(0);
  expect(b.lock.brokenPromises).toBe(0);
}

describe("two devices", () => {
  it("play the same game over a delayed link", () => {
    const delay = DEFAULT_CONFIG.inputDelayTicks;
    playTogether([delay, delay]);
  });

  /**
   * The claim `InputDelay` rests on. One phone on a good line and one on a bad
   * one hold different delays and are still one game — if that were not true,
   * the delay would have to be handed out by the room and hashed, and a player
   * on wifi would be made to feel their partner's mobile data.
   */
  it("play the same game with a different delay in each hand", () => {
    playTogether([6, 24]);
  });

  /**
   * And they may move while the run is going, which is what a link being
   * measured actually looks like: the rise is immediate and the fall is a tick
   * at a time, so both directions cross this run.
   */
  it("play the same game while both delays are being retuned", () => {
    playTogether([8, 16], (tick, a, b) => {
      if (tick === 200) a.setDelayTicks(28);
      if (tick === 350) b.setDelayTicks(5);
      if (tick >= 500 && tick % 40 === 0) a.setDelayTicks(Math.max(5, a.delay - 1));
      if (tick === 700) b.setDelayTicks(30);
    });
  });
});
