import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { step, ticksPerBeat } from "../src/index.js";
import { mirrorAsks } from "../src/mirror-hand.js";
import type { MirrorState, MirrorStep } from "../src/simon.js";
import type { TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE MIRROR's lobes answering a touch the way every mark does: which lobe
 * the round asks of which seat (`mirrorAsks`), a step on a lobe said with the
 * lobe it was made on (`mirrorTouch`), and a press on a lobe asked of the
 * other seat refused and said (`mirrorRefuse`) — `mirror-hand.ts`.
 * `mirror-gestures.test.ts` holds the gestures themselves.
 */

const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);

const ROUNDS: MirrorStep[][] = [
  ["guard"],
  ["cannonLeft", "intake", "guard", "fireRed", "fireCyan", "cannonRight"],
];

function install(): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "mirror", rounds: ROUNDS });
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

function toLastRound(world: World): void {
  toListen(world);
  send(world, { tick: 0, player: 1, command: { kind: "guard" } });
  for (let i = 0; i < 4 * TPB; i++) step(world, []);
  toListen(world);
  expect(mirrorOf(world).round).toBe(1);
}

function toHold(world: World): void {
  toLastRound(world);
  send(world, lobe(1, 0, false, -CFG.mirrorCarryMilli));
  send(world, lobe(1, 0, false, 100));
  send(world, lobe(1, 1, true));
  send(world, lobe(2, 0, false, -CFG.mirrorCarryMilli));
  send(world, lobe(2, 0, false, CFG.mirrorCarryMilli));
  send(world, lobe(1, 0, false, CFG.mirrorCarryMilli));
  for (let i = 0; i < 4 * TPB; i++) step(world, []);
  expect(mirrorOf(world).phase).toBe("hold");
}

const said = (seen: SimEvent[], type: SimEvent["type"]) => seen.filter((e) => e.type === type);

test("the lobes asked of each seat: none on the panel's rounds or while it performs", () => {
  const world = install();
  toListen(world);
  expect(mirrorAsks(mirrorOf(world), 1)).toEqual([]);
  toLastRound(world);
  expect(mirrorAsks(mirrorOf(world), 1)).toEqual([0, 1]);
  expect(mirrorAsks(mirrorOf(world), 2)).toEqual([0]);
  mirrorOf(world).phase = "show";
  expect(mirrorAsks(mirrorOf(world), 1)).toEqual([]);
  const held = install();
  toHold(held);
  expect(mirrorAsks(mirrorOf(held), 1)).toEqual([0]);
  expect(mirrorAsks(mirrorOf(held), 2)).toEqual([1]);
});

test("a step on a lobe is said with the lobe it was made on, right or wrong", () => {
  const world = install();
  toLastRound(world);
  const right = send(world, lobe(1, 0, false, -CFG.mirrorCarryMilli));
  expect(said(right, "mirrorTouch")).toEqual([
    { type: "mirrorTouch", col: mirrorOf(world).cannonCol, id: 0, right: true },
  ]);
  // The next step is `intake`; a press on its shield is `guard`, the wrong one.
  const wrong = send(world, lobe(1, 1, true));
  expect(said(wrong, "mirrorTouch")).toEqual([
    { type: "mirrorTouch", col: world.shieldCol, id: 1, right: false },
  ]);
  expect(said(wrong, "mirrorVerdict")).toHaveLength(1);
});

test("a press nobody is asked for says nothing", () => {
  const world = install();
  toListen(world);
  const seen = send(world, lobe(1, 1, true), lobe(2, 1, true));
  expect(said(seen, "mirrorTouch")).toEqual([]);
  expect(said(seen, "mirrorRefuse")).toEqual([]);
});

test("under reflect player 2's press on its shield is refused, once, and nothing moves", () => {
  const world = install();
  toLastRound(world);
  const matched = mirrorOf(world).matched;
  const seen = send(world, lobe(2, 1, true));
  expect(said(seen, "mirrorRefuse")).toEqual([
    { type: "mirrorRefuse", col: world.shieldCol, id: 1, player: 2 },
  ]);
  expect(said(seen, "mirrorVerdict")).toEqual([]);
  expect(mirrorOf(world).matched).toBe(matched);
  // The lift is no press, and no second refusal.
  expect(said(send(world, lobe(2, 1, false)), "mirrorRefuse")).toEqual([]);
});

test("under the pin each seat's press on the other's lobe is refused, and pins nothing", () => {
  const world = install();
  toHold(world);
  const seen = send(world, lobe(1, 1, true), lobe(2, 0, true));
  expect(
    said(seen, "mirrorRefuse").map((e) => e.type === "mirrorRefuse" && [e.id, e.player]),
  ).toEqual([
    [1, 1],
    [0, 2],
  ]);
  expect(mirrorOf(world).holdThumbs).toBe(0);
  expect(said(seen, "mirrorGrip")).toEqual([]);
});
