import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, NETTLE_SCRIPT } from "@neon-spore/content";
import {
  createWorld,
  type NettleState,
  NO_BEARING,
  NOT_DONE,
  sceneBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
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
 * THE NETTLE's body in every pose and phase, its marks up, half answered and
 * done, and its end, on all three screens — `instar-frame.test.ts`'s own
 * arrangement, states set rather than played to.
 *
 * **Unlike THE INSTAR, there is no strike and no transient to prove** — its
 * marks stand at the script's own places, not on a part of the body, and
 * nothing here outlives a frame (`nettle-draw.ts`). That is lane three's own
 * later work.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the body in, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("nettle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): NettleState {
  const s = sceneBoss(world);
  if (s === null || s.kind !== "nettle") throw new Error("the nettle wave hung no body");
  return s;
}

/** Step `cursor` with its marks up, the window just opened, nothing answered —
 * THE SLOW open over it, as `sim/instar-step.ts` opens it: the only state a
 * mark is drawn in (`instar-marks.ts` `instarMarksUp`). */
function acting(world: World, cursor = 0): NettleState {
  const s = body(world);
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = world.beat;
  world.slowFromBeat = world.beat;
  world.slowToBeat = world.beat + (s.steps[cursor]?.windowBeats ?? 1);
  world.slowAsks = true;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}

/** Step `cursor` halfway through its morph. */
function morphing(world: World, cursor = 0): NettleState {
  const s = acting(world, cursor);
  s.phase = "morph";
  s.phaseBeat = world.beat - Math.floor((s.steps[cursor]?.morphBeats ?? 2) / 2);
  return s;
}

/** The first step's first mark half pulled under the pilot's thumb. */
function pulled(world: World): NettleState {
  const s = acting(world, 0);
  const need = s.steps[0]?.marks[0]?.need ?? 2;
  s.progress[0] = Math.floor(need / 2);
  s.thumbs[0] = 1;
  return s;
}

/** The first step's first mark done, its partner not. */
function halfDone(world: World): NettleState {
  const s = acting(world, 0);
  s.progress[0] = s.steps[0]?.marks[0]?.need ?? 1;
  s.doneBeat[0] = world.beat;
  return s;
}

/** The last step landed a beat ago: the body is down. */
function down(world: World): NettleState {
  const s = acting(world, 0);
  s.cursor = s.steps.length;
  s.phase = "down";
  s.phaseBeat = world.beat - 1;
  s.progress = [];
  s.doneBeat = [];
  s.ref = [];
  s.thumbs = [];
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the body set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

/** The bell's own fill: a plain hex, its opacity carried by `globalAlpha`
 * rather than baked in, so counting it (present while `fade > 0`, absent once
 * `drawNettle` returns early) is the same test THE INSTAR's `PLATE` runs. */
const ROCK = PALETTE.rockDark;

describe("THE NETTLE's body", () => {
  const STEPS = NETTLE_SCRIPT.map((_, i) => i);

  it.each(ROLES)("draws every pose mid-morph and acting on %s", (role) => {
    for (const cursor of STEPS) {
      const morph = frame(role, (w) => morphing(w, cursor));
      const act = frame(role, (w) => acting(w, cursor));
      expect(morph.calls).toBeGreaterThan(100);
      expect(count(morph.text, ROCK)).toBeGreaterThan(0);
      expect(count(act.text, ROCK)).toBeGreaterThan(0);
      expect(morph.text).not.toBe(act.text);
    }
  });

  it.each(ROLES)("puts the marks up only while the window is open, on %s", (role) => {
    const act = frame(role, (w) => acting(w, 0));
    const morph = frame(role, (w) => {
      const s = morphing(w, 0);
      // Early in the morph, before the anticipation glows up.
      s.phaseBeat = w.beat;
    });
    const gone = frame(role, (w) => {
      const s = acting(w, 0);
      s.phase = "land";
    });
    expect(count(act.text, PALETTE.red)).toBeGreaterThan(count(morph.text, PALETTE.red));
    expect(count(act.text, PALETTE.red)).toBeGreaterThan(count(gone.text, PALETTE.red));
    expect(count(morph.text, PALETTE.red)).toBe(count(gone.text, PALETTE.red));
  });

  it("draws the same body on both screens and a different word over each mark", () => {
    // Both screens see the same bell; the split is whose thumb each mark
    // wants, so the two pictures are compared by what the marks are painted
    // in, not the body — a step that asks one seat for more (or, for the
    // panel gestures, both) is brighter on that seat's screen.
    for (const cursor of STEPS) {
      const at = (role: ViewRole) => frame(role, (w) => acting(w, cursor));
      const marks = NETTLE_SCRIPT[cursor]?.marks ?? [];
      const ask = (seat: string) => marks.filter((m) => m.seat === seat).length;
      const bright = (role: ViewRole) => count(at(role).text, PALETTE.text);
      expect(count(at("p1").text, ROCK)).toBe(count(at("p2").text, ROCK));
      expect(Math.sign(bright("p1") - bright("p2"))).toBe(Math.sign(ask("p1") - ask("p2")));
      if (marks.some((m) => m.seat === "both")) continue;
      // The test screen holds both seats, so both words are the gesture's, bright.
      expect(count(at("test").text, PALETTE.text)).toBeGreaterThan(
        count(at("p1").text, PALETTE.text),
      );
    }
  });

  it.each(ROLES)("fills a mark's arc under a thumb and dots it when done, on %s", (role) => {
    const bare = frame(role, (w) => acting(w, 0));
    const half = frame(role, pulled);
    const done = frame(role, halfDone);
    expect(half.text).not.toBe(bare.text);
    expect(count(half.text, PALETTE.redRim)).toBeGreaterThan(count(bare.text, PALETTE.redRim));
    expect(done.text).not.toBe(bare.text);
    expect(done.text).not.toBe(half.text);
  });

  it.each(ROLES)("sags the body and fades it once the last step lands, on %s", (role) => {
    // The bell's fillStyle is a plain hex, not one THE INSTAR bakes an
    // opacity into — its fade rides `globalAlpha` instead, set immediately
    // before `drawBell` sets the fillStyle and put back to 1 straight after
    // (`nettle-body.ts`), so that adjacency is what picks the bell's own
    // alpha out from every other glow's.
    const alphas = (text: string): number[] =>
      Array.from(
        text.matchAll(new RegExp(`set globalAlpha=([\\d.]+)\\|set fillStyle=${ROCK}`, "g")),
      ).map((m) => Number(m[1]));
    const going = frame(role, down);
    const stood = frame(role, (w) => acting(w, 0));
    expect(Math.min(...alphas(going.text))).toBeLessThan(Math.min(...alphas(stood.text)));
    expect(count(going.text, PALETTE.red)).toBeLessThan(count(stood.text, PALETTE.red));
    const gone = frame(role, (w) => {
      down(w).phaseBeat = w.beat - CFG.instarOutBeats - 1;
    });
    expect(count(gone.text, ROCK)).toBe(0);
  });
});
