import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SHED,
  BATON_SOCKET_SWELL,
  batonDark,
  batonDrawing,
  batonMergeSocket,
  hashWorld,
  step,
} from "../src/index.js";
import {
  acts,
  arm,
  beats,
  bothDown,
  CFG,
  merging,
  open,
  QUIET,
  said,
  strips,
  swelling,
  TPB,
  thumb,
} from "./baton-fixture.js";

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
    strips(world, 2, socket);
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
