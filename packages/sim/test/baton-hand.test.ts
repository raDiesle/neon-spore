import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SHED,
  BATON_SOCKET_SWELL,
  type BatonBead,
  type BatonState,
  batonBoss,
  batonDark,
  batonDrawing,
  batonLaunchable,
  batonMayStrip,
  batonMergeSocket,
  batonSocketCol,
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
 * **THE BATON's two thumbs on its own arm** — the states answered on the
 * picture rather than the panel (`.claude/skills/new-boss` §6.2,
 * `src/baton-hand.ts`).
 *
 * One receipt per rule, and the two that matter most are the two that decide
 * *who*: the strip is the **locked** seat's, so it moves from phone to phone
 * every beat, and the draw takes **both** thumbs at once, which is the one
 * thing this fight has never let the pair do.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/** The arm installed on its own wave, as `baton.test.ts` opens it. */
function open(cfg: SimConfig = CFG): World {
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
const QUIET: SimConfig = { ...CFG, batonShedAfter: CFG.batonSockets + 1 };

function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("THE BATON is not the boss");
  return b;
}

/** The bead in the air, if one is. */
function flying(world: World): BatonBead | null {
  return arm(world).beads.find((bead) => bead.flying) ?? null;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** Run until the arm reaches a stage, or give up. Returns the beats it took. */
function until(world: World, stage: BatonState["stage"], cap = 40): number {
  const from = world.beat;
  for (let i = 0; i < cap * TPB; i++) {
    if (arm(world).stage === stage) return world.beat - from;
    step(world, []);
  }
  throw new Error(`the arm never reached ${stage}`);
}

/** Run until no bead is in the air. */
function landed(world: World): void {
  for (let i = 0; i < 40 * TPB && flying(world) !== null; i++) step(world, []);
  if (flying(world) !== null) throw new Error("the bead never came down");
}

/** Player 1 under the bead the trigger will send, then the trigger: it is in the air. */
function launch(world: World): BatonBead {
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
function shoot(world: World, color: "red" | "cyan"): void {
  step(world, [cmd(world, 2, { kind: "fire", color })]);
  for (let i = 0; i < CFG.batonFlightBeats * TPB; i++) {
    if (world.bullets.length === 0) return;
    step(world, []);
  }
}

/** One whole handover, right colour: launched, struck, landed. */
function handover(world: World): void {
  const bead = launch(world);
  shoot(world, bead.color);
  expect(bead.struck).toBe(true);
  landed(world);
}

/** A thumb down on, or up off, a socket of the arm. */
function thumb(world: World, player: 1 | 2, socket: number, on: boolean): TimedCommand {
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
function swelling(world: World): number {
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
function acts(world: World, player: 1 | 2): void {
  step(world, [
    player === 1 ? cmd(world, 1, { kind: "guard" }) : cmd(world, 2, { kind: "fire", color: "red" }),
  ]);
  expect(batonMayStrip(arm(world), player, world.beat)).toBe(true);
}

describe("THE BATON's strip", () => {
  it("swells a dead socket before it lets go, and the rock is the same count away", () => {
    const world = open();
    const socket = swelling(world);
    const b = arm(world);
    expect(b.sockets[socket]).toBe(BATON_SOCKET_SWELL);
    expect(world.creatures.some((c) => c.kind === "meteor")).toBe(false);
    beats(world, CFG.batonSwellBeats);
    expect(b.sockets[socket]).toBe(BATON_SOCKET_SHED);
    expect(world.creatures.some((c) => c.kind === "meteor")).toBe(true);
  });

  it("is the locked seat's: their press takes the shell and nothing falls", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    step(world, [thumb(world, 2, socket, true)]);
    const b = arm(world);
    expect(b.sockets[socket]).toBe(BATON_SOCKET_SHED);
    expect(b.swellSocket).toBe(-1);
    expect(world.events.some((e) => e.type === "batonStripped")).toBe(true);
    beats(world, CFG.batonSwellBeats);
    expect(world.creatures.some((c) => c.kind === "meteor")).toBe(false);
  });

  it("refuses the seat that is not locked, out loud, and leaves the shell on", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    step(world, [thumb(world, 1, socket, true)]);
    const b = arm(world);
    expect(b.sockets[socket]).toBe(BATON_SOCKET_SWELL);
    expect(b.swellSocket).toBe(socket);
    expect(world.events.some((e) => e.type === "batonRefused")).toBe(true);
    expect(world.events.some((e) => e.type === "batonStripped")).toBe(false);
  });

  it("answers only the socket the shell is on, so a thumb elsewhere strips nothing", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    step(world, [thumb(world, 2, socket + 1, true)]);
    expect(arm(world).sockets[socket]).toBe(BATON_SOCKET_SWELL);
    expect(world.events.some((e) => e.type === "batonStripped")).toBe(false);
  });

  it("is not swallowed by the lock it depends on", () => {
    // The whole gesture would be unreachable if `batonLocks` counted it as a
    // verb reaching the ship: the only seat allowed to strip is the one every
    // other verb is being taken off (`sim/baton-press.ts`).
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    step(world, [thumb(world, 2, socket, true)]);
    expect(world.events.some((e) => e.type === "batonStripped")).toBe(true);
  });
});

/** Handovers until both beads are at rest in the last two sockets. */
function merging(world: World): void {
  for (let i = 0; i < 40 && arm(world).stage !== "merging"; i++) handover(world);
  expect(arm(world).stage).toBe("merging");
}

/** Both thumbs down, for `n` beats or until the arm is done with them. */
function bothDown(world: World, n: number): void {
  const p1 = batonMergeSocket(CFG, 1);
  const p2 = batonMergeSocket(CFG, 2);
  for (let i = 0; i < n * TPB && arm(world).stage === "merging"; i++) {
    step(world, [thumb(world, 1, p1, true), thumb(world, 2, p2, true)]);
  }
}

/** Every event said over `n` beats, since `world.events` is one step's worth. */
function said(world: World, n: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) out.add(e.type);
  }
  return out;
}

describe("THE BATON's draw", () => {
  it("stops the arm at the last two sockets instead of merging on arrival", () => {
    const world = open(QUIET);
    merging(world);
    const b = arm(world);
    expect(b.merged).toBe(false);
    expect(b.beads).toHaveLength(2);
    expect(b.mergeThumbs).toBe(0);
    expect(b.mergeHeld).toBe(0);
  });

  it("takes both thumbs: one alone never counts, however long it is held", () => {
    const world = open(QUIET);
    merging(world);
    const socket = batonMergeSocket(CFG, 1);
    for (let i = 0; i < CFG.batonMergeBeats * TPB * 2; i++) {
      step(world, [thumb(world, 1, socket, true)]);
    }
    const b = arm(world);
    expect(batonDrawing(b, 1)).toBe(true);
    expect(batonDrawing(b, 2)).toBe(false);
    expect(b.mergeHeld).toBe(0);
    expect(b.merged).toBe(false);
  });

  it("merges under both, and the merged bead's next flight is the crossing", () => {
    const world = open(QUIET);
    merging(world);
    bothDown(world, CFG.batonMergeWindowBeats);
    const b = arm(world);
    expect(b.merged).toBe(true);
    expect(b.stage).toBe("passing");
    expect(b.beads).toHaveLength(1);
    expect(b.beads[0]?.socket).toBe(CFG.batonSockets - 1);
    expect(b.mergeThumbs).toBe(0);
    expect(world.events.some((e) => e.type === "batonMerged")).toBe(true);
  });

  it("puts the count back to nought when either lets go", () => {
    const world = open(QUIET);
    merging(world);
    bothDown(world, 1);
    expect(arm(world).mergeHeld).toBeGreaterThan(0);
    const socket = batonMergeSocket(CFG, 2);
    for (let i = 0; i < TPB * 2; i++) {
      step(world, [thumb(world, 2, socket, false)]);
    }
    const b = arm(world);
    expect(batonDrawing(b, 2)).toBe(false);
    expect(b.mergeHeld).toBe(0);
    expect(b.merged).toBe(false);
  });

  it("refuses a thumb on the other seat's bead", () => {
    const world = open(QUIET);
    merging(world);
    step(world, [thumb(world, 1, batonMergeSocket(CFG, 2), true)]);
    expect(arm(world).mergeThumbs).toBe(0);
    expect(world.events.some((e) => e.type === "batonRefused")).toBe(true);
  });

  it("shakes the bead that waited home when the window closes short", () => {
    const world = open(QUIET);
    merging(world);
    const heard = said(world, CFG.batonMergeWindowBeats + 1);
    expect(heard.has("batonParted")).toBe(true);
    const b = arm(world);
    expect(b.stage).toBe("passing");
    expect(b.merged).toBe(false);
    expect(b.beads).toHaveLength(2);
    expect(b.beads.some((bead) => bead.socket === 0)).toBe(true);
    expect(b.beads.some((bead) => bead.socket === CFG.batonSockets - 2)).toBe(true);
  });

  it("keeps every socket it had darkened: what is lost is one bead's run", () => {
    const world = open(QUIET);
    merging(world);
    const dark = batonDark(arm(world));
    beats(world, CFG.batonMergeWindowBeats + 1);
    expect(batonDark(arm(world))).toBe(dark);
    expect(arm(world).sockets.some((s) => s === BATON_SOCKET_DARK)).toBe(true);
  });
});

describe("THE BATON's new state is on the wire", () => {
  it("hashes the swell, the thumbs and the count", () => {
    const world = open();
    swelling(world);
    const before = hashWorld(world);
    const b = arm(world);
    b.swellSocket += 1;
    expect(hashWorld(world)).not.toBe(before);
    b.swellSocket -= 1;
    b.mergeThumbs = 3;
    expect(hashWorld(world)).not.toBe(before);
    b.mergeThumbs = 0;
    b.mergeHeld = 1;
    expect(hashWorld(world)).not.toBe(before);
    b.mergeHeld = 0;
    b.swellBeat += 1;
    expect(hashWorld(world)).not.toBe(before);
  });
});
