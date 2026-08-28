import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  type PodEntry,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import { NO_SHELL } from "../src/shell.js";

/**
 * Complaint 3 of the swallow: a power-up must count as taken the moment it
 * is swallowed, not once some later, purely visual moment finishes. It
 * already does — `resolveIntake` (`pods.ts`) applies `mend`/`purge`/`ward`
 * synchronously, on the same tick the pod's row crosses the hull, well
 * before `SwallowFx`'s cosmetic chew-then-flash even starts playing in
 * render/. This file pins that down as a guarantee rather than an accident
 * of reading the source once, and closes the one real gap behind the
 * complaint: `world.wardUntilTick` — the fact that decides whether a ward is
 * still live — was missing from `hashWorld`, so two devices could disagree
 * about a shield the desync ledger would never have caught.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false, podDriftTilesPerBeat: 0 };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
const POD_COL = 3;
const ARRIVAL = Math.ceil((TPB * (HULL - 4)) / CFG.podFallTilesPerBeat) + TPB * 4;

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color: "red" },
});
const intake = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});

/** Free the pod, then hold the column and the maw open for the whole fall. */
function hold(col: number): TimedCommand[] {
  const inputs: TimedCommand[] = [aim(2, POD_COL), fire(TPB + 4)];
  for (let t = TPB * 2; t < ARRIVAL; t += 20) {
    inputs.push(aim(t, col));
    inputs.push(intake(t));
  }
  return inputs;
}

function runTicked(
  pods: PodEntry[],
  inputs: TimedCommand[],
): { world: ReturnType<typeof createWorld>; ticksToTaken: number; events: SimEvent[][] } {
  const world = createWorld({ ...CFG }, 0, [], pods);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[][] = [];
  let ticksToTaken = -1;
  for (let t = 0; t < ARRIVAL; t++) {
    step(world, byTick.get(t) ?? []);
    events.push([...world.events]);
    if (ticksToTaken < 0 && world.events.some((e) => e.type === "podTaken")) ticksToTaken = t;
  }
  return { world, ticksToTaken, events };
}

describe("a pod's effect lands the instant it is swallowed", () => {
  it("mend: hullMilli is already repaired on the podTaken tick, not later", () => {
    const world = createWorld({ ...CFG }, 0, [], [{ beat: 0, col: POD_COL, row: 4, kind: "mend" }]);
    world.hullMilli = 40_000;
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of hold(POD_COL)) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    let takenTick = -1;
    let hullAtTaken = -1;
    for (let t = 0; t < ARRIVAL; t++) {
      step(world, byTick.get(t) ?? []);
      if (takenTick < 0 && world.events.some((e) => e.type === "podTaken")) {
        takenTick = t;
        hullAtTaken = world.hullMilli;
      }
    }
    expect(takenTick).toBeGreaterThan(0);
    // Repaired by the very tick of the catch — not the tick after, and not
    // waiting for the ~0.58s of chew that plays out afterwards in render/.
    expect(hullAtTaken).toBeGreaterThan(40_000);
    expect(world.pods).toHaveLength(0);
  });

  it("ward: the shield is already armed one tick after the catch, with no guard command", () => {
    const { world, ticksToTaken } = runTicked(
      [{ beat: 0, col: POD_COL, row: 4, kind: "ward" }],
      hold(POD_COL),
    );
    expect(ticksToTaken).toBeGreaterThan(0);
    expect(world.tick).toBeLessThanOrEqual(world.wardUntilTick);
  });

  it("purge: the field is already empty the instant the pod lands, before any receipt plays", () => {
    const world = createWorld(
      { ...CFG },
      0,
      [],
      [{ beat: 0, col: POD_COL, row: 4, kind: "purge" }],
    );
    world.creatures.push({
      id: world.nextId++,
      kind: "slick",
      col: 5,
      row: 0,
      fromRow: -1,
      color: "red",
      holes: 0,
      petals: 0,
      dragMilli: 0,
      throbOpen: false,
      shell: NO_SHELL,
    });
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of hold(POD_COL)) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    for (let t = 0; t < ARRIVAL; t++) {
      step(world, byTick.get(t) ?? []);
      if (world.events.some((e) => e.type === "podTaken")) {
        // Same tick: the field is already clear, not merely about to be.
        expect(world.creatures).toHaveLength(0);
        return;
      }
    }
    throw new Error("pod was never taken");
  });
});

describe("wardUntilTick and the desync ledger", () => {
  it("is part of hashWorld — two worlds that differ only in it must not hash the same", () => {
    const a = createWorld({ ...CFG }, 0, [], []);
    const b = createWorld({ ...CFG }, 0, [], []);
    b.wardUntilTick = a.wardUntilTick + 1000;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
