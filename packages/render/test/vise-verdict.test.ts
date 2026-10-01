import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type ViseAsk,
  type VisePhase,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  VISE_HULL_MARK,
  VISE_KERNEL_MARK,
  VISE_LEFT_MARK,
  VISE_RIGHT_MARK,
  VISE_SEED_MARK,
  ViseVerdicts,
} from "../src/vise-verdicts.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE VISE's marks answer a touch the way THE OCULUS's do**
 * (`vise-verdicts.ts`, `.claude/skills/new-boss` §5): each lobe wears the halo
 * on its own seat's screen and the partner's ring and clock on the other's
 * while a pinch naming it is lit, and a lobe already pinched shut sees the one
 * still open; the kernel, the hull under the case and the spat seed are either
 * seat's, and halo on both screens with nobody's clock; each of the case's
 * words lands on the mark it names, a slip on its own lobe; a step run out
 * reddens only what it asked; and the verdict reaches the field's frame on
 * every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The case in `phase` since a beat ago, `ask` the step under the cursor, `shut` the lobes pinched shut. */
function at(
  world: World,
  phase: VisePhase,
  ask: ViseAsk = "left",
  shut: [boolean, boolean] = [false, false],
  bared = true,
): void {
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.heldBeats = 0;
  s.bared = bared;
  s.gapMilli = [shut[0] ? 0 : CFG.viseOpenMilli, shut[1] ? 0 : CFG.viseOpenMilli];
  s.steps[0] = { ask, color: "either", beats: 4, offset: 2 };
}

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

describe("THE VISE's marks asking", () => {
  const lit =
    (ask: ViseAsk, shut?: [boolean, boolean], bared = true) =>
    (w: World) =>
      at(w, "lit", ask, shut, bared);
  const rest = (w: World) => at(w, "rest");

  it("haloes each seat's own lobe through a pinch, and shows it the partner's waited on", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(halos(role, lit("both"))).toBeGreaterThan(halos(role, lit("both", [true, true])));
      expect(clocks(role, lit("both"))).toBeGreaterThan(clocks(role, lit("both", [true, true])));
    }
    expect(clocks("test", lit("both"))).toBe(clocks("test", lit("both", [true, true])));
  });

  it("asks only the lobe a one-lobe pinch names, of its own seat", () => {
    expect(halos("p1", lit("left"))).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p1", lit("left"))).toBe(clocks("p1", rest));
    expect(halos("p2", lit("left"))).toBe(halos("p2", rest));
    expect(clocks("p2", lit("left"))).toBeGreaterThan(clocks("p2", rest));
  });

  it("shows a seat already pinched shut the one still open", () => {
    const pilotShut = lit("both", [true, false]);
    const both = lit("both", [true, true]);
    expect(halos("p1", pilotShut)).toBe(halos("p1", both));
    expect(clocks("p1", pilotShut)).toBeGreaterThan(clocks("p1", both));
    expect(halos("p2", pilotShut)).toBeGreaterThan(halos("p2", both));
    expect(clocks("p2", pilotShut)).toBe(clocks("p2", both));
  });

  it.each(ROLES)("haloes the kernel, the hull and the seed on %s, and waits on nobody", (role) => {
    for (const ask of ["fire", "bite", "spit"] as const) {
      const shut = ask === "fire" ? lit("fire", undefined, false) : rest;
      expect(halos(role, lit(ask))).toBeGreaterThan(halos(role, shut));
      expect(clocks(role, lit(ask))).toBe(clocks(role, shut));
    }
  });
});

describe("THE VISE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new ViseVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [
      at(VISE_KERNEL_MARK),
      at(VISE_LEFT_MARK),
      at(VISE_RIGHT_MARK),
      at(VISE_HULL_MARK),
      at(VISE_SEED_MARK),
    ];
  };
  const col = 5;
  const light = (ask: ViseAsk): SimEvent => ({ type: "viseLight", ask, col });

  it("lands each of the case's words on the mark it names", () => {
    const n = null;
    expect(on([{ type: "viseCrack", side: 0, cracks: 1, col }])).toEqual([n, true, n, n, n]);
    expect(on([{ type: "viseCrack", side: 1, cracks: 1, col }])).toEqual([n, n, true, n, n]);
    expect(on([{ type: "viseBrace", col }])).toEqual([n, true, true, n, n]);
    expect(on([{ type: "viseHit", hits: 1, col }])).toEqual([true, n, n, n, n]);
    expect(on([{ type: "viseBlock", col }])).toEqual([n, n, n, true, n]);
    expect(on([{ type: "viseSeedBurst", col }])).toEqual([n, n, n, n, true]);
    expect(on([{ type: "viseSlip", side: 0, col }])).toEqual([n, false, n, n, n]);
    expect(on([{ type: "viseSlip", side: 1, col }])).toEqual([n, n, false, n, n]);
    expect(on([{ type: "viseBare", col }])).toEqual([n, n, n, n, n]);
  });

  it("reddens on a step run out only what it asked", () => {
    const n = null;
    const sprung = (side: 0 | 1): SimEvent => ({ type: "viseSpring", side, col });
    expect(on([light("left"), sprung(0)])).toEqual([n, false, n, n, n]);
    expect(on([light("right"), sprung(1)])).toEqual([n, n, false, n, n]);
    expect(on([light("both"), { type: "viseCover", col }])).toEqual([n, false, false, n, n]);
    expect(on([light("fire"), { type: "viseMiss", col }])).toEqual([false, n, n, n, n]);
    expect(on([light("bite"), { type: "viseMiss", col }])).toEqual([n, n, n, false, n]);
    expect(on([light("spit"), { type: "viseMiss", col }])).toEqual([n, n, n, n, false]);
  });

  it("forgets on reset", () => {
    const v = new ViseVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "viseMiss", col }]);
    expect(v.verdicts.at(VISE_KERNEL_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "viseMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
