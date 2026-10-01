import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GallAsk,
  type GallPhase,
  gallBoss,
  gallPointAsks,
  gallRootAsks,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GALL_POINT_MARK, GALL_ROOT_MARK, GallVerdicts } from "../src/gall-verdicts.js";
import { rgba } from "../src/hex.js";
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
 * **THE GALL's marks answer a touch the way every mark does**
 * (`gall-verdicts.ts`, `.claude/skills/new-boss` §5): on a close the point
 * the gall sits on wears the halo on the screen of the seat whose half it is
 * on, and the partner's ring and clock on the other's, crossing over when the
 * gall does; the bared root on a fire step is either seat's, and halos on
 * both screens with nobody's clock; each of the seam's words lands on the
 * mark it names; and the verdict reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gall");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The seam in `phase` since a beat ago, `ask` the step under the cursor, the gall on `point`. */
function at(
  world: World,
  phase: GallPhase,
  ask: GallAsk = "close",
  point = 0,
  bared = false,
): void {
  const s = gallBoss(world);
  if (s === null) throw new Error("the gall wave hung no gall");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.point = point;
  s.bared = bared;
  s.gapMilli = CFG.gallOpenMilli;
  s.heldBeats = 0;
  s.steps[0] = { ask, color: "either", beats: 4 };
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
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

describe("THE GALL's marks asking", () => {
  const as =
    (phase: GallPhase, ask: GallAsk, point = 0, bared = false) =>
    (w: World) =>
      at(w, phase, ask, point, bared);
  const rest = (w: World) => at(w, "rest");

  it("asks a close of the seat whose half the gall is on", () => {
    const world = hung();
    const s = gallBoss(world);
    if (s === null) throw new Error("no gall");
    const asks = () => [gallPointAsks(s, 0), gallPointAsks(s, 1), gallRootAsks(s)];
    at(world, "lit", "close", 1);
    expect(asks()).toEqual([true, false, false]);
    at(world, "lit", "close", 2);
    expect(asks()).toEqual([false, true, false]);
    at(world, "rest", "close", 2);
    expect(asks()).toEqual([false, false, false]);
    at(world, "lit", "fire", 0, true);
    expect(asks()).toEqual([false, false, true]);
  });

  it.each([0, 3])(
    "haloes the pincher's screen and waits on the other's, the gall on point %i",
    (point) => {
      const close = as("lit", "close", point);
      const [own, other]: [ViewRole, ViewRole] = point === 0 ? ["p1", "p2"] : ["p2", "p1"];
      expect(halos(own, close)).toBeGreaterThan(halos(own, rest));
      expect(clocks(own, close)).toBe(clocks(own, rest));
      expect(clocks(other, close)).toBeGreaterThan(clocks(other, rest));
      expect(halos("test", close)).toBeGreaterThan(halos("test", rest));
      expect(clocks("test", close)).toBe(clocks("test", rest));
    },
  );

  it.each(ROLES)("haloes the root on %s once it is bare, and waits on nobody", (role) => {
    const bare = as("lit", "fire", 0, true);
    expect(halos(role, bare)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, bare)).toBe(clocks(role, rest));
  });
});

describe("THE GALL's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new GallVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(GALL_POINT_MARK), at(GALL_ROOT_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the seam's words on the mark it names", () => {
    expect(on([{ type: "gallClose", from: 0, to: 2, closes: 1, col }])).toEqual([true, n]);
    expect(on([{ type: "gallHit", hits: 1, col }])).toEqual([n, true]);
    expect(on([{ type: "gallSlip", point: 0, col }])).toEqual([false, n]);
    expect(on([{ type: "gallSwell", point: 0, col }])).toEqual([false, n]);
    expect(on([{ type: "gallMiss", col }])).toEqual([n, false]);
    expect(on([{ type: "gallPinch", point: 0, col }])).toEqual([n, n]);
    expect(on([{ type: "gallBare", col }])).toEqual([n, n]);
  });

  it("forgets on reset", () => {
    const v = new GallVerdicts();
    v.ingest([{ type: "gallMiss", col }]);
    v.clear();
    expect(v.verdicts.at(GALL_ROOT_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [{ type: "gallSlip", point: 0, col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
