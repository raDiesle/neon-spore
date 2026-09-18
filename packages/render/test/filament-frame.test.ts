import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FilamentState,
  filamentBoss,
  NO_GRAB,
  NOT_DRAWN,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FILAMENT's body, its armed filament, the trace with the two thumbs
 * on it, the pull and its end, on all three screens.
 *
 * The states are **set** rather than played to, `instar-frame.test.ts`'s
 * arrangement: `sim/test/filament.test.ts` proves the drawing, the
 * following and the pull, and what this file asks is whether every branch
 * of the picture is one a canvas accepts — armed, traced, pulled, down, out
 * — and the two things nothing else could catch: that the split is **one
 * line, one distance each** — the pilot's screen the same whatever the
 * tail does, the navigator's the same whatever the head does — and that the
 * whip is a transient the next run does not inherit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the body in, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("filament");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): FilamentState {
  const s = filamentBoss(world);
  if (s === null) throw new Error("the filament wave hung no body");
  return s;
}

/** Filament `cursor` armed, the arm just begun. */
function armed(world: World, cursor = 0): FilamentState {
  const s = body(world);
  s.cursor = cursor;
  s.phase = "arm";
  s.phaseBeat = world.beat;
  s.head = 0;
  s.tail = 0;
  s.headBeat = NOT_DRAWN;
  s.grab = [NO_GRAB, NO_GRAB];
  return s;
}

/** The trace on filament `cursor`, the head at `head` and the tail at `tail`, both thumbs on. */
function tracing(world: World, head: number, tail: number, cursor = 0): FilamentState {
  const s = armed(world, cursor);
  s.phase = "trace";
  s.head = head;
  s.tail = tail;
  s.headBeat = world.beat - 1;
  s.grab = [head, tail];
  return s;
}

/** The first filament traced end to end and a beat into its pull. */
function pulled(world: World): FilamentState {
  const s = body(world);
  const last = (s.tiles[0]?.length ?? 1) - 1;
  const p = tracing(world, last, last);
  p.phase = "pull";
  p.phaseBeat = world.beat - 1;
  return p;
}

/** The seventh filament pulled a beat ago: the body is down. */
function down(world: World): FilamentState {
  const s = armed(world, 0);
  s.cursor = s.tiles.length;
  s.phase = "down";
  s.phaseBeat = world.beat - 1;
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

/** The body's own fill: the deep sheen at nine tenths, THE INSTAR's plate. */
const BODY = rgba(PALETTE.sheenDeep, 0.9);

describe("THE FILAMENT's body", () => {
  it.each(ROLES)("hangs the body and pulses the armed free end, on %s", (role) => {
    const arm = frame(role, (w) => armed(w, 0));
    expect(arm.calls).toBeGreaterThan(100);
    expect(count(arm.text, BODY)).toBeGreaterThan(0);
    expect(count(arm.text, PALETTE.wispRim)).toBeGreaterThan(0);
    // No thumb is asked for yet: no ring, no word.
    expect(count(arm.text, PALETTE.red)).toBe(0);
  });

  it("shows the path ahead to the pilot alone and the ring behind to the navigator alone", () => {
    // The stub logs where a word was set down, not the word: one ring's word
    // a frame on each seat's screen over the armed frames' text, two on the test screen.
    const words = (role: ViewRole) =>
      count(frame(role, (w) => tracing(w, 3, 1)).text, "fillText(") -
      count(frame(role, (w) => armed(w, 0)).text, "fillText(");
    expect(words("p1")).toBeGreaterThan(0);
    expect(words("p2")).toBe(words("p1"));
    expect(words("test")).toBe(words("p1") * 2);
    const p1 = frame("p1", (w) => tracing(w, 3, 1));
    const p2 = frame("p2", (w) => tracing(w, 3, 1));
    const test = frame("test", (w) => tracing(w, 3, 1));
    // The unlit path is dashed in the dim, and only where the pilot looks.
    expect(count(p1.text, PALETTE.dim)).toBeGreaterThan(count(p2.text, PALETTE.dim));
    expect(count(test.text, PALETTE.red)).toBeGreaterThan(count(p1.text, PALETTE.red));
    expect(count(test.text, PALETTE.red)).toBeGreaterThan(count(p2.text, PALETTE.red));
  });

  it("draws the pilot's screen the same whatever the tail does, and the navigator's whatever the head does", () => {
    // He has the distance ahead and nothing of her: the tail moving changes
    // nothing on his screen. She has the distance behind and nothing of him:
    // the head moving on changes nothing on hers, past the one tile she may take.
    expect(frame("p1", (w) => tracing(w, 4, 1)).text).toBe(
      frame("p1", (w) => tracing(w, 4, 3)).text,
    );
    expect(frame("p2", (w) => tracing(w, 3, 1)).text).toBe(
      frame("p2", (w) => tracing(w, 4, 1)).text,
    );
    // And each screen does change with its own thumb.
    expect(frame("p1", (w) => tracing(w, 2, 1)).text).not.toBe(
      frame("p1", (w) => tracing(w, 4, 1)).text,
    );
    expect(frame("p2", (w) => tracing(w, 4, 1)).text).not.toBe(
      frame("p2", (w) => tracing(w, 4, 3)).text,
    );
    // The test screen holds both, so it changes with either.
    expect(frame("test", (w) => tracing(w, 4, 1)).text).not.toBe(
      frame("test", (w) => tracing(w, 4, 3)).text,
    );
  });

  it.each(ROLES)("lights the ring under a thumb that has taken hold, on %s", (role) => {
    const held = frame(role, (w) => tracing(w, 3, 1));
    const bare = frame(role, (w) => {
      tracing(w, 3, 1).grab = [NO_GRAB, NO_GRAB];
    });
    expect(held.text).not.toBe(bare.text);
    expect(count(held.text, PALETTE.redRim)).toBeGreaterThan(count(bare.text, PALETTE.redRim));
  });

  it.each(ROLES)("slides a pulled filament up and narrows the body, on %s", (role) => {
    const pull = frame(role, pulled);
    const trace = frame(role, (w) => tracing(w, 3, 1));
    expect(pull.text).not.toBe(trace.text);
    expect(count(pull.text, PALETTE.red)).toBe(0);
    expect(count(pull.text, BODY)).toBeGreaterThan(0);
    // Every filament in the body but the last: a strand fewer to draw.
    const late = frame(role, (w) => tracing(w, 2, 1, 6));
    expect(count(late.text, PALETTE.wisp)).toBeLessThan(count(trace.text, PALETTE.wisp));
  });

  it.each(ROLES)("fades the body once the last filament is out, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, (w) => armed(w, 0));
    expect(count(going.text, BODY)).toBeLessThan(count(stood.text, BODY));
    expect(count(going.text, PALETTE.wispRim)).toBe(0);
    const gone = frame(role, (w) => {
      down(w).phaseBeat = w.beat - CFG.filamentOutBeats - 1;
    });
    expect(count(gone.text, BODY)).toBe(0);
  });

  it("keeps the whip, the dark and the jolt as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [
        { type: "filamentSnap", col: 5 },
        { type: "filamentDark", col: 5 },
        { type: "filamentPulled", index: 0, col: 5 },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.filament.whip).not.toBe(0);
    expect(fx.boss.filament.dark).toBeGreaterThan(0);
    expect(fx.boss.filament.jolt).toBeGreaterThan(0);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
