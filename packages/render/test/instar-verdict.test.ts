import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type InstarState,
  instarBoss,
  NO_BEARING,
  NOT_DONE,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts, VERDICT_SECONDS } from "../src/grip-verdict.js";
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
 * **Was that right, and whose is it** — the owner's rule of 24 September 2026
 * on THE INSTAR, its worked example (`.claude/skills/new-boss/owner.md`):
 * a touch that moved a part washes its mark green, a refused thumb washes it
 * red, the open mark of this seat wears a halo and the partner's a turning
 * ring. The verdict is a transient and the next run does not inherit it.
 */

beforeAll(() => {
  installCanvasGlobals();
});

const TPB = ticksPerBeat(CFG);

/** The gape's marks up — one of each seat's — the window just opened. */
function acting(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = instarBoss(world) as InstarState;
  s.cursor = 0;
  s.phase = "act";
  s.phaseBeat = world.beat;
  const n = s.steps[0]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return world;
}

/** Nine ticks drawn, with `said` thrown on the first. */
function drawn(role: ViewRole, said: SimEvent[]): string {
  const world = acting();
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0) w.events.push(...said);
    },
  });
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

const answered: SimEvent = { type: "instarAnswer", mark: 0, part: "jaw", col: 5 };
const refused: SimEvent = { type: "instarRefuse", mark: 0, player: 2, col: 5 };

describe("THE INSTAR's verdict on a touch", () => {
  it.each(ROLES)("washes the mark green when a part moved, on %s", (role) => {
    expect(count(drawn(role, []), PALETTE.good)).toBe(0);
    expect(count(drawn(role, [answered]), PALETTE.good)).toBeGreaterThan(0);
  });

  it.each(ROLES)("washes the mark red when a thumb was refused, on %s", (role) => {
    const red = (t: string) => count(t, PALETTE.red);
    expect(red(drawn(role, [refused]))).toBeGreaterThan(red(drawn(role, [])));
    expect(count(drawn(role, [refused]), PALETTE.good)).toBe(0);
  });

  it("marks the partner's open mark with a turning ring, and only on a seat's own screen", () => {
    // The test screen holds both seats, so no mark on it is the partner's.
    const theirs = rgba(PALETTE.text, 0.8);
    expect(count(drawn("p1", []), theirs)).toBeGreaterThan(0);
    expect(count(drawn("p2", []), theirs)).toBeGreaterThan(0);
    expect(count(drawn("test", []), theirs)).toBe(0);
  });

  it("keeps one verdict a mark, fades it, and forgets it on clear", () => {
    const v = new GripVerdicts();
    v.mark(0, true);
    v.mark(0, false);
    expect(v.at(0)?.good).toBe(false);
    expect(v.at(1)).toBeNull();
    v.update(VERDICT_SECONDS / 2);
    expect(v.at(0)).not.toBeNull();
    v.update(VERDICT_SECONDS);
    expect(v.at(0)).toBeNull();
    v.mark(1, true);
    v.clear();
    expect(v.at(1)).toBeNull();
  });
});
