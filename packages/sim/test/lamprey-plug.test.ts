import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  LAMPREY_BUTTONS,
  type LampreyState,
  type LampreyStep,
  lampreyAsks,
  lampreyBoss,
} from "../src/lamprey.js";
import { slowing } from "../src/slow.js";

/**
 * THE LAMPREY's plug (`sim/lamprey-plug.ts`, the owner, 10 October 2026): the
 * eel comes down the middle into the hull and its teeth pull a button out of
 * the worker's panel. The worker presses it back in; the holder pulls the
 * tail, and only with the button in does the eel come out — pulled with it
 * out, the button is yanked further and the thumb thrown off.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

const SCRIPT: readonly LampreyStep[] = [
  { ask: "plug", holder: 2, teeth: 0, jump: 1, beats: 14, color: "either", button: "intake" },
  { ask: "plug", holder: 1, teeth: 0, jump: 1, beats: 14, color: "either", button: "fireRed" },
  { ask: "pull", holder: 2, teeth: 0, jump: 2, beats: 12, color: "either" },
];

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], {
    kind: "lamprey",
    meal: [{ kind: "meteor", col: 2, row: 4 }],
    steps: SCRIPT,
  });
  return world;
}

function eel(world: World): LampreyState {
  const s = lampreyBoss(world);
  if (s === null) throw new Error("the wave installed no lamprey");
  return s;
}

function send(world: World, player: 1 | 2, command: TimedCommand["command"]): string[] {
  step(world, [{ tick: world.tick, player, command } as TimedCommand]);
  return world.events.map((e) => e.type);
}

/** The holder's tail pulled all the way up the field, or let go. */
function tail(world: World, player: 1 | 2, on = true): string[] {
  const up = -(CFG.lampreyTailPullMilli + 50);
  return send(world, player, {
    kind: "drag",
    target: "lampreyTail",
    on,
    fromMilli: 0,
    fromYMilli: on ? up : 0,
  });
}

/** Ticks until the eel is bitten in. */
function toBite(world: World): void {
  const end = world.tick + TPB * 120;
  while (eel(world).phase !== "bite") {
    if (world.tick >= end) throw new Error("the lamprey never bit");
    step(world, []);
  }
}

describe("THE LAMPREY's plug", () => {
  it("comes down the middle into the hull under THE SLOW, the button part way out", () => {
    const world = install();
    toBite(world);
    const s = eel(world);
    expect(lampreyAsks(s)).toBe("plug");
    expect({ col: s.col, row: s.row }).toEqual({ col: midCol(CFG), row: hullRow(CFG) });
    expect(slowing(world)).toBe(true);
    expect(s.plugMilli).toBe(CFG.lampreyPlugStartMilli);
    expect(s.plugs).toEqual([LAMPREY_BUTTONS.indexOf("intake")]);
    // The tail lies straight up the field, for the holder to pull out.
    expect({ x: s.tailX, y: s.tailY }).toEqual({ x: 0, y: -1000 });
  });

  it("pulls the button further out each beat", () => {
    const world = install();
    toBite(world);
    for (let t = 0; t < TPB; t++) step(world, []);
    expect(eel(world).plugMilli).toBe(CFG.lampreyPlugStartMilli + CFG.lampreyPlugCreepMilli);
  });

  it("hears only the worker's own button pushing it back in", () => {
    const world = install();
    toBite(world);
    const start = eel(world).plugMilli;
    send(world, 2, { kind: "intake" });
    send(world, 1, { kind: "guard" });
    expect(eel(world).plugMilli).toBe(start);
    expect(send(world, 1, { kind: "intake" })).toContain("lampreyPush");
    expect(eel(world).plugMilli).toBe(start - CFG.lampreyPlugPushMilli);
  });

  it("yanks the button out and throws the thumb off when the tail is pulled with it out", () => {
    const world = install();
    toBite(world);
    const start = eel(world).plugMilli;
    const said = tail(world, 2);
    expect(said).toContain("lampreyYank");
    expect(said).not.toContain("lampreyLoose");
    expect(eel(world).plugMilli).toBe(start + CFG.lampreyPlugYankMilli);
    // Still down, the thumb is not heard; the button pushed in, it must lift and take hold again.
    send(world, 1, { kind: "intake" });
    send(world, 1, { kind: "intake" });
    send(world, 1, { kind: "intake" });
    expect(tail(world, 2)).not.toContain("lampreyLoose");
    tail(world, 2, false);
    expect(tail(world, 2)).toContain("lampreyLoose");
  });

  it("comes out with the button in and the tail pulled, leaving no tooth, and takes the next button", () => {
    const world = install();
    toBite(world);
    send(world, 1, { kind: "intake" });
    send(world, 1, { kind: "intake" });
    const said = tail(world, 2);
    expect(said).toContain("lampreyLoose");
    const s = eel(world);
    expect(s.teethOut).toBe(0);
    expect(s.row).toBe(CFG.lampreyTowRow);
    expect(slowing(world)).toBe(false);
    // Down again, the other way round: RED, the navigator's, pressed as a shot.
    toBite(world);
    expect(eel(world).plugs).toEqual([0, LAMPREY_BUTTONS.indexOf("fireRed")]);
    send(world, 2, { kind: "prime", on: true, color: "red" });
    send(world, 2, { kind: "prime", on: false, color: "red" });
    send(world, 2, { kind: "fire", color: "red" });
    expect(tail(world, 1)).toContain("lampreyLoose");
  });

  it("goes through to the hull when the button is all the way out", () => {
    const world = install();
    toBite(world);
    const beats = Math.ceil((1000 - CFG.lampreyPlugStartMilli) / CFG.lampreyPlugCreepMilli);
    expect(beats).toBeLessThan(SCRIPT[0]?.beats ?? 0);
    const seen = new Set<string>();
    for (let t = 0; t < TPB * (beats + 1); t++) {
      step(world, []);
      for (const e of world.events) seen.add(e.type);
    }
    expect(seen.has("lampreyFull")).toBe(true);
    expect(seen.has("breach")).toBe(true);
  });

  it("is the same twice from one seed", () => {
    const a = install(5);
    const b = install(5);
    for (const w of [a, b]) {
      toBite(w);
      send(w, 1, { kind: "intake" });
      tail(w, 2);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
