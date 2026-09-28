import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type KeelState,
  keelBoss,
  NO_JOINT,
  NO_ROCK,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { KeelVerdicts } from "../src/keel-verdicts.js";
import type { ViewRole } from "../src/layout.js";
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
 * **THE KEEL's joints answer a touch the way THE INSTAR's marks do**
 * (`keel-verdicts.ts`, `.claude/skills/new-boss` §5), the whole convention:
 * the lit joint wears the halo on the screen of the seat whose half it sits
 * over and the partner's ring and clock on the other's; in the flip each end
 * joint asks its own seat while that thumb is off; each of the spine's words
 * lands on the segment it names; and the verdict reaches the field's frame on
 * every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
const SEGS = CFG.keelSegments;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The spine in `phase` since a beat ago, nothing locked, both thumbs off. */
function at(world: World, phase: "joint" | "flip" | "rest"): KeelState {
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.movement = phase === "flip" ? 2 : 1;
  s.joint = NO_JOINT;
  s.locked = s.locked.map(() => phase === "flip");
  s.rockCol = NO_ROCK;
  s.held = [false, false];
  s.chordBeats = 0;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = hung();
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

describe("THE KEEL's lit joint asking", () => {
  const lit = (seg: number) => (w: World) => {
    at(w, "joint").joint = seg;
  };
  const rest = (w: World) => {
    at(w, "rest");
  };

  it("haloes the seat whose half it sits over, and shows the other their partner waited on", () => {
    const left = lit(0);
    const right = lit(SEGS - 1);
    expect(count(frame("p1", left), HALO)).toBeGreaterThan(count(frame("p1", rest), HALO));
    expect(count(frame("p2", left), HALO)).toBe(count(frame("p2", rest), HALO));
    expect(count(frame("p2", left), CLOCK)).toBeGreaterThan(count(frame("p2", rest), CLOCK));
    expect(count(frame("p1", right), CLOCK)).toBeGreaterThan(count(frame("p1", rest), CLOCK));
    expect(count(frame("p2", right), HALO)).toBeGreaterThan(count(frame("p2", rest), HALO));
    expect(count(frame("test", left), CLOCK)).toBe(count(frame("test", rest), CLOCK));
  });
});

describe("THE KEEL's flip asking", () => {
  const flip = (held: [boolean, boolean]) => (w: World) => {
    at(w, "flip").held = held;
  };

  it.each(["p1", "p2"] as const)(
    "haloes this seat's end joint while its thumb is off, on %s",
    (role) => {
      const own: [boolean, boolean] = role === "p1" ? [true, false] : [false, true];
      const halos = (held: [boolean, boolean]) => count(frame(role, flip(held)), HALO);
      const clocks = (held: [boolean, boolean]) => count(frame(role, flip(held)), CLOCK);
      expect(halos([false, false])).toBeGreaterThan(halos(own));
      expect(clocks([false, false])).toBeGreaterThan(clocks([true, true]));
      expect(clocks(own)).toBe(clocks([false, false]));
    },
  );
});

describe("THE KEEL's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new KeelVerdicts();
    v.ingest(said, SEGS);
    return Array.from({ length: SEGS }, (_, k) => v.verdicts.at(k)?.good ?? null);
  };
  const none = Array.from({ length: SEGS }, () => null);
  const only = (k: number, good: boolean) => none.map((x, i) => (i === k ? good : x));

  it("lands each of the spine's words on the segment it names", () => {
    expect(on([{ type: "keelLock", seg: 2, loose: 3, col: 4 }])).toEqual(only(2, true));
    expect(on([{ type: "keelMiss", seg: 1, col: 2 }])).toEqual(only(1, false));
    expect(on([{ type: "keelSlip", seg: 4, col: 8 }])).toEqual(only(4, false));
    const ends = none.map((x, i) => (i === 0 || i === SEGS - 1 ? true : x));
    expect(on([{ type: "keelArrest", col: 5 }])).toEqual(ends);
    expect(on([{ type: "keelSnap", col: 5 }])).toEqual(ends.map((x) => (x === null ? x : false)));
    expect(on([{ type: "keelFlare", col: 5 }])).toEqual(none);
  });

  it("forgets on reset", () => {
    const v = new KeelVerdicts();
    v.ingest([{ type: "keelMiss", seg: 1, col: 2 }], SEGS);
    v.clear();
    expect(v.verdicts.at(1)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => {
      at(w, "rest");
    };
    const miss: SimEvent[] = [{ type: "keelMiss", seg: 1, col: 2 }];
    expect(count(frame(role, rest, miss), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
