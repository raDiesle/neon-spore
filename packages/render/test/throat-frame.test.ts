import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import {
  createWorld,
  step,
  throatAimBox,
  throatBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, computeStage, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { throatAimCircle, throatPumpCircle } from "../src/throat-grip.js";
import { SWALLOWED } from "../src/throat-say.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { opened } from "./throat-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE THROAT's gullet, on both screens.
 *
 * The slack count, the carried mouth, the pump and the receipt are **set**
 * rather than played into, which is `baton-frame.test.ts`' arrangement and for
 * its reason: a stroke pumped and a body pulled into the mouth is several
 * beats of arithmetic that `sim/test/throat*.test.ts` already proves, and what
 * this file asks is whether every branch of the picture is one a canvas
 * accepts. The things nothing else in the suite could catch are that both
 * handles are drawn where the hit test answers, and that the whole gullet
 * reaches both seats — this fight splits the hands, never the eyes.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** Every colour a screen set over a run of frames, as one string. */
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

/** One frame of the world exactly as it stands, nothing stepped. */
function still(world: World, role: ViewRole = "test"): { log: string[]; texts: string[] } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, 1, {
    every: 1,
    onTick: () => {},
    onCanvas: (c) => {
      c.log = log;
      c.texts = [];
    },
  });
  return { log, texts: (ctx.texts ?? []).map((t) => t.text) };
}

/**
 * The layout the handles are measured against: off the **stage**, which is
 * what `Canvas2DRenderer` draws through, and not the viewport.
 */
const STAGE = computeStage(VIEWPORT);
const LAYOUT = computeLayout(
  { width: STAGE.width, height: STAGE.height, dpr: VIEWPORT.dpr },
  CFG,
  "test",
);

/** Whether the log carries an `arc` centred on this handle, within a pixel. */
function dialAt(log: string[], at: { x: number; y: number }): boolean {
  for (const call of log) {
    if (!call.startsWith("arc(")) continue;
    const [x, y] = call.slice(4).split(",").map(Number);
    if (x === undefined || y === undefined) continue;
    if (Math.abs(x - at.x) < 1 && Math.abs(y - at.y) < 1) return true;
  }
  return false;
}

describe("the throat", () => {
  for (const role of ROLES) {
    it(`draws the gullet standing at home for ${role}`, () => {
      const { world } = opened();
      const { calls, text } = drawn(world, role, TPB * 2);
      expect(calls).toBeGreaterThan(500);
      expect(text).toContain(PALETTE.venom);
    });

    it(`draws a worn gullet with its mouth carried off to a corner for ${role}`, () => {
      const { world, t } = opened();
      const box = throatAimBox(CFG);
      t.slack = 2;
      t.aimXMilli = box.minX;
      t.aimYMilli = box.minY;
      t.aimFromXMilli = box.minX;
      t.aimFromYMilli = box.minY;
      expect(drawn(world, role, TPB).calls).toBeGreaterThan(500);
    });

    it(`draws the mouth pumped wide on a sagging tube for ${role}`, () => {
      const { world, t } = opened();
      t.slack = CFG.throatRings - 1;
      t.pumpMilli = 1000;
      t.pumpDir = 1;
      expect(still(world, role).log.length).toBeGreaterThan(200);
    });

    it(`writes the receipt under the mouth for ${role}`, () => {
      const { world, t } = opened();
      t.fedBeat = world.beat;
      expect(still(world, role).texts).toContain(SWALLOWED);
    });
  }

  it("draws the eversion and stops when the boss does", () => {
    const { world, t } = opened();
    t.slack = CFG.throatRings;
    t.phase = "everts";
    t.phaseBeat = world.beat;
    // Through the whole eversion and a beat past it: the sim nulls the boss at
    // the end, so the last frames are of a field with no gullet on it.
    const { calls, text } = drawn(world, "test", (CFG.throatEvertBeats + 2) * TPB);
    expect(calls).toBeGreaterThan(500);
    // The inside, which nothing else in the fight ever draws.
    expect(text).toContain(PALETTE.venomDeep);
    expect(throatBoss(world)).toBeNull();
  });

  it("shows the whole gullet to both seats", () => {
    // This fight splits the hands and not the eyes: the body in the circle is
    // what the colour is called against, and both seats own two colours.
    for (const role of ["p1", "p2"] as const) {
      const { world } = opened();
      expect(drawn(world, role, TPB).text).toContain(PALETTE.venom);
    }
  });

  /**
   * **The two handles** (`throat-grip.ts`): what is asked is that the circle
   * the hit test answers is the one the canvas put down, in the same place —
   * the mouth's wherever it was carried, and the pump's beside the root. The
   * dial is only swept while a handle is held, so each is held.
   */
  it("draws the navigator's handle on the mouth wherever it was carried", () => {
    const { world, t } = opened();
    const box = throatAimBox(CFG);
    t.aimXMilli = box.maxX;
    t.aimYMilli = box.minY + 1500;
    // Held, so the dial sweeps round it: an idle ring breathes and has none.
    t.aimFromXMilli = t.aimXMilli;
    t.aimFromYMilli = t.aimYMilli;
    const { log } = still(world);
    expect(dialAt(log, throatAimCircle(LAYOUT, CFG, t))).toBe(true);
  });

  it("draws the pilot's pump beside the root", () => {
    const { world, t } = opened();
    t.pumpDir = 1;
    const { log } = still(world);
    expect(dialAt(log, throatPumpCircle(LAYOUT, CFG))).toBe(true);
  });

  it("never draws the gullet before its wave installs one", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(throatBoss(world)).toBeNull();
    expect(drawn(world, "p1", TPB).text).not.toContain(PALETTE.venomRim);
  });
});
