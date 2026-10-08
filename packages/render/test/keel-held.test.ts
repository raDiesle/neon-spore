import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type KeelState,
  keelBoss,
  NO_JOINT,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { keelChordCount } from "../src/keel-verdicts.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE KEEL's ends held through the flip say they are right, and the chord
 * says how far** — the owner, 7 October 2026, THE CAPSTAN's rule
 * (`keel-verdicts.ts`, `mark-progress.ts`): an end with its thumb down is
 * green on both screens, and both ends carry the chord's count over a dim
 * track of every beat it needs, from the moment the arch bows; outside the
 * flip there is no count.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
/** A segment of a count not yet earned, as `drawMarkProgress` strokes it. */
const TRACK = rgba(PALETTE.text, 0.3);

function flipping(arrange: (s: KeelState) => void = () => {}): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = "flip";
  s.phaseBeat = world.beat - 1;
  s.movement = 2;
  s.joint = NO_JOINT;
  s.locked = s.locked.map(() => true);
  s.repriseCursor = s.reprise.length;
  s.held = [false, false];
  s.chordBeats = 0;
  arrange(s);
  return world;
}

function frame(role: ViewRole, world: World): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;

describe("THE KEEL's ends held", () => {
  it.each(["p1", "p2"] as const)("greens an end with its thumb down, on %s", (role) => {
    const free = frame(role, flipping());
    const held = frame(
      role,
      flipping((s) => {
        s.held = [true, false];
      }),
    );
    expect(count(held, PALETTE.good)).toBeGreaterThan(count(free, PALETTE.good));
  });

  it("counts the chord in beats out of those it needs, only in the flip", () => {
    const s = keelBoss(
      flipping((x) => {
        x.chordBeats = 1;
      }),
    );
    if (s === null) throw new Error("no spine");
    expect(keelChordCount(CFG, s)).toEqual({
      share: 1 / CFG.keelChordBeats,
      segments: CFG.keelChordBeats,
    });
    s.phase = "rigid";
    expect(keelChordCount(CFG, s)).toBeNull();
  });

  it.each(["p1", "p2"] as const)("draws the chord's track on both ends, on %s", (role) => {
    expect(count(frame(role, flipping()), TRACK)).toBeGreaterThanOrEqual(2 * CFG.keelChordBeats);
  });
});
