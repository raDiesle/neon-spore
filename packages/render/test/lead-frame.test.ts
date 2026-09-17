import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LeadState,
  leadBoss,
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
 * THE LEAD's ridge, its stalk, its flights and its end, on all three screens.
 *
 * The states are **set** rather than played to, `surge-frame.test.ts`'s
 * arrangement: `sim/test/lead.test.ts` proves the pace, the judgment, the
 * still and the pass, and what this file asks is whether every branch of
 * the picture is one a canvas accepts — pacing, leaning, a shot in the air,
 * still, passing, down, out — and the two things nothing else in the suite
 * could catch: that the **column** is on the navigator's screen and not the
 * pilot's, that the **lean** is on the pilot's and not the navigator's; and
 * that the lean's spring is a transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/**
 * A world with the body in and pacing, stepped enough beats that every
 * `*Beat` field an arrangement sets in the past is still a beat the world has
 * seen — a `downBeat` before beat zero would read as a body that stands.
 */
function pacing(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("lead");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.leadOutBeats + 2); i++) step(world, []);
  return world;
}

function body(world: World): LeadState {
  const s = leadBoss(world);
  if (s === null) throw new Error("the lead wave paced no body");
  return s;
}

/** Stopped dead on its last segment. */
function still(world: World): LeadState {
  const s = body(world);
  s.segments = 1;
  s.lean = 0;
  s.stillBeat = world.beat;
  return s;
}

/** On the last pass, lunging right. */
function passing(world: World): LeadState {
  const s = body(world);
  s.segments = 1;
  s.dir = 1;
  s.lean = 1;
  s.stillBeat = world.beat - CFG.leadStillBeats - 1;
  s.passBeat = world.beat - 1;
  return s;
}

/** The beam took the last segment a beat ago. */
function down(world: World): LeadState {
  const s = passing(world);
  s.segments = 0;
  s.downBeat = world.beat - 1;
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

/** Three frames, a beat short of the next pace, with the body set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = pacing();
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE LEAD's stalk", () => {
  it.each(ROLES)("draws the ridge and the stalk on %s", (role) => {
    const f = frame(role, () => {});
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).toContain(PALETTE.rock);
    expect(f.text).toContain(PALETTE.hullRim);
  });

  it("puts the column on the navigator's screen and not the pilot's", () => {
    // The lock is in the shield's rim and stands on the body's column, and
    // the mound under the stalk is the hull's violet; the pilot's screen has
    // neither, and a body moved from one wall to the other is the same
    // picture on it.
    const left = (role: ViewRole) =>
      frame(role, (w) => {
        body(w).col = 1;
      });
    const right = (role: ViewRole) =>
      frame(role, (w) => {
        body(w).col = CFG.cols - 2;
      });
    expect(count(left("p2").text, PALETTE.shieldRim)).toBeGreaterThan(
      count(left("p1").text, PALETTE.shieldRim),
    );
    expect(count(left("test").text, PALETTE.shieldRim)).toBeGreaterThan(
      count(left("p1").text, PALETTE.shieldRim),
    );
    expect(left("p1").text).toBe(right("p1").text);
    expect(left("p2").text).not.toBe(right("p2").text);
    expect(left("test").text).not.toBe(right("test").text);
  });

  it("puts the lean on the pilot's screen and not the navigator's", () => {
    // The stalk asked to lean left and asked to lean right is two pictures
    // where the lean is shown, and one where it is not.
    const lean = (role: ViewRole, way: -1 | 1) =>
      frame(role, (w) => {
        const s = body(w);
        s.lean = way;
        s.dir = way;
      }).text;
    expect(lean("p1", -1)).not.toBe(lean("p1", 1));
    expect(lean("test", -1)).not.toBe(lean("test", 1));
    expect(lean("p2", -1)).toBe(lean("p2", 1));
  });

  it.each(ROLES)("hangs a shot in the air over its column on %s", (role) => {
    const bare = frame(role, () => {});
    const flying = frame(role, (w) => {
      body(w).flights.push({ col: 3, dueBeat: w.beat + CFG.leadFlightBeats });
    });
    expect(count(flying.text, PALETTE.text)).toBeGreaterThan(count(bare.text, PALETTE.text));
  });

  it.each(ROLES)("greys the stalk and stands it dead upright while still, on %s", (role) => {
    const f = frame(role, still);
    expect(f.text).toContain(PALETTE.dim);
    expect(f.text).not.toBe(frame(role, () => {}).text);
  });

  it.each(ROLES)("lays the stalk over on the last pass, on %s", (role) => {
    expect(frame(role, passing).text).not.toBe(frame(role, still).text);
  });

  it.each(ROLES)("takes the stalk away when the beam has it, and fades out, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, passing);
    expect(count(going.text, PALETTE.hullRim)).toBeLessThan(count(stood.text, PALETTE.hullRim));
    // Fading, the ridge's rock is an `rgba` and no longer the hex; gone, the
    // ridge's dark fill — the one thing of it every screen draws — is not laid.
    expect(count(going.text, PALETTE.rock)).toBeLessThan(count(stood.text, PALETTE.rock));
    const ridge = rgba(PALETTE.rockDark, 0.85).slice(0, -5);
    expect(count(going.text, ridge)).toBeGreaterThan(0);
    const gone = frame(role, (w) => {
      down(w).downBeat = w.beat - CFG.leadOutBeats - 1;
    });
    expect(count(gone.text, ridge)).toBe(0);
  });

  it("keeps the lean's spring as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.boss.lead.aim(0.5);
    fx.ingest([{ type: "leadReverse", col: 5, dir: 1 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
