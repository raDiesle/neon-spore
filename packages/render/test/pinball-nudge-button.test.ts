import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinballRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bandLobes } from "../src/band-lobes.js";
import { computeLayout } from "../src/layout.js";
import { pinLobeOf } from "../src/pinball-button.js";
import { drawNudgeLobe } from "../src/pinball-nudge-button.js";
import { P1_SKIN } from "../src/seat-skin.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **PINBALL's nudge, ◀ and ▶ on both panels** (`pinball-nudge-button.ts`).
 * The owner, 10 October 2026: a press on both sides, there all the time, in
 * the band's own look — lit exactly while a bump would answer, and showing
 * the bumps the pair still has.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
/** The dark ink a lit face is drawn in, as on SET and on SNAKE's turns. */
const LIT_INK = "#1B0630";

function playing(): { world: World; pin: PinballState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * TPB && pinballRound(world)?.phase !== "play"; i++) step(world, []);
  const pin = pinballRound(world);
  if (pin === null || pin.phase !== "play") throw new Error("the round never reached play");
  return { world, pin };
}

function face(world: World): string[] {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawNudgeLobe(
    ctx as unknown as CanvasRenderingContext2D,
    { x: 100, y: 100, r: 40 },
    -1,
    world,
    P1_SKIN,
  );
  return log;
}

const lit = (log: string[]): boolean => log.includes(`set fillStyle=${LIT_INK}`);
const fills = (log: string[]): number => log.filter((e) => e === "fill").length;

describe("the nudge's face", () => {
  it("is dark while the needle sweeps and on the bar, and lit through a flight", () => {
    const { world, pin } = playing();
    pin.shot = "aim";
    expect(lit(face(world))).toBe(false);
    pin.shot = "power";
    expect(lit(face(world))).toBe(false);
    pin.shot = "flight";
    expect(lit(face(world))).toBe(true);
  });

  it("goes dark on a tilted table, with every bump spent", () => {
    const { world, pin } = playing();
    pin.shot = "flight";
    const fresh = fills(face(world));
    pin.tilted = true;
    const log = face(world);
    expect(lit(log)).toBe(false);
    expect(fills(log)).toBe(fresh - CFG.pinballNudges);
  });

  it("empties one dot a bump, out of the count both seats share", () => {
    const { world, pin } = playing();
    pin.shot = "flight";
    const fresh = fills(face(world));
    pin.nudges = 1;
    expect(fills(face(world))).toBe(fresh - 1);
  });
});

describe("the nudge on the band", () => {
  it("stands either side of SET and of FIRE, on both seats", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const set = controlSet("pinball");
    for (const [player, middle] of [
      [1, "latch"],
      [2, "launch"],
    ] as const) {
      const lobes = bandLobes(l, set, player);
      expect(lobes.map((b) => pinLobeOf(b.control.id))).toEqual(["left", middle, "right"]);
      const xs = lobes.map((b) => b.circle.x);
      expect(xs).toEqual([...xs].sort((a, b) => a - b));
    }
  });
});
