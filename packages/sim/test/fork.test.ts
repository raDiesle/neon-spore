import { describe, expect, it } from "bun:test";
import {
  briefingHolds,
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  forkHeld,
  forkOpen,
  hashWorld,
  hullPercent,
  hullRow,
  introHolds,
  type Replay,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE FORK, from the outside: the run stops between waves and continues only
 * when player 1 is holding the lance and player 2 presses a colour.
 *
 * Every test here runs with `forkBetweenWaves` on. `DEFAULT_CONFIG` has it off
 * — see the field's own note in `config.ts` — so the rest of the suite, the
 * director and the replays keep rolling a cleared wave over on their own.
 */
const CFG: SimConfig = { ...DEFAULT_CONFIG, forkBetweenWaves: true };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

/** One slick at wave-beat 0 meets the hull on beat `HULL + 1`. */
const IMPACT_TICK = TPB * (HULL + 1);
/** The rest is spent by then, so the fork is open and has been for a while. */
const FORK_TICK = IMPACT_TICK + TPB * (CFG.waveRestBeats + 1);

const slick = (col: number, color: Color): SpawnEntry => ({ beat: 0, col, kind: "slick", color });
const hold = (tick: number, on: boolean): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "prime", on },
});
const fire = (tick: number, color: Color = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(ticks: number, inputs: TimedCommand[] = [], cfg: SimConfig = CFG): Run {
  const world = createWorld({ ...cfg }, 0, [slick(3, "red")]);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const asks = (events: readonly SimEvent[]): SimEvent[] =>
  events.filter((e) => e.type === "needWave");

describe("the fork opens", () => {
  it("stops the run where the next wave used to start", () => {
    const { world, events } = run(FORK_TICK);
    expect(forkOpen(world)).toBe(true);
    expect(asks(events)).toHaveLength(0);
  });

  it("is not open while the wave is still being played", () => {
    const { world } = run(IMPACT_TICK - TPB);
    expect(forkOpen(world)).toBe(false);
  });

  it("leaves the rest alone when the config has no fork", () => {
    const { world, events } = run(FORK_TICK, [], { ...CFG, forkBetweenWaves: false });
    expect(forkOpen(world)).toBe(false);
    expect(asks(events)).toEqual([{ type: "needWave", wave: 1 }]);
  });
});

describe("one thumb is not enough", () => {
  it("waits with nobody holding anything, for as long as it takes", () => {
    // Four hundred beats of silence. Nothing about the fork is a countdown,
    // so nothing here may ever ask for a wave.
    const { world, events } = run(FORK_TICK + TPB * 400);
    expect(forkOpen(world)).toBe(true);
    expect(asks(events)).toHaveLength(0);
  });

  it("waits while player 1 holds the lance alone", () => {
    const { world, events } = run(FORK_TICK + TPB * 20, [hold(FORK_TICK, true)]);
    expect(forkHeld(world)).toBe(true);
    expect(forkOpen(world)).toBe(true);
    expect(asks(events)).toHaveLength(0);
  });

  it("waits while player 2 fires alone, and spends no shot doing it", () => {
    const { world, events } = run(FORK_TICK + TPB * 4, [fire(FORK_TICK), fire(FORK_TICK + TPB)]);
    expect(forkOpen(world)).toBe(true);
    expect(asks(events)).toHaveLength(0);
    // A colour at the fork is the word "go", not a bolt: nothing leaves the
    // cannon and nothing is reported as having been fired.
    expect(world.bullets).toHaveLength(0);
    expect(events.some((e) => e.type === "fire")).toBe(false);
  });

  it("does not take a hold that was let go before the colour arrived", () => {
    const { world, events } = run(FORK_TICK + TPB * 6, [
      hold(FORK_TICK, true),
      hold(FORK_TICK + TPB, false),
      fire(FORK_TICK + TPB * 2),
    ]);
    expect(forkOpen(world)).toBe(true);
    expect(asks(events)).toHaveLength(0);
  });
});

describe("both thumbs", () => {
  it("asks for the next wave, once, and closes", () => {
    const { world, events } = run(FORK_TICK + TPB * 8, [
      hold(FORK_TICK, true),
      fire(FORK_TICK + TPB * 2),
    ]);
    expect(asks(events)).toEqual([{ type: "needWave", wave: 1 }]);
    expect(forkOpen(world)).toBe(false);
  });

  it("takes a part-filled lobe just as happily as a full one", () => {
    // Half a beat of holding, far short of `lancePrimeBeats`. THE FORK is not
    // a skill check: the thumb being down is the whole of player 1's half.
    const { events } = run(FORK_TICK + TPB * 4, [
      hold(FORK_TICK, true),
      fire(FORK_TICK + Math.floor(TPB / 2)),
    ]);
    expect(asks(events)).toHaveLength(1);
  });

  it("does not ask twice when the colour is pressed again", () => {
    const { events } = run(FORK_TICK + TPB * 8, [
      hold(FORK_TICK, true),
      fire(FORK_TICK + TPB),
      fire(FORK_TICK + TPB * 2),
    ]);
    expect(asks(events)).toHaveLength(1);
  });
});

describe("nothing mends while the pair is talking", () => {
  it("holds the hull where the wave left it", () => {
    const hit = { ...CFG, hullInvulnerable: false };
    const short = run(FORK_TICK, [], hit);
    const long = run(FORK_TICK + TPB * 200, [], hit);
    // The slick reached the hull, so there is damage to heal and a run that
    // stood at the fork for fifty seconds would otherwise be back to full.
    expect(hullPercent(short.world)).toBeLessThan(100);
    expect(hullPercent(long.world)).toBe(hullPercent(short.world));
  });
});

/**
 * THE FORK and the briefing card are two gates at the same seam, and neither
 * lane designed the other. They run fork first and card second, and it takes
 * no code to arrange: a card is only opened by `startWave`, `startWave` is
 * only reached through `needWave`, and between waves `needWave` comes only
 * from a fork being crossed. These tests are what keeps that true.
 */
describe("the fork and the card", () => {
  const BOTH: SimConfig = { ...CFG, briefings: true };
  const brief = (tick: number, player: 1 | 2): TimedCommand => ({
    tick,
    player,
    command: { kind: "brief" },
  });

  it("puts the commit before the lesson, and does not run both at once", () => {
    const world = createWorld({ ...BOTH }, 0);
    // Wave 0 is played through its own cards first, so the fork below is the
    // seam between two waves rather than the opening of a run.
    startWave(world, 0, [slick(3, "red")]);
    let bothEngaged = false;
    /** Whether a card was up on the tick the fork was crossed. */
    let cardBeforeCommit: boolean | null = null;
    /** Whether one was up the moment the wave it asked for had started. */
    let cardAfterCommit: boolean | null = null;
    for (let t = 0; t < FORK_TICK + TPB * 8; t++) {
      const cmds: TimedCommand[] = [];
      // Two people who read every opening as soon as it goes up, and cross
      // the fork once the field has been quiet for a beat.
      if (briefingHolds(world)) cmds.push(brief(t, 1), brief(t, 2));
      else if (forkOpen(world) && t >= FORK_TICK) {
        if (!forkHeld(world)) cmds.push(hold(t, true));
        else cmds.push(fire(t));
      }
      const held = briefingHolds(world);
      step(world, cmds);
      for (const e of world.events) {
        if (e.type !== "needWave") continue;
        cardBeforeCommit = held;
        startWave(world, e.wave, [slick(5, "cyan")], [{ beat: 1, col: 2, row: 4, kind: "mend" }]);
        cardAfterCommit = briefingHolds(world);
      }
      // The invariant the two mechanisms rest on. A world holding both is a
      // world where the pair is asked to commit to a wave that has started.
      if (forkOpen(world) && briefingHolds(world)) bothEngaged = true;
    }
    expect(bothEngaged).toBe(false);
    expect(world.wave).toBe(1);
    // The commit came out of a clear field: nothing was being read when the
    // pair said go.
    expect(cardBeforeCommit).toBe(false);
    // And the wave that starts opens on its own name before anything else, so
    // what the commit bought them was an opening. Fork first, lesson second —
    // the order under test.
    expect(cardAfterCommit).toBe(true);
  });

  it("never opens a fork under an opening, because the wave cannot progress", () => {
    const world = createWorld({ ...BOTH }, 0);
    startWave(world, 0, []);
    // An empty wave clears immediately, so without the opening this world
    // would be at a fork within `waveRestBeats`. It is up, so nothing moves.
    for (let t = 0; t < TPB * 60; t++) step(world, []);
    expect(briefingHolds(world)).toBe(true);
    expect(forkOpen(world)).toBe(false);
    expect(introHolds(world)).toBe(true);
  });

  it("closes a fork the moment a wave starts, whatever route asked for it", () => {
    const world = createWorld({ ...CFG }, 0, [slick(3, "red")]);
    for (let t = 0; t < FORK_TICK; t++) step(world, []);
    expect(forkOpen(world)).toBe(true);
    // Nobody crossed it — the test build's wave jump, or the host answering a
    // restart, starts a wave over the top of the wait. It must not survive.
    startWave(world, 4, [slick(2, "red")]);
    expect(forkOpen(world)).toBe(false);
  });
});

/**
 * Two replays, and deliberately **no pinned fingerprint** — see
 * `docs/decisions.md` #19. What is asserted here is what happened: which wave
 * is on the field, how old it is, what the hull did across the wait. A hash
 * compared against a literal would say only that something is different.
 *
 * This lane is the evidence for that rule rather than an application of it.
 * Both numbers were pinned when the work was written and both moved before it
 * landed, neither time for a reason in this file: the briefing lane put three
 * values into `hashWorld` (`brief.met`, `brief.ack`, `brief.due.length`), all
 * zero in these replays, and the creature lane then put `throbOpen` into the
 * *per-creature* part of it — which is why only the crossed replay moved the
 * second time, having a creature on the field to push it through while the
 * uncrossed one ended at a fork with nothing on it. Proving that took
 * extracting an old `hash.ts` and re-hashing the new worlds under the old
 * field order. The next lane to add a field would have paid it again, with
 * less patience, and the cheap way out of that is the one that blesses a real
 * regression.
 */
describe("the fork across a whole replay", () => {
  const crossedAt = (fireBeat: number): Replay => ({
    name: `the fork, crossed on beat ${fireBeat}`,
    seed: 0,
    ticks: FORK_TICK + TPB * 8,
    config: { forkBetweenWaves: true },
    queues: [[slick(3, "red")], [slick(5, "cyan")]],
    inputs: [hold(FORK_TICK, true), fire(FORK_TICK + TPB * fireBeat)],
  });

  const standing: Replay = {
    name: "the fork, standing",
    seed: 0,
    ticks: FORK_TICK + TPB * 8,
    config: { forkBetweenWaves: true },
    queues: [[slick(3, "red")], [slick(5, "cyan")]],
    inputs: [],
  };

  it("starts the next wave on her press, and not a beat before it", () => {
    const early = runReplay(crossedAt(2));
    const late = runReplay(crossedAt(5));
    for (const w of [early, late]) {
      expect(w.wave).toBe(1);
      expect(forkOpen(w)).toBe(false);
      // Wave 1's own creature, not wave 0's: the run really moved on.
      expect(w.creatures.map((c) => c.color)).toEqual(["cyan"]);
    }
    // The whole claim, as a number nobody had to pin: three beats later a
    // colour, three beats less of the wave. Nothing else differs between the
    // two runs, so the clock did not start the wave — she did.
    expect(early.waveBeat - late.waveBeat).toBe(3);
  });

  it("starts nothing at all while nobody crosses it", () => {
    const world = runReplay(standing);
    expect(world.wave).toBe(0);
    expect(forkOpen(world)).toBe(true);
    // Wave 1 was there to be played and was never asked for.
    expect(world.creatures).toHaveLength(0);
    // And the eight beats of waiting neither cost the hull anything nor gave
    // any of it back — a wait with no end on it must not be a repair bay.
    const atTheFork = runReplay({ ...standing, ticks: FORK_TICK });
    expect(hullPercent(world)).toBe(hullPercent(atTheFork));
    expect(hullPercent(world)).toBeLessThan(100);
  });

  it("reaches the same world twice from the same inputs", () => {
    // The property lockstep actually needs, and the only thing a fingerprint
    // is good for: two runs of one build over one list of presses.
    for (const replay of [crossedAt(2), standing]) {
      const recorded = record(replay);
      expect(hashWorld(runReplay(recorded))).toBe(recorded.expectHash!);
    }
  });
});
