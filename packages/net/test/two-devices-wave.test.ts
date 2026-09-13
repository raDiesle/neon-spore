import { describe, expect, it } from "bun:test";
import { buildBoss, buildPods, buildQueue, WAVES, waveGuideSteps } from "@neon-spore/content";
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
 * Two waves of the real game, played to their end by two devices over a
 * delayed link, with the fingerprints exchanged as the game exchanges them.
 *
 * `two-devices.test.ts` next door plays a queue written for it and stops at a
 * tick count. What this adds is the other half of the claim: the waves are
 * **content's** — the first two `waves.ts` lists, translated by `buildQueue`
 * the way `apps/game/src/waves.ts` translates them — and the run stops when the
 * second wave does, which is the simulation's own verdict rather than a number
 * in a test. And the two worlds are not compared by reaching into both of them:
 * every sixteenth tick each device fingerprints its own world, sends it, and
 * puts the peer's through `HashLedger`, so what the test asserts is the verdict
 * the game itself would draw a DESYNC screen on.
 *
 * **The boundary between the two is the point.** A wave ends on a `needWave`,
 * and the host answers it by calling `startWave` inside the frame the event
 * arrived in (`waves.ts`'s `handle`), so both devices reset every wave-local
 * field on the same tick by construction — and until this test nothing proved
 * it. `openNext` below answers the event the way `waves.ts` does, with the same
 * calls into `content`, on the tick it arrived, on both devices, and the
 * fingerprints keep crossing over the boundary and through the second wave.
 */

/** The first wave `waves.ts` lists; the run plays it and the one after. Both names are asserted below. */
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
const CEILING = 4500;

/**
 * The pair's presses, at the tick each thumb lands — written out rather than
 * rolled, for `determinism.test.ts`'s reason: a script somebody can read is a
 * script somebody can tell is playing the wave rather than fidgeting through it.
 *
 * FIRST STEP sends eight red bodies over twenty-seven beats, down the columns
 * `buildQueue` maps the authored 3, 3, 4, 6, 5, 3, 0 and 6 onto — as the owner
 * saved it from the director on 13 September 2026, in place of the one body it
 * used to send. Seat 1 stands the cannon under the first, seat 2 spends two
 * cyan shots on it for nothing and then red, and between them the dome comes
 * up and the maw opens; the other seven each get the cannon under them once
 * they are two or three rows down, and one red shot. So the run covers thirty
 * beats of bodies falling, with the cannon crossing the whole field twice.
 *
 * CYAN, the wave after, sends two cyan bodies down the columns authored 2 and
 * 4 map onto, three beats apart. Its presses are counted from the tick the
 * wave opened, because that tick is the run's to find rather than the test's
 * to know — and it is the same tick on both devices, which is asserted.
 *
 * It is written for **these** waves, which is why the names are asserted
 * above: a lane that reorders act one should be told that a column and a
 * colour here were about FIRST STEP and CYAN, not left with a test that passes
 * while proving nothing.
 */
const PRESSES: { wave: number; tick: number; player: PlayerId; command: Command }[] = [
  { wave: 0, tick: 20, player: 1, command: { kind: "cannonCol", col: 5 } },
  { wave: 0, tick: 30, player: 2, command: { kind: "shieldCol", col: 5 } },
  // Cyan, twice, on a body that is red: the wave's own lesson, and nothing
  // comes apart. The body keeps falling, which is what makes this a run of
  // beats rather than a shot on the first one.
  { wave: 0, tick: 200, player: 2, command: { kind: "fire", color: "cyan" } },
  { wave: 0, tick: 320, player: 1, command: { kind: "guard" } },
  { wave: 0, tick: 440, player: 2, command: { kind: "fire", color: "cyan" } },
  { wave: 0, tick: 560, player: 1, command: { kind: "intake" } },
  // And red, in the column the cannon has been standing in all along — which
  // takes the first body, and the second arrived in the same column at beat 4.
  { wave: 0, tick: 700, player: 2, command: { kind: "fire", color: "red" } },
  { wave: 0, tick: 800, player: 2, command: { kind: "fire", color: "red" } },
  // The other six, in arrival order: beat 7 in column 7, beat 10 in 10, beat
  // 12 in 8, beat 16 in 5, beat 21 in 0, beat 27 in 10. A beat is 75 ticks.
  { wave: 0, tick: 900, player: 1, command: { kind: "cannonCol", col: 7 } },
  { wave: 0, tick: 920, player: 2, command: { kind: "shieldCol", col: 7 } },
  { wave: 0, tick: 1000, player: 2, command: { kind: "fire", color: "red" } },
  { wave: 0, tick: 1100, player: 1, command: { kind: "cannonCol", col: 10 } },
  { wave: 0, tick: 1120, player: 2, command: { kind: "shieldCol", col: 10 } },
  { wave: 0, tick: 1200, player: 2, command: { kind: "fire", color: "red" } },
  { wave: 0, tick: 1300, player: 1, command: { kind: "cannonCol", col: 8 } },
  { wave: 0, tick: 1320, player: 2, command: { kind: "shieldCol", col: 8 } },
  { wave: 0, tick: 1400, player: 2, command: { kind: "fire", color: "red" } },
  { wave: 0, tick: 1500, player: 1, command: { kind: "cannonCol", col: 5 } },
  { wave: 0, tick: 1520, player: 2, command: { kind: "shieldCol", col: 5 } },
  { wave: 0, tick: 1600, player: 2, command: { kind: "fire", color: "red" } },
  { wave: 0, tick: 1800, player: 1, command: { kind: "cannonCol", col: 0 } },
  { wave: 0, tick: 1820, player: 2, command: { kind: "shieldCol", col: 0 } },
  { wave: 0, tick: 1900, player: 2, command: { kind: "fire", color: "red" } },
  { wave: 0, tick: 2200, player: 1, command: { kind: "cannonCol", col: 10 } },
  { wave: 0, tick: 2220, player: 2, command: { kind: "shieldCol", col: 10 } },
  { wave: 0, tick: 2300, player: 2, command: { kind: "fire", color: "red" } },
  // CYAN. The first body is in column 3 from the wave's own first beat, the
  // second in column 7 from its fourth; each gets the cannon under it and one
  // cyan shot once it is well down the field.
  { wave: 1, tick: 20, player: 1, command: { kind: "cannonCol", col: 3 } },
  { wave: 1, tick: 40, player: 2, command: { kind: "shieldCol", col: 3 } },
  { wave: 1, tick: 300, player: 2, command: { kind: "fire", color: "cyan" } },
  { wave: 1, tick: 450, player: 1, command: { kind: "cannonCol", col: 7 } },
  { wave: 1, tick: 480, player: 2, command: { kind: "shieldCol", col: 7 } },
  { wave: 1, tick: 600, player: 2, command: { kind: "fire", color: "cyan" } },
];

interface Device {
  world: World;
  lock: Lockstep;
  /** This device's own fingerprints, and the peer's as they arrive. */
  ledger: HashLedger;
}

/**
 * A wave as content has it, opened the way `apps/game/src/waves.ts` opens one:
 * the same calls into `content`, in the same order, with the guide's facts
 * beside the boss's. `briefings` is off here, so the guide never stands — the
 * opening itself is `two-devices-opening.test.ts`'s subject — but the call is
 * the host's call and not a shorter one, so a field `startWave` starts reading
 * off a later argument is reset here the way it is in the game.
 */
function openNext(world: World, wave: number): void {
  const cfg = world.cfg;
  startWave(
    world,
    wave,
    buildQueue(wave, cfg.cols),
    buildPods(wave, cfg.cols),
    buildBoss(wave, cfg.cols),
    WAVES[wave]?.guide !== undefined,
    waveGuideSteps(wave),
    WAVES[wave]?.malfunction ?? null,
  );
}

function freshWorld(): World {
  const world = createWorld({ ...DEFAULT_CONFIG }, SEED);
  openNext(world, WAVE);
  return world;
}

describe("two devices playing content's first two waves", () => {
  it("agree at every fingerprint, cross the boundary on one tick and end on the same world", () => {
    expect(WAVES[WAVE]?.name).toBe("FIRST STEP");
    expect(WAVES[WAVE + 1]?.name).toBe("CYAN");

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
    /** The tick each wave opened on, by wave. Wave 0 opened before the first. */
    const opened: number[] = [0];
    let tick = 0;
    for (; tick < CEILING && ended === null; tick++) {
      for (const p of PRESSES) {
        const at = opened[p.wave];
        if (at !== undefined && at + p.tick === tick) {
          (p.player === 1 ? a : b).lock.press(p.player, p.command, tick);
        }
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
      const need = a.world.events.find((e) => e.type === "needWave");
      if (need?.type === "needWave") {
        if (need.wave > WAVE + 1) {
          ended = need;
        } else {
          // The boundary. Answered on both devices inside the tick the event
          // arrived, which is what `waves.ts` does and what keeps every
          // wave-local field resetting on the same tick — the first tick of
          // the new wave is the very next one, and the fingerprint sixteen
          // ticks on is taken across the seam.
          openNext(a.world, need.wave);
          openNext(b.world, need.wave);
          opened[need.wave] = tick + 1;
          expect(hashWorld(b.world)).toBe(hashWorld(a.world));
        }
      }

      if (a.world.tick % HASH_EVERY !== 0) continue;
      checkpoints++;
      for (const device of [a, b]) {
        const t = device.world.tick;
        const hash = hashWorld(device.world);
        expect(device.ledger.record(t, hash)).not.toBe("mismatch");
        wire.post(device === a ? 1 : 2, { t: "hash", tick: t, hash });
      }
    }

    // Both waves were played through: every body content sent arrived, was
    // taken apart rather than let through, and the simulation asked for the
    // wave after the second rather than for either again. The first wave took
    // about 2625 ticks at these delays — thirty beats of play and the rest
    // after the clear — and the boundary was crossed once, on a tick the run
    // found.
    expect(ended).toEqual({ type: "needWave", wave: WAVE + 2 });
    expect(opened[WAVE + 1]).toBeGreaterThan(2400);
    expect(a.world.wave).toBe(WAVE + 1);
    expect(a.world.spawned).toBe(2);
    expect(a.world.creatures).toEqual([]);
    expect(a.world.retries).toBe(0);
    expect(a.world.balance.wavesCleared).toBe(2);

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
