import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GorgeState,
  gorgeBoss,
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
 * The lobes' states are **set** rather than fed: `sim/test/gorge.test.ts` proves the swallow and the pierce,
 * and what this file asks is whether every branch of the picture is one a
 * canvas accepts — a lobe filling, full, ruptured, the mouth, the sack gone —
 * and the two things nothing else in the suite could catch: that the tally is
 * on the pilot's screen and the navigator's ring on hers and neither on the
 * other, and that the beads leaving at the end are a transient the next run
 * does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function sack(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no sack");
  return g;
}

/** Every lobe state at once: two filling, one full, one ruptured, the mouth. */
function busy(world: World): GorgeState {
  const g = sack(world);
  const set = (i: number, beads: number, color: "red" | "cyan" | null, fullBeat = -1) => {
    const k = g.intakes[i];
    if (k === undefined) throw new Error(`no intake ${i}`);
    k.beads = beads;
    k.color = color;
    k.fullBeat = fullBeat;
  };
  set(0, 2, "red");
  set(1, 3, "cyan");
  set(2, CFG.gorgeFullBeads, "red", world.beat);
  set(3, 0, null);
  const torn = g.intakes[3];
  if (torn) torn.ruptured = true;
  set(5, 9, "cyan");
  g.mouth = 5;
  g.ruptures = 1;
  return g;
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
  it.each(ROLES)("draws the sack and every state of a lobe, on %s", (role) => {
    const world = opened();
    busy(world);
    const frame = drawn(world, role, 2 * TPB);
    expect(frame.calls).toBeGreaterThan(500);
    // The sack's skin, the beads in both colours, the ruptured lobe's grey and
    // the mouth's fire — each names its colour once at least.
    expect(frame.text).toContain(PALETTE.dim);
    expect(frame.text).toContain(PALETTE.redRim);
    expect(frame.text).toContain(PALETTE.cyanRim);
    expect(frame.text).toContain(PALETTE.rockDark);
    expect(frame.text).toContain(PALETTE.emberRim);
  });

  it("writes the pilot's tally under every lobe that can still hold, and not the navigator's", () => {
    const pilot = opened();
    const g = busy(pilot);
    const standing = g.intakes.filter((k) => !k.ruptured).length;
    const texts = drawn(pilot, "p1", 3).texts.filter((t) => /^\d+$/.test(t.text));
    expect(texts.length).toBe(standing);
    expect(texts.map((t) => t.text)).toContain("3");
    const alone = opened();
    busy(alone);
    expect(drawn(alone, "test", 3).texts.filter((t) => /^\d+$/.test(t.text)).length).toBe(standing);
    const navigator = opened();
    busy(navigator);
    expect(drawn(navigator, "p2", 3).texts.filter((t) => /^\d+$/.test(t.text)).length).toBe(0);
  });

  it("rings the navigator's nearest lobe in its colour, and not the pilot's", () => {
    // With the full lobe and the mouth set aside, the nearest is the cyan
    // three; its ring is the one cyan rim on a screen with no cyan beads full.
    const world = opened();
    const g = busy(world);
    const full = g.intakes[2];
    if (full) full.beads = 0;
    if (full) full.color = null;
    if (full) full.fullBeat = -1;
    const mouth = g.intakes[5];
    if (mouth) mouth.color = "red";
    const p2 = count(drawn(world, "p2", 3).text, PALETTE.cyanRim);
    const other = opened();
    const h = busy(other);
    for (const i of [2, 5]) {
      const k = h.intakes[i];
      if (k) {
        k.beads = i === 2 ? 0 : k.beads;
        k.color = i === 2 ? null : "red";
        k.fullBeat = -1;
      }
    }
    const p1 = count(drawn(other, "p1", 3).text, PALETTE.cyanRim);
    expect(p2).toBeGreaterThan(p1);
  });

  it("draws the skin alone once the beam has ended it, and the beads leaving as a transient", () => {
    const world = opened();
    const g = busy(world);
    g.outBeat = world.beat;
    const gone = drawn(world, "p1", 3).text;
    expect(gone).toContain(PALETTE.rock);
    expect(gone).not.toContain(PALETTE.emberRim);

    const fx = new Effects();
    fx.ingest([{ type: "gorgeOut", col: 5, beads: 50 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
