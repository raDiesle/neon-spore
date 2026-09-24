import { describe, expect, it } from "bun:test";
import { BATON_SOCKET_SHED, BATON_SOCKET_SWELL, slowing, step } from "../src/index.js";
import {
  act,
  acts,
  arm,
  beats,
  bothDown,
  CFG,
  crossing,
  handover,
  merging,
  nextBeat,
  open,
  QUIET,
  said,
  strips,
  swelling,
  thumb,
  until,
} from "./baton-fixture.js";

/**
 * THE BATON doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): **a swelling shell asks `batonSwellStrips` fresh presses** of the
 * locked seat, and **THE SLOW spans the fight's three asks exactly** — the
 * swell, the draw and the crossing, each shut on its own ends
 * (`baton-slow.ts`). `baton.test.ts` is the fight and `baton-hand.test.ts`
 * the two thumbs' rules.
 */

describe("THE BATON, doubled", () => {
  it("asks nothing slowly of a handover", () => {
    const world = open(QUIET);
    until(world, "passing");
    handover(world);
    expect(slowing(world)).toBe(false);
  });

  it("slows a swelling shell for exactly its swell", () => {
    const world = open();
    swelling(world);
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(arm(world).swellBeat + CFG.batonSwellBeats);
  });

  it("takes one strip short of the last and leaves the shell, and THE SLOW, up", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    step(world, [thumb(world, 2, socket, true)]);
    const b = arm(world);
    expect(world.events.some((e) => e.type === "batonStripped")).toBe(true);
    expect(b.stripped).toBe(1);
    expect(b.sockets[socket]).toBe(BATON_SOCKET_SWELL);
    expect(slowing(world)).toBe(true);
  });

  it("counts a thumb dragged across the shell once, and refuses one once", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    let refused = 0;
    for (let i = 0; i < 3; i++) {
      step(world, [thumb(world, 2, socket, true), thumb(world, 1, socket, true)]);
      refused += world.events.filter((e) => e.type === "batonRefused").length;
    }
    expect(arm(world).stripped).toBe(1);
    expect(refused).toBe(1);
  });

  it("sheds on the last strip and shuts THE SLOW", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    strips(world, 2, socket);
    expect(arm(world).sockets[socket]).toBe(BATON_SOCKET_SHED);
    expect(slowing(world)).toBe(false);
  });

  it("shuts it when the shell lets go unstripped", () => {
    const world = open();
    const socket = swelling(world);
    beats(world, CFG.batonSwellBeats);
    expect(arm(world).sockets[socket]).toBe(BATON_SOCKET_SHED);
    expect(slowing(world)).toBe(false);
  });

  it("slows the draw for its window, and shuts it on the merge", () => {
    const world = open(QUIET);
    merging(world);
    expect(world.slowToBeat).toBe(arm(world).stageBeat + CFG.batonMergeWindowBeats);
    bothDown(world, CFG.batonMergeWindowBeats);
    expect(arm(world).merged).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("shuts it when the draw's window closes short", () => {
    const world = open(QUIET);
    merging(world);
    expect(said(world, CFG.batonMergeWindowBeats + 1).has("batonParted")).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("slows the crossing for every act it is owed, and shuts it on the drop", () => {
    const world = open(QUIET);
    crossing(world);
    expect(world.slowToBeat).toBe(arm(world).stageBeat + CFG.batonFinalBeats);
    for (let i = 0; i < CFG.batonFinalBeats + 2 && arm(world).stage === "crossing"; i++) {
      nextBeat(world);
      expect(slowing(world)).toBe(arm(world).stage === "crossing");
      if (arm(world).stage === "crossing") act(world);
    }
    expect(arm(world).stage).toBe("falling");
    expect(slowing(world)).toBe(false);
  });

  it("shuts it on the crossing's miss", () => {
    const world = open(QUIET);
    crossing(world);
    nextBeat(world);
    nextBeat(world);
    expect(arm(world).stage).toBe("passing");
    expect(slowing(world)).toBe(false);
  });
});
