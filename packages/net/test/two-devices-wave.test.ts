import { describe, expect, it } from "bun:test";
import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimEvent,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { HashLedger, Lockstep, type PlayerId, type ServerMessage } from "../src/index.js";
import { Relay } from "./relay.js";

/**
 * One wave of the real game, played to its end by two devices over a delayed
 * link, with the fingerprints exchanged as the game exchanges them.
 *
 * `two-devices.test.ts` next door plays a queue written for it and stops at a
 * tick count. What this adds is the other half of the claim: the wave is
 * **content's** — the first one `waves.ts` lists, translated by `buildQueue`
 * the way `apps/game/src/waves.ts` translates it — and the run stops when the
 * wave does, which is the simulation's own verdict rather than a number in a
 * test. And the two worlds are not compared by reaching into both of them:
 * every sixteenth tick each device fingerprints its own world, sends it, and
 * puts the peer's through `HashLedger`, so what the test asserts is the verdict
 * the game itself would draw a DESYNC screen on.
 */

/** The first wave `waves.ts` lists. Its name is asserted below, not assumed. */
const WAVE = 0;
/** The world's seed, fixed so the run is the same one every time. */
const SEED = 7;
const LATENCY = 3;
/** Ticks between fingerprints. The game takes one every four beats; this is denser. */
const HASH_EVERY = 16;
/**
 * A delay each, and deliberately not the same one: a wave played with one phone
 * on wifi and one on mobile data is the case the whole scheme exists for, and
 * every press below crosses stamped with the tick it lands on either way.
 */
const DELAYS: [number, number] = [12, 20];
/**
 * Ticks the run may take. It is a bound on the loop and not a length: the run
 * stops when the wave does, and a wave that never ends fails on what it did not
 * reach instead of hanging the suite.
 */
const CEILING = 3000;

/**
 * The pair's presses, at the tick each thumb lands — written out rather than
 * rolled, for `determinism.test.ts`'s reason: a script somebody can read is a
 * script somebody can tell is playing the wave rather than fidgeting through it.
 *
 * FIRST STEP sends one red body down the column `buildQueue` maps the authored
 * column 2 onto. Seat 1 stands the cannon in it, seat 2 spends two cyan shots
 * on it for nothing and then red, and between them the dome comes up and the
 * maw opens — so the run covers ten beats of a body falling rather than one
 * shot on the first of them.
 *
 * It is written for **this** wave, which is why the name is asserted above: a
 * lane that reorders act one should be told that a column and a colour here
 * were about FIRST STEP, not left with a test that passes while proving
 * nothing.
 */
const PRESSES: { tick: number; player: PlayerId; command: Command }[] = [
  { tick: 20, player: 1, command: { kind: "cannonCol", col: 3 } },
  { tick: 30, player: 2, command: { kind: "shieldCol", col: 3 } },
  // Cyan, twice, on a body that is red: the wave's own lesson, and nothing
  // comes apart. The body keeps falling, which is what makes this a run of
  // beats rather than a shot on the first one.
  { tick: 200, player: 2, command: { kind: "fire", color: "cyan" } },
  { tick: 320, player: 1, command: { kind: "guard" } },
  { tick: 440, player: 2, command: { kind: "fire", color: "cyan" } },
  { tick: 560, player: 1, command: { kind: "intake" } },
  // And red, in the column the cannon has been standing in all along.
  { tick: 700, player: 2, command: { kind: "fire", color: "red" } },
  { tick: 820, player: 1, command: { kind: "cannonCol", col: 5 } },
  { tick: 860, player: 2, command: { kind: "shieldCol", col: 5 } },
];

interface Device {
  world: World;
  lock: Lockstep;
  /** This device's own fingerprints, and the peer's as they arrive. */
  ledger: HashLedger;
}

/** The wave as content has it, built the four ways `apps/game` builds one. */
function freshWorld(): World {
  const cfg = { ...DEFAULT_CONFIG };
  const world = createWorld(cfg, SEED);
  startWave(
    world,
    WAVE,
    buildQueue(WAVE, cfg.cols),
    buildPods(WAVE, cfg.cols),
    buildBoss(WAVE, cfg.cols),
  );
  return world;
}

describe("two devices playing content's first wave", () => {
  it("agree at every fingerprint and end the wave on the same world", () => {
    expect(WAVES[WAVE]?.name).toBe("FIRST STEP");

    const wire = new Relay(LATENCY);
    const make = (player: PlayerId): Device => ({
      world: freshWorld(),
      lock: new Lockstep({
        player,
        delayTicks: DELAYS[player - 1] ?? DEFAULT_CONFIG.inputDelayTicks,
        send: (m) => wire.post(player, m),
      }),
      ledger: new HashLedger(),
    });
    const a = make(1);
    const b = make(2);
    // A `hash` is the ledger's, everything else the scheduler's — the split
    // `link-run.ts` makes in its own `receive`.
    const deliver = (to: PlayerId, message: ServerMessage): void => {
      const device = to === 1 ? a : b;
      if (message.t === "hash") {
        expect(device.ledger.observe(message.tick, message.hash)).not.toBe("mismatch");
        return;
      }
      device.lock.receive(message);
    };

    let checkpoints = 0;
    let ended: SimEvent | null = null;
    let tick = 0;
    for (; tick < CEILING && ended === null; tick++) {
      for (const p of PRESSES) {
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
      // What each world says happened this tick, which is what the screen and
      // the speaker are about to read. Two worlds in step cannot differ here.
      expect(b.world.events).toEqual(a.world.events);
      ended = a.world.events.find((e) => e.type === "needWave") ?? null;

      if (a.world.tick % HASH_EVERY !== 0) continue;
      checkpoints++;
      for (const device of [a, b]) {
        const t = device.world.tick;
        const hash = hashWorld(device.world);
        expect(device.ledger.record(t, hash)).not.toBe("mismatch");
        wire.post(device === a ? 1 : 2, { t: "hash", tick: t, hash });
      }
    }

    // The wave was played through: the body content sent arrived, was taken
    // apart rather than let through, and the simulation asked for the next wave
    // rather than for this one again. About 975 ticks at these delays — ten
    // beats of play and the rest after the clear, which is what "one full wave"
    // is here.
    expect(ended).toEqual({ type: "needWave", wave: WAVE + 1 });
    expect(a.world.spawned).toBe(1);
    expect(a.world.creatures).toEqual([]);
    expect(a.world.retries).toBe(0);
    expect(a.world.balance.wavesCleared).toBe(1);

    // Neither ledger ever saw the two worlds part, and both of them were
    // actually looking — an unexchanged fingerprint agrees about nothing.
    for (const device of [a, b]) {
      expect(device.ledger.desyncTick).toBeNull();
      // Every fingerprint but at most the last was answered: a peer's lands
      // `LATENCY` ticks after it was taken, which is well inside the sixteen
      // before the next one.
      expect(device.ledger.agreements).toBeGreaterThanOrEqual(checkpoints - 1);
      expect(device.lock.brokenPromises).toBe(0);
    }
    expect(hashWorld(b.world)).toBe(hashWorld(a.world));
  });
});
