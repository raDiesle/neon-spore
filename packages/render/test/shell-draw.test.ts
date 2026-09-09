import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  shellIsBare,
  shellPiecesLeft,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { drawnRow, hazed, nearness } from "../src/depth.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { drawShellArmour, plateLightShift } from "../src/shell-draw.js";
import { PLATE_RIM } from "../src/shell-plate.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The pass that draws the plating — see `shell-draw.ts`'s own doc for why it
 * needs no cached state at all. This file proves three things a screenshot
 * cannot: the strict canvas stub accepts every value it is handed in every one
 * of the shell's states, the pass draws while any piece is still on, and it
 * stops the moment the body goes bare, when `drawCreatures` alone is the whole
 * picture.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const COL = 3;

const shell = (col: number, color: "red" | "cyan" = "cyan"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "shell",
  color,
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
function shot(tick: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return [aim(tick, col), fire(tick, color)];
}

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

/** Draw a handful of frames across a spread of `beatPhase`/`time`, so the
 * sway and the depth envelope both get exercised, not only `t = 0`. */
function drawFrames(world: ReturnType<typeof createWorld>): number {
  const { ctx } = stubCanvas();
  for (let i = 0; i < 30; i++) {
    const beatPhase = (i % 10) / 10;
    const time = i * 0.083;
    drawShellArmour(ctx as unknown as CanvasRenderingContext2D, L, world, beatPhase, time);
  }
  return ctx.calls;
}

/** How many times one frame set the plating's grey — twice on an intact
 * shell, one per plate, and the question the bare half's rim is an answer
 * to. `beatPhase` and `time` are pinned so the hazed colour is computable
 * here from the one row the body is on.
 *
 * The **colour** is counted and the alpha is not. A plate and a bared half are
 * the same material and are edged in the same grey, but each is laid down at a
 * strength that follows how much of the key light that half takes — a slab is
 * lit by its own normal (`shell-plate.ts`) — so a test that pinned the whole
 * `rgba(...)` string would be asserting the light angle in the one place that
 * is meant to be about the material. */
function greyStrokes(world: ReturnType<typeof createWorld>): number {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawShellArmour(ctx as unknown as CanvasRenderingContext2D, L, world, 0, 0);
  const body = world.creatures[0];
  if (!body) return log.filter((e) => e.startsWith("set strokeStyle=")).length;
  const grey = rgba(hazed(CFG, PLATE_RIM, nearness(L, drawnRow(body, 0))), 1);
  const prefix = `set strokeStyle=${grey.slice(0, grey.lastIndexOf(",") + 1)}`;
  return log.filter((e) => e.startsWith(prefix)).length;
}

beforeAll(installCanvasGlobals);

describe("the shell's plating", () => {
  it("draws both plates while every piece is still on", () => {
    const { world } = run([shell(COL)], TPB + 1);
    expect(shellPiecesLeft(world.creatures[0]!)).toBe(2);
    expect(drawFrames(world)).toBeGreaterThan(0);
  });

  it("still draws once a piece is off, through the strict canvas stub", () => {
    const { world } = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    const body = world.creatures[0]!;
    expect(shellPiecesLeft(body)).toBe(1);
    expect(drawFrames(world)).toBeGreaterThan(0);
  });

  it("draws less with one plate gone than with both on", () => {
    // The one thing the count of calls can actually say about the picture:
    // a chipped half is *absent*, not redrawn as a wound over the body.
    const intact = run([shell(COL)], TPB + 1);
    const chipped = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    expect(drawFrames(chipped.world)).toBeLessThan(drawFrames(intact.world));
  });

  it("draws the surviving plate for whichever column still has one", () => {
    const left = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    const right = run([shell(COL)], TPB * 4, shot(TPB * 2, COL + 1, "cyan"));
    expect(drawFrames(left.world)).toBeGreaterThan(0);
    expect(drawFrames(right.world)).toBeGreaterThan(0);
  });

  it("cuts the armour to either body it plates, through the same stub", () => {
    // A Shell-Slick and a Shell-Bulb are one kind and two contours
    // (`wornKind`), so both go through the strict canvas rather than only the
    // one the other tests happen to author.
    for (const color of ["red", "cyan"] as const) {
      expect(drawFrames(run([shell(COL, color)], TPB + 1).world)).toBeGreaterThan(0);
    }
  });

  it("rims the bared half in the same grey the surviving plate is rimmed in", () => {
    // The whole of what the chipped shell has to say: one half armoured, one
    // half opened, and both of them still edged in the armour's own grey, so
    // the pair read one body wearing a shell rather than two unrelated things
    // standing in adjacent columns.
    const intact = run([shell(COL)], TPB + 1);
    const chipped = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    expect(shellPiecesLeft(chipped.world.creatures[0]!)).toBe(1);
    expect(greyStrokes(intact.world)).toBe(2);
    expect(greyStrokes(chipped.world)).toBe(2);
  });

  it("takes the grey away with the last plate", () => {
    const inputs = [...shot(TPB * 2, COL, "red"), ...shot(TPB * 3, COL + 1, "red")];
    const { world } = run([shell(COL)], TPB * 5, inputs);
    expect(shellIsBare(world.creatures[0]!)).toBe(true);
    expect(greyStrokes(world)).toBe(0);
  });

  it("stops drawing once the body is bare — it is the whole picture now", () => {
    const inputs = [...shot(TPB * 2, COL, "red"), ...shot(TPB * 3, COL + 1, "red")];
    const { world } = run([shell(COL)], TPB * 5, inputs);
    const body = world.creatures[0]!;
    expect(shellIsBare(body)).toBe(true);
    expect(drawFrames(world)).toBe(0);
  });

  it("draws nothing at all when there is no shelled body on the field", () => {
    const { world } = run([], 1);
    expect(drawFrames(world)).toBe(0);
  });
});

describe("the body's own light on a plated body", () => {
  // `living-draw.ts` finishes every body with a halo and a motion trail in its
  // own colour, and until 9 September 2026 a shell got both through its
  // armour — a red plume rising off a plate that is supposed to be opaque and
  // dead. What replaced it is one number per state, and these are the three.
  const R = 20;

  it("shows none of it while both plates are on", () => {
    const { world } = run([shell(COL)], TPB + 1);
    expect(shellPiecesLeft(world.creatures[0]!)).toBe(2);
    expect(plateLightShift(world.creatures[0]!, R)).toBeNull();
  });

  it("pushes it onto whichever half has been opened", () => {
    const left = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    const right = run([shell(COL)], TPB * 4, shot(TPB * 2, COL + 1, "red"));
    // Piece 0 is the left column, so an open left half puts the light left of
    // centre and an open right half puts it right (`pieceAngleSpan`).
    expect(plateLightShift(left.world.creatures[0]!, R)).toBeLessThan(0);
    expect(plateLightShift(right.world.creatures[0]!, R)).toBeGreaterThan(0);
  });

  it("lets it back to the middle once the last plate is off", () => {
    const inputs = [...shot(TPB * 2, COL, "red"), ...shot(TPB * 3, COL + 1, "red")];
    const { world } = run([shell(COL)], TPB * 5, inputs);
    expect(shellIsBare(world.creatures[0]!)).toBe(true);
    expect(plateLightShift(world.creatures[0]!, R)).toBe(0);
  });

  it("leaves every other kind exactly where it was", () => {
    const { world } = run([{ beat: 0, col: COL, kind: "slick", color: "red" }], TPB + 1);
    expect(plateLightShift(world.creatures[0]!, R)).toBe(0);
  });
});
