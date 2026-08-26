import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { step, ticksPerBeat } from "../src/index.js";
import { mirrorHoldsControls } from "../src/mirror.js";
import { MIRROR_HOLD_BEATS, type MirrorState, type MirrorStep } from "../src/simon.js";
import type { Command, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE MIRROR's Simon rounds, played out headlessly. What is under test is the
 * loop the whole boss is: shown, answered, judged — and that a wrong answer
 * asks the same round again rather than moving on.
 */

// No regeneration: the echo strike's damage has to be readable as an exact
// number, and three hull points a second would blur it within the beat.
const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: false, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);

const ROUNDS: MirrorStep[][] = [
  ["fireRed", "guard"],
  ["cannonLeft", "cannonRight"],
];

function install(rounds: MirrorStep[][] = ROUNDS): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "mirror", rounds });
  return world;
}

function mirrorOf(world: World): MirrorState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "mirror") throw new Error("no mirror installed");
  return boss;
}

function runTo(world: World, tick: number, cmds: TimedCommand[] = []): SimEvent[] {
  const seen: SimEvent[] = [];
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    seen.push(...world.events);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

/** Run until the mirror is listening, then answer with these commands, one per tick. */
function answer(world: World, commands: Command[]): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < 5000 && mirrorOf(world).phase !== "listen"; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  for (const command of commands) {
    step(world, [{ tick: world.tick, player: 1, command }]);
    seen.push(...world.events);
  }
  return seen;
}

test("performs the round it is on, one step at a time, before it listens", () => {
  const world = install();
  const seen = runTo(world, TPB * 12);
  const shown = seen.filter((e) => e.type === "mirrorShow");
  expect(shown.map((e) => (e.type === "mirrorShow" ? e.step : ""))).toEqual(["fireRed", "guard"]);
  expect(mirrorOf(world).phase).toBe("listen");
});

test("a full correct answer breaks the mirror and moves on to the next round", () => {
  const world = install();
  answer(world, [{ kind: "fire", color: "red" }, { kind: "guard" }]);
  const m = mirrorOf(world);
  expect(m.verdict).toBe(1);
  // Two rounds, so one answered takes exactly half of it.
  expect(m.hullMilli).toBe(50_000);
  expect(m.scars.length).toBe(1);
  runTo(world, world.tick + TPB * 4);
  expect(mirrorOf(world).round).toBe(1);
});

test("a wrong step breaks the hull and asks the same round again", () => {
  const world = install();
  const before = world.hullMilli;
  answer(world, [{ kind: "guard" }]);
  const m = mirrorOf(world);
  expect(m.verdict).toBe(-1);
  expect(world.hullMilli).toBe(before - CFG.damageEcho * 1000);
  expect(world.scars.length).toBe(1);
  // Its own hull is untouched, and the round does not advance.
  expect(m.hullMilli).toBe(100_000);
  runTo(world, world.tick + TPB * 6);
  expect(mirrorOf(world).round).toBe(0);
});

test("answering every round brings it down and lets the wave end", () => {
  const world = install();
  answer(world, [{ kind: "fire", color: "red" }, { kind: "guard" }]);
  runTo(world, world.tick + TPB * 4);
  const seen = answer(world, [
    { kind: "cannonCol", col: 4 },
    { kind: "cannonCol", col: 5 },
  ]);
  expect(seen.some((e) => e.type === "mirrorVerdict" && e.right)).toBe(true);
  const after = runTo(world, world.tick + TPB * 10);
  expect(after.some((e) => e.type === "mirrorDown")).toBe(true);
  expect(world.boss).toBeNull();
  // Only now, with the boss gone, may the empty field count as cleared.
  expect(after.some((e) => e.type === "needWave")).toBe(true);
});

test("silence is a wrong answer", () => {
  const world = install([["fireRed"]]);
  for (let i = 0; i < 5000 && mirrorOf(world).phase !== "listen"; i++) step(world, []);
  const seen = runTo(world, world.tick + TPB * 12);
  expect(seen.some((e) => e.type === "mirrorVerdict" && !e.right)).toBe(true);
});

test("its own cannon stands over the ship's whenever it is not performing", () => {
  const world = install();
  // Not during the demonstration: the controls are dead then, so the cannon
  // could not have moved for it to shadow in the first place.
  while (mirrorHoldsControls(world)) step(world, []);
  step(world, [{ tick: world.tick, player: 1, command: { kind: "cannonCol", col: 1 } }]);
  runTo(world, world.tick + TPB * 2);
  expect(mirrorOf(world).cannonCol).toBe(1);
});

test("nothing the pair does counts while it is still performing", () => {
  const world = install();
  runTo(world, TPB * 3, [
    { tick: TPB * 2 + 1, player: 2, command: { kind: "fire", color: "cyan" } },
  ]);
  expect(mirrorOf(world).verdict).toBe(0);
  expect(world.scars.length).toBe(0);
});

test("the whole fight is in the fingerprint", () => {
  const a = install();
  const b = install();
  answer(a, [{ kind: "fire", color: "red" }, { kind: "guard" }]);
  answer(b, [{ kind: "fire", color: "red" }, { kind: "guard" }]);
  expect(hashWorld(a)).toBe(hashWorld(b));

  const c = install();
  answer(c, [{ kind: "guard" }]);
  expect(hashWorld(c)).not.toBe(hashWorld(a));
});

test("the controls are dead while it presents, and live the moment it stops", () => {
  const world = install();
  const startCol = world.cannonCol;
  // Through the count-in and the whole demonstration, nothing the pair does
  // reaches the ship at all — not "does not count", nothing.
  while (mirrorHoldsControls(world)) {
    step(world, [
      { tick: world.tick, player: 1, command: { kind: "cannonCol", col: 0 } },
      { tick: world.tick, player: 2, command: { kind: "fire", color: "red" } },
      { tick: world.tick, player: 1, command: { kind: "guard" } },
    ]);
    expect(world.cannonCol).toBe(startCol);
    expect(world.bullets.length).toBe(0);
  }
  expect(mirrorOf(world).phase).toBe("listen");
  // And the very next tick it is the pair's ship again.
  step(world, [{ tick: world.tick, player: 1, command: { kind: "cannonCol", col: 0 } }]);
  expect(world.cannonCol).toBe(0);
});

test("a restart still gets through while the controls are held", () => {
  const world = install();
  expect(mirrorHoldsControls(world)).toBe(true);
  const seen = [...world.events];
  step(world, [{ tick: world.tick, player: 1, command: { kind: "restart" } }]);
  seen.push(...world.events);
  expect(seen.some((e) => e.type === "needWave")).toBe(true);
});

test("the finished sequence stands for the hold before the pair's turn", () => {
  const world = install([["fireRed", "guard"]]);
  // Run to the beat the last step is performed on.
  let lastShow = -1;
  for (let i = 0; i < 5000; i++) {
    step(world, []);
    if (world.events.some((e) => e.type === "mirrorShow")) lastShow = world.beat;
    if (mirrorOf(world).phase === "listen") break;
  }
  // Its turn began a whole hold after the last thing it did, not on the beat
  // it stopped doing it.
  expect(mirrorOf(world).phaseBeat - lastShow).toBe(MIRROR_HOLD_BEATS);
});

/** Run to the pair's turn, whatever the round is. */
function toListen(world: World): void {
  for (let i = 0; i < 6000 && mirrorOf(world).phase !== "listen"; i++) step(world, []);
  expect(mirrorOf(world).phase).toBe("listen");
}

test("the bait appears with the pair's turn, and not before", () => {
  const world = install();
  // Nothing on the field while it is presenting: a pod hanging there from the
  // start of the wave is scenery by the time it matters.
  while (mirrorHoldsControls(world)) {
    expect(world.pods.length).toBe(0);
    step(world, []);
  }
  expect(mirrorOf(world).phase).toBe("listen");
  expect(world.pods.length).toBe(1);
  // Hard right and low, clear of the row and of the mirror.
  expect(world.pods[0]!.colMilli).toBe((CFG.cols - 1) * 1000);
});

/**
 * The trap only ever bites when the pair is doing the *right* thing in the
 * wrong place: a shot that matches the step but also frees the pod, a SUCK
 * that matches the step but also swallows it. Reaching for the pod with a
 * control the sequence did not ask for is an ordinary wrong step and is
 * reported as one — walking the cannon over to it fails on the walk.
 */
test("a correct shot that also frees the bait loses the round as bait", () => {
  const world = install();
  toListen(world);
  // The pod where the cannon is already aiming: this is the case the bait
  // exists for, and the only one in which it is the pod that did the damage.
  world.pods[0]!.colMilli = world.cannonCol * 1000;
  const col = world.cannonCol;

  const seen: SimEvent[] = [];
  for (let i = 0; i < 400 && mirrorOf(world).verdict === 0; i++) {
    const cmds: TimedCommand[] =
      i === 0 ? [{ tick: world.tick, player: 2, command: { kind: "fire", color: "red" } }] : [];
    step(world, cmds);
    seen.push(...world.events);
  }
  // The shot itself was the sequence's first step and matched it.
  expect(seen.some((e) => e.type === "mirrorEcho" && e.step === "fireRed")).toBe(true);
  expect(seen).toContainEqual({ type: "mirrorVerdict", right: false, col, reason: "bait" });
});

test("a correct SUCK that also swallows the bait loses the round as bait", () => {
  // Not a one-step round: a SUCK that completes the sequence settles it as a
  // win before the pod has finished being swallowed, and then there is no
  // round left for the bait to take.
  const world = install([["intake", "guard"]]);
  toListen(world);
  const pod = world.pods[0]!;
  pod.loose = true;
  pod.colMilli = world.cannonCol * 1000;
  pod.rowMilli = (CFG.rows - 1) * 1000;

  const seen: SimEvent[] = [];
  for (let i = 0; i < 200 && mirrorOf(world).verdict === 0; i++) {
    const cmds: TimedCommand[] =
      i === 0 ? [{ tick: world.tick, player: 1, command: { kind: "intake" } }] : [];
    step(world, cmds);
    seen.push(...world.events);
  }
  expect(seen.some((e) => e.type === "mirrorVerdict" && !e.right && e.reason === "bait")).toBe(
    true,
  );
});

test("running out of time is its own reason, not a wrong step", () => {
  const world = install();
  toListen(world);
  const seen: SimEvent[] = [];
  for (let i = 0; i < 4000 && mirrorOf(world).verdict === 0; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  expect(seen.some((e) => e.type === "mirrorVerdict" && e.reason === "silence")).toBe(true);
});
