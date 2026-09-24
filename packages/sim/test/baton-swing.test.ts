import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SHED,
  BATON_SOCKET_SWELL,
  type BatonBead,
  batonBaseCol,
  batonDark,
  step,
} from "../src/index.js";
import {
  arm,
  beats,
  CFG,
  cmd,
  handover,
  landed,
  launch,
  lead,
  open,
  shoot,
} from "./baton-fixture.js";

/**
 * THE BATON giving way under the handovers (`baton.test.ts` is the handover
 * itself): a bead that sat too long shaken back, the arm swinging a column,
 * a shell shed, and the second bead — the two taking turns under one
 * trigger and one bolt.
 */

const MID = batonBaseCol(CFG);

describe("THE BATON's swing, shed and twin", () => {
  it("shakes a bead that sat too long back to the base, and the dark sockets stay dark", () => {
    const world = open();
    handover(world);
    expect(lead(world).socket).toBe(1);
    const sat = world.beat;
    beats(world, CFG.batonTurnBeats);
    const b = arm(world);
    expect(lead(world).socket).toBe(0);
    expect(b.settles).toBe(1);
    expect(b.sockets[0]).toBe(BATON_SOCKET_DARK);
    expect(world.beat - sat).toBe(CFG.batonTurnBeats);
    expect(world.events.some((e) => e.type === "batonSettled")).toBe(true);
  });

  it("swings the arm once enough sockets are dark, and the bead lands a column off", () => {
    // One bead only: with two, the trigger's next is the twin, which does not swing.
    const world = open({ ...CFG, batonTwinAfter: CFG.batonSockets + 1 });
    for (let i = 0; i < CFG.batonSwingAfter; i++) handover(world);
    expect(batonDark(arm(world))).toBe(CFG.batonSwingAfter);
    const bead = launch(world);
    const b = arm(world);
    expect(bead.fromCol).toBe(MID);
    expect(bead.col).toBe(MID + 1);
    expect(b.col).toBe(MID + 1);
    shoot(world, bead.color);
    expect(bead.struck).toBe(true);
    landed(world);
    expect(bead.col).toBe(MID + 1);
  });

  it("sheds a shell down its own column once enough sockets are dark", () => {
    const world = open();
    // The second bead passes sockets already dark, so it takes more
    // handovers than dark sockets to get the arm giving way.
    for (let i = 0; i < 20 && batonDark(arm(world)) < CFG.batonShedAfter; i++) handover(world);
    expect(batonDark(arm(world))).toBe(CFG.batonShedAfter);
    // On the beat after the sixth landing, not on it: a shed is a thing the
    // arm does on its own count. It **swells** first now, for the window a
    // thumb has to take it off clean (`sim/baton-hand.ts`); the rock is
    // `batonSwellBeats` later, which is the same count it always came on.
    beats(world, 1);
    const b = arm(world);
    const shedAt = b.swellSocket;
    expect(shedAt).toBeGreaterThanOrEqual(0);
    expect(b.sockets[shedAt]).toBe(BATON_SOCKET_SWELL);
    expect(world.creatures.some((c) => c.kind === "meteor")).toBe(false);
    expect(world.events.some((e) => e.type === "batonSwell")).toBe(true);
    // The topmost dark socket no bead sits in.
    for (let i = 0; i < shedAt; i++) {
      expect(b.sockets[i] === BATON_SOCKET_DARK).toBe(true);
      expect(b.beads.some((bead) => !bead.flying && bead.socket === i)).toBe(true);
    }
    beats(world, CFG.batonSwellBeats);
    expect(b.sockets[shedAt]).toBe(BATON_SOCKET_SHED);
    expect(b.swellSocket).toBe(-1);
    const rock = world.creatures.find((c) => c.kind === "meteor");
    expect(rock?.col).toBe(b.col);
    expect(rock?.row).toBe(shedAt);
    expect(world.events.some((e) => e.type === "batonShed")).toBe(true);
  });

  it("lights a second bead in the top socket, the other colour, once enough sockets are dark", () => {
    const world = open();
    for (let i = 0; i < CFG.batonTwinAfter - 1; i++) handover(world);
    expect(arm(world).beads).toHaveLength(1);
    handover(world);
    const b = arm(world);
    expect(batonDark(b)).toBe(CFG.batonTwinAfter);
    expect(b.beads).toHaveLength(2);
    const twin = b.beads[1];
    expect(twin?.socket).toBe(0);
    expect(twin?.flying).toBe(false);
    expect(twin?.color).toBe(lead(world).color === "red" ? "cyan" : "red");
    expect(lead(world)).toBe(b.beads[0] as BatonBead);
    expect(world.events.some((e) => e.type === "batonTwin")).toBe(true);
  });

  it("takes turns under the one trigger: the bead that has sat longest goes, the other next", () => {
    // A long flight, so the third press finds both still in the air.
    const world = open({ ...CFG, batonFlightBeats: 6 });
    for (let i = 0; i < CFG.batonTwinAfter; i++) handover(world);
    const [first, twin] = arm(world).beads;
    if (first === undefined || twin === undefined) throw new Error("no twin");
    // Both sat down on the same beat: the lower one goes first.
    expect(launch(world)).toBe(first);
    expect(twin.flying).toBe(false);
    // Player 1 is locked for the beat after; then the twin, which has sat
    // longer, is the next one out — while the first is still in the air.
    beats(world, CFG.batonLockBeats + 1);
    expect(first.flying).toBe(true);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(twin.flying).toBe(true);
    expect(first.flying).toBe(true);
    // A third press sends nothing: both are in the air.
    beats(world, CFG.batonLockBeats + 1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(world.events.some((e) => e.type === "batonLaunch")).toBe(false);
  });

  it("takes whichever bead the bolt reaches, by that bead's colour", () => {
    // A long flight, so both are in the air with time for a shot at each.
    const world = open({ ...CFG, batonFlightBeats: 9 });
    for (let i = 0; i < CFG.batonTwinAfter; i++) handover(world);
    const [first, twin] = arm(world).beads;
    if (first === undefined || twin === undefined) throw new Error("no twin");
    launch(world);
    beats(world, CFG.batonLockBeats + 1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(first.flying && twin.flying).toBe(true);
    // The first is lower: a bolt up the column meets it, not the twin, and
    // the twin's colour is the wrong one for it.
    shoot(world, twin.color === first.color ? first.color : twin.color);
    if (twin.color === first.color) expect(first.struck).toBe(true);
    else {
      expect(first.struck).toBe(false);
      expect(world.events.some((e) => e.type === "reject")).toBe(true);
      beats(world, CFG.batonLockBeats + 1);
      shoot(world, first.color);
      expect(first.struck).toBe(true);
    }
    expect(twin.struck).toBe(false);
    // Then the twin, still above it in the air.
    beats(world, CFG.batonLockBeats + 1);
    shoot(world, twin.color);
    expect(twin.struck).toBe(true);
    landed(world);
    expect(first.socket).toBe(CFG.batonTwinAfter + 1);
    expect(twin.socket).toBe(1);
  });

  it("swings only the lead; the twin flies straight down the column it sat in", () => {
    const world = open();
    for (let i = 0; i < CFG.batonSwingAfter; i++) handover(world);
    const twin = arm(world).beads[1];
    if (twin === undefined) throw new Error("no twin");
    expect(launch(world)).toBe(twin);
    expect(twin.col).toBe(twin.fromCol);
    shoot(world, twin.color);
    landed(world);
    // Then the lead, which does — the first swing, since the twin's handover
    // darkened nothing new.
    const first = launch(world);
    expect(first).toBe(arm(world).beads[0] as BatonBead);
    expect(first.fromCol).toBe(MID);
    expect(first.col).toBe(MID + 1);
  });

  it("counts a bead's turn from the arm going still, never while the other flies", () => {
    const world = open();
    for (let i = 0; i < CFG.batonTwinAfter; i++) handover(world);
    const [first, twin] = arm(world).beads;
    if (first === undefined || twin === undefined) throw new Error("no twin");
    handover(world);
    // The first sat through the twin's whole flight; its clock starts now.
    expect(launch(world)).toBe(twin);
    shoot(world, twin.color);
    landed(world);
    expect(first.socket).toBe(CFG.batonTwinAfter + 1);
    beats(world, CFG.batonTurnBeats - 1);
    expect(first.socket).toBe(CFG.batonTwinAfter + 1);
    beats(world, 1);
    expect(first.socket).toBe(0);
  });

  it("keeps the two-beat turn while there are two beads, tight only when one is left", () => {
    const world = open();
    for (let i = 0; i < CFG.batonTightenAfter; i++) handover(world);
    const b = arm(world);
    expect(b.beads).toHaveLength(2);
    expect(b.handovers).toBe(CFG.batonTightenAfter);
    const bead = lead(world);
    const sat = world.beat;
    beats(world, CFG.batonTightTurnBeats);
    expect(bead.socket).toBe(CFG.batonTightenAfter);
    beats(world, CFG.batonTurnBeats - CFG.batonTightTurnBeats);
    expect(bead.socket).toBe(0);
    expect(world.beat - sat).toBe(CFG.batonTurnBeats);
  });
});
