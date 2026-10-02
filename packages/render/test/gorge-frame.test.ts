import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, GORGE_LEVELS } from "@neon-spore/content";
import {
  createWorld,
  type GorgeState,
  gorgeBoss,
  gorgeOwed,
  gorgeSated,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { TextBox } from "./canvas-stub.js";
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
 * THE GORGE's sack, on both screens.
 *
 * The bubbles' states are **set** rather than fed: `sim/test/gorge.test.ts`
 * proves the swallow and the spit, and what this file asks is whether every
 * branch of the picture is one a canvas accepts — a bubble empty, filling,
 * sated, wanting both colours, round a ring, the sack gone — and the two
 * things nothing else in the suite could catch: that the counts are on the
 * pilot's screen and the colours on the navigator's and neither on the
 * other, and that the beads leaving at the end are a transient the next run
 * does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** The sack on the authored levels from `from` on, a beat in. */
function opened(from = 0): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  if (from === 0)
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  else startWave(world, index, [], [], { kind: "gorge", levels: GORGE_LEVELS.slice(from) });
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function sack(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no sack");
  return g;
}

/** Every bubble state at once: the first filling, the second sated, the rest empty. */
function busy(world: World): GorgeState {
  const g = sack(world);
  const filling = g.intakes[0];
  const full = g.intakes[1];
  if (filling === undefined || full === undefined) throw new Error("the sack is short of bubbles");
  filling.gotRed = Math.min(1, filling.needRed);
  filling.gotCyan = filling.needRed === 0 ? 1 : 0;
  full.gotRed = full.needRed;
  full.gotCyan = full.needCyan;
  return g;
}

/** The numbers written on a screen. */
function numbers(world: World, role: ViewRole): string[] {
  return drawn(world, role, 3)
    .texts.filter((t) => /^[0-9]+$/.test(t.text))
    .map((t) => t.text);
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
): { calls: number; text: string; texts: TextBox[] } {
  const log: string[] = [];
  const texts: TextBox[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
      c.texts = texts;
    },
  });
  return { calls: ctx.calls, text: log.join("|"), texts };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

describe("THE GORGE's sack", () => {
  it.each(ROLES)("draws the sack and every state of a bubble, on %s", (role) => {
    for (const from of [0, 2, 3]) {
      const world = opened(from);
      busy(world);
      const frame = drawn(world, role, 2 * TPB);
      expect(frame.calls).toBeGreaterThan(500);
      // The skin, and the beads in the colour they went in as.
      expect(frame.text).toContain(PALETTE.dim);
      const rims = count(frame.text, PALETTE.redRim) + count(frame.text, PALETTE.cyanRim);
      expect(rims).toBeGreaterThan(0);
    }
  });

  it("writes the pilot a count under every bubble still wanting, and the navigator none", () => {
    const pilot = opened();
    const g = busy(pilot);
    const wanting = g.intakes.filter((k) => !gorgeSated(k));
    const counts = wanting.map((k) => String(gorgeOwed(k))).sort();
    expect(numbers(pilot, "p1").sort()).toEqual(counts);
    const alone = opened();
    busy(alone);
    expect(numbers(alone, "test").sort()).toEqual(counts);
    const navigator = opened();
    busy(navigator);
    expect(numbers(navigator, "p2")).toEqual([]);
  });

  it("writes the pilot the order too, on an ordered level", () => {
    const world = opened(1);
    const g = busy(world);
    const wanting = g.intakes.filter((k) => !gorgeSated(k)).length;
    expect(numbers(world, "p1").length).toBe(wanting * 2);
    expect(numbers(world, "p1")).toContain("1");
    const navigator = opened(1);
    busy(navigator);
    expect(numbers(navigator, "p2")).toEqual([]);
  });

  it("colours the floors on the navigator's screen, and not the pilot's", () => {
    // Nothing fed, so no bead carries a colour: what is left is the floors.
    const p2 = drawn(opened(), "p2", 3).text;
    const p1 = drawn(opened(), "p1", 3).text;
    const lit = (t: string) => count(t, PALETTE.red) + count(t, PALETTE.cyan);
    expect(lit(p2)).toBeGreaterThan(lit(p1));
  });

  it("draws the skin alone once the last level is sated, and the beads leaving as a transient", () => {
    const world = opened();
    const g = busy(world);
    g.outBeat = world.beat;
    const gone = drawn(world, "p1", 3).text;
    expect(gone).toContain(PALETTE.rock);
    expect(numbers(world, "p1")).toEqual([]);

    const fx = new Effects();
    fx.ingest([{ type: "gorgeOut", row: CFG.gorgeRow, col: 5, beads: 50 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
