import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OculusAsk,
  type OculusPhase,
  oculusBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import {
  OCULUS_CORE_MARK,
  OCULUS_HULL_MARK,
  OCULUS_LEFT_MARK,
  OCULUS_RIGHT_MARK,
  OculusVerdicts,
} from "../src/oculus-verdicts.js";
import { PALETTE } from "../src/palette.js";
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
 * **THE OCULUS's marks answer a touch the way THE INSTAR's do**
 * (`oculus-verdicts.ts`, `.claude/skills/new-boss` §5): each half of the lens
 * wears the halo on its own seat's screen and the partner's ring and clock on
 * the other's while a pair to hold is lit, and a thumb already down sees the
 * one still missing; the core and the hull under the eye are either seat's,
 * and halo on both screens with nobody's clock; each of the lens's words lands
 * on the mark it names, a slip on its own seat's half; a step run out reddens
 * only what it asked; and the verdict reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The lens in `phase` since a beat ago, `ask` the step under the cursor, `held` the thumbs down. */
function at(
  world: World,
  phase: OculusPhase,
  ask: OculusAsk = "shut",
  held: [boolean, boolean] = [false, false],
  socketOpen = true,
): void {
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.heldBeats = 0;
  s.socketOpen = socketOpen;
  s.held = held;
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

describe("THE OCULUS's marks asking", () => {
  const lit =
    (ask: OculusAsk, held?: [boolean, boolean], open = true) =>
    (w: World) =>
      at(w, "lit", ask, held, open);
  const rest = (w: World) => at(w, "rest");

  it("haloes each seat's own half through a hold, and shows it the partner's waited on", () => {
    for (const ask of ["shut", "reseal"] as const) {
      for (const role of ["p1", "p2"] as const) {
        expect(halos(role, lit(ask))).toBeGreaterThan(halos(role, lit(ask, [true, true])));
        expect(clocks(role, lit(ask))).toBeGreaterThan(clocks(role, lit(ask, [true, true])));
      }
      expect(clocks("test", lit(ask))).toBe(clocks("test", lit(ask, [true, true])));
    }
  });

  it("shows a thumb already down the one still missing", () => {
    const pilotDown = lit("shut", [true, false]);
    const both = lit("shut", [true, true]);
    expect(halos("p1", pilotDown)).toBe(halos("p1", both));
    expect(clocks("p1", pilotDown)).toBeGreaterThan(clocks("p1", both));
    expect(halos("p2", pilotDown)).toBeGreaterThan(halos("p2", both));
    expect(clocks("p2", pilotDown)).toBe(clocks("p2", both));
  });

  it.each(ROLES)("haloes the core and the hull on %s, and waits on nobody", (role) => {
    for (const ask of ["fire", "glare", "look"] as const) {
      const shut = ask === "glare" ? rest : lit(ask, undefined, false);
      expect(halos(role, lit(ask))).toBeGreaterThan(halos(role, shut));
      expect(clocks(role, lit(ask))).toBe(clocks(role, shut));
    }
  });
});

describe("THE OCULUS's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new OculusVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [
      at(OCULUS_CORE_MARK),
      at(OCULUS_LEFT_MARK),
      at(OCULUS_RIGHT_MARK),
      at(OCULUS_HULL_MARK),
    ];
  };
  const col = 5;
  const light = (ask: OculusAsk): SimEvent => ({ type: "oculusLight", ask, col });

  it("lands each of the lens's words on the mark it names", () => {
    expect(on([{ type: "oculusShut", shut: 2, col }])).toEqual([null, true, true, null]);
    expect(on([{ type: "oculusReseal", col }])).toEqual([null, true, true, null]);
    expect(on([{ type: "oculusHit", hits: 1, col }])).toEqual([true, null, null, null]);
    expect(on([{ type: "oculusBlock", col }])).toEqual([null, null, null, true]);
    expect(on([{ type: "oculusGlance", col }])).toEqual([null, null, null, true]);
    expect(on([{ type: "oculusSlip", seat: 1, col }])).toEqual([null, false, null, null]);
    expect(on([{ type: "oculusSlip", seat: 2, col }])).toEqual([null, null, false, null]);
    expect(on([{ type: "oculusBreak", col }])).toEqual([null, null, null, null]);
  });

  it("reddens on a step run out only what it asked", () => {
    expect(on([light("shut"), { type: "oculusSpring", col }])).toEqual([null, false, false, null]);
    expect(on([light("reseal"), { type: "oculusSwallow", col }])).toEqual([
      null,
      false,
      false,
      null,
    ]);
    expect(on([light("fire"), { type: "oculusMiss", col }])).toEqual([false, null, null, null]);
    expect(on([light("glare"), { type: "oculusMiss", col }])).toEqual([null, null, null, false]);
    expect(on([light("look"), { type: "oculusMiss", col }])).toEqual([null, null, null, false]);
    expect(on([light("break"), { type: "oculusMiss", col }])).toEqual([null, null, null, null]);
  });

  it("forgets on reset", () => {
    const v = new OculusVerdicts();
    v.ingest([light("fire")]);
    v.clear();
    v.ingest([{ type: "oculusMiss", col }]);
    expect(v.verdicts.at(OCULUS_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [light("fire"), { type: "oculusMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
