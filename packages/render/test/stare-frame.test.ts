import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
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
 * THE STARE's eye — turned away, turning, looking, turning back — on all
 * three screens.
 *
 * The phases are **set** rather than played to, `hive-frame.test.ts`'s
 * arrangement: `sim/test/stare.test.ts` proves the cycle, the roll and the
 * catch, and what this file asks is whether every angle of the picture is
 * one a canvas accepts, and the three things nothing else in the suite could
 * catch: that the seat's **name** is on the other seat's screen and not the
 * watched one's, that the **gaze** is on the watched seat's and not the
 * other's, and that the flash of a catch is a transient the next run does
 * not inherit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the eye in, stepped past beat zero so a `phaseBeat` set in the past is a beat it saw. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function eye(world: World): StareState {
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  return s;
}

/** Looking elsewhere, nobody chosen. */
function away(world: World): StareState {
  const s = eye(world);
  s.phase = "away";
  s.phaseBeat = world.beat - 1;
  s.watching = 0;
  return s;
}

/** Three beats into the turn towards `who`. */
function turning(world: World, who: 1 | 2 = 1): StareState {
  const s = away(world);
  s.phase = "turning";
  s.phaseBeat = world.beat - 3;
  s.watching = who;
  return s;
}

/** The look on `who`, a beat in. */
function looking(world: World, who: 1 | 2 = 1): StareState {
  const s = away(world);
  s.phase = "looking";
  s.phaseBeat = world.beat - 1;
  s.watching = who;
  s.lookBeats = CFG.stareLookBeats;
  return s;
}

/** Turning away again, a beat in. */
function back(world: World): StareState {
  const s = away(world);
  s.phase = "back";
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

/** Three frames, inside a beat, with the eye set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  away(world);
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE STARE's eye", () => {
  it.each(ROLES)("draws the cowled eye at every angle on %s", (role) => {
    const still = frame(role, away);
    expect(still.calls).toBeGreaterThan(100);
    expect(still.text).toContain(PALETTE.rockDark);
    // Turning is another picture than away, looking another than turning,
    // and back another than looking: four angles, none of them the same.
    const turn = frame(role, (w) => turning(w));
    const look = frame(role, (w) => looking(w));
    const off = frame(role, back);
    expect(turn.text).not.toBe(still.text);
    expect(look.text).not.toBe(turn.text);
    expect(off.text).not.toBe(look.text);
  });

  it.each(ROLES)("counts the tell down under the eye on %s", (role) => {
    // Three beats in is another picture than one beat in: a pip has gone out.
    const early = frame(role, (w) => {
      turning(w).phaseBeat = w.beat - 1;
    });
    const late = frame(role, (w) => turning(w));
    expect(late.text).not.toBe(early.text);
  });

  it("names the chosen seat on the other seat's screen and not its own", () => {
    // The word is text; a screen that draws it draws one more fillText than
    // the same eye with nobody chosen.
    const named = (role: ViewRole, who: 1 | 2) =>
      count(frame(role, (w) => turning(w, who)).text, "fillText");
    const bare = (role: ViewRole) => count(frame(role, away).text, "fillText");
    expect(named("p2", 1)).toBeGreaterThan(bare("p2"));
    expect(named("p1", 1)).toBe(bare("p1"));
    expect(named("p1", 2)).toBeGreaterThan(bare("p1"));
    expect(named("p2", 2)).toBe(bare("p2"));
    expect(named("test", 1)).toBeGreaterThan(bare("test"));
    expect(named("test", 2)).toBeGreaterThan(bare("test"));
    // And it says which: the two names are two pictures on the screen told.
    expect(frame("test", (w) => turning(w, 1)).text).not.toBe(
      frame("test", (w) => turning(w, 2)).text,
    );
  });

  it("lays the gaze on the watched seat's field and not the other's", () => {
    // The gaze is a gradient down the field; the screen it falls on draws
    // one, and the screen it does not is the same picture as a look at the
    // other seat but for the word.
    const gaze = (role: ViewRole, who: 1 | 2) =>
      count(frame(role, (w) => looking(w, who)).text, "createLinearGradient");
    expect(gaze("p1", 1)).toBeGreaterThan(gaze("p1", 2));
    expect(gaze("p2", 2)).toBeGreaterThan(gaze("p2", 1));
    expect(gaze("test", 1)).toBe(gaze("test", 2));
    expect(gaze("test", 1)).toBeGreaterThan(gaze("p1", 2));
  });

  it("keeps the flash of a catch as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "stareCaught", player: 1, control: "cannonCol" }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx.boss.stare.flash).toBeGreaterThan(0);
    expect(fx.boss.stare.caught).toBe(1);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it("lights the caught seat's panel and not the other's", () => {
    // The same frames with and without the catch: on the caught seat's screen
    // the panel is one more red rectangle, and on the other's nothing moved.
    const run = (role: ViewRole, caught: boolean) => {
      const world = hung();
      looking(world, 1);
      const log: string[] = [];
      runFrames(world, role, 6, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (caught && tick === 1) {
            w.events.push({ type: "stareCaught", player: 1, control: "cannonCol" });
          }
        },
      });
      return log.join("|");
    };
    // The wash is one rectangle from the band's top to the bottom of the
    // screen; the burst out of the eye is on both screens by design, so the
    // count is of a rectangle starting at the band's top and not of every
    // `fillRect`. (The width is the renderer's own, which is not the layout
    // this file computes, so the top is what identifies it.)
    const wash = (role: ViewRole, caught: boolean) =>
      count(run(role, caught), `fillRect(0, ${computeLayout(VIEWPORT, CFG, role).bandTop}, `);
    expect(wash("p1", true)).toBeGreaterThan(0);
    expect(wash("p1", false)).toBe(0);
    expect(wash("p2", true)).toBe(0);
    expect(count(run("p2", true), PALETTE.red)).toBeGreaterThan(
      count(run("p2", false), PALETTE.red),
    );
  });
});
