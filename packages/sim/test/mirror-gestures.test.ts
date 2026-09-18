import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { step, ticksPerBeat } from "../src/index.js";
import { MIRROR_GESTURES, type MirrorState, type MirrorStep, mirrorGesture } from "../src/simon.js";
import type { Command, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE MIRROR's three gestures (`MIRROR_GESTURES`, `simon.ts`): the rounds
 * before the last answered on the panel, the last given back on the mirror's
 * own ship (`mirror-hand.ts`), and the pin — both thumbs on its two lobes —
 * that brings it down. `mirror.test.ts` holds the round; this file holds
 * *where* a round is answered, and that the wrong place is its own verdict.
 */

const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);

const ROUNDS: MirrorStep[][] = [
  ["guard"],
  ["cannonLeft", "intake", "guard", "fireRed", "fireCyan", "cannonRight"],
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

function toListen(world: World): void {
  for (let i = 0; i < 5000 && mirrorOf(world).phase !== "listen"; i++) step(world, []);
  expect(mirrorOf(world).phase).toBe("listen");
}

function runBeats(world: World, beats: number): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < beats * TPB; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

function lobe(player: 1 | 2, id: 0 | 1, on: boolean, fromMilli = 0): TimedCommand {
  return { tick: 0, player, command: { kind: "drag", target: "mirrorLobe", on, fromMilli, id } };
}

function send(world: World, ...cmds: TimedCommand[]): SimEvent[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return [...world.events];
}

/** Answer round 0 on the panel and run into round 1's listen. */
function toLastRound(world: World): void {
  toListen(world);
  send(world, { tick: 0, player: 1, command: { kind: "guard" } });
  expect(mirrorOf(world).verdict).toBe(1);
  runBeats(world, 4);
  toListen(world);
  expect(mirrorOf(world).round).toBe(1);
}

test("the gesture is the round's: answer, then reflect on the last, then hold", () => {
  const world = install();
  const m = mirrorOf(world);
  expect(MIRROR_GESTURES).toEqual(["answer", "reflect", "hold"]);
  expect(mirrorGesture(m)).toBe("answer");
  m.round = 1;
  expect(mirrorGesture(m)).toBe("reflect");
  m.phase = "hold";
  expect(mirrorGesture(m)).toBe("hold");
});

test("the last round is answered on the mirror's own lobes, six steps as six thumbs", () => {
  const world = install();
  toLastRound(world);
  const seen: SimEvent[] = [];
  // Player 1 carries its cannon left; taps it; presses its shield.
  seen.push(...send(world, lobe(1, 0, false, -CFG.mirrorCarryMilli)));
  seen.push(...send(world, lobe(1, 0, false, 100)));
  seen.push(...send(world, lobe(1, 1, true)));
  // Player 2 swipes its muzzle left for red and right for cyan.
  seen.push(...send(world, lobe(2, 0, false, -CFG.mirrorCarryMilli)));
  seen.push(...send(world, lobe(2, 0, false, CFG.mirrorCarryMilli)));
  // Player 1 carries its cannon right.
  seen.push(...send(world, lobe(1, 0, false, CFG.mirrorCarryMilli)));
  const echoed = seen
    .filter((e) => e.type === "mirrorEcho")
    .map((e) => (e.type === "mirrorEcho" ? e.step : ""));
  expect(echoed).toEqual([...(ROUNDS[1] ?? [])]);
  expect(seen.some((e) => e.type === "mirrorVerdict" && e.right)).toBe(true);
});

test("a step made on the panel under the last round is wrong, and the verdict says where", () => {
  const world = install();
  toLastRound(world);
  const seen = send(world, {
    tick: 0,
    player: 1,
    command: { kind: "cannonCol", col: world.cannonCol - 1 },
  });
  expect(seen.some((e) => e.type === "mirrorVerdict" && !e.right && e.reason === "panel")).toBe(
    true,
  );
  expect(world.scars.length).toBe(1);
});

test("a thumb on its lobes under an ordinary round is nothing, right or wrong", () => {
  const world = install();
  toListen(world);
  const seen = send(world, lobe(1, 1, true), lobe(2, 0, false, -CFG.mirrorCarryMilli));
  expect(seen.filter((e) => e.type === "mirrorEcho" || e.type === "mirrorVerdict")).toEqual([]);
  expect(mirrorOf(world).matched).toBe(0);
});

test("the wrong seat's thumb on a lobe says nothing", () => {
  const world = install();
  toLastRound(world);
  // Player 2 on its shield is not a guard, and player 1 on its cannon is not
  // a colour: neither is a step, so neither is a wrong one.
  const seen = send(world, lobe(2, 1, true), lobe(1, 1, false));
  expect(seen.some((e) => e.type === "mirrorVerdict")).toBe(false);
  expect(mirrorOf(world).matched).toBe(0);
  // Player 1's tap on its cannon is the maw, and `intake` is not the first step.
  send(world, lobe(1, 0, false, 100));
  expect(mirrorOf(world).verdict).toBe(-1);
});

/** Bring the fight to `hold`: both rounds answered. */
function toHold(world: World): void {
  toLastRound(world);
  send(world, lobe(1, 0, false, -CFG.mirrorCarryMilli));
  send(world, lobe(1, 0, false, 100));
  send(world, lobe(1, 1, true));
  send(world, lobe(2, 0, false, -CFG.mirrorCarryMilli));
  send(world, lobe(2, 0, false, CFG.mirrorCarryMilli));
  send(world, lobe(1, 0, false, CFG.mirrorCarryMilli));
  runBeats(world, 4);
  expect(mirrorOf(world).phase).toBe("hold");
  expect(mirrorOf(world).hullMilli).toBe(0);
}

test("both thumbs pinning it for the hold beats bring it down", () => {
  const world = install();
  toHold(world);
  const grip = send(world, lobe(1, 0, true), lobe(2, 1, true));
  expect(grip.some((e) => e.type === "mirrorGrip" && e.on)).toBe(true);
  expect(mirrorOf(world).holdThumbs).toBe(3);
  const seen = runBeats(world, CFG.mirrorHoldBeats + 1);
  expect(seen.some((e) => e.type === "mirrorDown")).toBe(true);
  expect(world.boss).toBeNull();
  expect(world.pods).toEqual([]);
});

test("one thumb is not a pin", () => {
  const world = install();
  toHold(world);
  const seen = send(world, lobe(1, 0, true));
  expect(seen.some((e) => e.type === "mirrorGrip")).toBe(false);
  runBeats(world, CFG.mirrorHoldBeats + 1);
  expect(mirrorOf(world).phase).toBe("hold");
});

test("a lift restarts the count", () => {
  const world = install();
  toHold(world);
  send(world, lobe(1, 0, true), lobe(2, 1, true));
  runBeats(world, CFG.mirrorHoldBeats - 1);
  const lift = send(world, lobe(2, 1, false));
  expect(lift.some((e) => e.type === "mirrorGrip" && !e.on)).toBe(true);
  expect(mirrorOf(world).holdBeat).toBe(-1);
  runBeats(world, 1);
  expect(mirrorOf(world).phase).toBe("hold");
  send(world, lobe(2, 1, true));
  runBeats(world, CFG.mirrorHoldBeats - 1);
  expect(mirrorOf(world).phase).toBe("hold");
  runBeats(world, 2);
  expect(world.boss).toBeNull();
});

test("the other seat's thumb on a lobe is not the pin", () => {
  const world = install();
  toHold(world);
  send(world, lobe(2, 0, true), lobe(1, 1, true));
  expect(mirrorOf(world).holdThumbs).toBe(0);
  runBeats(world, CFG.mirrorHoldBeats + 1);
  expect(mirrorOf(world).phase).toBe("hold");
});

test("a pin that never comes is silence, and the wave is lost to it", () => {
  const world = install();
  toHold(world);
  const seen = runBeats(world, CFG.mirrorHoldWindowBeats + 1);
  expect(seen.some((e) => e.type === "mirrorVerdict" && !e.right && e.reason === "silence")).toBe(
    true,
  );
  expect(world.scars.length).toBe(1);
});

test("the pin is in the fingerprint", () => {
  const a = install();
  const b = install();
  toHold(a);
  toHold(b);
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, lobe(1, 0, true));
  expect(hashWorld(a)).not.toBe(hashWorld(b));
  send(b, lobe(1, 0, true));
  expect(hashWorld(a)).toBe(hashWorld(b));
});

test("a command reaching a listening mirror is the same on the picture as on the panel", () => {
  const cmd: Command = { kind: "drag", target: "mirrorLobe", on: false, fromMilli: -900, id: 0 };
  const world = install([["guard"], ["cannonLeft"]]);
  toLastRound(world);
  const seen = send(world, { tick: 0, player: 1, command: cmd });
  expect(seen.some((e) => e.type === "mirrorVerdict" && e.right)).toBe(true);
});
