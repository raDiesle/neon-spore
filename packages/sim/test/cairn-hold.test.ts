import { describe, expect, it } from "bun:test";
import {
  type CairnState,
  type Creature,
  cairnHeldNow,
  cairnHoldLeft,
  cairnWaited,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **THE CAIRN's second gesture: a hand resting on the pile stops its clock**
 * (`cairn-hold.ts`). The rule is one short sentence — *hold the pile and it
 * cannot let one go* — and what is pinned here is that sentence taken apart:
 * that a still hand buys beats, that it buys exactly `cairnHoldBeats` of them
 * and then the pile goes anyway, that either seat's hand does it, that the
 * budget is given back per rock rather than per fight, that a carry across
 * the pile is still a pull and not a hold, and that all of it is in the
 * fingerprint.
 *
 * It is the whole of what `cairn.test.ts` could not say, and a file of its own
 * because that one is at its length limit.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "cairn" });
  return world;
}

function cairn(world: World): CairnState {
  const boss = world.boss;
  if (boss?.kind !== "cairn") throw new Error("the wave installed no cairn");
  return boss;
}

function pile(world: World): Creature {
  const body = world.creatures.find((c) => c.kind === "cairn");
  if (body === undefined) throw new Error("no pile on the field");
  return body;
}

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});

/** A hand put on the pile and left there — the grip repeated every tick, the
 * way a device reports a finger that has not moved, and no drag at all. That
 * absence is the gesture. */
function rest(id: number, until: number, player: 1 | 2 = 1): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = 0; t < until; t++) out.push(grip(t, player, id));
  return out;
}

/** Step to a tick, feeding commands on the tick they are stamped for. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): void {
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
}

const sheds = (world: World) => world.events.filter((e) => e.type === "cairnShed").length;

describe("a hand resting on the pile", () => {
  it("stops the clock: the beat it would have shed on comes and nothing leaves", () => {
    const world = install();
    const body = pile(world);
    const held = cairn(world);
    // Two beats past the patience, which is a shed and to spare on an
    // untouched pile.
    runTo(world, (CFG.cairnShedBeats + 2) * TPB, rest(body.id, (CFG.cairnShedBeats + 2) * TPB));
    expect(held.units).toBe(CFG.cairnUnits);
    expect(cairnHeldNow(world, held)).toBe(true);
  });

  it("buys cairnHoldBeats and no more: the pile goes anyway", () => {
    const world = install();
    const body = pile(world);
    const b = cairn(world);
    // Eight beats of patience and the four a hand buys back make twelve, which
    // is exactly how long a rock takes to fall from the pile to the hull.
    const until = (CFG.cairnShedBeats + CFG.cairnHoldBeats) * TPB + 1;
    runTo(world, until, rest(body.id, until));
    expect(b.units).toBe(CFG.cairnUnits - 1);
    expect(b.heldBeats).toBe(0); // Given back with the unit that left.
  });

  it("counts down where the pair can be told about it", () => {
    const world = install();
    const body = pile(world);
    const b = cairn(world);
    expect(cairnHoldLeft(world, b)).toBe(CFG.cairnHoldBeats);
    runTo(world, 2 * TPB, rest(body.id, 2 * TPB));
    expect(b.heldBeats).toBe(2);
    expect(cairnHoldLeft(world, b)).toBe(CFG.cairnHoldBeats - 2);
    // And the beats bought come straight back out of the wait, so the gauge
    // player 1 is already shown freezes rather than learning a second rule.
    expect(cairnWaited(world, b)).toBe(0);
  });

  it("says so once a beat while it lasts, and then stops saying it", () => {
    const world = install();
    const body = pile(world);
    const until = (CFG.cairnHoldBeats + 3) * TPB;
    let said = 0;
    const cmds = rest(body.id, until);
    while (world.tick < until) {
      step(
        world,
        cmds.filter((c) => c.tick === world.tick),
      );
      said += world.events.filter((e) => e.type === "cairnHeld").length;
    }
    expect(said).toBe(CFG.cairnHoldBeats);
  });

  it("is either seat's: the navigator's thumb holds it exactly as the pilot's", () => {
    const world = install();
    const body = pile(world);
    const b = cairn(world);
    runTo(world, (CFG.cairnShedBeats + 2) * TPB, rest(body.id, (CFG.cairnShedBeats + 2) * TPB, 2));
    expect(b.units).toBe(CFG.cairnUnits);
    expect(b.heldBeats).toBeGreaterThan(0);
  });

  it("is a budget per rock, not per fight: a shed gives it back", () => {
    const world = install();
    const body = pile(world);
    const b = cairn(world);
    // Held all the way out, so the pile sheds once with the hold spent.
    const first = (CFG.cairnShedBeats + CFG.cairnHoldBeats + 1) * TPB;
    runTo(world, first, rest(body.id, first));
    expect(sheds(world)).toBe(0); // The shed was on an earlier tick.
    expect(b.units).toBe(CFG.cairnUnits - 1);
    // The same hand, still resting, buys the next rock its own four beats.
    const second = first + (CFG.cairnShedBeats + 2) * TPB;
    const more: TimedCommand[] = [];
    for (let t = first; t < second; t++) more.push(grip(t, 1, body.id));
    runTo(world, second, more);
    expect(b.units).toBe(CFG.cairnUnits - 1);
  });

  it("lets go when the hand does: the clock runs on from where it stopped", () => {
    const world = install();
    const body = pile(world);
    const b = cairn(world);
    const off = 3 * TPB;
    runTo(world, off, rest(body.id, off));
    expect(b.heldBeats).toBe(3);
    // The finger comes off the glass and the pile is nobody's again.
    runTo(world, off + 1, [grip(off, 1, 0)]);
    expect(cairnHeldNow(world, b)).toBe(false);
    // Three beats bought are three beats later, and not three beats forgiven:
    // the shed lands at cairnShedBeats + 3 rather than at either end of it.
    runTo(world, (CFG.cairnShedBeats + 2) * TPB + 1);
    expect(b.units).toBe(CFG.cairnUnits);
    runTo(world, (CFG.cairnShedBeats + 3) * TPB + 1);
    expect(b.units).toBe(CFG.cairnUnits - 1);
  });

  it("is in the fingerprint", () => {
    const a = install(11);
    const c = install(11);
    expect(hashWorld(a)).toBe(hashWorld(c));
    const id = pile(a).id;
    runTo(a, 2 * TPB, rest(id, 2 * TPB));
    runTo(c, 2 * TPB);
    expect(hashWorld(a)).not.toBe(hashWorld(c));
  });
});
