import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type InstarState,
  instarBoss,
  instarHeld,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { instarCall } from "../src/instar-call.js";
import type { TextBox } from "./canvas-stub.js";
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
 * **The step's call: who goes when, and how long they have.**
 *
 * The owner asked on 20 September 2026 for the *point in time* the second
 * seat may act to be shown, and for which seat goes first — having read an
 * order into two poses that have none. What is pinned here is that each of
 * the three things the script can actually be in says a different sentence,
 * and that the sentence reaches the glass on both screens.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function acting(world: World, cursor: number): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = world.beat;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}

/** The first step whose marks are all held — the kind with no join at all. */
function held(world: World): number {
  const s = instarBoss(world);
  const i =
    s?.steps.findIndex(
      (st) => st.marks.length >= 2 && st.marks.every((m) => instarHeld(m.gesture)),
    ) ?? -1;
  if (i < 0) throw new Error("the script has no step of two held marks");
  return i;
}

/** The first step whose marks are all counts — the kind that can slip. */
function counted(world: World): number {
  const s = instarBoss(world);
  const i =
    s?.steps.findIndex(
      (st) => st.marks.length >= 2 && st.marks.every((m) => !instarHeld(m.gesture)),
    ) ?? -1;
  if (i < 0) throw new Error("the script has no step of two counted marks");
  return i;
}

describe("the call, read", () => {
  it("says either order where the pose is two pulls, which cannot slip", () => {
    const world = hung();
    const s = acting(world, held(world));
    const call = instarCall(s, CFG, world.beat, 0);
    expect(call?.kind).toBe("EITHER ORDER");
    expect(call?.word).toBe("BOTH, BEFORE IT CLOSES");
  });

  it("names the beats where the pose is counted and nobody has landed", () => {
    const world = hung();
    const s = acting(world, counted(world));
    const call = instarCall(s, CFG, world.beat, 0);
    expect(call?.kind).toBe("FINISH TOGETHER");
    expect(call?.word).toBe(`WITHIN ${CFG.instarTogetherBeats} BEATS`);
  });

  it("calls the seat still out, by name, the moment its partner lands", () => {
    const world = hung();
    const at = counted(world);
    const s = acting(world, at);
    s.doneBeat[0] = world.beat;
    const call = instarCall(s, CFG, world.beat, 0);
    const open = s.steps[at]?.marks[1];
    expect(open?.seat === "p1" || open?.seat === "p2").toBe(true);
    expect(call?.kind).toBe(open?.seat === "p1" ? "P1 NOW" : "P2 NOW");
  });

  it("counts the beats down as the together window closes", () => {
    const world = hung();
    const s = acting(world, counted(world));
    s.doneBeat[0] = world.beat;
    const span = CFG.instarTogetherBeats + 1;
    const said = Array.from(
      { length: span },
      (_, i) => instarCall(s, CFG, world.beat + i, 0)?.word,
    );
    expect(said[0]).toBe(`${span} BEATS LEFT`);
    expect(said[span - 1]).toBe("1 BEAT LEFT");
    // Never up: a number that went the other way would read as time gained.
    for (let i = 1; i < span; i++) {
      const before = Number.parseInt(said[i - 1] ?? "0", 10);
      expect(Number.parseInt(said[i] ?? "0", 10)).toBeLessThan(before);
    }
  });

  it("is silent on a step of one mark, which has nobody to be in time with", () => {
    const world = hung();
    const s = instarBoss(world);
    const single = s?.steps.findIndex((st) => st.marks.length === 1) ?? -1;
    expect(single).toBeGreaterThanOrEqual(0);
    expect(instarCall(acting(world, single), CFG, world.beat, 0)).toBeNull();
  });

  it("is silent through a morph, when there is nothing up to be in time with", () => {
    const world = hung();
    const s = acting(world, counted(world));
    s.phase = "morph";
    expect(instarCall(s, CFG, world.beat, 0)).toBeNull();
  });
});

describe("the call, drawn", () => {
  it.each(ROLES)("stands on the glass, the same sentence, on %s", (role) => {
    const world = hung();
    const at = counted(world);
    const s = acting(world, at);
    s.doneBeat[0] = world.beat;
    const texts: TextBox[] = [];
    runFrames(world, role, 9, {
      every: 3,
      onCanvas: (c) => {
        c.texts = texts;
      },
    });
    const said = texts.map((t) => t.text);
    const open = s.steps[at]?.marks[1];
    expect(said).toContain(open?.seat === "p1" ? "P1 NOW" : "P2 NOW");
    expect(said.some((t) => t.endsWith("BEATS LEFT") || t.endsWith("BEAT LEFT"))).toBe(true);
  });
});
