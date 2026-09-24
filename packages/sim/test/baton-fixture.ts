import { expect } from "bun:test";
import {
  type BatonBead,
  type BatonState,
  batonBoss,
  batonDark,
  batonLaunchable,
  batonMayStrip,
  batonMergeSocket,
  batonSocketCol,
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE BATON's test rig: the arm installed, and the handovers, strips and
 * draws that drive it. Shared by `baton-hand.test.ts`, which is the two
 * thumbs' rules, and `baton-doubled.test.ts`, which is THE SLOW over them.
 */

export const CFG: SimConfig = DEFAULT_CONFIG;
export const TPB = ticksPerBeat(CFG);

/** The arm installed on its own wave, as `baton.test.ts` opens it. */
export function open(cfg: SimConfig = CFG): World {
  const world = createWorld(cfg, 3);
  startWave(world, 6, [], [], { kind: "baton" });
  return world;
}

/**
 * The same arm with nothing shedding off it. The draw is eleven handovers
 * down the arm, and a shell let go in the middle of them is a rock nobody in
 * a test is warding — which fails the wave and stops the fight (the owner's
 * rule of 12 September 2026, `wave-fail.ts`). The swell has its own receipts
 * above; these are about the last two sockets.
 */
export const QUIET: SimConfig = { ...CFG, batonShedAfter: CFG.batonSockets + 1 };

export function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("THE BATON is not the boss");
  return b;
}

/** The bead in the air, if one is. */
export function flying(world: World): BatonBead | null {
  return arm(world).beads.find((bead) => bead.flying) ?? null;
}

export function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

export function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** Run until the arm reaches a stage, or give up. Returns the beats it took. */
export function until(world: World, stage: BatonState["stage"], cap = 40): number {
  const from = world.beat;
  for (let i = 0; i < cap * TPB; i++) {
    if (arm(world).stage === stage) return world.beat - from;
    step(world, []);
  }
  throw new Error(`the arm never reached ${stage}`);
}

/** Run until no bead is in the air. */
export function landed(world: World): void {
  for (let i = 0; i < 40 * TPB && flying(world) !== null; i++) step(world, []);
  if (flying(world) !== null) throw new Error("the bead never came down");
}

/** Player 1 under the bead the trigger will send, then the trigger: it is in the air. */
export function launch(world: World): BatonBead {
  until(world, "passing");
  const next = batonLaunchable(CFG, arm(world));
  if (next === null) throw new Error("nothing to launch");
  step(world, [
    cmd(world, 1, { kind: "cannonCol", col: batonSocketCol(arm(world), next.socket) }),
    cmd(world, 1, { kind: "guard" }),
  ]);
  const bead = flying(world);
  if (bead === null) throw new Error("the trigger sent nothing");
  return bead;
}

/** Player 2's bolt, and the ticks until it reaches the bead or the bead lands. */
export function shoot(world: World, color: "red" | "cyan"): void {
  step(world, [cmd(world, 2, { kind: "fire", color })]);
  for (let i = 0; i < CFG.batonFlightBeats * TPB; i++) {
    if (world.bullets.length === 0) return;
    step(world, []);
  }
}

/** One whole handover, right colour: launched, struck, landed. */
export function handover(world: World): void {
  const bead = launch(world);
  shoot(world, bead.color);
  expect(bead.struck).toBe(true);
  landed(world);
}

/** A thumb down on, or up off, a socket of the arm. */
export function thumb(world: World, player: 1 | 2, socket: number, on: boolean): TimedCommand {
  return cmd(world, player, {
    kind: "drag",
    target: "batonSocket",
    on,
    fromMilli: 0,
    fromYMilli: 0,
    id: socket,
  });
}

/** Handovers until a shell is coming away, and the socket it is coming off. */
export function swelling(world: World): number {
  for (let i = 0; i < 30 && batonDark(arm(world)) < CFG.batonShedAfter; i++) handover(world);
  for (let i = 0; i < 40 * TPB && arm(world).swellSocket < 0; i++) step(world, []);
  const socket = arm(world).swellSocket;
  expect(socket).toBeGreaterThanOrEqual(0);
  return socket;
}

/**
 * That seat acted, so the beat has it locked out of the ship — which is what
 * makes it the one seat that may reach the arm (`batonMayStrip`). Player 1's
 * act is the trigger and player 2's is a shot, whatever it met.
 */
export function acts(world: World, player: 1 | 2): void {
  step(world, [
    player === 1 ? cmd(world, 1, { kind: "guard" }) : cmd(world, 2, { kind: "fire", color: "red" }),
  ]);
  expect(batonMayStrip(arm(world), player, world.beat)).toBe(true);
}

/** Every press the shell asks for, each a fresh thumb, the last left down. */
export function strips(world: World, player: 1 | 2, socket: number): void {
  for (let i = 0; i < CFG.batonSwellStrips; i++) {
    if (i > 0) step(world, [thumb(world, player, socket, false)]);
    step(world, [thumb(world, player, socket, true)]);
  }
}

/** Handovers until both beads are at rest in the last two sockets. */
export function merging(world: World): void {
  for (let i = 0; i < 40 && arm(world).stage !== "merging"; i++) handover(world);
  expect(arm(world).stage).toBe("merging");
}

/** Both thumbs down, for `n` beats or until the arm is done with them. */
export function bothDown(world: World, n: number): void {
  const p1 = batonMergeSocket(CFG, 1);
  const p2 = batonMergeSocket(CFG, 2);
  for (let i = 0; i < n * TPB && arm(world).stage === "merging"; i++) {
    step(world, [thumb(world, 1, p1, true), thumb(world, 2, p2, true)]);
  }
}

/** Every event said over `n` beats, since `world.events` is one step's worth. */
export function said(world: World, n: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) out.add(e.type);
  }
  return out;
}

/** Step to the top of the next beat. */
export function nextBeat(world: World): void {
  const from = world.beat;
  while (world.beat === from || world.tick % TPB !== 0) step(world, []);
}

/** The act the crossing is owed on this beat, from the seat that owes it. */
export function act(world: World): void {
  const b = arm(world);
  const bead = b.beads[0];
  if (bead === undefined) throw new Error("no bead on the crossing");
  if (b.acts % 2 === 1) {
    shoot(world, bead.color);
    return;
  }
  step(world, [
    cmd(world, 1, { kind: "cannonCol", col: batonSocketCol(b, bead.socket) }),
    cmd(world, 1, { kind: "guard" }),
  ]);
}

/** Drawn together and launched: the merged bead is on the crossing. */
export function crossing(world: World): void {
  merging(world);
  bothDown(world, world.cfg.batonMergeWindowBeats);
  launch(world);
  expect(arm(world).stage).toBe("crossing");
}
